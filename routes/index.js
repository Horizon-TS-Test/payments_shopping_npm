var express = require('express');
var router = express.Router();
var paypal = require('paypal-rest-sdk');


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
  var cart = new Cart(req.session.cart ? req.session.cart : { items: {} });
  Product.findById(productoId, function (err, product) {
    if (err) {
      return res.redirect('/');
    }
    cart.add(product, product.id);
    req.session.cart = cart;
    console.log(req.session.cart);
    res.redirect('/');
  });

});

//arrito de compras
router.get('/carrito', function (req, res, next) {
  if (!req.session.cart) {
    return res.render('shop/carrito', { productos: null });
  }

  var cart = new Cart(req.session.cart);
  res.render('shop/carrito', { productos: cart.generateArray(), totalPrecio: cart.totalPrecio });

});

//PayPal
router.post('/pay', function (req, res, next) {
  var ban = 0;
  console.log("Dato Total");
  console.log(req.session.cart.totalPrecio);

  //Creacion del cuerpo Json Para enviar
  var create_payment_json = {
    "intent": "sale",
    "payer": { "payment_method": "paypal" },
    "transactions": [{
      "amount": { "currency": "USD", "total": req.session.cart.totalPrecio},
      "description": "Gracias por Adquirirs nuestros Productos Horizon",
      "item_list": {
        "items": [{
          "sku": "item",
          "name": "Back End",
          "quantity": "1",
          "price": "1",
          "description":"hl",
          "currency": "USD"
        }]
      }
    }],
    "redirect_urls": {
      "return_url": "http://localhost:3000/exitoso",
      "cancel_url": "http://localhost:3000/carrito"
    }
  };




  console.log("Por Asi Si llega");
  console.log(create_payment_json.transactions[0].item_list);


  
    var lista = req.session.cart.items;
    for (i in lista) {
      var item = {
        "sku": lista[i].item._id,
        "name": lista[i].item.titulo,
        "quantity": "1",
        "price": lista[i].item.precio,
        "description": lista[i].item.descripcion,
        "currency": "USD",
       
        
        
        
      };
  
      create_payment_json.transactions[0].item_list.items[ban] = item;
      ban++;
  
    }



  //creacion del pay pal
  paypal.payment.create(create_payment_json, function (error, payment) {
    if (error) {
     
      throw error;
    } else {
      for (let i = 0; i < payment.links.length; i++) {
        if (payment.links[i].rel === 'approval_url') {
          res.redirect(payment.links[i].href);
        }
      }
    }
  });

});

//Ruta si fue un exito
router.get('/exitoso', function (req, res, next) {
  const payerId = req.query.PayerID;
  const paymentId = req.query.paymentId;

  const execute_payment_json = {
    "payer_id": payerId,
    "transactions": [{
      "amount": {
        "currency": "USD",
        "total": req.session.cart.totalPrecio
      }
    }]
  };
  paypal.payment.execute(paymentId, execute_payment_json, function (error, payment) {
    if (error) {
      console.log(error.response);
      throw error;
    } else {
      console.log("Vacio");
      req.session.cart = null;
      console.log(JSON.stringify(payment));
      res.redirect('/');
    }
  });

});

//CancelDO EL PAGO POR ERRORES
router.get('/cancelado', function (req, res, next) {
  res.send('cancelado');
});

module.exports = router;
