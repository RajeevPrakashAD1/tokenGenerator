const mongoose = require('mongoose');

const LiveRoomSchema = new mongoose.Schema({
	channelName: {
		type: String,
		required: true
	},
    topic:String,
	category: { type: String, required: true },
	groupId: { type: String, required: true },
	userId: { type: String, required: true },
	groupName: { type: String, required: true },
	description: String,
	speakerCount: Number,
	listenerCount: Number,
	hostName: String,
	scheduled: { type: String, required: true },
	scheduledTime: String,
	scheduledTimeWithFormat: String,
	type: String,
	state: String,
	district: String,
	block: String,
	panchayat: String,
	village: String
});

const LiveRoom = mongoose.model('LiveRoom', LiveRoomSchema);

module.exports = LiveRoom;

// topic:room1,
// category:dkfkd,
// speakerCount:2
