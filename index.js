// To access variables in .env.
require('dotenv').config();

const express = require('express');
const app = express();
const http = require('http');
const httpServer = http.createServer(app);
const mysql = require('mysql');

const port = process.env.PORT || 3000;
httpServer.listen(port, () => {
    console.log('Listening at Port: ', port);
});

const { Server } = require('socket.io');
const io = new Server(httpServer);

const path = require('path');

app.use(express.static(path.join(__dirname)));
app.use(express.urlencoded({
    extended: true
}));

// Database config
const connectionOptions = {
    host: process.env.MYSQL_HOST,
    port: process.env.MYSQL_PORT,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASS,
    database: process.env.MYSQL_DB
}

const db = mysql.createConnection(connectionOptions);

db.connect(function (err) {
    if (err) throw err;
    console.log('Database connected');
});

io.on('connection', (socket) => {
    console.log('User connected.');
    socket.on('disconnect', () => {
        console.log('User disconnected.');
    });

    // User authentication.
    socket.on('authentication', () => {
        // TODO: Add authentication.
        
        // TODO: change user id.
        socket.emit('switchPage', 0);
    });

    // User logout.
    socket.on('logout', () => {
        socket.emit('switchPage', -1);
    });

    // TODO: Post Messages.

    // TODO: Warning.
});