
const knex = require('../config/db/knex');
const axios = require('axios');
const FormData = require('form-data');
const cloudinary = require('../config/cloudinary/cloudinary');
const path = require('path');
const datauri = require('datauri/parser');
const parser = new datauri();
// require('dotenv').config();

const getAllProducts = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const pageSize = parseInt(req.query.pageSize) || 6;

        const offset = (page - 1) * pageSize;
        const limit = pageSize;

        // const products = await knex.select('*').from('products').limit(limit).offset(offset);
        const products = await knex.raw('select pd.prod_id,pd.prod_name, pd.prod_price, pd.prod_img, pd."prod_inStock", pc.prod_cat_name as prod_category from products pd join product_categories pc on pd.prod_category = pc.prod_cat_id limit ? offset ?', [limit, offset])
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
        const excludeId = parseInt(req.query.prod_id) || null;
        const pageSize = parseInt(req.query.pageSize) || 6;
        const offset = (page - 1) * pageSize;
        const limit = pageSize;


        const category = req.params.category;

        if (excludeId == null || !excludeId) {
            const products = await knex.raw('select pd.prod_id,pd.prod_name, pd.prod_price, pd.prod_img, pd."prod_inStock", pc.prod_cat_name from products pd join product_categories pc on pd.prod_category = pc.prod_cat_id where pc.prod_cat_name = ? limit ? offset ?', [category, limit, offset])
            const totalCount = products.rowCount;
            res.status(200).json({
                currentPage: page,
                totalPages: Math.ceil(totalCount / pageSize),
                totalItems: totalCount,
                products: products.rows
            });
            return;
        }

        const products = await knex.raw('select pd.prod_id,pd.prod_name, pd.prod_price, pd.prod_img, pd."prod_inStock", pc.prod_cat_name from products pd join product_categories pc on pd.prod_category = pc.prod_cat_id where pc.prod_cat_name = ? and pd.prod_id <> ? limit ? offset ?', [category, excludeId, limit, offset])
        const totalCount = products.rowCount;
        res.status(200).json({
            currentPage: page,
            totalPages: Math.ceil(totalCount / pageSize),
            totalItems: totalCount,
            products: products.rows
        });


    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'An error occured while retrieving product data' });
    }
}

const getProductById = async (req, res) => {
    try {
        const product = await knex.raw('select pd.prod_id,pd.prod_name,pc.prod_cat_name as prod_category,pd.prod_price,pd.prod_img, pd."prod_inStock" from products pd join product_categories pc on pd.prod_category = pc.prod_cat_id where pd.prod_id = ?', [req.params.id]);
        res.status(200).json({ product: product.rows });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'An error occured while retrieving product data' })
    }
}

const getProductCategories = async (req, res) => {
    try {
        const productCategories = await knex.select('prod_cat_name').from('product_categories');
        res.status(200).json({ categories: productCategories })
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'An error occured while getting product categories' });
    }
}

const searchProductsByName = async (req, res) => {
    try {
        const productName = req.query.prod_name;
        const products = await knex.raw('select pd.prod_id,pd.prod_name,pc.prod_cat_name as prod_category,pd.prod_price,pd.prod_img, pd."prod_inStock" from products pd join product_categories pc on pd.prod_category = pc.prod_cat_id where pd.prod_name ilike ?', [`%${productName}%`]);
        res.status(200).json({ products: products.rows });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'An error occured while getting product data' });
    }
}

const addProduct = async (req, res) => {
    try {
        const { prod_name, prod_category, prod_price, prod_inStock } = req.body;

        console.log(req.body, req.file);


        const prodImg = req.file;
        if (!prodImg) {
            return res.status(400).json({message: "Error with image"});
        }
        
        const extName = path.extname(prodImg.originalname).toString();
        const fileUri = parser.format(extName,prodImg.buffer);
        console.log(fileUri);
        // let form = new FormData();
        // let newFileName = prod_name.replace(/\s+/g, '').toLowerCase();
        // console.log(newFileName);
        // let filePath = prodImg.path;
        // form.append('image',prodImg, { filename: newFileName });
        // console.log(form);

        // let config = {
        //     method: 'post',
        //     url: process.env.IMGBB_UPLOAD_URL,
        //     image: form
        // };

        // const fileUploadResponse = await axios.request(config);
        // const fileUploadResponse = await axios.post('https://api.imgbb.com/1/upload',{
        //     params:{
        //         key: '5018ef517cd6cc1cd7b66c10d79463b0',
        //     },
        //     image: form,
        // })

        // console.log(fileUploadResponse.data);

        // const imgUrl = fileUploadResponse.data.image.url;

        // await knex('products').insert({
        //     prod_name: prod_name,
        //     prod_category: prod_category,
        //     prod_price: prod_price,
        //     prod_img: imgUrl,
        //     prod_inStock: prod_inStock
        // });

        // res.status(201).json({ message: "New product data added!" });
        const result = await cloudinary.v2.uploader.upload(fileUri.content);
        console.log(result);




    } catch (err) {
        //on duplicate product name
        if (err.code == '23505') {
            res.status(409).json({ message: 'Product already exists, please use a different name' });
            return
        }
        res.status(500).json({ message: 'An error occured while add product data' });
    }
}

const updateProduct = async (req, res) => {
    try {
        const prod_id = req.params.id;
        const updates = req.body;
        const product = await knex.select('*').from('products').where('prod_id', prod_id);
        if (!product || product.length == 0) {
            res.status(404).json({ message: "Product not found" });
            return;
        }
        await knex('products')
            .where('prod_id', prod_id)
            .update(updates);

        res.status(204).json({ message: 'Product has been updated successfully' });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "An error occured while updating product data" });
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
        await knex('products').where('prod_id', prod_id).del();
        res.status(410).json({ message: 'Product has been deleted' });

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
    deleteProduct
}