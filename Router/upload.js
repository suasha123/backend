require('dotenv').config(); 
const express = require("express");
const router = express.Router();
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../Config/cloudinary");
const { uploadProfilePic } = require("../controllers/uploadcontroller");
const { UploadPost } = require("../controllers/PostUploadController");
{
  /*const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, "../public/uploads"));
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        cb(null, Date.now() + ext);
    }
});*/
}
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "uploads",
    allowed_formats: ["jpg", "png", "jpeg"],
  },
});
const upload = multer({ storage });
router.post("/uploadData/:userId", upload.single("image"), UploadPost);
router.post(
  "/upload-img/:userId",
  upload.single("profilePic"),
  uploadProfilePic
);

module.exports = router;
