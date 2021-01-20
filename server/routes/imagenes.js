const express = require('express');

const fs = require('fs');
const path = require('path');
const {verificaTokenImg} = require('../middlewares/autenticacion');

let app = express();

app.get('/imagen/:tipo/:img',verificaTokenImg, (req, res) => {

    let tipo = req.params.tipo;
    let img = req.params.img;

    let imagenPath = path.resolve(__dirname, `../../uploads/${tipo}/${img}`);
    let noImagenPath = path.resolve(__dirname, '../assets/no-image.jpg');

    if (fs.existsSync(imagenPath)) {
        res.sendFile(imagenPath);
    } else {
        res.sendFile(noImagenPath);
    }
});

module.exports = app;
