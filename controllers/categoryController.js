const knex = require('../config/db/knex');
require('dotenv').config();


const getAllCategories = async(req, res) => {
	try{
		const getCatWithProdNum = await knex.raw(`select pc.prod_cat_name as category_name, count(pd.*) as product_count from product_categories pc left join products pd on pc.prod_cat_id = pd.prod_category group by pc.prod_cat_name, pd.prod_category order by pc.prod_cat_name asc`);
		res.status(200).json({categories: getCatWithProdNum.rows});	
	}catch(err){
		console.log(err);
		res.status(500).json({message: "An error occured while getting product category data"})
	}
}

const addCategory = async(req,res) => {
	try{
		const { category_name } = req.body;

		const checkIfCategoryExists = await knex.select('prod_cat_name').from('product_categories');

		checkIfCategoryExists.map((cat) => {
			if(cat.prod_cat_name === category_name){
				return res.status(400).json({message: "Product category already exists"});
			}
		})

		await knex('product_categories').insert({
			prod_cat_name: category_name
		});

		res.status(201).json({message: "Added new category"});

	}catch(err){
		console.log(err);
		res.status(500).json({message: "An error occured while add new category"});
	}
}


module.exports = {
	getAllCategories,
	addCategory
}