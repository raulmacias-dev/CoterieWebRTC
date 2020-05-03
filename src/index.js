const express = require('express');
const http = require('http');
const socketio = require('socket.io');
const dotenv = require('dotenv');
const axios = require('axios');
dotenv.config();

const app = express();

const server = http.Server(app);

const io = socketio(server);

app.get('/', (req, res) => {
  res.send('CoterieWebRTC');
});

app.get('/users', (req, res) => {
  res.send(users);
});

app.get('/clear', (req, res) => {
  users = [];
  res.send(users);
});

let users = [];

//socket io logic
io.on('connection', socket => {

  socket.on('clear',()=>{
    users = [];
  });

  socket.on('join', username => {
    let user = users.find(item => item === username);
    if (user) {
      io.to(socket.id).emit('on-join', false);
      io.sockets.emit('on-users',users);
      console.log('Usuario ya existe');
    } else {
      socket.join(username); // assign the username to the current socket
      socket.handshake.query.username = username;
      users.push(username);
      io.to(socket.id).emit('on-join', true);
      io.sockets.emit('on-users',users);
      console.log('Usuario conectado' + username);
    }
  });

  //
  socket.on('call', ({ username, offer }) => {
    console.log('call', username);
    let user = users.find(item => item === username);
    if (user) {
      const me = socket.handshake.query.username;
      console.log('call to', username);
      io.to(username).emit('on-call', { username: me, offer });
    } else {
      console.log('usuario no encontrado');
    }
  });

  socket.on('answer', ({ username, answer }) => {
    let user = users.find(item => item === username);
    if (user) {
      console.log('answer to', username);
      io.to(username).emit('on-answer', answer);
    }
  });

  socket.on('candidate', ({ username, candidate }) => {
    console.log('candidate', username);
    let user = users.find(item => item === username);
    if (user) {
      console.log('candidate to', username);
      io.to(username).emit('on-candidate', candidate);
    }
  });

  socket.on('disconnect', () => {
    const { username } = socket.handshake.query;
    if (username) {
      const index = users.findIndex(item => item === username);
      if (index !== -1) {
        users = users.splice(index, 1); // remove the user from connected users
      }
    }
  });
});

const PORT = process.env.PORT;

server.listen(PORT, () => {
  console.log('running on ' + PORT);
});
