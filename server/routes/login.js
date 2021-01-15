const express = require('express');

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

//Configuracion autenticación por Google
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.CLIENT_ID);


const Usuario = require('../models/usuario');

const app = express();

app.post('/login', (req, res) => {

    let body = req.body;

    //1, verificar el correo
    Usuario.findOne({ email: body.email }, (err, usuarioDB) => {

        //controlamos posibles errores del servidor 
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        //Verificamos si existe el usuario 
        if (!usuarioDB) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: "Usuario o contraseña incorrecta"
                }
            });
        }

        //Verificamos la contraseña
        if (!bcrypt.compareSync(body.password, usuarioDB.password)) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: "Usuario o contraseña incorrecta"
                }
            });
        }

        //Fecha de expiración 30 días 
        let token = jwt.sign({
            usuario: usuarioDB
        }, process.env.SEED, { expiresIn: process.env.CADUCIDAD_TOKEN });

        //Enviamos el token firmado
        res.json({
            ok: true,
            usuario: usuarioDB,
            token
        });

    });
});


//Configuraciones de Google
async function verify(token) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.CLIENT_ID
    });
    const payload = ticket.getPayload();

    return {
        nombre: payload.name,
        email: payload.email,
        img: payload.picture,
        google: true
    }
}


app.post('/google', async (req, res) => {

    let token = req.body.idtoken;

    let googleUser = await verify(token)
        .catch(e => {
            return res.status(403).json({
                ok: false,
                err: e
            });
        });

    //Verificamos sí ya exite un correo en nuestra BD 
    Usuario.findOne({ email: googleUser.email }, (err, usuarioDB) => {

        //controlamos posibles errores del servidor 
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        };

        //Sí el usuario existe no dejamos que se autentique con google
        if(usuarioDB){

            if(usuarioDB.google === false){
                return res.status(400).json({
                    ok: false,
                    err: {
                        message: 'Debe de utilizar su autenticación normal'
                    }
                });
            }else{
                //Renovamos el token 
                let token = jwt.sign({
                    usuario: usuarioDB
                }, process.env.SEED, { expiresIn: process.env.CADUCIDAD_TOKEN });
        
                //Enviamos el token firmado
                return res.json({
                    ok: true,
                    usuario: usuarioDB,
                    token
                });
            }
        }else{
            //Si el usuarion no existe en la base de datos lo creamos 
            let usuario = new Usuario();

            usuario.nombre = googleUser.nombre;
            usuario.email = googleUser.email;
            usuario.img = googleUser.img;
            usuario.google = true;
            usuario.password = ':)';//Dejamos un string para pasar la validación del modelo

            usuario.save((err,usuarioDB) =>{

                if (err) {
                    return res.status(500).json({
                        ok: false,
                        err
                    });
                };

                let token = jwt.sign({
                    usuario: usuarioDB
                }, process.env.SEED, { expiresIn: process.env.CADUCIDAD_TOKEN });
        
                //Enviamos el token firmado
                return res.json({
                    ok: true,
                    usuario: usuarioDB,
                    token
                });


            });
        }
    });
});


module.exports = app;
