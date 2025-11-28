const { Router } = require('express')
const router = Router();

const multer = require('multer');
const upload = multer();

const adminController = require("../controller/adminController")

//post
router.post('/login', upload.none(), adminController.login);
router.post('/logout', upload.none(), adminController.logout);


module.exports = router;