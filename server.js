var express = require('express');
var app = express();
var rp = require('request-promise');
var Promise = require('bluebird');
var mongoose = Promise.promisifyAll(require('mongoose'));
var dotenv = require('dotenv').config();
var passport = require('passport');
var bodyParser = require('body-parser');
var server = require('http').Server(app);
var io = require('socket.io')(server);
var port = process.env.PORT || 8080;

//mongo connections (local+mongolab)
// mongoose.connect('mongodb://localhost/gameStuff')
mongoose.connect('mongodb://heroku_tg23vpt5:72qsqn1abk15rckjliop1l91v3@ds059195.mongolab.com:59195/heroku_tg23vpt5')


//configure apple to handle CORS requests
// app.use(cors());

// var server = require('http').Server(app);
//   var io = require('socket.io')(server);
//   var port = process.env.PORT || 80;

  server.listen(port, function () {
    console.log('Updated : Server listening at port %d', port);
  });

  // Routing
  app.use('/js',  express.static(__dirname + '/public/js'));
  app.use('/css', express.static(__dirname + '/public/css'));
  app.use(express.static(__dirname + '/public'));

  // Chatroom

  // usernames which are currently connected to the chat
  var usernames = {};
  var numUsers = 0;

  io.on('connection', function (socket) {
    var addedUser = false;

    // when the client emits 'new message', this listens and executes
    socket.on('new message', function (data) {
      // we tell the client to execute 'new message'
      socket.broadcast.emit('new message', {
        username: socket.username,
        message: data,
        timestamp: Date.now()
      });
      console.log('I sent it');
    });

    // when the client emits 'add user', this listens and executes
    socket.on('add user', function (username) {
      // we store the username in the socket session for this client
      socket.username = username;
      // add the client's username to the global list
      usernames[username] = username;
      ++numUsers;
      addedUser = true;
      socket.emit('login', {
        numUsers: numUsers
      });
      // echo globally (all clients) that a person has connected
      socket.broadcast.emit('user joined', {
        username: socket.username,
        numUsers: numUsers
      });
    });

    // when the client emits 'typing', we broadcast it to others
    socket.on('typing', function () {
      socket.broadcast.emit('typing', {
        username: socket.username
      });
    });

    // when the client emits 'stop typing', we broadcast it to others
    socket.on('stop typing', function () {
      socket.broadcast.emit('stop typing', {
        username: socket.username
      });
    });

    // when the user disconnects.. perform this
    socket.on('disconnect', function () {
      // remove the username from global usernames list
      if (addedUser) {
        delete usernames[socket.username];
        --numUsers;

        // echo globally that this client has left
        socket.broadcast.emit('user left', {
          username: socket.username,
          numUsers: numUsers
        });
      }
    });
  });

//allows access to methods in passport file
//initialize passport for usage in app
require('./config/passport')(passport)
app.use(passport.initialize());
app.use(passport.session());

//allowing usage of json
//allows RESTful routing through url
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true}));

var routes = require('./config/routes')
app.use('/', routes);

require('./controllers/loginController.js')(app, passport)

app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');
//seed user
require('./db/seed.js').seedUsers();



// //app listening here
// server.listen(port, function(){
//   console.log('Server open at port %d', port);
// });

//relics of the past
// var cors = require('cors');
// var jwt = require('jsonwebtoken');
// var io = require('socket.io');
// var http = require('http');
// var server = http.createServer(app);
// var io = io.listen(server);


// //secret for JWT to create tokens
// var superSecret = process.env.superSecret
// //socket.io stuff
// require('./config/socket')(io);
