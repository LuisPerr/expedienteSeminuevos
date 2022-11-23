var administradorApiUrl = global_settings.urlApiNode + '/api/administrador/';
registrationModule.factory('administradorRepository', function ($http) {
    return {
        getCanales: function (idProceso) {
            return $http({
                url: administradorApiUrl + 'allCanales/',
                method: "GET",
                params: {
                    idProceso: idProceso
                },
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        },
        getEstados: function () {
            return $http({
                url: administradorApiUrl + 'allEstados/',
                method: "GET",
                params: {},
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        },
        getAllDataCrud: function (idProceso, tipoCompraVenta, idEstado) {
            return $http({
                url: administradorApiUrl + 'allDataCrud/',
                method: "GET",
                params: {
                    idProceso: idProceso,
                    tipoCompraVenta: tipoCompraVenta,
                    idEstado: idEstado
                },
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        },
        updateAllDataCrud: function (idProceso, dataDocumento, idUsuario, fechaInicial) {
            return $http({
                url: administradorApiUrl + 'updateDataCrud/',
                method: "GET",
                params: {
                    idProceso: idProceso,
                    dataDocumento: dataDocumento,
                    idUsuario: idUsuario,
                    fechaInicial: fechaInicial
                },
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        },
        saveNewDocument: function (idProceso, dataCanales, dataEstados, nameNewDocument, nameCorto, doc_varios, carpetaVarios, idUsuario, fechaInicial) {
            return $http({
                url: administradorApiUrl + 'saveNewDocument/',
                method: "POST",
                data: {
                    idProceso: idProceso,
                    dataCanales: dataCanales,
                    dataEstados: dataEstados,
                    nameNewDocument: nameNewDocument,
                    nameCorto: nameCorto,
                    doc_varios: doc_varios,
                    carpetaVarios: carpetaVarios,
                    idUsuario: idUsuario,
                    fechaInicial: fechaInicial
                },
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        },
        delConfigUpdateById: function (id_confUpd) {
            return $http({
                url: administradorApiUrl + 'delConfigUpdateById/',
                method: "GET",
                params: {
                    id_confUpd: id_confUpd
                },
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        },
        delConfigSaveById: function (idDocumento) {
            return $http({
                url: administradorApiUrl + 'delConfigSaveById/',
                method: "GET",
                params: {
                    idDocumento: idDocumento
                },
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        },
        updConfigSaveByIdDocumento: function (idDocumento, doc_idEstado, doc_proceso, doc_idCanal, doc_nombre, fechaInicio, doc_activo, doc_opcional, doc_moral, doc_fisica, doc_fisicaAE, nameCorto, carpetaVarios, doc_varios) {
            return $http({
                url: administradorApiUrl + 'updConfigSaveByIdDocumento/',
                method: "GET",
                params: {
                    idDocumento: idDocumento,
                    doc_idEstado: doc_idEstado,
                    doc_proceso: doc_proceso,
                    doc_idCanal: doc_idCanal,
                    doc_nombre: doc_nombre,
                    fechaInicio: fechaInicio,
                    doc_activo: doc_activo,
                    doc_opcional: doc_opcional,
                    doc_moral: doc_moral,
                    doc_fisica: doc_fisica,
                    doc_fisicaAE: doc_fisicaAE,
                    nameCorto: nameCorto,
                    carpetaVarios: carpetaVarios,
                    doc_varios: doc_varios
                },
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        },
        dataMasivoCrud: idProceso => {
            return $http({
                url: administradorApiUrl + 'dataMasivoCrud/',
                method: "GET",
                params: {
                    idProceso: idProceso
                },
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        },
        insDataMasivo: (idProceso, canales, estados, dataDocumento, idUsuario, fechaInicial) => {
            return $http({
                url: administradorApiUrl + 'insDataMasivo/',
                method: "POST",
                data: {
                    idProceso: idProceso,
                    canales: canales,
                    estados: estados,
                    dataDocumento: dataDocumento,
                    idUsuario: idUsuario,
                    fechaInicial: fechaInicial
                },
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        },
        delDataMasivo: (idProceso, canales, estados, id_documento) => {
            return $http({
                url: administradorApiUrl + 'delDataMasivo/',
                method: "POST",
                data: {
                    idProceso: idProceso,
                    canales: canales,
                    estados: estados,
                    id_documento: id_documento
                },
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        },
        selDataPorProcesar: (idProceso, estados, canales) => {
            return $http({
                url: administradorApiUrl + 'selDataPorProcesar/',
                method: "POST",
                data: {
                    idProceso: idProceso,
                    estados: estados,
                    canales: canales
                },
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        }
    };
});