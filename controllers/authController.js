const dotenv = require("dotenv");
dotenv.config();
const User = require("../Model/userModel");
const argon2 = require("argon2");
const nodemailer = require('nodemailer');
const otpStore = new Map();
const jwt = require("jsonwebtoken");
const { configDotenv } = require("dotenv");
function validEmail(email){
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
}


const transport = nodemailer.createTransport({
        service: "gmail",
        auth : {
            user : "suryaprataps471@gmail.com",
            pass : process.env.GooglePass
        }
});

const userLogin = async (req, res) => {
  try {
      const { email, password} = req.body;
      const userExists = await User.findOne({ email });
      if (!userExists) {
          return res.status(400).json({ msg: "User doesn't exist" });
      }
      const isMatch = await argon2.verify(userExists.password , password);
      if (!isMatch) {
          return res.status(400).json({ msg: "Wrong Password" });
      }
      const token = jwt.sign(
        { id: userExists.id }, 
        process.env.JWT_SECRET, 
        { expiresIn: "1h" }
      );
      return res.status(200).json({ token , msg: "User signed in"  , name : userExists.name , email : userExists.email , id : userExists.id , pic : userExists.profilepic , bio : userExists.bio , postcount : userExists.postCount});

  } catch (error) {
      res.status(500).json({ msg: "Internal Server Error" });
  }
};


const sendOtp = async(req , res) =>{
  const {email} = req.body;
  if(!email){
   return   res.status(400).json({msg : "Email is required"});
  }
   const gotp = Math.floor(100000 + Math.random() * 900000);
   const expiresAt = Date.now() + 5 * 60 * 1000;
   otpStore.set(email  , {gotp , expiresAt});
  
  const mailOptions = {
      from : "suryaprataps471@gmail.com",
      to : email,
      subject : "Email verification",
      text : `Your otp code is ${gotp}`
  };
  try{
      await transport.sendMail(mailOptions);
      
      res.status(200).json({msg : "OTP sent successfully"});
 }
 catch(err){
      res.status(500).json({msg : "failed to send otp"});
 }

}
  const userCreate = async (req ,  res)=>{
      try{
          const {name ,  email , password , otp} =  req.body;
          const userExists = await User.findOne({email});
          const otpData = otpStore.get(email);
          if(otpData.gotp !== Number(otp)){
            console.log(otpData.gotp);
            console.log(otp);
            return res.status(400).json({msg : "Wrong OTP"});
          }
          if(otpData.expiresAt< Date.now()){
            return res.status(400).json({msg : "OTP expired"});
          }
          if(userExists){
            return res.status(400).json({msg : "User Aleady exists"});
          }
          if(!validEmail(email)){
            return res.status(400).json({msg : "Invalid Email"});
          }
          let hash;
        try {
            hash = await argon2.hash(password);
        } catch (hashError) {
            return res.status(500).json({ msg: "Error Occurred During Password Hashing" });
        }
          const newUser = await User.create({
             name : name,
             email : email,
             password : hash,
          })
          return res.status(200).json({msg : `Use Registerd...`});
        }
        catch(err){
            console.log(err);
             res.status(500).json({msg : "Error Occured..."});
        }
  }


  const tokenverify = async (req,res)=>{
        try{
          const token = req.headers.authorization?.split(" ")[1];
          if (!token) {
            return res.status(401).json({ success: false, message: "Token required" });
          }
          const decoded = jwt.verify(token, process.env.JWT_SECRET);
          const userId = decoded.id; 
          const user = await User.findById(userId);
          if(!user){
            return res.status(404).json({ success: false, message: "User not found" });
          }
          res.status(200).json({ success: true, name : user.name , email : user.email , id : user.id , pic : user.profilepic , bio : user.bio , postcount : user.postCount});

        }
        catch(err){
          res.status(401).json({ success: false, message: "Invalid or expired token" });
        }
        
  }
  module.exports = {userLogin , userCreate,sendOtp, tokenverify};