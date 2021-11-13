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

const url = 'http://35.154.237.208:8080';

io.on('connection', (socket) => {
	console.log('a user connected', socket.id);

	socket.on('create_room', async (object) => {
		let roomId = object.roomId;
		console.log(object.roomId, ' created room');
		object['socket_id'] = socket.id;
		object['roomId'] = roomId;

		try {
			res = await axios.post(url + '/user/add', object);

			console.log('response of adding user =  ', res.data);
		} catch (err) {
			console.log('adding user err', err.message);
		}

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

	socket.on('permission', async (user) => {
		console.log('permission asked =', user);

		socket.to(user.socket_id).emit('client_permission', user.value);
	});

	socket.on('role_changed', async (object) => {
		console.log('role chaged asked = ', object);
		let roomId = object.roomId;
		let socket_id = object.socket_id;

		try {
			let res = await axios.post(url + '/user/updateuser', {
				roomId: roomId,
				socket_id: socket_id,
				role: 'speaker'
			});
			console.log('new speaker = ', res.data);
		} catch (err) {
			console.log('getting newspeaker err', err);
		}

		socket.to(roomId).emit('user_changed', socket_id);
	});

	socket.on('remove_speaker', async (obj) => {
		console.log('remove speaker callded = ', obj.socket_id);
		let roomId = obj.roomId;
		let socket_id = obj.socket_id;

		try {
			let res = await axios.post(url + '/user/updateuser', {
				roomId: roomId,
				socket_id: socket_id,
				role: 'audience'
			});
			console.log('nuw speaker = ', res.data);
		} catch (err) {
			console.log('getting newspeaker err', err);
		}

		io.to(roomId).emit('speaker_removed', socket_id);
	});

	socket.on('end_meeting', async (id) => {
		socket.to(id).emit('meeting_end', 'meeting had been ended');

		console.log('meeting ended id = ', id);
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
			console.log('ending meerting succesfull', res.data);
		} catch (err) {
			console.log('ending meeting err', err);
		}
	});

	socket.on('leave_assign', async (object) => {
		console.log('leave and assign called = ', object);

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
				roomId: roomId,
				socket_id: socket_id,
				role: 'host'
			});
			console.log('nuw host = ', res.data);
		} catch (err) {
			console.log('getting newspeaker err', err);
		}
		let user = { userName: 'xxx', userId: 'xxx' };
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
				hostName: user.userName,
				userId: user.userId
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
