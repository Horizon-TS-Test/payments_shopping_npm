var express = require('express');
var router = express.Router();
var csrf = require('csurf');
var passport = require('passport');

var csrfProtection = csrf();

//Para utilizar en todas las rutas la session
router.use(csrfProtection);



/* GET para ver el perfil del Usuario.
isloggedIN es para verificar
si la sesion es correcta o incorecta*/
router.get('/perfil', isLoggedIn, function (req, res, next) {
  res.render('user/perfil');
});


/* Metodo para cerrar sesion */
router.get('/logout',isLoggedIn, function (req, res, next) {
  console.log("Llmado");
  req.logout();
  res.redirect('/');
});

//Funcion para cerrar sesion que se ejecute antes de todos
router.use('/', notLoggedIn, function(req,res,next){
  next();
});

/* GET para el Crear de Sesion. */
router.get('/signup', function (req, res, next) {
  var messages = req.flash('error');
  res.render('user/signup', { csrfToken: req.csrfToken(), messages: messages, hasErrors: messages.length > 0 });
});


/* Post del Crear de Sesion. creamos la estrategia 
para poder realizar la autenicacion y si existe datos del usuario */
router.post('/signup', passport.authenticate('local.signup', {
  successRedirect: '/user/perfil',
  failureRedirect: '/user/signup',
  failureFlash: true
}));

/* GET para el Inicio de Sesion. */
router.get('/signin', function (req, res, next) {
  var messages = req.flash('error');
  res.render('user/signin', { csrfToken: req.csrfToken(), messages: messages, hasErrors: messages.length > 0 });
});


/* Post del Crear de Sesion. creamos la estrategia 
para poder realizar la autenicacion y si existe datos del usuario */
router.post('/signin', passport.authenticate('local.signin', {
  successRedirect: '/user/perfil',
  failureRedirect: '/user/signin',
  failureFlash: true
}));



module.exports = router;

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/');
}

function notLoggedIn(req, res, next) {
  if (!req.isAuthenticated()) {
    return next();
  }
  res.redirect('/');
}