const User = require('../../Model/userModel');
const NotificationModel = require('../../Model/Notification');
async function followernotification(followerid , followeeId) {
        const username = await User.findById(followerid).select('name');
        const message = `${username.name} started following you`;
        const newnotify = await NotificationModel.create({
          msg : message,
          userid :  followeeId, 
          sender : username._id
        })

}
module.exports = {followernotification};