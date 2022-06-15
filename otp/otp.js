const mongoose = require('mongoose');

const OtpSchema = new mongoose.Schema({
	userId: String,
	sessionKey: String,
	otpAttempCount: { type: Number, default: 0 }
});

const Otp = mongoose.model('Otp', OtpSchema);
module.exports = Otp;
