const jwt = require('jsonwebtoken');

//==================
//Verificar token
//==================
let verificaToken = (req,res,next) => {

    let token = req.get('Authorization');

    jwt.verify(token, process.env.SEED, (err,decoded)=>{
        if(err){
            return res.status(401).json({
                ok:false,
                err: {
                    message: 'Token no válido'
                }
            });
        }

        req.usuario = decoded.usuario;
        next();
    });
   
};

//==================
//Verificar AdminRole
//==================
let verificaAdmin_Role = (req,res,next) => {

    if(!req.usuario.role === 'ADMIN_ROLE'){

        return res.json({
            ok:false,
            err: {
                message: 'Usuario no valido'
            }
        });
    }
    next();    
};

module.exports = {
    verificaToken,verificaAdmin_Role
}