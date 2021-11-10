const mongoose = require('mongoose');
const User = require('../users/userSchema');

const RoomsInfoSchema = new mongoose.Schema({
	roomId: [
		{
			userName: String,
			channelName: String,
			profilePic: String,
			role: String,
			socket_id: String
		}
	]
});

const RoomsInfo = mongoose.model('RoomsInfo', RoomsInfoSchema);

module.exports = RoomsInfo;

// topic:room1,
// category:dkfkd,
// speakerCount:2
