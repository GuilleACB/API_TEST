// ============================
//  Puerto
// ============================
process.env.PORT = process.env.PORT || 3000;


// ============================
//  Entorno
// ============================
process.env.NODE_ENV = process.env.NODE_ENV || 'dev';

// ============================
//  token
// ============================
process.env.CADUCIDAD_TOKEN = '48h'
process.env.SEED = process.env.SEED || 'este-es-el-secret-desarrollo';

// ============================
//  Base de datos
// ============================
let urlDB;

if (process.env.NODE_ENV === 'dev') {
    urlDB = 'mongodb://localhost:27017/cafe';
} else {
    urlDB = process.env.MONGO_URI;
}
process.env.URLDB = urlDB;

// ============================
//  Google client
// ============================
process.env.CLIENT_ID = process.env.CLIENT_ID || '534273854080-lnq62i9pp3a1g7qn68gfdsu7fl34eg2h.apps.googleusercontent.com';