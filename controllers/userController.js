const knex = require('../config/db/knex');
const cloudinary = require("../config/cloudinary/cloudinary");
require("dotenv").config();

const updateUserData = async(req,res) => {
  try{
    let userId = req.params.id;
    userId = parseInt(userId);
    console.log(userId);
        
    const data = req.body;
    console.log(data);
    if(!data || Object.keys(data).length == 0 || data == null){
      return res.status(400).json({message: 'No updates found'});
    }

    //const { user_id, user_name, user_email, user_contact, user_address} = data;

   // if(!user_id, !user_name || !user_email || !user_contact || !user_address){
   //   return res.status(400).json({message: 'Required fields missing!'});
   // }
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

module.exports = {
  updateUserData
}
