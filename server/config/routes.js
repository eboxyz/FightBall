//state dependencies for routes
var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var cors = require('cors');
var jwt = require('jsonwebtoken')
var superSecret = process.env.superSecret

//grab functions from controllers
var usersController = require('../controllers/usersController')
var loginController = require('../controllers/loginController');

//testing for hello world
router.route('/', function(req,res){
  res.render('index.ejs')
});

// route middleware to verify a token
// router.use(function(req, res, next){
//   //checking header/url params/post params for token
//   var token = req.body.token || req.query.token || req.headers['x-access-token'];
//   //decoding token
//   if(token){
//     //verifies secret and checks exp
//     jwt.verify(token, superSecret, function(err, decoded){
//       if(err){
//         return res.status(403).send({success: false, message: 'Failed to authenticate token.'})
//       } else{
//         //if everything is good, save to request for use in other routes
//         req.decoded = decoded;
//         next();
//       }
//     })
//   } else{
//     //if no token, return HTTP response 403(access forbiden)
//     return res.status(403).send({success: false, message: 'No token provided.'})
//   }
// });

router.get('/api/me', function(req,res){
  res.send(req.decoded);
})

//routes for user CRUDability
router.route('/api/user/create').post(usersController.createUser);
router.route('/api/user/:id/delete').delete(usersController.deleteUser);
router.route('/api/users').get(usersController.showUsers);
router.route('/user/:id/edit').put(usersController.editUser);
router.route('/api/authenticate').post(usersController.authenticate);
// router.route('/api/authenticate').use(userController.verifyToken)


module.exports = router
