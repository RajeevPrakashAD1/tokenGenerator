const express = require('express');

const router = express.Router();
const tokenController = require('../tokencontroller');
const roomController = require('./roomcontroller');

// token routes

router.route('/access_token').get(tokenController.nocache, tokenController.generateAcessToken);
router.route('/create_room').post(roomController.createRoom);
router.route('/liveroom').get(roomController.getLiveRoom);
router.route('/particular/liveroom').get(roomController.getParticularLiveRooms);

router.route('/scheduledroom').get(roomController.getScheduledRoom);
router.route('/particular/scheduledroom').get(roomController.getParticularScheduledRooms);
router.route('/deleteliveroom').post(roomController.delteLiveRoom);
router.route('/deletescheduledroom').post(roomController.delteScheduledRoom);

router.route('/updatehost').post(roomController.updateHost);
router.route('/').get(roomController.home);

module.exports = router;
