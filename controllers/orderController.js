const knex = require('../config/db/knex');
const cloudinary = require('../config/cloudinary/cloudinary');
require('dotenv').config();

const addOrder = async(req,res) => {
    try{
        const { order_number,user_id,order_date,order_total,order_status,delivery_address,user_name,user_email,user_contact,payment_type,order_products} = req.body;
        if(!req.body){
            return res.status(400).json({message: "Invalid order data"});
        }

        let orderInsert = {
            order_number: order_number,
            user_id: user_id,
            order_date: order_date,
            order_total: order_total,
            order_status: order_status,
            delivery_address: delivery_address,
            user_name: user_name,
            user_email: user_email,
            user_contact: user_contact,
            payment_id: Number(payment_type)
        }

        let lastInsertId = await knex('orders').returning('order_id').insert(orderInsert);
        order_products.map(async (op) => {
            await knex('order_details').insert({
                order_id: lastInsertId[0].order_id,
                product_id: op.prod_id,
                product_quantity: op.quantity,
            })
        });

        res.status(201).json({message: "Order has been placed"});

    }catch(err){
        console.log(err);
        res.status(500).json({message: "An error occured while sending order request"});
    }
}

const getAllOrders = async (req,res) => {
    try{
        const page = parseInt(req.query.page) || 1;
        const pageSize = parseInt(req.query.pageSize) || 6;
        const offset = (page - 1) * pageSize;
        const limit = pageSize;

        const orders = await knex.select('*').from('orders').limit(limit).offset(offset);
        const ordersCount = await knex('orders').count('order_id');

        res.status(200).json({
            currentPage: page,
            totalPages: Math.ceil(ordersCount[0].count / pageSize),
            totalItem: parseInt(ordersCount[0].count),
            orders: orders
        })


    }catch(err){
        console.log(err);
        res.status(500).json({message: "An error occured while getting orders"});
    }
}


module.exports = {
    addOrder,
    getAllOrders
}