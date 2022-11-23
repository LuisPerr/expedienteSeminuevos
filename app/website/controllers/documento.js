var documentoView = require('../views/reference'),
    documentoModel = require('../models/dataAccess');

var path = require('path');
//var webPage = require('webpage');
var request = require('request');

var soap = require('soap');
var parseString = require('xml2js').parseString;
var fs = require('fs');


var documento = function (conf) {


    this.conf = conf || {};

    this.view = new documentoView();
    this.model = new documentoModel({
        parameters: this.conf.parameters
    });

    this.response = function () {
        this[this.conf.funcionalidad](this.conf.req, this.conf.res, this.conf.next);
    };
};


documento.prototype.get_proceso = function (req, res, next) {

    var self = this;

    var params = [
        { name: 'idProceso', value: req.query.idProceso, type: self.model.types.INT },
        { name: 'folio', value: req.query.folio, type: self.model.types.STRING }
    ];

    this.model.query('SEL_RESUMEN_PROCESOS_SP', params, function (error, result) {
        self.view.expositor(res, {
            error: error,
            result: result
        });
    });
};


documento.prototype.get_permisos = function (req, res, next) {

    var self = this;

    var params = [
        { name: 'idUsuario', value: req.query.idUsuario, type: self.model.types.INT },
        { name: 'idAccion', value: req.query.idAccion, type: self.model.types.INT }
    ];

    this.model.query('SEL_PERMISOS_ACCION_SEGURIDAD_SP', params, function (error, result) {
        self.view.expositor(res, {
            error: error,
            result: result
        });
    });
};
documento.prototype.get_byNodo = function (req, res, next) {

    var self = this;

    var params = [
        { name: 'idNodo', value: req.query.nodo, type: self.model.types.INT },
        { name: 'folio', value: req.query.folio, type: self.model.types.STRING },
        { name: 'idperfil', value: req.query.perfil, type: self.model.types.INT }
    ];
    
    this.model.query('SEL_DOCUMENTOS_NODO_GENERAL_SP', params, function (error, result) {
        self.view.expositor(res, {
            error: error,
            result: result
        });
    });
};


documento.prototype.get_pdfArraysPun = function (req, res, next) {
    var self = this;

    var url = this.conf.parameters.WSGeneraPdf;
    if (req.query.tipo && req.query.factura && req.query.nodo) {
        var args = {
            Tipo: req.query.tipo,
            Documento: req.query.factura,
            Nodo: req.query.nodo
        };
        soap.createClient(url, function (err, client) {
            if (err) {
                console.log('Error 4', err)

                self.view.expositor(res, {
                    mensaje: "Hubo un problema intente de nuevo",
                });
            } else {
                console.log(args)
                client.GenerarPdfArray(args, function (err, result, raw) {
                    if (err) {
                        console.log('Error 3', err)

                        self.view.expositor(res, {
                            mensaje: "Hubo un problema intente de nuevo",
                        });
                    } else {
                        parseString(raw, function (err, result) {
                            if (err) {
                                console.log('Error 2', err)

                                self.view.expositor(res, {
                                    mensaje: "Hubo un problema intente de nuevo",
                                });
                            } else {
                                console.log('Llegue hasta el final');
                                console.log(result["soap:Envelope"]["soap:Body"][0]["GenerarPdfArrayResponse"][0]["GenerarPdfArrayResult"][0], 'Lo logre?')
                                var arrayBits = result["soap:Envelope"]["soap:Body"][0]["GenerarPdfArrayResponse"][0]["GenerarPdfArrayResult"][0];
                                self.view.expositor(res, {
                                    result: {
                                        arrayBits: arrayBits
                                    }
                                });
                            }
                        });
                    }

                });
            }
        });
    } else {
        console.log('Error 1')
        self.view.expositor(res, {
            mensaje: "Hubo un problema intente de nuevo",
        });
    }
}
documento.prototype.get_cotizaciones = function (req, res, next) {

    var self = this;

    var params = [
        { name: 'folio', value: req.query.folio, type: self.model.types.STRING }
    ];

    this.model.queryAllRecordSet('SEL_COTIZACIONES_SP', params, function (error, result) {
        self.view.expositor(res, {
            error: error,
            result: result
        });
    });
};
documento.prototype.get_pdf = function (req, res, next) {
    var self = this;
    console.log('hi');
    console.log(req.query.tipo, req.query.factura, req.query.nodo)

    var url = this.conf.parameters.WSGeneraPdf;
    if (req.query.tipo && req.query.factura && req.query.nodo) {
        var args = {
            Tipo: req.query.tipo,
            Documento: req.query.factura,
            Nodo: req.query.nodo
        };
        soap.createClient(url, function (err, client) {
            console.log(url)
            if (err) {
                console.log('Error 4', err)

                self.view.expositor(res, {
                    mensaje: "Hubo un problema intente de nuevo",
                });
            } else {
                console.log(args)
                client.GenerarPdf(args, function (err, result, raw) {
                    if (err) {
                        console.log('Error 3', err)

                        self.view.expositor(res, {
                            mensaje: "Hubo un problema intente de nuevo",
                        });
                    } else {
                        parseString(raw, function (err, result) {
                            if (err) {
                                console.log('Error 2', err)

                                self.view.expositor(res, {
                                    mensaje: "Hubo un problema intente de nuevo",
                                });
                            } else {
                                console.log('Llegue hasta el final');
                                console.log(result["soap:Envelope"]["soap:Body"][0]["GenerarPdfResponse"][0]["GenerarPdfResult"], 'Lo logre?')
                                var arrayBits = result["soap:Envelope"]["soap:Body"][0]["GenerarPdfResponse"][0]["GenerarPdfResult"];
                                self.view.expositor(res, {
                                    result: {
                                        arrayBits: arrayBits
                                    }
                                });
                            }
                        });
                    }

                });
            }
        });
    } else {
        console.log('Error 1')
        self.view.expositor(res, {
            mensaje: "Hubo un problema intente de nuevo",
        });
    }
}
documento.prototype.get_resumenCotiza = function (req, res, next) {

    var self = this;

    var params = [
        { name: 'FolioCotizacion', value: req.query.folio, type: self.model.types.STRING }
    ];

    this.model.query('SEL_RESUMEN_COTIZACION_SP', params, function (error, result) {
        self.view.expositor(res, {
            error: error,
            result: result
        });
    });
};
documento.prototype.get_resumenGeneral = function (req, res, next) {

    var self = this;

    var params = [
        { name: 'FolioCotizacion', value: req.query.folio, type: self.model.types.STRING },
        { name: 'idCotizacionDetalle', value: req.query.idCot, type: self.model.types.STRING }
    ];

    this.model.queryAllRecordSet('SEL_RESUMEN_COTIZACIONUNIDAD_SP', params, function (error, result) {
        self.view.expositor(res, {
            error: error,
            result: result
        });
    });
};
documento.prototype.get_verificaExisteDoc = function (req, res, next) {

    var self = this;

    var rutaDoc = req.query.rutaDoc;
    if (rutaDoc != null) {
        var rutaDesarrollo = this.conf.parameters.RutaFisica;
        //'http://192.168.20.92';
        //var rutaProduccion ='http://192.168.20.89'
        var rutaFisica = rutaDoc.replace(rutaDesarrollo, "E:");
        //console.log(rutaFisica, 'SERE LA RUTA ')
        //rutaFisica = rutaDoc.replace(rutaProduccion, "E:");
        //console.log(rutaFisica, 'SERE LA RUTA ')
        var result = [];

        if (fs.existsSync(rutaFisica)) {
            result = { respuesta: 1, mensaje: 'Si existe' }
        } else {
            result = { respuesta: 0, mensaje: 'No existe' }
        }
    } else {
        result = { respuesta: 0, mensaje: 'No existe' }
    }


    //console.log('RESPUESTA', result)

    self.view.expositor(res, {
        error: null,
        result: result
    });
};

documento.prototype.get_facturasPorVin = function (req, res, next) {
    var self = this;
    var params = [
        { name: 'cotizacion', value: req.query.cotizacion, type: self.model.types.STRING }
    ];
    console.log('params', params);

    this.model.query('SEL_FACTURAS_VIN_SP', params, function (error, result) {
        console.log('result', result);
        self.view.expositor(res, {
            error: error,
            result: result
        });
    });
};


documento.prototype.get_pdfInvoce = function (req, res, next) {
    var self = this;
    var url = this.conf.parameters.WSInvoce;

    if (req.query.rfcEmisor && req.query.rfcReceptor && req.query.serie && req.query.folio) {

        var args = {
            RFCEMISOR: req.query.rfcEmisor,
            RFCRECEPTOR: req.query.rfcReceptor,
            SERIE: req.query.serie,
            FOLIO: req.query.folio
        };

        soap.createClient(url, function (err, client) {
            if (err) {
                self.view.expositor(res, {
                    success: 0,
                    error: 'Hubo un problema intente de nuevo'
                });
            } else {
                client.MuestraFactura(args, function (err, result, raw) {
                    if (err) {
                        self.view.expositor(res, {
                            success: 0,
                            error: 'Hubo un problema intente de nuevo'
                        });
                    } else {
                        parseString(raw, function (err, result) {
                            if (err) {
                                self.view.expositor(res, {
                                    success: 0,
                                    error: 'Hubo un problema intente de nuevo'
                                });
                            } else {
                                var arrayBits = result["soap:Envelope"]["soap:Body"][0]["MuestraFacturaResponse"][0]["MuestraFacturaResult"][0]["pdf"][0];
                                var mensaje = result["soap:Envelope"]["soap:Body"][0]["MuestraFacturaResponse"][0]["MuestraFacturaResult"][0]["mensajeresultado"][0];
                                if(arrayBits.length > 0){
                                    self.view.expositor(res, {
                                        result: {
                                            success : 1,
                                            arrayBits: arrayBits,
                                            mensaje: mensaje
                                        }
                                    });
                                }else{
                                    self.view.expositor(res, {
                                        success: 0,
                                        error: 'Hubo un problema intente de nuevo'
                                    });
                                }
                            }
                        });
                    }
                });
            }
        });
    } else {
        self.view.expositor(res, {
            success: 0,
            error: 'Hubo un problema intente de nuevo'
        });
    }
};


module.exports = documento;