var io = require(socket.io)();

//number of users connected
var users = {};
var numUsers = 0;

io.on('connection', function(socket){
  var addedUser = false;

  //when client emits new message this allows it to execute
  socket.on('new message', function(data){
    //tell client to execute 'newmessage'
    socket.broadcast.emit('new message', {
      username: socket.username,
      message: data,
      timestamp: Date.now()
    });
    console.log('been sent')
  });

  //when client emits 'add user' this allows for creation of new user
  socket.on('add user', function(username){
    //store username in socket session
    socket.user = user;
    //add client's username to global list
    users[user] = user;
    ++numUsers;
    addedUser = true;
    socket.emit('login', {
      numUsers: numUsers
    });
    //tell everyone that a user has joined
    socket.broadcast.emit('user has joined the channel', {
      user: socket.user,
      numUsers: numUsers
    });
  });

  //if client is typing, emit it to others
  socket.on('typing', function(){
    socket.broadcast.emit('typing', {
      user: socket.user
    });
  });

  //if client stops typing, broadcast stop typing
  socket.on('stop typing', function(){
    socket.broadcast.emit('stop typing', {
      user: socket.user
    });
  });

  //remove user when disconnect
  socket.on('disconnect', function(){
    //remove user from global users
    if(addedUser){
      delete users[socket.user];
      --numUsers;

      //tell everyone this client has left
      socket.broadcast.emit('user left', {
        user: socket.user,
        numUsers: numUsers
      });
    }
  });

});






