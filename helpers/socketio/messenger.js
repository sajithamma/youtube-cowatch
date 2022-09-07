
//Initalise Array to save count of members in each room
const LiveMembers = [];

//Array to save list of socket (ids) and connected room (to handle disconnect)
const SocketArray = [];

//Method to handle live count 
module.exports.listenForLiveCount = (socket) => {

    //on message trigger: "register"
    socket.on('register', (room) => {

        //Add the socket to room (so that we can send count update only to those clients)
        socket.join(room);

        //Increase the members in that room count
        LiveMembers[room] ? LiveMembers[room]++ : LiveMembers[room] = 1;
        SocketArray[socket.id] = room;

        //broadcast all sockets in this root about the new count. 
        io.to(room).emit('livecount', LiveMembers[room] );

    })



     //when the connection lost
    socket.on("disconnect", (data)=> {

    
        var room = SocketArray[socket.id];
        
        //decrease the members count
        LiveMembers[room] ? LiveMembers[room]-- : LiveMembers[room] = 0;
        
        //broadcast all sockets in this root about the new count. 
        io.to(room).emit('livecount', LiveMembers[room] );

    })    

}


//Method to handle system messages like syncing of videos/notifications
module.exports.listenForSystemMessages = (socket) => {

    //on message trigger: "system"
    socket.on('system', (message) => {

        let  MessageObject = JSON.parse(message);
        console.log(MessageObject);

        let room = MessageObject.room;

         //Add the socket to room (so that we can send count update only to those clients)
        socket.join(room);

        //Share with all except the sender
        socket.to(room).emit('system', message );

    })

}

//Method to handle chat
module.exports.listenForChat = (socket) => {

    //on message trigger: "chat", in future when we do chat
    socket.on('chat', (data) => {

        let room = 'all';
        
        //Add the socket to room (so that we can send count update only to those clients)
        socket.join(room);

        //Share with all except the sender
        socket.to(room).emit('chat', data );

    })

}