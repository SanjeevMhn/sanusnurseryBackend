
const knex = require('../config/db/knex');
const cloudinary = require('../config/cloudinary/cloudinary');
require('dotenv').config();

const getAllProducts = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const pageSize = parseInt(req.query.pageSize) || 6;

        const offset = (page - 1) * pageSize;
        const limit = pageSize;

        // const products = await knex.select('*').from('products').limit(limit).offset(offset);
        const products = await knex.raw(`select 
                                            pd.prod_id, 
                                            pd.prod_name, 
                                            pd.prod_price, 
                                            pim.image_url as prod_img, 
                                            pd."prod_inStock", 
                                            pc.prod_cat_name as prod_category 
                                        from products pd 
                                        inner join product_categories pc on pd.prod_category = pc.prod_cat_id 
                                        inner join product_image_details pim on pd.prod_id = pim.product_id 
                                        order by pd.prod_name asc limit ? offset ?`, [limit, offset]);
        const totalCount = await knex.raw('select count(*) from products');
        res.status(200).json({
            currentPage: page,
            totalPages: Math.ceil(totalCount.rows[0].count / pageSize),
            totalItems: totalCount.rows[0].count,
            products: products.rows
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'An error occured while getting product data' });
    }
}

const getProductsByCategory = async (req, res) => {
    try {

        const page = parseInt(req.query.page) || 1;
        const pageSize = parseInt(req.query.pageSize) || 6;
        const offset = (page - 1) * pageSize;
        const limit = pageSize;


        const category = req.params.category;

        const products = await knex.raw(`select 
                                            pd.prod_id,
                                            pd.prod_name, 
                                            pd.prod_price, 
                                            pim.image_url as prod_img, 
                                            pd."prod_inStock", 
                                            pc.prod_cat_name as prod_category 
                                            from products pd 
                                            inner join product_categories pc on pd.prod_category = pc.prod_cat_id 
                                            inner join product_image_details pim on pd.prod_id = pim.product_id 
                                            where pc.prod_cat_name = ? limit ? offset ?`, [category, limit, offset])
            const totalCount = await knex.raw('select count(*) from products pd join product_categories pc on pd.prod_category = pc.prod_cat_id where pc.prod_cat_name = ?', [category]);
            res.status(200).json({
                currentPage: page,
                totalPages: Math.ceil(totalCount.rows[0].count / pageSize),
                totalItems: totalCount.rows[0].count,
                products: products.rows

            });
            return;




    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'An error occured while retrieving product data' });
    }
}

const getRelatedProducts = async (req, res) => {
    try {

        const page = parseInt(req.query.page) || 1;
        const excludeId = parseInt(req.query.prod_id) || null;
        const pageSize = parseInt(req.query.pageSize) || 6;
        const offset = (page - 1) * pageSize;
        const limit = pageSize;

        const category = req.params.category;
        const products = await knex.raw(`select 
                                            pd.prod_id,
                                            pd.prod_name, 
                                            pd.prod_price, 
                                            pim.image_url as prod_img, 
                                            pd."prod_inStock", 
                                            pc.prod_cat_name 
                                        from products pd 
                                        inner join product_categories pc on pd.prod_category = pc.prod_cat_id
                                        inner join product_image_details pim on pd.prod_id = pim.product_id 
                                        where pc.prod_cat_name = ? and pd.prod_id <> ? limit ? offset ?`, [category, excludeId, limit, offset])
        const totalCount = await knex.raw('select count(*) from products pd join product_categories pc on pd.prod_category = pc.prod_cat_id where pc.prod_cat_name = ? and pd.prod_id <> ?', [category, excludeId]);

        res.status(200).json({
            currentPage: page,
            totalPages: Math.ceil(totalCount.rows[0].count / pageSize),
            totalItems: totalCount.rows[0].count,
            products: products.rows
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'An error occured while retriving related products data' });
    }
}

const getProductById = async (req, res) => {
    try {
        const product = await knex.raw(`select 
                                            pd.prod_id,
                                            pd.prod_name,
                                            pd.prod_category,
                                            pd.prod_price,
                                            pim.image_url as prod_img, 
                                            pd."prod_inStock" 
                                        from products pd 
                                        inner join product_image_details pim on pd.prod_id = pim.product_id 
                                        where pd.prod_id = ?`, [req.params.id]);
        res.status(200).json({ product: product.rows });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'An error occured while retrieving product data' })
    }
}

const getProductCategories = async (req, res) => {
    try {
        const productCategories = await knex.select('prod_cat_id', 'prod_cat_name').from('product_categories');
        res.status(200).json({ categories: productCategories })
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'An error occured while getting product categories' });
    }
}

const searchProductsByName = async (req, res) => {
    try {
        const productName = req.query.prod_name;
        const products = await knex.raw(`select 
                                            pd.prod_id,
                                            pd.prod_name,
                                            pd.prod_category,
                                            pd.prod_price,
                                            pim.image_url as prod_img, 
                                            pd."prod_inStock" 
                                        from products pd
                                        inner join product_image_details pim on pd.prod_id = pim.product_id     
                                        where pd.prod_name ilike ?`, [`%${productName}%`]);
        res.status(200).json({ products: products.rows });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'An error occured while getting product data' });
    }
}

const addProduct = async (req, res) => {
    try {
        const { prod_name, prod_category, prod_price, prod_inStock } = req.body;
        if (!req.file) {
            return res.status(400).json({ message: "No image found" });
        }

        const num_prod_category = Number(prod_category);
        const num_prod_price = Number(prod_price);
        const bool_prod_inStock = Boolean(prod_inStock);

        const imageUpload = await cloudinary.uploader.upload(req.file.path);
        const image_url = imageUpload.secure_url;
        const image_public_id = imageUpload.public_id;
        const image_signature = imageUpload.signature;

        let insertObj = {
            prod_name: prod_name,
            prod_category: num_prod_category,
            prod_price: num_prod_price,
            prod_inStock: bool_prod_inStock,
        }


        let lastInserId = await knex('products').returning('prod_id').insert(insertObj);

        await knex('product_image_details').insert({
            product_id: lastInserId[0].prod_id,
            public_id: image_public_id,
            signature: image_signature,
            image_url: image_url
        });


        res.status(201).json({ message: "New product added" })

    } catch (err) {
        //on duplicate product name
        if (err.code == '23505') {
            res.status(409).json({ message: 'Product already exists, please use a different name' });
            return
        }
        console.log(err);
        res.status(500).json({ message: 'An error occured while adding new product data' });
    }
}

const updateProduct = async (req, res) => {
    try {
        const prod_id = req.params.id;
        const updates = req.body;
        const product = await knex.select('*').from('products').where('prod_id', prod_id);

        if (!product || product.length == 0) {
            return res.status(404).json({ message: "Product not found" });

        }

        if (req.file) {
            const productOldImg = await knex.select('*').from('product_image_details').where('product_id', prod_id);
            await cloudinary.uploader.destroy(productOldImg[0].public_id, productOldImg[0].signature);
            await knex('product_image_details').where('product_id',prod_id).del();

            const imageUpload = await cloudinary.uploader.upload(req.file.path);
            const image_url = imageUpload.secure_url;
            const image_public_id = imageUpload.public_id;
            const image_signature = imageUpload.signature;

            let updatedObj = {
                ...updates
            }
            await knex('products')
                .where('prod_id', prod_id)
                .update(updatedObj);

            await knex('product_image_details').insert({
                product_id: prod_id,
                public_id: image_public_id,
                signature: image_signature,
                image_url: image_url
            });

        } else {
            await knex('products')
                .where('prod_id', prod_id)
                .update(updates);

        }




        res.status(204).json({ message: 'Product has been updated successfully' });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "An error occured while updating product data" });
    }
}

const getProductCategoryById = async (req, res) => {
    try {
        const cat_id = req.params.id;
        const productCatName = await knex.select('prod_cat_id', 'prod_cat_name').from('product_categories').where('prod_cat_id', cat_id);
        res.status(200).json({ product_category: productCatName });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "An error occured while getting the product category" });
    }
}

const deleteProduct = async (req, res) => {
    try {
        const prod_id = req.params.id;
        const product = await knex.select('*').from('products').where('prod_id', prod_id);
        if (!product || product.length == 0) {
            res.status(404).json({ message: 'The product does not exist' });
            return;
        }
        const productImgDetails = await knex('product_image_details').where('product_id',prod_id);
        await cloudinary.uploader.destroy(productImgDetails[0].public_id, productImgDetails[0].signature);
        await knex('products').where('prod_id', prod_id).del();
        res.status(200).json({ message: 'Product has been deleted' });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'An error occured while deleting the item' });
    }
}

module.exports = {
    getAllProducts,
    getProductsByCategory,
    getProductById,
    getProductCategories,
    searchProductsByName,
    addProduct,
    updateProduct,
    getProductCategoryById,
    getRelatedProducts,
    deleteProduct
}