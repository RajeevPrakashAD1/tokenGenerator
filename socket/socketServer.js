const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);

const io = require('socket.io')(server);
io.origins((_, callback) => {
	callback(null, true);
});

// const io = require('socket.io')(8000);
let rooms = {};
let userInfo = {};
let hostofroom = {};
let users = {};

io.on('connection', (socket) => {
	console.log('a user connected', socket.id);

	socket.on('create_room', (object) => {
		let roomId = object.roomId;
		console.log(object.roomId, ' created room');
		object['socket_id'] = socket.id;
		rooms[object.roomId] = [ object ];
		userInfo[socket.id] = object.roomId;
		users[socket.id] = object;

		hostofroom[roomId] = socket.id;
		socket.join(object.roomId);
		io.to(socket.id).emit('join_room_success', object);
		socket.to(object.roomId).emit('new_user', object);
	});

	socket.on('join_room', (object) => {
		let roomId = object.roomId;
		io.to(socket.id).emit('already_in_room', rooms[roomId]);
		console.log(object.roomId, ' joined room');
		object['socket_id'] = socket.id;

		if (rooms[object.roomId]) {
			rooms[object.roomId].push(object);
		} else {
			console.log(object.roomId, ' created room');
			object['socket_id'] = socket.id;
			hostofroom[roomId] = socket.id;
			rooms[object.roomId] = [ object ];
		}
		userInfo[socket.id] = object.roomId;
		users[socket.id] = object;
		socket.join(object.roomId);
		io.to(socket.id).emit('join_room_success', object);
		socket.to(object.roomId).emit('new_user', object);
	});

	socket.on('get_connected_users', (roomId) => {
		var clientsList = rooms[roomId];

		socket.emit('list_connected_users', clientsList);
	});

	socket.on('delete_room', (roomId) => {
		delete rooms[roomId];
	});

	socket.on('ask_to_speak', (user) => {
		let rid = user.roomId;
		let sid = user.socket_id;
		console.log('user adked to speak = ', sid);
		hostid = String(hostofroom[rid]);
		let newSpeaker = users[sid];

		socket.to(hostid).emit('allow_speak', newSpeaker);
	});

	socket.on('permission', (user) => {
		console.log('permission asked =', user);

		socket.to(user.socket_id).emit('client_permission', user.value);
		socket.to(socket.id).emit('client_permission', user.value);
	});

	socket.on('role_changed', (object) => {
		let roomId = object.roomId;
		let userId = object.socket_id;
		for (let i of rooms[roomId]) {
			if (i.socket_id == userId) {
				i.role = 'speaker';
			}
		}

		io.to(roomId).emit('user_changed', userId);
	});

	socket.on('end_meeting', (id) => {
		socket.to(id).emit('meeting_end', 'meeting had been ended');
		console.log('meeting ended id = ', rooms[id]);
		delete rooms[id];
	});
	socket.on('disconnect', () => {
		console.log('user disconnect = ', socket.id);
		let rid = userInfo[socket.id];
		if (rooms[rid]) rooms[rid] = rooms[rid].filter((item) => item.socket_id !== socket.id);
		delete userInfo[socket.id];
		let user = users[socket.id];
		console.log('user disconnexted id = ', socket.id);

		let roomId = users[socket.id];
		io.to(roomId).emit('user_leave', user);
		io.emit('user_leave', user);
		socket.to(roomId).emit('user_leave', user);
	});
});

setInterval(() => {
	console.log('rooms= ', rooms);
	console.log('userInfo= ', userInfo);
	console.log('.............................');
}, 30 * 1000);
// module.exports = server;

server.listen(8000, () => {
	console.log('listening on = *:8000');
});
