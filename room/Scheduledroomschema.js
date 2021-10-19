const mongoose = require('mongoose');

const ScheduledRoomSchema = new mongoose.Schema({
	channelName: {
		type: String,
		required: true
	},

	category: { type: String, required: true },
	groupId: { type: String, required: true },
	userId: { type: String, required: true },
	groupName: { type: String, required: true },
	description: String,
	speakerCount: Number,
	listenerCount: Number,
	hostName: String,
	scheduled: Boolean,
	scheduledTime: { type: String, required: true },
	type: String,
	state: String,
	district: String,
	block: String,
	panchayat: String,
	village: String
});

const ScheduledRoom = mongoose.model('ScheduledRoom', ScheduledRoomSchema);

module.exports = ScheduledRoom;