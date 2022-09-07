
//Inilialise socket.io and using http server as the transport.
const ioHanlder = require('socket.io');

//Inilialise socket.io and using http server as the transport.
const ioMessenger = require('./messenger.js');



// Function to initialise all event listeners
function init(server)
{
    io = ioHanlder(server);
    //On every incoming connection request
    // a new "socket" object is assigned to handle that
    io.on("connection", (socket)=> {

            console.log('new socket connection');
            ioMessenger.listenForLiveCount(socket);
            ioMessenger.listenForSystemMessages(socket);
            ioMessenger.listenForChat(socket);
       
    })

}


module.exports =  ioHanlder;
module.exports.init = (server) => {

    init(server);

}