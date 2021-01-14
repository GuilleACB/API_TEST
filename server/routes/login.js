const express = require('express');

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');


const Usuario = require('../models/usuario');

const app = express();

app.post('/login', (req,res)=>{

    let body = req.body;

    //1, verificar el correo
    Usuario.findOne({ email: body.email}, (err, usuarioDB)=>{

        //controlamos posibles errores del servidor 
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        //Verificamos si existe el usuario 
        if (!usuarioDB){
            return res.status(400).json({
                ok: false,
                err:{
                    message: "Usuario o contraseña incorrecta"
                }
            });
        }

        //Verificamos la contraseña
        if(!bcrypt.compareSync(body.password,usuarioDB.password)){
            return res.status(400).json({
                ok: false,
                err:{
                    message: "Usuario o contraseña incorrecta"
                }
            });
        }

        //Fecha de expiración 30 días 
        let token = jwt.sign({
            usuario: usuarioDB
        },process.env.SEED,{ expiresIn: process.env.CADUCIDAD_TOKEN});

        res.json({
            ok:true,
            usuario: usuarioDB,
            token
        });

    });
});




module.exports = app;
