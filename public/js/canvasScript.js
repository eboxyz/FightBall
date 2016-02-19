document.addEventListener("DOMContentLoaded", function() {
   var mouse = {
      click: false,
      move: false,
      pos: {x:0, y:0},
      pos_prev: false
   };
   // get canvas element and create context
   var canvas  = document.getElementById('drawing');
   var context = canvas.getContext('2d');
   var width   = window.innerWidth;
   var height  = window.innerHeight;
   var socket  = io.connect();

   // set canvas to full browser width/height
   canvas.width = width / 2;
   canvas.height = height;

   // register mouse event handlers
   canvas.onmousedown = function(e){ mouse.click = true; };
   canvas.onmouseup = function(e){ mouse.click = false; };

   canvas.onmousemove = function(e) {
      // normalize mouse position to range 0.0 - 1.0
      mouse.pos.x = e.clientX / width;
      mouse.pos.y = e.clientY / height;
      mouse.move = true;
   };

   // draw line received from server
  socket.on('draw_line', function (data) {
      var line = data.line;
      context.beginPath();
      context.moveTo(line[0].x * width, line[0].y * height);
      context.lineTo(line[1].x * width, line[1].y * height);
      context.stroke();
   });


   // main loop, running every 25ms
   function mainLoop() {
      // check if the user is drawing
      if (mouse.click && mouse.move && mouse.pos_prev) {
         // send line to to the server
         socket.emit('draw_line', { line: [ mouse.pos, mouse.pos_prev ] });
         mouse.move = false;
      }
      mouse.pos_prev = {x: mouse.pos.x, y: mouse.pos.y};
      setTimeout(mainLoop, 25);
   }
   mainLoop();

   $('#reset').click(function(){
    context.clearRect(0, 0, canvas.width, canvas.height);
   });

   function shuffleArr(arr){
      for(var j, x, i = arr.length; i; j = parseInt(Math.random() * i), x = arr[--i], arr[i] = arr[j], arr[j] = x);
      return arr;
    }

   var questCards = ["TSA guidelines now prohibit __________ on airplanes",
                    "It's a pity that kids these days are all getting involved with __________",
                    "In 1,000 years, when paper money is but a distant memory, __________ will be our currency",
                    "Major League Baseball has banned __________ for giving players an unfair advantage",
                    "What is Batman's guilty pleasure?",
                    "Next from J.K. Rowling: Harry Potter and the Chamber of __________",
                    "I'm sorry, Professor, but I couldn't complete my homework because of __________",
                    "What did I bring back from Mexico?",
                    "In Michael Jackson's final moments, he thought about __________.",
                    "White people like __________.",
                    "Why do I hurt all over?",
                    "A romantic, candlelit dinner would be incomplete without __________.",
                    "What will I bring back in time to convince people that I am a powerful wizard?",
                    "BILLY MAYS HERE FOR __________."
                    ]

  socket.on('event', $('#lol').click(function(data){
        shuffleArr(questCards)
    console.log(questCards[0])
    $('.text').html(questCards[0])
  }));

  // socket.on('event', function(data){
  //   shuffle(questCards)
  //   $('.text').html(questCards)
  // })

   var answerCards = ["A Gypsy curse",
                "A moment of silence", "A sausage festival", "An honest cop with nothing left to lose", "Famine", "Flesh-eating bacteria", "Flying sex snakes", "Not giving a shit about the Third World",
                "Sexting", "Porn stars", "72 virgins", "A drive-by shooting", "A time travel paradox", "Authentic Mexican cuisine",
                "Bling", "Consultants", "Crippling debt", "Daddy issues", "The Donald Trump Seal of Approval™",
                "Dropping a chandelier on your enemies and riding the rope up", "Former President George W. Bush",
                "Full frontal nudity", "Hormone injections", "Laying an egg", "Getting naked and watching Nickelodeon",
                "Pretending to care", "Public ridicule", "Sharing needles", "Boogers",
                "The inevitable heat death of the universe",
                "The miracle of childbirth", "The Rapture", "Whipping it out", "White privilege",
                "Wifely duties", "The Hamburglar", "AXE Body Spray", "The Blood of Christ",
                "Horrifying laser hair removal accidents", "BATMAN!!!", "Agriculture",
                "A robust mongoloid", "Natural selection", "Coat hanger abortions",
                "Eating all of the cookies before the AIDS bake-sale", "Michelle Obama's arms", "The World of Warcraft",
                "Swooping", "A homoerotic volleyball montage", "A mating display", "Testicular torsion", "All-you-can-eat shrimp for $4.99",
                "Domino's™ Oreo™ Dessert Pizza", "Kanye West", "Hot cheese", "Raptor attacks", "Taking off your shirt",
                "Smegma", "Alcoholism", "A middle-aged man on roller skates", "The Care Bear Stare"
                ]



   $('#pictBtn').click(function(){
      shuffleArr(answerCards)
      console.log(answerCards[0])
      $('.picture').html(answerCards[0] + " <br>or<br> " + answerCards[2] + " <br>or<br> " + answerCards[4])
   })

});
