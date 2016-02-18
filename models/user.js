'use strict';

var mongoose = require('mongoose')
var bcrypt = require('bcrypt-nodejs')


//user schema for mongo model
var userSchema = mongoose.Schema({
  fb: {
    id: String,
    access_token: String,
    firstName: String,
    lastName: String,
    email: String
  },
  local:{
    username: String,
    password: String
  }
});


//encrypt password - genSalt by bcrypt
userSchema.methods.generateHash = function (password){
  return bcrypt.hashSync(password, bcrypt.genSaltSync(11), null);
};

//check encrypted password
userSchema.methods.validPass = function(password){
  var user = this;
  return bcrypt.compareSync(password, this.local.password);
};

module.exports = mongoose.model('User', userSchema);
