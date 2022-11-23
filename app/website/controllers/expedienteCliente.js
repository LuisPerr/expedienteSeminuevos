var expedienteClienteView = require('../views/reference'),
expedienteClienteModel = require('../models/dataAccess');

var path = require('path');
//var webPage = require('webpage');
var request = require('request');


var expedienteCliente = function(conf) {
       

    this.conf = conf || {};

    this.view = new expedienteClienteView();
    this.model = new expedienteClienteModel({
        parameters: this.conf.parameters
    });

    this.response = function() {
        this[this.conf.funcionalidad](this.conf.req, this.conf.res, this.conf.next);
    };
};



expedienteCliente.prototype.get_InsToken = function(req, res, next) {
    var self = this;
    var params = [ { name: 'idExpediente', value: req.query.idExpediente, type: self.model.types.INT },
                   { name: 'token', value: req.query.token, type: self.model.types.STRING },
                   { name: 'usuarioBpro', value: req.query.usuarioBpro, type: self.model.types.STRING },
                   { name: 'idUsuario', value: req.query.idUsuario, type: self.model.types.INT },
                   { name: 'idHistorico', value: req.query.idHistorico, type: self.model.types.INT }    ];

    this.model.query('[expedienteCliente].[INS_TOKEN_SP]', params, function(error, result) {
        self.view.expositor(res, {
            error: error,
            result: result[0]
        });
    });
};

module.exports = expedienteCliente;