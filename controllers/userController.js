const knex = require('../config/db/knex');
const cloudinary = require("../config/cloudinary/cloudinary");
require("dotenv").config();

const updateUserData = async(req,res) => {
  try{
    let userId = req.params.id;
    userId = parseInt(userId);
        
    const data = req.body;
    if(!data || Object.keys(data).length == 0 || data == null){
      return res.status(400).json({message: 'No updates found'});
    }

    if(!userId || userId == null || userId == ''){
      return res.status(400).json({message: 'User id not found'});
    }
    
    const userExists = await knex.select('*').from('users').where('user_id',userId);
    if(!userExists || userExists.length == 0){
      return res.status(400).json({message: 'User not found'});
    }

    await knex('users').where('user_id', userId).update({...data});    
    res.status(200).json({message: 'User data successfully updated'})
    
  }catch(err){
    console.log(err);
    res.status(500).json({message: 'An error occured while updating user data'})
  }
}

//getting order status and order history
const getUserOrderHistory = async(req,res) => {
  try{
    let userId = req.params.id;
    userId = parseInt(userId);

    if(!userId || userId == null || userId == ''){
      return res.status(400).json({message: 'User id not found'});
    }
   
    const order = await knex.raw(`select 
                                    ord.*,
                                    ord.order_date::text
                                  from orders ord
                                  where ord.user_id = ?
                                  order by ord.created_at desc`,[userId])
    
    if(order.rows.length == 0){
      return res.status(400).json({message: 'No orders found'})
    }

    res.status(200).json({orders: order.rows})
    
  }catch(err){
    console.error(err);
    res.status(500).json({message: 'An error occured while getting order history'})
  }
}

module.exports = {
  updateUserData,
  getUserOrderHistory
}
