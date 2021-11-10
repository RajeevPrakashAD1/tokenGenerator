const mongoose = require('mongoose');

const RoomsInfo = require('./rooms_info_schema.js');

const catchAsync = (fn) => {
	return (req, res, next) => {
		fn(req, res, next).catch((err) => next(err));
	};
};

exports.addUserInRoom = catchAsync(async (req, res) => {
	const user = RoomsInfo.findOneAndUpdate(
		{ roomId: req.body.roomId },
		{ $push: { roomId: req.body } },
		{ upsert: true }
	);
	res.status(200).send({ user: user });
});

exports.removeUserInRoom = catchAsync(async (req, res) => {
	const removeUser = await User.deleteOne({ roomId: req.body.roomId });
	res.status(200).send({ removeUser: removeUser });
});
