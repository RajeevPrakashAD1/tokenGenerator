const express = require('express');

const router = express.Router();
const tokenController = require('./tokencontroller');
const roomController = require('./room/roomcontroller');

// token routes

router.route('/access_token').get(tokenController.nocache, tokenController.generateAcessToken);
router.route('/create_room').post(roomController.createRoom).get(roomController.getAllRoom);

module.exports = router;
