const mongoose = require('mongoose');

const LiveRoomSchema = new mongoose.Schema({
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
	scheduledTime: String,
	
});

const LiveRoom = mongoose.model('LiveRoom', LiveRoomSchema);

module.exports = LiveRoom;

// topic:room1,
// category:dkfkd,
// speakerCount:2
