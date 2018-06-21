var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var createError = require('http-errors');
var expressHsb = require('express-handlebars');
var mongoose = require('mongoose');
var session = require('express-session');
var passport = require('passport');
var flash = require('connect-flash');
var validator = require('express-validator');
var MongoStore = require('connect-mongo')(session);




//Rutas que llamamos
var indexRouter = require('./routes/index');
var userRouter = require('./routes/users');




var app = express();

app.listen(3001);

//Conexion de la DB MOngoDB
var dbURI = 'mongodb://localhost:27017/tienda';

mongoose.connect(dbURI);

mongoose.connection.on('connected', function () {
  console.log('Mongoose default connection open to ' + dbURI);
 
});


//llmar la estrategia
require('./config/passport');

// view engine setup
app.engine('.hbs', expressHsb({ defaultLayout: 'layout', extname: '.hbs' }));
app.set('view engine', '.hbs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(validator());
//creamos la sesion para mongo para que se pueda identificar
//y expirar segun el tiempo que queramos (180 minutos * 60 segundos * 100milisegundos)
app.use(session({
  secret: 'mysupersecret',
  resave: false,
  saveUninitialized: false,
  store: new MongoStore({ mongooseConnection: mongoose.connection }),
  cookie: { maxAge: 180 * 60 * 1000 }
}));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(path.join(__dirname, 'public')));

//Funcion de datos

//creacion de un nuevo mideelwor
app.use(function (req, res, next) {
  //rutas para que puedan acceder los usuarios
  res.locals.login = req.isAuthenticated();
  res.locals.session = req.session;
  next();
});
//nos permite llamar con un prefijo seleccionado 
//para su trabajo
app.use('/', indexRouter);
app.use('/user', userRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  console.log(next(createError(404)));
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
  //Servidor de dato

});
module.exports = app;
