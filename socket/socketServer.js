const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require('socket.io');
const io = new Server(server);

// const io = require('socket.io')(8000);

io.on('connection', (socket) => {
	console.log('a user connected', socket.id);
});

// module.exports = server;

server.listen(3000, () => {
	console.log('listening on *:3000');
});
