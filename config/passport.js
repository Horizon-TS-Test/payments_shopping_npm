var passport = require('passport');
var User = require('../models/user');
var LocalStrategy = require('passport-local').Strategy;

//Serializar la clave que nos ingresa
passport.serializeUser(function (user, done) {
    done(null, user.id);
});

//Deserializable de los daos ingresados
passport.deserializeUser(function (id, done) {
    User.findById(id, function (err, user) {
        done(err, user);
    });

});

//control de los datos si existen
passport.use('local.signup', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
}, function (req, email, password, done) {
    req.checkBody('email', 'Incorrecto el email').notEmpty().isEmail();
    req.checkBody('password', 'Contraseña Debe contener al menos 6 caracteres').notEmpty().isLength({ min: 6 });
    var errores = req.validationErrors();
    if (errores) {
        var messages = [];
        errores.forEach(function (error) {
            messages.push(error.msg);
        });
        return done(null, false, req.flash('error', messages));
    }
    User.findOne({ 'email': email }, function (err, user) {
        console.log("User", user);
        if (err) {
            return done(err);
        }
        if (user) {
            //mensaje fhas no se puede presentar en la pantalla por eso tiene el valor false
            return done(null, false, { messages: 'Ya esta en uso el email' });
        }
        var newUser = new User();

        newUser.email = email;
        newUser.password = newUser.encryptPassword(password);

        newUser.save(function (err, result) {

            if (err) {
                console.log("Guardar", err);
                return done(err);
            }
            return done(null, newUser);
        });
    });
}));


//control de los datos si existen
passport.use('local.signin', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
}, function (req, email, password, done) {
    req.checkBody('email', 'Incorrecto el email').notEmpty().isEmail();
    req.checkBody('password', 'Contraseña Debe contener al menos 6 caracteres').notEmpty();
    var errores = req.validationErrors();
    if (errores) {
        var messages = [];
        errores.forEach(function (error) {
            messages.push(error.msg);
        });
        return done(null, false, req.flash('error', messages));
    }
    User.findOne({ 'email': email }, function (err, user) {
        if (err) {
            return done(err);
        }
        if (!user) {
            //mensaje fhas no se puede presentar en la pantalla por eso tiene el valor false
            return done(null, false, { messages: 'No existe email' });
        }
        if (!user.validPassword(password)) {
           return done(null, false, { messages: 'No existe contraseña' });
        }
        return done(null, user);
    });

}));




