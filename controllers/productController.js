
const knex = require('../config/db/knex');

const getAllProducts = async(req,res) => {
    try{
        const products = await knex.select('*').from('products');
        res.status(200).json({products: products});
    }catch(err) {
        console.error(err);
        res.status(500).json({message: 'An error occured while getting product data'});
    }
}

const getProductsByCategory = async(req,res) => {
    try{
        const category = req.params.category;
        const products = await knex.raw('select pd.prod_id,pd.prod_name, pd.prod_price, pd.prod_img, pd."prod_inStock", pc.prod_cat_name from products pd join product_categories pc on pd.prod_category = pc.prod_cat_id where pc.prod_cat_name = ?',[category])
        res.status(200).json({products: products.rows});
    }catch(err){
        console.error(err);
        res.status(500).json({message: 'An error occured while retrieving product data'});
    }
}

const getProductById = async(req,res) => {
    try{
        const product = await knex.raw('select * from products pd where pd.prod_id = ?',[req.params.id]);
        res.status(200).json({product: product.rows});

    }catch(err){
        console.error(err);
        res.status(500).json({message: 'An error occured while retrieving product data'})
    }
}

const addProduct = async(req,res) => {
    try{
        const { prod_name,prod_category,prod_price,prod_img,prod_inStock } = req.body;
        await knex('products').insert({
            prod_name: prod_name,
            prod_category: prod_category,
            prod_price: prod_price,
            prod_img: prod_img,
            prod_inStock: prod_inStock
        });
        res.status(201).json({message: "New product data added!"});

    }catch(err){
        console.error(err);
        res.status(500).json({message: 'An error occured while add product data'});
    }
}
module.exports = {getAllProducts,getProductsByCategory,getProductById,addProduct}