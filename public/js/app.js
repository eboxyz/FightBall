$(function(){
  var FADE_TIME = 150;
  var TYPING_TIMER_LENGTH = 400;
  var COLORS = [ '#e21400', '#91580f', '#f8a700', '#f78b00',
    '#58dc00', '#287b00', '#a8f07a', '#4ae8c4',
    '#3b88eb', '#3824aa', '#a700ff', '#d300e7'
    ];


  //initialize variables
  var $window = $(window);
  var $usernameInput = $('.usernameInput');
  var $messages = $('.messages');
  var $inputMessage = $('.inputMessage');

  var $loginPage = $('.login.page');
  var $chatPage = $('.chat.page');

  var username;
  var connected = false;
  var typing = false;
  var lastTypingTime;
  var $currentInput = $usernameInput.focus();

  var socket = io();

  function addParticipantsMessage (data){
    var message = '';
    if (data.numUsers === 1){
      message += "there's 1 participant";
    } else{
      message += "there are " + data.numUsers + " participants";
    }
    log(message);
  }

  //set client username
  function setUsername(){
    username = cleanInput($usernameInput.val().trim());

    //if username is valid
    if(username){
      $loginPage.fadeOut();
      $chatPage.show();
      $loginPage.off('click');
      $currentInput = $inputMessage.focus();

      //tell server your username
      socket.emit('add user', username);
    }
  };

  //send a chat message
  function sendMessage(){
    var message = $inputMessage.val();
    //prevent markup from being injected
    message = cleanInput(message);
    //if there is a non-empty message and socket connection
    if (message && connected){
      $inputMessage.val('');
      addChatMessage({
        username: username,
        message: message,
        timestamp: Date.now()
      });
      //tell server to execute 'new message' and pass along a parameter
      socket.emit('new message', message)
    }
  };
  //log a message
  function log(message, options){
    var $el = $('<li>').addClass('log').text(message);
    addMessageElement($el, options);
  };

  //adds visual chat to message list
  function addChatMessage(data, options){
    //don't fade message in if 'x is typing'
    var $typingMessages = getTypingMessages(data);
    options = options || {};
    if ($typingMessages.length ! == 0){
      options.fade = false;
      $typingMessages.remove();
    }

    var $timestampDiv = $('<span class="timestamp"/>')
      .text(formatDate(data.timestamp));
    var $usernameDiv = $('<span class="username"/>')
      .text(data.username)
    var $messageBodyDiv = $('<span class="messageBody">')
      .text(data.message);

    var typingClass = data.typing ? 'typing' : '';
    var $messageDiv = $('<li class="message"?>')
      .data('username', data.username)
      .addClass(typingClass)
      .append($usernameDiv, $messageBodyDiv)
      .append($timestampDiv, $messageBodyDiv)
  };

  // adds visual chat typing message
  function addChatTyping(data){
    data.typing = true;
    data.message = 'is typing';
    addChatMessage(data);
  };

  //removes visual chat yping message
  function removeChatTyping(data){
    getTypingMessages(data).fadeout(function(){
      $(this).remove
    });
  };

  // Adds a message element to the messages and scrolls to the bottom
  // el - The element to add as a message
  // options.fade - If the element should fade-in (default = true)
  // options.prepend - If the element should prepend
  //   all other messages (default = false)
  function addMessageElement(el, options){
    var $el = $(el);

    //setup default options
    if(!options){
      options = {};
    }
    if(typeof options.fade === 'undefined'){
      options.fade = true;
    }
    if(typeof options.prepend === 'undefined'){
      options.prepend = false;
    }

    //apply options
    if (options.fade){
      $el.hide().fadeIn(FADE_TIME);
    }
    if(options.prepend){
      $messages.prepend($el);
    } else{
      $messages.append($el);
    }
    $messages[0].scrollTop = $messages[0].scrollHeight;
  };

  //prevents input from having injected markup
  function cleanInput(input){
    return $('<div/>').text(input).text();
  };

  function formatDate(dateObj){
    var d = new Date(dateObj);
    var hours = d.gethours();
    var minutes = d.getMinutes().toString();

    return hours + ":" + (minutes.length === 1 ? '0'+minutes : minutes);
  };

  //updates typing event
  function updateTyping(){
    if(connected){
      if(!typing){
        typing = true;
        socket.emit('typing');
      }
      lastTypingTime = (new Date()).getTime();

      setTimeout(function(){
        var typingTimer = (new Date()).getTime();
        var timeDiff = typingTimer - lastTypingTime
        if(timeDiff >= TYPING_TIMER_LENGTH && typing){
          socket.emit('stop typing');
          typing = false;
        }
      }, TYPING_TIMER_LENGTH);
    };
  };

  //gets X is typing messages of user
  function getTypingMessages(data){
    return $('.typing.message').filter(function(i){
      return $(this).data('username') === data.username;
    });
  };

  //gets color of a username through hash function
  function getUsernamecolor (username){
    //compute hash
    var hash = 7;
    for (var i = 0; i < username.length, i++){
      hash = username.charCodeAt(i) + (hash << 5) - hash;
    }
    //calculate color
    var index = Math.abs(hash % COLORS.length);
    return COLORS[index];
  };

  //keyboard events
  $window.keydown(function(event){
    //auto-focus input when key is typed
    if (!(event.ctrlKey || event.metaKey || event.altKey)){
      $currentInput.focus();
    }
    //when client hits enter on keyboard
    if(event.which === 13){
      if(username){
        sendMessage();
        socket.emit('stop typing');
        typing = false;
      } else{
        setUsername();
      };
    };
  });

  $inputMessage.on('input', function(){
    updateTyping();
  });

  //click events
  //focus input when clicking on a message input's border
  $inputMessage.click(function(){
    $inputMessage.focus();
  });

  //socket events

  //whenever server emits 'login, log the login message
  socket.on('login', function(data){
    connected = true;
    //display welcome
    var message = "get ready for some fun";
    log(message, {prepend: true});
    addParticipantsMessage(data)
  });

  //whenever server emits 'new message' update chat body
  socket.on('new message', function(data){
    addChatMessage(data);
  });

  //whenever the server emits 'user joined', log it in chat body
  socket.on('user joined', function(data){
    log(data.username + ' joined the channel');
    addParticipantsMessage(data);
  });

  //whenever server emits 'user left', log it in the chat body
  socket.on('user left', function(data){
    log(data.username + ' left');
    addParticpantsMessage(data);
    removeChatTyping(data);
  });

  //whenever server emits 'typing', show the typing message
  socket.on('typing', function(data){
    addChatTyping(data);
  });

  //whenever server emits 'stop typing', stoip typing message
  socket.on('stop typing', function(data){
    removeChatTyping(data);
  });

  socket.on('pong', function(data){
    console.log('socket: server said pong(4)', data)
  });


})





