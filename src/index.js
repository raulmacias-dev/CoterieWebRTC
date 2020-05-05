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

app.get('/requests', (req, res) => {
    res.send(requests);
});

app.get('/reset', (req, res) => {
    users = [{
            name: "rmacias",
            avatar: "https://cdn4.iconfinder.com/data/icons/avatars-circle-2/72/146-512.png",
            inCall: false
        },
        {
            name: "wizard",
            avatar: "https://avatarwizardsblog.com/images/stories/BlogPosts_Wiz2020/Round_CUAt.png",
            inCall: false
        }
    ];
    resetRequests();
    res.send(users);
});



let users = [{
        name: "rmacias",
        avatar: "https://cdn4.iconfinder.com/data/icons/avatars-circle-2/72/146-512.png",
        inCall: false
    },
    {
        name: "wizard",
        avatar: "https://avatarwizardsblog.com/images/stories/BlogPosts_Wiz2020/Round_CUAt.png",
        inCall: false
    }
];

let requests = []

function resetRequests() {
    requests.forEach((item) => {
        deleteRequest(item.requestId);
    })
    requests = [];
}

function deleteRequest(requestId) {
    const index = requests.findIndex(item => item.requestId === requestId);
    if (index !== -1) {
        requests = requests.splice(index, 1); // remove the user from connected users
    }
};

function deleteUser(username) {
    const index = users.findIndex(item => item.name === username);
    if (index !== -1) {
        users = users.splice(index, 1); // remove the user from connected users
    }
};

//socket io logic
io.on('connection', socket => {

    console.log('User connected');

    io.to(socket.id).emit('on-connected', users)

    socket.on('pick', (username) => {
        let user = users.find(item => item.name === username);
        if (user) {
            socket.join(username);
            socket.handshake.query.username = username;
            io.to(socket.id).emit('on-assigned', username);
        } else {
            io.to(socket.id).emit('on-assigned', null);
        }
    })

    socket.on('request', ({ username, offer }) => {
        let calle = users.find(item => item.name === username);
        if (calle && !calle.inCall) {
            const me = socket.handshake.query.username;
            const requestId = username;
            requests.push({ "createAt": new Date(), "requestId": requestId, "username": me });
            socket.join(requestId);
            socket.handshake.query.requestId = requestId;
            io.to(username).emit('on-request', { username: me, offer: offer, requestId: requestId });
        } else {
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
            //let req = requests.find(item => item.requestId === requestId);
            //let me = users.find(item => item.name === req.username);
            //me.inCall = true;
            //let calle = users.find(item => item.name === requestId);
            //calle.inCall = true;

            socket.join(requestId);
            socket.handshake.query.requestId = requestId;
            io.to(requestId).emit('on-response', answer);
        } else {
            io.to(requestId).emit('on-response', null);
        }

    });

    socket.on('candidate', ({ him, candidate }) => {
        console.log('candidate', him);
        let user = users.find(item => item.name === him);
        if (user) {
            console.log('candidate to', him);
            io.to(him).emit('on-candidate', candidate);
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
            socket.handshake.query.requestId = null;
            io.to(calle).emit('on-cancell-request');
            io.to(query.username).emit('on-finish-call');
            let user = users.find(item => item.name === query.username);
            query.username = null;
        }
    });
});

const PORT = process.env.PORT || 5050;

server.listen(PORT, () => {
    console.log('running on ' + PORT);
});