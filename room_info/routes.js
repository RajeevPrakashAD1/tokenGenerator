const express = require('express');

const router = express.Router();
const roomInforCtrl = require('./controller.js');

// token routes

router.route('/roomInfo/delete').post(roomInforCtrl.removeUserInRoom);
router.post('/roomInfo/add', roomInforCtrl.addUserInRoom);

module.exports = router;
