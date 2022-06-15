const express = require('express');

const router = express.Router();
const otpCtrl = require('./otpCtrl');

// token routes

router.post('/otp', otpCtrl.sendOtp);
router.post('/otp/verify', otpCtrl.verifyOtp);

module.exports = router;
