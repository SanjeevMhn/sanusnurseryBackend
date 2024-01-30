const knex = require('../config/db/knex');
require('dotenv').config();

const getNotifications = async(req,res) => {
    try{
        const receiverId = req.params.id;
        if(receiverId == '' || receiverId === null){
            return res.status(400).json({message: 'Receiver id not found'});
        }

        const notifications = await knex.raw(`select * from notifications n where n.receiver_id = ? and n."is_read" = false`,[receiverId]);
        res.status(200).json({ notifications: notifications.rows });
    }catch(err){
        console.error(err);
        res.status(500).json({message: 'An error occured while getting notification data'});
    }
}

const notificationUpdate = async(req,res) => {
    try{
        const notifyId = req.params.id;
        if(notifyId == '' || notifyId == null){
            return res.status(400).json({message: 'Notification id not found'});
        }

        const notifyExists = await knex.select('notification_id').from('notifications').where('notification_id', notifyId);

        if(!notifyId || notifyId === null){
            return res.status(400).json({message: 'Notification does not exist'});
        }

        const updateNotify = await knex('notifications').where('notification_id',notifyId).update({
            is_read: true
        });

        res.status(204).json({message: 'Notification Updated'})

    }catch(err){
        console.error(err);
        res.status(500).json({message: 'An error occured while updating the notification data'})
    }
}

module.exports = {
    getNotifications,
    notificationUpdate
}