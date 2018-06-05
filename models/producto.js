//definimos el modelo
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var schema = new Schema({
    //para almacenar el path de la imgane
    imagePath: {
        type: String,
        required: true
    },
    titulo: {
        type: String,
        required: true
    },
    descripcion: {
        type: String,
        required: true
    },
    precio: {
        type: Number,
        required: true
    }
});

module.exports = mongoose.model('Producto',schema);
