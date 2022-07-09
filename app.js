import { io } from "https://cdn.socket.io/4.3.2/socket.io.esm.min.js";
const socket = io("http://localhost:3000");

let userId = -1;

$(function() {
    // User authentication with name and pwd.
    $('.auth-submit-btn').click(function(e){
        e.preventDefault();
        // TODO: Do different thing with different button value.
        // TODO: emit with user info.
        socket.emit('authentication');
    });

    // User logout.
    $('.logout-btn').click(function(e){
        e.preventDefault();
        socket.emit('logout');
    });

    // TODO: Post messages.

});

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

// TODO: add Warning function.
