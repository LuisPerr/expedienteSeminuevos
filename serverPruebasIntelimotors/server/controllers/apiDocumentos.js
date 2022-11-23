var apiDocumentosView = require('../views/reference'),
    apiDocumentosModel = require('../models/dataAccess');

var confParams = require('../../conf');
var logicSaveDocuments = require('./logicSaveFile');
var user = confParams.username;
var pass = confParams.password;
var generateSecretApi = confParams.generateSecretApi;
var cron = require('node-cron');
var fs = require("fs");

var apiDocumentos = function (conf) {
    this.conf = conf || {};

    this.view = new apiDocumentosView();
    this.model = new apiDocumentosModel({
        parameters: this.conf.parameters
    });

    this.response = function () {
        this[this.conf.funcionalidad](this.conf.req, this.conf.res, this.conf.next);
    };
};

cron.schedule(generateSecretApi, async function () {
    var model = new apiDocumentosModel({
        parameters: confParams
    });
    let secretKey = await makeid(50);

    let params = [
        { name: 'secretKey', value: secretKey, type: model.types.STRING }
    ];
    model.query('[expedienteSeminuevo].[UPD_SECRETKEY_SP]', params, function (error, responsed) {
        console.log('Se crea nueva Secrey Key');
    });
});

apiDocumentos.prototype.post_apiKey = function (req, res, next) {
    try {
        var self = this;

        var username = req.headers['username'];
        var password = req.headers['password'];

        if (user === username && pass === password) {
            this.model.query('[expedienteSeminuevo].[SEL_SECRETKEY_SP]', [], function (error, result) {
                insBitacoraApi('Consumo de API KEY exisotos', 'NO APLICA');
                return res.status(200).json({
                    success: 1,
                    message: 'Login exitoso',
                    data: result[0]
                });
            });
        } else {
            insBitacoraApi('Consumo de API KEY sin exito "Usuario y/o password erroneo"', 'NO APLICA');
            return res.status(400).json({
                success: 0,
                message: 'Usuario y/o password erroneo'
            });
        };
    } catch (error) {
        insBitacoraApi('Consumo de API KEY sin exito "Error en el catch"', 'NO APLICA');
        return res.status(400).json({
            success: 0,
            message: error
        });
    };
};

apiDocumentos.prototype.post_saveDocumento = function (req, res, next) {
    try {
        var self = this;
        if (req.headers.secret_key === undefined) {
            insBitacoraApi('Consumo saveDocumento sin exito, "No se encontro el APIKEY"', req.body.vinAuto);
            return res.status(400).json({
                success: 0,
                message: 'No se encuentra la autenticacion de API KEY'
            });
        } else {
            this.model.query('[expedienteSeminuevo].[SEL_SECRETKEY_SP]', [], function (error, result) {
                if (result[0].APIKEY != req.headers.secret_key) {
                    insBitacoraApi('Consumo saveDocumento sin exito, "No coincide el APIKEY"', req.body.vinAuto);
                    return res.status(400).json({
                        success: 0,
                        message: 'No coincide el API KEY'
                    });
                } else {
                    if ((req.body.vinAuto == undefined || req.body.vinAuto == null || req.body.vinAuto == '') ||
                        (req.body.pdf == undefined || req.body.pdf == null || req.body.pdf == '') ||
                        (req.body.unidadNegocio == undefined || req.body.unidadNegocio == null || req.body.unidadNegocio == '') ||
                        (req.body.id == undefined || req.body.id == null || req.body.id == '')) {
                        insBitacoraApi('Consumo saveDocumento sin exito, "Datos incompleto"', req.body.vinAuto);
                        return res.status(400).json({
                            success: 0,
                            message: 'Favor de proporcionar los datos completos'
                        });
                    } else {
                        if (req.body.id == 1 || req.body.id == 2) {
                            let imagenB64 = req.body.pdf.split(';base64,').pop();
                            let vinAuto = req.body.vinAuto;
                            let unidadNegocion = req.body.unidadNegocio;
                            let idDocumento = req.body.id;

                            let params = [
                                { name: 'unidadId', value: unidadNegocion, type: self.model.types.STRING }
                            ];
                            self.model.query('[expedienteSeminuevo].[SEL_EMPRESA_SUCURSAL_BY_UNIDAD_ID_INTELIMOTORS_SP]', params, async function (error, result) {
                                if (result.length > 0) {
                                    let resDateExpediente = await promiseDataExpediente(vinAuto, result[0].idEmpresa, result[0].idSucursal, idDocumento);
                                    if (resDateExpediente.success == 1) {
                                        let data = resDateExpediente.data;
                                        logicSaveDocuments.saveDocumentoLogic(`${data.doc_nombreCorto}.${data.doc_extencion}`, imagenB64, data.rutaSave, data.idExpediente, data.doc_varios, data.proceso, data.carpetaVarios).then(async (response) => {
                                            if (response.success == 1) {
                                                let resInsBD = await promiseInseBaseDatosDocumento(data.idExpediente, idDocumento, `${data.doc_nombreCorto}.${data.doc_extencion}`);
                                                if (resInsBD.success == 1) {
                                                    insBitacoraApi('Consumo saveDocumento exitoso', req.body.vinAuto);
                                                    checkExpedienteCompleto(data.idExpediente);
                                                    return res.status(200).json({
                                                        success: 1,
                                                        message: resInsBD.msg
                                                    });
                                                } else {
                                                    insBitacoraApi('Consumo saveDocumento sin exito, "Error al insertar en Base de datos"', req.body.vinAuto);
                                                    return res.status(400).json({
                                                        success: 0,
                                                        message: 'Error al guardar el documento'
                                                    });
                                                };
                                            } else {
                                                insBitacoraApi('Consumo saveDocumento sin exito, "Error al insertar en fisico"', req.body.vinAuto);
                                                return res.status(400).json({
                                                    success: 0,
                                                    message: 'Error al guardar el documento'
                                                });
                                            };
                                        });
                                    } else {
                                        insBitacoraApi('Consumo saveDocumento sin exito, "No se encontró registro del VIN en la empresa y/o sucursal indicada."', req.body.vinAuto);
                                        return res.status(400).json({
                                            success: 0,
                                            message: 'Error al guardar el documento'
                                        });
                                    };
                                } else {
                                    insBitacoraApi('Consumo saveDocumento sin exito, "Unidad de negocio no valida"', req.body.vinAuto);
                                    return res.status(400).json({
                                        success: 0,
                                        message: 'Unidad de negocio no valida'
                                    });
                                };
                            });
                        } else {
                            insBitacoraApi('Consumo saveDocumento sin exito, "Rango de VIN no valido"', req.body.vinAuto);
                            return res.status(400).json({
                                success: 0,
                                message: `Esta opcion no esta habilitada para el id ${req.body.id}`
                            });
                        };
                    };
                };
            });
        };
    } catch (error) {
        insBitacoraApi('Consumo saveDocumento sin exito, "Error en catch"', req.body.vinAuto);
        return res.status(400).json({
            success: 0,
            message: error
        });
    };
};

apiDocumentos.prototype.get_deleteDocumento = function (req, res, next) {
    try {
        var self = this;

        if (req.headers.secret_key === undefined) {
            insBitacoraApi('Consumo deleteDocumento sin exito, "No se encuentra el API KEY"', req.query.vinAuto);
            return res.status(400).json({
                success: 0,
                message: 'No se encuentra la autenticacion de API KEY'
            });
        } else {
            this.model.query('[expedienteSeminuevo].[SEL_SECRETKEY_SP]', [], function (error, result) {
                if (result[0].APIKEY != req.headers.secret_key) {
                    insBitacoraApi('Consumo deleteDocumento sin exito, "No coincide el API KEY"', req.query.vinAuto);
                    return res.status(400).json({
                        success: 0,
                        message: 'No coincide el API KEY'
                    });
                } else {
                    if (req.query.id == 1 || req.query.id == 2){                        
                        let params = [
                            { name: 'idDocumento', value: req.query.id, type: self.model.types.INT },
                            { name: 'vin', value: req.query.vinAuto, type: self.model.types.STRING }
                        ];
                        self.model.query('[expedienteSeminuevo].[DEL_DOCUMENTO_SP]', params, function (error, result) {
                            if (result[0].rutaDocumento == null) {
                                insBitacoraApi('Consumo deleteDocumento exitoso', req.query.vinAuto);
                                return res.status(200).json({
                                    success: 1,
                                    message: 'Se elimino el documento con éxito.'
                                });
                            } else {
                                fs.unlink(result[0].rutaDocumento, (err) => {
                                    if (err) {
                                        insBitacoraApi('Consumo deleteDocumento sin exito "No se pudo eliminar fisico"', req.query.vinAuto);
                                        return res.status(400).json({
                                            success: 0,
                                            message: err
                                        });
                                    } else {
                                        insBitacoraApi('Consumo deleteDocumento exitoso', req.query.vinAuto);
                                        return res.status(200).json({
                                            success: 1,
                                            message: 'Se elimino el documento con éxito.'
                                        });
                                    };
                                });
                            }
                        });
                    } else {
                        insBitacoraApi(`Consumo deleteDocumento sin exito, esta opcion no esta habilitada para el id  ${req.query.id}`, req.query.vinAuto);
                        return res.status(400).json({
                            success: 0,
                            message: `Esta opcion no esta habilitada para el id ${req.query.id}`
                        });
                    };
                };
            });
        };
    } catch (error) {
        insBitacoraApi('Consumo deleteDocumento sin exito "Error de catch"', req.query.vinAuto);
        return res.status(400).json({
            success: 0,
            message: error
        });
    };
};

apiDocumentos.prototype.get_idExpediente = function (req, res, next) {
    try {
        var self = this;

        if (req.headers.secret_key === undefined) {
            insBitacoraApi('Consumo idExpediente sin exito "No se encuentra la autenticacion de API KEY"', req.query.vinAuto);
            return res.status(400).json({
                success: 0,
                message: 'No se encuentra la autenticacion de API KEY'
            });
        } else {
            this.model.query('[expedienteSeminuevo].[SEL_SECRETKEY_SP]', [], function (error, result) {
                if (result[0].APIKEY != req.headers.secret_key) {
                    insBitacoraApi('Consumo idExpediente sin exito "No coincide el API KEY"', req.query.vinAuto);
                    return res.status(400).json({
                        success: 0,
                        message: 'No coincide el API KEY'
                    });
                } else {
                    let params = [
                        { name: 'vin', value: req.query.vinAuto, type: self.model.types.STRING }
                    ];
                    self.model.query('[expedienteSeminuevo].[SEL_ID_EXPEDIENTE_BY_VIN]', params, function (error, result) {
                        if(result.length > 0){
                            insBitacoraApi('Consumo idExpediente exitoso', req.query.vinAuto);
                            return res.status(200).json({
                                success: 1,
                                message: 'Se encontro expediente',
                                data: result[0]
                            });
                        }else{
                            insBitacoraApi('Consumo idExpediente sin exito "No se encontro expediente con ese vin"', req.query.vinAuto);
                            return res.status(400).json({
                                success: 0,
                                message: 'No se encontro expediente con ese vin'
                            });
                        };
                    });
                };
            });
        };
    } catch (error) {
        insBitacoraApi('Consumo idExpediente sin exito "Error en el catch"', req.query.vinAuto);
        return res.status(400).json({
            success: 0,
            message: error
        });
    };
};

promiseDataExpediente = (vinAuto, idEmpresa, idSucursal, idDocumento) => {
    return new Promise((resolve) => {
        try {
            var model = new apiDocumentosModel({
                parameters: confParams
            });

            var params = [
                { name: 'vin', value: vinAuto, type: model.types.STRING },
                { name: 'idEmpresa', value: idEmpresa, type: model.types.INT },
                { name: 'idSucursal', value: idSucursal, type: model.types.INT },
                { name: 'idProceso', value: 1, type: model.types.INT },
                { name: 'idPerfil', value: 139, type: model.types.INT },
                { name: 'idUsuario', value: 71, type: model.types.INT }
            ];

            model.queryAllRecordSet('[expedienteSeminuevo].[SEL_DOCUMENTOS_BY_PROCESO_AND_VIN_API]', params, async function (error, result) {
                if (result[0][0].success == 1) {
                    var dataDocumentos = [];
                    result[1].forEach((value) => {
                        if (value.id_documento == idDocumento) {
                            dataDocumentos = value;
                        };
                    });

                    resolve({ success: 1, data: dataDocumentos });
                } else {
                    resolve({ success: 0 })
                };
            });
        } catch (error) {
            return res.status(400).json({
                success: 0,
                message: error
            });
        };
    });
};

promiseInseBaseDatosDocumento = (idExpediente, idDocumento, nombreDocumento) => {
    return new Promise((resolve) => {
        try {
            var model = new apiDocumentosModel({
                parameters: confParams
            });

            var params = [
                { name: 'idProceso', value: 1, type: model.types.INT },
                { name: 'idDocumento', value: idDocumento, type: model.types.INT },
                { name: 'idExpediente', value: idExpediente, type: model.types.INT },
            ];

            model.query('[expedienteSeminuevo].[SEL_VALIDA_EXISTE_DOCUMENTO_SP]', params, function (error, result) {
                if (result[0].success == 0) {
                    let params = [
                        { name: 'id_expediente', value: idExpediente, type: model.types.INT },
                        { name: 'id_documento', value: idDocumento, type: model.types.INT },
                        { name: 'id_proceso', value: 1, type: model.types.INT },
                        { name: 'id_estatus', value: 1, type: model.types.INT },
                        { name: 'observacionesDocumento', value: '', type: model.types.STRING },
                        { name: 'nombreDocumento', value: nombreDocumento, type: model.types.STRING },
                        { name: 'idUsuario', value: 71, type: model.types.INT }
                    ];

                    model.query('[expedienteSeminuevo].[INS_DOCUMENTO_EXPEDIENTE]', params, function (error, result) {
                        if (result[0].success == 1) {
                            resolve({ success: 1, msg: 'Se guardo el documento con éxito.' });
                        } else {
                            resolve({ success: 0, msg: 'Error al guardar el documento en la base' });
                        };
                    });
                } else {
                    resolve({ success: 1, msg: 'Se guardo el documento con éxito.' });
                };
            });
        } catch (error) {
            return res.status(400).json({
                success: 0,
                message: error
            });
        };
    });
};

checkExpedienteCompleto = (idExpediente)=>{
    try {
        var model = new apiDocumentosModel({
            parameters: confParams
        });

        let params = [
            { name: 'idExpediente', value: idExpediente, type: model.types.INT }
        ];

        model.query('[expedienteSeminuevo].[SEL_VALIDA_EXPEDIENTE_COMPLETO_SP]', params, function (error, responsed) {
            if(responsed[0].totalImagenes <= 0){
                console.log( 'Se publica API' );
            }else{
                console.log( 'Aun no se publica API' );
            };           
        });
    } catch (error) {
        console.log('error', error);
    };
};

insBitacoraApi = ( accion, vin )=>{
    var model = new apiDocumentosModel({
        parameters: confParams
    });

    var params = [
        { name: 'accion', value: accion, type: model.types.STRING },
        { name: 'vin', value: vin, type: model.types.STRING }
    ];

    model.query('[expedienteSeminuevo].[INS_BITACORA_ACCION_API_SP]', params, function (error, result) {});
};

function makeid(length) {
    return new Promise((reject) => {
        var result = '';
        var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        var charactersLength = characters.length;
        for (var i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        reject(result);
    });
};

module.exports = apiDocumentos;