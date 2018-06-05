//definimos el modelo
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt = require('bcrypt-nodejs');


var userSchema = new Schema({
    //para almacenar el path de la imgane
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    }
});

//metodo para encriptar la clave
userSchema.methods.encryptPassword = function(password){
     return bcrypt.hashSync(password,bcrypt.genSaltSync(8), null);
};

//metodo para comparar si las claves son correctas
userSchema.methods.validPassword = function(password){
    return bcrypt.compareSync(password,this.password);
};

module.exports = mongoose.model('User',userSchema);
