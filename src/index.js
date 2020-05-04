const express = require('express');
const http = require('http');
const socketio = require('socket.io');
const dotenv = require('dotenv');
const axios = require('axios');
dotenv.config();

const app = express();
const server = http.Server(app);
const io = socketio(server);
const TIME_OUT = 10000;


app.get('/', (req, res) => {
    res.send('CoterieWebRTC');
});

app.get('/users', (req, res) => {
    res.send(users);
});

let users = [      
{
  name: "rmacias",
  avatar:
    "https://superherotar.framiq.com/assets/examples/superherotar00.png",
  isTaken: false,
  inCall: false
},
{
  name: "wizard",
  avatar:
    "https://superherotar.framiq.com/assets/examples/superherotar05.png",
  isTaken: false,
  inCall: false
}];

let requests = []

function deleteRequest(requestId){
  const index = requests.findIndex(item => item.requestId === requestId);
  if (index !== -1) {
    requests = requests.splice(index, 1); // remove the user from connected users
  }
};

function deleteUser(username){
  const index = users.findIndex(item => item.name === username);
  if (index !== -1) {
    users = users.splice(index, 1); // remove the user from connected users
  }
};
=======
app.get('/clear', (req, res) => {
    users = [];
    res.send(users);
});

let users = [];
>>>>>>> 3863d20086247e8bd5d4cbc3c8c06cd2a8047bdc

//socket io logic
io.on('connection', socket => {

<<<<<<< HEAD
  io.to(socket.id).emit('on-connected',users)

  socket.on('pick',(username)=>{
    let user = users.find(item => item.name === username);
    if(!user.isTaken){
      user.isTaken = true;
      socket.handshake.query.username = user.name;
      socket.join(user.name);
      io.to(socket.id).emit('on-assigned', user.name);
      socket.broadcast.emit('on-taken',user.name);
    }else{
      io.to(socket.id).emit('on-assigned',null);
    }
  })

  socket.on('request',({username,offer}) =>{
    let calle = users.find(item => item.name === username);
    if(calle && !calle.inCall && calle.isTaken){
      const me = socket.handshake.query.username
      const requestId = `${calle.name}_${Date.now()}`;
      const timeOutId = setTimeout(()=>{
        io.to(socket.id).emit('on-response', null);
        requestId.io.to(calle.name).emit('on-cancel-request');
        deleteRequest(requestId);
      },TIME_OUT);

      requests.push({"createAt":new Date(), "requestId":requestId,"timeOutId": timeOutId, "userName": me });
      socket.join(requestId);
      socket.handshake.query.requestId = requestId;
      io.to(calle.name).emit('on-request', { username: me, offer: offer,requestId });
    }else{
      io.to(socket.id).emit('on-response',null);
    }
  })

  socket.on('cancel-request',()=>{
    const requestId = socket.handshake.query;
    if(requestId){
      deleteRequest(requestId);
      const calle = requestId.split("_")[0];
      socket.handshake.query.requestId = null;
      io.to(calle).emit('on-cancel-request');
    }
  });

  socket.on('response',({requestId,answer})=>{
    let request = requests.find(item => item.requestId === requestId);
    const userName = request.userName;

    deleteRequest(requestId);

    if(answer){
      const me = socket.handshake.query.username
      let meUser = users.find(item => item.name === me);
      meUser.inCall = true;
      socket.join(requestId);
      io.to(userName).emit('on-response',answer);
    }else{
      io.to(userName).emit('on-response',null);
    }
    
  });

  socket.on('candidate', ({ him, candidate }) => {
    console.log('candidate', username);
    let user = users.find(item => item.name === him);
    if (user) {
      console.log('candidate to', username);
      socket.broadcast.to(him).emit('on-candidate', candidate);
    }
  });

  socket.on('finish-call',()=>{
    const requestId = socket.handshake.query;
    if(requestId){
      io.to(requestId).emit('on-finish-call');
    }else{
      socket.broadcast.to(requestId).emit('on-finish-call');
    }
  })

  socket.on('disconnect', () => {
    const { query } = socket.handshake.query;
    if (query) {
      deleteRequest(query.requestId);
      const calle = query.requestId.split("_")[0];
      socket.handshake.query.requestId = null;
      io.to(calle).emit('on-cancell-request');
      io.to(query.username).emit('on-finish-call');
      let user = users.find(item => item.name === query.username);
      user.isTaken = false;
      query.username = null;
    }
  });
=======
    socket.on('clear', () => {
        users = [];
    });

    socket.on('join', username => {
        let user = users.find(item => item === username);
        if (user) {
            io.to(socket.id).emit('on-join', false);
            io.sockets.emit('on-users', users);
            console.log('Usuario ya existe');
        } else {
            socket.join(username); // assign the username to the current socket
            socket.handshake.query.username = username;
            users.push(username);
            io.to(socket.id).emit('on-join', true);
            io.sockets.emit('on-users', users);
            console.log('Usuario conectado' + username);
        }
    });

    socket.on('participate', username => {
        let user = users.find(item => item === username);
        if (user) {
            const me = socket.handshake.query.username;
            console.log('participate', username);
            io.to(username).emit('on-participate', { username: me });
        } else {
            console.log('usuario no encontrado');
        }
    })

    socket.on('wait', username => {
        let user = users.find(item => item === username);
        if (user) {
            const me = socket.handshake.query.username;
            console.log('wait', username);
            io.to(username).emit('on-wait', { username: me });
        } else {
            console.log('usuario no encontrado');
        }
    })

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

    // FUNCION PARA FINALIZAR LLAMADA
    socket.on('endcall', username => {
        let user = users.find(item => item === username);

        if (user) {
            let me = socket.handshake.query.username;
            console.log('endcall', username);
            io.to(username).emit('on-endcall', { username: me });
        } else {
            console.log('usuario no encontrado');
        }
    })


    socket.on('disconnect', () => {
        const { username } = socket.handshake.query;
        if (username) {
            const index = users.findIndex(item => item === username);
            if (index !== -1) {
                users = users.splice(index, 1); // remove the user from connected users
            }
        }
    });
>>>>>>> 3863d20086247e8bd5d4cbc3c8c06cd2a8047bdc
});

const PORT = process.env.PORT || 5050;

server.listen(PORT, () => {
    console.log('running on ' + PORT);
});