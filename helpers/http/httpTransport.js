//We use http library  to handle HTTP request and response. (Outermost layer)
const http = require('http');

//Require and initialise express. We use express to handle requests, passed by http library,
const express = require('express')();

//Initliase http to use Express as http handler, and express will use nextjs coniditionally below.
const server = http.Server(express);


//Whether DEV mode on
const isDev = process.env.NODE_ENV != 'production';


//Load nextjs module
const next = require('next');


//Initliase Next App
const nextApp = next({ dev: isDev });


//Once the nextApp is ready, redirect all incoming request of Express Server to Next
nextApp.prepare().then(() => {

    /**
     * Write any exception page here, like /blog or /help etc server.get('/blog');
     */

    const path = require('path');



    /*
    express.get('/Assets/*', function(req, res){

       
        
        var options = {
            root: path.join(__dirname, '..', '..')
        };

        //res.send('hello world');
        res.sendFile("/public/"+ req.params[0],  options);
        

    });
    */



    express.get('*', handleTheRequestToNext);
    express.post('*', handleTheRequestToNext);



})

const nextHandler = nextApp.getRequestHandler();
//Callback function to handle the incoming request to NextJS
handleTheRequestToNext = (req, res) => {

    return nextHandler(req, res);

}

//Callback error function, for listen.
let handleError = (err) => {

    console.error(err);
}


//Method to initiliase port and start listening
exports.init = (port = 3000) => {

    //Start the server listenihng at port.
    server.listen(port, handleError);
}

//Method to get current server instance.
exports.getServer = () => { return server; }
