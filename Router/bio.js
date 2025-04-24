const express = require('express');
const router = express.Router();
const {changeBio} = require('../controllers/bioupdateController');
router.post('/update/:userId',changeBio);
module.exports=router;
