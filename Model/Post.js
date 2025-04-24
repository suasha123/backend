const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema({
  title: { type: String, required: true },
  category: { type: String, required: true },
  content: { type: String, required: true },
  image: { type: String, required: true },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  comments: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CommentModel'
    }
  ],
  likes :[
    {
      type : mongoose.Schema.Types.ObjectId,
      ref:'User'
    }
  ]
}, { timestamps: true });

const PostModel = mongoose.model("Post", PostSchema);
module.exports = PostModel;
