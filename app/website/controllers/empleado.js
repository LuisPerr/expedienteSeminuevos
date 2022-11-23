var empleadoView = require('../views/reference'),
    empleadoModel = require('../models/dataAccess');

var path = require('path');
//var webPage = require('webpage');
var request = require('request');


var empleado = function(conf) {
       

    this.conf = conf || {};

    this.view = new empleadoView();
    this.model = new empleadoModel({
        parameters: this.conf.parameters
    });

    this.response = function() {
        this[this.conf.funcionalidad](this.conf.req, this.conf.res, this.conf.next);
    };
};



empleado.prototype.get_usuarioCXP = function(req, res, next) {
    console.log('entre USUARIO')
    var self = this;
    var params = [ { name: 'folio', value: req.query.folio, type: self.model.types.STRING } ];

    this.model.query('SEL_USUARIO_CXP_SP', params, function(error, result) {
        self.view.expositor(res, {
            error: error,
            result: result
        });
    });
};

empleado.prototype.get_usuario = function(req, res, next) {
    var self = this;
    var params = [ { name: 'idUsuario', value: req.query.idUsuario, type: self.model.types.INT },
                   { name: 'url', value: req.query.url, type: self.model.types.STRING }  ];

    this.model.query('[Seguridad].[dbo].[SEL_USUARIO_PERFIL_SP]', params, function(error, result) {
        self.view.expositor(res, {
            error: error,
            result: result[0]
        });
    });
};

empleado.prototype.get_permisosUsuario = function(req, res, next) {
    var self = this;

    var params = [ 
        { name: 'idUsuario', value: req.query.idUsuario, type: self.model.types.INT },
        { name: 'idPerfil', value: req.query.idPerfil, type: self.model.types.INT }  
    ];

    this.model.query('[expedienteSeminuevo].[SEL_SEG_USUARIO_PERFIL_SP]', params, function(error, result) {
        self.view.expositor(res, {
            error: error,
            result: result
        });
    });
};
module.exports = empleado;