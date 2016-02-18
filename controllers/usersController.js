//controller dependencies
var User = require('../models/user');
var mongoose = require('mongoose');
var jwt = require('jsonwebtoken');
var superSecret = process.env.superSecret

//setup user auth
exports.showUsers = function(req, res, next){
  User.find({}, function (err, users){
    res.json(users);
  })
};

exports.createUser = function(req, res, next){
  var newUser = new User();
  var keys = Object.keys(req.body);
  keys.forEach(function (key){
    newUser[key] = req.body[key];
  });
  newUser.save(function(err){
    if(err) console.log(err);
    else res.send('user created!!')
  });
};

exports.editUser = function(req, res, next){
  User.findById({_id: req.params.id}, function(err, user){
    var keys = Object.keys(req.body.local);
    keys.forEach(function(key){
      user.local[key] = req.body.local[key];
    });
    user.local.save();
  });
  res.send('user updated')
};

exports.deleteUser = function(req, res, next){
  User.findOneAndRemove({_id: req.params.id}, function(err, user){
    if(err) res.json('user not deleted');
    else res.json('user has been deleted')
  })
}


//relics of the past
// exports.authenticate = function(req,res,next){
//   User.findOne({ 'local.username': req.body.username})
//     .select('local.username local.password').exec(function(err, user){
//       if(err) throw err;
//       if(!user){
//         res.json({success: false, message: 'Authentication failed, User not found.'})
//       } else if(user){
//         var validPassword = user.validPass(req.body.password);
//         if(!validPassword){
//           res.json({success: false, message: 'Authentication failed. Wrong password.'})
//         } else{
//           var token = jwt.sign({
//             username: user.local.username
//           }, superSecret, {expiresIn: 86400});
//           res.json({success: true, message: 'Enjoy your token!', token: token})
//         }
//       }
//     });
// }



