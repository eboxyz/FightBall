var User = require('../models/user.js');

exports.seedUsers = function seedUsers(){
  User.find({}).exec(function(err, collection){
    if (collection.length === 0){
      User.create({
        "name": "Edward",
        "username": "The Maker"
      })
    }
  })
}
