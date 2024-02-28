const knex = require('../config/db/knex');

const getCartData = async (req, res) => {
	try {
		const userId = parseInt(req.params.id);
		if (!userId || userId == null || userId == '') {
			return res.status(400).json({ message: 'User not found!' });
		}
		const cart = await knex.raw(`select
										p.prod_id as id,
										p.prod_name as name,
										cast(p.prod_price as integer) as price,
										pc.prod_cat_name as category,
										pid.image_url as img,
										cd.product_quantity as quantity
								from cart ct
								inner join cart_detail cd on ct.cart_id = cd.cart_id
								inner join products p on cd.product_id = p.prod_id
								inner join product_categories pc on p.prod_category = pc.prod_cat_id
								inner join product_image_details pid on pid.product_id = p.prod_id
								where ct.user_id = ?`, [userId]);
		res.status(200).json({
			cart: cart.rows
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

		const existingUser = await knex.select('*').from('cart').where('user_id', userId);

		if (existingUser && existingUser.length > 0) {

			const existingProduct = await knex.select('*').from('cart_detail')
				.where('product_id', cart_item.id)
				.andWhere('cart_id', existingUser[0].cart_id);

			if (existingProduct && existingProduct.length > 0) {
				return res.status(400).json({ message: 'Product already exists in the cart' });
			}	

			const cartDetailId = await knex('cart_detail').returning('cart_detail_id').insert({
				cart_id: existingUser[0].cart_id,
				product_id: cart_item.id,
				product_quantity: cart_item.quantity
			})

			console.log(cartDetailId[0].cart_detail_id);

			const cartDetail = await knex.raw(`select 
												pd.prod_id as id,
												pd.prod_name as name,
												pd.prod_price as price,
												pc.prod_cat_name as category,
												pid.image_url as img,
												cd.product_quantity as quantity
											from cart_detail cd
											inner join products pd on cd.product_id = pd.prod_id
											inner join product_categories pc on pd.prod_category = pc.prod_cat_id
											inner join product_image_details pid on pid.product_id = pd.prod_id
											where cd.cart_detail_id = ?`, [cartDetailId[0].cart_detail_id])
			
			return res.status(200).json({ 
				message: "Product added to cart successfully",
				cart: cartDetail.rows[0]
			})
		}

		const cartId = await knex('cart').returning('cart_id').insert({
			user_id: userId,
		});

		const existingProduct = await knex.select('*').from('cart_detail')
			.where('product_id', cart_item.id)
			.andWhere('cart_id', cartId[0].cart_id);

		if (existingProduct && existingProduct.length > 0) {
			return res.status(400).json({ message: 'Product already exists in the cart' });
		}	

		// cart_items.map(async (ci) => {
		const cartDetailId = await knex('cart_detail').returning('cart_detail_id').insert({
			cart_id: cartId[0].cart_id,
			product_id: cart_item.id,
			product_quantity: cart_item.quantity
		})
		// });
		// 

		const cartDetail = await knex.raw(`select 
												pd.prod_id as id,
												pd.prod_name as name,
												pd.prod_price as price,
												pc.prod_cat_name as category,
												pid.image_url as img,
												cd.product_quantity as quantity
											from cart_detail cd
											inner join products pd on cd.product_id = pd.prod_id
											inner join product_categories pc on pd.prod_category = pc.prod_cat_id
											inner join product_image_details pid on pid.product_id = pd.prod_id
											where cd.cart_detail_id = ?`, [cartDetailId[0].cart_detail_id])

		res.status(200).json({ 
			message: 'Product added to cart successfully',
			cart: cartDetail.rows[0] 
		});

	} catch (err) {
		console.error(err);
		res.status(500).json({ message: 'An error occured while saving cart details' })
	}
}

const removeCartData = async (req, res) => {
	try {
		const { user_id, cart_item } = req.body;

		const userId = parseInt(user_id);

		if (!userId || userId == null || userId == '') {
			return res.status(400).json({ message: 'User detail not found' });
		}
		if (!cart_item || Object.keys(cart_item).length == 0) {
			return res.status(400).json({ message: 'Item detail not found' });
		}
		const cartId = await knex.select('*').from('cart').where('user_id', userId);

		const cartItemDel = await knex('cart_detail')
			.where('cart_id', cartId[0].cart_id)
			.andWhere('product_id', cart_item.id).del();

		res.status(200).json({ message: 'Cart item deleted successfully' });			
	} catch (err) {
		console.error(err);
		res.status(500).json({ message: 'An error occured while deleting item from cart' })
	}
}

module.exports = {
	getCartData,
	addCartData,
	removeCartData
}
