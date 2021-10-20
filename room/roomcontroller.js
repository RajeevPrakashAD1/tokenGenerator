const mongoose = require('mongoose');

const LiveRoom = require('./liveroomschema.js');
const ScheduledRoom = require('./Scheduledroomschema.js');

const catchAsync = (fn) => {
	return (req, res, next) => {
		fn(req, res, next).catch((err) => next(err));
	};
};

exports.createRoom = catchAsync(async (req, res, next) => {
	console.log('date time', req.body.scheduledTime);
	if (req.body.scheduledTime && req.body.scheduledTime != '') {
		let time = req.body.scheduledTime;
		req.body.scheduledTimeWithFormat = req.body.scheduledTime;
		time = String(time);
		time = time.split(' ')[1].substring(0, 5);
		req.body.scheduledTime = time;

		// let date = new Date(req.body.scheduledTime);
		// console.log('date: ' + date);
		// date = date.toISOString();
		// let datestring = req.body.scheduledTime;
		// let date = new Date(datestring).toISOString();

		// console.log(req.body, 'bsy requested');
	}

	if (req.body.scheduled == 'true') {
		const newRoom = await ScheduledRoom.create(req.body);
		res.send({
			status: 'sucessfully added in scheduled room',
			data: {
				room: newRoom
			}
		});
	} else {
		const newRoom = await LiveRoom.create(req.body);
		res.send({
			status: 'sucess in live room',
			data: {
				room: newRoom
			}
		});
	}

	// res.status(201).jason({
	// 	status: 'success',
	// 	data: {
	// 		pokemon: newPokemon
	// 	}
	// });
});

exports.getLiveRoom = catchAsync(async (req, res, next) => {
	const rooms = await LiveRoom.find();
	res.send({
		status: 'sucess',
		length: rooms.length,
		data: {
			rooms
		}
	});
	res.status(200);
});

exports.getScheduledRoom = catchAsync(async (req, res, next) => {
	const rooms = await ScheduledRoom.find();
	res.send({
		status: 'sucess',
		length: rooms.length,
		data: {
			rooms
		}
	});
	res.status(200);
});
