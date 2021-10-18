const mongoose = require('mongoose');

const ScheduledRoomSchema = new mongoose.Schema({
	topic: {
		type: String,
		required: true
	},

	category: String,
	decription: Number,
	speakerCount: Number,
	listenerCount: Number,
	hostName: String,
	scheduled: Boolean,
	scheduledTime: String
});

const ScheduledRoom = mongoose.model('ScheduledRoom', ScheduledRoomSchema);

module.exports = ScheduledRoom;
