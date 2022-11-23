var documentoUrl = global_settings.urlCORS + '/api/documentoapi/';
var documentoApiUrl = global_settings.urlApiNode + '/api/documento/';

registrationModule.factory('documentoRepository', function ($http) {
    return {
        get: function (id) {
            return $http.get(documentoUrl + '0|' + id);
        },
        //getByNodo: function (nodo, folio, perfil) {
        //    return $http.get(documentoUrl + '1|' + nodo + '|' + folio + '|' + perfil);
        //},
        getDocsByFolio: function (folio) {
            return $http.get(documentoUrl + '2|' + folio);
        },
        //Agregado LMS para generacion de PDF
        getPdf: function (tipo, folio, nodo) {
            return $http.get(documentoUrl + '3|' + tipo + '|' + folio + '|' + nodo);
        },
        //Agregado LMS
        sendMail: function (idDocumento, folio, correo) {
            return $http({
                url: documentoUrl,
                method: "POST",
                params: { id: '2|' + idDocumento + '|' + folio + '|' + correo }
            });
        },
        saveDocument: function (folio, iddocumento, idperfil, idproceso, idnodo, idusuario, ruta) {
            return $http({
                url: documentoUrl,
                method: "POST",
                params: { id: '3|' + folio + '|' + iddocumento + '|' + idperfil + '|' + idproceso + '|' + idnodo + '|' + idusuario + '|' + ruta }
            });
        },
        getPdfWS: function (rfcemisor, rfcreceptor, serie, folio) {
            return $http.get(documentoUrl + '4|' + rfcemisor + '|' + rfcreceptor + '|' + serie + '|' + folio);
        },
        getPdfArrays: function (tipo, folio, nodo) {
            return $http.get(documentoUrl + '5|' + tipo + '|' + folio + '|' + nodo);
        },
        getProceso: function (folio, idProceso) {
            return $http({
                url: documentoApiUrl + 'proceso/',
                method: "GET",
                params: {
                    folio: folio,
                    idProceso: idProceso
                },
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        },
        getPermisos: function (idUsuario, idAccion) {
            return $http({
                url: documentoApiUrl + 'permisos/',
                method: "GET",
                params: {
                    idUsuario: idUsuario,
                    idAccion: idAccion
                },
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        },
        getByNodo: function (nodo, folio, perfil) {
            return $http({
                url: documentoApiUrl + 'byNodo/',
                method: "GET",
                params: {
                    nodo: nodo,
                    folio: folio,
                    perfil: perfil
                },
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        },
        getPdfArraysPun: function (tipo, factura, nodo) {
            return $http({
                url: documentoApiUrl + 'pdfArraysPun/',
                method: "GET",
                params: {
                    tipo: tipo,
                    factura: factura,
                    nodo: nodo
                },
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        },
        getCotizaciones: function (folio) {
            return $http({
                url: documentoApiUrl + 'cotizaciones/',
                method: "GET",
                params: {
                    folio: folio
                },
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        },
        getPdfNode: function (tipo, factura, nodo) {
            return $http({
                url: documentoApiUrl + 'pdf/',
                method: "GET",
                params: {
                    tipo: tipo,
                    factura: factura,
                    nodo: nodo
                },
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        },
        getResumenCotiza: function (folio) {
            return $http({
                url: documentoApiUrl + 'resumenCotiza/',
                method: "GET",
                params: {
                    folio: folio
                },
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        },
        getReportePdf: function (jsondata) {
            return $http({
                url: 'http://192.168.20.92:5488/api/report',
                method: "POST",
                data: {
                    template: { name: jsondata.template.name },
                    data: jsondata.data
                },
                headers: {
                    'Content-Type': 'application/json'
                },
                responseType: 'arraybuffer'
            });
        },
        getResumenGeneral: function (idCot, folio) {
            return $http({
                url: documentoApiUrl + 'resumenGeneral/',
                method: "GET",
                params: {
                    idCot: idCot,
                    folio: folio
                },
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        },
        verificaExisteDoc: function (rutaDoc) {
            return $http({
                url: documentoApiUrl + 'verificaExisteDoc/',
                method: "GET",
                params: {
                    rutaDoc: rutaDoc
                },
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        },
        getFacturasPorVin: function (cotizacion) {
            return $http({
                url: documentoApiUrl + 'facturasPorVin/',
                method: "GET",
                params: {
                    cotizacion: cotizacion
                },
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        },
        pdfInvoce: function (rfcEmisor, rfcReceptor, serie, folio) {
            return $http({
                url: documentoApiUrl + 'pdfInvoce/',
                method: "GET",
                params: {
                    rfcEmisor: rfcEmisor,
                    rfcReceptor: rfcReceptor,
                    serie: serie,
                    folio: folio
                },
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        }
    };
});