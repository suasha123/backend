const mongoose = require("mongoose");
const NotificationSchema = new mongoose.Schema(
  {
    msg: {
      type: String,
      required: true,
      trim: true,
    },
    userid: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    sender : {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    read : {
      type : Boolean,
      required : true,
      default : false,
    }
  },
  
  { timestamps: true }
);

const NotificationModel = mongoose.model(
  "NotificationModel",
  NotificationSchema
);
module.exports = NotificationModel;
