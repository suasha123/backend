
const User = require("../Model/userModel");

const uploadProfilePic = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }

        const userId = req.params.userId;
        const fileurl = req.file.path; 
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { profilepic : fileurl },
            { new: true } 
        );

        if (!updatedUser) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({
            message: "Upload successful"
        });
    } catch (error) {
        res.status(500).json({ message: "Upload failed", error: error.message });
    }
};

module.exports = { uploadProfilePic };
