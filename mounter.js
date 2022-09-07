
// =httpTransport is a helper library loads http, express and next
const httpTransport = require('./helpers/http/httpTransport');

// HTTP port to listen
const port = 3000;

// Initliase the server with port and start listening
httpTransport.init(port);

//get the http Server Handle to use for any other purpose like Socket.IO
const httpServer = httpTransport.getServer();

//To handle all WebSocket (SOCKET.IO) communication between peers
const ioHanlder = require('./helpers/socketio/socketserver');

//User same HTTP server as the transport
ioHanlder.init(httpServer);







