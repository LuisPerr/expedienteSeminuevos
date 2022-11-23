const nodemailer = require('nodemailer');
const Promise = require('bluebird');

function envia (to, subject, html){
    return new Promise(function(resolve, reject){
        var transporter = nodemailer.createTransport({
            service: 'Gmail',
            host: 'smtp.gmail.com',           
            secure: true,          
            auth: {
                user: 'expdigseminuevos@grupoandrade.com',
                pass: 'Vu5aJF=K#'
            },
            tls: { rejectUnauthorized: false }
       });
         var message = {
            from: '"Grupo Andrade"<expdigseminuevos@grupoandrade.com>',
            to: to,
            subject: subject,
            html: html,
        };
        transporter.sendMail(message, function(err) {
            if (!err) {
                resolve({response: {success: 1, msg: 'Se envió el correo con éxito.'}});
            } else {
                resolve({response: {success: 0, msg: 'No se envió el correo con éxito, intentelo mas tarde.', error: err}});
            }
        });
        transporter.close;
     });
    
};

module.exports = { envia };