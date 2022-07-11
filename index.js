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
    socket.on('authentication', async (userInfo) => {
        let userId = -1;
        if(userInfo.action === 'login'){
            userId = await login(socket, userInfo.username, userInfo.password);
        }else {
            userId = await register(socket, userInfo.username, userInfo.password);
        }

        if(userId != -1){
            socket.emit('switchPage', userId);
        }
    });

    // User logout.
    socket.on('logout', () => {
        socket.emit('switchPage', -1);
    });

    // Post Msg.
    socket.on('handlePostMsg', async (msgData) => {
        const message = msgData.message;
        const userId = msgData.userId;
        await saveMsg(message, userId);

        const userName = await getUserName(userId);
        const messages = await getMessages();
        msgData.userName = userName;
        msgData.timeStamp = messages[messages.length - 1].timeStamp;
        io.emit('showNewMsg', (msgData));
    });
});

async function login(socket, username, password){
    const userId = await getUserId(username, password);
    if(userId == -1){
        socket.emit('warning', 'Username or password is wrong.');
    }

    return userId;
}

async function register(socket, username, password){
    const nameUsed = await usernameHasBeenUsed(username);
    if(nameUsed){
        socket.emit('warning', 'Username has been used.');
        return -1;
    }

    const query = `INSERT INTO users(name, password) values('${username}', '${password}')`;
    await mysqlQuery(query);
    const userId = await getUserId(username, password);
    return userId;
}

// Return user id if exists.
async function getUserId(username, password){
    const query = `SELECT id FROM users WHERE name = '${username}' and password = '${password}'`;
    const parseResult = parsingResult(await mysqlQuery(query));
    if(parseResult[0] != undefined){
        return parseResult[0].id;
    }

    return -1;
}

// Return user name.
async function getUserName(userId){
    const query = `SELECT name FROM users WHERE id = '${userId}'`;
    const parseResult = parsingResult(await mysqlQuery(query));
    return parseResult[0].name;
}

// Get messages.
async function getMessages(){
    const query = 'SELECT message, userId, timeStamp FROM messages';
    return parsingResult(await mysqlQuery(query));
}

// Check if the username was used.
async function usernameHasBeenUsed(username){
    const query = `SELECT name FROM users WHERE name = '${username}'`;
    const result = await mysqlQuery(query);
    return result.length > 0 ? true : false;
}

// Save message to DB.
async function saveMsg(message, userId){
    const query = `INSERT INTO messages(message, userId, timeStamp) values('${message}', ${userId}, now())`;
    await mysqlQuery(query);
}

// Processing mysql query.
const mysqlQuery = (query) => {
    return new Promise( resolve => {
        db.query(query, (err, result) => {
            if (err) throw err;
            resolve(result);
        })
    });
}

function parsingResult(result){
    return JSON.parse(JSON.stringify(result));
}
