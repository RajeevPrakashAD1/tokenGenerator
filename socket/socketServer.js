const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);

const io = require('socket.io')(server, { origins: [ 'http://localhost:3000', 'http://localhost:30001' ] });

// const io = require('socket.io')(8000);
let rooms = {};
let userInfo = {};

io.on('connection', (socket) => {
	console.log('a user connected', socket.id);

	socket.on('create_room', (object) => {
		console.log(object.roomId, ' created room');
		object['socket_id'] = socket.id;
		rooms[object.roomId] = [ object ];
		userInfo[socket.id] = object.roomId;

		socket.join(object.roomId);
	});

	socket.on('join_room', (object) => {
		console.log(object.roomId, ' joined room');
		object['socket_id'] = socket.id;

		if (rooms[object.roomId]) {
			rooms[object.roomId].push(object);
		} else {
			console.log(object.roomId, ' created room');
			object['socket_id'] = socket.id;
			rooms[object.roomId] = [ object ];
		}
		userInfo[socket.id] = object.roomId;
		socket.join(object.roomId);
	});

	socket.on('get_connected_users', (roomId) => {
		var clientsList = rooms[roomId];
		console.log('/////////', clientsList, '//////', roomId);
		socket.emit('list_connected_users', clientsList);
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
