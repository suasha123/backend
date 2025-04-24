const {followernotification} = require('./FollowerNoti');
const { unfollowernotification} = require('./unfollowernoti');
async function setNotification(type , data){
     try{
        if(type==="follow"){
           await followernotification(data.followerid , data.followeeId);
        }
        if(type==="unfollow"){
         await  unfollowernotification(data.followerid , data.followeeId);
        }
     }
     catch(err){

     }
}
module.exports = {setNotification};