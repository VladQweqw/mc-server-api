const { Router } = require('express')
const router = Router();

const multer = require('multer');
const upload = multer();

const usersController = require("../controller/usersController")

//post
router.get('/', upload.none(), usersController.get_user);
router.get('/all', upload.none(), usersController.get_all_users);

router.post('/request-access', upload.none(), usersController.request_access);
router.post('/change-state', upload.none(), usersController.change_state);
router.delete('/delete', upload.none(), usersController.delete_user);

router.post('/login', upload.none(), usersController.login);
router.post('/logout', upload.none(), usersController.logout);

module.exports = router;