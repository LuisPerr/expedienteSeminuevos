var administradorView = require('../views/reference'),
	administradorModel = require('../models/dataAccess');

var confParams = require('../../../conf');
var validaInsercion = false;

var administrador = function (conf) {
	this.conf = conf || {};

	this.view = new administradorView();
	this.model = new administradorModel({
		parameters: this.conf.parameters
	});

	this.response = function () {
		this[this.conf.funcionalidad](this.conf.req, this.conf.res, this.conf.next);
	};
};

administrador.prototype.get_allCanales = function (req, res, next) {

	var self = this;

	var params = [
		{ name: 'idProceso', value: req.query.idProceso, type: self.model.types.INT }
	];

	this.model.query('[expedienteSeminuevo].[SEL_ALL_TIPO_COMPRA_VENTA_SP]', params, function (error, result) {
		self.view.expositor(res, {
			error: error,
			result: result
		});
	});
};

administrador.prototype.get_allEstados = function (req, res, next) {

	var self = this;

	this.model.query('[expedienteSeminuevo].[SEL_ALL_ESTADOS_REPUBLICA_SP]', [], function (error, result) {
		self.view.expositor(res, {
			error: error,
			result: result
		});
	});
};

administrador.prototype.get_allDataCrud = function (req, res, next) {

	var self = this;

	var params = [
		{ name: 'idProceso', value: req.query.idProceso, type: self.model.types.INT },
		{ name: 'tipoCompraVenta', value: req.query.tipoCompraVenta, type: self.model.types.INT },
		{ name: 'idEstado', value: req.query.idEstado, type: self.model.types.STRING }
	];

	this.model.query('[expedienteSeminuevo].[SEL_ALL_DOCUMENTS_CRUD_SP]', params, function (error, result) {
		self.view.expositor(res, {
			error: error,
			result: result
		});
	});
};

administrador.prototype.get_updateDataCrud = function (req, res, next) {
	var self = this;
	const {
		dataDocumento,
		idProceso,
		idUsuario,
		fechaInicial } = req.query;

	const {
		id_documento,
		doc_nombre,
		doc_activo,
		doc_opcional,
		doc_moral,
		doc_fisica,
		doc_fisicaAE,
		doc_idCanal,
		doc_idEstado,
		doc_varios } = JSON.parse(dataDocumento);

	if (doc_activo == 0) {
		doc_opcional = 0;
		doc_moral = 0;
		doc_fisica = 0;
		doc_fisicaAE = 0
	} else {
		if (doc_moral == 0 && doc_fisica == 0 && doc_fisicaAE == 0) {
			return res.status(400).json([{
				success: 2,
				msg: 'Debe tener almenos un tipo de persona'
			}]);
		};
	};

	var params = [
		{ name: 'idProceso', value: idProceso, type: this.model.types.INT },
		{ name: 'idCanal', value: doc_idCanal, type: this.model.types.INT },
		{ name: 'idEstado', value: doc_idEstado, type: this.model.types.STRING },
		{ name: 'idDocumento', value: id_documento, type: this.model.types.INT },
		{ name: 'doc_activo', value: doc_activo, type: this.model.types.INT },
		{ name: 'doc_opcional', value: doc_opcional, type: this.model.types.INT },
		{ name: 'doc_moral', value: doc_moral, type: this.model.types.INT },
		{ name: 'doc_fisica', value: doc_fisica, type: this.model.types.INT },
		{ name: 'doc_fisicaAE', value: doc_fisicaAE, type: this.model.types.INT },
		{ name: 'idUsuario', value: idUsuario, type: this.model.types.INT },
		{ name: 'fechaInicio', value: fechaInicial, type: this.model.types.STRING },
		{ name: 'doc_varios', value: doc_varios, type: this.model.types.INT }
	];

	this.model.query('[expedienteSeminuevo].[INS_CONFIGURACION_UPDATE_SP]', params, function (error, result) {
		self.view.expositor(res, {
			error: error,
			result: result
		});
	});
};

administrador.prototype.post_saveNewDocument = async function (req, res, next) {
	var self = this;
	validaInsercion = false;
	const { idProceso, dataCanales, dataEstados, nameNewDocument, nameCorto, doc_varios, carpetaVarios, idUsuario, fechaInicial } = req.body;

	let paramsDocu = [
		{ name: 'doc_nombre', value: nameNewDocument, type: self.model.types.STRING },
		{ name: 'idProceso', value: idProceso, type: self.model.types.INT }
	]

	self.model.query('[expedienteSeminuevo].[SEL_VALIDA_DOCUMENTO_CAT_DOCUMENTOS_SP]', paramsDocu, async function (error, result) {
		if (result[0].success == 1) {
			return res.status(200).json([{
				success: 2,
				msg: 'El nombre del documento ya existe'
			}]);
		} else {
			self.model.query('[expedienteSeminuevo].[SEL_LAST_ID_CAT_DOCUMENTOS_SP]', [], async function (error, result) {
				if (!error) {
					for (let i = 0; i <= dataCanales.length - 1; i++) {
						console.log('==============================dataCanales==============================');
						await administrador.createDataInsert(dataCanales[i], idProceso, nameNewDocument, dataEstados, nameCorto, result[0].maxIdDocumento + 1, doc_varios, carpetaVarios, idUsuario, fechaInicial);

						if (i == dataCanales.length - 1) {
							if (validaInsercion) {
								var params = [{ name: 'id_documento', value: result[0].maxIdDocumento + 1, type: self.model.types.INT }];
								self.model.query('[expedienteSeminuevo].[DEL_DOCUMENTO_CAT_DOCUMENTOS_SP]', params, async function (error, result) {
									return res.status(200).json([{
										success: 0,
										msg: 'Error al guardar el documento'
									}]);
								});
							} else {
								console.log('Fin');
								return res.status(200).json([{
									success: 1,
									msg: 'Se guardo el documento éxito'
								}]);
							};
						};
					};
				} else {
					return res.status(200).json([{
						success: 0,
						msg: 'Error al guardar el documento'
					}]);
				};
			});
		};
	});

};

administrador.createDataInsert = (dataCanal, idProceso, nameNewDocument, dataEstados, nameCorto, id_documento, doc_varios, carpetaVarios, idUsuario, fechaInicial) => {
	return new Promise(async (resolve) => {

		// for (let i = 0; i <= dataEstados.length - 1; i++) {
		// 	let dataDocument = {
		// 		"id_documento": id_documento,
		// 		"doc_nombre": nameNewDocument,
		// 		"doc_extencion": "pdf",
		// 		"doc_activo": dataCanal.doc_activo,
		// 		"doc_opcional": dataCanal.doc_opcional,
		// 		"doc_proceso": idProceso,
		// 		"doc_fisica": dataCanal.doc_fisica,
		// 		"doc_moral": dataCanal.doc_moral,
		// 		"doc_varios": doc_varios,
		// 		"doc_usuarios": 1,
		// 		"doc_nombreCorto": nameCorto,
		// 		"doc_fisicaAE": dataCanal.doc_fisicaAE,
		// 		"doc_certificado": 0,
		// 		"doc_idCanal": dataCanal.idCanal,
		// 		"doc_idEstado": dataEstados[i].id_estado,
		// 		"carpetaVarios": carpetaVarios,
		// 		"idUsuario": idUsuario,
		// 		"fechaInicial": fechaInicial
		// 	};

		// 	await administrador.insertDataDocumento(dataDocument)

		// 	if (i == dataEstados.length - 1) {
		// 		resolve({ success: 1 });
		// 	};
		// };

		let dataDocument = {
			"id_documento": id_documento,
			"doc_nombre": nameNewDocument,
			"doc_extencion": "pdf",
			"doc_activo": dataCanal.doc_activo,
			"doc_opcional": dataCanal.doc_opcional,
			"doc_proceso": idProceso,
			"doc_fisica": dataCanal.doc_fisica,
			"doc_moral": dataCanal.doc_moral,
			"doc_varios": doc_varios,
			"doc_usuarios": 1,
			"doc_nombreCorto": nameCorto,
			"doc_fisicaAE": dataCanal.doc_fisicaAE,
			"doc_certificado": 0,
			"doc_idCanal": dataCanal.idCanal,
			"doc_idEstado": dataEstados[0].id_estado,
			"carpetaVarios": carpetaVarios,
			"idUsuario": idUsuario,
			"fechaInicial": fechaInicial
		};

		await administrador.insertDataDocumento(dataDocument);
		resolve({ success: 1 });
	});
};

administrador.insertDataDocumento = (dataInsert) => {
	return new Promise((resolve) => {

		let model = new administradorModel({
			parameters: confParams
		});

		const {
			id_documento,
			doc_nombre,
			doc_extencion,
			doc_activo,
			doc_opcional,
			doc_proceso,
			doc_fisica,
			doc_moral,
			doc_varios,
			doc_usuarios,
			doc_nombreCorto,
			doc_fisicaAE,
			doc_certificado,
			doc_idCanal,
			doc_idEstado,
			carpetaVarios,
			idUsuario,
			fechaInicial
		} = dataInsert;

		var params = [
			{ name: 'id_documento', value: id_documento, type: model.types.INT },
			{ name: 'doc_nombre', value: doc_nombre, type: model.types.STRING },
			{ name: 'doc_extencion', value: doc_extencion, type: model.types.STRING },
			{ name: 'doc_activo', value: doc_activo, type: model.types.INT },
			{ name: 'doc_opcional', value: doc_opcional, type: model.types.INT },
			{ name: 'doc_proceso', value: doc_proceso, type: model.types.INT },
			{ name: 'doc_fisica', value: doc_fisica, type: model.types.INT },
			{ name: 'doc_moral', value: doc_moral, type: model.types.INT },
			{ name: 'doc_varios', value: doc_varios, type: model.types.INT },
			{ name: 'doc_usuarios', value: doc_usuarios, type: model.types.INT },
			{ name: 'doc_nombreCorto', value: doc_nombreCorto, type: model.types.STRING },
			{ name: 'doc_fisicaAE', value: doc_fisicaAE, type: model.types.INT },
			{ name: 'doc_certificado', value: doc_certificado, type: model.types.INT },
			{ name: 'doc_idCanal', value: doc_idCanal, type: model.types.INT },
			{ name: 'doc_idEstado', value: doc_idEstado, type: model.types.STRING },
			{ name: 'carpetaVarios', value: carpetaVarios, type: model.types.STRING },
			{ name: 'idUsuario', value: idUsuario, type: model.types.INT },
			{ name: 'fechaInicial', value: fechaInicial, type: model.types.STRING }
		];

		model.query('[expedienteSeminuevo].[INS_CONFIGURACION_DOCUMENTO_SP]', params, async function (error, result) {
			if (result[0].success == 0) {
				validaInsercion = true;
			};
			resolve({ succes: 1 })
		});
	});
};

administrador.prototype.get_delConfigUpdateById = function (req, res, next) {

	var self = this;

	const { id_confUpd } = req.query;

	var params = [
		{ name: 'id_confUpd', value: id_confUpd, type: self.model.types.INT },
	];

	this.model.query('[expedienteSeminuevo].[DEL_CONFIGURACION_UPDATE_BY_ID_SP]', params, function (error, result) {
		self.view.expositor(res, {
			error: error,
			result: result
		});
	});
};

administrador.prototype.get_delConfigSaveById = function (req, res, next) {

	var self = this;

	const { idDocumento } = req.query;

	var params = [
		{ name: 'idDocumento', value: idDocumento, type: self.model.types.INT },
	];

	this.model.query('[expedienteSeminuevo].[DEL_CONFIGURACION_SAVE_BY_ID_SP]', params, function (error, result) {
		self.view.expositor(res, {
			error: error,
			result: result
		});
	});
};

administrador.prototype.get_updConfigSaveByIdDocumento = function (req, res, next) {

	var self = this;

	const { idDocumento,
		doc_idEstado,
		doc_proceso,
		doc_idCanal,
		doc_nombre,
		fechaInicio,
		doc_activo,
		doc_opcional,
		doc_moral,
		doc_fisica,
		doc_fisicaAE,
		nameCorto,
		carpetaVarios,
		doc_varios } = req.query;

	var params = [
		{ name: 'idDocumento', value: idDocumento, type: self.model.types.INT },
		{ name: 'doc_idEstado', value: doc_idEstado, type: self.model.types.STRING },
		{ name: 'doc_proceso', value: doc_proceso, type: self.model.types.INT },
		{ name: 'doc_idCanal', value: doc_idCanal, type: self.model.types.INT },
		{ name: 'doc_nombre', value: doc_nombre, type: self.model.types.STRING },
		{ name: 'fechaInicio', value: fechaInicio, type: self.model.types.STRING },
		{ name: 'doc_activo', value: doc_activo, type: self.model.types.INT },
		{ name: 'doc_opcional', value: doc_opcional, type: self.model.types.INT },
		{ name: 'doc_moral', value: doc_moral, type: self.model.types.INT },
		{ name: 'doc_fisica', value: doc_fisica, type: self.model.types.INT },
		{ name: 'doc_fisicaAE', value: doc_fisicaAE, type: self.model.types.INT },
		{ name: 'nameCorto', value: nameCorto, type: self.model.types.STRING },
		{ name: 'carpetaVarios', value: carpetaVarios, type: self.model.types.STRING },
		{ name: 'doc_varios', value: doc_varios, type: self.model.types.INT }
	];

	this.model.query('[expedienteSeminuevo].[UPD_CONFIGURACION_NEW_DOCUMENTO_SP]', params, function (error, result) {
		self.view.expositor(res, {
			error: error,
			result: result
		});
	});
};

administrador.prototype.get_dataMasivoCrud = function (req, res, next) {

	var self = this;

	const { idProceso } = req.query;

	var params = [
		{ name: 'idProceso', value: idProceso, type: this.model.types.INT }
	];

	this.model.query('[expedienteSeminuevo].[SEL_ALL_DOCUMENTS_CRUD_MASIVO_SP]', params, (error, result) => {
		self.view.expositor(res, {
			error: error,
			result: result
		});
	});
};

administrador.prototype.post_insDataMasivo = async function (req, res, next) {

	var self = this;

	const { idProceso,
		canales,
		estados,
		dataDocumento,
		idUsuario,
		fechaInicial } = req.body;

	const {
		id_documento,
		doc_activo,
		doc_opcional,
		doc_moral,
		doc_fisica,
		doc_fisicaAE,
		doc_varios
	} = dataDocumento;

	for (let i = 0; i <= canales.length - 1; i++) {
		let params = [
			{ name: 'idProceso', value: idProceso, type: self.model.types.INT },
			{ name: 'idCanal', value: canales[i].id, type: self.model.types.INT },
			{ name: 'estados', value: estados, type: self.model.types.STRING },
			{ name: 'idDocumento', value: id_documento, type: self.model.types.INT },
			{ name: 'doc_activo', value: doc_activo, type: self.model.types.INT },
			{ name: 'doc_opcional', value: doc_opcional, type: self.model.types.INT },
			{ name: 'doc_moral', value: doc_moral, type: self.model.types.INT },
			{ name: 'doc_fisica', value: doc_fisica, type: self.model.types.INT },
			{ name: 'doc_fisicaAE', value: doc_fisicaAE, type: self.model.types.INT },
			{ name: 'doc_varios', value: doc_varios, type: self.model.types.INT },
			{ name: 'idUsuario', value: idUsuario, type: self.model.types.INT },
			{ name: 'fechaInicio', value: fechaInicial, type: self.model.types.STRING }
		];

		const result = await administrador.insertDataMasivo(params);

		if (result.success == 0) {
			return res.status(200).json([{
				success: 0,
				msg: 'Ocurrio un error favor de contactar al administrador.'
			}]);
		};

		if (i == canales.length - 1) {
			return res.status(200).json([{
				success: 1,
				msg: 'Se guardo el documento con éxito.'
			}]);
		};
	};
};

administrador.insertDataMasivo = params => {
	return new Promise(resolve => {
		const model = new administradorModel({
			parameters: confParams
		});
		model.query('[expedienteSeminuevo].[INS_CONFIGURACION_UPDATE_MASIVO_SP]', params, (error, result) => {
			if (!error) {
				if (result[0].success == 0) {
					resolve({ success: 0 });
				} else {
					resolve({ success: 1 });
				};
			} else {
				resolve({ success: 0 });
			};
		});
	});
};

administrador.prototype.post_delDataMasivo = async function (req, res, next) {
	const { idProceso,
		canales,
		estados,
		id_documento } = req.body;


	for (let i = 0; i <= canales.length - 1; i++) {
		let params = [
			{ name: 'idProceso', value: idProceso, type: this.model.types.INT },
			{ name: 'idCanal', value: canales[i].id, type: this.model.types.INT },
			{ name: 'estados', value: estados, type: this.model.types.STRING },
			{ name: 'idDocumento', value: id_documento, type: this.model.types.INT }
		];

		let result = await administrador.deleteDataMasivo(params);

		if (result.success === 0) {
			return res.status(200).json([{
				success: 0,
				msg: 'Error al eliminar las configuraciones, favor de contactar al administrador.'
			}]);
		}

		if (i == canales.length - 1) {
			return res.status(200).json([{
				success: 1,
				msg: 'Se eliminaron las configuraciones con éxito.'
			}]);
		};
	};
};

administrador.deleteDataMasivo = params => {
	return new Promise(resolve => {
		let model = new administradorModel({
			parameters: confParams
		});

		model.query('[expedienteSeminuevo].[DEL_CONFIGURACION_UPDATE_MASIVO_SP]', params, (error, result) => {
			if (!error) {
				if (result[0].success === 0) {
					resolve({ success: 0 });
				} else {
					resolve({ success: 1 });
				};
			} else {
				resolve({ success: 0 });
			};
		});
	});
};

administrador.prototype.post_selDataPorProcesar = function (req, res, next) {
	const {
		idProceso,
		estados,
		canales
	} = req.body;

	let params = [
		{ name: 'idProceso', value: idProceso, type: this.model.types.INT },
		{ name: 'estados', value: estados, type: this.model.types.STRING },
		{ name: 'canales', value: canales, type: this.model.types.STRING }
	];

	this.model.query('[expedienteSeminuevo].[SEL_ALL_DOCUMENTS_POR_PROCESAR_UPD_SP]', params, (error, result) => {
		this.view.expositor(res, {
			error: error,
			result: result
		});
	});
};

module.exports = administrador;


