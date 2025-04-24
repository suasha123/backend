const User = require('../../Model/userModel');
const NotificationModel = require('../../Model/Notification');

async function unfollowernotification(followerId, followeeId) {
    try {
        const user = await User.findById(followerId).select('name');
        const message = `${user.name} started following you`;

        const notification = await NotificationModel.findOne({
            userid: followeeId,
            msg: message
        });

        if (notification) {
            await notification.deleteOne(); 
        }
    } catch (err) {
        console.error("Error clearing follow notification:", err);
    }
}

module.exports = { unfollowernotification };
