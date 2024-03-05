const knex = require('../config/db/knex');
const Role = require('../config/enums/roles');
require('dotenv').config();

const countAll = async (req, res) => {
    try {
        const prodCount = await knex.raw("select count(*) from products");
        const prodCatCount = await knex.raw(
            "select count(*) from product_categories",
        );
        const orderCount = await knex.raw(`select 
                                            count(ord.*) 
                                        from orders ord 
                                        inner join payment_detail pyd on ord.order_id = pyd.order_id 
                                        where ord.order_number is not null and (ord.order_status = 'PENDING' and pyd.payment_status <> 'CANCELLED' )`);

        let adminId = await knex.raw(`select 
                                            usr.user_id
                                        from users usr 
                                        inner join roles rl on usr.role_id = rl.role_id
                                        where rl.role_name = 'admin'`);

        let adminArray = [];
        if (adminId.rows.length > 1) {
            adminId.rows.map((usr) => {
                adminArray.push(parseInt(usr.user_id))
            });
        } else {
            adminArray.push(adminId.rows[0].user_id);
        }

        const usersCount = await knex.count('user_id').from('users').whereNotIn('user_id',adminArray);

        res.status(200).json({
            productCount: prodCount.rows[0].count,
            categoryCount: prodCatCount.rows[0].count,
            ordersCount: orderCount.rows[0].count,
            usersCount: usersCount[0].count
        });
    } catch (err) {
        console.log(err);
        res.status(500)
            .json({
                message: "An error occured while getting total products, category and orders count",
            });
    }
};

const getAllUsers = async (req, res) => {
    try {
        const pageSize = parseInt(req.query.pageSize) || 5;
        const page = parseInt(req.query.page) || 1;

        const offset = (page - 1) * pageSize;
        const limit = pageSize;

        let adminId = await knex.raw(`select 
                                            usr.user_id
                                        from users usr 
                                        inner join roles rl on usr.role_id = rl.role_id
                                        where rl.role_name = 'admin'`);

        let adminArray = [];
        if (adminId.rows.length > 1) {
            adminId.rows.map((usr) => {
                adminArray.push(parseInt(usr.user_id))
            });
        } else {
            adminArray.push(adminId.rows[0].user_id);
        }

        const users = await knex.select(
            'user_id',
            'user_name',
            'user_email',
            'user_img',
            'authProvider')
            .from('users')
            .whereNotIn('user_id', adminArray)
            .orderBy('created_at', 'desc')
            .limit(limit)
            .offset(offset);

        const usersCount = await knex.count('user_id').from('users');
        const usersOnlyCount = usersCount[0].count - adminArray.length

        res.status(200).json({
            currentPage: page,
            totalPages: Math.ceil(usersOnlyCount / pageSize),
            totalItems: usersOnlyCount,
            pageSize: pageSize,
            users: users
        })
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'An error occured while getting all the users' });
    }
}

const deleteUser = async (req,res) => {
    try{
        let userId = req.params.id;
        userId = parseInt(userId);

        if(!userId || userId == '' || userId == null){
            return res.status(400).json({message:"User id not found"})
        }

        const userExists = await knex.select('*').from('users').where('user_id',userId);
        if(!userExists || userExists.length == 0){
            return res.status(400).json({message: 'User not found'});
        }

        await knex('users').where('user_id',userId).del();
        res.status(200).json({message: 'User deleted successfully'});
                
    }catch(err){
        console.error(err);
        res.status(500).json({message: 'An error occured while trying to delete user'})
    }
}

module.exports = {
    countAll,
    getAllUsers,
    deleteUser
}
