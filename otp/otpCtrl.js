const mongoose = require('mongoose');

const Otp = require('./otp.js');
const axios = require('axios');

const API_KEY = '996d4061-1269-11e9-a895-0200cd936042';

const catchAsync = (fn) => {
	return (req, res, next) => {
		fn(req, res, next).catch((err) => next(err));
	};
};

exports.sendOtp = catchAsync(async (req, res) => {
	url = `https://2factor.in/API/V1/${API_KEY}/SMS/+91${req.body.phone_number}/AUTOGEN`;

	// const response = {
	// 	data: {
	// 		Status: 'Success',
	// 		Details: 'kjkakdafjkjadfklsjkldafs'
	// 	}
	// };
	try {
		response = await axios.post(url);

		console.log('response of otp sending =  ', response.data);
	} catch (err) {
		console.log('otp sending ..', err.message);
	}

	if (response.data.Status == 'Success') {
		try {
			User = await Otp.find({ userId: req.body.userId });
			console.log('otp finding user.....', User);
		} catch (err) {
			console.log('err in finding otp user', err);
		}

		if (User.length == 0) {
			try {
				const otpUser = await Otp.create({
					userId: req.body.userId,
					sessionKey: response.data.Details,
					otpAttempCount: 0
				});
				console.log('otp user created ', otpUser);
			} catch (err) {
				console.log('otp user sending', err.message);
			}
		} else {
			try {
				const otpUser = await Otp.findOneAndUpdate(
					{ userId: req.body.userId },
					{ sessionKey: response.data.Details }
				);
				console.log('otp user updated', otpUser);
			} catch (err) {
				console.log('otp user update sending', err.message);
			}
		}

		res.send({ status: 'Succesfully send' });
	} else {
		res.send({ status: 'Error' });
	}
});

exports.verifyOtp = catchAsync(async (req, res) => {
	console.log('reqbody = ', req.body);
	let sessionKey = '';
	let userId = '';
	let aoc = 0;

	try {
		let User = await Otp.findOne({ userId: req.body.userId });
		if (!User) {
			res.send({ status: 'fail', message: 'no such user tried to login' });
			return;
		} else {
			sessionKey = User.sessionKey;
			userId = User.userId;
			aoc = User.otpAttempCount + 1;
			console.log('user find', User);
		}
	} catch (err) {
		console.log('err in finding otp user', err);
	}
	console.log('session key = ', sessionKey);
	url = `https://2factor.in/API/V1/${API_KEY}/SMS/VERIFY/${sessionKey}/${req.body.otp}`;
	let response = {
		data: {
			Status: 'Success',
			Details: 'not Matched'
		}
	};

	try {
		response = await axios.post(url);

		console.log('response of verify otp sending =  ', response.data);
	} catch (err) {
		console.log(' verify otp err', err.message);
	}

	if (response.data.Details == 'OTP Matched') {
		try {
			const countRes = await Otp.findOneAndUpdate({ userId: req.body.userId }, { otpAttempCount: 0 });
			console.log('otp attemp inc', countRes);
		} catch (err) {
			console.log('otp count+ err', err);
		}
		res.send({ status: 'Succesfully Matched' });
	} else {
		try {
			const countRes = await Otp.findOneAndUpdate({ userId: req.body.userId }, { otpAttempCount: aoc });
			console.log('otp attemp inc', countRes);
		} catch (err) {
			console.log('otp count+ err', err);
		}
		res.send({ status: 'Not Matched' });
	}
});
