var User = require('../models/user.js');

exports.seedUsers = function seedUsers(){
  User.find({}).exec(function(err, collection){
    if (collection.length === 0){
      User.create({
        local:{
        "username": "lol",
        "password": "lolocaust"
      }
      })
    }
  })
}


//this isn't really necessary? the hash messes with this user
