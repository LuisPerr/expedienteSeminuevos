var searchView = require('../views/reference'),
    searchModel = require('../models/dataAccess');

var path = require('path');
cron = require('node-cron')
//var webPage = require('webpage');
var Request = require('request');
var sendMail = require('./sendMail');
var search = function (conf) {
    this.conf = conf || {};

    this.view = new searchView();
    this.model = new searchModel({
        parameters: this.conf.parameters
    });

    this.response = function () {
        this[this.conf.funcionalidad](this.conf.req, this.conf.res, this.conf.next);
    };
};


search.prototype.get_procesos = function (req, res, next) {

    var self = this;

    var params = [
        { name: 'CXP', value: req.query.CXP, type: self.model.types.INT },
        { name: 'CXC', value: req.query.CXC, type: self.model.types.INT }
    ];
    
    this.model.query('[expedienteSeminuevo].[SEL_PROCESO_SP]', params, function (error, result) {
        self.view.expositor(res, {
            error: error,
            result: result
        });
    });
};
module.exports = search;