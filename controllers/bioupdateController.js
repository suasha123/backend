const { Console } = require('console');
const User = require('../Model/userModel');

const changeBio = async (req, res) => {
  try {
    const userId = req.params.userId;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { bio: req.body.bio },
      { new: true }
    );
 
    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "Bio updated", user: updatedUser });
  } catch (err) {
    console.error("Error updating bio:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};
module.exports={changeBio};