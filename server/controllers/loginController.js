//logincontroller dependencies
var express = require('express');
var User = require('../models/user');
var userController = require('./usersController');
var mongoose = require('mongoose');
var cors = require('cors');


module.exports = function(app, passport){
  app.get('/', function(req,res){
    res.render('index.ejs')
  })

  //route to access login page
  app.get('/login', function(req,res){
    res.render('login.ejs')
  });

  //local login authenticated through passport
  app.post('/login', passport.authenticate('local-login',{
    successRedirect: '/',
    failureRedirect: '/local/login'
  }));

  //route to access signup page
  app.get('/signup', function(req,res){
    res.render('signup.ejs')
  });

  //local sign-in through passport-local
  app.post('/signup', passport.authenticate('local-signup', {
    successRedirect: '/',
    failureRedirect: '/signup'
  }));
  //local logout through passport-local
  app.post('/local/signup', passport.authenticate('local-signup', {
    successRedirect: '/',
    failureRedirect: '/local/signup'
  }));

  //facebook oauth
    //facebook oauth login
  app.get('/auth/facebook',
    passport.authenticate('facebook', {scope: 'email'})
  );
    //facebook callback function
  app.get('/auth/facebook/callback',
    passport.authenticate('facebook', {successRedirect: '/',
    failureRedirect: '/'
    })
  );
    //facebook oauth logout
  app.get('/logout', function(req,res){
    req.logout();
    res.redirect('/')
  });


}
