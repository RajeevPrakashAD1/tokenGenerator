const mongoose = require('mongoose');

const RoomSchema = new mongoose.Schema({
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
	scheduleTime: String,
	roomId: Number
});

const Room = mongoose.model('Room', RoomSchema);

module.exports = Room;

// topic:room1,
// category:dkfkd,
// speakerCount:2
