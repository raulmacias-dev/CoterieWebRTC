const express = require('express');
const http = require('http');
const socketio = require('socket.io');
const dotenv = require('dotenv');
const axios = require('axios');
dotenv.config();

const app = express();
const server = http.Server(app);
const io = socketio(server);

let requests = []

app.get('/', (req, res) => {
    res.send('CoterieWebRTC');
});

app.get('/requests', (req, res) => {
    res.send(requests);
});

function deleteRequest(requestId) {
    const index = requests.findIndex(item => item.requestId === requestId);
    if (index !== -1) {
        requests = requests.splice(index, 1); // remove the user from connected users
    }
};

//socket io logic
io.on('connection', socket => {

    console.log('User connected');

    io.to(socket.id).emit('on-connected', users)

    socket.on('logout',(user)=>{
        let loguser = JSON.parse(user);
        findUser = users.find(item => item.nickname === logouser.nickname);
        if(findUser != null){
            users.pop(findUser);
        }
    })

    socket.on('assigned', (username) => {
        try {
            socket.join(username);
            socket.handshake.query.username = username;
            io.to(socket.id).emit('on-assigned', username);
        } catch (error) {
            io.to(socket.id).emit('on-assigned', null);
        }
    })

    socket.on('request', ({ username, offer }) => {

        try {
            const me = socket.handshake.query.username;
            const requestId = username;
            requests.push({ "createAt": new Date(), "requestId": requestId, "username": me });
            socket.join(requestId);
            socket.handshake.query.requestId = requestId;
            io.to(username).emit('on-request', { username: me, offer: offer, requestId: requestId });
        } catch (error) {
            io.to(socket.id).emit('on-response', null);
        }

    })

    socket.on('cancel-request', () => {
        const requestId = socket.handshake.query.requestId;
        if (requestId) {
            deleteRequest(requestId);
            const calle = requestId;
            socket.handshake.query.requestId = null;
            io.to(calle).emit('on-cancel-request');
        }
    });

    socket.on('response', ({ requestId, answer }) => {

        if (answer) {
            socket.join(requestId);
            socket.handshake.query.requestId = requestId;
            io.to(requestId).emit('on-response', answer);
        } else {
            io.to(requestId).emit('on-response', null);
        }

    });

    socket.on('candidate', ({ him, candidate }) => {

        try {
            io.to(him).emit('on-candidate', candidate);
        } catch (error) {
            io.to(him).emit('on-candidate', null);
        }

    });

    socket.on('finish-call', () => {
        const requestId = socket.handshake.query.requestId;
        if (requestId) {
            io.to(requestId).emit('on-finish-call');
        } else {
            socket.broadcast.to(requestId).emit('on-finish-call');
        }
    })

    socket.on('disconnect', () => {
        const { query } = socket.handshake.query;
        if (query) {
            
            deleteRequest(query.requestId);
            const calle = query.requestId;
            
            io.to(calle).emit('on-cancell-request');
            io.to(query.username).emit('on-finish-call');
            
            socket.handshake.query.requestId = null;
            socket.handshake.query.username = null;

        }
    });
});

const PORT = process.env.PORT || 5050;

server.listen(PORT, () => {
    console.log('running on ' + PORT);
});