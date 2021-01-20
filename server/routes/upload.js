const express = require('express');
const fileUpload = require('express-fileupload');
const app = express();

const Usuario = require('../models/usuario')
const Producto = require('../models/producto')

const fs = require('fs');
const path = require('path');

// default options
app.use(fileUpload({ useTempFiles: true }));

app.put('/upload/:tipo/:id', (req, res) => {

    let tipo = req.params.tipo;
    let id = req.params.id;

    if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400)
            .json(
                {
                    ok: false,
                    err: {
                        message: 'No se ha seleccionado ningún archivo'
                    }
                });
    }

    //Validar tipos
    let tiposValidos = ['productos', 'usuarios'];
    if (tiposValidos.indexOf(tipo) < 0) {
        return res.status(400)
            .json({
                ok: false,
                err: {
                    message: 'Los tipos validos son: ' + tiposValidos.join(', '),
                }
            })
    }


    let archivo = req.files.archivo;

    let nombreCortado = archivo.name.split('.');
    let extension = nombreCortado[nombreCortado.length - 1]
    let extensionesPermitidas = ['png', 'jpg', 'gif', 'jpeg'];

    //Validar extensión
    if (extensionesPermitidas.indexOf(extension) < 0) {
        return res.status(400)
            .json({
                ok: false,
                err: {
                    message: 'Las extensiones permitidas son ' + extensionesPermitidas.join(', '),
                    ext: extension
                }
            })
    }


    //Cambiar nombre al archivo
    let nombreArchivo = `${id}-${new Date().getMilliseconds()}.${extension}`;

    uploadPath = `uploads/${tipo}/${nombreArchivo}`;
    console.log(uploadPath);

    archivo.mv(uploadPath, (err) => {
        if (err)
            return res.status(500).json({
                ok: false,
                err
            });

        //Aquí la imagen se cargó y a continuación decidimos donde la almacenamos
        if(tipo==='usuarios'){
            imagenUsuario(id, res, nombreArchivo);
        }else{
            imagenProducto(id, res, nombreArchivo);
        }
    });
});

function imagenUsuario(id, res, nombreArchivo) {

    Usuario.findById(id, (err, usuarioDB) => {

        if (err) {
            borraArchivo(usuarioDB.img, 'usuarios');//borramos imagen del directorio sí ocurre error
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!usuarioDB) {
            borraArchivo(usuarioDB.img, 'usuarios');//borramos imagen del directorio sí ocurre error
            return res.status(500).json({
                ok: false,
                err: {
                    message: 'Usuario no existe'
                }
            });
        }

        //Borra referencia anterior
        borraArchivo(usuarioDB.img, 'usuarios');

        usuarioDB.img = nombreArchivo;
        usuarioDB.save((err, usuarioDB) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            res.json({
                ok: true,
                usuario: usuarioDB,
                img: nombreArchivo
            });
        });
    });

}

function imagenProducto(id, res, nombreArchivo) {

    Producto.findById(id, (err, productoDB) => {

        if (err) {
            borraArchivo(productoDB.img, 'productos');//borramos imagen del directorio sí ocurre error
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!productoDB) {
            borraArchivo(productoDB.img, 'productos');//borramos imagen del directorio sí ocurre error
            return res.status(500).json({
                ok: false,
                err: {
                    message: 'Producto no existe'
                }
            });
        }

        //Borra referencia anterior
        borraArchivo(productoDB.img, 'productos');

        productoDB.img = nombreArchivo;
        productoDB.save((err, productoDB) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            res.json({
                ok: true,
                producto: productoDB,
                img: nombreArchivo
            });
        });
    });


}

function borraArchivo(nombreImagen, tipo) {
    //Verificar sí el usuario ya disponía de un path de imagen y sí es así recupera el que 
    //ya tuviese gurdado y lo elimina de la carpeta 
    let pathImagen = path.resolve(__dirname, `../../uploads/${tipo}/${nombreImagen}`);
    if (fs.existsSync(pathImagen)) {
        fs.unlinkSync(pathImagen);
    }
}

module.exports = app;