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

io.on('connection', (socket) => {
	console.log('a user connected', socket.id);

	socket.on('create_room', (object) => {
		let roomId = object.roomId;
		console.log(object.roomId, ' created room');
		object['socket_id'] = socket.id;
		rooms[object.roomId] = [ object ];
		userInfo[socket.id] = object.roomId;

		hostofroom[roomId] = socket.id;
		socket.join(object.roomId);
		socket.to(object.roomId).emit('new_user', object);
	});

	socket.on('join_room', (object) => {
		let roomId = object.roomId;

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
		socket.join(object.roomId);
		socket.to(object.roomId).emit('new_user', object);
	});

	socket.on('get_connected_users', (roomId) => {
		var clientsList = rooms[roomId];
		console.log('/////////', clientsList, '//////', roomId);
		socket.emit('list_connected_users', clientsList);
	});

	socket.on('delete_room', (roomId) => {
		delete rooms[roomId];
	});

	socket.on('ask_to_speak', (user) => {
		let rid = user.roomId;
		let sid = user.socket_id;
		hostid = String(hostofroom[rid]);
		console.log('host id = ', hostid);

		socket.to(hostid).emit('allow_speak', user);
	});

	socket.on('permission', (user) => {
		console.log('pe usert', user);
		socket.to(user.socket_id).emit('client_permission', user.value);
	});

	socket.on('disconnect', () => {
		let rid = userInfo[socket.id];
		if (rooms[rid]) rooms[rid] = rooms[rid].filter((item) => item.socket_id !== socket.id);
		delete userInfo[socket.id];

		console.log('user disconnect', socket.id);
	});
});

setInterval(() => {
	console.log('rooms= ', rooms);
	console.log('userInfo= ', userInfo);
	console.log('.............................');
}, 10 * 1000);
// module.exports = server;

server.listen(8000, () => {
	console.log('listening on *:8000');
});
