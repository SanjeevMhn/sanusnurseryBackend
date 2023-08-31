const knex = require('../config/db/knex');
require('dotenv').config();


const getAllCategories = async(req, res) => {
	try{
		const getCatWithProdNum = await knex.raw(`select pc.prod_cat_id as cat_id,pc.prod_cat_name as category_name, count(pd.*) as product_count from product_categories pc left join products pd on pc.prod_cat_id = pd.prod_category group by pc.prod_cat_id, pc.prod_cat_name, pd.prod_category order by pc.prod_cat_name asc`);
		res.status(200).json({categories: getCatWithProdNum.rows});	
	}catch(err){
		console.log(err);
		res.status(500).json({message: "An error occured while getting product category data"})
	}
}

const addCategory = async(req,res) => {
	try{
		const { category_name } = req.body;

		if(category_name === null || category_name === ''){
			return res.status(400).json({message: "Please enter proper category name"});
		}
		const checkIfCategoryExists = await knex.select('prod_cat_id').from('product_categories').where({prod_cat_name: category_name});

		if(checkIfCategoryExists.length > 0){
			return res.status(400).json({message: "Product category already exists"});
		}

		await knex('product_categories').insert({
			prod_cat_name: category_name
		});

		res.status(201).json({message: "Added new category"});

	}catch(err){
		console.log(err);
		res.status(500).json({message: "An error occured while add new category"});
	}
}

const deleteCategory = async(req,res) => {
	try{

		const cat_id = req.params.id;
		const category = await knex.select('*').from('product_categories').where('prod_cat_id',cat_id)
		if(category.length == 0){
			return res.status(400).json({message: "The category does not exists"});
		}
		await knex('product_categories').where('prod_cat_id',cat_id).del();
		res.status(200).json({message: "The category has been deleted successfully"});

	}catch(err){
		console.log(err);
		res.status(500).json({message: "An error occured while deleting category"});
	}
}

const updateCategory = async(req,res) => {
	try{

		const cat_id = req.params.id;
		const updates = req.body;
		const category = await knex.select('*').from('product_categories').where('prod_cat_id',cat_id);

		if(category.length == 0){
			return res.status(400).json({message: "The category does not exist"});
		}

		if(updates == null || Object.keys(updates).length == 0 || !updates.hasOwnProperty('prod_cat_name')){
			return res.status(400).json({message: "Missing required fields"});
		}


		let updateObj = {
			...updates
		}

		await knex('product_categories').where('prod_cat_id',cat_id).update(updateObj);

		res.status(201).json({message: "The product category has been successfully updated"});

	}catch(err){
		console.log(err);
		res.status(500).json({message: "An error occured while updating category"});
	}
}

module.exports = {
	getAllCategories,
	addCategory,
	deleteCategory,
	updateCategory
}