const knex = require('../config/db/knex');

const getCartData = async (req,res) => {
	try{
		const userId = req.params.id;
		if(!userId || userId == null || userId == ''){
			return res.status(400).json({message: 'User not found!'});
		}
		const cart = await knex.select('*').from('cart').where('user_id',userId);
		if(cart.length !== 0){

		} 
	}catch(err){
		res.status(500).json({message: 'An error occured while getting cart data'});
		console.error(err);
	}
}

module.exports = {
	getCartData
}