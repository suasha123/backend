const mongoose = require('mongoose');
async function connectDb() {
    try {
        await mongoose.connect(process.env.MONGOURL);
        console.log("Database Connected");
    } catch (err) {
        console.log("Error connecting Database:", err.message);
        process.exit(1);
    }
}

module.exports = connectDb;
