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
		res.send({ _id: newRoom._id });
	} else {
		const newRoom = await LiveRoom.create(req.body);
		res.send({ _id: newRoom._id });

		// res.send({
		// 	status: 'sucess in live room',
		// 	data: {
		// 		room: newRoom
		// 	}
		// });
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

exports.delteLiveRoom = catchAsync(async (req, res, next) => {
	console.log('delte room request = ', req.body.channelName);
	const status = await LiveRoom.deleteOne({ channelName: req.body.channelName });
	res.send({ _id: req.body.channelName});
});


exports.delteScheduledRoom = catchAsync(async (req, res, next) => {
	const status = await ScheduledRoom.deleteOne({ _id: req.body._id });
	res.send({ _id: req.body._id });
});

// exports.getFilteredRoom = catchAsync(async (req, res, next) => {
//     let country = req.query.country;
//     let state = req.query.state;
//     let district = req.query.district;

//     const rooms = await LiveRoom.find({})
//                         .where('country').equals(country)
//                         .where('state').equals(state)
//                         .where('district').equals(district).exec(function(err,data){
//                             if(err){console.log(err);}
//                         else{res.send(rooms);res.status(200)}

//                 };
// subcategories
//         .find({})//grabs all subcategoris
//         .where('categoryId').ne([])//filter out the ones that don't have a category
//         .populate('categoryId')
//         .where('active').equals(true)
//         .where('display').equals(true)
//         .where('categoryId.active').equals(true)
//         .where('display').in('categoryId').equals(true)
//         .exec(function (err, data) {
//         if (err) {
//             console.log(err);
//             console.log('error returned');
//             res.send(500, { error: 'Failed insert' });
//         }

//         if (!data) {
//             res.send(403, { error: 'Authentication Failed' });
//         }

//         res.send(200, data);
//         console.log('success generate List');
//     });
