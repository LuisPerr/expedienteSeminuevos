var nodoUrl = global_settings.urlCORS + '/api/nodoapi/';
var nodoApiUrl = global_settings.urlApiNode + '/api/nodo/';
var APIExpedienteCliente = global_settings.APIExpedienteCliente;
const APIDigitalizacion = global_settings.urlDigitalizacion;
registrationModule.factory('nodoRepository', function ($http) {
    return {
        get: function (id) {
            return $http.get(nodoUrl + '0|' + id);
        },
        //getAll: function(folio, idproceso, perfil) {
        //    return $http.get(nodoUrl + '1|' + folio + '|' + idproceso + '|' + perfil);
        //},
        getHeader: function (folio, usuario) {
            return $http.get(nodoUrl + '2|' + folio + '|' + usuario);
        },
        update: function (id) {
            return $http.post(nodoUrl + '2|' + id);
        },
        // getNavegacion: function(folio, tipofolio, tiporegreso) {
        //     return $http.get(nodoUrl + '3|' + folio + '|' + tipofolio + '|' + tiporegreso);
        // },
        CancelarOrden: function (folio, idusuario) {
            return $http.get(nodoUrl + '4|' + folio + '|' + idusuario);
        },
        cambiaEstatusApartada: function (serie, folio, idusuario) {
            return $http.get(nodoUrl + '5|' + serie + '|' + folio + '|' + idusuario);
        },
        getHeader: function (folio, idUsuario) {
            return $http({
                url: nodoApiUrl + 'header/',
                method: "GET",
                params: {
                    folio: folio,
                    idUsuario: idUsuario
                },
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        },
        verificaUsuario: function (folio, idUsuario) {
            return $http({
                url: nodoApiUrl + 'verificaUsuario/',
                method: "GET",
                params: {
                    folio: folio,
                    idUsuario: idUsuario
                },
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        },
        cierraNodo: function (idProceso, idNodo, idFolio) {
            return $http({
                url: nodoApiUrl + 'cierraNodo/',
                method: "GET",
                params: {
                    idProceso: idProceso,
                    idFolio: idFolio,
                    idNodo: idNodo
                },
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        },
        bitacoraAccion: function (idFolio, idNodo, idUsuario) {
            return $http({
                url: nodoApiUrl + 'bitacoraAccion/',
                method: "GET",
                params: {
                    idFolio: idFolio,
                    idNodo: idNodo,
                    idUsuario: idUsuario
                },
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        },
        getEncabezadoResumen: function (idFolio) {
            return $http({
                url: nodoApiUrl + 'encabezadoResumen/',
                method: "GET",
                params: {
                    idFolio: idFolio
                },
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        },
        getAll: function (folio, idproceso, perfil) {
            return $http({
                url: nodoApiUrl + 'all/',
                method: "GET",
                params: {
                    folio: folio,
                    idproceso: idproceso,
                    perfil: perfil
                },
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        },
        //--Resumen Cotización
        getResumenCargo: function (idCotDet, folio) {
            return $http({
                url: nodoApiUrl + 'cargos/',
                method: "GET",
                params: {
                    folio: folio,
                    idCotDet: idCotDet
                },
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        },
        getResumenAbono: function (factura, folio) {
            return $http({
                url: nodoApiUrl + 'abonos/',
                method: "GET",
                params: {
                    folio: folio,
                    factura: factura
                },
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        },
        getResumenAnticipos: function (factura, folio) {
            return $http({
                url: nodoApiUrl + 'anticipos/',
                method: "GET",
                params: {
                    folio: folio,
                    factura: factura
                },
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        },
        getOtrasFacturas: function (folio, cotizacion) {
            return $http({
                url: nodoApiUrl + 'otrasFacturas/',
                method: "GET",
                params: {
                    folio: folio,
                    cotizacion: cotizacion
                },
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        },
        //---
        getNavegacion: function (folio, tipoFolio, tipoReturn) {
            return $http({
                url: nodoApiUrl + 'navegacion/',
                method: "GET",
                params: {
                    folio: folio,
                    tipoFolio: tipoFolio,
                    tipoReturn: tipoReturn
                },
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        },
        matrizExcel: function (folio) {
            return $http({
                url: nodoApiUrl + 'matrizExcel/',
                method: "GET",
                params: {
                    folio: folio
                },
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        },
        getAllDocumentosByVin: (vin, idEmpresa, idSucursal, idProceso, idPerfil, idUsuario) => {
            return $http({
                url: nodoApiUrl + 'allDocumentosByVin/',
                method: 'GET',
                params: {
                    vin: vin,
                    idEmpresa: idEmpresa,
                    idSucursal: idSucursal,
                    idProceso: idProceso,
                    idPerfil: idPerfil,
                    idUsuario: idUsuario
                }
            })
        },
        getAllDocumentosByRfc: (rfc, idEmpresa, idSucursal, idProceso, idPerfil, idUsuario) => {
            return $http({
                url: nodoApiUrl + 'allDocumentosByRfc/',
                method: 'GET',
                params: {
                    rfc: rfc,
                    idEmpresa: idEmpresa,
                    idSucursal: idSucursal,
                    idProceso: idProceso,
                    idPerfil: idPerfil,
                    idUsuario: idUsuario
                }
            })
        },
        getAllDocumentosByidCliente: (idCliente, idEmpresa, idSucursal, idProceso, idPerfil, idUsuario) => {
            return $http({
                url: nodoApiUrl + 'allDocumentosByIdCliente/',
                method: 'GET',
                params: {
                    idCliente: idCliente,
                    idEmpresa: idEmpresa,
                    idSucursal: idSucursal,
                    idProceso: idProceso,
                    idPerfil: idPerfil,
                    idUsuario: idUsuario
                }
            })
        },
        getAllDocumentosByFactura: (factura, idEmpresa, idSucursal, idProceso, idPerfil, idUsuario) => {
            return $http({
                url: nodoApiUrl + 'allDocumentosByFactura/',
                method: 'GET',
                params: {
                    factura: factura,
                    idEmpresa: idEmpresa,
                    idSucursal: idSucursal,
                    idProceso: idProceso,
                    idPerfil: idPerfil,
                    idUsuario: idUsuario
                }
            })
        },
        getAllDocumentosByOrdenCompra: (ordenCompra, idEmpresa, idSucursal, idProceso, idPerfil, idUsuario) => {
            return $http({
                url: nodoApiUrl + 'allDocumentosByOrdenCompra/',
                method: 'GET',
                params: {
                    ordenCompra: ordenCompra,
                    idEmpresa: idEmpresa,
                    idSucursal: idSucursal,
                    idProceso: idProceso,
                    idPerfil: idPerfil,
                    idUsuario: idUsuario
                }
            })
        },
        getAllDocumentosByCotizacion: (cotizacion, idEmpresa, idSucursal, idProceso, idPerfil, idUsuario) => {
            return $http({
                url: nodoApiUrl + 'allDocumentosByCotizacion/',
                method: 'GET',
                params: {
                    cotizacion: cotizacion,
                    idEmpresa: idEmpresa,
                    idSucursal: idSucursal,
                    idProceso: idProceso,
                    idPerfil: idPerfil,
                    idUsuario: idUsuario
                }
            })
        },
        saveDocumentos: function (data) {
            return $http({
                url: nodoApiUrl + 'saveDocumentos/',
                method: "POST",
                data: {
                    idUsuario: data.idUsuario,
                    nombreDocumento: data.nombreDocumento,
                    idDocumento: data.idDocumento,
                    archivo: data.archivo,
                    rutaSave: data.rutaSave,
                    idExpediente: data.idExpediente,
                    idProceso: data.idProceso,
                    doc_varios: data.doc_varios,
                    proceso: data.proceso,
                    carpetaVarios: data.carpetaVarios,
                    tenenciaDosMilVeintiuno: data.tenenciaDosMilVeintiuno
                },
                headers: {
                    'Content-Type': 'application/json'
                }

            });
        },
        actualizarDocumentos: function (data) {
            return $http({
                url: nodoApiUrl + 'actualizarDocumentos/',
                method: "POST",
                data: {
                    idUsuario: data.idUsuario,
                    nombreDocumento: data.nombreDocumento,
                    idDocumento: data.idDocumento,
                    archivo: data.archivo,
                    rutaSave: data.rutaSave,
                    idExpediente: data.idExpediente,
                    idProceso: data.idProceso,
                    doc_varios: data.doc_varios,
                    proceso: data.proceso,
                    carpetaVarios: data.carpetaVarios,
                    nombreAntiguo: data.nombreAntiguo,
                    idDocumentoGuardado: data.idDocumentoGuardado
                },
                headers: {
                    'Content-Type': 'application/json'
                }

            });
        },
        getDocumentosVarios: (idDocumento, idExpediente, idProceso) => {
            return $http({
                url: nodoApiUrl + 'documentosVarios/',
                method: 'GET',
                params: {
                    idDocumento: idDocumento,
                    idExpediente: idExpediente,
                    idProceso: idProceso
                }
            })
        },
        documentosVariosShow: (idDocumento, idExpediente, idProceso) => {
            return $http({
                url: nodoApiUrl + 'documentosVarios/',
                method: 'GET',
                params: {
                    idDocumento: idDocumento,
                    idExpediente: idExpediente,
                    idProceso: idProceso
                }
            })
        },
        updateEstatusDocumento: (id_documentoGuardado, id_estatus, observaciones, idUsuario, tipoProceso) => {
            return $http({
                url: nodoApiUrl + 'updateEstatusDocumento/',
                method: 'GET',
                params: {
                    id_documentoGuardado: id_documentoGuardado,
                    id_estatus: id_estatus,
                    observaciones: observaciones,
                    idUsuario: idUsuario,
                    tipoProceso: tipoProceso
                }
            })
        },
        getReporteIndividual: (vin, idEmpresa, idSucursal, idProceso) => {
            return $http({
                url: nodoApiUrl + 'reporteIndividual/',
                method: 'GET',
                params: {
                    vin: vin,
                    idEmpresa: idEmpresa,
                    idSucursal: idSucursal,
                    idProceso: idProceso
                }
            })
        },
        getReporteGeneral: (fecha1, fecha2, idProceso, idEmpresa, idSucursal) => {
            return $http({
                url: nodoApiUrl + 'reporteGeneral/',
                method: 'GET',
                params: {
                    fecha1: fecha1,
                    fecha2: fecha2,
                    idProceso: idProceso,
                    idEmpresa: idEmpresa,
                    idSucursal: idSucursal
                }
            })
        },
        getDocumentoWS: (tipo, aBuscar, ruta) => {
            return $http({
                url: nodoApiUrl + 'documentoWS/',
                method: 'GET',
                params: {
                    tipo: tipo,
                    aBuscar: aBuscar,
                    ruta: ruta
                }
            })
        },
        consultaNota: (vin, idEmpresa, idSucursal, sp) => {
            return $http({
                url: nodoApiUrl + 'consultaNota/',
                method: 'GET',
                params: {
                    vin: vin,
                    idEmpresa: idEmpresa,
                    idSucursal: idSucursal,
                    sp: sp
                }
            })
        },
        consultaImagenesCarrusel: (vin, idEmpresa, idSucursal) => {
            return $http({
                url: nodoApiUrl + 'consultaImagenesCarrusel/',
                method: 'GET',
                params: {
                    vin: vin,
                    idEmpresa: idEmpresa,
                    idSucursal: idSucursal
                }
            })
        },
        getReporteGeneralGA: (fecha1, fecha2) => {
            return $http({
                url: nodoApiUrl + 'reporteGeneralGA/',
                method: 'GET',
                params: {
                    fecha1: fecha1,
                    fecha2: fecha2
                }
            })
        },
        unidadFacturada: (vin, idEmpresa, idSucursal) => {
            return $http({
                url: nodoApiUrl + 'unidadFacturada/',
                method: 'GET',
                params: {
                    vin: vin,
                    idEmpresa: idEmpresa,
                    idSucursal: idSucursal
                }
            })
        },
        getDataDocumentosFaltantes: (vin, idEmpresa, idSucursal, idProceso) => {
            return $http({
                url: nodoApiUrl + 'dataDocumentosFaltantes/',
                method: 'GET',
                params: {
                    vin: vin,
                    idEmpresa: idEmpresa,
                    idSucursal: idSucursal,
                    idProceso: idProceso
                }
            })
        },
        allTenenciasObligatorias: (idExpediente) => {
            return $http({
                url: nodoApiUrl + 'allTenenciasObligatorias/',
                method: 'GET',
                params: {
                    idExpediente: idExpediente
                }
            })
        },
        updateTenenciasDocGubernamental: function (idExpediente, data) {
            return $http({
                url: nodoApiUrl + 'updateTenenciasDocGubernamental/',
                method: "POST",
                data: {
                    idExpediente: idExpediente,
                    checksYears: data,
                },
                headers: {
                    'Content-Type': 'application/json'
                }

            });
        },
        selTotalDocumet: function (nombreDocumento, idExpediente, idProceso, idDocumento) {
            return $http({
                url: nodoApiUrl + 'selTotalDocumet/',
                method: "GET",
                params: {
                    nombreDocumento: nombreDocumento,
                    idExpediente: idExpediente,
                    idProceso: idProceso,
                    idDocumento: idDocumento
                },
                headers: {
                    'Content-Type': 'application/json'
                }

            });
        },
        documentsForExcel: (idProceso, idCanal, tipoPersona, idEstados) => {
            return $http({
                url: nodoApiUrl + 'documentsForExcel/',
                method: "GET",
                params: {
                    idProceso: idProceso,
                    idCanal: idCanal,
                    tipoPersona: tipoPersona,
                    idEstados: idEstados
                },
                headers: {
                    'Content-Type': 'application/json'
                }

            });
        },
        getTokenParametros: function (data) {
            //let params ={idCliente: this.idCliente, idProceso: this.idProceso, idUsuarioBpro: this.idUsuarioBpro};
            return $http({
                // url: 'https://apiexpedientecliente.grupoandrade.com/acceso/PostAccesoExpedienteClienteUnico',
                url: `${APIExpedienteCliente}acceso/PostAccesoExpedienteClienteUnico`,
                method: "POST",
                data: data,
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        },

        insToken: function (parametros) {
            return $http({
                url: '/api/expedienteCliente/InsToken/',
                method: "GET",
                params: parametros,
                headers: {
                    'Content-Type': 'application/json'
                }

            });
        },

        congelarDocumentos: function (token) {
            return $http({
                url: `${APIExpedienteCliente}acceso/GetAccesoCongelarDocumentos`,
                method: "GET",
                params: {
                    token: token
                },
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        },
        dataFacturaAccesorios: (vin, idEmpresa, idSucursal, idUsuario) => {
            return $http({
                url: nodoApiUrl + 'dataFacturaAccesorios/',
                method: "GET",
                params: {
                    vin: vin,
                    idEmpresa: idEmpresa,
                    idSucursal: idSucursal,
                    idUsuario: idUsuario
                },
                headers: {
                    'Content-Type': 'application/json'
                }

            });
        },
        allDataFacturaAccesorios: (vin, idEmpresa, idSucursal) => {
            return $http({
                url: nodoApiUrl + 'allDataFacturaAccesorios/',
                method: "GET",
                params: {
                    vin: vin,
                    idEmpresa: idEmpresa,
                    idSucursal: idSucursal
                },
                headers: {
                    'Content-Type': 'application/json'
                }

            });
        },
        documentoWSFacturas: (aBuscar) => {
            return $http({
                url: nodoApiUrl + 'documentoWSFacturas/',
                method: 'GET',
                params: {
                    aBuscar: aBuscar
                }
            })
        },
        dataRecibos: (vin, idEmpresa, idSucursal, idUsuario) => {
            return $http({
                url: nodoApiUrl + 'dataRecibos/',
                method: 'GET',
                params: {
                    vin: vin,
                    idEmpresa: idEmpresa,
                    idSucursal: idSucursal,
                    idUsuario: idUsuario
                },
            })
        },
        allRecibos: (vin, idEmpresa, idSucursal) => {
            return $http({
                url: nodoApiUrl + 'allRecibos/',
                method: 'GET',
                params: {
                    vin: vin,
                    idEmpresa: idEmpresa,
                    idSucursal: idSucursal
                },
            })
        },
        accionEnlace: (idUsuario, vin, idEmpresa, idSucursal) => {
            return $http({
                url: nodoApiUrl + 'accionEnlace/',
                method: 'GET',
                params: {
                    idUsuario: idUsuario,
                    vin: vin,
                    idEmpresa: idEmpresa,
                    idSucursal: idSucursal
                },
            })
        },
        updateEstatusDocumentoEnlace: (id_documentoGuardado, id_estatus, observaciones, idUsuario, tipoProceso) => {
            return $http({
                url: nodoApiUrl + 'updateEstatusDocumentoEnlace/',
                method: 'GET',
                params: {
                    id_documentoGuardado: id_documentoGuardado,
                    id_estatus: id_estatus,
                    observaciones: observaciones,
                    idUsuario: idUsuario,
                    tipoProceso: tipoProceso
                }
            })
        },
        urlGuia: (idProceso, idDocumento) => {
            return $http({
                url: nodoApiUrl + 'urlGuia/',
                method: 'GET',
                params: {
                    idProceso: idProceso,
                    idDocumento: idDocumento
                }
            })
        },
        docsComprobantePago: (vin, idEmpresa) => {
            return $http({
                url: nodoApiUrl + 'docsComprobantePago/',
                method: 'GET',
                params: {
                    vin: vin,
                    idEmpresa: idEmpresa
                }
            })
        },
        getPdfs: (tipo, factura, nodo) => {
            return $http({
                url: nodoApiUrl + 'pdf/',
                method: 'GET',
                params: {
                    tipo: tipo,
                    factura: factura,
                    nodo: nodo
                }
            })
        },
        existeDocFisico: ruta => {
            return $http({
                url: `${APIDigitalizacion}documento/verificaExisteDoc`,
                method: 'GET',
                params: {
                    rutaDoc: ruta
                }
            })
        },
        saveComprobantePago: (vin, idEmpresa, idSucursal, idUsuario) => {
            return $http({
                url: `${nodoApiUrl}saveComprobantePago/`,
                method: 'GET',
                params: {
                    vin: vin,
                    idEmpresa: idEmpresa,
                    idSucursal: idSucursal,
                    idUsuario: idUsuario
                }
            })
        },
        getDataDocumentosFaltantesEnlace: (vin, idEmpresa, idSucursal, idProceso) => {
            return $http({
                url: nodoApiUrl + 'dataDocumentosFaltantesEnlace/',
                method: 'GET',
                params: {
                    vin: vin,
                    idEmpresa: idEmpresa,
                    idSucursal: idSucursal,
                    idProceso: idProceso
                }
            })
        },
    };
});