var nodoView = require('../views/reference'),
    nodoModel = require('../models/dataAccess');

var path = require('path');
var soap = require('soap');
//var webPage = require('webpage');
var request = require('request');
var fs = require("fs");
var sendMail = require('./sendMail');
var publicaIntelimotor = require('./publicaIntelimotors');
var confParams = require('../../../conf')
var cron = require('node-cron');
const { parseString } = require('xml2js');
const { resolve } = require('path');
const vinFlotilla = require('./vinFlotilla');

var nombresCorp = '', mailsCorp = '';
var htmlCorpo = '', empresaCorpo = '';
var tipoNotificaciones = confParams.tiposNotificaciones;
var nombreSucursal = ''
var sendNonitifacionesMail = confParams.sendNonitifaciones;
var urlUnidadIntelimotor = confParams.urlUnidadIntelimotor;
var apiKeyIntelimotor = confParams.apiKeyIntelimotor;
var apiSecretIntelimotor = confParams.apiSecretIntelimotor;
var urlIntelimotorsUnidades = confParams.urlGetDataByVinEmpresaSucursal;
var totalInsertadosFacturaAccesorios = 0;
var totalInsertadosFacturasRecibos = 0;
var allFacturasRecibos = [];
/**
 * Variables para el envio del correo del gerente cuando este completo y aun no lo aprueba
 */
const sendMailManagerEnlace = confParams.expedientesManagerEnlace;
var empresaManagerMail = '';
var stringMailManager = '';
var mialsManagerMail = '';
var usersManagerMail = '';

var nodo = function (conf) {
    this.conf = conf || {};

    this.view = new nodoView();
    this.model = new nodoModel({
        parameters: this.conf.parameters
    });

    this.response = function () {
        this[this.conf.funcionalidad](this.conf.req, this.conf.res, this.conf.next);
    };
};

nodo.prototype.get_verificaUsuario = function (req, res, next) {

    var self = this;

    var params = [
        { name: 'idUsuario', value: req.query.idUsuario, type: self.model.types.INT },
        { name: 'folio', value: req.query.folio, type: self.model.types.STRING }
    ];

    this.model.query('SEL_BOTON_CERRAR_NODO_SP', params, function (error, result) {
        self.view.expositor(res, {
            error: error,
            result: result
        });
    });
};

promiseReturnEstatus = (idDocumento, idExpediente, idProceso) => {
    return new Promise((reject) => {
        var model = new nodoModel({
            parameters: confParams
        });

        let params = [
            { name: 'idDocumento', value: idDocumento, type: model.types.INT },
            { name: 'idExpediente', value: idExpediente, type: model.types.INT },
            { name: 'idProceso', value: idProceso, type: model.types.INT }
        ];

        model.queryAllRecordSet('[expedienteSeminuevo].[SEL_DOCUMENTO]', params, function (error, responsed) {
            reject({ idEstatus: responsed[0][0].estatus, nombreEstatus: responsed[0][0].estatusNombre, idEstatusEnlace: responsed[1][0].estatusEnlace, nombreEstatusEnlace: responsed[1][0].estatusNombreEnlace });
        });
    });
};

nodo.prototype.get_allDocumentosByVin = function (req, res, next) {
    var self = this;

    var params = [
        { name: 'vin', value: req.query.vin, type: self.model.types.STRING },
        { name: 'idEmpresa', value: req.query.idEmpresa, type: self.model.types.INT },
        { name: 'idSucursal', value: req.query.idSucursal, type: self.model.types.INT },
        { name: 'idProceso', value: req.query.idProceso, type: self.model.types.INT },
        { name: 'idPerfil', value: req.query.idPerfil, type: self.model.types.INT },
        { name: 'idUsuario', value: req.query.idUsuario, type: self.model.types.INT }
    ];
    this.model.queryAllRecordSet('[expedienteSeminuevo].[SEL_DOCUMENTOS_BY_PROCESO_AND_VIN]', params, async function (error, result) {
        if (result[0][0].success === 2) {
            var modelRecreacion = new nodoModel({
                parameters: confParams
            });
            let paramsRecreacion = [
                { name: 'vin', value: req.query.vin, type: self.model.types.STRING },
                { name: 'idEmpresa', value: req.query.idEmpresa, type: self.model.types.INT },
                { name: 'idSucursal', value: req.query.idSucursal, type: self.model.types.INT }
            ];
            modelRecreacion.queryAllRecordSet('[expedienteSeminuevo].[INS_HISTORICO_ALL_EXPEDIENTE_SP]', paramsRecreacion, async function (errorRecreacion, resultRecreacion) {
                self.view.expositor(res, {
                    error: errorRecreacion,
                    result: resultRecreacion
                });
            });
        } else if (result[0][0].success === 3) {
            let respRecreaCXC = await promiseRecreaCXC(params, result[0][0].vin, result[0][0].cotizacionGuardada, result[0][0].idExpediente, result[0][0].currentRutaExpediente, result[0][0].newRutaExpediente);
            if (respRecreaCXC[0][0].success === 1) {
                self.view.expositor(res, {
                    error: error,
                    result: result
                });
            } else {
                self.view.expositor(res, {
                    error: error,
                    result: respRecreaCXC
                });
            }
        } else {
            for (let i = 0; i <= result[1].length - 1; i++) {
                if (result[1][i].doc_varios == 1 && result[1][i].id_documentoGuardado != null) {
                    var resPromise = await promiseReturnEstatus(result[1][i].id_documento, result[1][i].idExpediente, result[1][i].id_proceso);
                    result[1][i].id_estatus = resPromise.idEstatus;
                    result[1][i].est_descripcion = resPromise.nombreEstatus;
                    result[1][i].estatusEnlace = resPromise.idEstatusEnlace;
                    result[1][i].descripcionEstatusEnlace = resPromise.nombreEstatusEnlace;
                };
            };

            if (result[0][0].success == 1 && parseInt(req.query.idEmpresa) !== 35) {
                await getDataIntelimotors(result[2][0].VEH_NUMSERIE, req.query.idEmpresa, req.query.idSucursal, result[1][0].idExpediente);
            };

            if (req.query.idProceso == 1 && result[0][0].success == 1 && parseInt(req.query.idEmpresa) !== 35) {
                await promiseGetDocumentsIntelimotors(result[1]);
            };

            self.view.expositor(res, {
                error: error,
                result: result
            });
        };
    });
};

nodo.prototype.get_allDocumentosByRfc = function (req, res, next) {
    var self = this;

    var params = [
        { name: 'rfc', value: req.query.rfc, type: self.model.types.STRING },
        { name: 'idEmpresa', value: req.query.idEmpresa, type: self.model.types.INT },
        { name: 'idSucursal', value: req.query.idSucursal, type: self.model.types.INT },
        { name: 'idProceso', value: req.query.idProceso, type: self.model.types.INT },
        { name: 'idPerfil', value: req.query.idPerfil, type: self.model.types.INT },
        { name: 'idUsuario', value: req.query.idUsuario, type: self.model.types.INT }
    ];

    this.model.queryAllRecordSet('[expedienteSeminuevo].[SEL_DOCUMENTOS_BY_PROCESO_AND_RFC]', params, async function (error, result) {
        for (let i = 0; i <= result[1].length - 1; i++) {
            if (result[1][i].doc_varios == 1 && result[1][i].id_documentoGuardado != null) {
                var resPromise = await promiseReturnEstatus(result[1][i].id_documento, result[1][i].idExpediente, result[1][i].id_proceso);
                result[1][i].id_estatus = resPromise.idEstatus;
                result[1][i].est_descripcion = resPromise.nombreEstatus;
                result[1][i].estatusEnlace = resPromise.idEstatusEnlace;
                result[1][i].descripcionEstatusEnlace = resPromise.nombreEstatusEnlace;
            };
        };

        if (result[0][0].success == 1 && parseInt(req.query.idEmpresa) !== 35) {
            await getDataIntelimotors(result[2][0].VEH_NUMSERIE, req.query.idEmpresa, req.query.idSucursal, result[1][0].idExpediente);
        }

        if (req.query.idProceso == 1 && result[0][0].success == 1 && parseInt(req.query.idEmpresa) !== 35) {
            await promiseGetDocumentsIntelimotors(result[1]);
        };

        self.view.expositor(res, {
            error: error,
            result: result
        });
    });
};

nodo.prototype.get_allDocumentosByIdCliente = function (req, res, next) {
    var self = this;

    var params = [
        { name: 'idCliente', value: req.query.idCliente, type: self.model.types.INT },
        { name: 'idEmpresa', value: req.query.idEmpresa, type: self.model.types.INT },
        { name: 'idSucursal', value: req.query.idSucursal, type: self.model.types.INT },
        { name: 'idProceso', value: req.query.idProceso, type: self.model.types.INT },
        { name: 'idPerfil', value: req.query.idPerfil, type: self.model.types.INT },
        { name: 'idUsuario', value: req.query.idUsuario, type: self.model.types.INT }
    ];

    this.model.queryAllRecordSet('[expedienteSeminuevo].[SEL_DOCUMENTOS_BY_PROCESO_AND_IDCLIENTE]', params, async function (error, result) {
        for (let i = 0; i <= result[1].length - 1; i++) {
            if (result[1][i].doc_varios == 1 && result[1][i].id_documentoGuardado != null) {
                var resPromise = await promiseReturnEstatus(result[1][i].id_documento, result[1][i].idExpediente, result[1][i].id_proceso);
                result[1][i].id_estatus = resPromise.idEstatus;
                result[1][i].est_descripcion = resPromise.nombreEstatus;
                result[1][i].estatusEnlace = resPromise.idEstatusEnlace;
                result[1][i].descripcionEstatusEnlace = resPromise.nombreEstatusEnlace;
            };
        };

        if (result[0][0].success == 1 && parseInt(req.query.idEmpresa) !== 35) {
            await getDataIntelimotors(result[2][0].VEH_NUMSERIE, req.query.idEmpresa, req.query.idSucursal, result[1][0].idExpediente);
        }

        if (req.query.idProceso == 1 && result[0][0].success == 1 && parseInt(req.query.idEmpresa) !== 35) {
            await promiseGetDocumentsIntelimotors(result[1]);
        };

        self.view.expositor(res, {
            error: error,
            result: result
        });
    });
};

nodo.prototype.get_allDocumentosByFactura = function (req, res, next) {
    var self = this;

    var params = [
        { name: 'factura', value: req.query.factura, type: self.model.types.STRING },
        { name: 'idEmpresa', value: req.query.idEmpresa, type: self.model.types.INT },
        { name: 'idSucursal', value: req.query.idSucursal, type: self.model.types.INT },
        { name: 'idProceso', value: req.query.idProceso, type: self.model.types.INT },
        { name: 'idPerfil', value: req.query.idPerfil, type: self.model.types.INT },
        { name: 'idUsuario', value: req.query.idUsuario, type: self.model.types.INT }
    ];

    this.model.queryAllRecordSet('[expedienteSeminuevo].[SEL_DOCUMENTOS_BY_PROCESO_AND_FACTURA]', params, async function (error, result) {
        if (result[0][0].success === 2) {
            var modelRecreacion = new nodoModel({
                parameters: confParams
            });
            let paramsRecreacion = [
                { name: 'vin', value: result[0][0].vin, type: self.model.types.STRING },
                { name: 'idEmpresa', value: req.query.idEmpresa, type: self.model.types.INT },
                { name: 'idSucursal', value: req.query.idSucursal, type: self.model.types.INT }
            ];
            modelRecreacion.queryAllRecordSet('[expedienteSeminuevo].[INS_HISTORICO_ALL_EXPEDIENTE_SP]', paramsRecreacion, async function (errorRecreacion, resultRecreacion) {
                self.view.expositor(res, {
                    error: errorRecreacion,
                    result: resultRecreacion
                });
            });
        } else if (result[0][0].success === 3) {
            let respRecreaCXC = await promiseRecreaCXC(params, result[0][0].vin, result[0][0].cotizacionGuardada, result[0][0].idExpediente, result[0][0].currentRutaExpediente, result[0][0].newRutaExpediente);
            if (respRecreaCXC[0][0].success === 1) {
                self.view.expositor(res, {
                    error: error,
                    result: result
                });
            } else {
                self.view.expositor(res, {
                    error: error,
                    result: respRecreaCXC
                });
            }
        } else {
            for (let i = 0; i <= result[1].length - 1; i++) {
                if (result[1][i].doc_varios == 1 && result[1][i].id_documentoGuardado != null) {
                    var resPromise = await promiseReturnEstatus(result[1][i].id_documento, result[1][i].idExpediente, result[1][i].id_proceso);
                    result[1][i].id_estatus = resPromise.idEstatus;
                    result[1][i].est_descripcion = resPromise.nombreEstatus;
                    result[1][i].estatusEnlace = resPromise.idEstatusEnlace;
                    result[1][i].descripcionEstatusEnlace = resPromise.nombreEstatusEnlace;
                };
            };

            if (result[0][0].success == 1 && parseInt(req.query.idEmpresa) !== 35) {
                await getDataIntelimotors(result[2][0].VEH_NUMSERIE, req.query.idEmpresa, req.query.idSucursal, result[1][0].idExpediente);
            }

            if (req.query.idProceso == 1 && result[0][0].success == 1 && parseInt(req.query.idEmpresa) !== 35) {
                await promiseGetDocumentsIntelimotors(result[1]);
            };

            self.view.expositor(res, {
                error: error,
                result: result
            });
        };
    });
};

nodo.prototype.get_allDocumentosByOrdenCompra = function (req, res, next) {
    var self = this;

    var params = [
        { name: 'ordenCompra', value: req.query.ordenCompra, type: self.model.types.STRING },
        { name: 'idEmpresa', value: req.query.idEmpresa, type: self.model.types.INT },
        { name: 'idSucursal', value: req.query.idSucursal, type: self.model.types.INT },
        { name: 'idProceso', value: req.query.idProceso, type: self.model.types.INT },
        { name: 'idPerfil', value: req.query.idPerfil, type: self.model.types.INT },
        { name: 'idUsuario', value: req.query.idUsuario, type: self.model.types.INT }
    ];

    this.model.queryAllRecordSet('[expedienteSeminuevo].[SEL_DOCUMENTOS_BY_PROCESO_AND_ORDEN_COMPRA]', params, async function (error, result) {
        if (result[0][0].success === 2) {
            var modelRecreacion = new nodoModel({
                parameters: confParams
            });
            let paramsRecreacion = [
                { name: 'vin', value: result[0][0].vin, type: self.model.types.STRING },
                { name: 'idEmpresa', value: req.query.idEmpresa, type: self.model.types.INT },
                { name: 'idSucursal', value: req.query.idSucursal, type: self.model.types.INT }
            ];
            modelRecreacion.queryAllRecordSet('[expedienteSeminuevo].[INS_HISTORICO_ALL_EXPEDIENTE_SP]', paramsRecreacion, async function (errorRecreacion, resultRecreacion) {
                self.view.expositor(res, {
                    error: errorRecreacion,
                    result: resultRecreacion
                });
            });
        } else if (result[0][0].success === 3) {
            let respRecreaCXC = await promiseRecreaCXC(params, result[0][0].vin, result[0][0].cotizacionGuardada, result[0][0].idExpediente, result[0][0].currentRutaExpediente, result[0][0].newRutaExpediente);
            if (respRecreaCXC[0][0].success === 1) {
                self.view.expositor(res, {
                    error: error,
                    result: result
                });
            } else {
                self.view.expositor(res, {
                    error: error,
                    result: respRecreaCXC
                });
            }
        } else {
            for (let i = 0; i <= result[1].length - 1; i++) {
                if (result[1][i].doc_varios == 1 && result[1][i].id_documentoGuardado != null) {
                    var resPromise = await promiseReturnEstatus(result[1][i].id_documento, result[1][i].idExpediente, result[1][i].id_proceso);
                    result[1][i].id_estatus = resPromise.idEstatus;
                    result[1][i].est_descripcion = resPromise.nombreEstatus;
                    result[1][i].estatusEnlace = resPromise.idEstatusEnlace;
                    result[1][i].descripcionEstatusEnlace = resPromise.nombreEstatusEnlace;
                };
            };

            if (result[0][0].success == 1 && parseInt(req.query.idEmpresa) !== 35) {
                await getDataIntelimotors(result[2][0].VEH_NUMSERIE, req.query.idEmpresa, req.query.idSucursal, result[1][0].idExpediente);
            }

            if (req.query.idProceso == 1 && result[0][0].success == 1 && parseInt(req.query.idEmpresa) !== 35) {
                await promiseGetDocumentsIntelimotors(result[1]);
            };

            self.view.expositor(res, {
                error: error,
                result: result
            });
        };
    });
};

nodo.prototype.get_allDocumentosByCotizacion = function (req, res, next) {
    var self = this;

    var params = [
        { name: 'cotizacion', value: req.query.cotizacion, type: self.model.types.STRING },
        { name: 'idEmpresa', value: req.query.idEmpresa, type: self.model.types.INT },
        { name: 'idSucursal', value: req.query.idSucursal, type: self.model.types.INT },
        { name: 'idProceso', value: req.query.idProceso, type: self.model.types.INT },
        { name: 'idPerfil', value: req.query.idPerfil, type: self.model.types.INT },
        { name: 'idUsuario', value: req.query.idUsuario, type: self.model.types.INT }
    ];

    this.model.queryAllRecordSet('[expedienteSeminuevo].[SEL_DOCUMENTOS_BY_PROCESO_AND_COTIZACION]', params, async function (error, result) {
        if (result[0][0].success === 2) {
            var modelRecreacion = new nodoModel({
                parameters: confParams
            });
            let paramsRecreacion = [
                { name: 'vin', value: result[0][0].vin, type: self.model.types.STRING },
                { name: 'idEmpresa', value: req.query.idEmpresa, type: self.model.types.INT },
                { name: 'idSucursal', value: req.query.idSucursal, type: self.model.types.INT }
            ];
            modelRecreacion.queryAllRecordSet('[expedienteSeminuevo].[INS_HISTORICO_ALL_EXPEDIENTE_SP]', paramsRecreacion, async function (errorRecreacion, resultRecreacion) {
                self.view.expositor(res, {
                    error: errorRecreacion,
                    result: resultRecreacion
                });
            });
        } else if (result[0][0].success === 3) {
            let respRecreaCXC = await promiseRecreaCXC(params, result[0][0].vin, result[0][0].cotizacionGuardada, result[0][0].idExpediente, result[0][0].currentRutaExpediente, result[0][0].newRutaExpediente);
            if (respRecreaCXC[0][0].success === 1) {
                self.view.expositor(res, {
                    error: error,
                    result: result
                });
            } else {
                self.view.expositor(res, {
                    error: error,
                    result: respRecreaCXC
                });
            }
        } else {
            for (let i = 0; i <= result[1].length - 1; i++) {
                if (result[1][i].doc_varios == 1 && result[1][i].id_documentoGuardado != null) {
                    var resPromise = await promiseReturnEstatus(result[1][i].id_documento, result[1][i].idExpediente, result[1][i].id_proceso);
                    result[1][i].id_estatus = resPromise.idEstatus;
                    result[1][i].est_descripcion = resPromise.nombreEstatus;
                    result[1][i].estatusEnlace = resPromise.idEstatusEnlace;
                    result[1][i].descripcionEstatusEnlace = resPromise.nombreEstatusEnlace;
                };
            };

            if (result[0][0].success == 1 && parseInt(req.query.idEmpresa) !== 35) {
                await getDataIntelimotors(result[2][0].VEH_NUMSERIE, req.query.idEmpresa, req.query.idSucursal, result[1][0].idExpediente);
            }

            if (req.query.idProceso == 1 && result[0][0].success == 1 && parseInt(req.query.idEmpresa) !== 35) {
                await promiseGetDocumentsIntelimotors(result[1]);
            };

            self.view.expositor(res, {
                error: error,
                result: result
            });
        };
    });
};

nodo.prototype.post_saveDocumentos = async function (req, res, next) {
    var self = this;
    var idUsuario = req.body.idUsuario;
    var nombreDocumento = req.body.nombreDocumento;
    var idDocumento = req.body.idDocumento;
    var archivo = req.body.archivo;
    var rutaSave = req.body.rutaSave;
    var idExpediente = req.body.idExpediente;
    var idProceso = req.body.idProceso;
    var docVarios = req.body.doc_varios;
    var proceso = req.body.proceso;
    var carpetaVarios = req.body.carpetaVarios;
    var tenenciaDosMilVeintiuno = req.body.tenenciaDosMilVeintiuno;

    let resInsertDocumentoPromise = await promiseInsertDocumento(nombreDocumento, archivo, rutaSave, idExpediente, docVarios, proceso, carpetaVarios);

    if (resInsertDocumentoPromise.success == 1) {
        var params = [
            { name: 'id_expediente', value: idExpediente, type: self.model.types.INT },
            { name: 'id_documento', value: idDocumento, type: self.model.types.INT },
            { name: 'id_proceso', value: idProceso, type: self.model.types.INT },
            { name: 'id_estatus', value: 1, type: self.model.types.INT },
            { name: 'observacionesDocumento', value: '', type: self.model.types.STRING },
            { name: 'nombreDocumento', value: nombreDocumento, type: self.model.types.STRING },
            { name: 'idUsuario', value: idUsuario, type: self.model.types.INT }
        ];

        this.model.queryAllRecordSet('[expedienteSeminuevo].[INS_DOCUMENTO_EXPEDIENTE]', params, async function (error, result) {
            if (result[0][0].success == 0) {
                let filePath = '';
                if (docVarios == 0) {
                    filePath = `${rutaSave}${idExpediente}\\\\${proceso}\\\\${nombreDocumento}`
                } else {
                    filePath = `${rutaSave}${idExpediente}\\\\${proceso}\\\\${carpetaVarios}\\\\${nombreDocumento}`
                };

                fs.unlink(filePath, (err) => {
                    self.view.expositor(res, {
                        result: [{ success: 0, msg: 'Error al guardar el documento' }]
                    });
                });
            } else {
                if (idProceso == 1) {
                    if (idDocumento == 9) {
                        await updateTenenciasObligatorias(nombreDocumento, idExpediente);
                    };
                };
                await checkValidaDocsCargadosCompletos(idExpediente, idProceso);
                await promiseSaveBitacora('Guardado Documento', idDocumento, idUsuario, idExpediente, result[0][0].idDocumentoGuardado);
                self.view.expositor(res, {
                    error: error,
                    result: result
                });
            };
        });
    } else {
        self.view.expositor(res, {
            result: resInsertDocumentoPromise
        });
    };
};

promiseInsertDocumento = (nombreDocumento, archivo, rutaSave, idExpediente, docVarios, proceso, carpetaVarios) => {
    return new Promise((reject) => {
        if (!fs.existsSync(`${rutaSave}${idExpediente}`)) {//Si no existe el expediente
            fs.mkdirSync(`${rutaSave}${idExpediente}`);
            setTimeout(() => {
                if (!fs.existsSync(`${rutaSave}${idExpediente}\\\\${proceso}`)) {//si no existe el proceso
                    fs.mkdirSync(`${rutaSave}${idExpediente}\\\\${proceso}`);

                    setTimeout(() => {
                        if (docVarios == 0) {
                            fs.writeFile(`${rutaSave}${idExpediente}\\\\${proceso}\\\\${nombreDocumento}`, archivo, 'base64', function (err) {
                                if (err) {
                                    reject({
                                        success: 0, msg: 'Error al guardar'
                                    });
                                } else {
                                    reject({
                                        success: 1, msg: 'Se guardo con éxito'
                                    });
                                }
                            });
                        } else {
                            if (!fs.existsSync(`${rutaSave}${idExpediente}\\\\${proceso}\\\\${carpetaVarios}`)) {//Si no existe carpeta de varios
                                fs.mkdirSync(`${rutaSave}${idExpediente}\\\\${proceso}\\\\${carpetaVarios}`);

                                setTimeout(() => {
                                    fs.writeFile(`${rutaSave}${idExpediente}\\\\${proceso}\\\\${carpetaVarios}\\\\${nombreDocumento}`, archivo, 'base64', function (err) {
                                        if (err) {
                                            reject({
                                                success: 0, msg: 'Error al guardar'
                                            });
                                        } else {
                                            reject({
                                                success: 1, msg: 'Se guardo con éxito'
                                            });
                                        }
                                    });
                                }, 1000);

                            } else {
                                fs.writeFile(`${rutaSave}${idExpediente}\\\\${proceso}\\\\${carpetaVarios}\\\\${nombreDocumento}`, archivo, 'base64', function (err) {
                                    if (err) {
                                        reject({
                                            success: 0, msg: 'Error al guardar'
                                        });
                                    } else {
                                        reject({
                                            success: 1, msg: 'Se guardo con éxito'
                                        });
                                    }
                                });
                            }
                        }
                    }, 1000);

                } else { //Si existe el proceso
                    if (docVarios == 0) {
                        fs.writeFile(`${rutaSave}${idExpediente}\\\\${proceso}\\\\${nombreDocumento}`, archivo, 'base64', function (err) {
                            if (err) {
                                reject({
                                    success: 0, msg: 'Error al guardar'
                                });
                            } else {
                                reject({
                                    success: 1, msg: 'Se guardo con éxito'
                                });
                            }
                        });
                    } else {
                        if (!fs.existsSync(`${rutaSave}${idExpediente}\\\\${proceso}\\\\${carpetaVarios}`)) {
                            fs.mkdirSync(`${rutaSave}${idExpediente}\\\\${proceso}\\\\${carpetaVarios}`);

                            setTimeout(() => {
                                fs.writeFile(`${rutaSave}${idExpediente}\\\\${proceso}\\\\${carpetaVarios}\\\\${nombreDocumento}`, archivo, 'base64', function (err) {
                                    if (err) {
                                        reject({
                                            success: 0, msg: 'Error al guardar'
                                        });
                                    } else {
                                        reject({
                                            success: 1, msg: 'Se guardo con éxito'
                                        });
                                    }
                                });
                            }, 1000);
                        } else {
                            fs.writeFile(`${rutaSave}${idExpediente}\\\\${proceso}\\\\${carpetaVarios}\\\\${nombreDocumento}`, archivo, 'base64', function (err) {
                                if (err) {
                                    reject({
                                        success: 0, msg: 'Error al guardar'
                                    });
                                } else {
                                    reject({
                                        success: 1, msg: 'Se guardo con éxito'
                                    });
                                }
                            });
                        }
                    }
                }
            }, 1000);
        } else {// si existe el expediente
            if (!fs.existsSync(`${rutaSave}${idExpediente}\\\\${proceso}`)) {
                fs.mkdirSync(`${rutaSave}${idExpediente}\\\\${proceso}`);

                setTimeout(() => {
                    if (docVarios == 0) {
                        fs.writeFile(`${rutaSave}${idExpediente}\\\\${proceso}\\\\${nombreDocumento}`, archivo, 'base64', function (err) {
                            if (err) {
                                reject({
                                    success: 0, msg: 'Error al guardar'
                                });
                            } else {
                                reject({
                                    success: 1, msg: 'Se guardo con éxito'
                                });
                            }
                        });
                    } else {
                        if (!fs.existsSync(`${rutaSave}${idExpediente}\\\\${proceso}\\\\${carpetaVarios}`)) {//carpeta de varios
                            fs.mkdirSync(`${rutaSave}${idExpediente}\\\\${proceso}\\\\${carpetaVarios}`);

                            setTimeout(() => {
                                fs.writeFile(`${rutaSave}${idExpediente}\\\\${proceso}\\\\${carpetaVarios}\\\\${nombreDocumento}`, archivo, 'base64', function (err) {
                                    if (err) {
                                        reject({
                                            success: 0, msg: 'Error al guardar'
                                        });
                                    } else {
                                        reject({
                                            success: 1, msg: 'Se guardo con éxito'
                                        });
                                    }
                                });
                            }, 1000);

                        } else {
                            fs.writeFile(`${rutaSave}${idExpediente}\\\\${proceso}\\\\${carpetaVarios}\\\\${nombreDocumento}`, archivo, 'base64', function (err) {
                                if (err) {
                                    reject({
                                        success: 0, msg: 'Error al guardar'
                                    });
                                } else {
                                    reject({
                                        success: 1, msg: 'Se guardo con éxito'
                                    });
                                }
                            });
                        }
                    }
                }, 1000);

            } else {
                if (docVarios == 0) {
                    fs.writeFile(`${rutaSave}${idExpediente}\\\\${proceso}\\\\${nombreDocumento}`, archivo, 'base64', function (err) {
                        if (err) {
                            reject({
                                success: 0, msg: 'Error al guardar'
                            });
                        } else {
                            reject({
                                success: 1, msg: 'Se guardo con éxito'
                            });
                        }
                    });
                } else {
                    if (!fs.existsSync(`${rutaSave}${idExpediente}\\\\${proceso}\\\\${carpetaVarios}`)) {
                        fs.mkdirSync(`${rutaSave}${idExpediente}\\\\${proceso}\\\\${carpetaVarios}`);

                        setTimeout(() => {
                            fs.writeFile(`${rutaSave}${idExpediente}\\\\${proceso}\\\\${carpetaVarios}\\\\${nombreDocumento}`, archivo, 'base64', function (err) {
                                if (err) {
                                    reject({
                                        success: 0, msg: 'Error al guardar'
                                    });
                                } else {
                                    reject({
                                        success: 1, msg: 'Se guardo con éxito'
                                    });
                                }
                            });
                        }, 1000);
                    } else {
                        fs.writeFile(`${rutaSave}${idExpediente}\\\\${proceso}\\\\${carpetaVarios}\\\\${nombreDocumento}`, archivo, 'base64', function (err) {
                            if (err) {
                                reject({
                                    success: 0, msg: 'Error al guardar'
                                });
                            } else {
                                reject({
                                    success: 1, msg: 'Se guardo con éxito'
                                });
                            }
                        });
                    };
                };
            };
        };
    });
};

nodo.prototype.post_actualizarDocumentos = async function (req, res, next) {
    var self = this;
    var idUsuario = req.body.idUsuario;
    var nombreDocumento = req.body.nombreDocumento;
    var idDocumento = req.body.idDocumento;
    var archivo = req.body.archivo;
    var rutaSave = req.body.rutaSave;
    var idExpediente = req.body.idExpediente;
    var idProceso = req.body.idProceso;
    var docVarios = req.body.doc_varios;
    var proceso = req.body.proceso;
    var carpetaVarios = req.body.carpetaVarios;
    var nombreAntiguo = req.body.nombreAntiguo;
    var idDocumentoGuardado = req.body.idDocumentoGuardado;

    let resPromiseActualizaDocumento = await promiseActualizaDocumento(nombreDocumento, archivo, rutaSave, idExpediente, docVarios, proceso, carpetaVarios, nombreAntiguo);

    if (resPromiseActualizaDocumento.success == 1) {
        var params = [
            { name: 'idDocumentoGuardado', value: idDocumentoGuardado, type: self.model.types.INT },
            { name: 'idUsuario', value: idUsuario, type: self.model.types.INT },
            { name: 'nombreDocumento', value: nombreDocumento, type: self.model.types.STRING }
        ];

        this.model.query('[expedienteSeminuevo].[UPD_NOMBRE_DOCUMENTO_GUARDADO_SP]', params, async function (error, result) {
            await checkValidaDocsCargadosCompletos(idExpediente, idProceso);
            await promiseSaveBitacora('Actualización Documento', idDocumento, idUsuario, idExpediente, idDocumentoGuardado);
            self.view.expositor(res, {
                error: error,
                result: result
            });
        });

    } else {
        self.view.expositor(res, {
            result: [{ success: 0, msg: 'Error al guardar el documento' }]
        });
    };
};

promiseActualizaDocumento = (nombreDocumento, archivo, rutaSave, idExpediente, docVarios, proceso, carpetaVarios, nombreAntiguo) => {
    return new Promise((reject) => {
        let filePathDelete = '';
        let filePathSaveNuevo = '';
        if (docVarios == 0) {
            filePathDelete = `${rutaSave}${idExpediente}\\\\${proceso}\\\\${nombreAntiguo}`;
            filePathSaveNuevo = `${rutaSave}${idExpediente}\\\\${proceso}\\\\${nombreDocumento}`;
        } else {
            filePathDelete = `${rutaSave}${idExpediente}\\\\${proceso}\\\\${carpetaVarios}\\\\${nombreAntiguo}`;
            filePathSaveNuevo = `${rutaSave}${idExpediente}\\\\${proceso}\\\\${carpetaVarios}\\\\${nombreDocumento}`;
        };

        // fs.unlink(filePathDelete, (err) => {
        //     if (err) {
        //         reject({
        //             success: 0, msg: 'Error eliminar el archivo'
        //         });
        //     } else {

        //     }
        // });

        fs.writeFile(filePathSaveNuevo, archivo, 'base64', function (err) {
            if (err) {
                reject({
                    success: 0, msg: 'Error al guardar'
                });
            } else {
                reject({
                    success: 1, msg: 'Se guardo con éxito'
                });
            }
        });
    });
};

nodo.prototype.get_documentosVarios = function (req, res, next) {
    var self = this;

    var params = [
        { name: 'idDocumento', value: req.query.idDocumento, type: self.model.types.INT },
        { name: 'idExpediente', value: req.query.idExpediente, type: self.model.types.INT },
        { name: 'idProceso', value: req.query.idProceso, type: self.model.types.STRING }
    ];

    this.model.query('[expedienteSeminuevo].[SEL_DOCUMENTOS_VARIOS_BY_IDS]', params, function (error, result) {
        self.view.expositor(res, {
            error: error,
            result: result
        });
    });
};

nodo.prototype.get_documentosVariosShow = function (req, res, next) {
    var self = this;

    var params = [
        { name: 'idDocumento', value: req.query.idDocumento, type: self.model.types.INT },
        { name: 'idExpediente', value: req.query.idExpediente, type: self.model.types.INT },
        { name: 'idProceso', value: req.query.idProceso, type: self.model.types.STRING }
    ];

    this.model.query('[expedienteSeminuevo].[SEL_DOCUMENTOS_VARIOS_BY_IDS]', params, function (error, result) {
        self.view.expositor(res, {
            error: error,
            result: result
        });
    });
};

nodo.prototype.get_updateEstatusDocumento = function (req, res, next) {
    var self = this;
    var idUsuario = req.query.idUsuario;

    const { tipoProceso } = req.query;
    var params = [
        { name: 'id_documentoGuardado', value: req.query.id_documentoGuardado, type: self.model.types.INT },
        { name: 'id_estatus', value: req.query.id_estatus, type: self.model.types.INT },
        { name: 'observaciones', value: req.query.observaciones, type: self.model.types.STRING }
    ];

    this.model.query('[expedienteSeminuevo].[UPD_ESTATUS_DOCUMENTO_EXPEDIENTE]', params, async function (error, result) {
        var textoSend = 'Aprobación Documento';
        if (req.query.id_estatus == 3) {
            await promiseSendMailRechazoDocumentos(req.query.id_documentoGuardado);
            textoSend = 'Rechazo Documento';
        };
        if (tipoProceso == 1) {
            await checkExpedienteCompletoNodo(result[0].idExpediente, tipoProceso);
        };
        // } else if (tipoProceso == 2) {
        //     await nodo.checkExpedienteCompletoCXC(result[0].idExpediente, tipoProceso);
        // };
        await promiseSaveBitacora(textoSend, result[0].idDocumento, idUsuario, result[0].idExpediente, req.query.id_documentoGuardado);
        self.view.expositor(res, {
            error: error,
            result: result
        });
    });
};

promiseSendMailRechazoDocumentos = (idDocumentoGuardado) => {
    return new Promise((reject) => {
        var model = new nodoModel({
            parameters: confParams
        });

        let params = [
            { name: 'idDocumentoGuardado', value: idDocumentoGuardado, type: model.types.INT }
        ];

        model.query('[expedienteSeminuevo].[SEL_USUARIO_DOCUMENTO]', params, async function (error, responsed) {
            var html = "<div style=\"width:310px;height:140px\">" +
                "<center>" +
                "<img style=\"width: 80% \" src=\"https://cdn.discordapp.com/attachments/588785789438001183/613027505137516599/logoA.png\" alt=\"GrupoAndrade\" />" +
                "</center>" +
                "</div>" +
                "<div>" +
                "<p>" +
                `Estimado ${responsed[0].nombreUsuario} <br/> 
                                El documento "${responsed[0].nombreDocumento}" fue rechazado en el expediente digital seminuevo con el vin "${responsed[0].vin}" <br/>
                                Motivo del rechazo: "${responsed[0].observaciones}" <br/>
                                Favor de entrar a remplazar el documento para su revaloración.` +
                "</p>" +
                "</div>";

            sendMail.envia(responsed[0].usu_correo, 'Rechazo de documento', html).then((resPromise) => {
                reject({
                    success: 'Continuamos'
                });
            });
        });
    });
};

nodo.prototype.get_reporteIndividual = function (req, res, next) {
    var self = this;
    let consumoSP = req.query.idProceso == 1 ? '[expedienteSeminuevo].[SEL_REPORTE_DOCUMENTOS_BY_PROCESO1_AND_VIN]' : '[expedienteSeminuevo].[SEL_REPORTE_DOCUMENTOS_BY_PROCESO2_AND_VIN]'
    var params = [
        { name: 'vin', value: req.query.vin, type: self.model.types.STRING },
        { name: 'idEmpresa', value: req.query.idEmpresa, type: self.model.types.INT },
        { name: 'idSucursal', value: req.query.idSucursal, type: self.model.types.INT },
        { name: 'idProceso', value: req.query.idProceso, type: self.model.types.INT }
    ];

    this.model.queryAllRecordSet(consumoSP, params, function (error, result) {
        self.view.expositor(res, {
            error: error,
            result: result
        });
    });
};

nodo.prototype.get_reporteGeneral = function (req, res, next) {
    var self = this;
    let consumoSP = req.query.idProceso == 1 ? '[expedienteSeminuevo].[SEL_REPORTE_DOCUMENTOS_BY_PERIODO_PROCESO1]' : '[expedienteSeminuevo].[SEL_REPORTE_DOCUMENTOS_BY_PERIODO_PROCESO2]'
    var params = [
        { name: 'F1', value: req.query.fecha1, type: self.model.types.STRING },
        { name: 'F2', value: req.query.fecha2, type: self.model.types.STRING },
        { name: 'idProceso', value: req.query.idProceso, type: self.model.types.INT },
        { name: 'idEmpresa', value: req.query.idEmpresa, type: self.model.types.INT },
        { name: 'idSucursal', value: req.query.idSucursal, type: self.model.types.INT }
    ];

    this.model.queryAllRecordSet(consumoSP, params, function (error, result) {
        self.view.expositor(res, {
            error: error,
            result: result
        });
    });
};

/** Inician las funciones del proceso de notificaciones */

cron.schedule(sendNonitifacionesMail, async function () {
    var model = new nodoModel({
        parameters: confParams
    });

    model.query('[expedienteSeminuevo].[SEL_EJECUTO_INS_VIN_SP]', [], async (error, result) => {
        if (error) {
            console.log('Error al validar si se ejecuto el SP de insercion')
        } else {
            if (result[0].success === 1) {
                for (let i = 0; i <= tipoNotificaciones.length - 1; i++) {
                    console.log(`========================== PROCESO ${tipoNotificaciones[i]} ==========================`)
                    await promiseGetAllEmpresas(tipoNotificaciones[i]);
                    console.log('========================== F I N ==========================');
                };
            } else {
                console.log('No se registraron las fechas de la insercion')
            };
        };
    });
});

promiseGetAllEmpresas = (tipoNotificacion) => {
    return new Promise(async (reject) => {
        try {
            var model = new nodoModel({
                parameters: confParams
            });
            model.query('[expedienteSeminuevo].[SEL_ALL_EMPRESAS]', [], async function (error, responsed) {
                if (responsed.length > 0) {
                    for (let i = 0; i <= responsed.length - 1; i++) {
                        console.log(`======================= EMPRESA ${responsed[i].nombre_sucursal.split('CONCEN')[0]} =========================`);
                        empresaCorpo = '';
                        empresaCorpo = responsed[i].nombre_sucursal.split('CONCEN')[0]
                        await promiseGetAllSucursalesByEmpresa(responsed[i].emp_idempresa, tipoNotificacion);
                    };
                    reject({ success: 'Listo' });
                } else {
                    console.log('Error al trae las empresas');
                };
            });
        } catch (error) {
            reject({ success: error });
        };
    });
};

promiseGetAllSucursalesByEmpresa = (idEmpresa, tipoNotificacion) => {
    return new Promise((reject) => {
        var model = new nodoModel({
            parameters: confParams
        });
        let params = [
            { name: 'idEmpresa', value: idEmpresa, type: model.types.INT }
        ];
        model.query('[expedienteSeminuevo].[SEL_ALL_SUCURSALES_BY_EMPRESA]', params, async function (error, responsed) {
            if (responsed.length > 0) {
                for (let i = 0; i <= responsed.length - 1; i++) {
                    nombreSucursal = '';
                    nombreSucursal = responsed[i].nombre_sucursal;
                    await promiseGetExpedientesByEmpAndSuc(idEmpresa, responsed[i].suc_idSucursal, tipoNotificacion);

                    if (i == responsed.length - 1) {
                        if (tipoNotificacion == 3) {
                            if (htmlCorpo != '') {
                                await promiseSendMailCorp(nombresCorp, mailsCorp, htmlCorpo);
                                nombresCorp = '';
                                mailsCorp = '';
                                htmlCorpo = '';
                            } else {
                                console.log('No se lleno');
                                nombresCorp = '';
                                mailsCorp = '';
                                htmlCorpo = '';
                            };
                        };
                        reject({ success: 'Listo' });
                    };
                };
            } else {
                reject({ success: 'Listo' });
            };
        });
    });
};

promiseGetExpedientesByEmpAndSuc = (idEmpresa, idSucursal, tipoNotificacion) => {
    return new Promise((reject) => {
        var model = new nodoModel({
            parameters: confParams
        });

        let params = [
            { name: 'empresa', value: idEmpresa, type: model.types.INT },
            { name: 'sucursal', value: idSucursal, type: model.types.INT }
        ];

        switch (tipoNotificacion) {
            case 1:
                model.queryAllRecordSet('[expedienteSeminuevo].[SEL_EXPEDIENTES_COR_SM_MAIL]', params, async function (error, responsed) {
                    if (responsed != undefined) {
                        if (responsed[1].length > 0) {
                            await promiseCreateHtml(responsed[0], responsed[1])
                            reject({ success: 'Listo' });
                        } else {
                            reject({ success: 'Listo' });
                        };
                    } else {
                        reject({ success: 'Listo' });
                    };
                });
                break;
            case 2:
                model.queryAllRecordSet('[expedienteSeminuevo].[SEL_EXPEDIENTES_GER_SM_MAIL]', params, async function (error, responsed) {
                    if (responsed != undefined) {
                        if (responsed[1].length > 0) {
                            await promiseCreateHtml(responsed[0], responsed[1])
                            reject({ success: 'Listo' });
                        } else {
                            reject({ success: 'Listo' });
                        };
                    } else {
                        reject({ success: 'Listo' });
                    };
                });
                break;
            case 3:
                model.queryAllRecordSet('[expedienteSeminuevo].[SEL_EXPEDIENTES_CORP_SM_MAIL]', params, async function (error, responsed) {
                    if (responsed != undefined) {
                        if (nombresCorp == '' || mailsCorp == '') {
                            responsed[0].forEach((value) => {
                                nombresCorp = nombresCorp + ` ${value.nombre} `
                                mailsCorp = mailsCorp + ` ${value.correo}; `
                            });
                        };

                        if (responsed[1].length > 0) {
                            await promiseCorpHtml(responsed[1]);
                        };

                        reject({ success: 'Listo' });
                    } else {
                        reject({ success: 'Listo' });
                    };
                });
                break;
        };
    });
};

promiseCreateHtml = (dataMail, data) => {
    return new Promise((reject) => {
        let folios = '';
        let html = '';
        let nombres = '', mails = '';

        dataMail.forEach((value) => {
            nombres = nombres + ` ${value.nombre}, `;
            mails = mails + ` ${value.correo};`
        });

        if (data.length > 0) {
            data.forEach((value, key) => {
                folios = folios + `<tr>
                                    <td style="border: 1px solid #dddddd; text-align: left; padding: 8px;"> 
                                        ${key + 1} 
                                    </td>  
                                    <td style="border: 1px solid #dddddd; text-align: left; padding: 8px;"> 
                                        ${value.VEH_NUMSERIE} 
                                    </td> 
                                    <td style="border: 1px solid #dddddd; text-align: left; padding: 8px;"> 
                                        ${value.VEH_SMARCA} 
                                    </td>
                                    <td style="border: 1px solid #dddddd; text-align: left; padding: 8px;"> 
                                        ${value.VEH_TIPOAUTO} 
                                    </td>  
                                    <td style="border: 1px solid #dddddd; text-align: left; padding: 8px;"> 
                                        ${value.fechaCompra} 
                                    </td>  
                                    <td style="border: 1px solid #dddddd; text-align: left; padding: 8px;"> 
                                        ${value.VEH_ANMODELO} 
                                    </td>
                                    <td style="border: 1px solid #dddddd; text-align: left; padding: 8px;"> 
                                        ${value.tipoUnidad} 
                                    </td>   
                                    <td style="border: 1px solid #dddddd; text-align: left; padding: 8px;"> 
                                        ${value.expedienteCXP} 
                                    </td> 
                                    <td style="border: 1px solid #dddddd; text-align: left; padding: 8px;"> 
                                        ${value.expedienteCXC} 
                                    </td>
                                    <td style="border: 1px solid #dddddd; text-align: left; padding: 8px;"> 
                                        ${value.fechaEntrega} 
                                    </td>
                                    <td style="border: 1px solid #dddddd; text-align: left; padding: 8px;"> 
                                        ${value.allDocsFaltantesCXP} 
                                    </td>
                                    <td style="border: 1px solid #dddddd; text-align: left; padding: 8px;"> 
                                        ${value.allDocsFaltantesCXC} 
                                    </td>
                                    <td style="border: 1px solid #dddddd; text-align: left; padding: 8px;"> 
                                        ${value.diasCXP} 
                                    </td>
                                    <td style="border: 1px solid #dddddd; text-align: left; padding: 8px;"> 
                                        ${value.diasCXC} 
                                    </td>
                                </tr>`
            });
        };


        html = `<label style="font-size:20px; font-weight:bold;">Estimados(a):${nombres.substring(0, nombres.length - 2)}</label>
                <br><br><br>
                <label style="font-size: 18;"> Las siguientes unidades no estan completos en "Expediente Digital Seminuevos", favor de revisarlos </label>
                <br><br><br>
                <h3> ${data[0].nombre_sucursal} </h3>
                <table style="font-family: arial, sans-serif;  border-collapse: collapse;">
                    <tr style="background-color: #84B3D3;">
                        <th style="border: 1px solid #dddddd; text-align: left; padding: 8px;">#</th>
                        <th style="border: 1px solid #dddddd; text-align: left; padding: 8px;">Vin</th>
                        <th style="border: 1px solid #dddddd; text-align: left; padding: 8px;">Marca</th>
                        <th style="border: 1px solid #dddddd; text-align: left; padding: 8px;">Auto</th>
                        <th style="border: 1px solid #dddddd; text-align: left; padding: 8px;">Fecha de compra</th>
                        <th style="border: 1px solid #dddddd; text-align: left; padding: 8px;">Año</th>
                        <th style="border: 1px solid #dddddd; text-align: left; padding: 8px;">Tipo de Unidad</th>
                        <th style="border: 1px solid #dddddd; text-align: left; padding: 8px;">Expediente Compra</th>
                        <th style="border: 1px solid #dddddd; text-align: left; padding: 8px;">Expediente Venta</th>
                        <th style="border: 1px solid #dddddd; text-align: left; padding: 8px;">Fecha de Entrega</th>
                        <th style="border: 1px solid #dddddd; text-align: left; padding: 8px;">Documentos Faltantes CXP</th>
                        <th style="border: 1px solid #dddddd; text-align: left; padding: 8px;">Documentos Faltantes CXC</th>
                        <th style="border: 1px solid #dddddd; text-align: left; padding: 8px;">Dias Sin Documentación CXP</th>
                        <th style="border: 1px solid #dddddd; text-align: left; padding: 8px;">Dias Sin Documentación CXC</th>
                    </tr>
                    ${folios}
                </table><br>
                <p style="text-align: justify;">
                    ----------------------------------------------------------------------------------------------- <br><br>
                    <label style="background-color: yellow; font-size: 18px; font-weight: bold;">  ES IMPORTANTE QUE TE ASEGURES DE QUE: </label><br>
                    <ul>
                        <li>
                            <label style="background-color: yellow; font-size: 16px; font-weight: bold;">  Los expedientes digitales sean completados en un plazo máximo de 3 días hábiles una vez recibida esta notificación. En caso de no cumplirse con esta actividad en el plazo señalado, esta solicitud será escalada de acuerdo a lo siguiente: </label>
                            <ul>
                                <li>
                                    <label style="background-color: yellow; font-size: 16px; font-weight: bold;"> Al día 4 los expedientes digitales que permanezcan incompletos serán escalados a la Gerencia General y Dirección de Marca y permanecerán visibles también para la Gerencia de Seminuevos y su equipo </label>
                                </li>
                                <li>
                                    <label style="background-color: yellow; font-size: 16px; font-weight: bold;"> Al día 7 los expedientes digitales que permanezcan incompletos serán escalados al Corporativo del Grupo: Dirección de Seminuevos, Finanzas y Contraloría y permanecerán visibles para la Gerencia de Seminuevos, su equipo, Gerencia General y Dirección de Marca </label>
                                </li>
                            </ul>
                        </li>
                        <li>
                            <label style="background-color: yellow; font-size: 16px; font-weight: bold;">  La documentación que estás cargando sea la indicada y esté correcta y legible. El no hacerlo de esta forma tiene implicaciones y consecuencias. </label>
                        </li>
                        <li>
                            <label style="background-color: yellow; font-size: 16px; font-weight: bold;">  Esta representación digital del expediente, en este momento, no sustituye la documentación original que debes tener ordenada y resguardada en un expediente físico. </label>
                        </li>
                    </ul>
                    -----------------------------------------------------------------------------------------------
                </p>;`;

        if (mails.length > 0) {
            sendMail.envia(mails, `Expedientes incompletos en "Expediente Digital Seminuevos" ${nombreSucursal}`, html).then((resPromise) => {
                reject({ success: 'Listo' });
            });
        } else {
            reject({ success: 'Listo' });
        };
    });
};

promiseCorpHtml = (dataCorp) => {
    return new Promise((reject) => {
        let folios = '';
        let html = '';

        dataCorp.forEach((value, key) => {
            folios = folios + `<tr>
                                    <td style="border: 1px solid #dddddd; text-align: left; padding: 8px;"> 
                                        ${key + 1} 
                                    </td>  
                                    <td style="border: 1px solid #dddddd; text-align: left; padding: 8px;"> 
                                        ${value.VEH_NUMSERIE} 
                                    </td> 
                                    <td style="border: 1px solid #dddddd; text-align: left; padding: 8px;"> 
                                        ${value.VEH_SMARCA} 
                                    </td>
                                    <td style="border: 1px solid #dddddd; text-align: left; padding: 8px;"> 
                                        ${value.VEH_TIPOAUTO} 
                                    </td>    
                                    <td style="border: 1px solid #dddddd; text-align: left; padding: 8px;"> 
                                        ${value.fechaCompra} 
                                    </td> 
                                    <td style="border: 1px solid #dddddd; text-align: left; padding: 8px;"> 
                                        ${value.VEH_ANMODELO} 
                                    </td>
                                    <td style="border: 1px solid #dddddd; text-align: left; padding: 8px;"> 
                                        ${value.tipoUnidad} 
                                    </td>   
                                    <td style="border: 1px solid #dddddd; text-align: left; padding: 8px;"> 
                                        ${value.expedienteCXP} 
                                    </td> 
                                    <td style="border: 1px solid #dddddd; text-align: left; padding: 8px;"> 
                                        ${value.expedienteCXC} 
                                    </td>
                                    <td style="border: 1px solid #dddddd; text-align: left; padding: 8px;"> 
                                        ${value.fechaEntrega} 
                                    </td>
                                    <td style="border: 1px solid #dddddd; text-align: left; padding: 8px;"> 
                                        ${value.allDocsFaltantesCXP} 
                                    </td>  
                                    <td style="border: 1px solid #dddddd; text-align: left; padding: 8px;"> 
                                        ${value.allDocsFaltantesCXC} 
                                    </td>
                                    <td style="border: 1px solid #dddddd; text-align: left; padding: 8px;"> 
                                        ${value.diasCXP} 
                                    </td>
                                    <td style="border: 1px solid #dddddd; text-align: left; padding: 8px;"> 
                                        ${value.diasCXC} 
                                    </td>                             
                                </tr>`
        });

        html = ` <h2> ${dataCorp[0].nombre_sucursal} </h2> </br>
                <table style="font-family: arial, sans-serif;  border-collapse: collapse;">
                    <tr style="background-color: #84B3D3;">
                        <th style="border: 1px solid #dddddd; text-align: left; padding: 8px;">#</th>
                        <th style="border: 1px solid #dddddd; text-align: left; padding: 8px;">Vin</th>
                        <th style="border: 1px solid #dddddd; text-align: left; padding: 8px;">Marca</th>
                        <th style="border: 1px solid #dddddd; text-align: left; padding: 8px;">Auto</th>
                        <th style="border: 1px solid #dddddd; text-align: left; padding: 8px;">Fecha de compra</th>
                        <th style="border: 1px solid #dddddd; text-align: left; padding: 8px;">Año</th>
                        <th style="border: 1px solid #dddddd; text-align: left; padding: 8px;">Tipo de Unidad</th>
                        <th style="border: 1px solid #dddddd; text-align: left; padding: 8px;">Expediente Compra</th>
                        <th style="border: 1px solid #dddddd; text-align: left; padding: 8px;">Expediente Venta</th>
                        <th style="border: 1px solid #dddddd; text-align: left; padding: 8px;">Fecha de Entrega</th>
                        <th style="border: 1px solid #dddddd; text-align: left; padding: 8px;">Documentos Faltantes CXP</th>
                        <th style="border: 1px solid #dddddd; text-align: left; padding: 8px;">Documentos Faltantes CXC</th>
                        <th style="border: 1px solid #dddddd; text-align: left; padding: 8px;">Dias Sin Documentación CXP</th>
                        <th style="border: 1px solid #dddddd; text-align: left; padding: 8px;">Dias Sin Documentación CXC</th>                      
                </tr>
                ${folios}
                </table><br><br>`;


        htmlCorpo = htmlCorpo + `${html}`;
        reject({ success: 'Listo' });
    });
};

promiseSendMailCorp = (nombresCorp, mailsCorp, htmlCorpo) => {
    return new Promise((reject) => {
        var html = `<label style="font-size:20px; font-weight:bold;">Estimados(a):${nombresCorp}</label>
                    <br><br><br>
                    <label style="font-size: 18;"> Los siguientes expedientes digitales en seminuevos no estan completos, favor de revisarlos </label>
                    <br><br><br>
                    ${htmlCorpo}
                    
                    <p style="text-align: justify;">
                    ----------------------------------------------------------------------------------------------- <br><br>
                    <label style="background-color: yellow; font-size: 18px; font-weight: bold;">  ES IMPORTANTE QUE TE ASEGURES DE QUE: </label><br>
                    <ul>
                        <li>
                            <label style="background-color: yellow; font-size: 16px; font-weight: bold;">  Los expedientes digitales sean completados en un plazo máximo de 3 días hábiles una vez recibida esta notificación. En caso de no cumplirse con esta actividad en el plazo señalado, esta solicitud será escalada de acuerdo a lo siguiente: </label>
                            <ul>
                                <li>
                                    <label style="background-color: yellow; font-size: 16px; font-weight: bold;"> Al día 4 los expedientes digitales que permanezcan incompletos serán escalados a la Gerencia General y Dirección de Marca y permanecerán visibles también para la Gerencia de Seminuevos y su equipo </label>
                                </li>
                                <li>
                                    <label style="background-color: yellow; font-size: 16px; font-weight: bold;"> Al día 7 los expedientes digitales que permanezcan incompletos serán escalados al Corporativo del Grupo: Dirección de Seminuevos, Finanzas y Contraloría y permanecerán visibles para la Gerencia de Seminuevos, su equipo, Gerencia General y Dirección de Marca </label>
                                </li>
                            </ul>
                        </li>
                        <li>
                            <label style="background-color: yellow; font-size: 16px; font-weight: bold;">  La documentación que estás cargando sea la indicada y esté correcta y legible. El no hacerlo de esta forma tiene implicaciones y consecuencias. </label>
                        </li>
                        <li>
                            <label style="background-color: yellow; font-size: 16px; font-weight: bold;">  Esta representación digital del expediente, en este momento, no sustituye la documentación original que debes tener ordenada y resguardada en un expediente físico. </label>
                        </li>
                    </ul>
                    -----------------------------------------------------------------------------------------------
                </p>;`

        sendMail.envia(mailsCorp, `Expedientes incompletos en ${empresaCorpo} "Expediente Digital Seminuevos"`, html).then((resPromise) => {
            reject({ success: 'Listo' });
        });
    });
};

promiseSaveBitacora = (tipoAccion, idDocumento, idUsuario, idExpediente, idDocumentoGuardado) => {
    return new Promise((resolve) => {
        try {
            var model = new nodoModel({
                parameters: confParams
            });

            let params = [
                { name: 'tipoAccion', value: tipoAccion, type: model.types.STRING },
                { name: 'idDocumento', value: idDocumento, type: model.types.INT },
                { name: 'idUsuario', value: idUsuario, type: model.types.INT },
                { name: 'idExpediente', value: idExpediente, type: model.types.INT },
                { name: 'idDocumentoGuardado', value: idDocumentoGuardado, type: model.types.INT }
            ];

            model.query('[expedienteSeminuevo].[INS_BITACORA_DOCUMENTOS]', params, function (error, responsed) {
                resolve({ success: "Listo" });
            });
        } catch (error) {
            resolve({ success: "Listo" });
        };
    });
};

checkExpedienteCompletoNodo = (idExpediente, tipoProceso) => {
    return new Promise((resolve) => {
        try {
            var model = new nodoModel({
                parameters: confParams
            });

            let params = [
                { name: 'idExpediente', value: idExpediente, type: model.types.INT }
            ];
            model.query('[expedienteSeminuevo].[SEL_VALIDA_EXPEDIENTE_COMPLETO_SP]', params, async function (error, responsed) {
                if (responsed[0].totalImagenes <= 0) {
                    // await promisePublicarIntelimotor(idExpediente);
                    // await replicateDocuments(idExpediente, 1);
                    await nodo.sendMailEnlace(idExpediente, tipoProceso);
                    resolve({ success: "Listo" });
                } else {
                    resolve({ success: "Listo" });
                };
            });
        } catch (error) {
            resolve({ success: "Listo" });
        };
    });
};

promisePublicarIntelimotor = (idExpediente) => {
    return new Promise((resolve) => {
        var model = new nodoModel({
            parameters: confParams
        });

        let params = [
            { name: 'idExpediente', value: idExpediente, type: model.types.INT }
        ];

        model.query('[expedienteSeminuevo].[SEL_VIN_UNITID_BY_IDEXPEDINETE_SP]', params, function (error, responsed) {
            let vin = responsed[0].vin //'ZFAADABP3H6E32724';
            let unitId = responsed[0].unitId //'5d768f916ebc5a009de22c3f'
            try {
                publicaIntelimotor.publica(vin, unitId).then(async (res) => {
                    if (res.success == 1) {
                        if (res.data.statusCode == 401 || res.data.statusCode == 400 || res.data.statusCode == 404) {

                            let html = `<label style="font-size: 20px"> El vin ${vin} y le unitID: ${unitId}. <br> 
                        No se pudo publicar en intelimotor Error: ${JSON.parse(res.data.body).error} </label>`;

                            sendMail.envia('lgarciaperrusquia@gmail.com', `Error al publicar una unidad en INTELIMOTOR"`, html).then(async (resPromise) => {
                                await promiseSaveBitacoraPublicaIntelimotor(JSON.parse(res.data.body).error, vin, unitId);
                                resolve({ success: 'Listo' })
                            });

                        } else {
                            await promiseSaveBitacoraPublicaIntelimotor(`Se publico la unidad en Intelimotro Respuesta: ${res.data.body}`, vin, unitId);
                            resolve({ success: 'Listo' })
                        };
                    } else {

                        let html = `<label style="font-size: 20px"> El vin ${vin} y le unitID: ${unitId}. <br> 
                    No se pudo publicar en intelimotor Error: ${res.err} </label>`;

                        sendMail.envia('lgarciaperrusquia@gmail.com', `Error al publicar una unidad en INTELIMOTOR"`, html).then(async (resPromise) => {
                            await promiseSaveBitacoraPublicaIntelimotor(res.err, vin, unitId);
                            resolve({ success: 'Listo' })
                        });
                    };
                });
            } catch (error) {

                let html = `<label style="font-size: 20px"> El vin ${vin} y le unitID: ${unitId}. <br> 
            No se pudo publicar en intelimotor Error:${error}</label>`
                sendMail.envia('lgarciaperrusquia@gmail.com', `Error al publicar una unidad en INTELIMOTOR"`, html).then(async (resPromise) => {
                    await promiseSaveBitacoraPublicaIntelimotor(error, vin, unitId);
                    resolve({ success: 'Listo' })
                });
            };
        });

    });
};

promiseSaveBitacoraPublicaIntelimotor = (tipoAccion, vin, unitId) => {
    return new Promise((resolve) => {
        try {
            var model = new nodoModel({
                parameters: confParams
            });

            let params = [
                { name: 'tipoAccion', value: tipoAccion, type: model.types.STRING },
                { name: 'vin', value: vin, type: model.types.STRING },
                { name: 'unitId', value: unitId, type: model.types.STRING }
            ];

            model.query('[expedienteSeminuevo].[INS_BITACORA_PUBLICA_INTELIMOTORS]', params, function (error, responsed) {
                resolve({ success: "Listo" });
            });
        } catch (error) {
            resolve({ success: "Listo" });
        };
    });
};

nodo.prototype.get_consultaNota = function (req, res, next) {
    var self = this;
    let consumoSP = req.query.sp == 1 ? '[expedienteSeminuevo].[SEL_DOCUMENTO_NOTA_CARGO_SP]' : '[expedienteSeminuevo].[SEL_DOCUMENTO_NOTA_CREDITO_SP]'
    var params = [
        { name: 'vin', value: req.query.vin, type: self.model.types.STRING },
        { name: 'idEmpresa', value: req.query.idEmpresa, type: self.model.types.INT },
        { name: 'idSucursal', value: req.query.idSucursal, type: self.model.types.INT }
    ];

    this.model.queryAllRecordSet(consumoSP, params, function (error, result) {
        self.view.expositor(res, {
            error: error,
            result: result
        });
    });
};

nodo.prototype.get_documentoWS = function (req, res, next) {
    var self = this;
    var url = req.query.tipo != 'FACTURA' ? this.conf.parameters.WSGeneraPdf : this.conf.parameters.WSInvoce;
    var tipo = req.query.tipo;
    var args = {};
    if (!fs.existsSync(req.query.ruta)) {
        soap.createClient(url, function (err, client) {
            if (err) {
                console.log('Error en createClient : ', err)
                self.view.expositor(res, {
                    result: [{ success: 0, arrayBits: "Servicio no disponible por el monento, intentelo más tarde ..." }]
                });
            } else {

                if (tipo != 'FACTURA') {

                    args = { Tipo: tipo, Documento: req.query.aBuscar, Nodo: 0 };

                    client.GenerarPdf(args, function (err, resul, raw) {
                        if (err) {
                            console.log('Error en GenerarPdf : ', err)
                            self.view.expositor(res, {
                                result: [{ success: 0, arrayBits: "Servicio no disponible por el monento, intentelo más tarde ..." }]
                            });
                        } else {
                            self.view.expositor(res, {
                                result: [{ success: 1, arrayBits: resul, existe: 0 }]
                            });
                        }
                    });
                } else {

                    var obj = JSON.parse(req.query.aBuscar);

                    args = {
                        RFCEMISOR: obj.RFCEMISOR,
                        RFCRECEPTOR: obj.RFCRECEPTOR,
                        SERIE: obj.serie,
                        FOLIO: obj.folio
                    };

                    client.MuestraFactura(args, async function (err, resul, raw) {
                        if (err) {
                            await saveBitacoraWsFactura(req.query.aBuscar, `${obj.serie}${obj.folio}`, `Error al consumir: ${JSON.stringify(resul)}`.substring(0, 8000));
                            self.view.expositor(res, {
                                result: [{ success: 0, arrayBits: "Servicio no disponible por el monento, intentelo más tarde ..." }]
                            });
                        } else {
                            await saveBitacoraWsFactura(req.query.aBuscar, `${obj.serie}${obj.folio}`, `Respuesta: ${JSON.stringify(resul)}`.substring(0, 8000));
                            self.view.expositor(res, {
                                result: [{ success: 1, arrayBits: resul, existe: 0 }]
                            });
                        }
                    });
                }
            }
        });
    } else {
        self.view.expositor(res, {
            result: [{ success: 1, arrayBits: req.query.ruta, existe: 1 }]
        });
    }
};

saveBitacoraWsFactura = (args, facturaSend, respuestaWs) => {
    return new Promise(resolve => {
        var model = new nodoModel({
            parameters: confParams
        });

        let params = [
            { name: 'argumentos', value: args, type: model.types.STRING },
            { name: 'factura', value: facturaSend, type: model.types.STRING },
            { name: 'respuestaWs', value: respuestaWs, type: model.types.STRING }
        ];
        console.log('params', params)
        model.query('[expedienteSeminuevo].[INS_BITACORA_CONSUMO_WS_SP]', params, function (error, responsed) {
            resolve({ success: "Listo" });
        });
    });
};

nodo.prototype.get_consultaImagenesCarrusel = function (req, res, next) {
    var self = this;
    //MA6CB6CD1JT011100
    //${req.query.vin}
    let url = `${urlUnidadIntelimotor}${req.query.vin}/${req.query.idEmpresa}/${req.query.idSucursal}?apiKey=${apiKeyIntelimotor}&apiSecret=${apiSecretIntelimotor}`;
    var options = {
        'method': 'GET',
        'url': url
    };
    request(options, function (error, response) {
        if (error) throw new Error(error);
        self.view.expositor(res, {
            result: [{ success: 1, data: JSON.parse(response.body).data }]
        });
    });
};

promiseGetDocumentsIntelimotors = (dataImages) => {
    return new Promise((resolve) => {
        try {
            var consumoApi = false;
            var idExpediente = 0;
            var model = new nodoModel({
                parameters: confParams
            });

            dataImages.forEach((value) => {
                if ((value.id_documento == 1 || value.id_documento == 2) && value.id_documentoGuardado == null) {
                    consumoApi = true;
                    idExpediente = value.idExpediente
                };
            });

            if (consumoApi) {
                let params = [
                    { name: 'idExpediente', value: idExpediente, type: model.types.INT }
                ];

                model.query('[expedienteSeminuevo].[SEL_VIN_UNITID_BY_IDEXPEDINETE_SP]', params, function (error, responsed) {
                    var options = {
                        'method': 'POST',
                        'url': `${confParams.urlGetDocumentosIntelimotors}?apiKey=${confParams.apiKeyIntelimotor}&apiSecret=${confParams.apiSecretIntelimotor}`,
                        'headers': {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ "businessUnitId": responsed[0].unitId, "vin": responsed[0].vin })
                    };

                    request(options, function (error, response) {
                        if (error) {
                            insBitacoraApi(`Error al consumir el API que regresa los documentos ${error} para el businessUnitId ${responsed[0].unitId}`, responsed[0].vin);
                            resolve({ success: "Listo" });
                        } else {
                            if (response.statusCode == 401) {
                                insBitacoraApi(`Error en el API para trer los documentos estatus "401" Respuesta: ${response.body} para el businessUnitId ${responsed[0].unitId}`, responsed[0].vin);
                                resolve({ success: "Listo" });
                            } else {
                                if (JSON.parse(response.body).success) {
                                    insBitacoraApi(`Se consumio con exito el API para traer los documentos para el businessUnitId ${responsed[0].unitId} Respuesta Exitosa: ${JSON.parse(response.body).message} `, responsed[0].vin);
                                    resolve({ success: "Listo" });
                                } else {
                                    insBitacoraApi(`Se consumio con exito el API para traer los documentos para el businessUnitId ${responsed[0].unitId} Respuesta No exitosa: ${JSON.parse(response.body).message}`, responsed[0].vin);
                                    resolve({ success: "Listo" });
                                };
                            };
                        };
                    });
                });
            } else {
                resolve({ success: "Listo" });
            };
        } catch (error) {
            insBitacoraApi(`Error en el consumo del API que trae lod socutmentos CATCH: ${error}, para el idExpediente: ${idExpediente}`, 'NO APLICA');
            console.log('error', error);
            resolve({ success: "Listo" });
        };
    });
};

insBitacoraApi = (accion, vin) => {
    var model = new nodoModel({
        parameters: confParams
    });

    var params = [
        { name: 'accion', value: accion, type: model.types.STRING },
        { name: 'vin', value: vin, type: model.types.STRING }
    ];

    model.query('[expedienteSeminuevo].[INS_BITACORA_ACCION_API_SP]', params, function (error, result) { });

}

nodo.prototype.get_reporteGeneralGA = function (req, res, next) {
    var self = this;
    var params = [
        { name: 'F1', value: req.query.fecha1, type: self.model.types.STRING },
        { name: 'F2', value: req.query.fecha2, type: self.model.types.STRING }
    ];

    this.model.queryAllRecordSet('[expedienteSeminuevo].[SEL_REPORTE_GENERAL_GA_SP]', params, function (error, result) {
        self.view.expositor(res, {
            error: error,
            result: result
        });
    });
};

nodo.prototype.get_candadoFacturacion = function (req, res, next) {
    var self = this;

    var params = [
        { name: 'vin', value: req.query.vin, type: self.model.types.STRING },
        { name: 'idEmpresa', value: req.query.idEmpresa, type: self.model.types.INT },
        { name: 'idSucursal', value: req.query.idSucursal, type: self.model.types.INT }
    ];

    this.model.queryAllRecordSet('[expedienteSeminuevo].[SEL_CANDADO_FACTURACION_SP]', params, function (error, result) {
        self.view.expositor(res, {
            error: error,
            result: result
        });
    });
};

nodo.prototype.get_candadoEntrega = function (req, res, next) {
    var self = this;

    var params = [
        { name: 'vin', value: req.query.vin, type: self.model.types.STRING },
        { name: 'idEmpresa', value: req.query.idEmpresa, type: self.model.types.INT },
        { name: 'idSucursal', value: req.query.idSucursal, type: self.model.types.INT }
    ];

    this.model.queryAllRecordSet('[expedienteSeminuevo].[SEL_CANDADO_ENTREGA_SP]', params, function (error, result) {
        self.view.expositor(res, {
            error: error,
            result: result
        });
    });
};

getDataIntelimotors = (vin, idEmpresa, idSucursal, idExpediente) => {
    return new Promise((resolve) => {
        var model = new nodoModel({
            parameters: confParams
        });

        try {
            vinFlotilla.unidadFlotilla(vin, idEmpresa, idSucursal).then((res) => {
                let esFlotilla = res.dataFleet;
                let estatusFLotilla = res.estatusFleet;
                let exp_flotilla;

                if (!esFlotilla) {
                    exp_flotilla = 0;
                } else {
                    if (esFlotilla && estatusFLotilla == 'Desflote GA') {
                        exp_flotilla = 3;
                    } else {
                        exp_flotilla = 1;
                    };
                };

                var params = [
                    { name: 'idExpediente', value: idExpediente, type: model.types.INT },
                    { name: 'flotilla', value: exp_flotilla, type: model.types.INT }
                ];
                model.query('[expedienteSeminuevo].[UPD_EXPEDIENTE_FLOTILLA_SP]', params, function (error, result) {
                    resolve({ success: 'NEXT' })
                });
            });
        } catch (e) {
            resolve({ success: 'NEXT' })
        };
    });
};

nodo.prototype.get_unidadFacturada = function (req, res, next) {
    var self = this;

    var params = [
        { name: 'vin', value: req.query.vin, type: self.model.types.STRING },
        { name: 'idEmpresa', value: req.query.idEmpresa, type: self.model.types.INT },
        { name: 'idSucursal', value: req.query.idSucursal, type: self.model.types.INT }
    ];

    this.model.queryAllRecordSet('[expedienteSeminuevo].[SEL_UNIDAD_FACTURADA_SP]', params, function (error, result) {
        self.view.expositor(res, {
            error: error,
            result: result
        });
    });
};

nodo.prototype.get_dataDocumentosFaltantes = function (req, res, next) {
    var self = this;

    var params = [
        { name: 'vin', value: req.query.vin, type: self.model.types.STRING },
        { name: 'idEmpresa', value: req.query.idEmpresa, type: self.model.types.INT },
        { name: 'idSucursal', value: req.query.idSucursal, type: self.model.types.INT },
        { name: 'idProceso', value: req.query.idProceso, type: self.model.types.INT }
    ];

    this.model.queryAllRecordSet('[expedienteSeminuevo].[SEL_ALL_DOCUMENTS_REPORTE_SP]', params, function (error, result) {
        self.view.expositor(res, {
            error: error,
            result: result
        });
    });
};

replicateDocuments = (idExpedienteOrigen, idProceso) => {
    return new Promise((resolve) => {
        let model = new nodoModel({
            parameters: confParams
        });

        var params = [
            { name: 'idExpedienteOrigen', value: idExpedienteOrigen, type: model.types.INT }
        ];
        model.query('[expedienteSeminuevo].[SEL_ALL_VINES_REPLICATE_DESFLOTE_GA_SP]', params, async function (error, result) {
            if (error) {
                await insBitacoraReplicate(`Error al traer los expedientes para replica de expediente`, idExpedienteOrigen, null);
                resolve({ success: 'Listo' });
            } else {
                if (result.length > 0) {
                    for (let i = 0; i <= result.length - 1; i++) {
                        await insBitacoraReplicate(`Iniciamos el proceso de replica de expediente`, idExpedienteOrigen, result[i].id_expediente);
                        await getAllFolderReplicate(idExpedienteOrigen, result[i].id_expediente, idProceso);
                        await getAllDocumetsReplicate(idExpedienteOrigen, result[i].id_expediente, idProceso)

                        if (i == result.length - 1) {
                            await insBitacoraReplicate(`Termina el proceso de TODOS los expedientes`, idExpedienteOrigen, result[i].id_expediente);
                            resolve({ success: 'Listo' });
                        };
                    };
                } else {
                    resolve({ success: 'Listo' });
                };
            };
        });
    });
};

getAllFolderReplicate = (idExpedienteOrigen, idExpedienteDestino, idProceso) => {
    return new Promise((resolve) => {
        let model = new nodoModel({
            parameters: confParams
        });

        var params = [
            { name: 'idExpediente', value: idExpedienteDestino, type: model.types.INT },
            { name: 'idProceso', value: idProceso, type: model.types.INT }
        ];

        model.query('[expedienteSeminuevo].[SEL_ALL_CREATE_FOLDERS_SP]', params, async function (error, result) {
            if (error) {
                await insBitacoraReplicate(`Error al traer las rutas para crear los folders`, idExpedienteOrigen, idExpedienteDestino);
                resolve({ success: 'Listo' });
            } else {
                await insBitacoraReplicate(`Iniciamos proceso de creacion de folders`, idExpedienteOrigen, idExpedienteDestino);
                if (result.length > 0) {
                    for (let i = 0; i <= result.length - 1; i++) {
                        await createFolderReplicate(idExpedienteOrigen, idExpedienteDestino, result[i].folder)
                        if (i == result.length - 1) {
                            await insBitacoraReplicate(`Termino la creacion de folders`, idExpedienteOrigen, idExpedienteDestino);
                            resolve({ success: 'Listo' });
                        };
                    };
                } else {
                    resolve({ success: 'Listo' });
                };
            };
        });
    });
};

createFolderReplicate = (idExpedienteOrigen, idExpedienteDestino, rutaCreate) => {
    return new Promise(async (resolve) => {
        if (!fs.existsSync(rutaCreate)) {
            fs.mkdirSync(rutaCreate);
            setTimeout(async () => {
                await insBitacoraReplicate(`Se creo el folder con la ruta: "${rutaCreate}"`, idExpedienteOrigen, idExpedienteDestino);
                resolve({ success: 'Listo' });
            }, 500);
        } else {
            await insBitacoraReplicate(`Ya existia el folder con la ruta: "${rutaCreate}"`, idExpedienteOrigen, idExpedienteDestino);
            resolve({ success: 'Listo' });
        };
    });
};

getAllDocumetsReplicate = (idExpedienteOrigen, idExpedienteDestino, idProceso) => {
    return new Promise((resolve) => {
        let model = new nodoModel({
            parameters: confParams
        });

        var params = [
            { name: 'idExpedienteOrigen', value: idExpedienteOrigen, type: model.types.INT },
            { name: 'idExpedienteDestino', value: idExpedienteDestino, type: model.types.INT }
        ];

        model.query('[expedienteSeminuevo].[SEL_ALL_DOCUMENTS_REPLICATE_DESFLOTE_GA_SP]', params, async function (error, result) {
            if (error) {
                await insBitacoraReplicate(`Error al traer los documentos para replicar`, idExpedienteOrigen, idExpedienteDestino);
                resolve({ success: 'Listo' });
            } else {
                await insBitacoraReplicate(`Inicia el proceso de replica de documentos`, idExpedienteOrigen, idExpedienteDestino);
                if (result.length > 0) {
                    for (let i = 0; i <= result.length - 1; i++) {
                        await copyDocument(idExpedienteOrigen, result[i].rutaOrigen, result[i].rutaDestino, result[i].idExpediente, result[i].id_documento, result[i].id_proceso, result[i].id_estatus, result[i].observacionesDocumento, result[i].nombreDocumento, result[i].idUsuario);

                        if (i == result.length - 1) {
                            await insBitacoraReplicate(`Termina el proceso de replica de documentos`, idExpedienteOrigen, idExpedienteDestino);
                            resolve({ success: 'Listo' });
                        };
                    };
                } else {
                    resolve({ success: 'Listo' });
                };
            };
        });
    });
};

copyDocument = (idExpedienteOrigen, rutaOrigen, rutaDestino, idExpediente, id_documento, id_proceso, id_estatus, observacionesDocumento, nombreDocumento, idUsuario) => {
    return new Promise(async (resolve) => {
        if (!fs.existsSync(rutaDestino)) {
            fs.copyFile(rutaOrigen, rutaDestino, async (err) => {
                if (err) {
                    await insBitacoraReplicate(`Error al copiar el documento: ${id_documento} para la ruta: ${rutaDestino} error: ${error}`, idExpedienteOrigen, idExpediente);
                    resolve({ success: 'Listo' })
                } else {
                    let model = new nodoModel({
                        parameters: confParams
                    });

                    var params = [
                        { name: 'id_expediente', value: idExpediente, type: model.types.INT },
                        { name: 'id_documento', value: id_documento, type: model.types.INT },
                        { name: 'id_proceso', value: id_proceso, type: model.types.INT },
                        { name: 'id_estatus', value: id_estatus, type: model.types.INT },
                        { name: 'observacionesDocumento', value: observacionesDocumento, type: model.types.STRING },
                        { name: 'nombreDocumento', value: nombreDocumento, type: model.types.STRING },
                        { name: 'idUsuario', value: idUsuario, type: model.types.INT },
                    ];

                    model.query('[expedienteSeminuevo].[INS_DOCUMENTO_EXPEDIENTE]', params, async function (error, result) {
                        await insBitacoraReplicate(`Se copío con exito el documento: ${id_documento} para la ruta: ${rutaDestino} idDocumentoGuardado: ${result[0].idDocumentoGuardado}`, idExpedienteOrigen, idExpediente);
                        resolve({ success: 'Listo' });
                    });
                };
            });
        } else {
            await insBitacoraReplicate(`Ya existia el documento : ${id_documento} para la ruta: ${rutaDestino}`, idExpedienteOrigen, idExpediente);
            resolve({ success: 'Listo' })
        };
    });
};

insBitacoraReplicate = (accion, idExpOrigen, idExpDestino) => {
    return new Promise((resolve) => {
        let model = new nodoModel({
            parameters: confParams
        });

        var params = [
            { name: 'accion', value: accion, type: model.types.STRING },
            { name: 'idExpOrigen', value: idExpOrigen, type: model.types.INT },
            { name: 'idExpDestino', value: idExpDestino, type: model.types.INT }
        ];

        model.query('[expedienteSeminuevo].[INS_BITACORA_REPLICA_EXPEDIENTE_SP]', params, async function (error, result) {
            resolve({ success: 'Listo' });
        });
    });
};

// cron.schedule("2 16 * * *", async function () {
//     sendMail.envia('lgarciaperrusquia@gmail.com', `Prueba Cambio de correo"`, 'Esto es una prueba en Produccion del cambio de correo').then(async (resPromise) => {
//         console.log( 'resPromise', resPromise )
//     });
// });

nodo.prototype.get_procesaEstatusIm = function (req, res, next) {
    var self = this;

    this.model.queryAllRecordSet('[expedienteSeminuevo].[SEL_ALL_EXPEDIENTES_SP]', [], async function (error, result) {

        for (let i = 0; i <= result[0].length - 1; i++) {
            await getDataIntelimotors(result[0][i].exp_vin, result[0][i].exp_empresa, result[0][i].exp_sucursal, result[0][i].id_expediente);
            if (i == result[0].length - 1) {
                self.view.expositor(res, {
                    error: error,
                    result: result
                });
            };
        };
    });
};

nodo.prototype.get_allTenenciasObligatorias = function (req, res, next) {
    var self = this;

    var params = [
        { name: 'idExpediente', value: req.query.idExpediente, type: self.model.types.INT }
    ];

    this.model.queryAllRecordSet('[expedienteSeminuevo].[SEL_ALL_TENENCIAS_OBLIGATORIAS_SP]', params, function (error, result) {
        self.view.expositor(res, {
            error: error,
            result: result
        });
    });
};

nodo.prototype.post_updateTenenciasDocGubernamental = async (req, res, next) => {
    var self = this;

    const { idExpediente, checksYears } = req.body;

    for (let i = 0; i <= checksYears.length - 1; i++) {
        if (checksYears[i].checkValue) {
            await updateTeneciasGubernamental(idExpediente, checksYears[i]);
        };
        if (i == checksYears.length - 1) {
            return res.status(200).json([{
                success: 1,
                message: 'Se guardado el documento con éxito'
            }]);
        };
    };
};

updateTenenciasObligatorias = (nombreDocumento, id_expediente) => {
    return new Promise((resolve) => {
        let model = new nodoModel({
            parameters: confParams
        });

        let varAnio = nombreDocumento.split('_').pop();
        let anio = varAnio.split('.')[0];

        if (isNaN(anio) == false) {
            var params = [
                { name: 'idExpediente', value: id_expediente, type: model.types.INT },
                { name: 'anio', value: parseInt(anio), type: model.types.INT }
            ];
            model.query('[expedienteSeminuevo].[UPD_TENENCIAS_OBLIGATORIAS_SP]', params, function (error, result) {
                resolve({ success: 'Listo' });
            });
        } else {
            resolve({ success: 'Listo' });
        };
    });
};

updateTeneciasGubernamental = (idExpediente, data) => {
    return new Promise((resolve) => {
        let model = new nodoModel({
            parameters: confParams
        });

        const { anio, checkValue } = data;

        var params = [
            { name: 'idExpediente', value: idExpediente, type: model.types.INT },
            { name: 'anio', value: parseInt(anio), type: model.types.INT },
            { name: 'valueAmparo', value: checkValue ? 1 : 0, type: model.types.INT },
        ];

        model.query('[expedienteSeminuevo].[UPD_TENENCIAS_OBLIGATORIAS_AMPARO_SP]', params, function (error, result) {
            resolve({ success: 'Listo' });
        });

    });
};

nodo.prototype.get_selTotalDocumet = function (req, res, next) {
    var self = this;

    const { nombreDocumento,
        idExpediente,
        idProceso,
        idDocumento
    } = req.query;

    var params = [
        { name: 'nombreDocumento', value: nombreDocumento, type: self.model.types.STRING },
        { name: 'idExpediente', value: idExpediente, type: self.model.types.INT },
        { name: 'idProceso', value: idProceso, type: self.model.types.INT },
        { name: 'idDocumento', value: idDocumento, type: self.model.types.INT }
    ];
    this.model.queryAllRecordSet('[expedienteSeminuevo].[SEL_TOTAL_DOCUMENTS_SP]', params, async function (error, result) {
        self.view.expositor(res, {
            error: error,
            result: result
        });
    });
};


nodo.prototype.get_documentsForExcel = function (req, res, next) {
    var self = this;

    const {
        idProceso,
        idCanal,
        tipoPersona,
        idEstados
    } = req.query;

    var params = [
        { name: 'idProceso', value: idProceso, type: self.model.types.INT },
        { name: 'idCanal', value: idCanal, type: self.model.types.INT },
        { name: 'tipoPersona', value: tipoPersona, type: self.model.types.STRING },
        { name: 'idEstados', value: idEstados, type: self.model.types.STRING }
    ];

    this.model.queryAllRecordSet('[expedienteSeminuevo].[SEL_DOCUMENTOS_EXCEL_SP]', params, (error, result) => {
        self.view.expositor(res, {
            error: error,
            result: result
        });
    });
};

nodo.prototype.get_dataFacturaAccesorios = function (req, res, next) {
    var self = this;
    totalInsertadosFacturaAccesorios = 0;
    const {
        vin,
        idEmpresa,
        idSucursal,
        idUsuario
    } = req.query;

    var params = [
        { name: 'vin', value: vin, type: self.model.types.STRING },
        { name: 'idEmpresa', value: idEmpresa, type: self.model.types.INT },
        { name: 'idSucursal', value: idSucursal, type: self.model.types.INT }
    ];

    this.model.query('[expedienteSeminuevo].[SEL_ALL_FACTURAS_SP]', params, async (error, result) => {
        if (result.length > 0) {
            for (let i = 0; i <= result.length - 1; i++) {
                let paramsParamet = [
                    { name: 'vin', value: vin, type: self.model.types.STRING },
                    { name: 'idEmpresa', value: idEmpresa, type: self.model.types.INT },
                    { name: 'idSucursal', value: idSucursal, type: self.model.types.INT },
                    { name: 'idUsuario', value: idUsuario, type: self.model.types.INT },
                    { name: 'factura', value: result[i].factura, type: self.model.types.STRING }
                ];

                let resFacturaAccesorio = await nodo.saveFacturasAccesorios(1, paramsParamet);

                if (resFacturaAccesorio.success == 1) {
                    totalInsertadosFacturaAccesorios += 1;
                };

                if (i == result.length - 1) {
                    if (totalInsertadosFacturaAccesorios > 0) {
                        return res.status(200).json([{
                            success: 1,
                            message: 'Se guardo el documento'
                        }]);
                    } else {
                        return res.status(200).json([{
                            success: 2,
                            message: 'No hay documentos que guardar'
                        }]);
                    };
                };
            };
        } else {
            return res.status(200).json([{
                success: 2,
                message: 'No hay documentos que guardar'
            }]);
        };
    });
};

nodo.prototype.get_allDataFacturaAccesorios = function (req, res, next) {
    var self = this;

    const {
        vin,
        idEmpresa,
        idSucursal
    } = req.query;

    var params = [
        { name: 'vin', value: vin, type: self.model.types.STRING },
        { name: 'idEmpresa', value: idEmpresa, type: self.model.types.INT },
        { name: 'idSucursal', value: idSucursal, type: self.model.types.INT }
    ];

    this.model.query('[expedienteSeminuevo].[SEL_ALL_FACTURAS_SP]', params, async (error, result) => {
        self.view.expositor(res, {
            error: error,
            result: result
        });
    });
};

nodo.prototype.get_documentoWSFacturas = function (req, res, next) {
    var self = this;
    var url = this.conf.parameters.WSInvoce;
    var args = {};

    soap.createClient(url, function (err, client) {
        if (err) {
            console.log('Error en createClient : ', err)
            self.view.expositor(res, {
                result: [{ success: 0, arrayBits: "Servicio no disponible por el monento, intentelo más tarde ..." }]
            });
        } else {
            var obj = JSON.parse(req.query.aBuscar);

            args = {
                RFCEMISOR: obj.RFCEMISOR,
                RFCRECEPTOR: obj.RFCRECEPTOR,
                SERIE: obj.serie,
                FOLIO: obj.folio
            };

            client.MuestraFactura(args, function (err, resul, raw) {
                if (err) {
                    self.view.expositor(res, {
                        result: [{ success: 0, arrayBits: "Servicio no disponible por el monento, intentelo más tarde ..." }]
                    });
                } else {
                    self.view.expositor(res, {
                        result: [{ success: 1, arrayBits: resul }]
                    });
                }
            });
        }
    });
};

nodo.prototype.get_dataRecibos = function (req, res, next) {
    var self = this;
    totalInsertadosFacturasRecibos = 0;
    const {
        vin,
        idEmpresa,
        idSucursal,
        idUsuario
    } = req.query;

    var params = [
        { name: 'vin', value: vin, type: self.model.types.STRING },
        { name: 'idEmpresa', value: idEmpresa, type: self.model.types.INT },
        { name: 'idSucursal', value: idSucursal, type: self.model.types.INT }
    ];

    this.model.query('[expedienteSeminuevo].[SEL_ALL_RECIBOS_SP]', params, async (error, result) => {
        if (result.length > 0) {
            for (let i = 0; i <= result.length - 1; i++) {
                let paramsParamet = [
                    { name: 'vin', value: vin, type: self.model.types.STRING },
                    { name: 'idEmpresa', value: idEmpresa, type: self.model.types.INT },
                    { name: 'idSucursal', value: idSucursal, type: self.model.types.INT },
                    { name: 'idUsuario', value: idUsuario, type: self.model.types.INT },
                    { name: 'factura', value: result[i].Cartera, type: self.model.types.STRING }
                ];

                let resRecibos = await nodo.saveFacturasAccesorios(2, paramsParamet);
                if (resRecibos.success === 1) {
                    totalInsertadosFacturasRecibos += 1;
                };

                if (i === result.length - 1) {
                    if (totalInsertadosFacturasRecibos > 0) {
                        return res.status(200).json([{
                            success: 1,
                            message: 'Se guardo el documento'
                        }]);
                    } else {
                        return res.status(200).json([{
                            success: 2,
                            message: 'No hay documentos para guardar'
                        }]);
                    };
                };
            };
        } else {
            return res.status(200).json([{
                success: 2,
                message: 'No hay documentos que guardar'
            }]);
        };
    });
};

nodo.saveFacturasAccesorios = (peticion, params) => {
    return new Promise(resolve => {
        let model = new nodoModel({
            parameters: confParams
        });
        let sp = peticion === 1 ? '[expedienteSeminuevo].[INS_DOCUMENTOS_FACTURAS_ACCESORIOS_SP]' : '[expedienteSeminuevo].[INS_DOCUMENTOS_FACTURAS_RECIBOS_SP]';

        model.query(sp, params, (error, result) => {
            if (result[0].success == 1) {
                resolve({ success: 1 });
            } else {
                resolve({ success: 2 })
            };
        });
    });
};

nodo.prototype.get_allRecibos = function (req, res, next) {
    var self = this;
    allFacturasRecibos = [];
    const {
        vin,
        idEmpresa,
        idSucursal
    } = req.query;

    var params = [
        { name: 'vin', value: vin, type: self.model.types.STRING },
        { name: 'idEmpresa', value: idEmpresa, type: self.model.types.INT },
        { name: 'idSucursal', value: idSucursal, type: self.model.types.INT }
    ];

    this.model.query('[expedienteSeminuevo].[SEL_ALL_RECIBOS_SP]', params, async (error, result) => {
        let newArray = [];
        result.forEach(value => {
            newArray.push(value.Cartera)
        });

        let uniqueFactura = newArray.filter((c, index) => newArray.indexOf(c) === index);
        // uniqueFactura.push('BA0000099215');
        // uniqueFactura = [];
        if (uniqueFactura.length > 0) {
            for (let i = 0; i <= uniqueFactura.length - 1; i++) {
                let dataSend = {
                    idEmpresa: idEmpresa,
                    factura: uniqueFactura[i]
                };

                let responsePromise = await nodo.createResponseRecibos(dataSend);

                if (i === uniqueFactura.length - 1) {
                    if (responsePromise.data.length > 0) {
                        return res.status(200).json([{
                            facturas: responsePromise.data
                        }]);
                    } else {
                        return res.status(200).json([{
                            facturas: []
                        }]);
                    };
                };
            };
        } else {
            return res.status(200).json([{
                facturas: []
            }]);
        };
    });
};

nodo.createResponseRecibos = data => {
    return new Promise(resolve => {
        let model = new nodoModel({
            parameters: confParams
        });

        let params = [
            { name: 'idEmpresa', value: data.idEmpresa, type: model.types.INT },
            { name: 'factura', value: data.factura, type: model.types.STRING }
        ];

        model.query('[expedienteSeminuevo].[SEL_ALL_RECIBOS_DESCOMPUESTA_SP]', params, (error, result) => {
            allFacturasRecibos.push(result[0]);
            resolve({ success: 1, data: allFacturasRecibos });
        });
    });
};

nodo.prototype.get_docsComprobantePago = function (req, res, next) {
    var self = this;

    const { vin, idEmpresa } = req.query;

    var params = [
        { name: 'vin', value: vin, type: self.model.types.STRING },
        { name: 'idEmpresa', value: idEmpresa, type: self.model.types.INT }
    ];

    this.model.queryAllRecordSet('[expedienteSeminuevo].[SEL_DATA_COMPROBANTE_PAGO_SP]', params, (error, result) => {
        self.view.expositor(res, {
            error: error,
            result: result
        });
    });
};

nodo.prototype.get_pdf = function (req, res, next) {
    var self = this;

    const url = confParams.WSGeneraPdf;

    const {
        tipo,
        factura,
        nodo
    } = req.query

    if (tipo && factura && nodo) {
        const args = {
            Tipo: tipo,
            Documento: factura,
            Nodo: nodo
        };

        soap.createClient(url, (err, client) => {
            if (err) {
                console.log('Error 4', err)

                self.view.expositor(res, {
                    mensaje: "Hubo un problema intente de nuevo",
                });
            } else {
                client.GenerarPdfArray(args, (err, result, raw) => {
                    if (err) {
                        console.log('Error 3', err)

                        self.view.expositor(res, {
                            mensaje: "Hubo un problema intente de nuevo",
                        });
                    } else {
                        parseString(raw, (err, result) => {
                            if (err) {
                                console.log('Error 2', err)

                                self.view.expositor(res, {
                                    mensaje: "Hubo un problema intente de nuevo",
                                });
                            } else {
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
        self.view.expositor(res, {
            mensaje: "Hubo un problema intente de nuevo",
        });
    };
};


nodo.prototype.get_saveComprobantePago = function (req, res, next) {
    var self = this;

    const {
        vin,
        idEmpresa,
        idSucursal,
        idUsuario } = req.query;

    var params = [
        { name: 'vin', value: vin, type: self.model.types.STRING },
        { name: 'idEmpresa', value: idEmpresa, type: self.model.types.INT },
        { name: 'idSucursal', value: idSucursal, type: self.model.types.INT },
        { name: 'idUsuario', value: idUsuario, type: self.model.types.INT }
    ];

    this.model.queryAllRecordSet('[expedienteSeminuevo].[INS_DOCUMENTO_COMPROBANTE_SP]', params, (error, result) => {
        self.view.expositor(res, {
            error: error,
            result: result
        });
    });
};

nodo.prototype.get_accionEnlace = function (req, res, next) {
    var self = this;
    const {
        idUsuario,
        vin,
        idEmpresa,
        idSucursal
    } = req.query;

    var params = [
        { name: 'idUsuario', value: idUsuario, type: self.model.types.INT },
        { name: 'vin', value: vin, type: self.model.types.STRING },
        { name: 'idEmpresa', value: idEmpresa, type: self.model.types.INT },
        { name: 'idSucursal', value: idSucursal, type: self.model.types.INT }
    ];

    this.model.queryAllRecordSet('[expedienteSeminuevo].[SEL_ACCION_ENLACE_SP]', params, (error, result) => {
        self.view.expositor(res, {
            error: error,
            result: result
        });
    });
};

nodo.sendMailEnlace = (idExpediente, tipoProceso) => {
    return new Promise(resolve => {
        let model = new nodoModel({
            parameters: confParams
        });

        const paramsSave = [
            { name: 'idExpediente', value: idExpediente, type: model.types.INT },
            { name: 'idProceso', value: tipoProceso, type: model.types.INT }
        ];

        model.query('[expedienteSeminuevo].[INS_DOCUMENTS_ENLACE_SP]', paramsSave, async (err, response) => {
            if (err) {
                const htmlErr = `Ocurrio un error al insertar los documentos del enlace para el expediente ${idExpediente} del proceso de ${tipoProceso == 1 ? 'Compra' : 'Venta'}
                                ERROR: ${err}`;

                await sendMail.envia('lgarciaperrusquia@gmail.com', `"Error al insertar los documentos del enlace"`, htmlErr);
                resolve({ success: 1 });
            } else {
                if (response[0].success === 1) {
                    const params = [
                        { name: 'idExpediente', value: idExpediente, type: model.types.INT }
                    ];

                    model.query('[expedienteSeminuevo].[SEL_USUARIOS_ENLACE_SP]', params, async (error, result) => {
                        if (result.length > 0) {
                            for (let i = 0; i <= result.length - 1; i++) {
                                const html = `<div style=\"width:310px;height:140px\">
                                                <center>
                                                    <img style=\"width: 80% \" src=\"https://cdn.discordapp.com/attachments/588785789438001183/613027505137516599/logoA.png\" alt=\"GrupoAndrade\" />
                                                </center>
                                            </div>
                                            <div>
                                                <p> Estimado ${result[i].usu_nombre} <br/> </p>
                                                <p> El expediente de ${tipoProceso == 1 ? 'Compra' : 'Venta'} con el VIN "${result[i].vin}" de la sucursal "${result[i].sucursal} esta listo para su revision."</p> <br/>
                                                <p><a style='font: 13px Arial;
                                                            text-decoration: none;
                                                            background-color: #000080;
                                                            color: white;
                                                            padding: 13px 13px 13px 13px;
                                                            border-top: 1px solid #cccccc;
                                                            border-right: 1px solid #333333;
                                                            border-bottom: 1px solid #333333;
                                                            border-left: 1px solid #cccccc;
                                                            width: 299px;
                                                            border-radius: 35px;' href='${confParams.urlGoExpedienteMail}${result[i].usu_idUsuario}' target="_blank">Ir al expediente</a></p>
                                            </div>`;

                                await sendMail.envia(result[i].usu_correo, `"Expediente listo para su revisión"`, html);

                                if (i === result.length - 1) {
                                    resolve({ success: 1 });
                                };
                            };
                        } else {
                            resolve({ success: 1 });
                        };
                    });
                } else {
                    if (response[0].success === 2) {
                        await promisePublicarIntelimotor(idExpediente);
                        await replicateDocuments(idExpediente, 1);
                        resolve({ success: 1 });
                    } else {
                        const htmlNoSave = `Ocurrio un error al insertar los documentos del enlace para el expediente ${idExpediente} del proceso de ${tipoProceso == 1 ? 'Compra' : 'Venta'}
                        ERROR: ${err}`;
                        await sendMail.envia('lgarciaperrusquia@gmail.com', `"Error al insertar los documentos del enlace"`, htmlNoSave);
                        resolve({ success: 1 });
                    };
                };
            };
        });
    });
};

nodo.prototype.get_updateEstatusDocumentoEnlace = function (req, res, next) {
    var self = this;

    const { id_documentoGuardado,
        id_estatus,
        observaciones,
        idUsuario,
        tipoProceso } = req.query;

    var params = [
        { name: 'id_documentoGuardado', value: id_documentoGuardado, type: self.model.types.INT },
        { name: 'id_estatus', value: id_estatus, type: self.model.types.INT },
        { name: 'observaciones', value: observaciones, type: self.model.types.STRING }
    ];

    this.model.query('[expedienteSeminuevo].[UPD_ESTATUS_DOCUMENTO_EXPEDIENTE_ENLACE_SP]', params, async function (error, result) {
        var textoSend = 'Aprobación Documento';
        if (req.query.id_estatus == 3) {
            await promiseSendMailRechazoDocumentos(req.query.id_documentoGuardado);
            textoSend = 'Rechazo Documento';
        };

        if (parseInt(tipoProceso) === 1) {
            await nodo.promiseCheckExpedienteEnlace(result[0].idExpediente);
        };

        await promiseSaveBitacora(textoSend, result[0].idDocumento, idUsuario, result[0].idExpediente, req.query.id_documentoGuardado);
        self.view.expositor(res, {
            error: error,
            result: result
        });
    });
};

nodo.promiseCheckExpedienteEnlace = idExpediente => {
    return new Promise(resolve => {
        let model = new nodoModel({
            parameters: confParams
        });

        let params = [
            { name: 'idExpediente', value: idExpediente, type: model.types.INT }
        ];

        model.query('[expedienteSeminuevo].[SEL_VALIDA_EXPEDIENTE_COMPLETO_ENLACE_SP]', params, async (error, result) => {
            if (result[0].success == 1) {
                await promisePublicarIntelimotor(idExpediente);
                await replicateDocuments(idExpediente, 1);
                resolve({ success: 1 });
            } else {
                console.log('Aun no se publica');
                resolve({ success: 1 });
            };
        });
    });
};

nodo.checkExpedienteCompletoCXC = (idExpediente, tipoProceso) => {
    return new Promise(resolve => {
        let model = new nodoModel({
            parameters: confParams
        });

        let params = [
            { name: 'idExpediente', value: idExpediente, type: model.types.INT }
        ];

        model.query('[expedienteSeminuevo].[SEL_VALIDA_EXPEDIENTE_COMPLETO_CXC_SP]', params, async (error, result) => {
            if (result[0].success == 1) {
                //await nodo.sendMailEnlace(idExpediente, tipoProceso);
                resolve({ success: 1 });
            } else {
                resolve({ success: 1 });
            };
        });
    });
};

nodo.prototype.get_urlGuia = function (req, res, next) {
    var self = this;

    const { idProceso, idDocumento } = req.query;

    var params = [
        { name: 'idProceso', value: idProceso, type: self.model.types.INT },
        { name: 'idDocumento', value: idDocumento, type: self.model.types.INT }
    ];

    this.model.query('[expedienteSeminuevo].[SEL_URL_GUIA_SP]', params, (error, result) => {
        self.view.expositor(res, {
            error: error,
            result: result
        });
    });
};

nodo.prototype.get_dataDocumentosFaltantesEnlace = function (req, res, next) {
    var self = this;

    var params = [
        { name: 'vin', value: req.query.vin, type: self.model.types.STRING },
        { name: 'idEmpresa', value: req.query.idEmpresa, type: self.model.types.INT },
        { name: 'idSucursal', value: req.query.idSucursal, type: self.model.types.INT },
        { name: 'idProceso', value: req.query.idProceso, type: self.model.types.INT }
    ];

    this.model.queryAllRecordSet('[expedienteSeminuevo].[SEL_DOCUMENTOS_EXPEDIENTE_ENLACE_SP]', params, function (error, result) {
        self.view.expositor(res, {
            error: error,
            result: result
        });
    });
};

checkValidaDocsCargadosCompletos = (idExpediente, idProceso) => {
    return new Promise(resolve => {
        try {
            let model = new nodoModel({
                parameters: confParams
            });
            const sp = idProceso == 1 ? '[expedienteSeminuevo].[SEL_VALIDA_DOCS_CARGADOS_COMPLETOS_CXP_SP]' : '[expedienteSeminuevo].[SEL_VALIDA_DOCS_CARGADOS_COMPLETOS_CXC_SP]';
            const params = [
                { name: 'idExpediente', value: idExpediente, type: model.types.INT }
            ];

            model.query(sp, params, (err, result) => {
                if (result[0].success == 0) {
                    resolve({ success: 1 });
                } else {
                    const paramsMail = [
                        { name: 'idExpediente', value: idExpediente, type: model.types.INT }
                    ];

                    model.query('[expedienteSeminuevo].[SEL_USUARIOS_GERENTE_SP]', paramsMail, async (err, result) => {
                        if (result.length !== 0) {
                            for (let i = 0; i <= result.length - 1; i++) {
                                const html = `
                                            <div style=\"width:310px;height:140px\">
                                                <center>
                                                    <img style=\"width: 80% \" src=\"https://cdn.discordapp.com/attachments/588785789438001183/613027505137516599/logoA.png\" alt=\"GrupoAndrade\" />
                                                </center>
                                            </div>
                                            <div>
                                                <p> Estimado ${result[i].usu_nombre} <br/> </p>
                                                <p> El expediente de ${idProceso == 1 ? 'Compra' : 'Venta'} con el VIN "${result[i].vin}" de la sucursal "${result[i].sucursal} esta listo para su revision."</p> <br/>
                                                <p><a style='font: 13px Arial;
                                                            text-decoration: none;
                                                            background-color: #000080;
                                                            color: white;
                                                            padding: 13px 13px 13px 13px;
                                                            border-top: 1px solid #cccccc;
                                                            border-right: 1px solid #333333;
                                                            border-bottom: 1px solid #333333;
                                                            border-left: 1px solid #cccccc;
                                                            width: 299px;
                                                            border-radius: 35px;' href='${confParams.urlGoExpedienteMail}${result[i].usu_idUsuario}' target="_blank">Ir al expediente</a></p>
                                            </div>`;

                                await sendMail.envia(result[i].usu_correo, `"Expediente de ${idProceso == 1 ? 'Compra' : 'Venta'} listo para su revisión"`, html);

                                if (i === result.length - 1) {
                                    resolve({ success: 1 });
                                };
                            };
                        } else {
                            resolve({ success: 1 });
                        };
                    });
                };
            });
        } catch (error) {
            resolve({ success: 0 });
        };
    });
};

/**#regionMailManagerNotAppre
 *@description:  Variables para el envio del correo del gerente cuando este completo y aun no lo aprueba
 */

cron.schedule(sendMailManagerEnlace, async function () {
    var model = new nodoModel({
        parameters: confParams
    });
    console.log('Start process Manager');
    model.query('[expedienteSeminuevo].[SEL_ALL_EMPRESAS]', [], async function (error, responsed) {
        if (responsed.length > 0) {
            for (let i = 0; i <= responsed.length - 1; i++) {
                empresaManagerMail = '';
                empresaManagerMail = responsed[i].nombre_sucursal.split('CONCEN')[0];
                console.info(`======================= EMPRESA ${empresaManagerMail} =========================`);
                await promiseGetAllSucursalesByEmpresaManagerEnlace(responsed[i].emp_idempresa, 1);
                if (i == responsed.length - 1) {
                    console.error('End process Manager ');
                    sendMailEnlace(model);
                };
            };
        } else {
            console.log('Error al trae las empresas');
        };
    });
});

sendMailEnlace = model => {
    console.log('Start process enlace');
    model.query('[expedienteSeminuevo].[SEL_ALL_EMPRESAS]', [], async function (error, responsed) {
        if (responsed.length > 0) {
            for (let i = 0; i <= responsed.length - 1; i++) {
                empresaManagerMail = '';
                empresaManagerMail = responsed[i].nombre_sucursal.split('CONCEN')[0];
                console.info(`======================= EMPRESA ${empresaManagerMail} =========================`);
                await promiseGetAllSucursalesByEmpresaManagerEnlace(responsed[i].emp_idempresa, 2);
                if (i == responsed.length - 1) {
                    console.error('End process manager and enlace');

                };
            };
        } else {
            console.log('Error al trae las empresas');
        };
    });
};

// nodo.prototype.get_pruebaMail = function (req, res, next) {
//     var self = this;

//     this.model.query('[expedienteSeminuevo].[SEL_ALL_EMPRESAS]', [], async function (error, responsed) {
//         if (responsed.length > 0) {
//             for (let i = 0; i <= responsed.length - 1; i++) {
//                 empresaManagerMail = '';
//                 empresaManagerMail = responsed[i].nombre_sucursal.split('CONCEN')[0];
//                 console.info(`======================= EMPRESA ${empresaManagerMail} =========================`);
//                 await promiseGetAllSucursalesByEmpresaManagerEnlace(responsed[i].emp_idempresa, 1);
//                 if (i == responsed.length - 1) {
//                     res.status(200).send({ success: true });
//                 };
//             };
//         } else {
//             console.log('Error al trae las empresas');
//         };
//     });
// };

// nodo.prototype.get_pruebaMailEnlace = function (req, res, next) {
//     var self = this;

//     this.model.query('[expedienteSeminuevo].[SEL_ALL_EMPRESAS]', [], async function (error, responsed) {
//         if (responsed.length > 0) {
//             for (let i = 0; i <= responsed.length - 1; i++) {
//                 empresaManagerMail = '';
//                 empresaManagerMail = responsed[i].nombre_sucursal.split('CONCEN')[0];
//                 console.info(`======================= EMPRESA ${empresaManagerMail} =========================`);
//                 await promiseGetAllSucursalesByEmpresaManagerEnlace(responsed[i].emp_idempresa, 2);
//                 if (i == responsed.length - 1) {
//                     res.status(200).send({ success: true });
//                 };
//             };
//         } else {
//             console.log('Error al trae las empresas');
//         };
//     });
// };

promiseGetAllSucursalesByEmpresaManagerEnlace = (idEmpresa, tipoMails) => {
    return new Promise((resolve) => {
        var model = new nodoModel({
            parameters: confParams
        });

        let params = [
            { name: 'idEmpresa', value: idEmpresa, type: model.types.INT }
        ];

        model.query('[expedienteSeminuevo].[SEL_ALL_SUCURSALES_BY_EMPRESA]', params, async function (error, responsed) {
            if (responsed.length > 0) {
                for (let i = 0; i <= responsed.length - 1; i++) {
                    await promiseGetAllDataBySucursal(responsed[i], tipoMails);
                    if (i == responsed.length - 1) {
                        if (stringMailManager !== '') {
                            await promiseSendMailManagerNotApprove(usersManagerMail, mialsManagerMail, stringMailManager, tipoMails);
                        };

                        stringMailManager = '';
                        mialsManagerMail = '';
                        usersManagerMail = '';
                        resolve({ success: 1 });
                    };
                };
            } else {
                resolve({ success: 1 });
            };
        });
    });
};

promiseGetAllDataBySucursal = (data, tipoMails) => {
    return new Promise(resolve => {
        try {
            const { nombre_sucursal, suc_idSucursal, emp_idempresa } = data;

            let model = new nodoModel({
                parameters: confParams
            });

            const params = [
                { name: 'idEmpresa', value: emp_idempresa, type: model.types.INT },
                { name: 'idSucursal', value: suc_idSucursal, type: model.types.INT }
            ];

            const SP = tipoMails == 1 ? '[expedienteSeminuevo].[SEL_EXPDIENTES_MANAGER_NO_APPROVE_SP]' : '[expedienteSeminuevo].[SEL_EXPDIENTES_ENLACE_NO_APPROVE_SP]'

            model.queryAllRecordSet(SP, params, async (err, result) => {
                if (result[0].length === 0 || result[1].length === 0) {
                    resolve({ success: 1 });
                } else {
                    await promiseBuildMail(nombre_sucursal, result);
                };
                resolve({ success: 1 });
            });
        } catch (error) {
            resolve({ success: 1 });
        };
    });
};

promiseBuildMail = (nombreSucursal, dataMail) => {
    return new Promise(resolve => {
        try {
            let folios = '';
            let html = '';
            if (mialsManagerMail == '' || usersManagerMail == '') {
                mialsManagerMail = ''; usersManagerMail = '';
                dataMail[0].forEach(value => {
                    mialsManagerMail = mialsManagerMail + ` ${value.mailUsuario}; `;
                    usersManagerMail = usersManagerMail + ` ${value.nombreUsuario} `;
                });
            };

            dataMail[1].forEach(value => {
                folios = folios + `<tr>
                                        <td style="border: 1px solid #dddddd; text-align: left; padding: 8px;"> 
                                            ${value.id} 
                                        </td>  
                                        <td style="border: 1px solid #dddddd; text-align: left; padding: 8px;"> 
                                            ${value.vin} 
                                        </td> 
                                        <td style="border: 1px solid #dddddd; text-align: left; padding: 8px;"> 
                                            ${value.marca} 
                                        </td>
                                        <td style="border: 1px solid #dddddd; text-align: left; padding: 8px;"> 
                                            ${value.modelo} 
                                        </td>  
                                        <td style="border: 1px solid #dddddd; text-align: left; padding: 8px;"> 
                                            ${value.anio} 
                                        </td>
                                        <td style="border: 1px solid #dddddd; text-align: left; padding: 8px;"> 
                                            ${value.docsFaltantes} 
                                        </td>                            
                                    </tr>`;
            });

            html = ` <h2> ${nombreSucursal} </h2> </br>
                <table style="font-family: arial, sans-serif;  border-collapse: collapse;">
                    <tr style="background-color: #84B3D3;">
                        <th style="border: 1px solid #dddddd; text-align: left; padding: 8px;">#</th>
                        <th style="border: 1px solid #dddddd; text-align: left; padding: 8px;">Vin</th>
                        <th style="border: 1px solid #dddddd; text-align: left; padding: 8px;">Marca</th>
                        <th style="border: 1px solid #dddddd; text-align: left; padding: 8px;">Auto</th>
                        <th style="border: 1px solid #dddddd; text-align: left; padding: 8px;">Año</th>
                        <th style="border: 1px solid #dddddd; text-align: left; padding: 8px;">Documentos Faltantes por aprobar</th>                     
                </tr>
                ${folios}
                </table><br><br>`;

            stringMailManager = stringMailManager + `${html}`;
            resolve({ success: 1 });
        } catch (error) {
            resolve({ success: 1 });
        };
    });
};

promiseSendMailManagerNotApprove = (nombres, mails, htmlSend, tipoMails) => {
    return new Promise((reject) => {
        var html = `<label style="font-size:20px; font-weight:bold;">Estimados(a):${nombres}</label>
                    <br><br><br>
                    ${tipoMails == 1 ? '<label style="font-size: 18;"> Los siguientes expedientes digitales en seminuevos ya se cargaron todos los documentos pero el gerente aun no los aprueba, favor de revisarlos </label>' : '<label style="font-size: 18;"> Los siguientes expedientes digitales en seminuevos ya se cargaron todos los documentos y aprobadron por el gerente pero  aun no los aprueba el enlace, favor de revisarlos </label>'}
                    <br><br><br>
                    ${htmlSend}
                    <p style="text-align: justify;">
                    ----------------------------------------------------------------------------------------------- <br><br>
                    <label style="background-color: yellow; font-size: 18px; font-weight: bold;">  ES IMPORTANTE QUE TE ASEGURES DE QUE: </label><br>
                    <ul>
                        <li>
                            <label style="background-color: yellow; font-size: 16px; font-weight: bold;">  Los expedientes digitales sean completados en un plazo máximo de 3 días hábiles una vez recibida esta notificación. En caso de no cumplirse con esta actividad en el plazo señalado, esta solicitud será escalada de acuerdo a lo siguiente: </label>
                            <ul>
                                <li>
                                    <label style="background-color: yellow; font-size: 16px; font-weight: bold;"> Al día 4 los expedientes digitales que permanezcan incompletos serán escalados a la Gerencia General y Dirección de Marca y permanecerán visibles también para la Gerencia de Seminuevos y su equipo </label>
                                </li>
                                <li>
                                    <label style="background-color: yellow; font-size: 16px; font-weight: bold;"> Al día 7 los expedientes digitales que permanezcan incompletos serán escalados al Corporativo del Grupo: Dirección de Seminuevos, Finanzas y Contraloría y permanecerán visibles para la Gerencia de Seminuevos, su equipo, Gerencia General y Dirección de Marca </label>
                                </li>
                            </ul>
                        </li>
                        <li>
                            <label style="background-color: yellow; font-size: 16px; font-weight: bold;">  La documentación que estás cargando sea la indicada y esté correcta y legible. El no hacerlo de esta forma tiene implicaciones y consecuencias. </label>
                        </li>
                        <li>
                            <label style="background-color: yellow; font-size: 16px; font-weight: bold;">  Esta representación digital del expediente, en este momento, no sustituye la documentación original que debes tener ordenada y resguardada en un expediente físico. </label>
                        </li>
                    </ul>
                    -----------------------------------------------------------------------------------------------
                </p>`;

        sendMail.envia(mails, `Expedientes sin aprobar por el ${tipoMails == 1 ? 'gerente' : 'enlace'} en ${empresaManagerMail} "Expediente Digital Seminuevos"`, html).then((resPromise) => {
            reject({ success: 'Listo' });
        });
    });
};

/**#endRegionMailManagerNotAppre
 *@description:  Variables para el envio del correo del gerente cuando este completo y aun no lo aprueba
 */

/**#Region recreacion expediente CXC
 *@description:  Funcion que renombra la carpeta y respalda la informacion con el SP
 */
promiseRecreaCXC = (params, vin, cotizacionGuardada, idExpediente, currentRutaExpediente, newRutaExpediente) => {
    return new Promise(resolve => {
        try {
            if (!fs.existsSync(currentRutaExpediente)) {
                const model = new nodoModel({
                    parameters: confParams
                });

                const params = [
                    { name: 'idExpediente', value: idExpediente, type: model.types.INT }
                ];

                model.queryAllRecordSet('[expedienteSeminuevo].[INS_HISTORICO_ONLY_CXC_SP]', params, async (err, result) => {
                    if (result[0][0].success === 1) {
                        resolve([[{ success: 3 }], [{ msg: 'Se regenero la carpeta de CXC' }]]);
                    } else {
                        resolve([[{ success: 0 }], [{ msg: 'Error en el intento de respladar los datos del expediente, favor de contactar al administrador.' }]]);
                    };
                });
            } else {
                fs.rename(currentRutaExpediente, newRutaExpediente, function (err) {
                    if (err) {
                        resolve([[{ success: 0 }], [{ msg: 'Error al renombrar el expediente CXC, favor de contactar al administrador' }]]);
                    } else {
                        const model = new nodoModel({
                            parameters: confParams
                        });

                        const params = [
                            { name: 'idExpediente', value: idExpediente, type: model.types.INT }
                        ];

                        model.queryAllRecordSet('[expedienteSeminuevo].[INS_HISTORICO_ONLY_CXC_SP]', params, async (err, result) => {
                            if (result[0][0].success === 1) {
                                resolve([[{ success: 3 }], [{ msg: 'Se regenero la carpeta de CXC' }]]);
                            } else {
                                resolve([[{ success: 0 }], [{ msg: 'Error en el intento de respladar los datos del expediente, favor de contactar al administrador.' }]]);
                            };
                        });
                    };
                });
            };
        } catch (error) {
            resolve([[{ success: 0 }], [{ msg: 'Error en el intento de recrear el expediente CXC, favor de contactar al administraodr' }]]);
        };
    });
};
/**#EndRegion recreacion expediente CXC*/

module.exports = nodo;