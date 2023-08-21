const knex = require('../config/db/knex');
const cloudinary = require('../config/cloudinary/cloudinary');
require('dotenv').config();


const countOrders = async(req,res) => {
    try{
        const orderCount = await knex.raw('select count(*) from orders');
        res.status(200).json({count: orderCount.rows[0].count})
    }catch(err){
        console.log(err);
        res.status(500).json({message: "An error occured while getting total orders"});
    }
}

const getMostOrderedProducts = async (req,res) => {
    try{

        const getProductDetails = await knex.raw(`select pd.prod_name, pc.prod_cat_name as prod_category,pim.image_url,pd.prod_price, count(od.product_id) as frequency from order_details od inner join products pd on od.product_id = pd.prod_id inner join product_categories pc on pc.prod_cat_id = pd.prod_category inner join product_image_details pim on od.product_id = pim.product_id group by od.product_id,pd.prod_name,pc.prod_cat_name,pim.image_url, pd.prod_price  order by frequency desc`);

        res.status(200).json({products: getProductDetails.rows});

    }catch(err) {
        console.log(err);
        res.status(500).json({message: "An error occured while getting the most ordered products"});
    }
}

const addOrder = async(req,res) => {
    try{
        await knex.transaction(async trx => {

            const { order_number,user_id,order_date,order_total,delivery_address,user_name,user_email,user_contact,payment_type,order_products} = req.body;
            if(!req.body){
                return res.status(400).json({message: "Invalid order data"});
            }

            let orderInsert = {
                order_number: order_number,
                user_id: user_id,
                order_date: order_date,
                order_total: order_total,
                delivery_address: delivery_address,
                user_name: user_name,
                user_email: user_email,
                user_contact: user_contact,
            }

            let lastInsertId = await trx('orders').returning('order_id').insert(orderInsert);
            order_products.map(async (op) => {
                await trx('order_details').insert({
                    order_id: lastInsertId[0].order_id,
                    product_id: op.prod_id,
                    product_quantity: op.quantity,
                })
            });

            await trx('payment_detail').insert({
                order_id: lastInsertId[0].order_id,
                payment_date: null,
                payment_type: payment_type,
                total_amount: order_total
            });


            res.status(201).json({message: "Order has been placed"});

        })

    }catch(err){
        console.log(err);
        res.status(500).json({message: "An error occured while sending order request"});
    }
}

const getAllOrders = async (req,res) => {
    try{
        const page = parseInt(req.query.page) || 1;
        const pageSize = parseInt(req.query.pageSize) || 10;
        const offset = (page - 1) * pageSize;
        const limit = pageSize;

        const orders = await knex.raw(`select ord.*,pd.payment_status,pd.payment_type from orders ord inner join payment_detail pd on ord.order_id = pd.order_id limit ? offset ?`,[limit,offset]);
        const ordersCount = await knex.raw(`select count(*) as row_count from (select ord.*,pd.payment_status,pd.payment_type from orders ord inner join payment_detail pd on ord.order_id = pd.order_id) as result`);

        res.status(200).json({
            currentPage: page,
            totalPages: Math.ceil(ordersCount.rows[0].row_count / pageSize),
            totalItem: parseInt(ordersCount.rows[0].row_count),
            orders: orders.rows
        })


    }catch(err){
        console.log(err);
        res.status(500).json({message: "An error occured while getting orders"});
    }
}

const getOrderById = async(req,res) => {
    try{

        const orderId = req.params.order_id;
        if(!orderId || orderId == null){
            return res.status(404).json({message: "Order id not found"});
        }

        const order = await knex.raw(`select ord.*,pd.payment_status,pd.payment_type from orders ord inner join payment_detail pd on ord.order_id = pd.order_id where ord.order_id = ?`,orderId);

        res.status(200).json({
            order: order.rows[0]
        });

    }catch(err){
        console.log(err);
        res.status(500).json({message: "An error occurred while getting order"});
    }
}

const getOrderItems = async(req,res) => {
    try{

        const orderId = req.params.order_id;
        if(!orderId || orderId == null){
            return res.status(404).json({message: "Order id not found"});
        }

        const orderItems = await knex.raw(`select 
                                                pd.prod_name,
                                                pim.image_url,
                                                pc.prod_cat_name as prod_category, 
                                                cast(pd.prod_price as integer), 
                                                od.product_quantity 
                                            from order_details od 
                                            inner join products pd on od.product_id = pd.prod_id 
                                            inner join product_categories pc on pd.prod_category = pc.prod_cat_id 
                                            inner join product_image_details pim on od.product_id = pim.product_id 
                                            where od.order_id = ?`,[orderId]);
        res.status(200).json({items: orderItems.rows});


    }catch(err){
        console.log(err);
        res.status(500).json({message: "An error occured while getting order items data"});
    }
}

const getPaymentDetail = async(req,res) => {
    try{
        const orderId = req.params.order_id;
        if(!orderId || orderId == null){
            return res.status(404).json({message: "Order id not found"});
        }
        const paymentDetail = await knex.raw(`select 
                                            pd.payment_id,
                                            pd.payment_date,
                                            pd.total_amount,
                                            pc.payment_type,
                                            pd.payment_status
                                        from payment_detail pd
                                        inner join payment_category pc on pd.payment_type = pc.payment_id
                                        where pd.order_id = ?`,[orderId]);

        res.status(200).json({payment_detail: paymentDetail.rows});

    }catch(err){
        console.log(err);
        res.status(500).json({message: "An error occured while getting payment data"})
    }
}

const getPaymentTypeFromId = async(req,res) => {
    try{
        const paymentTypeId = Number(req.params.payment_type_id);
        if(!paymentTypeId){
            return res.status(404).json({message: "Payment type id not found"});
        }
        const paymentType = await knex.select('payment_type').from('payment_category').where('payment_id',paymentTypeId);
        res.status(200).json({
            paymentType: paymentType[0].payment_type
        });

    }catch(err){
        console.log(err);
        res.status(500).json({message: "An error occured whie getting payment type"})
    }
}

const getOrderByDate = async(req,res) => {
    try{

    }catch(err){
        console.log(err);
        res.status(500).json({message: "An error occured while getting order by date"});
    }
}


module.exports = {
    countOrders,
    getMostOrderedProducts,
    addOrder,
    getAllOrders,
    getOrderById,
    getOrderItems,
    getPaymentDetail,
    getPaymentTypeFromId
}