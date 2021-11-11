const express = require('express');
const app = express();
const http = require('http');
const axios = require('axios');
const mongoose = require('mongoose');
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
// const url = 'http://35.154.237.208:8080';
const url = 'http://localhost:8080';

io.on('connection', (socket) => {
	console.log('a user connected', socket.id);

	socket.on('create_room', async (object) => {
		let roomId = object.roomId;
		console.log(object.roomId, ' created room');
		object['socket_id'] = socket.id;
		object['roomId'] = roomId;
		rooms[object.roomId] = [ object ];

		//adding user in userSchema

		try {
			res = await axios.post(url + '/user/add', object);

			console.log('response of adding user =  ', res.data);
		} catch (err) {
			console.log('adding user err', err.message);
		}

		userInfo[socket.id] = object.roomId;
		users[socket.id] = object;

		hostofroom[roomId] = socket.id;
		socket.join(object.roomId);
		io.to(socket.id).emit('join_room_success', object);
		socket.to(object.roomId).emit('new_user', object);
	});

	socket.on('join_room', async (object) => {
		let roomId = object.roomId;
		console.log('joining roomid', roomId);
		let already_in = [];
		object['socket_id'] = socket.id;
		object['roomId'] = roomId;
		// if (rooms[roomId]) {
		// 	if (rooms[roomId].length != 0) {
		// 		already_in = rooms[roomId];
		// 	}
		// }

		//const res = await axios.get('https://httpbin.org/get', { params: { answer: 42 } });
		// axios
		// 	.get(url + '/user', { params: { roomId: roomId } })
		// 	.then((response) => {
		// 		already_in = response.data['users'];
		// 		console.log('rs of get user already_in', already_in);
		// 	})
		// 	.catch((err) => {
		// 		console.log('getting user err', err.message);
		// 	});
		try {
			res = await axios.get(url + '/user', { params: { roomId: roomId } });
			already_in = res.data.users;
			console.log('rs of get user already_in', res.data.users);
		} catch (err) {
			console.log('getting user err', err.message);
		}

		try {
			res = await axios.post(url + '/user/add', object);

			console.log('response of adding user =  ', res.data);
		} catch (err) {
			console.log('adding user err', err.message);
		}

		io.to(socket.id).emit('already_in_room', already_in);
		console.log(object.roomId, ' joined room');

		// if (rooms[object.roomId]) {
		// 	rooms[object.roomId].push(object);
		// } else {
		// 	console.log(object.roomId, ' created room');
		// 	object['socket_id'] = socket.id;
		// 	hostofroom[roomId] = socket.id;
		// 	rooms[object.roomId] = [ object ];
		// }
		// userInfo[socket.id] = object.roomId;
		// users[socket.id] = object;

		socket.join(object.roomId);
		io.to(socket.id).emit('join_room_success', object);
		socket.to(object.roomId).emit('new_user', object);
	});

	socket.on('get_connected_users', async (roomId) => {
		var clientsList = [];
		try {
			res = await axios.get(url + '/user', { params: { roomId: roomId } });
			clientsList = res.data.users;
			console.log('rs of get user already_in', res.data.users);
		} catch (err) {
			console.log('getting user err', err.message);
		}

		socket.emit('list_connected_users', clientsList);
	});

	socket.on('delete_room', (roomId) => {
		delete rooms[roomId];
	});

	socket.on('ask_to_speak', async (user) => {
		let roomId = user.roomId;
		let socket_id = user.socket_id;
		console.log('user adked to speak = ', socket_id);
		// hostid = String(hostofroom[rid]);
		let hostid = '';
		try {
			let res = await axios.get(url + '/user', { params: { roomId: roomId, role: 'host' } });
			console.log('host = ', res.data);
			hostid = res.data.users[0].socket_id;
		} catch (err) {
			console.log('getting host err', err);
		}

		let newSpeaker = '';
		try {
			let res = await axios.get(url + '/user', { params: { roomId: roomId, socket_id: socket_id } });
			console.log('nuw speaker = ', res.data);
			newSpeaker = res.data.users[0];
		} catch (err) {
			console.log('getting newspeaker err', err);
		}

		socket.to(hostid).emit('allow_speak', newSpeaker);
	});

	socket.on('permission', (user) => {
		console.log('permission asked =', user);

		socket.to(user.socket_id).emit('client_permission', user.value);
	});

	socket.on('role_changed', async (object) => {
		let roomId = object.roomId;
		let socket_id = object.socket_id;
		// for (let i of rooms[roomId]) {
		// 	if (i.socket_id == userId) {
		// 		i.role = 'speaker';
		// 	}
		// }
		try {
			let res = await axios.get(url + '/user/updateuser', {
				params: { roomId: roomId, socket_id: socket_id, role: 'speaker' }
			});
			console.log('nuw speaker = ', res.data);
			newSpeaker = res.data.users[0].socket_id;
		} catch (err) {
			console.log('getting newspeaker err', err);
		}

		socket.to(roomId).emit('user_changed', socket_id);
	});

	socket.on('remove_speaker', async (obj) => {
		console.log('remove speaker callded = ', obj.socket_id);
		let roomId = obj.roomId;
		let socket_id = obj.socket_id;
		let host = hostofroom[roomId];
		// console.log('host while rs = ', host);
		// for (let i of rooms[roomId]) {
		// 	if (i.socket_id === userId) {
		// 		i.role = 'audience';
		// 	}
		// }
		try {
			let res = await axios.post(url + '/user/updateuser', {
				params: { roomId: roomId, socket_id: socket_id, role: 'audience' }
			});
			console.log('nuw speaker = ', res.data);
			newSpeaker = res.data.users[0].socket_id;
		} catch (err) {
			console.log('getting newspeaker err', err);
		}

		io.to(roomId).emit('speaker_removed', socket_id);
	});

	socket.on('end_meeting', async (id) => {
		socket.to(id).emit('meeting_end', 'meeting had been ended');

		console.log('meeting ended id = ', rooms[id]);
		axios
			.post('http://35.154.237.208:8080/deleteliveroom', {
				channelName: id
			})
			.then(function(response) {
				console.log('response of deleting  room successful id =  ', id);
			})
			.catch(function(error) {
				console.log('deleting room err = ', error);
			});
		try {
			let res = await axios.post(url + '/user/remove', {
				roomId: id
			});
			console.log('ending meerting succesfull', res);
		} catch (err) {
			console.log('ending meeting err', err);
		}
	});

	socket.on('leave_assign', async (object) => {
		console.log('leave and assign called = ', object);
		// hostofroom[object.roomId] = object.socket_id;
		// let roomId = object.roomId;
		// let userId = object.socket_id;
		// for (let i of rooms[roomId]) {
		// 	if (i.socket_id == userId) {
		// 		i.role = 'host';
		// 	}
		// }
		let roomId = object.roomId;
		let hostid = '';
		let socket_id = object.socket_id;

		try {
			let res = await axios.get(url + '/user', { params: { roomId: roomId, role: 'host' } });
			console.log('host = ', res.data);
			hostid = res.data.users[0].socket_id;
		} catch (err) {
			console.log('getting host err', err);
		}
		try {
			let res = await axios.post(url + '/user/updateuser', {
				params: { roomId: roomId, socket_id: socket_id, role: 'host' }
			});
			console.log('nuw host = ', res.data);
		} catch (err) {
			console.log('getting newspeaker err', err);
		}
		let user = '';
		try {
			let res = await axios.get(url + '/user', { params: { socket_id: socket_id } });
			console.log('host = ', res.data);
			user = res.data.users[0];
		} catch (err) {
			console.log('getting host err', err);
		}

		// users[userId].role = 'host';
		socket.to(roomId).emit('host_changed', user);
		axios
			.post('http://35.154.237.208:8080/updateHost', {
				channelName: roomId,
				hostName: users[userId].userName,
				userId: users[userId].userId
			})
			.then(function(response) {
				console.log('response of changing host = ', response);
			})
			.catch(function(error) {
				console.log('host change error', error);
			});
	});

	socket.on('disconnect', async () => {
		console.log('user disconnect = ', socket.id);

		// let roomId = userInfo[socket.id];
		// let host = hostofroom[roomId];
		// console.log('roomid of disconnected user=', roomId);
		// if (roomId && host !== socket.id && rooms[roomId]) {
		// 	rooms[roomId] = rooms[roomId].filter((r) => r.socket_id != socket.id);
		// }
		// delete userInfo[socket.id];
		let socket_id = socket.id;

		let user = '';
		let roomId = '';
		try {
			let res = await axios.get(url + '/user', { params: { socket_id: socket_id } });
			console.log('user disconnected = ', res.data);
			user = res.data.users[0];
			if (user) roomId = res.data.users[0].roomId;
		} catch (err) {
			console.log('getting disconnet user err', err.message);
		}

		if (roomId) socket.to(roomId).emit('user_leave', user);

		try {
			let res = await axios.post(url + '/user/remove', {
				socket_id: socket_id
			});
			console.log('deleting user succesfull', res.data);
		} catch (err) {
			console.log('deleting user err', err.message);
		}
	});
});

server.listen(8000, () => {
	console.log('listening on = *:8000');
});
