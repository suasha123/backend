const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDb = require("./Model/db");
const path = require("path");
const authRoute = require("./Router/auth");
const uploadRoute = require("./Router/upload");
const BioRouter = require("./Router/bio");
const PostModel = require("./Model/Post");
const User = require("./Model/userModel");
const CommentModel = require("./Model/Comment");
const {setNotification} = require('./controllers/NotificationControllers/CentralNotification');
const NotificationModel = require("./Model/Notification");
dotenv.config();
const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

const PORT = process.env.PORT;
app.get('/search/:query', async (req, res) => {
  try {
    const { query } = req.params;
    const {page} = req.query;
    const regexQuery = { $regex: query, $options: 'i' };

    const users = await User.find({ name: regexQuery }).select('name profilepic').skip((Number(page)-1)*10).limit(10);
    const posts = await PostModel.find({ title: regexQuery }).select('title , image').skip((Number(page)-1)*10).limit(10);

    res.status(200).json({ users, posts });
  } catch (err) {
    console.error("Server error:", err.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.put('/marknotiOff/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    await NotificationModel.updateMany(
      { userid: userId, read: false },
      { $set: { read: true } }
    );
    res.status(200).json({ msg: "Notifications marked as read" });
  } catch (err) {
    res.status(500).json({ msg: "Error Occurred" });
  }
});
app.get("/notifications/unread-count/:id", async (req, res) => {
  try {
    const unreadCount = await NotificationModel.countDocuments({
      userid: req.params.id,
      read: false,  
    });
    res.status(200).json({ unreadCount });
  } catch (err) {
    res.status(500).json({ message: "Error fetching unread notification count" });
  }
});

app.get("/notifications/user/:id", async (req, res) => {
  try {
    const notifications = await NotificationModel.find({ userid: req.params.id })
      .sort({ createdAt: -1 }); 
    res.status(200).json(notifications);

  } catch (err) {
    res.status(500).json({ message: "Error fetching notifications" });
  }
});
app.get("/lists", async (req, res) => {
  try {
    const { data, userid } = req.query;
    const userslist = await User.findById(userid).populate(
      data,
      "name profilepic"
    );
    const final = userslist[data];
    if (!userslist) {
      return res.status(404).json({ msg: "User not found" });
    }
    return res.status(200).json({ final });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ msg: "Error fetching details" });
  }
});
app.get("/getfollowingstatus", async (req, res) => {
  const { followerid, followeeId } = req.query;
  try {
    const Userserach = await User.findById(followerid);
    const isFollowing = Userserach.following.includes(followeeId);
    return res.status(200).json({ isFollowing });
  } catch (err) {
    return res.status(500).json({ msg: "Not able to fetch details" });
  }
});
app.put("/updatefollower", async (req, res) => {
  const { followerid, followeeId, update } = req.query;

  try {
    if (update === "1") {
      await User.findByIdAndUpdate(followerid, {
        $addToSet: { following: followeeId },
      });
      await User.findByIdAndUpdate(followeeId, {
        $addToSet: { followers: followerid },
      });
        await setNotification("follow" , {followerid, followeeId}); 
    } else if (update === "-1") {
      await User.findByIdAndUpdate(followerid, {
        $pull: { following: followeeId },
      });
      await User.findByIdAndUpdate(followeeId, {
        $pull: { followers: followerid },
      });
      await setNotification("unfollow" , {followerid, followeeId});
    }
    res.status(200).json({ msg: "Follower count updated" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Error updating follower count." });
  }
});
app.get("/userprofile/info/:userid", async (req, res) => {
  try {
    const userid = req.params.userid;
    const userinfo = await User.findById(userid);
    if (!userinfo) {
      return res.status(404).json({ msg: "User not found" });
    }
    res.status(200).json({
      userinfo,
      followerslength: userinfo.followers.length,
      followinglength: userinfo.following.length,
    });
  } catch (err) {
    res.status(500).json({ msg: "Error Fetching data" });
  }
});
app.get("/p/:userid", async (req, res) => {
  try {
    const posts = await PostModel.find(
      { author: req.params.userid },
      "title image"
    );

    if (!posts || posts.length === 0) {
      return res.status(404).json({ msg: "No posts found" });
    }

    res.json({ posts });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});
app.post("/post/comment", async (req, res) => {
  try {
    const { postFetch, curruserid, comment } = req.body;

    const newComment = await CommentModel.create({
      comment,
      author: curruserid,
    });

    await PostModel.findByIdAndUpdate(postFetch, {
      $push: { comments: newComment._id },
    });

    res.status(201).json({ success: true, comment: newComment });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to post comment" });
  }
});

app.get("/posts/:id", async (req, res) => {
  try {
    const post = await PostModel.findById(req.params.id)
      .populate("author", "name profilepic")
      .populate({
        path: "comments",
        populate: {
          path: "author",
          model: "User",
          select: "name profilepic",
        },
      });

    if (!post) return res.status(404).json({ msg: "Post not found" });

    res.json({ post });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});
app.put("/postlike/", async (req, res) => {
  try {
    const { user, postId, like } = req.query;
    if(!user || !postId || !like){
      return res.status(400).json({message : "Unable to process request"});
    }
    if (like === "1") {
      await PostModel.findByIdAndUpdate(postId, {
        $addToSet: { likes: user },
      });
    }

    if (like === "-1") {
      await PostModel.findByIdAndUpdate(postId, {
        $pull: { likes: user },
      });
    }

    const updatedPost = await PostModel.findById(postId);
    return res.status(200).json({
      message: like === "1" ? "Post liked" : "Post unliked"
    });
  } catch (err) {
    res.status(500).json({ message: "Internal Server Error" });
  }
});

app.get("/allposts", async (req, res) => {
  try {
    const { userid, c } = req.query;

    let posts;

    if (c) {
      posts = await PostModel.find({ category: c })
        .select("title image author")
        .populate("author", "name profilepic");

      if (!posts) {
        return res.status(400).json({ msg: "Error fetching Posts" });
      }
      return res.status(200).json({ posts });
    }

    if (!userid) {
      posts = await PostModel.find()
        .select("title image author")
        .populate("author", "name profilepic");

      if (!posts) {
        return res.status(400).json({ msg: "Error fetching Posts" });
      }
      return res.status(200).json({ posts });
    } else {
      posts = await PostModel.find({ author: userid })
        .select("title image author")
        .populate("author", "name profilepic");

      if (!posts) {
        return res.status(400).json({ msg: "Error fetching Posts" });
      }
      return res.status(200).json({ posts });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ msg: "Error fetching posts" });
  }
});

app.use(express.static(path.join(__dirname, "../Frontend/dist")));
app.get("*", (req, res) => {
  res.sendFile(path.resolve(__dirname, "../Frontend/dist", "index.html"));
});
app.use("/auth", authRoute);
app.use("/uploadpic", uploadRoute);
app.use("/changebio", BioRouter);

app.listen(PORT, () => {
  console.log(path.join(__dirname));
  connectDb();
  console.log(`Server is running on port... ${PORT}`);
});
