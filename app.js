import { io } from "https://cdn.socket.io/4.3.2/socket.io.esm.min.js";
const socket = io("http://localhost:3000");

let userId = -1;

$(function() {
    // Authentication with username and pwd.
    $('.auth-submit-btn').click(function(e){
        e.preventDefault();
        const username = $('#username').val();
        const password = $('#password').val();
        const action = $(this).attr('value') == 'login' ? 'login' : 'register';
        const userInfo = {
            username, password, action
        };
        
        socket.emit('authentication', userInfo);
    });

    // User logout.
    $('.logout-btn').click(function(e){
        e.preventDefault();
        socket.emit('logout');
    });

    // TODO: Post messages.

});

// Change pages
socket.on('switchPage', (id) => {
    userId = id;

    // login || register if the user id is set.
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

// Warning 
socket.on('warning', (message) => {
    alert(message);
})