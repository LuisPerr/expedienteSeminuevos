registrationModule.controller("administradorController", function ($scope, $rootScope, $location, utils, empleadoRepository, localStorageService, alertFactory, alertaRepository, globalFactory, administradorRepository, searchRepository) {

	$rootScope.procesoAdmin;
	$scope.canalVentaCompra = false;
	$rootScope.tipoCanal = '';
	$rootScope.listaCanales;
	$rootScope.canalesAdmin;
	$rootScope.listaEstados;
	$rootScope.estadosAdmin;
	$rootScope.listaCrud;
	$rootScope.showDataCrud = false;
	$rootScope.nombreDocGuardar = '';
	$rootScope.confDocumentoSave = {};
	$rootScope.compraVentaNewDocument = []
	$rootScope.addNewDocumento = false;
	$rootScope.nameNewDocument = '';
	$rootScope.acceptDocumentosVarios = 0;
	$rootScope.sendSaveNewDocument = false;
	$rootScope.opened1 = false;
	$scope.dt1 = null;
	$scope.minDate = new Date(2020, 07, 20);
	$rootScope.dtNew = null;
	$rootScope.minDateNew = new Date(2020, 07, 20);
	$rootScope.documentoConfiguracionUpd = {};
	$rootScope.nameUpdateConfSave = '';
	$rootScope.updAcceptDocumentosVarios;
	$scope.searchSelectAllSettings = {
		enableSearch: true,
		showSelectAll: true,
		keyboardControls: true,
		externalIdProp: '',
		scrollableHeight: '250px',
		scrollable: true
	};
	$rootScope.UpdMasivo = false;
	$rootScope.tabDocumentosFaltantes = 1;
	$rootScope.listaProcesosMasivo = [];
	$rootScope.procesoAdminMasivo;
	$rootScope.dataCanales = [];
	$rootScope.modelCanales = [];
	$rootScope.dataEstados = [];
	$rootScope.modelEstados = [];
	$rootScope.canalesMaisvo = false;
	$rootScope.listaCrudMasivo = [];
	$scope.dtM1 = null;
	$rootScope.dataDocumentosMasivo = [];
	$rootScope.tableUpd = true;

	//Grupo de funciones de inicio
	$scope.init = function () {
		$('#loadModalAdmin').modal('show');
		$rootScope.cargaDocs = false;
		$rootScope.busquedaVar = false;
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
		if (!($('#lgnUser').val().indexOf('[') > -1)) {
			localStorageService.set('lgnUser', $('#lgnUser').val());
		} else {
			if (($('#lgnUser').val().indexOf('[') > -1) && !localStorageService.get('lgnUser')) {
				if (getParameterByName('employee') != '') {
					$rootScope.currentEmployee = getParameterByName('employee');
					return;
				} else {
					alert('Inicie sesión desde panel de aplicaciones.');
					window.close();
				}

			}
		}
		//Obtengo el empleado logueado
		$rootScope.currentEmployee = localStorageService.get('lgnUser');
	};

	var getEmpleadoSuccessCallback = function (data, status, headers, config) {
		$rootScope.empleado = data;
		if ($rootScope.empleado != null) {
			empleadoRepository.getPermisosUsuario($rootScope.empleado.idUsuario, $rootScope.empleado.idPerfil).then((res) => {
				var dataPermisos = '';
				res.data.forEach((value, key) => {
					dataPermisos += `"${value.nombre}":${value.aplica},`
				});
				$rootScope.allPermisosDocumentos = JSON.parse(`{${dataPermisos.substring(0, dataPermisos.length - 1)}}`);
				$rootScope.loadProceso();
				$('#closeMenu').click();
				$('#loadModalAdmin').modal('hide');
			});
		} else {
			alertFactory.error('El empleado no existe en el sistema.');
		};
	};


	//Mensajes en caso de error
	var errorCallBack = function (data, status, headers, config) {
		$('#btnEnviar').button('reset');
		//Reinicio el tipo de folio

		alertFactory.error('Ocurrio un problema');
	};

	$rootScope.goBusqueda = () => {
		$rootScope.procesoAdmin = {};
		$('#loadModalAdmin').modal('hide');
		$location.path('/');
	}

	$rootScope.SetProcesoAdmin = (proceso) => {
		$rootScope.procesoAdmin = proceso;
		$rootScope.showDataCrud = false;
		$scope.canalVentaCompra = true;
		$rootScope.listaCanales;
		$rootScope.canalesAdmin = undefined;
		$rootScope.listaEstados;
		$rootScope.estadosAdmin = undefined;
		$rootScope.nameNewDocument = '';
		$rootScope.addNewDocumento = false;
		$('#loadModalAdmin').modal('show');
		if ($rootScope.procesoAdmin.Proc_Id == 1) {
			$rootScope.tipoCanal = 'Canal de Compra';
			$scope.getAllEstados();
		} else {
			$rootScope.tipoCanal = 'Canal de Venta';
			$rootScope.estadosAdmin = { id_estado: '00', estado: '' };
			$scope.estadoRepublica = false;
		};
		$scope.getAllCanales();
	};

	$scope.getAllCanales = () => {
		administradorRepository.getCanales($rootScope.procesoAdmin.Proc_Id).then((res) => {
			$rootScope.listaCanales = res.data;
			$rootScope.addNewDocumento = true;
			$('#loadModalAdmin').modal('hide');
		});
	};

	$rootScope.setCanales = (canal) => {
		if ($rootScope.procesoAdmin.Proc_Id == 1) {
			$rootScope.estadosAdmin = undefined;
		} else {
			$rootScope.estadosAdmin = { id_estado: '00', estado: '' };
		};

		$rootScope.showDataCrud = false;
		$rootScope.canalesAdmin = canal;
	};

	$scope.getAllEstados = () => {
		administradorRepository.getEstados().then(res => {
			$rootScope.listaEstados = res.data;
			$scope.estadoRepublica = true;
		});
	};

	$rootScope.setEstados = estado => {
		document.getElementById("myInput").value = '';
		$rootScope.filterFunction();
		$rootScope.showDataCrud = false;
		if ($rootScope.procesoAdmin.Proc_Id == 1) {
			$rootScope.estadosAdmin = estado;
		};
	};

	/** METODOS DATE PICKER */
	$scope.today = function () {
		$scope.dt1 = new Date();
		$rootScope.dt2 = new Date();
	};

	$scope.clear = function () {
		$scope.dt1 = null;
		$rootScope.dt2 = null;
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

	$rootScope.openNew = function ($event) {
		$event.preventDefault();
		$event.stopPropagation();
		$rootScope.openedNew = true;
	};

	$scope.dateOptions = {
		formatYear: 'yy',
		startingDay: 1
	};

	$rootScope.dateOptionsNew = {
		formatYear: 'yy',
		startingDay: 1
	}

	$scope.initDate = new Date();
	$scope.formats = ['dd-MMMM-yyyy', 'yyyy/MM/dd', 'dd.MM.yyyy', 'shortDate'];
	$rootScope.format = $scope.formats[0];

	$rootScope.initDateNew = new Date();
	$rootScope.formatsNew = ['dd-MMMM-yyyy', 'yyyy/MM/dd', 'dd.MM.yyyy', 'shortDate'];
	$rootScope.formatNew = $scope.formats[0];


	$rootScope.buscarCrud = () => {
		if (($rootScope.procesoAdmin == undefined || $rootScope.procesoAdmin.length == 0) ||
			($rootScope.canalesAdmin == undefined || $rootScope.canalesAdmin.length == 0) ||
			($rootScope.estadosAdmin == undefined || $rootScope.estadosAdmin.length == 0)) {
			alertFactory.warning('Todos los datos son necesarios');
		} else {
			$("#loadModalAdmin").modal("show");
			administradorRepository.getAllDataCrud($rootScope.procesoAdmin.Proc_Id, $rootScope.canalesAdmin.idCanal, $rootScope.estadosAdmin.id_estado).then(res => {
				if (res.data.length > 0) {
					$rootScope.showDataCrud = true;
					$rootScope.listaCrud = res.data;
					$scope.dt1 = null;
					$('#tablaAdmin').DataTable().destroy();
					$("#loadModalAdmin").modal("hide");
					setTimeout(() => {
						$('#tablaAdmin').DataTable({
							destroy: true,
							"responsive": true,
							"searching": true,
							orderable: false,
							"pageLength": 50,
							"language": {
								search: '<i class="fa fa-search" aria-hidden="true"></i>',
								searchPlaceholder: 'Buscar',
								oPaginate: {
									sNext: '<i class="fa fa-caret-right" aria-hidden="true"></i>',
									sPrevious: '<i class="fa fa-caret-left" aria-hidden="true"></i>'
								}
							}
						});
					}, 500);
				} else {
					$rootScope.showDataCrud = false;
					alertFactory.error('Error al traer los datos');
				};
			});
		};
	};

	$rootScope.saveConfiguracion = documento => {
		$rootScope.nombreDocGuardar = documento.doc_nombre;
		$rootScope.confDocumentoSave = documento;
		$('#confirmSave').modal('show');
	};

	$rootScope.confirmConfiguracion = () => {
		let fechaInicialUpdate = ($scope.dt1 == null ? null : $scope.dt1.format("dd/mm/yyyy"));
		if (fechaInicialUpdate == null) {
			$('#confirmSave').modal('hide');
			alertFactory.warning('Debe seleccionar una fecha de inicio de la configuracion.');
		} else {
			$('#confirmSave').modal('hide');
			$('#loadModalAdmin').modal('show');

			administradorRepository.updateAllDataCrud($rootScope.procesoAdmin.Proc_Id, $rootScope.confDocumentoSave, $rootScope.empleado.idUsuario, fechaInicialUpdate).then(res => {
				const { success, msg } = res.data[0];

				if (success == 1) {
					alertFactory.success(msg)
				} else {
					alertFactory.warning(msg)
				};
				$('#loadModalAdmin').modal('hide');

				if (success !== 2) {
					setTimeout(() => {
						$scope.dt1 = null;
						$rootScope.buscarCrud();
					}, 500);
				};
			});
		};
	};

	$rootScope.dismissConfiguracion = () => {
		$rootScope.nombreDocGuardar = '';
		$rootScope.confDocumentoSave = {};
		$('#confirmSave').modal('hide');
	};

	$rootScope.newDocument = () => {
		$rootScope.showDataCrud = false;
		$rootScope.listaCanales;
		$rootScope.canalesAdmin = undefined;
		$rootScope.listaEstados;
		$rootScope.estadosAdmin = undefined;
		$rootScope.compraVentaNewDocument = [];
		$rootScope.nameNewDocument = '';
		$rootScope.acceptDocumentosVarios = 0;
		$rootScope.dtNew = null;
		$rootScope.listaCanales.forEach((value, key) => {
			$rootScope.compraVentaNewDocument.push({ "idCanal": value.idCanal, "descripcionCanal": value.descripcionCanal, "doc_activo": 1, "doc_opcional": 0, "doc_fisica": 0, "doc_moral": 0, "doc_fisicaAE": 0 });
		});
		$('#newDocument').modal('show');
	};

	$rootScope.saveAddNewDocument = camino => {
		if (camino == 1) {
			$('#newDocument').modal('hide');
			$('#confirmNewDocument').modal('show');
		} else {
			let fechaInicialSave = ($rootScope.dtNew == null ? null : $rootScope.dtNew.format("dd/mm/yyyy"));
			if (fechaInicialSave == null) {
				alertFactory.warning('Debe seleccionar una fecha de inicio para el documento.');
				$('#confirmNewDocument').modal('hide');
				setTimeout(() => {
					$('#newDocument').modal('show');
				}, 400);
			} else {
				if ($rootScope.nameNewDocument == '' || $rootScope.nameNewDocument == null || $rootScope.nameNewDocument == undefined) {
					alertFactory.warning('Debes agregar un nombre de documento');
					$('#confirmNewDocument').modal('hide');
					$('#newDocument').modal('show');
				} else {
					$('#confirmNewDocument').modal('hide');
					$rootScope.sendSaveNewDocument = true;
					$('#loadModalAdmin').modal('show');
					let nameCorto = '';
					let carpetaVarios = '';
					if ($rootScope.nameNewDocument.split(' ').length > 1) {
						$rootScope.nameNewDocument.split(' ').forEach((value, key) => {
							if (key <= 2) {
								nameCorto += value;
							};
						});
					} else {
						nameCorto = $rootScope.nameNewDocument
					};

					// if ($rootScope.acceptDocumentosVarios == 1) {
					carpetaVarios = $rootScope.nameNewDocument.split(' ').length > 1 ? `${$rootScope.nameNewDocument.split(' ')[0]}${$rootScope.nameNewDocument.split(' ')[1]}` : $rootScope.nameNewDocument.split(' ')[0]
					// };

					administradorRepository.saveNewDocument(
						$rootScope.procesoAdmin.Proc_Id,
						$rootScope.compraVentaNewDocument,
						$rootScope.procesoAdmin.Proc_Id == 1 ? $rootScope.listaEstados : [{ id_estado: '00', estado: '' }],
						$rootScope.nameNewDocument,
						nameCorto,
						$rootScope.acceptDocumentosVarios,
						carpetaVarios,
						$rootScope.empleado.idUsuario,
						fechaInicialSave
					).then(res => {
						$('#loadModalAdmin').modal('hide');
						$rootScope.sendSaveNewDocument = false;
						if (res.data[0].success == 1) {
							alertFactory.success('Se guardo con éxito el documento');
						} else if (res.data[0].success == 2) {
							$('#newDocument').modal('show');
							alertFactory.warning('Ese documento ya existe.');
						} else {
							alertFactory.error('Error al guardar el documento, favor de contactar al administrador.');
						};
					});
				};
			};
		};
	};

	$rootScope.dismissAddNewDocument = () => {
		$rootScope.nameNewDocument = '';
		$rootScope.acceptDocumentosVarios = 0;
		$('#newDocument').modal('hide');
	};

	$rootScope.dismissConfirmNewDocument = () => {
		$('#confirmNewDocument').modal('hide');
		setTimeout(() => {
			$('#newDocument').modal('show');
		}, 300);
	};

	$rootScope.deleteConfiguracionPrevia = documento => {
		$('#loadModalAdmin').modal('show');
		administradorRepository.delConfigUpdateById(documento.id_confUpd).then(res => {
			$('#loadModalAdmin').modal('hide');
			if (res.data[0].success == 1) {
				alertFactory.success('Se elimino la configuración con éxito')
			} else {
				alertFactory.error('Ocurrio un erro al eliminar la configuracion, favor de contactar al administrador.')
			};
			setTimeout(() => {
				$scope.dt1 = null;
				$rootScope.buscarCrud();
			}, 500);
		});
	};

	$rootScope.deleteDocumentoPrevio = documento => {
		$('#loadModalAdmin').modal('show');
		administradorRepository.delConfigSaveById(documento.id_documento).then((res) => {
			$('#loadModalAdmin').modal('hide');
			if (res.data[0].success == 1) {
				alertFactory.success('Se elimino el documento con éxito para todos los estados')
			} else {
				alertFactory.error('Ocurrio un erro al eliminar el documento, favor de contactar al administrador.')
			};
			setTimeout(() => {
				$rootScope.dtNew = null;
				$rootScope.buscarCrud();
			}, 500);
		});
	};

	$rootScope.updConfSave = documeto => {
		$rootScope.documentoConfiguracionUpd = documeto;
		$rootScope.nameUpdateConfSave = documeto.doc_nombre;
		$rootScope.updAcceptDocumentosVarios = documeto.doc_varios;
		$rootScope.dtNew = new Date(documeto.conSav_fechaInicio.split('/')[2], documeto.conSav_fechaInicio.split('/')[1] - 1, documeto.conSav_fechaInicio.split('/')[0]);

		$('#updConfiguracionSave').modal('show');
	};

	$rootScope.updConfigSave = () => {
		$('#updConfiguracionSave').modal('hide');
		$('#loadModalAdmin').modal('show');
		const { id_documento, doc_idEstado, doc_idCanal, doc_activo, doc_opcional, doc_moral, doc_fisica, doc_fisicaAE, doc_varios } = $rootScope.documentoConfiguracionUpd;
		let fechaInicialSave = ($rootScope.dtNew == null ? null : $rootScope.dtNew.format("dd/mm/yyyy"));
		var nameCorto = '';
		var carpetaVarios = '';
		if ($rootScope.nameUpdateConfSave.split(' ').length > 1) {
			$rootScope.nameUpdateConfSave.split(' ').forEach((value, key) => {
				if (key <= 2) {
					nameCorto += value;
				};
			});
		} else {
			nameCorto = $rootScope.nameNewDocument
		};

		// if ($rootScope.updAcceptDocumentosVarios == 1) {
		carpetaVarios = $rootScope.nameUpdateConfSave.split(' ').length > 1 ? `${$rootScope.nameUpdateConfSave.split(' ')[0]}${$rootScope.nameUpdateConfSave.split(' ')[1]}` : $rootScope.nameUpdateConfSave.split(' ')[0]
		// };

		if (fechaInicialSave == null) {
			alertFactory.warning('Debes seleccionar una fecha de inicio');
		} else {
			administradorRepository.updConfigSaveByIdDocumento(
				id_documento,
				doc_idEstado,
				$rootScope.procesoAdmin.Proc_Id,
				doc_idCanal,
				$rootScope.nameUpdateConfSave,
				fechaInicialSave,
				doc_activo,
				doc_opcional,
				doc_moral,
				doc_fisica,
				doc_fisicaAE,
				nameCorto,
				carpetaVarios,
				$rootScope.updAcceptDocumentosVarios
			).then(res => {
				if (res.data[0].success == 1) {
					alertFactory.success('Se actualizo la configuracion con éxito');
				} else {
					alertFactory.error('Ocurrio un erro al actualizar el documento, favor de contactar al administrador.')
				}
				setTimeout(() => {
					$rootScope.documentoConfiguracionUpd = {};
					$rootScope.nameUpdateConfSave = '';
					$rootScope.dtNew = null;
					$rootScope.buscarCrud();
				}, 500);
			});
		};
	};

	$rootScope.dismissUpdConfiguracionSave = () => {
		$rootScope.documentoConfiguracionUpd = {};
		$rootScope.nameUpdateConfSave = '';
		$rootScope.dtNew = null;
		$('#updConfiguracionSave').modal('hide');
	}

	/**FUNCION ENCARGADA DE HACER LA BUSQUEDA EN EL DROP DAWN DE ESTADOS */
	$rootScope.filterFunction = () => {
		var input, filter, ul, li, a, i;
		input = document.getElementById("myInput");
		filter = input.value.toUpperCase();
		div = document.getElementById("myDropdown");
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

	/**FUNCIONES DEL UPDATE MASIVO */
	$rootScope.setTab = tab => {
		$scope.dtM1 = null;
		if (tab == 1) {
			$rootScope.UpdMasivo = false;
			$rootScope.modelCanales = [];
			$rootScope.modelEstados = [];
			$rootScope.procesoAdminMasivo = null;
			$rootScope.canalesMaisvo = false;
			$rootScope.tabDocumentosFaltantes = tab;
		} else {
			$rootScope.procesoAdmin = undefined;
			$rootScope.showDataCrud = false;
			$scope.canalVentaCompra = false;
			$rootScope.listaCanales;
			$rootScope.canalesAdmin = undefined;
			$rootScope.listaEstados;
			$rootScope.estadosAdmin = undefined;
			$rootScope.nameNewDocument = '';
			$rootScope.addNewDocumento = false;
			$scope.estadoRepublica = false;
			$rootScope.loadProcesoMasivo();
			$rootScope.UpdMasivo = true;
			$rootScope.tabDocumentosFaltantes = tab
		};
	};

	$rootScope.loadProcesoMasivo = () => {
		let CXP = $rootScope.allPermisosDocumentos.ConsultarProcesoCXP;
		let CXC = $rootScope.allPermisosDocumentos.ConsultarProcesoCXC == 1 ? 2 : 0;
		searchRepository.getProcesos(CXP, CXC).then(res => {
			$rootScope.listaProcesosMasivo = res.data;
		});
	};

	$rootScope.SetProcesoAdminMasivo = proceso => {
		if ($rootScope.procesoAdminMasivo === null || $rootScope.procesoAdminMasivo === undefined) {
			$rootScope.procesoAdminMasivo = proceso;
			$scope.dtM1 = null;
			$rootScope.dataCanales = [];
			$rootScope.modelCanales = [];
			$rootScope.dataEstados = [];
			$rootScope.modelEstados = [];
			$("#loadModalAdmin").modal("show");
			if ($rootScope.procesoAdminMasivo.Proc_Id == 1) {
				$scope.getAllEstadosMasivo();
			};
			$scope.getAllCanalesMasivo();
			$scope.getDataCrudMasivo();
		} else {
			if (proceso.Proc_Id !== $rootScope.procesoAdminMasivo.Proc_Id) {
				$rootScope.procesoAdminMasivo = proceso;
				$scope.dtM1 = null;
				$rootScope.dataCanales = [];
				$rootScope.modelCanales = [];
				$rootScope.dataEstados = [];
				$rootScope.modelEstados = [];
				$("#loadModalAdmin").modal("show");
				if ($rootScope.procesoAdminMasivo.Proc_Id == 1) {
					$scope.getAllEstadosMasivo();
				};
				$scope.getAllCanalesMasivo();
				$scope.getDataCrudMasivo();
			};
		};
	};

	$scope.getDataCrudMasivo = () => {
		administradorRepository.getCanales($rootScope.procesoAdminMasivo.Proc_Id).then(res => {
			res.data.forEach(value => {
				let obj = { id: value.idCanal, label: value.descripcionCanal };
				$scope.dataCanales.push(obj);
			});
			$rootScope.canalesMaisvo = true;
		});
	};

	$scope.getAllCanalesMasivo = () => {
		administradorRepository.dataMasivoCrud($rootScope.procesoAdminMasivo.Proc_Id).then(res => {
			$rootScope.listaCrudMasivo = res.data;
			$('#tablaAdminMasivo').DataTable().destroy();
			$("#loadModalAdmin").modal("hide");
			setTimeout(() => {
				$('#tablaAdminMasivo').DataTable({
					destroy: true,
					"responsive": true,
					"searching": true,
					orderable: false,
					"pageLength": 50,
					"language": {
						search: '<i class="fa fa-search" aria-hidden="true"></i>',
						searchPlaceholder: 'Buscar',
						oPaginate: {
							sNext: '<i class="fa fa-caret-right" aria-hidden="true"></i>',
							sPrevious: '<i class="fa fa-caret-left" aria-hidden="true"></i>'
						}
					}
				});
			}, 500);
		});
	};

	$scope.getAllEstadosMasivo = () => {
		administradorRepository.getEstados().then(res => {
			res.data.forEach(value => {
				let obj = { id: value.id_estado, label: value.estado };
				$scope.dataEstados.push(obj);
			});
		});
	};

	$rootScope.saveDataMasivo = documento => {
		let estados = '';
		const fechaInicialUpdate = ($scope.dtM1 == null ? null : $scope.dtM1.format("dd/mm/yyyy"));
		if (fechaInicialUpdate == null) {
			alertFactory.warning('Favor de seleccionar una fecha de inicio.');
		} else {
			if ($rootScope.modelCanales.length == 0) {
				alertFactory.warning('Favor de seleccionar al menos un canal.');
			} else {
				if ($rootScope.procesoAdminMasivo.Proc_Id == 1 && $rootScope.modelEstados.length == 0) {
					alertFactory.warning('Favor de seleccionar al menos un estado.');
				} else {
					$("#loadModalAdmin").modal("show");
					$rootScope.procesoAdminMasivo.Proc_Id == 1 ? estados = $scope.estadosSeleccionados() : estados = '00';
					administradorRepository.insDataMasivo($rootScope.procesoAdminMasivo.Proc_Id, $rootScope.modelCanales, estados, documento, $rootScope.empleado.idUsuario, fechaInicialUpdate).then(res => {
						if (res.data[0].success == 1) {
							alertFactory.success(res.data[0].msg);
						} else {
							alertFactory.warning(res.data[0].msg);
						};
						$("#loadModalAdmin").modal("hide");
						setTimeout(() => {
							$scope.getAllCanalesMasivo();
							$scope.dtM1 = null;
							$rootScope.modelCanales = [];
							$rootScope.modelEstados = [];
						}, 300);
					});
				};
			};
		};
	};

	$rootScope.deleteDataMasivo = documento => {
		let estados = '';
		if ($rootScope.modelCanales.length == 0) {
			alertFactory.warning('Favor de seleccionar al menos un canal.');
		} else {
			if ($rootScope.procesoAdminMasivo.Proc_Id == 1 && $rootScope.modelEstados.length == 0) {
				alertFactory.warning('Favor de seleccionar al menos un estado.');
			} else {
				$("#loadModalAdmin").modal("show");
				$rootScope.procesoAdminMasivo.Proc_Id == 1 ? estados = $scope.estadosSeleccionados() : estados = '00';
				administradorRepository.delDataMasivo($rootScope.procesoAdminMasivo.Proc_Id, $rootScope.modelCanales, estados, documento.id_documento).then(res => {
					if (res.data[0].success === 1) {
						alertFactory.success(res.data[0].msg);
					} else {
						alertFactory.warning(res.data[0].msg);
					};
					$("#loadModalAdmin").modal("hide");
					setTimeout(() => {
						$scope.getAllCanalesMasivo();
						$scope.dtM1 = null;
						$rootScope.modelCanales = [];
						$rootScope.modelEstados = [];
					}, 300);
				});
			};
		};
	};

	$rootScope.selDataPorProcesar = () => {
		let estados = '';
		if ($rootScope.modelCanales.length == 0) {
			alertFactory.warning('Favor de seleccionar al menos un canal.');
		} else {
			if ($rootScope.procesoAdminMasivo.Proc_Id == 1 && $rootScope.modelEstados.length == 0) {
				alertFactory.warning('Favor de seleccionar al menos un estado.');
			} else {
				$("#loadModalAdmin").modal("show");
				$rootScope.procesoAdminMasivo.Proc_Id == 1 ? estados = $scope.estadosSeleccionados() : estados = '00';
				administradorRepository.selDataPorProcesar($rootScope.procesoAdminMasivo.Proc_Id, estados, $scope.canalesSeleccionados()).then(res => {
					$("#loadModalAdmin").modal("hide");
					if (res.data.length > 0) {
						$rootScope.dataDocumentosMasivo = res.data;
						$rootScope.tableUpd = false;
						$('#tablaDataMasivo').DataTable().destroy();
						setTimeout(() => {
							$('#tablaDataMasivo').DataTable({
								destroy: true,
								"responsive": true,
								"searching": true,
								orderable: false,
								"pageLength": 50,
								"language": {
									search: '<i class="fa fa-search" aria-hidden="true"></i>',
									searchPlaceholder: 'Buscar',
									oPaginate: {
										sNext: '<i class="fa fa-caret-right" aria-hidden="true"></i>',
										sPrevious: '<i class="fa fa-caret-left" aria-hidden="true"></i>'
									}
								}
							});
						}, 500);
						$("#dataDocumentsMasivo").modal("show");
					} else {
						$rootScope.tableUpd = true;
						alertFactory.warning('No se encontraron datos');
					};
				});
			};
		};
	};

	$scope.backToUpdateMasivo = () => {
		$scope.dtM1 = null;
		$rootScope.modelCanales = [];
		$rootScope.modelEstados = [];
		$rootScope.tableUpd = true;
	};

	$scope.estadosSeleccionados = () => {
		let stringEstados = '';
		$rootScope.modelEstados.forEach(value => {
			stringEstados += `'${value.id}', `;
		});
		return stringEstados.substring(0, stringEstados.length - 2);
	};

	$scope.canalesSeleccionados = () => {
		let stringCanales = '';
		$rootScope.modelCanales.forEach(value => {
			stringCanales += `${value.id}, `
		});

		return stringCanales.substring(0, stringCanales.length - 2);
	};

	$scope.openM1 = $event => {
		$event.preventDefault();
		$event.stopPropagation();
		$scope.openedM1 = true;
	};
});

