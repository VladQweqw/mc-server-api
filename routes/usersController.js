const { Router } = require('express')
const router = Router();

const multer = require('multer');
const upload = multer();

const usersController = require("../controller/usersController")

//post
router.post('/request-access', upload.none(), usersController.request_access);
router.get('/', upload.none(), usersController.get_user);
router.post('/change-state', upload.none(), usersController.change_state);
router.post('/delete', upload.none(), usersController.delete_user);

module.exports = router;