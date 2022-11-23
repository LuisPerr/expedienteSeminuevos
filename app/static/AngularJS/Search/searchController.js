registrationModule.controller("searchController", function ($scope, $rootScope, $location, localStorageService, alertFactory, searchRepository) {

    //Propiedades
    $rootScope.searchlevel = 0;
    $rootScope.showBtnReporteIndividual = 0;
    $rootScope.vin = '';
    //prueba para estilos
    $scope.color = null;
    $rootScope.opened1 = false;
    $rootScope.opened2 = false;
    $rootScope.primeraVezCliente = true;
    $rootScope.aplicaBusqueda = true;
    $rootScope.changeMensaje = false;
    //Desconfiguramos el clic izquierdo en el frame contenedor de documento
    var errorCallBack = function (data, status, headers, config) {
        $('#btnEnviar').button('reset');
        $('#btnBuscar').button('reset');
        alertFactory.error('Ocurrio un problema');

    };

    if ($location.path() === "/") {
        $rootScope.buttonMenuVisible = true;
    } else {
        $rootScope.buttonMenuVisible = false;
    }

    //Grupo de funciones de inicio
    $scope.init = function () {
        //$rootScope.hasExp = true;
        $scope.loadTipos();
        // $scope.loadProceso();
        //Inicia la busqueda por folio (orden de compra)
        $scope.tipoBusqueda(3);
    };

    $scope.tipoBusqueda = function (tipo) {
        $rootScope.identificaBusqueda = tipo;
        switch (tipo) {
            case 1:
                $rootScope.nombreBusqueda = 'Orden de Compra';
                $scope.folioBusca = '';
                break;
            case 2:
                $rootScope.nombreBusqueda = 'Factura';
                $scope.folioBusca = '';
                break;
            case 3:
                $rootScope.nombreBusqueda = 'Número de Serie';
                $scope.folioBusca = '';
                break;
            case 4:
                $rootScope.nombreBusqueda = 'Orden de Servicio';
                $scope.folioBusca = '';
                break;
            case 5:
                $rootScope.nombreBusqueda = 'Cliente';
                $scope.folioBusca = '';
                break;
            case 6:
                $rootScope.nombreBusqueda = 'Cotización';
                $scope.folioBusca = '';
                break;
        }
    };

    $scope.Search = function () {
        $("#loadModal").modal("show");
        $rootScope.primeraVezCliente = true;
        $rootScope.getComprobantes = true;
        if ($rootScope.empresa == null && $rootScope.agencia == null && $rootScope.departamento == null && ($scope.folioBusca == null || $scope.folioBusca == '') && $rootScope.proveedor == null && $rootScope.tipo == null && $scope.dt1 == null && $scope.dt2 == null && $rootScope.tipoProceso == null) {
            alertFactory.warning('Debe proporcionar al menos Proceso, División, Empresa y Agencia.');
            $("#loadModal").modal("hide");
        } else if ($rootScope.division == null) {
            alertFactory.warning('Debe proporcionar División, Empresa y Agencia.');
            $("#loadModal").modal("hide");
        } else if ($rootScope.empresa == null) {
            alertFactory.warning('Debe proporcionar Empresa y Agencia.');
            $("#loadModal").modal("hide");
        } else if ($rootScope.agencia == null) {
            alertFactory.warning('Debe proporcionar Agencia.');
            $("#loadModal").modal("hide");
        } else if ($scope.folioBusca == null || $scope.folioBusca == '') {
            alertFactory.warning('Debe proporcionar el Vin.');
            $("#loadModal").modal("hide");
        } else {
            $rootScope.datoBusqueda = $scope.folioBusca;
            $('#idProceso').val('');
            $('#idEmpresa').val('');
            $('#idSucursal').val('');
            $('#vin').val('');
            $('#btnBuscar').button('loading');
            let dataAccion = {
                idUsuario: $rootScope.empleado.idUsuario,
                vin: $scope.folioBusca,
                idEmpresa: $rootScope.empresa.idEmpresa,
                idSucursal: $rootScope.agencia.idSucursal
            };
            $rootScope.getAccionEnlaceContable(dataAccion);
            $rootScope.getDocumentos();
        };
    };

    $rootScope.goNuevoAdministrador = function () {
        $rootScope.proceso = null;
        $rootScope.empresa = null;
        $rootScope.agencia = null;
        $scope.folioBusca = '';
        $location.path('/administrador');
    }

    //Script para salir
    ///////////////////////////////////////////////////////////////////////////
    $scope.Salir = function () {
        var ventana = window.self;
        ventana.opener = window.self;
        ventana.close();
    };


    $scope.verDiccionario = function (tipo) {
        $rootScope.tipodic = "";
        searchRepository.getDiccionario(tipo, $rootScope.idProceso).then(function (result) {
            $rootScope.listaDic = result.data;
            if (tipo == 1) {
                $rootScope.tipodic = 'Nodos';
                $('#modalDiccionario').modal('show');
            } else {
                $rootScope.tipodic = 'Status'
                if ($rootScope.proceso.Proc_Id == 1)
                    $('#modalDiccionariocxp').modal('show');
                if ($rootScope.proceso.Proc_Id == 2)
                    $('#modalDiccionariocxc').modal('show');
            }
        });
    }


    $scope.CloseGrid = function () {
        $("#finder").animate({
            width: "hide"
        });
        //$rootScope.hasExp = true;
    };

    $scope.HideView = function () {
        //$rootScope.hasExp = false;
    };

    ///////////////////////////////////////////////////////////////////////////
    //Carga los tipos de órden de compra
    $scope.loadTipos = function () {
        searchRepository.getTipos()
            .success(getTiposSuccessCallback)
            .error(errorCallBack);
    };

    var getTiposSuccessCallback = function (data, status, headers, config) {
        $rootScope.listaTipos = data;
    }

    $scope.SetTipo = function (tip) {
        $rootScope.tipo = tip;
    };

    $scope.ClearTipo = function () {
        $rootScope.tipo = null;
    };

    $rootScope.loadProceso = function () {
        let CXP = $rootScope.allPermisosDocumentos.ConsultarProcesoCXP;
        let CXC = $rootScope.allPermisosDocumentos.ConsultarProcesoCXC == 1 ? 2 : 0;
        searchRepository.getProcesos(CXP, CXC)
            .success(getProcesoSuccessCallback)
            .error(errorCallBack);
    };

    //////////////////////////////////////////////////////////////////////////
    //Establece el proceso
    //////////////////////////////////////////////////////////////////////////
    var getProcesoSuccessCallback = function (data, status, headers, config) {
        $rootScope.listaProcesos = data;
        if (!($('#idProceso').val().indexOf('[') > -1)) {
            if ($('#idProceso').val() !== '') {
                let div = {
                    Proc_Descripcion: parseInt($('#idProceso').val()) === 1 ? "Cuentas por Pagar" : "Cuentas por Cobrar",
                    Proc_Id: parseInt($('#idProceso').val()),
                    Proc_Nombre: parseInt($('#idProceso').val()) === 1 ? "Cuentas por Pagar" : "Cuentas por Cobrar",
                    Proc_Orden: parseInt($('#idProceso').val())
                };
                $scope.SetProceso(div);
            };
        };
    };

    $scope.SetProceso = function (div) {
        if (div.Proc_Id === 1) {
            $rootScope.aplicaBusqueda = false;
            if ($rootScope.identificaBusqueda === 2 || $rootScope.identificaBusqueda === 6) {
                $rootScope.cargaDocs = false;
                $scope.tipoBusqueda(3);
                $rootScope.changeMensaje = true;
            } else {
                $rootScope.changeMensaje = false;
            };
        } else {
            $rootScope.aplicaBusqueda = true;
        };

        if ($rootScope.empresa == null || $rootScope.agencia == null || ($scope.folioBusca == null || $scope.folioBusca == '')) {
            if ($rootScope.empresa == null && $rootScope.agencia == null && ($scope.folioBusca == null || $scope.folioBusca == '') && ($rootScope.tipoProceso != null || $rootScope.tipoProceso != '')) {

            } else {
                if ($rootScope.changeMensaje) {
                    alertFactory.warning('La busqueda avanzada solo aplica para VIN y ORDEN DE COMPRA.');
                } else {
                    alertFactory.warning('Debe proporcionar todos los campos para hacer la busqueda avanzada.');
                };
            };
        } else {
            $rootScope.proceso = div;
            $rootScope.searchlevel = 1;
            $rootScope.tipoProceso = $rootScope.proceso.Proc_Id;
            $scope.loadDivision();
            $scope.Search();
        }
        // $scope.ClearProceso();
        $rootScope.proceso = div;
        $rootScope.searchlevel = 1;
        $rootScope.tipoProceso = $rootScope.proceso.Proc_Id;
        $scope.loadDivision();
    };

    $scope.ClearProceso = function () {
        $rootScope.proceso = null;
        $rootScope.division = null;
        $rootScope.searchlevel = 0;
        $rootScope.tipoProceso = null;
        $rootScope.empresa = null;
        $rootScope.agencia = null;
        $rootScope.departamento = null;
    }

    //////////////////////////////////////////////////////////////////////////
    //Establece la división
    //////////////////////////////////////////////////////////////////////////
    var getDivisionSuccessCallback = function (data, status, headers, config) {
        $rootScope.listaDivisiones = data;

        setTimeout(() => {
            $scope.SetDivision($rootScope.listaDivisiones[0]);
        }, 300);
    }

    $scope.loadDivision = function () {
        searchRepository.getDivision($rootScope.empleado.idUsuario)
            .success(getDivisionSuccessCallback)
            .error(errorCallBack);
    }

    $scope.SetDivision = function (div) {
        $scope.ClearDivision();
        $rootScope.division = div;
        $rootScope.searchlevel = 2;
        $scope.LoadEmpresa(div.idDivision);
    };

    $scope.ClearDivision = function () {
        $rootScope.division = null;
        $rootScope.searchlevel = 1;
        // $rootScope.empresa = null;
        // $rootScope.agencia = null;
        $rootScope.departamento = null;
    }

    //////////////////////////////////////////////////////////////////////////
    //Establece la empresa
    //////////////////////////////////////////////////////////////////////////
    var getEmpresaSuccessCallback = function (data, status, headers, config) {
        $rootScope.listaEmpresas = data;
        if (!($('#idEmpresa').val().indexOf('[') > -1)) {
            if ($('#idEmpresa').val() !== '') {
                let emp;
                $rootScope.listaEmpresas.forEach(value => {
                    if (parseInt($('#idEmpresa').val()) === value.idEmpresa) {
                        emp = value;
                    };
                });
                $scope.SetEmpresa(emp);
            };
        } else {
            if ($rootScope.empresa == undefined || $rootScope.empresa == null || $rootScope.empresa == '') { } else {
                $scope.SetEmpresa($rootScope.empresa);
            };
        };
    };

    $scope.LoadEmpresa = function (iddivision) {
        searchRepository.getEmpresa($rootScope.empleado.idUsuario, iddivision)
            .success(getEmpresaSuccessCallback)
            .error(errorCallBack);
    }

    $scope.SetEmpresa = function (emp) {
        // $scope.ClearEmpresa();
        $rootScope.empresa = emp;
        $rootScope.searchlevel = 3;
        $scope.LoadAgencia();
    };

    $scope.ClearEmpresa = function () {
        // $rootScope.empresa = null;
        $rootScope.searchlevel = 2;
        $rootScope.agencia = null;
        $rootScope.departamento = null;
    }

    //////////////////////////////////////////////////////////////////////////
    //Establece la agencia
    //////////////////////////////////////////////////////////////////////////
    var getAgenciaSuccessCallback = function (data, status, headers, config) {
        $rootScope.listaAgencias = data;
        if (!($('#idSucursal').val().indexOf('[') > -1)) {
            if ($('#idSucursal').val() !== '') {
                let age;
                $rootScope.listaAgencias.forEach(value => {
                    if (parseInt($('#idSucursal').val()) === value.idSucursal) {
                        age = value
                    };
                });
                $scope.SetAgencia(age);
            };
        };
    };

    $scope.LoadAgencia = function () {
        searchRepository.getSucursal($rootScope.empleado.idUsuario, $rootScope.empresa.idEmpresa)
            .success(getAgenciaSuccessCallback)
            .error(errorCallBack);
    }

    $scope.SetAgencia = function (age) {
        $scope.ClearAgencia();
        $rootScope.agencia = age;
        $rootScope.searchlevel = 4;
        $scope.LoadDepartamento();

        if ($rootScope.empresa !== null && $rootScope.agencia !== null) {
            if (!($('#vin').val().indexOf('[') > -1)) {
                if ($('#vin').val() !== '') {
                    $scope.folioBusca = $('#vin').val();

                    setTimeout(() => {
                        $scope.Search();
                    }, 200);
                };
            };
        };
    };

    $scope.ClearAgencia = function () {
        $rootScope.agencia = null;
        $rootScope.searchlevel = 3;
        $rootScope.departamento = null;
    }

    //////////////////////////////////////////////////////////////////////////
    //Departamento
    //////////////////////////////////////////////////////////////////////////
    var getDepartamentoSuccessCallback = function (data, status, headers, config) {
        $rootScope.listaDepartamentos = data;
    }

    $scope.LoadDepartamento = function () {
        searchRepository.getDepartamento($rootScope.empleado.idUsuario, $rootScope.empresa.idEmpresa, $rootScope.agencia.idSucursal)
            .success(getDepartamentoSuccessCallback)
            .error(errorCallBack);
    }

    $scope.SetDepartamento = function (dep) {
        $rootScope.departamento = dep;
        $rootScope.searchlevel = 5;
    };

    $scope.ClearDepartamento = function () {
        $rootScope.departamento = null;
    }

    //////////////////////////////////////////////////////////////////////////
    //Obtiene los proveedores
    $scope.ShowSearchProveedor = function () {
        $('#searchProveedor').modal('show');
    };

    $scope.BuscarProveedor = function () {
        searchRepository.getProveedor($scope.textProveedor)
            .success(getProveedorSuccessCallback)
            .error(errorCallBack);
    };

    var getProveedorSuccessCallback = function (data, status, headers, config) {
        $rootScope.listaProveedores = data;
        alertFactory.success('Se ha(n) encontrado ' + data.length + ' proveedor(es) que coniciden con la búsqueda.');
    };

    $scope.SetProveedor = function (pro) {
        $rootScope.proveedor = pro;
        $('#searchProveedor').modal('hide');
    };

    $scope.ClearProveedor = function () {
        $rootScope.proveedor = null;
    }

    //////////////////////////////////////////////////////////////////////////
    //DatePicker
    $scope.today = function () {
        $scope.dt1 = new Date();
        $scope.dt2 = new Date();
    };

    $scope.clear = function () {
        $scope.dt1 = null;
        $scope.dt2 = null;
    };

    // Disable weekend selection
    $scope.disabled = function (date, mode) {
        return (mode === 'day' && (date.getDay() === -1 || date.getDay() === 7));
    };

    $scope.toggleMin = function () {
        $scope.minDate = $scope.minDate ? null : new Date();
    };

    $scope.open1 = function ($event) {
        $event.preventDefault();
        $event.stopPropagation();
        $scope.opened1 = true;
    };

    $scope.open2 = function ($event) {
        $event.preventDefault();
        $event.stopPropagation();
        $scope.opened2 = true;
    };

    $scope.dateOptions = {
        formatYear: 'yy',
        startingDay: 1
    };

    $scope.initDate = new Date();
    $scope.formats = ['dd-MMMM-yyyy', 'yyyy/MM/dd', 'dd.MM.yyyy', 'shortDate'];
    $rootScope.format = $scope.formats[0];

    $scope.searchByCleinteRFC = function () {
        //variable para conseguir el id del proceso
        var idProceso = ($rootScope.tipoProceso == null ? 0 : $rootScope.tipoProceso);
        $rootScope.idProceso = idProceso;

        $('#btnBuscar').button('loading');
        searchRepository.getFoliosByClienteRfc($scope.folioBusca, $rootScope.idProceso, $rootScope.empleado.idUsuario)
            .success(getFoliosSuccessCallback)
            .error(errorCallBack);
    }

    $scope.searchByCleinteId = function () {
        //variable para conseguir el id del proceso
        var idProceso = ($rootScope.tipoProceso == null ? 0 : $rootScope.tipoProceso);
        $rootScope.idProceso = idProceso;

        $('#btnBuscar').button('loading');
        searchRepository.getFoliosByClienteId($scope.folioBusca, $rootScope.idProceso, $rootScope.empleado.idUsuario)
            .success(getFoliosSuccessCallback)
            .error(errorCallBack);
    }

    $scope.showBtnReporte = (ordneCompra) => {
        searchRepository.showBtnReporte(ordneCompra).then(res => {
            console.log('ESTE ES MI RES=======', res);
            $rootScope.showBtnReporteIndividual = res.data[0].result;
        });
    }
});