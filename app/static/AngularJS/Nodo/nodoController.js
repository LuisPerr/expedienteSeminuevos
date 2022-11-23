registrationModule.controller("nodoController", function ($scope, $sce, $rootScope, $location, utils, localStorageService, alertFactory, nodoRepository, documentoRepository, alertaRepository, empleadoRepository, searchRepository, globalFactory, administradorRepository) {

    //Propiedades
    $scope.isLoading = false;
    $rootScope.allFacturas = [];
    $rootScope.allDocumentos = [];
    $rootScope.headersReport = [];
    $scope.folioBusqueda = '';
    $scope.empresaBusqueda = '';
    $scope.sucursalBusqueda = '';
    $rootScope.allDcoumets = [];
    $scope.personaFisMor = 0;
    $rootScope.dataAutomovil = [];
    $rootScope.allVines = [];
    $rootScope.cargaDocs = false;
    $scope.tipoBusqueda = '';
    $rootScope.docSave = 0;
    $rootScope.nombreArchivo = '';
    $rootScope.titleModal = '';
    $rootScope.tipoCargaDocumento = 0;
    $rootScope.titleDocumentosVarios = '';
    $rootScope.allDocumentsVarios = [];
    $rootScope.remplazarDocumento = false;
    $rootScope.variosDocumentoRemplaza = [];
    $rootScope.nombreArchivoRemplaza = '';
    $rootScope.idDocumentoGuardadoViewer = 0;
    $rootScope.showAllDocumentsVarios = [];
    $rootScope.documentoEnVista = [];
    $rootScope.razonesRechazo = '';
    $rootScope.estatusDocumentoViewer = 0;
    $rootScope.observacionesDocuentoViewer = '';
    $rootScope.nombreReporte = '';
    $rootScope.titleReporte = '';
    $rootScope.fechaInicial;
    $rootScope.fechaFinal;
    $scope.dataSource = [];
    $rootScope.docUploadUsuario = 0;
    $rootScope.arrayDocWs = '';
    $rootScope.allDocumentsWS = [];
    $rootScope.allDocumentsWSRes = [];
    $rootScope.documentoWs = [];
    $rootScope.documentoWsRes = [];
    $rootScope.rutaGetWs = '';
    $rootScope.abriModal = false;
    $rootScope.allPermisosDocumentos = '';
    $rootScope.abriNotas = false;
    $rootScope.primerVez = false;
    $rootScope.documentoObjver = '';
    $rootScope.tituloDocWs = '';
    $scope.tipoExpediente = '';
    $rootScope.unidadFacturada = 0;
    $rootScope.textoUnidadFacturada = '';
    $scope.vinCliente = '';
    $rootScope.tipoPersona = '';
    $rootScope.tipoReglaExpediente = '';
    $rootScope.reporteDocumentos = '';
    $rootScope.tabDocumentosFaltantes = 0;
    $rootScope.cargandoDocsFaltantes = false;
    $rootScope.docsFaltantesCargados = false;
    $rootScope.busquedaVar = true;
    $rootScope.allTenenciasObligatorias = [];
    $rootScope.allYearsTenencias = [];
    $rootScope.yearSelect = '';
    $rootScope.showViewAllTenencias = false;
    $rootScope.docGubernamental = false;
    $rootScope.checksYears = [];
    $rootScope.idDocumentoUpload;
    $rootScope.tenenciaDosMilVeintiuno = 0;
    $rootScope.amparoAllTenencias = '';
    $rootScope.cargandoXls = false;
    $rootScope.listaProcesosXls = [];
    $rootScope.procesoXls = undefined;
    $rootScope.listaCanalesXls;
    $rootScope.canalesXls = undefined;
    $rootScope.listaEstadosXls;
    $rootScope.estadosXls = undefined;
    $rootScope.estadoRepublicaXls = false;
    $rootScope.listaPersonasXls;
    $rootScope.showCanalesXls = false;
    $rootScope.showtipoPersonasXls = false;
    $rootScope.listaPersonasXls = [
        { id_persona: 'FIS', tipo_persona: 'Fisica' },
        { id_persona: 'MOR', tipo_persona: 'Moral' },
        { id_persona: 'FIE', tipo_persona: 'Fisica con Actividad Empresarial' }
    ];
    $rootScope.tipoPersonaXls = undefined;
    $rootScope.contenidoDocumentos;
    $rootScope.allFacturasAcc = [];
    $rootScope.facturaGuardada = 0;
    $rootScope.facturaMostrada = 0;
    $rootScope.titleModalFacturas = '';
    $rootScope.dataRecibos;
    $rootScope.dataFacAccesorios;
    $rootScope.accionEnlaceContable = false;
    $rootScope.esUsuarioEnlace = false;
    $rootScope.estatusDocumentoViewerEnlace = 0;
    $rootScope.modalTitleGuia = '';
    $rootScope.dataComprobantes = [];
    $rootScope.getComprobantes = false;
    $rootScope.folioAMostrar = '';

    //Mensajes en caso de error
    var errorCallBack = function (data, status, headers, config) {
        $('#btnEnviar').button('reset');
        //Reinicio el tipo de folio

        alertFactory.error('Ocurrio un problema');
    };

    //Grupo de funciones de inicio
    $scope.init = function () {
        $rootScope.cargaDocs = false;
        getEmpleado();
        //Obtengo los datos del empleado loguedo
        empleadoRepository.get($rootScope.currentEmployee)
            .success(getEmpleadoSuccessCallback)
            .error(errorCallBack);
        $scope.showBtnOtrasFac = false;

    };

    $rootScope.CargaEmpleado = function (id, idProceso) {
        getEmpleado();
        $scope.id = id;
        $rootScope.idProceso = idProceso
        empleadoRepository.get($rootScope.currentEmployee)
            .success(getEmpleadoSuccessCallback)
            .error(errorCallBack);
    };

    //Obtiene el empleado actual
    var getEmpleado = function () {
        $("#loadModalCXC").modal("show");
        if (!($('#lgnUser').val().indexOf('[') > -1)) {
            if ($('#lgnUser').val() !== '') {
                localStorageService.set('lgnUser', $('#lgnUser').val());
            } else {
                alertFactory.warning('Inicie sesion desde el panel de aplicaciones');
                setTimeout(() => {
                    window.close();
                }, 3500);
            };
        } else {
            if (($('#lgnUser').val().indexOf('[') > -1) && !localStorageService.get('lgnUser')) {
                if (getParameterByName('employee') != '') {
                    $rootScope.currentEmployee = getParameterByName('employee');
                    localStorageService.remove('lgnUser');
                    localStorageService.set('lgnUser', $rootScope.currentEmployee);
                    window.location = window.location.href.split("?")[0];
                    window.reload();
                    return;
                } else {
                    alert('Inicie sesión desde panel de aplicaciones.');
                    alertFactory.warning('Inicie sesion desde el panel de aplicaciones');
                    window.close();
                }
            } else {
                if (getParameterByName('employee') != '') {
                    $rootScope.currentEmployee = getParameterByName('employee');
                    localStorageService.remove('lgnUser');
                    localStorageService.set('lgnUser', $rootScope.currentEmployee);
                    window.location = window.location.href.split("?")[0];
                    window.reload();
                    return;
                };
            };
        };
        //Obtengo el empleado logueado
        $rootScope.currentEmployee = localStorageService.get('lgnUser');
    };

    var getEmpleadoSuccessCallback = function (data, status, headers, config) {
        $rootScope.empleado = data;
        if ($rootScope.empleado != null) {
            empleadoRepository.getPermisosUsuario($rootScope.empleado.idUsuario, $rootScope.empleado.idPerfil).then(res => {
                var dataPermisos = '';
                res.data.forEach((value, key) => {
                    dataPermisos += `"${value.nombre}":${value.aplica},`
                });
                $rootScope.allPermisosDocumentos = JSON.parse(`{${dataPermisos.substring(0, dataPermisos.length - 1)}}`);
                $rootScope.loadProceso();
                $("#loadModalCXC").modal("hide");
                $('#slide').click();
                $rootScope.busquedaVar = true;
            });
        } else {
            alertFactory.error('El empleado no existe en el sistema.');
        };
    };

    $rootScope.getDocumentos = () => {
        $('#searchResultsO').modal('hide');
        $('#searchResultsCXC').modal('hide');
        $rootScope.tipoPersona = '';
        $rootScope.tipoReglaExpediente = '';
        $scope.empresaBusqueda = $rootScope.empresa.nombre;
        $scope.sucursalBusqueda = $rootScope.agencia.nombre;
        $rootScope.unidadFacturada = 0;
        $rootScope.textoUnidadFacturada = '';
        $rootScope.folioAMostrar = '';

        if ($rootScope.tipoProceso == 1) {
            $scope.tipoExpediente = 'Expediente de compra';
        } else {
            $scope.tipoExpediente = 'Expediente de venta';
        };

        // Reseteamos cada vez que se consulte un expediente nuevo
        $scope.reset()
        $scope.openTab(1);

        switch ($rootScope.identificaBusqueda) {
            case 1:
                $scope.tipoBusqueda = 'Orden de Compra';
                nodoRepository.getAllDocumentosByOrdenCompra($rootScope.datoBusqueda, $rootScope.empresa.idEmpresa, $rootScope.agencia.idSucursal, $rootScope.tipoProceso, $rootScope.empleado.idPerfil, $rootScope.empleado.idUsuario).then(res => {
                    if (res.data[0][0].success == 1) {
                        $('#closeMenu').click();
                        $rootScope.cargaDocs = true;
                        $rootScope.allDcoumets = res.data[1];
                        $rootScope.dataAutomovil = res.data[2][0];
                        $rootScope.tipoPersona = res.data[3][0].tipoDePersona;
                        $rootScope.tipoReglaExpediente = res.data[3][0].tipoReglaExpediente;
                        if ($rootScope.tipoProceso == 1) {
                            $scope.getUnidadFacturada();
                        }
                        $scope.dataSource = res.data[1];
                        if ($rootScope.abriNotas == false) {
                            $rootScope.allDocumentsWS = res.data[2];
                        }
                        $rootScope.allDocumentsWSRes = res.data[2];
                        if ($rootScope.primerVez == true) {
                            $rootScope.muestraDocWS($rootScope.documentoObjver);
                            alertFactory.success('Se genero y guardo el documento con éxito.');
                            $rootScope.primerVez = false;
                        }
                        $scope.dataGridOptions = {
                            columnAutoWidth: true,
                            allowColumnResizing: true,
                            bindingOptions: { dataSource: 'dataSource' },
                            filterRow: { visible: true },
                            headerFilter: { visible: true },
                            showBorders: true,
                            searchPanel: {
                                visible: false,
                                width: 240,
                                placeholder: 'Buscar en todo...'
                            },
                            paging: { pageSize: 50 },
                            columns: [
                                { dataField: 'doc_nombre', caption: 'Nombre del documento', cellTemplate: 'nombreDocumento' },
                                // { width: '80', caption: 'Ver Guia', cellTemplate: 'verGuia' },
                                { width: '130', caption: 'Subir Documento', cellTemplate: 'openUpload' },
                                { width: '80', caption: 'Ver', cellTemplate: 'verDocumento' },
                                { dataField: 'est_descripcion', caption: 'Estatus del documento', cellTemplate: 'estatus' },
                                { width: '180', dataField: 'doctoOpcional', caption: 'Tipo de documento', cellTemplate: 'opcional' }
                            ]
                        };
                        // $('#btnBuscar').button('reset');
                        // $("#loadModalCXC").modal("hide");
                        $scope.getOcInitial(res.data[1], res.data[2]);

                        $scope.idClienteExpediente = res.data[4][0].idCliente;
                        $scope.resToken = res.data[5];
                        $scope.expedienteCerrado = res.data[6];
                        $rootScope.folioAMostrar = res.data[7][0].folio
                    } else {
                        if (res.data[0][0].success === 2) {
                            $rootScope.getDocumentos();
                        } else if (res.data[0][0].success === 3) {
                            $rootScope.getDocumentos();
                        } else {
                            $('#btnBuscar').button('reset');
                            $("#loadModalCXC").modal("hide");
                            $rootScope.cargaDocs = false;
                            alertFactory.error(res.data[1][0].msg);
                        };
                    };
                });
                break;
            case 2:
                $scope.tipoBusqueda = 'Factura';
                nodoRepository.getAllDocumentosByFactura($rootScope.datoBusqueda, $rootScope.empresa.idEmpresa, $rootScope.agencia.idSucursal, $rootScope.tipoProceso, $rootScope.empleado.idPerfil, $rootScope.empleado.idUsuario).then(res => {
                    if (res.data[0][0].success == 1) {
                        $('#closeMenu').click();
                        $rootScope.cargaDocs = true;
                        $rootScope.allDcoumets = res.data[1];
                        $rootScope.dataAutomovil = res.data[2][0];
                        $rootScope.tipoPersona = res.data[3][0].tipoDePersona;
                        $rootScope.tipoReglaExpediente = res.data[3][0].tipoReglaExpediente;
                        if ($rootScope.tipoProceso == 1) {
                            $scope.getUnidadFacturada();
                        }
                        $scope.dataSource = res.data[1];
                        if ($rootScope.abriNotas == false) {
                            $rootScope.allDocumentsWS = res.data[2];
                        }
                        $rootScope.allDocumentsWSRes = res.data[2];
                        if ($rootScope.primerVez == true) {
                            $rootScope.muestraDocWS($rootScope.documentoObjver);
                            alertFactory.success('Se genero y guardo el documento con éxito.');
                            $rootScope.primerVez = false;
                        }
                        $scope.dataGridOptions = {
                            columnAutoWidth: true,
                            allowColumnResizing: true,
                            bindingOptions: { dataSource: 'dataSource' },
                            filterRow: { visible: true },
                            headerFilter: { visible: true },
                            showBorders: true,
                            // export: { enabled: true, fileName: 'datos', allowExportSelectedData: false },
                            searchPanel: {
                                visible: false,
                                width: 240,
                                placeholder: 'Buscar en todo...'
                            },
                            paging: { pageSize: 50 },
                            // pager: {
                            //     showPageSizeSelector: true,
                            //     allowedPageSizes: [5, 10, 15],
                            //     showInfo: true
                            // },
                            // bindingOptions: { dataSource: 'dataSource' },
                            columns: [
                                { dataField: 'doc_nombre', caption: 'Nombre del documento', cellTemplate: 'nombreDocumento' },
                                // { width: '80', caption: 'Ver Guia', cellTemplate: 'verGuia' },
                                { width: '130', caption: 'Subir Documento', cellTemplate: 'openUpload' },
                                { width: '80', caption: 'Ver', cellTemplate: 'verDocumento' },
                                { dataField: 'est_descripcion', caption: 'Estatus del documento', cellTemplate: 'estatus' },
                                { width: '180', dataField: 'doctoOpcional', caption: 'Tipo de documento', cellTemplate: 'opcional' }
                            ]
                        };
                        // $('#btnBuscar').button('reset');
                        // $("#loadModalCXC").modal("hide");
                        $scope.getOcInitial(res.data[1], res.data[2]);

                        $scope.idClienteExpediente = res.data[4][0].idCliente;
                        $scope.resToken = res.data[5];
                        $scope.expedienteCerrado = res.data[6];
                        $rootScope.folioAMostrar = res.data[7][0].folio;
                    } else {
                        if (res.data[0][0].success === 2) {
                            $rootScope.getDocumentos();
                        } else if (res.data[0][0].success === 3) {
                            $rootScope.getDocumentos();
                        } else {
                            $('#btnBuscar').button('reset');
                            $("#loadModalCXC").modal("hide");
                            $rootScope.cargaDocs = false;
                            alertFactory.error(res.data[1][0].msg);
                        };
                    };
                });
                break;
            case 3:
                $scope.tipoBusqueda = 'Vin'
                nodoRepository.getAllDocumentosByVin($rootScope.datoBusqueda, $rootScope.empresa.idEmpresa, $rootScope.agencia.idSucursal, $rootScope.tipoProceso, $rootScope.empleado.idPerfil, $rootScope.empleado.idUsuario).then(res => {
                    if (res.data[0][0].success == 1) {
                        $('#closeMenu').click();
                        $rootScope.cargaDocs = true;
                        $rootScope.allDcoumets = res.data[1];
                        $rootScope.dataAutomovil = res.data[2][0];
                        $rootScope.tipoPersona = res.data[3][0].tipoDePersona;
                        $rootScope.tipoReglaExpediente = res.data[3][0].tipoReglaExpediente;
                        if ($rootScope.tipoProceso == 1) {
                            $scope.getUnidadFacturada();
                        }

                        $scope.dataSource = res.data[1];
                        $scope.dataSource = $scope.filtro($rootScope.allDcoumets);

                        if ($rootScope.abriNotas == false) {
                            $rootScope.allDocumentsWS = res.data[2];
                        }
                        $rootScope.allDocumentsWSRes = res.data[2];
                        if ($rootScope.primerVez == true) {
                            $rootScope.muestraDocWS($rootScope.documentoObjver);
                            alertFactory.success('Se genero y guardo el documento con éxito.');
                            $rootScope.primerVez = false;
                        }
                        $scope.dataGridOptions = {
                            // dataSource: $rootScope.allDcoumets,
                            columnAutoWidth: true,
                            allowColumnResizing: true,
                            bindingOptions: { dataSource: 'dataSource' },
                            filterRow: { visible: true },
                            headerFilter: { visible: true },
                            showBorders: true,
                            // export: { enabled: true, fileName: 'datos', allowExportSelectedData: false },
                            searchPanel: {
                                visible: false,
                                width: 240,
                                placeholder: 'Buscar en todo...'
                            },
                            paging: { pageSize: 50 },
                            // pager: {
                            //     showPageSizeSelector: true,
                            //     allowedPageSizes: [5, 10, 15],
                            //     showInfo: true
                            // },
                            // bindingOptions: { dataSource: 'dataSource' },
                            columns: [
                                { dataField: 'doc_nombre', caption: 'Nombre del documento', cellTemplate: 'nombreDocumento' },
                                // { width: '80', caption: 'Ver Guia', cellTemplate: 'verGuia' },
                                { width: '130', caption: 'Subir Documento', cellTemplate: 'openUpload' },
                                { width: '80', caption: 'Ver', cellTemplate: 'verDocumento' },
                                { dataField: 'est_descripcion', caption: 'Estatus del documento', cellTemplate: 'estatus' },
                                { width: '180', dataField: 'doctoOpcional', caption: 'Tipo de documento', cellTemplate: 'opcional' }
                            ]
                        };
                        $scope.getOcInitial(res.data[1], res.data[2]);
                        $scope.idClienteExpediente = res.data[4][0].idCliente;
                        $scope.resToken = res.data[5];
                        $scope.expedienteCerrado = res.data[6];
                        $rootScope.folioAMostrar = res.data[7][0].folio
                    } else {
                        if (res.data[0][0].success === 2) {
                            $rootScope.getDocumentos();
                        } else if (res.data[0][0].success === 3) {
                            $rootScope.getDocumentos();
                        } else {
                            $('#btnBuscar').button('reset');
                            $("#loadModalCXC").modal("hide");
                            $rootScope.cargaDocs = false;
                            alertFactory.error(res.data[1][0].msg);
                        };
                    };
                });
                break;
            case 5:
                if (isNaN($rootScope.datoBusqueda)) {
                    $scope.tipoBusqueda = 'RFC Cliente';
                    nodoRepository.getAllDocumentosByRfc($rootScope.datoBusqueda, $rootScope.empresa.idEmpresa, $rootScope.agencia.idSucursal, $rootScope.tipoProceso, $rootScope.empleado.idPerfil, $rootScope.empleado.idUsuario).then((res) => {
                        if (res.data[0][0].success == 2) {
                            $rootScope.allVines = res.data[1];
                            if ($rootScope.primeraVezCliente) {
                                $('#masDeUnVin').modal('show');
                            } else {
                                $rootScope.getDataByVin($scope.vinCliente);
                            }
                        } else if (res.data[0][0].success == 1) {
                            $('#closeMenu').click();
                            $rootScope.cargaDocs = true;
                            $rootScope.allDcoumets = res.data[1];
                            $rootScope.dataAutomovil = res.data[2][0];
                            $rootScope.tipoPersona = res.data[3][0].tipoDePersona;
                            $rootScope.tipoReglaExpediente = res.data[3][0].tipoReglaExpediente;
                            if ($rootScope.tipoProceso == 1) {
                                $scope.getUnidadFacturada();
                            }
                            $scope.dataSource = res.data[1];
                            if ($rootScope.abriNotas == false) {
                                $rootScope.allDocumentsWS = res.data[2];
                            }
                            $rootScope.allDocumentsWSRes = res.data[2];
                            if ($rootScope.primerVez == true) {
                                $rootScope.muestraDocWS($rootScope.documentoObjver);
                                alertFactory.success('Se genero y guardo el documento con éxito.');
                                $rootScope.primerVez = false;
                            }
                            $scope.dataGridOptions = {
                                // dataSource: $rootScope.allDcoumets,
                                columnAutoWidth: true,
                                allowColumnResizing: true,
                                bindingOptions: { dataSource: 'dataSource' },
                                filterRow: { visible: true },
                                headerFilter: { visible: true },
                                showBorders: true,
                                // export: { enabled: true, fileName: 'datos', allowExportSelectedData: false },
                                searchPanel: {
                                    visible: false,
                                    width: 240,
                                    placeholder: 'Buscar en todo...'
                                },
                                paging: { pageSize: 50 },
                                // pager: {
                                //     showPageSizeSelector: true,
                                //     allowedPageSizes: [5, 10, 15],
                                //     showInfo: true
                                // },
                                // bindingOptions: { dataSource: 'dataSource' },
                                columns: [
                                    { dataField: 'doc_nombre', caption: 'Nombre del documento', cellTemplate: 'nombreDocumento' },
                                    // { width: '80', caption: 'Ver Guia', cellTemplate: 'verGuia' },
                                    { width: '130', caption: 'Subir Documento', cellTemplate: 'openUpload' },
                                    { width: '80', caption: 'Ver', cellTemplate: 'verDocumento' },
                                    { dataField: 'est_descripcion', caption: 'Estatus del documento', cellTemplate: 'estatus' },
                                    { width: '180', dataField: 'doctoOpcional', caption: 'Tipo de documento', cellTemplate: 'opcional' }
                                ]
                            };
                            // $('#btnBuscar').button('reset');
                            // $("#loadModalCXC").modal("hide");
                            $scope.getOcInitial(res.data[1], res.data[2]);

                            $scope.idClienteExpediente = res.data[4][0].idCliente;
                            $scope.resToken = res.data[5];
                            $scope.expedienteCerrado = res.data[6];
                        } else {
                            $rootScope.cargaDocs = false;
                            alertFactory.error(res.data[1][0].msg);
                        };
                    });
                } else {
                    $scope.tipoBusqueda = 'ID Cliente';
                    nodoRepository.getAllDocumentosByidCliente($rootScope.datoBusqueda, $rootScope.empresa.idEmpresa, $rootScope.agencia.idSucursal, $rootScope.tipoProceso, $rootScope.empleado.idPerfil, $rootScope.empleado.idUsuario).then((res) => {
                        if (res.data[0][0].success == 2) {
                            $rootScope.allVines = res.data[1];
                            if ($rootScope.primeraVezCliente) {
                                $('#masDeUnVin').modal('show');
                            } else {
                                $rootScope.getDataByVin($scope.vinCliente);
                            };
                        } else if (res.data[0][0].success == 1) {
                            $('#closeMenu').click();
                            $rootScope.cargaDocs = true;
                            $rootScope.allDcoumets = res.data[1];
                            $rootScope.dataAutomovil = res.data[2][0];
                            $rootScope.tipoPersona = res.data[3][0].tipoDePersona;
                            $rootScope.tipoReglaExpediente = res.data[3][0].tipoReglaExpediente;
                            if ($rootScope.tipoProceso == 1) {
                                $scope.getUnidadFacturada();
                            }
                            $scope.dataSource = res.data[1];
                            if ($rootScope.abriNotas == false) {
                                $rootScope.allDocumentsWS = res.data[2];
                            };
                            $rootScope.allDocumentsWSRes = res.data[2];
                            if ($rootScope.primerVez == true) {
                                $rootScope.muestraDocWS($rootScope.documentoObjver);
                                alertFactory.success('Se genero y guardo el documento con éxito.');
                                $rootScope.primerVez = false;
                            };
                            $scope.dataGridOptions = {
                                // dataSource: $rootScope.allDcoumets,
                                columnAutoWidth: true,
                                allowColumnResizing: true,
                                bindingOptions: { dataSource: 'dataSource' },
                                filterRow: { visible: true },
                                headerFilter: { visible: true },
                                showBorders: true,
                                // export: { enabled: true, fileName: 'datos', allowExportSelectedData: false },
                                searchPanel: {
                                    visible: false,
                                    width: 240,
                                    placeholder: 'Buscar en todo...'
                                },
                                paging: { pageSize: 50 },
                                // pager: {
                                //     showPageSizeSelector: true,
                                //     allowedPageSizes: [5, 10, 15],
                                //     showInfo: true
                                // },
                                // bindingOptions: { dataSource: 'dataSource' },
                                columns: [
                                    { dataField: 'doc_nombre', caption: 'Nombre del documento', cellTemplate: 'nombreDocumento' },
                                    // { width: '80', caption: 'Ver Guia', cellTemplate: 'verGuia' },
                                    { width: '130', caption: 'Subir Documento', cellTemplate: 'openUpload' },
                                    { width: '80', caption: 'Ver', cellTemplate: 'verDocumento' },
                                    { dataField: 'est_descripcion', caption: 'Estatus del documento', cellTemplate: 'estatus' },
                                    { width: '180', dataField: 'doctoOpcional', caption: 'Tipo de documento', cellTemplate: 'opcional' }
                                ]
                            };
                            // $('#btnBuscar').button('reset');
                            // $("#loadModalCXC").modal("hide");
                            $scope.getOcInitial(res.data[1], res.data[2]);

                            $scope.idClienteExpediente = res.data[4][0].idCliente;
                            $scope.resToken = res.data[5];
                            $scope.expedienteCerrado = res.data[6];
                        } else {
                            $rootScope.cargaDocs = false;
                            alertFactory.error(res.data[1][0].msg);
                        };
                    });
                }
                $('#btnBuscar').button('reset');
                $("#loadModalCXC").modal("hide");
                break;
            case 6:
                $scope.tipoBusqueda = 'Cotizacion';
                nodoRepository.getAllDocumentosByCotizacion($rootScope.datoBusqueda, $rootScope.empresa.idEmpresa, $rootScope.agencia.idSucursal, $rootScope.tipoProceso, $rootScope.empleado.idPerfil, $rootScope.empleado.idUsuario).then(res => {
                    if (res.data[0][0].success == 1) {
                        $('#closeMenu').click();
                        $rootScope.cargaDocs = true;
                        $rootScope.allDcoumets = res.data[1];
                        $rootScope.dataAutomovil = res.data[2][0];
                        $rootScope.tipoPersona = res.data[3][0].tipoDePersona;
                        $rootScope.tipoReglaExpediente = res.data[3][0].tipoReglaExpediente;
                        if ($rootScope.tipoProceso == 1) {
                            $scope.getUnidadFacturada();
                        }
                        $scope.dataSource = res.data[1];
                        if ($rootScope.abriNotas == false) {
                            $rootScope.allDocumentsWS = res.data[2];
                        }
                        $rootScope.allDocumentsWSRes = res.data[2];
                        if ($rootScope.primerVez == true) {
                            $rootScope.muestraDocWS($rootScope.documentoObjver);
                            alertFactory.success('Se genero y guardo el documento con éxito.');
                            $rootScope.primerVez = false;
                        }
                        $scope.dataGridOptions = {
                            // dataSource: $rootScope.allDcoumets,
                            columnAutoWidth: true,
                            allowColumnResizing: true,
                            bindingOptions: { dataSource: 'dataSource' },
                            filterRow: { visible: true },
                            headerFilter: { visible: true },
                            showBorders: true,
                            // export: { enabled: true, fileName: 'datos', allowExportSelectedData: false },
                            searchPanel: {
                                visible: false,
                                width: 240,
                                placeholder: 'Buscar en todo...'
                            },
                            paging: { pageSize: 50 },
                            // pager: {
                            //     showPageSizeSelector: true,
                            //     allowedPageSizes: [5, 10, 15],
                            //     showInfo: true
                            // },
                            // bindingOptions: { dataSource: 'dataSource' },
                            columns: [
                                { dataField: 'doc_nombre', caption: 'Nombre del documento', cellTemplate: 'nombreDocumento' },
                                // { width: '80', caption: 'Ver Guia', cellTemplate: 'verGuia' },
                                { width: '130', caption: 'Subir Documento', cellTemplate: 'openUpload' },
                                { width: '80', caption: 'Ver', cellTemplate: 'verDocumento' },
                                { dataField: 'est_descripcion', caption: 'Estatus del documento', cellTemplate: 'estatus' },
                                { width: '180', dataField: 'doctoOpcional', caption: 'Tipo de documento', cellTemplate: 'opcional' }
                            ]
                        };
                        // $('#btnBuscar').button('reset');
                        // $("#loadModalCXC").modal("hide");
                        $scope.getOcInitial(res.data[1], res.data[2]);


                        $scope.idClienteExpediente = res.data[4][0].idCliente;
                        $scope.resToken = res.data[5];
                        $scope.expedienteCerrado = res.data[6];
                        $rootScope.folioAMostrar = res.data[7][0].folio;
                    } else {
                        if (res.data[0][0].success === 2) {
                            $rootScope.getDocumentos();
                        } else if (res.data[0][0].success === 3) {
                            $rootScope.getDocumentos();
                        } else {
                            $('#btnBuscar').button('reset');
                            $("#loadModalCXC").modal("hide");
                            $rootScope.cargaDocs = false;
                            alertFactory.error(res.data[1][0].msg);
                        };
                    };
                });
                break;
        };
    };

    $scope.getUnidadFacturada = () => {
        nodoRepository.unidadFacturada($rootScope.dataAutomovil.VEH_NUMSERIE, $rootScope.empresa.idEmpresa, $rootScope.agencia.idSucursal).then((res) => {
            $rootScope.textoUnidadFacturada = res.data[0][0].msg;
            $rootScope.unidadFacturada = res.data[0][0].success;
        });
    };

    $rootScope.getDataByVin = (vin) => {
        $scope.vinCliente = vin;
        $("#loadModalCXC").modal("show");
        $('#masDeUnVin').modal('hide');
        $rootScope.primeraVezCliente = false;
        nodoRepository.getAllDocumentosByVin(vin, $rootScope.empresa.idEmpresa, $rootScope.agencia.idSucursal, $rootScope.tipoProceso, $rootScope.empleado.idPerfil, $rootScope.empleado.idUsuario).then(res => {
            if (res.data[0][0].success == 1) {
                $('#closeMenu').click();
                $rootScope.allDcoumets = res.data[1];
                $rootScope.dataAutomovil = res.data[2][0];
                if ($rootScope.tipoProceso == 1) {
                    $scope.getUnidadFacturada();
                }
                $scope.dataSource = res.data[1];
                if ($rootScope.abriNotas == false) {
                    $rootScope.allDocumentsWS = res.data[2];
                }
                $rootScope.allDocumentsWSRes = res.data[2];
                $scope.dataGridOptions = {
                    // dataSource: $rootScope.allDcoumets,
                    columnAutoWidth: true,
                    allowColumnResizing: true,
                    bindingOptions: { dataSource: 'dataSource' },
                    filterRow: { visible: true },
                    headerFilter: { visible: true },
                    showBorders: true,
                    // export: { enabled: true, fileName: 'datos', allowExportSelectedData: false },
                    searchPanel: {
                        visible: false,
                        width: 240,
                        placeholder: 'Buscar en todo...'
                    },
                    paging: { pageSize: 50 },
                    // pager: {
                    //     showPageSizeSelector: true,
                    //     allowedPageSizes: [5, 10, 15],
                    //     showInfo: true
                    // },
                    // bindingOptions: { dataSource: 'dataSource' },
                    columns: [
                        { dataField: 'doc_nombre', caption: 'Nombre del documento', cellTemplate: 'nombreDocumento' },
                        // { width: '80', caption: 'Ver Guia', cellTemplate: 'verGuia' },
                        { caption: 'Subir Documento', cellTemplate: 'openUpload' },
                        { width: '100', caption: 'Ver', cellTemplate: 'verDocumento' },
                        { dataField: 'est_descripcion', caption: 'Estatus del documento', cellTemplate: 'estatus' },
                        { dataField: 'doctoOpcional', caption: 'Tipo de documento', cellTemplate: 'opcional' }
                    ]
                };
                $rootScope.cargaDocs = true;
                // $('#btnBuscar').button('reset');
                // $("#loadModalCXC").modal("hide");
                $scope.getOcInitial(res.data[1], res.data[2]);
            } else {
                $('#btnBuscar').button('reset');
                $("#loadModalCXC").modal("hide");
                $rootScope.cargaDocs = false;
                alertFactory.error(res.data[1][0].msg);
            };
        });
    }

    $rootScope.verPdfWs = (obj) => {
        $rootScope.abriModal = true;
        $rootScope.arrayDocWs = '';
        $("#loadModalCXC").modal("show");
        if ($rootScope.tipoProceso == 1)
            $("#wsVariousFiles").modal("hide");
        else
            $("#wsFacturasFiles").modal("hide");
        if ($rootScope.documentoWs.id_documento == 24 || $rootScope.documentoWs.id_documento == 28 || $rootScope.documentoWs.id_documento == 29) {
            $rootScope.tituloDocWs = obj.docto;
            $rootScope.documentoWs.doc_nombreCorto = $rootScope.documentoWs.carpetaVarios + '_' + obj.docto;

            /*if ($rootScope.documentoWs.id_documento == 28) {
                obj.serie = 'IA';
                obj.folio = '000020439';
            } else if ($rootScope.documentoWs.id_documento == 29) {
                obj.serie = 'OA';
                obj.folio = '000006708';
            } else if ($rootScope.documentoWs.id_documento == 24) {
                obj.serie = 'BA';
                obj.folio = '000009781';
            }*/

            var objaBuscar = { RFCEMISOR: $rootScope.dataAutomovil.rfc_empresa, RFCRECEPTOR: obj.rfc_cliente, serie: obj.serie, folio: obj.folio };
            $rootScope.ObtieneDocWs('FACTURA', objaBuscar, $rootScope.documentoWs);
        } else if ($rootScope.documentoWs.id_documento == 3) {
            $rootScope.tituloDocWs = obj.folioOrden;
            $rootScope.documentoWs.doc_nombreCorto = $rootScope.documentoWs.carpetaVarios + '_' + obj.folioOrden;
            $rootScope.ObtieneDocWs('OCO', obj.folioOrden, $rootScope.documentoWs);
        }
    }

    $rootScope.consultaNota = (documento) => {
        $("#loadModalCXC").modal("show");
        var sP = 0;
        var s = '';
        var f = '';
        if (documento.id_documento == 28) {
            sP = 1;
            // s = 'IA';
            // f = '000020439';
        } /*else {
            s = 'OA';
            f = '000006708';
        }*/
        nodoRepository.consultaNota($rootScope.dataAutomovil.VEH_NUMSERIE, $rootScope.empresa.idEmpresa, $rootScope.agencia.idSucursal, sP).then((res) => {
            if (res.data[0][0].success == 1) {

                if (res.data[1].length == 1) {
                    $rootScope.tituloDocWs = res.data[1][0].serie + res.data[1][0].folio;
                    documento.doc_nombreCorto = documento.carpetaVarios + '_' + res.data[1][0].serie + res.data[1][0].folio;

                    var objaBuscar = {
                        RFCEMISOR: $rootScope.dataAutomovil.rfc_empresa,
                        RFCRECEPTOR: '',
                        serie: res.data[1][0].serie,//s,//res.data[1][0].serie,
                        folio: res.data[1][0].folio//f//res.data[1][0].folio 
                    };
                    //$("#loadModalCXC").modal("show"); 
                    $rootScope.ObtieneDocWs('FACTURA', objaBuscar, documento);
                } else {
                    $("#loadModalCXC").modal("hide");
                    $rootScope.abriNotas = true;
                    $rootScope.allDocumentsWS = res.data[1];
                    $rootScope.documentoWsRes = res.data[1];
                    $rootScope.documentoWs = documento;
                    $("#wsFacturasFiles").modal("show");
                }

            } else {
                alertFactory.warning('No existe ' + documento.doc_nombre + ' para este Vin');
                $("#loadModalCXC").modal("hide");
            }
        });
    }

    $scope.verPdf = (documento) => {
        $rootScope.showViewAllTenencias = false;
        var pdf = '';
        $rootScope.docUploadUsuario = documento.doc_usuarios;
        $rootScope.observacionesDocuentoViewer = '';
        $rootScope.documentoEnVista = [];
        $rootScope.allDocumentsWS = $rootScope.allDocumentsWSRes;
        $rootScope.abriNotas = false;
        $rootScope.tituloDocWs = '';
        if (documento.id_documento == 3) {
            if ($rootScope.allDocumentsWS.length == 1) {
                $("#loadModalCXC").modal("show");
                $rootScope.tituloDocWs = $rootScope.dataAutomovil.folioOrden;
                documento.doc_nombreCorto = documento.carpetaVarios + '_' + $rootScope.dataAutomovil.folioOrden;
                $rootScope.ObtieneDocWs('OCO', $rootScope.dataAutomovil.folioOrden, documento);
            } else {
                $rootScope.documentoWs = documento
                $("#wsVariousFiles").modal("show");
            }
        }
        else if (documento.id_documento == 24) {
            if ($rootScope.allDocumentsWS.length == 1) {
                $("#loadModalCXC").modal("show");
                if ($rootScope.dataAutomovil.serie == null || $rootScope.dataAutomovil.serie == '' || $rootScope.dataAutomovil.serie == undefined ||
                    $rootScope.dataAutomovil.folio == null || $rootScope.dataAutomovil.folio == '' || $rootScope.dataAutomovil.folio == undefined) {
                    $("#loadModalCXC").modal("hide");
                    alertFactory.warning('La factura aun no se encuentra lista');
                } else {
                    $rootScope.tituloDocWs = $rootScope.dataAutomovil.docto;
                    documento.doc_nombreCorto = documento.carpetaVarios + '_' + $rootScope.dataAutomovil.docto;
                    var objaBuscar = {
                        RFCEMISOR: $rootScope.dataAutomovil.rfc_empresa,
                        RFCRECEPTOR: $rootScope.dataAutomovil.rfc_cliente,
                        serie: $rootScope.dataAutomovil.serie, //'BA',// $rootScope.dataAutomovil.serie,
                        folio: $rootScope.dataAutomovil.folio //'000009781'//$rootScope.dataAutomovil.folio
                    };
                    $rootScope.ObtieneDocWs('FACTURA', objaBuscar, documento);
                }
            } else {
                $rootScope.documentoWs = documento
                $("#wsFacturasFiles").modal("show");
            }
        }
        else if (documento.id_documento == 28 || documento.id_documento == 29) {
            $rootScope.consultaNota(documento);
        } else if (documento.id_documento == 30 && documento.doc_usuarios == 0) {
            $rootScope.getFacturasAccesorios();
        } else if (documento.id_documento == 26 && documento.doc_usuarios == 0) {
            $rootScope.allRecibos();
        } else if (documento.id_documento == 48) {
            $rootScope.showAllComprobantes(false);
        } else if ((documento.id_documento == 1 || documento.id_documento == 2) && documento.existe == 0) {
            alertFactory.warning('Interlimotor aun no proporciona el documento');
        } else if (documento.doc_varios == 0) {
            $rootScope.observacionesDocuentoViewer = documento.observacionesDocumento;
            $rootScope.idDocumentoGuardadoViewer = 0;
            $('#pdfReferenceContent object').remove();
            $rootScope.modalTitle = documento.doc_nombre;
            if ($rootScope.allPermisosDocumentos.DescargarPdf == 1) {
                pdf = `${documento.rutaGet}`;
            } else {
                pdf = `${documento.rutaGet}?page=hsn#toolbar=0`;
            };
            $("<object class='lineaCaptura' data='" + pdf + "' width='100%' height='480px'>").appendTo('#pdfReferenceContent');
            $rootScope.idDocumentoGuardadoViewer = documento.id_documentoGuardado;
            $rootScope.estatusDocumentoViewer = documento.id_estatus;
            $rootScope.estatusDocumentoViewerEnlace = documento.estatusEnlace;
            $("#mostrarPdf").modal("show");
        } else {
            if (documento.id_documento == 9) {
                $("#loadModalCXC").modal("show");
                $rootScope.documentoEnVista = documento;
                nodoRepository.allTenenciasObligatorias(documento.idExpediente).then((res) => {
                    $rootScope.allTenenciasObligatorias = res.data[0];
                    $rootScope.allYearsTenencias = res.data[1];
                    nodoRepository.documentosVariosShow(documento.id_documento, documento.idExpediente, documento.id_proceso).then((res) => {
                        $rootScope.modalTitle = documento.doc_nombre;
                        $rootScope.showAllDocumentsVarios = res.data;
                        $rootScope.showViewAllTenencias = true;
                        $("#loadModalCXC").modal("hide");
                        $("#showVariousFiles").modal("show");
                    });
                });
            } else {
                $rootScope.documentoEnVista = documento;
                nodoRepository.documentosVariosShow(documento.id_documento, documento.idExpediente, documento.id_proceso).then((res) => {
                    $rootScope.modalTitle = documento.doc_nombre;
                    $rootScope.showAllDocumentsVarios = res.data;
                    $("#showVariousFiles").modal("show");
                });
            };
        };
    };

    $rootScope.showImg = (documento) => {
        var pdf = '';
        $rootScope.idDocumentoGuardadoViewer = 0;
        $rootScope.estatusDocumentoViewer = 0;
        $rootScope.estatusDocumentoViewerEnlace = 0;
        $rootScope.observacionesDocuentoViewer = documento.observacionesDocumento;
        $('#pdfReferenceContentVarios object').remove();
        $rootScope.modalTitle = $rootScope.documentoEnVista.doc_nombre;
        if ($rootScope.allPermisosDocumentos.DescargarPdf == 1) {
            pdf = documento.ruta; //Se agrega para ocultar el de descarga
        } else {
            pdf = `${documento.ruta}?page=hsn#toolbar=0`; //Se agrega para ocultar el de descarga
        }
        $("<object class='lineaCaptura' data='" + pdf + "' width='100%' height='480px'>").appendTo('#pdfReferenceContentVarios');
        $rootScope.idDocumentoGuardadoViewer = documento.id_documentoGuardado;
        $rootScope.estatusDocumentoViewer = documento.id_estatus;
        $rootScope.estatusDocumentoViewerEnlace = documento.estatusEnlace;
        $("#showVariousFiles").modal("hide");
        setTimeout(() => {
            $("#pdfMasUno").modal("show");
        }, 500);
    };

    $rootScope.closeModalVariosImg = () => {
        $("#pdfMasUno").modal("hide");
        $scope.verPdf($rootScope.documentoEnVista);
    };

    $rootScope.aprobarRechazarDocumento = (id_estatus) => {
        $("#mostrarPdf").modal("hide");
        $("#pdfMasUno").modal("hide");
        $("#loadModalCXC").modal("show");

        let observaciones = ''
        if (id_estatus == 3) {
            observaciones = $rootScope.razonesRechazo;
        }

        if (id_estatus == 3 && observaciones == '') {
            $("#loadModalCXC").modal("hide");
            alertFactory.warning('Debe especificar el por que del rechazo del documento.');
        } else {
            $("#rechazarDocumento").modal("hide");
            nodoRepository.updateEstatusDocumento($rootScope.idDocumentoGuardadoViewer, id_estatus, observaciones, $rootScope.empleado.idUsuario, $rootScope.tipoProceso).then((res) => {
                if (res.data[0].success == 1) {
                    if (id_estatus == 2) {
                        $("#loadModalCXC").modal("hide");
                        alertFactory.success('Se aprobo el documento con éxito.');
                        $rootScope.getDocumentos();
                    } else {
                        $("#loadModalCXC").modal("hide");
                        alertFactory.success('Se rechazo el documento con éxito.');
                        $rootScope.getDocumentos();
                    };
                } else {
                    alertFactory.error('Error al completar la operación, favor de contactar al administrador.')
                }
            });
        };
    };

    $rootScope.openModalRechazar = () => {
        $rootScope.razonesRechazo = '';
        $("#mostrarPdf").modal("hide");
        $("#pdfMasUno").modal("hide");
        $("#rechazarDocumento").modal("show");
    };

    $rootScope.cancelRechazo = () => {
        $("#rechazarDocumento").modal("hide");
    }

    $rootScope.openUploadModal = (index) => {
        $rootScope.nombreArchivo = '';
        $rootScope.idDocumentoUpload = index;
        $rootScope.tenenciaDosMilVeintiuno = 0;
        $rootScope.allDcoumets.forEach((value, key) => {
            if (value.id_documento == index) {
                $rootScope.docSave = key;
            };
        });

        if ($rootScope.allDcoumets[$rootScope.docSave].id_documento == 9) {
            $rootScope.docGubernamental = false;
            $rootScope.yearSelect = '';
            $rootScope.checksYears = [];
            $rootScope.amparoAllTenencias = '';
            nodoRepository.allTenenciasObligatorias($rootScope.allDcoumets[$rootScope.docSave].idExpediente).then((res) => {
                $rootScope.allTenenciasObligatorias = res.data[0];
                $rootScope.allYearsTenencias = res.data[1];
                nodoRepository.getDocumentosVarios($rootScope.allDcoumets[$rootScope.docSave].id_documento, $rootScope.allDcoumets[$rootScope.docSave].idExpediente, $rootScope.tipoProceso).then((res) => {
                    if (res.data.length == 0) {
                        $rootScope.titleModal = `Cargar nuevo documento "${$rootScope.allDcoumets[$rootScope.docSave].doc_nombre}"`;
                        $rootScope.tipoCargaDocumento = 0;
                        $('#modalTenencias').modal('show');
                    } else {
                        $rootScope.remplazarDocumento = false;
                        $rootScope.allDocumentsVarios = res.data;
                        $("#updateVariousFiles").modal("show");
                        $rootScope.titleDocumentosVarios = $rootScope.allDcoumets[$rootScope.docSave].doc_nombre;
                    }
                });
            });
        } else {
            $rootScope.remplazarDocumento = false;
            if ($rootScope.allDcoumets[$rootScope.docSave].doc_varios == 0) {
                $rootScope.nombreArchivo = `${$rootScope.allDcoumets[$rootScope.docSave].doc_nombreCorto}`;
                if ($rootScope.allDcoumets[$rootScope.docSave].id_documentoGuardado == null) {
                    $("#uploadFiles").modal("show");
                    $rootScope.titleModal = `Cargar nuevo documento "${$rootScope.allDcoumets[$rootScope.docSave].doc_nombre}"`
                    $rootScope.tipoCargaDocumento = 0;
                } else {

                    $rootScope.titleModal = `Actualizar documento "${$rootScope.allDcoumets[$rootScope.docSave].doc_nombre}"`;
                    $rootScope.tipoCargaDocumento = 1;
                    $("#uploadFiles").modal("show");
                }
            } else {
                $("#loadModalCXC").modal("show");
                nodoRepository.getDocumentosVarios($rootScope.allDcoumets[$rootScope.docSave].id_documento, $rootScope.allDcoumets[$rootScope.docSave].idExpediente, $rootScope.tipoProceso).then((res) => {
                    $("#loadModalCXC").modal("hide");
                    if (res.data.length == 0) {
                        $rootScope.nombreArchivo = `${$rootScope.allDcoumets[$rootScope.docSave].doc_nombreCorto}_1`;
                        $("#uploadFiles").modal("show");
                        $rootScope.titleModal = `Cargar nuevo documento "${$rootScope.allDcoumets[$rootScope.docSave].doc_nombre}"`;
                        $rootScope.tipoCargaDocumento = 0;
                    } else {
                        $rootScope.remplazarDocumento = false;
                        $rootScope.allDocumentsVarios = res.data;
                        $("#updateVariousFiles").modal("show");
                        $rootScope.titleDocumentosVarios = $rootScope.allDcoumets[$rootScope.docSave].doc_nombre;
                    }
                });
            };
        };
    };

    $rootScope.nuevoVarios = () => {
        if ($rootScope.allDcoumets[$rootScope.docSave].id_documento == 9) {
            $rootScope.nombreArchivo = '';
            $rootScope.tipoCargaDocumento = 0;
            $rootScope.titleModal = `Cargar nuevo documento "${$rootScope.allDcoumets[$rootScope.docSave].doc_nombre}"`;
            $("#updateVariousFiles").modal("hide");
            setTimeout(() => {
                $('#modalTenencias').modal('show');
            }, 200);
        } else {
            $rootScope.nombreArchivo = `${$rootScope.allDcoumets[$rootScope.docSave].doc_nombreCorto}_${$rootScope.allDocumentsVarios.length + 1}`;
            $("#updateVariousFiles").modal("hide");
            $("#uploadFiles").modal("show");
            $rootScope.titleModal = `Cargar nuevo documento "${$rootScope.allDcoumets[$rootScope.docSave].doc_nombre}"`;
            $rootScope.tipoCargaDocumento = 0;
        };
    };

    $rootScope.showRemplazarDocumentos = (documento) => {
        $rootScope.nombreArchivoRemplaza = '';
        $rootScope.variosDocumentoRemplaza = [];
        $rootScope.remplazarDocumento = false;
        $rootScope.nombreArchivoRemplaza = documento.nombreDocumento.split('.')[0];
        $rootScope.variosDocumentoRemplaza = documento;
        $rootScope.remplazarDocumento = true;
    };

    $rootScope.cancelarSaveDoc = () => {
        $('#uploadFiles').modal('hide');
        $('#updateVariousFiles').modal('hide');
        angular.element("input[type='file']").val(null);
    }

    $rootScope.remplazarDocumentoVarios = () => {
        $("#updateVariousFiles").modal("hide");
        $("#loadModalCXC").modal("show");
        var dataDoc = {
            idUsuario: $rootScope.empleado.idUsuario,
            nombreDocumento: `${$rootScope.nombreArchivoRemplaza}.${$rootScope.allDcoumets[$rootScope.docSave].doc_extencion}`,
            idDocumento: $rootScope.allDcoumets[$rootScope.docSave].id_documento,
            archivo: $rootScope.allDcoumets[$rootScope.docSave].archivo.archivo.split(';base64,').pop(),
            rutaSave: $rootScope.allDcoumets[$rootScope.docSave].rutaSave,
            idExpediente: $rootScope.allDcoumets[$rootScope.docSave].idExpediente,
            idProceso: $rootScope.tipoProceso,
            doc_varios: $rootScope.allDcoumets[$rootScope.docSave].doc_varios,
            proceso: $rootScope.allDcoumets[$rootScope.docSave].proceso,
            carpetaVarios: $rootScope.allDcoumets[$rootScope.docSave].carpetaVarios,
            nombreAntiguo: $rootScope.variosDocumentoRemplaza.nombreDocumento,
            idDocumentoGuardado: $rootScope.variosDocumentoRemplaza.id_documentoGuardado
        };

        nodoRepository.actualizarDocumentos(dataDoc).then((res) => {
            $rootScope.remplazarDocumento = false;
            if (res.data[0].success == 1) {
                $rootScope.getDocumentos();
                $("#loadModalCXC").modal("hide");
                alertFactory.success('Se actualizó con éxito el documento.');
            } else {
                $("#loadModalCXC").modal("hide");
                alertFactory.success('No actualizó documento, favor de contactar al administrador.');
            }
        });
    };

    $rootScope.guardarDoc = () => {
        if ($rootScope.allDcoumets[$rootScope.docSave].archivo == undefined) {
            alertFactory.warning('Debe seleccionar el documento.');
        } else {
            if ($rootScope.nombreArchivo == '') {
                alertFactory.warning('Ingrese el nombre del documento.');
            } else {
                $("#uploadFiles").modal("hide");
                $("#loadModalCXC").modal("show");
                if ($rootScope.tipoCargaDocumento == 0) {
                    var dataDoc = {
                        idUsuario: $rootScope.empleado.idUsuario,
                        nombreDocumento: `${$rootScope.nombreArchivo}.${$rootScope.allDcoumets[$rootScope.docSave].doc_extencion}`,
                        idDocumento: $rootScope.allDcoumets[$rootScope.docSave].id_documento,
                        archivo: $rootScope.allDcoumets[$rootScope.docSave].archivo.archivo.split(';base64,').pop(),
                        rutaSave: $rootScope.allDcoumets[$rootScope.docSave].rutaSave,
                        idExpediente: $rootScope.allDcoumets[$rootScope.docSave].idExpediente,
                        idProceso: $rootScope.tipoProceso,
                        doc_varios: $rootScope.allDcoumets[$rootScope.docSave].doc_varios,
                        proceso: $rootScope.allDcoumets[$rootScope.docSave].proceso,
                        carpetaVarios: $rootScope.allDcoumets[$rootScope.docSave].carpetaVarios,
                        tenenciaDosMilVeintiuno: $rootScope.tenenciaDosMilVeintiuno
                    };
                    nodoRepository.saveDocumentos(dataDoc).then((res) => {
                        if (res.data[0][0].success == 1) {
                            if ($rootScope.docGubernamental) {
                                nodoRepository.updateTenenciasDocGubernamental($rootScope.allDcoumets[$rootScope.docSave].idExpediente, $rootScope.checksYears).then((resGubernamental) => {
                                    if (resGubernamental.data[0].success == 1) {
                                        $("#loadModalCXC").modal("hide");
                                        $rootScope.getDocumentos();
                                        alertFactory.success('Se guardo el documento con éxito.');
                                    } else {
                                        $("#loadModalCXC").modal("hide");
                                        $rootScope.getDocumentos();
                                        alertFactory.success('Error al guardar el documento.');
                                    };
                                });
                            } else {
                                $("#loadModalCXC").modal("hide");
                                $rootScope.getDocumentos();
                                alertFactory.success('Se guardo el documento con éxito.');
                            };
                        } else {
                            $("#loadModalCXC").modal("hide");
                            alertFactory.warning('Error al guardar el documento, favor de contactar al administrador.');
                        };
                    });
                } else {
                    var dataDoc = {
                        idUsuario: $rootScope.empleado.idUsuario,
                        nombreDocumento: `${$rootScope.nombreArchivo}.${$rootScope.allDcoumets[$rootScope.docSave].doc_extencion}`,
                        idDocumento: $rootScope.allDcoumets[$rootScope.docSave].id_documento,
                        archivo: $rootScope.allDcoumets[$rootScope.docSave].archivo.archivo.split(';base64,').pop(),
                        rutaSave: $rootScope.allDcoumets[$rootScope.docSave].rutaSave,
                        idExpediente: $rootScope.allDcoumets[$rootScope.docSave].idExpediente,
                        idProceso: $rootScope.tipoProceso,
                        doc_varios: $rootScope.allDcoumets[$rootScope.docSave].doc_varios,
                        proceso: $rootScope.allDcoumets[$rootScope.docSave].proceso,
                        carpetaVarios: $rootScope.allDcoumets[$rootScope.docSave].carpetaVarios,
                        nombreAntiguo: $rootScope.allDcoumets[$rootScope.docSave].nombreActual,
                        idDocumentoGuardado: $rootScope.allDcoumets[$rootScope.docSave].id_documentoGuardado
                    };
                    nodoRepository.actualizarDocumentos(dataDoc).then((res) => {
                        if (res.data[0].success == 1) {
                            $rootScope.getDocumentos();
                            $("#loadModalCXC").modal("hide");
                            alertFactory.success('Se actualizó con éxito el documento.');
                        } else {
                            $("#loadModalCXC").modal("hide");
                            alertFactory.success('No actualizó documento, favor de contactar al administrador.');
                        }
                    });
                };
            };
        };
    };

    $rootScope.generarReporteIndividual = () => {
        $rootScope.nombreReporte = '';
        $rootScope.titleReporte = '';
        $("#loadModalCXC").modal("show");
        nodoRepository.getReporteIndividual($rootScope.dataAutomovil.VEH_NUMSERIE, $rootScope.empresa.idEmpresa, $rootScope.agencia.idSucursal, $rootScope.tipoProceso).then((res) => {
            $("#loadModalCXC").modal("hide");
            if (res.data[0][0].success == 1) {
                $rootScope.contenidoReporte = {
                    "contenido": res.data[1]
                };
                $rootScope.titleReporte = `Reporte de documento VIN ${$rootScope.dataAutomovil.VEH_NUMSERIE}`;
                if ($rootScope.tipoProceso == 1) {
                    $rootScope.nombreReporte = `Reporte de documento CXP VIN ${$rootScope.dataAutomovil.VEH_NUMSERIE}`;
                    $rootScope.matrizCXP.data = res.data[1];
                    $("#reporteExcelCXP").modal('show');
                } else {
                    $rootScope.nombreReporte = `Reporte de documento CXC VIN ${$rootScope.dataAutomovil.VEH_NUMSERIE}`;
                    $rootScope.matrizCXC.data = res.data[1];
                    $("#reporteExcelCXC").modal('show');
                };
            } else {
                alertFactory.error('No se genero el reporte, favor de contactar al administrador');
            };
        });
    };

    $rootScope.matrizExcelGeneral = () => {
        $("#loadModalCXC").modal("show");
        if ($rootScope.empresa == null || $rootScope.agencia == null || $rootScope.tipoProceso == null) {
            $("#loadModalCXC").modal("hide");
            alertFactory.warning('Para generar el reporte debes proporcionar "Proceso, Empresa y Sucursal"');
        } else {
            var fecha1 = ($scope.dt1 == null ? null : $scope.dt1.format("dd/mm/yyyy"));
            var fecha2 = ($scope.dt2 == null ? null : $scope.dt2.format("dd/mm/yyyy"));

            if (fecha1 == null || fecha2 == null) {
                $("#loadModalCXC").modal("hide");
                alertFactory.warning('Para generar el reporte debes proporcionar el rango de fechas');
            } else {
                nodoRepository.getReporteGeneral(fecha1, fecha2, $rootScope.tipoProceso, $rootScope.empresa.idEmpresa, $rootScope.agencia.idSucursal).then((res) => {
                    $("#loadModalCXC").modal("hide");
                    if (res.data.length > 0) {
                        $rootScope.titleReporte = `Reporte de documento VIN ${$rootScope.dataAutomovil.VEH_NUMSERIE}`;
                        $rootScope.contenidoReporte = {
                            "contenido": res.data[0]
                        };
                        if ($rootScope.tipoProceso == 1) {
                            $rootScope.nombreReporte = `Reporte de documento CXP Empresa ${$rootScope.empresa.nombre} Sucursal ${$rootScope.agencia.nombre}`;
                            $rootScope.titleReporte = `Reporte de documento CXP Empresa ${$rootScope.empresa.nombre} Sucursal ${$rootScope.agencia.nombre}`;
                            $rootScope.matrizCXP.data = res.data[0];
                            $("#reporteExcelCXP").modal('show');
                        } else {
                            $rootScope.nombreReporte = `Reporte de documento CXC Empresa ${$rootScope.empresa.nombre} Sucursal ${$rootScope.agencia.nombre}`;
                            $rootScope.titleReporte = `Reporte de documento CXC Empresa ${$rootScope.empresa.nombre} Sucursal ${$rootScope.agencia.nombre}`;
                            $rootScope.matrizCXC.data = res.data[0];
                            $("#reporteExcelCXC").modal('show');
                        };
                    } else {
                        $("#loadModalCXC").modal("hide");
                        alertFactory.error('No se encontraron datos, favor de contactar al administrador.');
                    }
                });
            };
        };
    };

    $rootScope.export = function () {
        $("#loadModalCXC").modal("show");
        let nombreExcel = '';
        if ($rootScope.tipoProceso == 1) {
            nombreExcel = 'Expediente_MatrizCXPSM';
            $("#reporteExcelCXP").modal('hide');
        } else {
            nombreExcel = 'Expediente_MatrizCXC_SM';
            $("#reporteExcelCXC").modal('hide');
        };
        searchRepository.getExcelExpediente($rootScope.contenidoReporte, nombreExcel).then(function success(res) {
            var file = new Blob([res.data], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64," });
            var a = document.createElement("a");
            a.href = URL.createObjectURL(file);
            a.download = $rootScope.nombreReporte;
            a.click();
            if ($rootScope.tipoProceso == 1) {
                $("#reporteExcelCXP").modal('show');
            } else {
                $("#reporteExcelCXC").modal('show');
            };
            $("#loadModalCXC").modal("hide");
        }, function error(err) {
            error(err);
        });
    };

    $rootScope.matrizCXP = {
        enableSelectAll: false,
        selectionRowHeaderWidth: 35,
        rowHeight: 23,
        showGridFooter: true,
        enableFiltering: true,
        paginationPageSizes: [5, 10, 25],
        paginationPageSize: 5,
        rowTemplate: '<div> <div ng-repeat="(colRenderIndex, col) in colContainer.renderedColumns track by col.uid" class="ui-grid-cell" ui-grid-cell></div></div>'
    };

    $rootScope.matrizCXP.columnDefs = [
        { name: 'sucursal', displayName: 'Sucursal', width: 250 },
        { name: 'vin', displayName: 'Vin del auto', width: 250 },
        { name: 'nombreCliente', displayName: 'Cliente', width: 250 },
        { name: 'AvaluoAutorizadoporIntelimotors', displayName: 'Avaluo Autorizado por Intelimotors', width: 250 },
        { name: 'ConsultaTransunion', displayName: 'Consulta Transunion', width: 250 },
        { name: 'Ordendecompra', displayName: 'Orden de compra', width: 250 },
        { name: 'ContratoCompraVentadeVehiculosAutomotores', displayName: 'Contrato Compra Venta de Vehiculos Automotores (ANEXO 4)', width: 250 },
        { name: 'FacturadeOrigen', displayName: 'Factura de Origen (PDF y XLM)', width: 250 },
        { name: 'Facturaemitidaanombredeladistribuidora', displayName: 'Factura emitida a nombre de la distribuidora', width: 250 },
        { name: 'FacturasAnteriores', displayName: 'Facturas Anteriores', width: 250 },
        { name: 'ContratodeCompraVenta', displayName: 'Contrato de Compra-Venta que acredite la propiedad del vehículo seminuevo  (sólo personas Físicas sin actividad empresarial)', width: 250 },
        { name: 'TenenciasOriginales', displayName: 'Tenencias Originales (Deben llevar certificación de caja y sello o el baucher correspondiente, según sea el caso)', width: 250 },
        { name: 'TarjetadeCirculacion', displayName: 'Tarjeta de Circulación a nombre del propietario actual original número', width: 250 },
        { name: 'ComprobantedeBajadePlacasoPlacasdeCirculacion', displayName: 'Comprobante de Baja de Placas y/o Placas de Circulación (Agencia) (Opcional)', width: 250 },
        { name: 'OriginalCertificadodeVerificacionVehicularFolio', displayName: 'Original Certificado de Verificación Vehicular Folio', width: 250 },
        { name: 'CopiadeIdentificacionOficial', displayName: 'Copia de Identificación Oficial cotejada por el Gerente de Seminuevos con firma (INE, Pasaporte, Cedula Profesional)', width: 250 },
        { name: 'RegistroFederaldeCausantes', displayName: 'Registro Federal de Causantes (cuando aplique)', width: 250 },
        { name: 'ComprobantedeDomicilio', displayName: 'Comprobante de Domicilio no mayor a 3 meses', width: 250 },
        { name: 'CURP', displayName: 'C.U.R.P', width: 250 },
        { name: 'EstadodeCuentaanombredeltitulardelaunidad', displayName: 'Estado de Cuenta a nombre del titular de la unidad de los ultimos 3 meses (En caso de que aplique devolución)', width: 250 },
        { name: 'ActaConstituvainscritaenRPP', displayName: 'Acta Constituva inscrita en RPP (Solo personas morales)', width: 250 },
        { name: 'PoderRepresentanteconactadedominio', displayName: 'Poder Representante con acta de dominio', width: 250 },
        { name: 'IdentificacionoficialdelRepresentenateLegal', displayName: 'Identificación oficial del Representenate Legal (INE, PASAPORTE, Cédula Profesional)', width: 250 },
        { name: 'CartaautorizacionparaAutofacturacion', displayName: 'Carta autorización para Auto facturación', width: 250 },
        { name: 'Autofacturacion', displayName: 'Auto facturación o en su caso el acuse de recepción  emitida por el SAT', width: 250 },
        { name: 'PagodeTenencias', displayName: 'Pago de Tenencias (Consulta en la página del gobierno del estado del cual proceden las placas)', width: 250 }
    ];

    $rootScope.matrizCXC = {
        enableSelectAll: false,
        selectionRowHeaderWidth: 35,
        rowHeight: 23,
        showGridFooter: true,
        enableFiltering: true,
        paginationPageSizes: [5, 10, 25],
        paginationPageSize: 5,
        rowTemplate: '<div> <div ng-repeat="(colRenderIndex, col) in colContainer.renderedColumns track by col.uid" class="ui-grid-cell" ui-grid-cell></div></div>'
    };

    $rootScope.matrizCXC.columnDefs = [
        { name: 'sucursal', displayName: 'Sucursal', width: 250 },
        { name: 'vin', displayName: 'Vin del auto', width: 250 },
        { name: 'nombreCliente', displayName: 'Cliente', width: 250 },
        { name: 'Facturadeunidadseminueva', displayName: 'Factura de unidad seminueva', width: 250 },
        { name: 'PedidooriginalBproyDigitalizacion', displayName: 'Pedido original Bpro y Digitalización', width: 250 },
        { name: 'Recibosdepago', displayName: 'Recibos de pago', width: 250 },
        { name: 'Documentossoportesderecibosdecaja', displayName: 'Documentos soportes de recibos de caja', width: 250 },
        { name: 'NotasdeCargo', displayName: 'Notas de Cargo', width: 250 },
        { name: 'NotasdeCredito', displayName: 'Notas de Crédito', width: 250 },
        { name: 'FacturasdeAccesorios', displayName: 'Facturas de Accesorios', width: 250 },
        { name: 'CaratulaPolizadeseguro', displayName: 'Carátula Póliza de seguro (si Aplica)', width: 250 },
        { name: 'RFC', displayName: 'RFC', width: 250 },
        { name: 'IdentificacionOficialVigente', displayName: 'Identificación Oficial Vigente / (cotejada página INE)', width: 250 },
        { name: 'Comprobantededomiciliovigente', displayName: 'Comprobante de domicilio vigente', width: 250 },
        { name: 'Autorizaciondelafinancieracorridadeautorizacion', displayName: 'Autorización de la financiera, corrida de autorización', width: 250 },
        { name: 'Actaconstitutiva', displayName: 'Acta constitutiva', width: 250 },
        { name: 'Poderderepresentantelegal', displayName: 'Poder de representante legal', width: 250 },
        { name: 'Salidadeunidad', displayName: 'Salida de unidad', width: 250 },
        { name: 'CONTRATODECOMPRAVENTA', displayName: 'CONTRATO DE COMPRAVENTA (Incluye contrato de Adhesión y Responsiva)', width: 250 },
        { name: 'FormatodeIdentificaciondePLD', displayName: 'Formato de Identificación de PLD', width: 250 },
        { name: 'Polizadegarantia', displayName: 'Póliza de garantía', width: 250 },
        { name: 'Recibodeunidad', displayName: 'Recibo de unidad', width: 250 },
        { name: 'CartaFactura', displayName: 'Carta Factura', width: 250 },
        { name: 'Certificadodeunidadgarantizada', displayName: 'Certificado de unidad garantizada', width: 250 },
        { name: 'Copiadelengomadodelasplacasydelatarjetadecirculacion', displayName: 'Copia del engomado, de las placas y de la tarjeta de circulación. (Obligatorio en caso de que el domicilio sea dentro de la CDMX)', width: 250 },
        { name: 'AvisodePrivacidad', displayName: 'Aviso de Privacidad', width: 250 },
        { name: 'Copiadecaratuladelcontratoconlafinanciera', displayName: 'Copia de carátula del contrato con la financiera y hoja de desembolso', width: 250 }
    ];

    $scope.showCarouselUnidad = () => {
        $("#loadModalCXC").modal("show");
        nodoRepository.consultaImagenesCarrusel($rootScope.dataAutomovil.VEH_NUMSERIE, $rootScope.empresa.idEmpresa, $rootScope.agencia.idSucursal).then((res) => {
            $rootScope.slides = [];
            try {
                if (res.data[0].data.length > 0) {
                    if (res.data[0].data.length > 0) {
                        if (res.data[0].data[0].listingInfo.pictures.length > 0) {
                            res.data[0].data[0].listingInfo.pictures.forEach((value, key) => {
                                $rootScope.slides.push({ image: value });
                            });
                            setTimeout(() => {
                                $(".aaaa div:first-child").addClass("active");
                                $("#loadModalCXC").modal("hide");
                                $("#carouselUnidad").modal("show");
                                $rootScope.myInterval = 3000;
                            }, 1000);
                        } else {
                            alertFactory.warning('Unidad sin imagenes');
                            $("#loadModalCXC").modal("hide");
                        };
                    } else {
                        alertFactory.warning('El servicio no esta disponible por el momento');
                        $("#loadModalCXC").modal("hide");
                    };
                } else {
                    alertFactory.warning('El servicio no esta disponible por el momento');
                    $("#loadModalCXC").modal("hide");
                };
            } catch (error) {
                alertFactory.warning('El servicio no esta disponible por el momento ' + error);
                $("#loadModalCXC").modal("hide");
            };
        });
    };

    $rootScope.ObtieneDocWs = (tipo, aBuscar, documento) => {
        if ($rootScope.allDocumentsWS.length == 1) {
            if (documento.existe == 0) {
                $rootScope.servicioWs(tipo, aBuscar, documento);
            } else {
                $rootScope.rutaGetWs = documento.doc_varios == 1 ? `${documento.rutaGet}//${documento.doc_nombreCorto}.${documento.doc_extencion}` : documento.rutaGet;
                $rootScope.muestraDocWS(documento);
            }
        }
        else {
            $rootScope.servicioWs(tipo, aBuscar, documento);
        }
    };

    $rootScope.servicioWs = (tipo, aBuscar, documento) => {
        var ruta = `${documento.rutaSave}${documento.idExpediente}\\\\${documento.proceso}\\\\${documento.carpetaVarios}\\\\${documento.doc_nombreCorto}.${documento.doc_extencion}`
        nodoRepository.getDocumentoWS(tipo, aBuscar, ruta).then((d) => {
            $('#pdfReferenceContent object').remove();
            if (d.data[0].success == 1) {
                if (d.data[0].existe == 0) {
                    if (tipo != 'FACTURA') {
                        $rootScope.arrayDocWs = d.data[0].arrayBits.GenerarPdfResult;
                        $rootScope.guardarDocWS(documento);
                    } else {
                        $rootScope.arrayDocWs = d.data[0].arrayBits.MuestraFacturaResult.pdf;
                        if (d.data[0].arrayBits.MuestraFacturaResult.pdf == null || d.data[0].arrayBits.MuestraFacturaResult.pdf == undefined || d.data[0].arrayBits.MuestraFacturaResult.pdf == '') {
                            alertFactory.warning('La factura aun no esta lista.');
                            $("#loadModalCXC").modal("hide");
                        } else {
                            $rootScope.guardarDocWS(documento);
                        };
                    };

                } else {
                    $rootScope.muestraDocWS(documento);
                }
            } else {
                alertFactory.warning(d.data[0].arrayBits);
                $rootScope.abriModal = false;
                $("#loadModalCXC").modal("hide");
            }
        });
    }

    $rootScope.muestraDocWS = (documento) => {
        var pdf = '';
        $('#pdfReferenceContent object').remove();
        $rootScope.modalTitle = documento.doc_nombre + ' ' + $rootScope.tituloDocWs;
        if (documento.rutaGet == null) { documento.rutaGet = $scope.dataSource.find(x => x.id_documento === documento.id_documento).rutaGet; }
        $rootScope.rutaGetWs = documento.doc_varios == 1 ? `${documento.rutaGet}//${documento.doc_nombreCorto}.${documento.doc_extencion}` : documento.rutaGet;
        if ($rootScope.allPermisosDocumentos.DescargarPdf == 1) {
            pdf = `${$rootScope.rutaGetWs}`;
        } else {
            pdf = `${$rootScope.rutaGetWs}?page=hsn#toolbar=0`;
        };
        $("<object class='lineaCaptura' data='" + pdf + "' width='100%' height='480px'>").appendTo('#pdfReferenceContent');
        $rootScope.idDocumentoGuardadoViewer = documento.id_documentoGuardado;
        $rootScope.estatusDocumentoViewer = documento.id_estatus;
        $rootScope.estatusDocumentoViewerEnlace = documento.estatusEnlace;
        $("#loadModalCXC").modal("hide");
        $("#mostrarPdf").modal("show");
    }



    $rootScope.guardarDocWS = (documento) => {
        $rootScope.documentoObjver = '';
        if ($rootScope.tipoCargaDocumento == 0) {
            var dataDoc = {
                idUsuario: $rootScope.empleado.idUsuario,
                nombreDocumento: `${documento.doc_nombreCorto}.${documento.doc_extencion}`,
                idDocumento: documento.id_documento,
                archivo: $rootScope.arrayDocWs,
                rutaSave: documento.rutaSave,
                idExpediente: documento.idExpediente,
                idProceso: documento.proceso == 'CXP' ? 1 : 2,
                doc_varios: documento.doc_varios,
                proceso: documento.proceso,
                carpetaVarios: documento.carpetaVarios
            };
            nodoRepository.saveDocumentos(dataDoc).then((res) => {
                if (res.data[0][0].success == 1) {
                    $rootScope.documentoObjver = documento;
                    $rootScope.primerVez = true;
                    $rootScope.getDocumentos();
                } else {
                    $rootScope.abriModal = false;
                    $("#loadModalCXC").modal("hide");
                    alertFactory.warning('Servicio no disponible por el monento, favor de contactar al administrador.');
                }
            });
        }
    };

    $('#mostrarPdf').on('show.bs.modal', function (e) {
        if ($rootScope.abriModal == true) {
            if ($rootScope.tipoProceso == 1)
                $("#wsVariousFiles").modal("hide");
            else
                $("#wsFacturasFiles").modal("hide");
        }
    });

    $('#mostrarPdf').on('hide.bs.modal', function (e) {
        if ($rootScope.abriModal == true) {
            if ($rootScope.tipoProceso == 1)
                $("#wsVariousFiles").modal("show");
            else
                $("#wsFacturasFiles").modal("show");
        }
        $rootScope.abriModal = false;
    });

    $rootScope.atras = () => {
        for (a = 0; a < $rootScope.slides.length; a++) {
            if ($("#it" + a).hasClass("active")) {
                $("#it" + a).removeClass("active");
                var actual = 0;
                if (a == 0) {
                    actual = $rootScope.slides.length - 1;
                } else {
                    actual = a - 1;
                }
                $("#it" + actual).addClass("active");
                a = $rootScope.slides.length + 1;
            } else {
                $("#it" + a).removeClass("active");
            }
        }
    };

    $rootScope.siguiente = () => {
        for (a = 0; a < $rootScope.slides.length; a++) {
            if ($("#it" + a).hasClass("active")) {
                $("#it" + a).removeClass("active");
                var actual = 0;
                if (a == $rootScope.slides.length - 1) {
                    actual = 0;
                } else {
                    actual = a + 1;
                }

                $("#it" + actual).addClass("active");
                a = $rootScope.slides.length + 1;
            } else {
                $("#it" + a).removeClass("active");
            }
        }
    };

    $rootScope.matrizExcelGeneralGA = () => {
        var fecha1 = ($scope.dt1 == null ? null : $scope.dt1.format("dd/mm/yyyy"));
        var fecha2 = ($scope.dt2 == null ? null : $scope.dt2.format("dd/mm/yyyy"));

        if (fecha1 == null || fecha2 == null) {
            alertFactory.warning('Para generar el reporte debes proporcionar el rango de fechas');
        } else {
            $("#loadModalCXC").modal("show");
            nodoRepository.getReporteGeneralGA(fecha1, fecha2).then((res) => {
                if (res.data[0].length > 0) {
                    $rootScope.contenidoReporteGA = {
                        "contenido": res.data[0]
                    };
                    searchRepository.getExcelExpedienteGA($rootScope.contenidoReporteGA, "ExpedientesGAMatriz").then(function success(res) {
                        var file = new Blob([res.data], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64," });
                        var a = document.createElement("a");
                        a.href = URL.createObjectURL(file);
                        var d = new Date();
                        a.download = "Expedientes_GA_" + d.getDate() + "/" + (d.getMonth() + 1) + "/" + d.getFullYear();
                        a.click();
                        $("#loadModalCXC").modal("hide");
                    }, function error(err) {
                        $("#loadModalCXC").modal("hide");
                        error(err);
                    });
                } else {
                    $("#loadModalCXC").modal("hide");
                    alertFactory.error('No se encontraron datos, favor de contactar al administrador.');
                }
            });
        }
    };

    $scope.getOcInitial = (allDocuments, dataCar) => {
        let dataOC;
        allDocuments.forEach((value) => {
            if (value.id_documento == 3) {
                dataOC = value
            }
        });
        if (dataOC == null || dataOC == undefined || dataOC == '') {
            let factuaDataSave;
            allDocuments.forEach((value) => {
                if (value.id_documento == 24) {
                    factuaDataSave = value
                };

                if (value.id_documento == 26) {
                    $rootScope.dataRecibos = value;
                };

                if (value.id_documento == 30) {
                    $rootScope.dataFacAccesorios = value;
                };
            });
            if ($rootScope.dataRecibos.existe === 0) {
                $rootScope.getDataFacturasAccesorios(dataCar);
            };
            if (factuaDataSave.existe == 0) {
                let ruta = `${factuaDataSave.rutaSave}${factuaDataSave.idExpediente}\\\\${factuaDataSave.proceso}\\\\${factuaDataSave.carpetaVarios}\\\\${factuaDataSave.doc_nombreCorto}_${dataCar[0].docto}.${factuaDataSave.doc_extencion}`;
                var objaBuscar = {
                    RFCEMISOR: dataCar[0].rfc_empresa,
                    RFCRECEPTOR: dataCar[0].rfc_cliente,
                    serie: dataCar[0].serie, //'BA',// $rootScope.dataAutomovil.serie,
                    folio: dataCar[0].folio //'000009781'//$rootScope.dataAutomovil.folio
                };
                nodoRepository.getDocumentoWS('FACTURA', objaBuscar, ruta).then((d) => {
                    if (d.data[0].success == 1) {
                        if (d.data[0].existe == 1) {
                            $('#btnBuscar').button('reset');
                            $("#loadModalCXC").modal("hide");
                            $('#masDeUnVin').modal('hide');
                        } else {
                            if (d.data[0].arrayBits.MuestraFacturaResult.pdf == null || d.data[0].arrayBits.MuestraFacturaResult.pdf == undefined || d.data[0].arrayBits.MuestraFacturaResult.pdf == '') {
                                $rootScope.abriModal = false;
                                $("#loadModalCXC").modal("hide");
                                $('#btnBuscar').button('reset');
                                $('#masDeUnVin').modal('hide');
                            } else {
                                var dataDoc = {
                                    idUsuario: $rootScope.empleado.idUsuario,
                                    nombreDocumento: `${factuaDataSave.doc_nombreCorto}_${dataCar[0].docto}.${factuaDataSave.doc_extencion}`,
                                    idDocumento: factuaDataSave.id_documento,
                                    archivo: d.data[0].arrayBits.MuestraFacturaResult.pdf,
                                    rutaSave: factuaDataSave.rutaSave,
                                    idExpediente: factuaDataSave.idExpediente,
                                    idProceso: factuaDataSave.proceso == 'CXP' ? 1 : 2,
                                    doc_varios: factuaDataSave.doc_varios,
                                    proceso: factuaDataSave.proceso,
                                    carpetaVarios: factuaDataSave.carpetaVarios
                                };

                                $scope.guardarDocWSInitial(dataDoc);
                            };
                        };
                    } else {
                        alertFactory.warning(d.data[0].arrayBits);
                        $rootScope.abriModal = false;
                        $("#loadModalCXC").modal("hide");
                        $('#btnBuscar').button('reset');
                        $('#masDeUnVin').modal('hide');
                    };
                });
            } else {
                $('#btnBuscar').button('reset');
                $("#loadModalCXC").modal("hide");
                $('#masDeUnVin').modal('hide');
            };
        } else {
            let existeElDoc = false;
            allDocuments.forEach((value) => {
                if (value.id_documento == 48) {
                    existeElDoc = true;
                }
            });
            if (existeElDoc && $rootScope.getComprobantes) {
                $rootScope.dataComprobantes = [];
                $rootScope.showAllComprobantes(true);
                $rootScope.getComprobantes = false;
            };
            if (dataOC.existe == 0) {
                var ruta = `${dataOC.rutaSave}${dataOC.idExpediente}\\\\${dataOC.proceso}\\\\${dataOC.carpetaVarios}\\\\${dataOC.doc_nombreCorto}_${dataCar[0].folioOrden}.${dataOC.doc_extencion}`;
                nodoRepository.getDocumentoWS('OCO', dataCar[0].folioOrden, ruta).then((d) => {
                    if (d.data[0].success == 1) {
                        if (d.data[0].existe == 1) {
                            $('#btnBuscar').button('reset');
                            $("#loadModalCXC").modal("hide");
                            $('#masDeUnVin').modal('hide');
                        } else {
                            var dataDoc = {
                                idUsuario: $rootScope.empleado.idUsuario,
                                nombreDocumento: `${dataOC.doc_nombreCorto}_${dataCar[0].folioOrden}.${dataOC.doc_extencion}`,
                                idDocumento: dataOC.id_documento,
                                archivo: d.data[0].arrayBits.GenerarPdfResult,
                                rutaSave: dataOC.rutaSave,
                                idExpediente: dataOC.idExpediente,
                                idProceso: dataOC.proceso == 'CXP' ? 1 : 2,
                                doc_varios: dataOC.doc_varios,
                                proceso: dataOC.proceso,
                                carpetaVarios: dataOC.carpetaVarios
                            };
                            $scope.guardarDocWSInitial(dataDoc);
                        };
                    } else {
                        alertFactory.warning(d.data[0].arrayBits);
                        $rootScope.abriModal = false;
                        $("#loadModalCXC").modal("hide");
                    };
                });
            } else {
                $('#btnBuscar').button('reset');
                $("#loadModalCXC").modal("hide");
                $('#masDeUnVin').modal('hide');
            };
        }
    };

    $scope.guardarDocWSInitial = (dataDoc) => {
        nodoRepository.saveDocumentos(dataDoc).then((res) => {
            if (res.data[0][0].success == 1) {
                $rootScope.getDocumentos();
            } else {
                $rootScope.abriModal = false;
                $('#btnBuscar').button('reset');
                $("#loadModalCXC").modal("hide");
                alertFactory.warning('No se guardo la orden de compra en automatico, favor de consultarla.');
            }
        });
    };

    $rootScope.setTab = (tab) => {
        $rootScope.cargandoDocsFaltantes = false;
        if (tab == 0) {
            $rootScope.tabDocumentosFaltantes = $rootScope.tipoProceso;
            $rootScope.getDocumentosFaltantes($rootScope.tipoProceso);
        } else {
            $rootScope.tabDocumentosFaltantes = tab;
            $rootScope.getDocumentosFaltantes(tab);
        };
    };

    $rootScope.getDocumentosFaltantes = (idProceso) => {
        if (!$rootScope.esUsuarioEnlace) {
            nodoRepository.getDataDocumentosFaltantes($rootScope.dataAutomovil.VEH_NUMSERIE, $rootScope.empresa.idEmpresa, $rootScope.agencia.idSucursal, idProceso).then((res) => {
                if (res.data[0][0].success == 1) {
                    $rootScope.docsFaltantesCargados = true;
                    $rootScope.cargandoDocsFaltantes = true;
                    $rootScope.reporteDocumentos = res.data[2];
                    $('#reporteDocumentos').modal('show');
                } else {
                    $rootScope.cargandoDocsFaltantes = true;
                    $rootScope.docsFaltantesCargados = false;
                };
                $('#loadModalCXC').modal('hide');
            });
        } else {
            nodoRepository.getDataDocumentosFaltantesEnlace($rootScope.dataAutomovil.VEH_NUMSERIE, $rootScope.empresa.idEmpresa, $rootScope.agencia.idSucursal, idProceso).then((res) => {
                if (res.data[0][0].success == 1) {
                    $rootScope.docsFaltantesCargados = true;
                    $rootScope.cargandoDocsFaltantes = true;
                    $rootScope.reporteDocumentos = res.data[2];
                    $('#reporteDocumentos').modal('show');
                } else {
                    $rootScope.cargandoDocsFaltantes = true;
                    $rootScope.docsFaltantesCargados = false;
                };
                $('#loadModalCXC').modal('hide');
            });
        };
    };

    $rootScope.SetYearTenencia = (year) => {
        $rootScope.yearSelect = year.anio;
        $rootScope.nombreArchivo = `${$rootScope.allDcoumets[$rootScope.docSave].doc_nombreCorto}_${year.anio}`;
    };

    $rootScope.ClearYear = () => {
        $rootScope.yearSelect = '';
        $rootScope.nombreArchivo = '';
    };

    $rootScope.saveNewTenencia = () => {
        if ($rootScope.docGubernamental) {
            $rootScope.nombreArchivo = `${$rootScope.allDcoumets[$rootScope.docSave].doc_nombreCorto}_amparo`;
            $rootScope.amparoAllTenencias = '';
            let varCheck = false;
            $rootScope.checksYears.forEach((value, key) => {
                if (value.checkValue) {
                    $rootScope.amparoAllTenencias += `_${value.anio}`;
                    varCheck = true;
                };
            });

            $rootScope.nombreArchivo = $rootScope.nombreArchivo + $rootScope.amparoAllTenencias;

            if (varCheck) {
                $("#modalTenencias").modal("hide");
                setTimeout(() => {
                    $("#uploadFiles").modal("show");
                }, 200);
            } else {
                alertFactory.warning('Debes seleccionar al menos un año');
            };
        } else {
            if ($rootScope.yearSelect == '' || $rootScope.yearSelect == null || $rootScope.yearSelect == undefined) {
                alertFactory.warning('Selecciona el año de la tenencia');
            } else {
                $("#modalTenencias").modal("hide");
                setTimeout(() => {
                    $("#uploadFiles").modal("show");
                }, 200);
            };
        };
    };

    $rootScope.dismissTenencias = () => {
        angular.element("input[type='file']").val(null);
        $("#modalTenencias").modal("hide");
    };

    $rootScope.checkGubernamental = () => {
        $rootScope.nombreArchivo = '';
        if ($rootScope.docGubernamental) {
            $rootScope.amparoAllTenencias = '';
            $rootScope.nombreArchivo = `${$rootScope.allDcoumets[$rootScope.docSave].doc_nombreCorto}_amparo`;
            $rootScope.yearSelect = '';
            $rootScope.allYearsTenencias.forEach((value, key) => {
                $rootScope.checksYears.push({ "index": $rootScope.checksYears.length, "anio": value.anio, "checkValue": false });
            });

            if ($rootScope.checksYears.length == 0) {
                $rootScope.checksYears = [];
                $rootScope.nombreArchivo = '';
                $rootScope.docGubernamental = false;
                alertFactory.warning('No hay tenencias por cargar...')
            };
        } else {
            $rootScope.checksYears = [];
            $rootScope.nombreArchivo = '';
        };
    };

    $rootScope.checkTenenciaDosMilVentiuno = () => {
        if ($rootScope.tenenciaDosMilVeintiuno == 1) {
            $rootScope.nombreArchivo = `${$rootScope.allDcoumets[$rootScope.docSave].doc_nombreCorto}_2021`;
        } else {
            $rootScope.nombreArchivo = `${$rootScope.allDcoumets[$rootScope.docSave].doc_nombreCorto}_${$rootScope.allDocumentsVarios.length + 1}`;
        };
    };

    /**FUnciones para traer los datos y descargar el excel de los documentos */
    $rootScope.getDocumentosExcel = () => {
        let CXP = $rootScope.allPermisosDocumentos.ConsultarProcesoCXP;
        let CXC = $rootScope.allPermisosDocumentos.ConsultarProcesoCXC == 1 ? 2 : 0;
        searchRepository.getProcesos(CXP, CXC).then((res) => {
            $rootScope.listaProcesosXls = res.data;
            $('#excelDocumentos').modal('show');
        });
    };

    $rootScope.dismissExcelDocumentos = () => {
        $rootScope.showtipoPersonasXls = false;
        $rootScope.estadoRepublicaXls = false;
        $rootScope.showCanalesXls = false;
        $rootScope.procesoXls = undefined;
        $rootScope.canalesXls = undefined;
        $rootScope.tipoPersonaXls = undefined;
        $rootScope.estadosXls = undefined;
        $('#excelDocumentos').modal('hide');
    };

    $rootScope.SetProcesoXls = (proceso) => {
        $rootScope.showtipoPersonasXls = false;
        $rootScope.estadoRepublicaXls = false;
        $rootScope.canalesXls = undefined;
        $rootScope.tipoPersonaXls = undefined;
        $rootScope.estadosXls = undefined;

        $rootScope.procesoXls = proceso;
        if ($rootScope.procesoXls.Proc_Id == 1) {
            $rootScope.tipoCanal = 'Canal de Compra';
            $rootScope.getAllEstadosXls();
        } else {
            $rootScope.tipoCanal = 'Canal de Venta';
        };
        $rootScope.cargandoXls = true;
        $rootScope.getAllCanalesXls();
    };

    $rootScope.getAllCanalesXls = () => {
        administradorRepository.getCanales($rootScope.procesoXls.Proc_Id).then((res) => {
            $rootScope.listaCanalesXls = res.data;
            $rootScope.showCanalesXls = true;
            $rootScope.cargandoXls = false;
        });
    };

    $rootScope.setCanalesXls = (canal) => {
        $rootScope.cargandoXls = true;
        $rootScope.estadoRepublicaXls = false;
        $rootScope.tipoPersonaXls = undefined;
        $rootScope.estadosXls = undefined;

        $rootScope.showtipoPersonasXls = true;
        $rootScope.canalesXls = canal;
        $rootScope.cargandoXls = false;
    };

    $rootScope.SetPersonaXls = (persona) => {
        $rootScope.cargandoXls = true;
        if ($rootScope.procesoXls.Proc_Id == 1) {
            $rootScope.estadoRepublicaXls = true;
            $rootScope.estadosXls = undefined;
        } else {
            $rootScope.estadosXls = { id_estado: '00', estado: '' };
        };
        $rootScope.tipoPersonaXls = persona;
        $rootScope.cargandoXls = false;
    };

    $rootScope.getAllEstadosXls = () => {
        administradorRepository.getEstados().then((res) => {
            $rootScope.listaEstadosXls = res.data;
        });
    };

    $rootScope.setEstadosXls = (estado) => {
        document.getElementById("myInputXls").value = '';
        $rootScope.filterFunctionXls();
        if ($rootScope.procesoXls.Proc_Id == 1) {
            $rootScope.estadosXls = estado;
        };
    };

    $rootScope.downloadDocumentos = () => {
        if ($rootScope.procesoXls == undefined || $rootScope.canalesXls == undefined || $rootScope.tipoPersonaXls == undefined || $rootScope.estadosXls == undefined) {
            alertFactory.warning('Selecciona todos los datos.');
        } else {
            $rootScope.cargandoXls = true;
            nodoRepository.documentsForExcel($rootScope.procesoXls.Proc_Id, $rootScope.canalesXls.idCanal, $rootScope.tipoPersonaXls.id_persona, $rootScope.estadosXls.id_estado).then((res) => {
                if (res.data[0].length > 0) {
                    $rootScope.contenidoDocumentos = {
                        "contenido": res.data[0]
                    };
                    let nombreReporte = `Documentos_${$rootScope.procesoXls.Proc_Id == 1 ? 'CXP' : 'CXC'}_Canal_${$rootScope.canalesXls.descripcionCanal}_Persona_${$rootScope.tipoPersonaXls.tipo_persona}${$rootScope.procesoXls.Proc_Id == 1 ? '_Estado_' + $rootScope.estadosXls.estado : ''}`;
                    searchRepository.getExcelExpedienteGA($rootScope.contenidoDocumentos, "ExpedienteSemDocumentos").then(function success(res) {
                        console.log('res', res);
                        var file = new Blob([res.data], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64," });
                        var a = document.createElement("a");
                        a.href = URL.createObjectURL(file);
                        var d = new Date();
                        a.download = `${nombreReporte}_${d.getDate()}/${(d.getMonth() + 1)}/${d.getFullYear()}`;
                        a.click();
                        $rootScope.cargandoXls = false;
                        $rootScope.dismissExcelDocumentos();
                    }, function error(err) {
                        alertFactory.warning('Error al crear el reporte, favor de contactar al administrador.');
                        $rootScope.cargandoXls = false;
                        $rootScope.dismissExcelDocumentos();
                        error('error', err);
                    });
                } else {
                    alertFactory.warning('Error al regresar la informacion, favor de contactar al administrador');
                };
            });
        };
    };

    /**FUNCION ENCARGADA DE HACER LA BUSQUEDA EN EL DROP DAWN DE ESTADOS */
    $rootScope.filterFunctionXls = () => {
        var input, filter, ul, li, a, i;
        input = document.getElementById("myInputXls");
        filter = input.value.toUpperCase();
        div = document.getElementById("myDropdownXls");
        a = div.getElementsByTagName("a");
        for (i = 0; i < a.length; i++) {
            txtValue = a[i].textContent || a[i].innerText;
            if (txtValue.toUpperCase().indexOf(filter) > -1) {
                a[i].style.display = "";
            } else {
                a[i].style.display = "none";
            }
        }
    }

    //#region 
    /***
     * @Autor Alejandro Grijalva 
     * @Descripción Integración con expediente de clientes
     * @Fecha 19 Mar 2021
     */

    $scope.pestania = 1;
    $scope.idClienteExpediente = 0;
    $scope.urlExpedienteCliente = $sce.trustAsResourceUrl('');
    $scope.token = null;
    $scope.user = null;
    $scope.idHistorico = null;
    $scope.resToken = [];
    $scope.expedienteCerrado = [];
    $scope.pathEUCBack = ''
    $scope.mostrarTomarDocs = false;
    $scope.pathEUCFront = 'http://192.168.20.89:4093/login';
    //  $scope.pathEUCFront = 'http://192.168.20.89:4093/login';
    //  $scope.pathEUCFront = 'https://apiexpedientecliente.grupoandrade.com';

    $scope.expCerrado = false;
    /**
     * 1 - Expediente del proceo
     * 2 - Expediente del cliente
     * 3 - Pagos
     */


    $scope.openTab = function (idTab) {
        $scope.pestania = idTab;

        if (idTab == 2) {
            console.log("$scope.idClienteExpediente", $scope.idClienteExpediente);
            console.log("$scope.resToken", $scope.resToken);
            console.log("$scope.expedienteCerrado", $scope.expedienteCerrado[0].success);
            console.log("$scope.idHistorico", $scope.idHistorico);

            if ($scope.resToken.length == 0) {

            }
            else {
                $scope.token = $scope.resToken[0].token;
                $scope.user = $scope.resToken[0].usuarioBpro;
                $scope.idHistorico = $scope.resToken[0].idHistorico;

                this.path = `${$scope.pathEUCFront}?usuarioBpro=${$scope.user}&token=${$scope.token}`;
                $scope.urlExpedienteCliente = $sce.trustAsResourceUrl(this.path);

                console.log("$scope.mostrarTomarDocs", $scope.resToken[0]);
                if ($scope.resToken[0].idHistorico === null) {
                    $scope.mostrarTomarDocs = true;
                }
                else {
                    $scope.mostrarTomarDocs = false;
                }

            }


            if ($scope.token === null) {            // Primera vez que se entra al expediente
                //$scope.expCerrado = ( $scope.expedienteCerrado[0].success == 1 ) ? true : false;
                $scope.expCerrado = false;
                var parametros = null;

                if ($scope.expCerrado) {            // El expediente ya esta cerrado desde que se inicia
                    parametros = {
                        idCliente: $scope.idClienteExpediente,
                        idProceso: 2,
                        idUsuarioBpro: $rootScope.empleado.idUsuario,
                        folio: $rootScope.allDcoumets[0].idExpediente,
                        parametros: [
                            { expCerrado: $scope.expCerrado }
                        ],
                        historico: true
                    }
                    console.log(1);

                    $scope.mostrarTomarDocs = false;
                }
                else {                               // El expediente aun sigue vivo
                    parametros = {
                        idCliente: $scope.idClienteExpediente,//263287, 
                        idProceso: 2,
                        idUsuarioBpro: $rootScope.empleado.idUsuario,
                        folio: $rootScope.allDcoumets[0].idExpediente
                    }
                    console.log(2);

                    $scope.mostrarTomarDocs = true;
                }

                // nodoRepository.getTokenParametros( parametros ).then((res) => {
                //     console.log( "getTokenParametros", res.data.recordsets[0][0] );

                //     let { token, user, idHistorico } = res.data.recordsets[0][0];

                //     this.token = token;
                //     $scope.token = token;

                //     this.user = user;
                //     $scope.user = user;

                //     $scope.idHistorico = idHistorico;
                //     // token = '72cab61498-1136A39F';
                //     //$scope.idClienteExpediente
                //     $scope.guardarToken($scope.token, $scope.user, idHistorico );

                //     this.path = `${$scope.pathEUCFront}?usuarioBpro=${user}&token=${token}`;
                //     $scope.urlExpedienteCliente = $sce.trustAsResourceUrl(this.path);
                // });
            }
            else {
                if ($scope.idHistorico === null) {
                    parametros = {
                        idCliente: $scope.idClienteExpediente,
                        idProceso: 2,
                        idUsuarioBpro: $rootScope.empleado.idUsuario,
                        folio: $rootScope.allDcoumets[0].idExpediente
                    }
                    console.log(3);
                }
                else {
                    parametros = {
                        idCliente: $scope.idClienteExpediente,
                        idProceso: 2,
                        idUsuarioBpro: $rootScope.empleado.idUsuario,
                        historico: true,
                        idHistorico: $scope.idHistorico
                    }
                    console.log(4);
                }
            }

            nodoRepository.getTokenParametros(parametros).then((res) => {
                console.log("getTokenParametros", res.data.recordsets[0][0]);

                let { token, user, idHistorico } = res.data.recordsets[0][0];

                this.token = token;
                $scope.token = token;

                this.user = user;
                $scope.user = user;
                // token = '72cab61498-1136A39F';
                //$scope.idClienteExpediente
                $scope.guardarToken($scope.token, $scope.user, idHistorico, false);

                this.path = `${$scope.pathEUCFront}?usuarioBpro=${user}&token=${token}`;
                $scope.urlExpedienteCliente = $sce.trustAsResourceUrl(this.path);
            });

            //  //3N6AD31A9LK824607
            //  if( $scope.idClienteExpediente == 491637 ){
            //      //$scope.urlExpedienteCliente = $sce.trustAsResourceUrl('http://localhost:5090/login?usuarioBpro=jose.santamaria&token=1234&idProceso=2&historico=true&idCliente=' + $scope.idClienteExpediente);
            //  }
        }
    }

    $scope.guardarToken = function (token, usuario, idHistorico, cerrarDocumentos) {
        var parametros = {
            idExpediente: $rootScope.allDcoumets[0].idExpediente,
            token: token,
            usuarioBpro: usuario,
            idUsuario: $rootScope.empleado.idUsuario,
            idHistorico: idHistorico
        }
        nodoRepository.insToken(parametros).then((res) => {
            if (cerrarDocumentos) {
                $scope.openTab(2);
            }
        });
    }

    $scope.congelarDocumentos = function () {
        var token = $scope.token;
        nodoRepository.congelarDocumentos(token).then((res) => {
            console.log(res.data.recordsets);
            if (res.data.error == "") {
                var respuesta = res.data.recordsets[0][0]
                if (respuesta.success == 0) {
                    alertFactory.warning(respuesta.msg);
                }
                else {
                    alertFactory.success(respuesta.msg);

                    $scope.resToken[0].idHistorico = respuesta.idHistorico;

                    $scope.guardarToken(token, $scope.user, respuesta.idHistorico, true);
                }
            }
            else {
                alertFactory.warning('Algo no pudo ser completado, intente de nuevo o notifique a su administrador de sistemas');
            }
        });
    }

    $scope.filtro = function (arreglo = []) {
        var aux = [];
        var aux2 = [];
        arreglo.forEach(function (item, key) {
            if (!item.DocCliente) {
                aux.push(item);
            }
            else {
                aux2.push(item);
            }
        });
        return aux;
    }

    $scope.reset = function () {
        $scope.pestania = 1;
        $scope.idClienteExpediente = 0;
        $scope.urlExpedienteCliente = $sce.trustAsResourceUrl('');
        $scope.token = null;
        $scope.user = null;
        $scope.idHistorico = null;
        $scope.resToken = [];
        $scope.expedienteCerrado = [];
        $scope.pathEUCBack = ''
        $scope.mostrarTomarDocs = true;
    }


    //#endregion

    //#region Facturas
    /***
         * @Autor Luis Garcia 
         * @Descripción Funciones para obtener las facturas de accesorios y los recibos
         * @Fecha 04 May 2021
    */

    $rootScope.getDataFacturasAccesorios = dataCar => {
        if ($rootScope.dataFacAccesorios.doc_usuarios === 0) {
            $rootScope.facturaGuardada = 0;
            nodoRepository.dataFacturaAccesorios(dataCar[0].VEH_NUMSERIE, $rootScope.empresa.idEmpresa, $rootScope.agencia.idSucursal, $rootScope.empleado.idUsuario).then(res => {
                if (res.data[0].success == 1) {
                    $rootScope.facturaGuardada += 1;
                };
                $rootScope.getDataRecibosPago(dataCar);
            });
        } else {
            $rootScope.getDataRecibosPago(dataCar);
        };
    };

    $rootScope.getFacturasAccesorios = () => {
        $('#loadModalCXC').modal('show');
        $rootScope.facturaMostrada = 0;
        $rootScope.titleModalFacturas = '';
        $("#mostrarPdfFacturas").modal("hide");
        nodoRepository.allDataFacturaAccesorios($rootScope.dataAutomovil.VEH_NUMSERIE, $rootScope.empresa.idEmpresa, $rootScope.agencia.idSucursal).then(res => {
            $('#loadModalCXC').modal('hide');
            if (res.data.length > 0) {
                $rootScope.titleModalFacturas = 'Factura accesorios ';
                $rootScope.facturaMostrada = 1;
                $rootScope.allFacturasAcc = res.data;
                $('#wsVariousFilesFacturas').modal('show');
            } else {
                alertFactory.warning('No hay documentos para mostrar');
                $('#loadModalCXC').modal('hide');
            };
        });
    };

    $rootScope.getDataRecibosPago = dataCar => {
        if ($rootScope.dataRecibos.doc_usuarios === 0) {
            nodoRepository.dataRecibos(dataCar[0].VEH_NUMSERIE, $rootScope.empresa.idEmpresa, $rootScope.agencia.idSucursal, $rootScope.empleado.idUsuario).then(res => {
                if ($rootScope.facturaGuardada > 0 || res.data[0].success == 1) {
                    $rootScope.getDocumentos();
                };
            });
        };
    };

    $rootScope.allRecibos = () => {
        $('#loadModalCXC').modal('show');
        $rootScope.facturaMostrada = 0;
        $rootScope.titleModalFacturas = '';
        $("#mostrarPdfFacturas").modal("hide");
        nodoRepository.allRecibos($rootScope.dataAutomovil.VEH_NUMSERIE, $rootScope.empresa.idEmpresa, $rootScope.agencia.idSucursal).then(res => {
            if (res.data[0].facturas.length > 0) {
                $('#loadModalCXC').modal('hide');
                $rootScope.titleModalFacturas = 'Factura Recibo ';
                $rootScope.facturaMostrada = 2;
                $rootScope.allFacturasAcc = res.data[0].facturas;
                $('#wsVariousFilesFacturas').modal('show');
            } else {
                alertFactory.warning('No hay documentos para mostrar');
                $('#loadModalCXC').modal('hide');
            };
        });
    };

    $rootScope.verPdfWsFacturas = documento => {
        $("#loadModalCXC").modal("show");
        let obj = {
            RFCEMISOR: documento.rfcEmpresa,
            RFCRECEPTOR: '',
            serie: documento.serie,
            folio: documento.folio
        };

        nodoRepository.documentoWSFacturas(obj).then(res => {
            $("#loadModalCXC").modal("hide");
            let pdf = '';
            let dataPdf = res.data[0].arrayBits.MuestraFacturaResult.pdf;
            pdf = URL.createObjectURL(utils.b64toBlob(dataPdf, "application/pdf"));
            $('#pdfReferenceContentFacturas object').remove();
            $rootScope.titleModalFacturas += documento.factura;
            // $rootScope.allPermisosDocumentos.DescargarPdf == 0 ? pdf = `${pdfPrev}` : pdf = `${pdfPrev}?page=hsn#toolbar=0`;
            $("<object class='lineaCaptura' data='" + pdf + "' width='100%' height='480px'>").appendTo('#pdfReferenceContentFacturas');
            $("#wsVariousFilesFacturas").modal("hide");
            $("#mostrarPdfFacturas").modal("show");
        });
    };

    $rootScope.closeModalFacturas = () => {
        if ($rootScope.facturaMostrada === 1) {
            $rootScope.getFacturasAccesorios();
        } else {
            $rootScope.allRecibos();
        };
    };
    //#endregion

    //#region Enlace Contable
    /***
         * @Autor Luis Garcia 
         * @Descripción Funciones para la logica del usuario enalce administrativo
    */
    $rootScope.getAccionEnlaceContable = ({ idUsuario = $rootScope.empleado.idUsuario, vin, idEmpresa, idSucursal }) => {
        nodoRepository.accionEnlace(idUsuario, vin, idEmpresa, idSucursal).then(res => {
            $rootScope.esUsuarioEnlace = res.data[2][0].esEnlace == 1 ? true : false;
            $rootScope.accionEnlaceContable = res.data[1][0].enlaceAdminuistrativo == 1 ? true : false;
        });
    };

    $rootScope.aprobarRechazarDocumentoEnlace = id_estatus => {
        $("#mostrarPdf").modal("hide");
        $("#pdfMasUno").modal("hide");
        $("#loadModalCXC").modal("show");

        let observaciones = ''
        if (id_estatus == 3) {
            observaciones = $rootScope.razonesRechazo;
        }

        if (id_estatus == 3 && observaciones == '') {
            $("#loadModalCXC").modal("hide");
            alertFactory.warning('Debe especificar el por que del rechazo del documento.');
        } else {
            $("#rechazarDocumento").modal("hide");
            nodoRepository.updateEstatusDocumentoEnlace($rootScope.idDocumentoGuardadoViewer, id_estatus, observaciones, $rootScope.empleado.idUsuario, $rootScope.tipoProceso).then((res) => {
                if (res.data[0].success == 1) {
                    if (id_estatus == 2) {
                        $("#loadModalCXC").modal("hide");
                        alertFactory.success('Se aprobo el documento con éxito.');
                        $rootScope.getDocumentos();
                    } else {
                        $("#loadModalCXC").modal("hide");
                        alertFactory.success('Se rechazo el documento con éxito.');
                        $rootScope.getDocumentos();
                    };
                } else {
                    alertFactory.error('Error al completar la operación, favor de contactar al administrador.')
                }
            });
        };
    };

    $rootScope.verGuiaF = documento => {
        $rootScope.modalTitleGuia = `Guia documento ${documento.doc_nombre}`;
        nodoRepository.urlGuia($rootScope.tipoProceso, documento.id_documento).then(res => {
            if (res.data.length > 0) {
                const pdf = res.data[0].urlGuia;
                $('#pdfReferenceContentGuia object').remove();

                $("<object class='lineaCaptura' data='" + pdf + "' width='100%' height='480px'>").appendTo('#pdfReferenceContentGuia');
                $("#mostrarGuia").modal("show");
            } else {
                alertFactory.error('Error al completar la operación, favor de contactar al administrador.');
            };
        });
    };

    //#endregion


    //#region pagosSeminuevos
    /***
     * @Autor Luis Garcia
     * @Descripción Iintegracion de funciones para el pago de seminuevos
     */

    $rootScope.verPdfComprobante = comprobante => {
        $('#pdfReferenceContentComprobante object').remove();
        $("<object class='lineaCaptura' data='" + comprobante.pdf + "' width='100%' height='480px'>").appendTo('#pdfReferenceContentComprobante');
        $("#allComprobantes").modal("hide");
        $("#showComprobante").modal("show");
    };

    $rootScope.dimissComprobante = () => {
        $("#showComprobante").modal("hide");
        $rootScope.showAllComprobantes(false);
    };

    $rootScope.showAllComprobantes = guardaDoc => {
        $("#loadModalCXC").modal("show");
        $rootScope.dataComprobantes = [];
        nodoRepository.docsComprobantePago($rootScope.dataAutomovil.VEH_NUMSERIE, $rootScope.empresa.idEmpresa).then(res => {
            const data = {
                tipo: res.data[0][0].tipoDocumento,
                factura: res.data[0][0].folioOrden,
                nodo: res.data[0][0].nodoBusqueda
            };

            $rootScope.getAllDataComprobantesWS(data, res.data[1][0].existeDoc, guardaDoc);
        });
    };

    $rootScope.getAllDataComprobantesWS = ({ tipo = 'PAC', factura, nodo = 14 }, existeDocumento, guardaDoc) => {
        nodoRepository.getPdfs(tipo, factura, nodo).then(res => {
            if (res.data.arrayBits !== "") {
                if (res.data.arrayBits.base64Binary.length > 0) {
                    const { arrayBits } = res.data;

                    arrayBits.base64Binary.forEach((value, index) => {
                        $rootScope.dataComprobantes.push({ pdf: URL.createObjectURL(utils.b64toBlob(value, "application/pdf")), nombre: `Comprobante ${index + 1}` });
                    });
                };
            };

            $rootScope.existeDoc(existeDocumento, guardaDoc);
        });
    };

    $rootScope.existeDoc = (existeDocumento, guardaDoc) => {
        nodoRepository.existeDocFisico(existeDocumento).then(res => {
            $("#loadModalCXC").modal("hide");

            if (res.data.respuesta == 1) {
                $rootScope.dataComprobantes.push({ pdf: existeDocumento, nombre: `Comprobante ${$rootScope.dataComprobantes.length + 1}` });
            };

            if (!guardaDoc) {
                if ($rootScope.dataComprobantes.length > 0) {
                    $("#allComprobantes").modal("show");
                } else {
                    alertFactory.warning('No hay documentos por mostrar');
                };
            } else {
                $rootScope.saveComprobantesPago($rootScope.dataComprobantes);
            };
        });
    };


    $rootScope.saveComprobantesPago = arrayComprobantes => {
        if (arrayComprobantes.length > 0) {
            nodoRepository.saveComprobantePago($rootScope.dataAutomovil.VEH_NUMSERIE, $rootScope.empresa.idEmpresa, $rootScope.agencia.idSucursal, $rootScope.empleado.idUsuario).then(res => {
                if (res.data[0][0].success == 1) {
                    $rootScope.dataComprobantes = [];
                    $rootScope.getDocumentos();
                };
            });
        };
    };
    //#End region pagosSeminuevos
});

