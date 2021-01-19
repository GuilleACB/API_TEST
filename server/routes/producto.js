const express = require('express');
const {verificaToken} = require('../middlewares/autenticacion');
const Producto = require('../models/producto');

const app = express();


module.exports = app;

//================================
// Obtener Productos
//================================
app.get('/producto',verificaToken,(req, res)=> {

    let desde = req.query.desde || 0;
    desde = Number(desde);

    let limite = req.query.limite || 5;
    limite = Number(limite);

    Producto.find({disponible:true})
        .sort('nombre')
        .populate('usuario','nombre email') // introduce la información del usuario
        .populate('categoria','descripcion') // introduce la información de la categoría
        .skip(desde)
        .limit(limite)
        .exec((err, productos) => {

            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            res.json({
                ok: true,
                productos,
            });
        });
});

//================================
// Obtener Productos por ID
//================================
app.get('/producto/:id',verificaToken, function(req, res) {

    let id = req.params.id;

    Categoria.findById(id, (err, productoDB) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!productoDB) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'El ID no es valido'
                }
            });
        }

        res.json({
            ok: true,
            producto: productoDB
        });
    })
});

//================================
// Buscar Productos nombre 
//================================
app.get('/producto/buscar/:termino',verificaToken, function(req, res) {

    let termino = req.params.termino;

    let regex = new RegExp(termino, 'i'); // i: insensible a mayusculas/minusculas

    Producto
    .find({nombre: regex, disponible:true})
    .populate('categoria','descripcion')
    .exec((err, productoDB) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        res.json({
            ok: true,
            producto: productoDB
        });
    })
});

//================================
// Crear Productos 
//================================
app.post('/producto',verificaToken, (req, res) => {

    let body = req.body;

    let producto = new Producto({
        nombre: body.nombre,
        precioUni: body.precioUni,
        descripcion: body.descripcion,
        categoria: body.categoria,
        disponible: body.disponible,
        usuario: req.usuario._id // el atributo _id lo tenemos disponible por verificarToken
    });


    producto.save((err, productoDB) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!productoDB) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        res.status(201).json({
            ok: true,
            producto: productoDB
        });
    });
});

//================================
// Actualizar Productos por Id 
//================================
app.put('/producto/:id',verificaToken,(req, res) => {

    let id = req.params.id;
    let body = req.body;

    let producto = {
        nombre: body.nombre,
        precioUni: body.precioUni,
        categoria: body.categoria,
        descripcion: body.descripcion,
        disponible: body.disponible
    }

    Producto.findByIdAndUpdate(id, producto, { new: true, runValidators: true }, (err, productoDB) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!productoDB) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        res.json({
            ok: true,
            producto: productoDB
        });
    })
});

//================================
// Borrar Productos por Id 
//================================
app.delete('/producto/:id',verificaToken,(req, res) => {

    let id = req.params.id;
    let producto = {
        disponible: false
    }

    Producto.findByIdAndUpdate(id,producto, { new: true, runValidators: true },  (err, productoBorrado) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        };

        if (!productoBorrado) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Categoría no encontrada'
                }
            });
        }

        res.json({
            ok: true,
            producto: productoBorrado
        });

    });
});

module.exports = app;