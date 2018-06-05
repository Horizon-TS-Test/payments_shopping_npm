var express = require('express');
var router = express.Router();


var Product = require('../models/producto');
var Cart = require('../models/cart');

/* GET home page. */
router.get('/', function (req, res, next) {

  Product.find({}, function (err, docs) {
    var tamaño = docs.length;
    var productosPedazo = [];
    var Pedazos = 1;
    //Crear la nueva matriz de los datos
    for (var i = 0; i < tamaño; i += Pedazos) {
      productosPedazo.push(docs.slice(i));
      i = tamaño + Pedazos;

    }

    res.render('shop/index', { title: 'PAGOS HORIZONT', productos: productosPedazo });
  });
});

//Carrito de compras

router.get('/carrito/:id', function (req, res, next) {
  var productoId = req.params.id;
  var cart = new Cart(req.session.cart ? req.session.cart : {items:{}});
  Product.findById(productoId, function(err, product){
    if (err){
      return res.redirect('/');
    }
    cart.add(product,product.id);
    req.session.cart = cart;
    console.log(req.session.cart);
    res.redirect('/');
  });
 
});

//arrito de compras
router.get('/carrito', function (req, res, next) {
  if(!req.session.cart){
    return res.render('shop/carrito',{productos: null});
  }

  var cart = new Cart(req.session.cart);
  res.render('shop/carrito',{productos: cart.generateArray(),totalPrecio: cart.totalPrecio});
 
});

module.exports = router;
