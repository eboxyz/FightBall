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
mongoose.connect('mongodb://localhost/gameStuff')
// mongoose.connect('mongodb://heroku_tg23vpt5:72qsqn1abk15rckjliop1l91v3@ds059195.mongolab.com:59195/heroku_tg23vpt5')


//configure apple to handle CORS requests
// app.use(cors());

app.use('/js', express.static(__dirname + '/public/js'));
app.use('/css', express.static(__dirname + '/public/css'))
app.use(express.static(__dirname + '/public/views'))

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



//app listening here
server.listen(port, function(){
  console.log('Server open at port %d', port);
});

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
