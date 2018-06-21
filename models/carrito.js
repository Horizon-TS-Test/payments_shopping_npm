//definimos el modelo

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var autoIncrement = require('mongoose-auto-increment');
var connection = mongoose.createConnection("mongodb://localhost:27017/tienda");
autoIncrement.initialize(connection);

var carritoschema = new Schema({
    //para almacenar el path de la imgane
    _id:{
        type: Number,
        default:1
    },
    tipo: {
        type: String,
        required: true
    },
    productos:{ 
        type: Object,
        required: true
    }
});
carritoschema.plugin(autoIncrement.plugin, 'Carrito');
module.exports = mongoose.model('Carrito',carritoschema);