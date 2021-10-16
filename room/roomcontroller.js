const mongoose = require('mongoose');

const Room = require('./roomschema');

const catchAsync = (fn) => {
	return (req, res, next) => {
		fn(req, res, next).catch((err) => next(err));
	};
};

exports.createRoom = catchAsync(async (req, res, next) => {
	const newRoom = await Room.create(req.body);
	res.send({
		status: 'sucess',
		data: {
			room: newRoom
		}
	});

	// res.status(201).jason({
	// 	status: 'success',
	// 	data: {
	// 		pokemon: newPokemon
	// 	}
	// });
});

exports.getAllRoom = catchAsync(async (req, res, next) => {
	const rooms = await Room.find();
	res.send({
		status: 'sucess',
		length: rooms.length,
		data: {
			rooms
		}
	});
	res.status(200);
});
