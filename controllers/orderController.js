const knex = require('../config/db/knex');
const cloudinary = require('../config/cloudinary/cloudinary');
const { getIOInstance } = require('../server');
require('dotenv').config();


const countOrders = async (req, res) => {
    try {
        const orderCount = await knex.raw(`select 
                                            count(ord.*) 
                                        from orders ord 
                                        inner join payment_detail pyd on ord.order_id = pyd.order_id 
                                        where order_number is not null`);
        res.status(200).json({ count: orderCount.rows[0].count })
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "An error occured while getting total orders" });
    }
}

const getMostOrderedProducts = async (req, res) => {
    try {

        let pageSize = parseInt(req.query.pageSize) || 5;
        let page = parseInt(req.query.page) || 1;

        let offset = (page - 1) * pageSize;
        let limit = pageSize

        const getProductDetails = await knex.raw(`select 
                                                    pd.prod_name, 
                                                    pc.prod_cat_name as prod_category,
                                                    pim.image_url as image,
                                                    pd.prod_price, 
                                                    count(od.product_id) as frequency 
                                                from order_details od 
                                                inner join products pd on od.product_id = pd.prod_id 
                                                inner join product_categories pc on pc.prod_cat_id = pd.prod_category 
                                                inner join product_image_details pim on od.product_id = pim.product_id 
                                                group by od.product_id,pd.prod_name,pc.prod_cat_name,pim.image_url, pd.prod_price  
                                                order by count(od.product_id) desc limit ? offset ?`, [limit, offset]);

        const totalCount = await knex.raw(`select count(*) from (select 
                                                                    pd.prod_name, 
                                                                    pc.prod_cat_name as prod_category,
                                                                    pim.image_url as image,
                                                                    pd.prod_price, 
                                                                    count(od.product_id) as frequency 
                                                                from order_details od 
                                                                inner join products pd on od.product_id = pd.prod_id 
                                                                inner join product_categories pc on pc.prod_cat_id = pd.prod_category 
                                                                inner join product_image_details pim on od.product_id = pim.product_id 
                                                                group by od.product_id,pd.prod_name,pc.prod_cat_name,pim.image_url, pd.prod_price  
                                                                order by count(od.product_id) desc) as counter`);


        res.status(200).json({
            currentPage: page,
            totalPages: Math.ceil(totalCount.rows[0].count / pageSize),
            totalItems: totalCount.rows[0].count,
            pageSize: pageSize,
            products: getProductDetails.rows
        });

    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "An error occured while getting the most ordered products" });
    }
}

const searchMostOrderedProducts = async (req, res) => {

    try {

        let productName = req.query.prod_name;
        productName = productName.toLowerCase();

        const products = await knex.raw(`select 
                                            pd.prod_name, 
                                            pc.prod_cat_name as prod_category,
                                            pim.image_url,pd.prod_price, 
                                            count(od.product_id) as frequency 
                                        from order_details od 
                                        inner join products pd on od.product_id = pd.prod_id 
                                        inner join product_categories pc on pc.prod_cat_id = pd.prod_category 
                                        inner join product_image_details pim on od.product_id = pim.product_id 
                                        where pd.prod_name ilike ?`, [`%${productName}%`]);

        res.status(200).json({ products: products.rows })

    } catch (e) {
        res.status(500).json({ message: 'An error occured while getting order data' });
    }

}

const getProductDeliveredAndPaymentStatus = async (req, res) => {
    try {
        const getDetails = await knex.raw(`select 
                                            ord.order_id, 
                                            ord.order_number,
                                            ord.order_date,
                                            pyd.total_amount as order_total,
                                            ord.order_status,
                                            pyd.payment_status
                                        from orders ord
                                        inner join payment_detail pyd on ord.order_id = pyd.order_id
                                        order by ord.order_date desc`);

        res.status(200).json({ orders: getDetails.rows }); 
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "An error occured while getting product delivery and payment status" });
    }
}

const addOrder = async (req, res) => {
    try {
        await knex.transaction(async trx => {

            const { 
                order_number, 
                user_id, 
                order_date, 
                order_total, 
                delivery_address, 
                user_name, user_email, 
                user_contact, 
                payment_type, 
                order_products 
            } = req.body;

            if (!req.body) {
                return res.status(400).json({ message: "Invalid order data" });
            }

            let orderInsert = {
                order_number: order_number,
                user_id: user_id,
                order_date: order_date,
                delivery_address: delivery_address,
                user_name: user_name,
                user_email: user_email,
                user_contact: user_contact,
            }

            let lastInsertId = await trx('orders').returning('order_id').insert(orderInsert);
            order_products.map(async (op) => {
                await trx('order_details').insert({
                    order_id: lastInsertId[0].order_id,
                    product_id: op.id,
                    product_quantity: op.quantity,
                })
            });

            await trx('payment_detail').insert({
                order_id: lastInsertId[0].order_id,
                payment_date: null,
                payment_type: payment_type,
                total_amount: order_total
            });

            let adminId = await trx.raw(`select 
                                            usr.user_id
                                        from users usr 
                                        inner join roles rl on usr.role_id = rl.role_id
                                        where rl.role_name = 'admin'`);

            await trx('notifications').insert({
                sender_id: lastInsertId[0].order_id,
                receiver_id: adminId.rows[0].user_id,
                notification_type: "Order Added",
                notification_desc: 'New order placed',
            });

            getIOInstance().emit('orderAdded',{message: 'New Order Placed'});

            res.status(201).json({ message: "Order has been placed" });

        })

    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "An error occured while sending order request" });
    }
}

const getAllOrders = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const pageSize = parseInt(req.query.pageSize) || 10;
        const offset = (page - 1) * pageSize;
        const limit = pageSize;

        const orders = await knex.raw(`select 
                                            ord.*,
                                            ord.order_date::TEXT,
                                            case
                                                when ord.user_id is null then 'guest'
                                                else 'user'
                                            end as user_type
                                            pd.total_amount as order_total,
                                            pd.payment_status,
                                            pc.payment_type 
                                        from orders ord 
                                        inner join payment_detail pd on ord.order_id = pd.order_id 
                                        inner join payment_category pc on pd.payment_type = pc.payment_id
                                        where ord.order_status = 'PENDING' and pd.payment_status <> 'CANCELLED'
                                        limit ? offset ?`, [limit, offset]);
        const ordersCount = await knex.raw(`select 
                                                count(*) as row_count 
                                            from (select 
                                                    ord.*,
                                                    pd.payment_status,
                                                    pc.payment_type from orders ord 
                                                    inner join payment_detail pd on ord.order_id = pd.order_id
                                                    inner join payment_category pc on pd.payment_type = pc.payment_id
                                                    where ord.order_status = 'PENDING' and pd.payment_status <> 'CANCELLED'
                                                 ) as result`);

        res.status(200).json({
            currentPage: page,
            pageSize: pageSize,
            totalPages: Math.ceil(ordersCount.rows[0].row_count / pageSize),
            totalItem: parseInt(ordersCount.rows[0].row_count),
            orders: orders.rows
        })


    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "An error occured while getting orders" });
    }
}

const getOrdersByOrderStatus = async (req, res) => {
    try {

        const status = req.params.status;
        const page = parseInt(req.query.page) || 1;
        const pageSize = parseInt(req.query.pageSize) || 5;
        const offset = (page - 1) * pageSize;
        const limit = pageSize;

        const orderStatus = await knex.raw(`select
                                                ord.*,
                                                case
                                                    when ord.user_id is null then 'guest'
                                                    else 'user'
                                                end as user_type, 
                                                ord.order_date::TEXT,
                                                pd.total_amount as order_total,
                                                pd.payment_status,
                                                pc.payment_type 
                                            from orders ord
                                            inner join payment_detail pd on ord.order_id = pd.order_id
                                            inner join payment_category pc on pd.payment_type = pc.payment_id
                                            where ord.order_status = ? order by ord.created_at desc limit ? offset ?`, [status, limit, offset]);

        const orderStatusCount = await knex.raw(`select count(*) from (select ord.* from orders ord
                                                                        inner join payment_detail pd on ord.order_id = pd.order_id
                                                                        inner join payment_category pc on pd.payment_type = pc.payment_id
                                                                        where ord.order_status = ? and pd.payment_status <> 'CANCELLED') as orderStatus`, [status]);

        res.status(200).json({
            currentPage: page,
            totalPages: Math.ceil(orderStatusCount.rows[0].count / pageSize) == 0 ? 1 : Math.ceil(orderStatusCount.rows[0].count / pageSize),
            totalItems: orderStatusCount.rows[0].count,
            pageSize: pageSize,
            orders: orderStatus.rows
        })

    } catch (e) {
        console.error(e)
    }
}

const getOrderById = async (req, res) => {
    try {

        const orderId = req.params.order_id;
        if (!orderId || orderId == null) {
            return res.status(404).json({ message: "Order id not found" });
        }

        const order = await knex.raw(`select 
                                        ord.*,
                                        ord.order_date::TEXT,
                                        case
                                            when ord.user_id is null then 'guest'
                                            else 'user' 
                                        end as user_type,
                                        pd.total_amount as order_total,
                                        pd.payment_status,
                                        pc.payment_type
                                    from orders ord 
                                    inner join payment_detail pd on ord.order_id = pd.order_id 
                                    inner join payment_category pc on pd.payment_type = pc.payment_id
                                    where ord.order_id = ?`, [orderId]);

        const orderItems = await knex.raw(`select 
                                                pd.prod_id,
                                                pd.prod_name,
                                                pim.image_url as prod_img,
                                                pc.prod_cat_name as prod_category, 
                                                cast(pd.prod_price as integer), 
                                                od.product_quantity as prod_quantity,
                                                pd."prod_inStock"
                                            from order_details od 
                                            inner join products pd on od.product_id = pd.prod_id 
                                            inner join product_categories pc on pd.prod_category = pc.prod_cat_id 
                                            inner join product_image_details pim on od.product_id = pim.product_id 
                                            where od.order_id = ?`, [orderId])
        res.status(200).json({
            order: order.rows[0],
            orderItems: orderItems.rows
        });

    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "An error occurred while getting order" });
    }
}

const getOrderItems = async (req, res) => {
    try {

        const orderId = req.params.order_id;
        if (!orderId || orderId == null) {
            return res.status(404).json({ message: "Order id not found" });
        }

        const orderItems = await knex.raw(`select 
                                                od.order_detail_id,                                            
                                                pd.prod_name,
                                                pim.image_url as prod_img,
                                                pc.prod_cat_name as prod_category, 
                                                cast(pd.prod_price as integer), 
                                                od.product_quantity as prod_quantity 
                                            from order_details od 
                                            inner join products pd on od.product_id = pd.prod_id 
                                            inner join product_categories pc on pd.prod_category = pc.prod_cat_id 
                                            inner join product_image_details pim on od.product_id = pim.product_id 
                                            where od.order_id = ?`, [orderId]);
        res.status(200).json({ items: orderItems.rows });


    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "An error occured while getting order items data" });
    }
}

const deleteOrderItem = async (req,res) => {
    try{
        const orderItemId = req.params.id;
        if(!orderItemId || orderItemId == null || orderItemId == ''){
            return res.status(400).json({message: 'Order detail id not found'});
        }

        const orderItemExists = await knex.select('order_detail_id').from('order_details').where('order_detail_id',orderItemId);

        if(orderItemExists.length == 0){
            return res.status(400).json({message: 'Order item not found'});
        }

        await knex('order_details').where('order_detail_id',orderItemId).del();

        res.status(200).json({message: 'Item deleted successfully'});
        
    }catch(err){
        console.log(err);
        res.status(500).json({message: 'An error occured while deleting order item'});
    }
}

const updateOrderItem = async (req,res) => {
    try{
        const orderDetailId = req.params.id;
        const updates = req.body;

        if(!orderDetailId || orderDetailId == null || orderDetailId == ''){
            return res.status(400).json({message: 'Order id not found'});
        }

        if(!updates || Object.keys(updates).length == 0){
            return res.status(400).json({message: 'No updates found'});
        }

        const orderDetailExists = await knex.select('order_detail_id').from('order_details').where('order_detail_id', orderDetailId);
        if(orderDetailExists.length == 0){
            return res.status(400).json({message: 'Order item does not exist'});
        }

        await knex('order_details').where('order_detail_id', orderDetailId).update({...updates});
        res.status(200).json({message: 'Order item updated successfully'});
                         
    }catch(err){
        res.status(500).json({message: 'An error occured while updating order items'})
        console.log(err)
    }
}

const getPaymentDetail = async (req, res) => {
    try {
        const orderId = req.params.order_id;
        if (!orderId || orderId == null) {
            return res.status(404).json({ message: "Order id not found" });
        }
        const paymentDetail = await knex.raw(`select 
                                            pd.payment_id,
                                            pd.payment_date::TEXT,
                                            pd.total_amount,
                                            pd.payment_type,
                                            pd.payment_status
                                        from payment_detail pd
                                        inner join payment_category pc on pd.payment_type = pc.payment_id
                                        where pd.order_id = ?`, [orderId]);

        res.status(200).json({ payment_detail: paymentDetail.rows });

    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "An error occured while getting payment data" })
    }
}

const getPaymentTypeFromId = async (req, res) => {
    try {
        const paymentTypeId = Number(req.params.payment_type_id);
        if (!paymentTypeId) {
            return res.status(404).json({ message: "Payment type id not found" });
        }
        const paymentType = await knex.select('payment_type').from('payment_category').where('payment_id', paymentTypeId);
        res.status(200).json({
            paymentType: paymentType[0].payment_type
        });

    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "An error occured whie getting payment type" })
    }
}

const searchOrderByDate = async (req, res) => {
    try {
        const searchDate = String(req.params.order_date);
        if (!searchDate) {
            return res.status(400).json({ message: "Order date not found" });
        }

        const orders = await knex.raw('select ord.*, ord.order_date::TEXT from orders ord inner join payment_detail pd on ord.order_id = pd.order_id where substring(ord.order_date::TEXT,1,10) = ?', [searchDate]);

        res.status(200).json({ orders: orders.rows })

    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'An error occured while searching order details by date' })
    }
}

const searchOrderByUserName = async (req, res) => {

    try {
        const userName = req.query.name;
        if (!userName || userName == '' || userName == null) {
            return res.status(400).json({ message: "No user name found." });
        }
        console.log(userName);
        const orders = await knex.raw(`select 
                                        ord.*,ord.order_date::TEXT
                                        from orders ord
                                        inner join payment_detail pd
                                        on ord.order_id = pd.order_id
                                        where ord.user_name ilike ?`, [`%${userName}%`]);


        res.status(200).json({ orders: orders.rows });
    } catch (err) {
        consol.log(err);
        res.status(500).json({ message: 'An error occured while searching order by user name' });
    }

}

const separateOrderPaymentUpdates = (update) => {
    const paymentUpdate = {};
    const orderUpdate = {};

    for(const key in update) {
        if(update.hasOwnProperty(key)){
            if(key === 'payment_type' || key === 'payment_status'){
                paymentUpdate[key] = update[key];
            }else{
                orderUpdate[key] = update[key];
            }
        }
    }

    return { paymentUpdate, orderUpdate };
}

const updateOrder = async (req, res) => {
    try {
        const orderId = req.params.order_id;
        const orderUpdates = req.body;


        const existOrder = await knex.select('order_id').from('orders').where('order_id', orderId);
        if (!orderId || orderId === null) {
            return res.status(400).json({ message: "Order id not found" });
        }

        if (Object.keys(orderUpdates).length == 0) {
            return res.status(400).json({ message: "Update data not found" });
        }

        if (existOrder.length == 0) {
            return res.status(400).json({ message: "Order not found" });
        }

        const { paymentUpdate,orderUpdate } = separateOrderPaymentUpdates(orderUpdates);

        if(Object.keys(orderUpdate).length !== 0){
            await knex('orders').where('order_id', orderId).update({ ...orderUpdate });
        }

        if(Object.keys(paymentUpdate).length !== 0){
            await knex('payment_detail').where('order_id', orderId).update({ ...paymentUpdate });
        }

        res.status(200).json({ message: "Order updated successfully" })
        
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "An error occurred while upadating order data" });
    }
}

const updateOrderPaymentDetail = async (req, res) => {
    try {

        const orderId = req.params.order_id;
        const paymentUpdates = req.body;
        const existPaymentDetails = await knex.select('payment_id').from('payment_detail').where('order_id', orderId);

        if (!orderId || orderId == null) {
            return res.status(400).json({ message: "Order id not found" });
        }

        if (Object.keys(paymentUpdates).length === 0) {
            return res.status(400).json({ message: "Payment updates not found" });
        }

        if (existPaymentDetails.length === 0) {
            return res.status(400).json({ message: "Payment detail for the order not found" });
        }

        await knex('payment_detail').where('order_id', orderId).update({ ...paymentUpdates });
        res.status(200).json({ message: "Order payment detail upated successfully" });

    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "An error occured while updating order payment detail" });
    }
}

const getPaymentTypes = async (req, res) => {

    try {
        const paymentTypes = await knex.select('*').from('payment_category');
        return res.status(200).json({
            paymentTypes: paymentTypes
        })
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: 'An error occured while getting payment category data' })
    }
}

const deleteOrder = async (req,res) =>{
     try{
        const orderId = req.params.order_id;
        if(orderId === null || orderId == '' || !orderId){
            return res.status(400).json({message: 'Order id not found'});
        }

        const orderExists = await knex.select('*').from('orders').where('order_id',orderId);

        if(!orderExists || orderExists == null){
            return res.status(400).json({message: 'Order not found'});
        }

        const orderDel = await knex('orders').where('order_id',orderId).del();

        res.status(200).json({message: 'Order deleted successfully'});       
     }catch(e){
        console.error(e);
        res.status(500).json({message: 'An error occured while deleting order'})
     }
}


module.exports = {
    countOrders,
    getMostOrderedProducts,
    getProductDeliveredAndPaymentStatus,
    addOrder,
    getAllOrders,
    getOrderById,
    getOrderItems,
    getPaymentDetail,
    getPaymentTypeFromId,
    searchOrderByDate,
    searchOrderByUserName,
    updateOrder,
    updateOrderPaymentDetail,
    searchMostOrderedProducts,
    getPaymentTypes,
    getOrdersByOrderStatus,
    deleteOrder,
    updateOrderItem,
    deleteOrderItem
}
