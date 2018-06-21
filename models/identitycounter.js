//definimos el modelo
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var identitycounterschema = new Schema({
    //para almacenar el path de la imgane
    count:{
        type: Number,
        required: true
    },
    model:{
        type: String,
        required: true
    },
    field:{
        type: String,
        required: true
    }
});

module.exports = mongoose.model('Identitycounter',identitycounterschema);