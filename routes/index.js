var express = require('express');
var router = express.Router();
var Request = require("request"), default_headers, site_root = 'http://192.168.1.20:3000';
var Product = require('../models/producto');
var Cart = require('../models/cart');
var Carrito = require('../models/carrito');
var Counters = require('../models/identitycounter');

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

//Carrito de compras
router.get('/carrito', function (req, res, next) {
  if (!req.session.cart) {
    return res.render('shop/carrito', { productos: null });
  }

  var cart = new Cart(req.session.cart);
  res.render('shop/carrito', { productos: cart.generateArray(), totalPrecio: cart.totalPrecio });

});

//PayPal
router.post('/pay', function (req, res, next) {
  var identificador = "";
  default_headers = {
    'User-Agent': 'Mozilla/5.0 (X11; Linux i686; rv:7.0.1) Gecko/20100101 Firefox/7.0.1',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Accept-Language': 'en-us,en;q=0.5',
    'Authorization': '[{"key":"Authorization","value":"' + req.session.csrfSecret + '","description":""}]',
    'Accept-Encoding': 'gzip, deflate',
    'Accept-Charset': 'ISO-8859-1,utf-8;q=0.7,*;q=0.7',
    'Content-Type': 'application/json',
    'Cache-Control': 'max-age=0'
  };

  //Datos para enviar
  //Creacion del cuerpo Json Para enviar
  var ban = 0;
  var create_payment_json = {
    "shopping_id": "",
    "total": req.session.cart.totalPrecio * 100,
    "items":
      [
        {
          "name": "Back End",
          "sku": "item",
          "price": 1,
          "currency": "USD",
          "quantity": 1
        }
      ],
    "return_url": "http://localhost:3001/exitoso",
    "cancel_url": "http://localhost:3001/carrito"
  };
  var lista = req.session.cart.items;
  for (i in lista) {
    var item = {
      "name": lista[i].item.titulo,
      "sku": lista[i].item._id,
      "price": lista[i].item.precio,
      "currency": "USD",
      "quantity": lista[i].qty
    };
    create_payment_json.items[ban] = item;
    ban++;
  }
  //
  //Ingreso a la Base de Datos por Pay Pal
  var carrito = {
    tipo: "paypal",
    productos: create_payment_json
  };

  Carrito.create(carrito, function (err, newCarrito) {
    if (err) {
      console.log("No se ingreso", err);
    }
    if (newCarrito !== null) {
      console.log("Ingreso exitoso", newCarrito);
      busqueda();
    }

  });
  //

  //Busqueda del ultimo carrito que se creo
  function busqueda() {
    Carrito.find({ tipo: "paypal" }).sort({ _id: -1 }).limit(1).exec(function (err, cars) {
      if (err) {
        console.log("No se encontro", err);
      }
      if (cars !== null) {
        console.log("Encontrado", cars);
        req.session.car = cars;
        identificador = cars[0]._id
        crearpay(identificador);
      }

    });

  }   //

  //Ponerle el identificador
  function crearpay(identificador) {
    create_payment_json.shopping_id = identificador;
    console.log(create_payment_json);
    var carritouo = {
      tipo: "paypal",
      productos: create_payment_json
    };
    Carrito.update({
      _id: identificador
    }, carritouo).exec(function (err, carritoActualizado) {
      if (err) {
        console.log("No se Actualizo", err);
      }
      if (carritoActualizado !== null) {
        console.log("Se Actualizo", carritoActualizado);
        consumir();
      }

    });

  }

  
  //Post de la paty
  function consumir() {
    console.log("Consumir", create_payment_json);
    Request({
      url: site_root + '/pagar', headers: default_headers, method: 'POST', body: JSON.stringify(create_payment_json)
    }, function (err, res, body) {
      if (err) {
        console.log("No responde Metodo", err);
        llamadocarrito();
      }
      if (!err && res.statusCode == 200) {
        var data = JSON.parse(body);
        url = data.data;
        console.log("url", url);
        llamado(url);
      }
    });
  }
  function llamado(url) { res.redirect(url); };
  function llamadocarrito() { res.redirect('/carrito/'); };

});

//Ruta si fue un exito
router.get('/exitoso', function (req, res, next) {
  const payerId = req.query.PayerID;
  //const payerId = "FCDTCZLVBUXXB";
  const paymentId = req.query.paymentId;
  const token = req.query.token;
  Request(site_root + '/checkout?paymentId=' + paymentId + '&token=' + token + '&PayerID=' + payerId + '', function (err, response, body) {
    if (err) {
      console.log("Error al consumir", err);
    }
    if (response.statusCode != 200) { 
         //Debemos borrarlo en la DB para el reingreso
        //y actualizar el contador
        console.log("Eliminacion", req.session.car[0]._id);
        Carrito.deleteOne({
          _id: req.session.car[0]._id
        }).exec(function (err) {
          if (err) {
            console.log("No se Elimino", err);
          }
        });
        //Counters Buscar y Actualizarlo
        //Busqueda
         Counters.find().limit(1).exec(function (err, idcont) {
          if (err) {
            console.log("No se encontro", err);
          }
          if (idcont !== null) {
            console.log("Encontrado", idcont);
            restar(idcont);
          }

        });
        //Actualizar
        function restar(idcont) {
          console.log("idcont",idcont[0].count);
          var modifica = idcont[0].count -1;
          console.log("modifica", modifica);
          var co = { count: modifica }
          Counters.update({
            _id: idcont[0]._id
          }, co).exec(function (err, idconut) {
            if (err) {
              console.log("No se Actualizo", err);
            }
            if (idconut !== null) {
              console.log("Se Actualizo", idconut);
               }

          });
        }
        llamadoV1(body);
       }
    if (response.statusCode === 200) {
      console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
      llamadoV(body);
    }

  });

  function llamadoV(body) {
    req.session.cart = null;
    var sms = JSON.parse(body);
    var total = sms.data.total / 100;
    var fas = req.flash('info', sms.message);
    res.render('shop/index', { flash: sms.message, data: sms.data, total: total });
  };
  function llamadoV1(body) {
    var sms = JSON.parse(body);
    var fas = req.flash('info', sms.message);
    res.render('shop/index', { flash: sms.message, data: sms.data});
  };
});

//CancelDO EL PAGO POR ERRORES
router.get('/cancelado', function (req, res, next) {
  res.render('/');
});


router.post('/card', function (req, res, next) {
  res.render('shop/card');
});

router.post('/cards', function (req, res, next) {
  var identificador = "";
  anio = req.body.fecha.substring(0, 4);
  mes = req.body.fecha.substring(5, 7);
  default_headers = {
    'User-Agent': 'Mozilla/5.0 (X11; Linux i686; rv:7.0.1) Gecko/20100101 Firefox/7.0.1',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Accept-Language': 'en-us,en;q=0.5',
    'Authorization': '[{"key":"Authorization","value":"' + req.session.csrfSecret + '","description":""}]',
    'Accept-Encoding': 'gzip, deflate',
    'Accept-Charset': 'ISO-8859-1,utf-8;q=0.7,*;q=0.7',
    'Content-Type': 'application/json',
    'Cache-Control': 'max-age=0'
  };

  //Datos para enviar
  //Creacion del cuerpo Json Para enviar
  var ban = 0;
  var create_card_json = {
    "shopping_id": "",
    "tarjeta": {
      "email": req.body.email,
      "number": req.body.card,
      "expire_month": mes,
      "expire_year": anio,
      "cvv2": req.body.cvv
    },
    "productos": {
      "total": req.session.cart.totalPrecio * 100,
      "items":
        [
          {
            "name": "Back End",
            "sku": "item",
            "price": 1,
            "currency": "USD",
            "quantity": 1
          }
        ],
      "return_url": "http://localhost:3001/exitoso",
      "cancel_url": "http://localhost:3001/carrito"
    }
  };

  var lista = req.session.cart.items;
  for (i in lista) {
    var item = {
      "name": lista[i].item.titulo,
      "sku": lista[i].item._id,
      "price": lista[i].item.precio,
      "currency": "USD",
      "quantity": lista[i].qty
    };
    create_card_json.productos.items[ban] = item;
    ban++;
  }
  //Ingreso a la base de datos
  var carrito = {
    tipo: "tarjeta credito",
    productos: create_card_json
  };

  //Ingreso a la Base de Datos por Pay Pal
  Carrito.create(carrito, function (err, newCarrito) {
    if (err) {
      console.log("No se ingreso", err);
    }
    if (newCarrito !== null) {
      console.log("Ingreso exitoso", newCarrito);
      busqueda();
    }

  });
  //

  //Busqueda del ultimo carrito que se creo
  function busqueda() {
    Carrito.find({ tipo: "tarjeta credito" }).sort({ _id: -1 }).limit(1).exec(function (err, cars) {
      if (err) {
        console.log("No se encontro", err);
      }
      if (cars !== null) {
        console.log("Encontrado", cars);
        identificador = cars[0]._id
        crearpay(identificador);
      }

    });

  }   //

  //Ponerle el identificador
  function crearpay(identificador) {
    create_card_json.shopping_id = identificador;
    console.log(create_card_json);
    var carritouo = {
      tipo: "tarjeta credito",
      productos: create_card_json
    };
    Carrito.update({
      _id: identificador
    }, carritouo).exec(function (err, carritoActualizado) {
      if (err) {
        console.log("No se Actualizo", err);
      }
      if (carritoActualizado !== null) {
        console.log("Se Actualizo", carritoActualizado);
        consumirtar();
      }

    });

  }

  //Consumo de metodo patricia
  function consumirtar() {
    Request({
      url: site_root + '/payments/cards', headers: default_headers, method: 'POST', body: JSON.stringify(create_card_json)
    }, function (err, res, body) {
      if (err) { console.log("No se pudo Consumir el Metodo", err); }
      if (!err && res.statusCode == 200) {
        console.log("Se pago el siguiente carrito", body);
        tarjetacredito(body);
      }
    });
  };
  function tarjetacredito(body) {
    req.session.cart = null;
    var sms = JSON.parse(body);
    var total = sms.data.total / 100;
    var fas = req.flash('info', sms.message);
    res.render('shop/index', { flash: sms.message, data: sms.data, total: total });
  };

});

module.exports = router;

