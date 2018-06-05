//Llmado de mi modelo para realizar los diferentes 
//metodos
var Producto = require('../models/producto');
var mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/tienda');
mongoose.connection.on('connected', function () {  
    console.log('Mongoose default connection open to ');
  }); 
  

var productos = [ 
    new Producto({
        imagePath: '/images/sweb.jpg',
        titulo: 'Servicios Web',
        descripcion: 'Alojamiento de Sistemas en la nube, servidores, Base de datos en la Nube.',
        precio: 12
    }),
    new Producto({
        imagePath: '/images/dweb.jpg',
        titulo: 'Desarrollo Web',
        descripcion: 'El Desarrollo de sistemas es una de las problemáticas más habitual de una empresa.',
        precio: 12
    }),
    new Producto({
        imagePath: '/images/scorpo.jpg',
        titulo: 'Servicios Corporativos',
        descripcion: 'La mayoría de las empresas tienen distintos departamentos para gestionar sus procesos.',
        precio: 12
    }),
    new Producto({
        imagePath: '/images/dweb.jpg',
        titulo: 'IoT',
        descripcion: 'Internet de las cosas (en inglés, Internet of Things, abreviado IoT)​.​',
        precio: 12
    })
];

var done = 0;
for (var i=0; i< productos.length; i++){
  
    productos[i].save(function(err,result){
            done++;
            if(done === productos.length){
                exit();
            }
    });
}



function exit (){
    mongoose.disconnect();
}