const express = require('express');
const {verificaToken,verificaAdmin_Role} = require('../middlewares/autenticacion');
const Categoria = require('../models/categoria');

const app = express();
const _ = require('underscore');


module.exports = app;

//================================
// Obtener Categoría
//================================
app.get('/categoria',verificaToken,(req, res)=> {

    Categoria.find({})
        .sort('descripcion')
        .populate('usuario','nombre email') // introduce la información del usuario
        .exec((err, categorias) => {

            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }

            res.json({
                ok: true,
                categorias,
            });
        });
});

//================================
// Obtener Categoría po ID
//================================
app.get('/categoria/:id',verificaToken, function(req, res) {

    let id = req.params.id;

    Categoria.findById(id, (err, categoriaDB) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!categoriaDB) {
            return res.status(500).json({
                ok: false,
                err: {
                    message: 'El ID no es valido'
                }
            });
        }

        res.json({
            ok: true,
            categoria: categoriaDB
        });
    })
});

//================================
// Crear Categoría
//================================
app.post('/categoria',verificaToken, function(req, res) {

    let body = req.body;

    let categoria = new Categoria({
        descripcion: body.descripcion,
        usuario: req.usuario._id // el atributo _id lo tenemos disponible por verificarToken
    });


    categoria.save((err, categoriaDB) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!categoriaDB) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        res.json({
            ok: true,
            categoria: categoriaDB
        });
    });
});

//================================
// Actualizar Categoría por ID
//================================
app.put('/categoria/:id',verificaToken,(req, res) => {

    let id = req.params.id;
    let body = req.body;

    let descCategoria = {
        descripcion: body.descripcion
    }

    Categoria.findByIdAndUpdate(id, descCategoria, { new: true, runValidators: true }, (err, categoriaDB) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!categoriaDB) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        res.json({
            ok: true,
            categoria: categoriaDB
        });
    })
});

//================================
// Borrar Categoría por ID
//================================
app.delete('/categoria/:id',[verificaToken,verificaAdmin_Role], function(req, res) {

    let id = req.params.id;

    Categoria.findByIdAndDelete(id, (err, categoriaBorrado) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        };

        if (!categoriaBorrado) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Categoría no encontrada'
                }
            });
        }

        res.json({
            ok: true,
            categoria: categoriaBorrado
        });

    });
});

module.exports = app;