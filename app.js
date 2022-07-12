import { io } from "https://cdn.socket.io/4.3.2/socket.io.esm.min.js";
const socket = io("http://localhost:3000");

let userId = -1;

$(function() {
    // Authentication with username and pwd.
    $('.auth-submit-btn').click(function(e){
        e.preventDefault();
        const username = $('#username');
        const password = $('#password');
        const action = $(this).attr('value');
        const userInfo = {
            username: username.val(), password: password.val(), action
        };
        socket.emit('authentication', userInfo);
        username.val('');
        password.val('');
    });

    // User logout.
    $('.logout-btn').click(function(e){
        // Clear historical messages.
        $('#message-display')[0].textContent = '';
        e.preventDefault();
        socket.emit('logout');
    });

    // Post messages.
    $('.post-msg-btn').click(function(e){
        e.preventDefault();
        const message = $('#message-input');
        if(message.val()){
            const msgData = { message: message.val(), userId};
            socket.emit('handlePostMsg', msgData);
            message.val('');
        }else {
            alert('Message should not be empty.');
        }
    })

});

// Change pages
socket.on('switchPage', (id) => {
    userId = id;

    // login or register if the user id is set.
    if(userId !== -1){
        $('#welcome-section').hide();
        $('#chat-room-section').show();
    }
    
    // logout if the user id is -1.
    else {
        $('#welcome-section').show();
        $('#chat-room-section').hide();
    }
});

// Display historical message.
socket.on('showMessage', (messagesData) => {
    messagesData.forEach(msgData => {
        displayMsg(msgData);
    });
});

// Display new message.
socket.on('showNewMsg', (msgData) => {
    displayMsg(msgData);
});

// Warning 
socket.on('warning', (message) => {
    alert(message);
})

function msgTemplate(author, message, timeStamp){
    return `
        <div class="message">
            <div class="msg-header">
                <div class="msg-header-author">${author}</div>
                <div class="msg-header-timestamp">${timeStamp}</div>
            </div>
            <div class="msg-content">${message}</div>
        </div>`;
}

function displayMsg(msgData){
    let author = msgData.name;
    if(msgData.userId === userId){
        author = 'Me';
    }

    $('#message-display').append(msgTemplate(author, msgData.message, msgData.timeStamp));
}