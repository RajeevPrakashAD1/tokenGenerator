const mongoose = require('mongoose');
const ScheduledRoom = require('./room/Scheduledroomschema');
const LiveRoom = require('./room/liveroomschema');

const checkScheduledMeetings = async (req, res, next) => {
	// console.log('aya');
	// console.log(Date());

	let cd = new Date();
	console.log(cd, '=cd');
	let hr = cd.getHours() + 5;
	let min = cd.getMinutes() + 30;

	if (hr > 24) hr = hr - 24;
	if (min > 60) {
		hr += 1;
		min = min - 60;
	}

	hr = hr.toString();
	min = min.toString();
	if (hr.length < 2) hr = '0' + hr;
	if (min.length < 2) min = '0' + min;
	const time = hr + ':' + min;
	console.log(time);
	const smt = await ScheduledRoom.find({ scheduledTime: time }).exec();
	console.log('smt', smt);
	for (let j of smt) {
		// const no = { ...j };
		// delete no['_id'];
		// delete no['__v'];
		// console.log(' no = ', no);
		j.scheduled = true;
		LiveRoom.insertMany([ j ])
			.then(
				ScheduledRoom.deleteOne({ _id: j._id })
					.then(console.log('delted from schedule and inserted successfully'))
					.catch((err) => {
						console.log('delete err', err);
					})
			)
			.catch((err) => console.log('transfer err', err));
	}
};

module.exports = checkScheduledMeetings;
