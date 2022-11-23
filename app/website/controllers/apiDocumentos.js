var apiDocumentosView = require('../views/reference'),
    apiDocumentosModel = require('../models/dataAccess');

var confParams = require('../../../conf');
var logicSaveDocuments = require('./logicSaveFile');
var sendMail = require('./sendMail');
var publicaIntelimotor = require('./publicaIntelimotors');
var user = confParams.username;
var pass = confParams.password;
var generateSecretApi = confParams.generateSecretApi;
const vinFlotilla = require('./vinFlotilla');
var fs = require("fs");
const { resolve } = require('path');

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
        //console.log('Se crea nueva Secrey Key');
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
                        (req.body.id == undefined || req.body.id == null || req.body.id == '') /*||
                         (req.body.tipoCanalCompra == undefined || req.body.tipoCanalCompra == null || req.body.tipoCanalCompra == '') ||
                        (req.body.idEstadoRep == undefined || req.body.idEstadoRep == null || req.body.idEstadoRep == '')*/) {
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
                            let tipoCanalCompra = req.body.tipoCanalCompra;
                            let idEstadoRep = req.body.idEstadoRep;

                            let params = [
                                { name: 'unidadId', value: unidadNegocion, type: self.model.types.STRING }
                            ];
                            self.model.query('[expedienteSeminuevo].[SEL_EMPRESA_SUCURSAL_BY_UNIDAD_ID_INTELIMOTORS_SP]', params, async function (error, result) {
                                if (result.length > 0) {
                                    let resDateExpediente = await promiseDataExpediente(vinAuto, result[0].idEmpresa, result[0].idSucursal, idDocumento, tipoCanalCompra, idEstadoRep);
                                    if (resDateExpediente.success == 1) {
                                        let data = resDateExpediente.data;
                                        logicSaveDocuments.saveDocumentoLogic(`${data.doc_nombreCorto}.${data.doc_extencion}`, imagenB64, data.rutaSave, data.idExpediente, data.doc_varios, data.proceso, data.carpetaVarios).then(async (response) => {
                                            if (response.success == 1) {
                                                let resInsBD = await promiseInseBaseDatosDocumento(data.idExpediente, idDocumento, `${data.doc_nombreCorto}.${data.doc_extencion}`);
                                                if (resInsBD.success == 1) {
                                                    let publica = await checkExpedienteCompletoApi(data.idExpediente);
                                                    insBitacoraApi(`Consumo saveDocumento exitoso documento guardado ${idDocumento}`, req.body.vinAuto);
                                                    //console.log('AQUI');
                                                    return res.status(200).json({
                                                        success: 1,
                                                        message: resInsBD.msg
                                                    });
                                                } else {
                                                    insBitacoraApi(`Consumo saveDocumento sin exito, "Error al insertar en Base de datos" para el documento ${idDocumento}`, req.body.vinAuto);
                                                    return res.status(400).json({
                                                        success: 0,
                                                        message: 'Error al guardar el documento'
                                                    });
                                                };
                                            } else {
                                                insBitacoraApi(`Consumo saveDocumento sin exito, "Error al insertar en fisico" para el documento ${idDocumento}`, req.body.vinAuto);
                                                return res.status(400).json({
                                                    success: 0,
                                                    message: 'Error al guardar el documento'
                                                });
                                            };
                                        });
                                    } else {
                                        insBitacoraApi(`Consumo saveDocumento sin exito, "No se encontró registro del VIN en la empresa y/o sucursal indicada." para el documento ${idDocumento}`, req.body.vinAuto);
                                        return res.status(400).json({
                                            success: 0,
                                            message: 'Error al guardar el documento'
                                        });
                                    };
                                } else {
                                    insBitacoraApi(`Consumo saveDocumento sin exito, "Unidad de negocio no valida ${req.body.unidadNegocio}"`, req.body.vinAuto);
                                    return res.status(400).json({
                                        success: 0,
                                        message: 'Unidad de negocio no valida'
                                    });
                                };
                            });
                        } else {
                            insBitacoraApi(`Consumo saveDocumento sin exito, "Rango de ID documento no valido" ID enviado ${req.body.id}`, req.body.vinAuto);
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
                    if (req.query.id == 1 || req.query.id == 2) {
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
                        if (result.length > 0) {
                            insBitacoraApi('Consumo idExpediente exitoso', req.query.vinAuto);
                            return res.status(200).json({
                                success: 1,
                                message: 'Se encontro expediente',
                                data: result[0]
                            });
                        } else {
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

promiseDataExpediente = (vinAuto, idEmpresa, idSucursal, idDocumento, tipoCanalCompra, idEstadoRep) => {
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
                { name: 'idUsuario', value: 71, type: model.types.INT },
                { name: 'tipoCanalCompra', value: tipoCanalCompra == '' ? 0 : tipoCanalCompra, type: model.types.INT },
                { name: 'idEstadoRep', value: idEstadoRep, type: model.types.STRING }
            ];
            model.queryAllRecordSet('[expedienteSeminuevo].[SEL_DOCUMENTOS_BY_PROCESO_AND_VIN_API]', params, async function (error, result) {
                if (result[0][0].success == 2) {
                    let respRecreacion = await promiseRecreaExpediente(vinAuto, idEmpresa, idSucursal, idDocumento, tipoCanalCompra, idEstadoRep);
                    //console.log('respRecreacion =========== RESPUESTA', respRecreacion)
                    if (respRecreacion.success == 1) {
                        resolve({ success: 1, data: respRecreacion.data });
                    } else {
                        resolve({ success: 0 });
                    };
                } else {
                    if (result[0][0].success == 1) {
                        var dataDocumentos = [];
                        result[1].forEach((value) => {
                            if (value.id_documento == idDocumento) {
                                dataDocumentos = value;
                            };
                        });

                        vinFlotilla.unidadFlotilla(vinAuto, idEmpresa, idSucursal).then((res) => {
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
                                { name: 'idExpediente', value: dataDocumentos.idExpediente, type: model.types.INT },
                                { name: 'flotilla', value: exp_flotilla, type: model.types.INT }
                            ];

                            model.query('[expedienteSeminuevo].[UPD_EXPEDIENTE_FLOTILLA_SP]', params, function (error, result) {
                                resolve({ success: 1, data: dataDocumentos });
                            });
                        });
                    } else {
                        resolve({ success: 0 })
                    };
                }
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

checkExpedienteCompletoApi = (idExpediente) => {
    return new Promise((resolve) => {
        try {
            var model = new apiDocumentosModel({
                parameters: confParams
            });

            let params = [
                { name: 'idExpediente', value: idExpediente, type: model.types.INT }
            ];
            //console.log('Params', params);
            model.query('[expedienteSeminuevo].[SEL_VALIDA_EXPEDIENTE_COMPLETO_SP]', params, async function (error, responsed) {
                if (responsed[0].totalImagenes <= 0) {
                    // await promisePublicarIntelimotorApi(idExpediente);
                    // await replicateDocumentsApi(idExpediente, 1);
                    resolve({ success: "Listo" });
                } else {
                    //console.log('Aun no se publica');
                    resolve({ success: "Listo" });
                };
            });
        } catch (error) {
            resolve({ success: "Listo" });
        };
    });
};

promisePublicarIntelimotorApi = (idExpediente) => {
    return new Promise((resolve) => {
        var model = new apiDocumentosModel({
            parameters: confParams
        });

        let params = [
            { name: 'idExpediente', value: idExpediente, type: model.types.INT }
        ];

        model.query('[expedienteSeminuevo].[SEL_VIN_UNITID_BY_IDEXPEDINETE_SP]', params, function (error, responsed) {
            //console.log('res===', responsed);
            let vin = responsed[0].vin //'ZFAADABP3H6E32724';
            let unitId = responsed[0].unitId //'5d768f916ebc5a009de22c3f'
            try {
                publicaIntelimotor.publica(vin, unitId).then(async (res) => {
                    if (res.success == 1) {
                        if (res.data.statusCode == 401 || res.data.statusCode == 400 || res.data.statusCode == 404) {

                            let html = `<label style="font-size: 20px"> El vin ${vin} y le unitID: ${unitId}. <br> 
                        No se pudo publicar en intelimotor Error: ${JSON.parse(res.data.body).error} </label>`;

                            sendMail.envia('lgarciaperrusquia@gmail.com', `Error al publicar una unidad en INTELIMOTOR"`, html).then(async (resPromise) => {
                                await promiseSaveBitacoraPublicaIntelimotorApi(JSON.parse(res.data.body).error, vin, unitId);
                                resolve({ success: 'Listo' })
                            });

                        } else {
                            //console.log('JSON.parse(res.data.body)', JSON.parse(res.data.body));
                            await promiseSaveBitacoraPublicaIntelimotorApi(`Se publico la unidad en Intelimotro Respuesta: ${res.data.body}`, vin, unitId);
                            resolve({ success: 'Listo' })
                        };
                    } else {

                        let html = `<label style="font-size: 20px"> El vin ${vin} y le unitID: ${unitId}. <br> 
                    No se pudo publicar en intelimotor Error: ${res.err} </label>`;

                        sendMail.envia('lgarciaperrusquia@gmail.com', `Error al publicar una unidad en INTELIMOTOR"`, html).then(async (resPromise) => {
                            await promiseSaveBitacoraPublicaIntelimotorApi(res.err, vin, unitId);
                            resolve({ success: 'Listo' })
                        });
                    };
                });
            } catch (error) {

                let html = `<label style="font-size: 20px"> El vin ${vin} y le unitID: ${unitId}. <br> 
            No se pudo publicar en intelimotor Error:${error}</label>`
                sendMail.envia('lgarciaperrusquia@gmail.com', `Error al publicar una unidad en INTELIMOTOR"`, html).then(async (resPromise) => {
                    await promiseSaveBitacoraPublicaIntelimotorApi(error, vin, unitId);
                    resolve({ success: 'Listo' })
                });
            };
        });
    });
};

promiseSaveBitacoraPublicaIntelimotorApi = (tipoAccion, vin, unitId) => {
    return new Promise((resolve) => {
        try {
            var model = new apiDocumentosModel({
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

insBitacoraApi = (accion, vin) => {
    var model = new apiDocumentosModel({
        parameters: confParams
    });

    var params = [
        { name: 'accion', value: accion, type: model.types.STRING },
        { name: 'vin', value: vin, type: model.types.STRING }
    ];

    model.query('[expedienteSeminuevo].[INS_BITACORA_ACCION_API_SP]', params, function (error, result) { });
};

replicateDocumentsApi = (idExpedienteOrigen, idProceso) => {
    return new Promise((resolve) => {
        let model = new apiDocumentosModel({
            parameters: confParams
        });

        var params = [
            { name: 'idExpedienteOrigen', value: idExpedienteOrigen, type: model.types.INT }
        ];
        model.query('[expedienteSeminuevo].[SEL_ALL_VINES_REPLICATE_DESFLOTE_GA_SP]', params, async function (error, result) {
            if (error) {
                await insBitacoraReplicateApi(`Error al traer los expedientes para replica de expediente`, idExpedienteOrigen, null);
                resolve({ success: 'Listo' });
            } else {
                if (result.length > 0) {
                    for (let i = 0; i <= result.length - 1; i++) {
                        await insBitacoraReplicateApi(`Iniciamos el proceso de replica de expediente`, idExpedienteOrigen, result[i].id_expediente);
                        await getAllFolderReplicateApi(idExpedienteOrigen, result[i].id_expediente, idProceso);
                        await getAllDocumetsReplicateApi(idExpedienteOrigen, result[i].id_expediente, idProceso)

                        if (i == result.length - 1) {
                            await insBitacoraReplicateApi(`Termina el proceso de TODOS los expedientes`, idExpedienteOrigen, result[i].id_expediente);
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

getAllFolderReplicateApi = (idExpedienteOrigen, idExpedienteDestino, idProceso) => {
    return new Promise((resolve) => {
        let model = new apiDocumentosModel({
            parameters: confParams
        });

        var params = [
            { name: 'idExpediente', value: idExpedienteDestino, type: model.types.INT },
            { name: 'idProceso', value: idProceso, type: model.types.INT }
        ];

        model.query('[expedienteSeminuevo].[SEL_ALL_CREATE_FOLDERS_SP]', params, async function (error, result) {
            if (error) {
                await insBitacoraReplicateApi(`Error al traer las rutas para crear los folders`, idExpedienteOrigen, idExpedienteDestino);
                resolve({ success: 'Listo' });
            } else {
                if (result.length > 0) {
                    await insBitacoraReplicateApi(`Iniciamos proceso de creacion de folders`, idExpedienteOrigen, idExpedienteDestino);
                    for (let i = 0; i <= result.length - 1; i++) {
                        await createFolderReplicateApi(idExpedienteOrigen, idExpedienteDestino, result[i].folder)
                        if (i == result.length - 1) {
                            await insBitacoraReplicateApi(`Termino la creacion de folders`, idExpedienteOrigen, idExpedienteDestino);
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

createFolderReplicateApi = (idExpedienteOrigen, idExpedienteDestino, rutaCreate) => {
    return new Promise(async (resolve) => {
        if (!fs.existsSync(rutaCreate)) {
            fs.mkdirSync(rutaCreate);
            setTimeout(async () => {
                await insBitacoraReplicateApi(`Se creo el folder con la ruta: "${rutaCreate}"`, idExpedienteOrigen, idExpedienteDestino);
                resolve({ success: 'Listo' });
            }, 500);
        } else {
            await insBitacoraReplicateApi(`Ya existia el folder con la ruta: "${rutaCreate}"`, idExpedienteOrigen, idExpedienteDestino);
            resolve({ success: 'Listo' });
        };
    });
};

getAllDocumetsReplicateApi = (idExpedienteOrigen, idExpedienteDestino, idProceso) => {
    return new Promise((resolve) => {
        let model = new apiDocumentosModel({
            parameters: confParams
        });

        var params = [
            { name: 'idExpedienteOrigen', value: idExpedienteOrigen, type: model.types.INT },
            { name: 'idExpedienteDestino', value: idExpedienteDestino, type: model.types.INT }
        ];

        model.query('[expedienteSeminuevo].[SEL_ALL_DOCUMENTS_REPLICATE_DESFLOTE_GA_SP]', params, async function (error, result) {
            if (error) {
                await insBitacoraReplicateApi(`Error al traer los documentos para replicar`, idExpedienteOrigen, idExpedienteDestino);
                resolve({ success: 'Listo' });
            } else {
                await insBitacoraReplicateApi(`Inicia el proceso de replica de documentos`, idExpedienteOrigen, idExpedienteDestino);
                if (result.length > 0) {
                    for (let i = 0; i <= result.length - 1; i++) {
                        await copyDocumentApi(idExpedienteOrigen, result[i].rutaOrigen, result[i].rutaDestino, result[i].idExpediente, result[i].id_documento, result[i].id_proceso, result[i].id_estatus, result[i].observacionesDocumento, result[i].nombreDocumento, result[i].idUsuario);

                        if (i == result.length - 1) {
                            await insBitacoraReplicateApi(`Termina el proceso de replica de documentos`, idExpedienteOrigen, idExpedienteDestino);
                            resolve({ success: 'Listo' });
                        };
                    };
                } else {
                    resolve({ success: 'Listo' });
                }
            };
        });
    });
};

copyDocumentApi = (idExpedienteOrigen, rutaOrigen, rutaDestino, idExpediente, id_documento, id_proceso, id_estatus, observacionesDocumento, nombreDocumento, idUsuario) => {
    return new Promise(async (resolve) => {
        if (!fs.existsSync(rutaDestino)) {
            fs.copyFile(rutaOrigen, rutaDestino, async (err) => {
                if (err) {
                    await insBitacoraReplicateApi(`Error al copiar el documento: ${id_documento} para la ruta: ${rutaDestino} error: ${error}`, idExpedienteOrigen, idExpediente);
                    resolve({ success: 'Listo' })
                } else {
                    let model = new apiDocumentosModel({
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
                        await insBitacoraReplicateApi(`Se copío con exito el documento: ${id_documento} para la ruta: ${rutaDestino} idDocumentoGuardado: ${result[0].idDocumentoGuardado}`, idExpedienteOrigen, idExpediente);
                        resolve({ success: 'Listo' });
                    });
                };
            });
        } else {
            await insBitacoraReplicateApi(`Ya existia el documento : ${id_documento} para la ruta: ${rutaDestino}`, idExpedienteOrigen, idExpediente);
            resolve({ success: 'Listo' })
        };
    });
};

insBitacoraReplicateApi = (accion, idExpOrigen, idExpDestino) => {
    return new Promise((resolve) => {
        let model = new apiDocumentosModel({
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

apiDocumentos.prototype.post_cambioEstatusFlotilla = function (req, res, next) {
    var self = this;

    try {
        var username = req.headers['username'];
        var password = req.headers['password'];

        if (user === username && pass === password) {
            if ((req.body.vin == undefined || req.body.vin == '' || req.body.vin == null) ||
                (req.body.unitBusinessId == undefined || req.body.unitBusinessId == '' || req.body.unitBusinessId == null) ||
                (req.body.fleet == undefined || req.body.fleet == null) ||
                (req.body.status == undefined || req.body.status == '' || req.body.status == null)) {
                return res.status(400).json({
                    success: 0,
                    message: 'Todos los campos son obligatorios'
                });
            } else {
                let vinApi = req.body.vin;
                let unitBusinessId = req.body.unitBusinessId;
                let esFlotillaApi = req.body.fleet == '' ? false : req.body.fleet;
                let estatusFLotillaAPi = req.body.status;
                let exp_flotillaApi;

                if (!esFlotillaApi) {
                    exp_flotillaApi = 0;
                } else {
                    if (esFlotillaApi && estatusFLotillaAPi == 'Desflote GA') {
                        exp_flotillaApi = 3;
                    } else {
                        exp_flotillaApi = 1;
                    };
                };

                var params = [
                    { name: 'vin', value: vinApi, type: self.model.types.STRING },
                    { name: 'businessUnitId', value: unitBusinessId, type: self.model.types.STRING },
                    { name: 'exp_flotilla', value: exp_flotillaApi, type: self.model.types.INT }
                ];

                self.model.query('[expedienteSeminuevo].[UPD_FLOTILLA_API_SP]', params, function (error, result) {
                    if (result[0].success == 1) {
                        return res.status(200).json({
                            success: 1,
                            message: 'Se realizo la operacion con éxito'
                        });
                    } else {
                        return res.status(400).json({
                            success: 0,
                            message: 'Ocurrio un error al actualizar el estatus de deflote'
                        });
                    };
                });
            }
        } else {
            return res.status(400).json({
                success: 0,
                message: 'Usuario y/o password incompletos.'
            });
        };
    } catch (e) {
        return res.status(400).json({
            success: 0,
            message: `Ocurrio un error en el proceso ${e}`
        });
    };
};

apiDocumentos.prototype.post_expedienteCompleto = function (req, res, next) {
    var self = this;

    try {
        var username = req.headers['username'];
        var password = req.headers['password'];

        if (user === username && pass === password) {
            const { vin, businessUnitId } = req.body;

            if (!vin || !businessUnitId) {
                return res.status(200).json({
                    success: 0,
                    message: 'Todos los parametros son obligatorios'
                });
            } else {
                const params = [
                    { name: 'vin', value: vin, type: self.model.types.STRING },
                    { name: 'businessUnitId', value: businessUnitId, type: self.model.types.STRING }
                ];

                self.model.query('[expedienteSeminuevo].[SEL_CANDADO_PAGO_INTELIMOTOR_SP]', params, (error, result) => {
                    const { success, msg } = result[0];
                    return res.status(200).json({
                        success: success,
                        message: msg
                    });
                });
            };
        } else {
            return res.status(400).json({
                success: 0,
                message: 'Usuario y/o password incompletos.'
            });
        };
    } catch (e) {
        return res.status(400).json({
            success: 0,
            message: `Ocurrio un error en el proceso ${e}`
        });
    };
};

promiseRecreaExpediente = (vinAuto, idEmpresa, idSucursal, idDocumento, tipoCanalCompra, idEstadoRep) => {
    return new Promise(resolve => {
        let model = new apiDocumentosModel({
            parameters: confParams
        });

        let paramsRecreacion = [
            { name: 'vin', value: vinAuto, type: model.types.STRING },
            { name: 'idEmpresa', value: idEmpresa, type: model.types.INT },
            { name: 'idSucursal', value: idSucursal, type: model.types.INT }
        ];

        model.queryAllRecordSet('[expedienteSeminuevo].[INS_HISTORICO_ALL_EXPEDIENTE_SP]', paramsRecreacion, async function (errorRecreacion, resultRecreacion) {
            if (resultRecreacion[0][0].success === 2) {
                let params = [
                    { name: 'vin', value: vinAuto, type: model.types.STRING },
                    { name: 'idEmpresa', value: idEmpresa, type: model.types.INT },
                    { name: 'idSucursal', value: idSucursal, type: model.types.INT },
                    { name: 'idProceso', value: 1, type: model.types.INT },
                    { name: 'idPerfil', value: 139, type: model.types.INT },
                    { name: 'idUsuario', value: 71, type: model.types.INT },
                    { name: 'tipoCanalCompra', value: tipoCanalCompra == '' ? 0 : tipoCanalCompra, type: model.types.INT },
                    { name: 'idEstadoRep', value: idEstadoRep, type: model.types.STRING }
                ];

                model.queryAllRecordSet('[expedienteSeminuevo].[SEL_DOCUMENTOS_BY_PROCESO_AND_VIN_API]', params, async function (error, result) {
                    //console.log('result=== RECREACION', result)
                    if (result[0][0].success == 1) {
                        var dataDocumentos = [];
                        result[1].forEach((value) => {
                            if (value.id_documento == idDocumento) {
                                dataDocumentos = value;
                            };
                        });

                        vinFlotilla.unidadFlotilla(vinAuto, idEmpresa, idSucursal).then((res) => {
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

                            var paramsFlotilla = [
                                { name: 'idExpediente', value: dataDocumentos.idExpediente, type: model.types.INT },
                                { name: 'flotilla', value: exp_flotilla, type: model.types.INT }
                            ];

                            model.query('[expedienteSeminuevo].[UPD_EXPEDIENTE_FLOTILLA_SP]', paramsFlotilla, function (error, result) {
                                resolve({ success: 1, data: dataDocumentos });
                            });
                        });
                    } else {
                        resolve({ success: 0 })
                    };
                });
            } else {
                resolve({ success: 0 })
            };
        });
    });
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