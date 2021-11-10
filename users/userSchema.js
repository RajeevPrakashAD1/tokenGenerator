const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
	userName: String,
	channelName: String,
	profilePic: String,
	role: String,
	socket_id: String,
	roomId: String
});

const User = mongoose.model('User', UserSchema);
module.exports = User;
