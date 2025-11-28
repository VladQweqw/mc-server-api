const { Router } = require('express')
const router = Router();

const multer = require('multer');
const upload = multer();

const serverController = require("../controller/ServerController")

//post
router.post('/start', upload.none(), serverController.start);
router.post('/stop', upload.none(), serverController.stop);
router.post('/cli', upload.none(), serverController.cli);

module.exports = router;