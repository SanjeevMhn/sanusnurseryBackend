const knex = require('../config/db/knex');

const getCartData = async (req, res) => {
	try {
		const userId = req.params.id;
		if (!userId || userId == null || userId == '') {
			return res.status(400).json({ message: 'User not found!' });
		}
		const cart = await knex.select('*').from('cart').where('user_id', userId);
		res.status(200).json({
			cart: cart
		})
		
	} catch (err) {
		res.status(500).json({ message: 'An error occured while getting cart data' });
		console.error(err);
	}
}

const addCartData = async (req, res) => {
	try {

		const { user_id, cart_item } = req.body;
		const userId = parseInt(user_id);

		if (!userId || userId == null || userId == '') {
			return res.status(400).json({ message: 'User id not found' });
		}

		if (!cart_item || Object.keys(cart_item).length == 0) {
			return res.status(400).json({ message: 'No products found in the cart' })
			}

		const cart_id = await knex('cart').returning('cart_id').insert({
			user_id: userId,
			cart_total: cart_item.total
		});

		// cart_items.map(async (ci) => {
			await knex('cart_detail').insert({
				cart_id: cart_id[0].cart_id,
				product_id: cart_item.id,
				product_quantity: cart_item.quantity
			})
		// });
// 
		res.status(200).json({ message: 'Products added to cart successfully' });

	} catch (err) {
		console.error(err);
		res.status(500).json({ message: 'An error occured while saving cart details' })
	}
}

module.exports = {
	getCartData,
	addCartData
}