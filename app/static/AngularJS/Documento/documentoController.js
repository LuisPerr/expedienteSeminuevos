registrationModule.controller("documentoController", function ($scope, $rootScope, utils, localStorageService, alertFactory, documentoRepository, facturaRepository, nodoRepository, globalFactory) {

    //Propiedades
    //Desconfiguramos el clic izquierdo en el frame contenedor de documento
    var errorCallBack = function (data, status, headers, config) {
        $('#btnEnviar').button('reset');
        alertFactory.error('Ocurrio un problema');
    };

    //Métodos
    $scope.VerDocumento = function (doc) {
        //Inicia el Proceso 1 dependiendo de si eligieron CXP=2 CXC=1
        //BEGIN Consigo el tipo de proceso para mandarlo al SP que inserta la imagen
        $scope.idProceso = doc.idProceso;
        //END Consigo el tipo de proceso para mandarlo al SP que inserta la imagen
        if (doc.idProceso == 1) {
            $('#loadModal').modal('show');
            if (doc.consultar == 1) {
                ///////////////////////////////////////////////////////////////////////////
                //LMS Agregado para que se consulte y se despliega PDF
                ///////////////////////////////////////////////////////////////////////////
                if (doc.idDocumento == 20 || doc.cargar == 1) {
                    if (doc.idDocumento == 67) {
                        $scope.getPolizas(doc);
                    } else if (doc.descargar == 1) {
                        $('#loadModal').modal('hide');
                        //alertFactory.warning('Puede descargar el archivo.');
                        var pdf_link = doc.existeDoc; //doc.Ruta;
                        var typeAplication = $rootScope.obtieneTypeAplication(pdf_link);
                        var titulo = doc.folio + ' :: ' + doc.descripcion;
                        var iframe = '<div id="hideFullContent"><iframe id="ifDocument" src="' + pdf_link + '" frameborder="0"></iframe> </div>';
                        var iframe = '<div id="hideFullContent"><div onclick="nodisponible()" ng-controller="documentoController"> </div> <object id="ifDocument" data="' + pdf_link + '" type="' + typeAplication + '" width="100%" height="100%"><p>Alternative text - include a link <a href="' + pdf_link + '">to the PDF!</a></p></object> </div>';
                        $.createModal({
                            title: titulo,
                            message: iframe,
                            closeButton: false,
                            scrollable: false
                        });
                    } else {
                        //alertFactory.warning('Noooooo Puede descargar el archivo.');
                        $('#loadModal').modal('hide');
                        var pdf_link = doc.existeDoc; //doc.Ruta;
                        var typeAplication = $rootScope.obtieneTypeAplication(pdf_link);
                        var titulo = doc.folio + ' :: ' + doc.descripcion;
                        var iframe = '<div id="hideFullContent"><div id="hideFullMenu"> </div><iframe id="ifDocument" src="' + pdf_link + '" frameborder="0"></iframe> </div>';
                        var iframe = '<div id="hideFullContent"><div id="hideFullMenu" onclick="nodisponible()" ng-controller="documentoController"> </div> <object id="ifDocument" data="' + pdf_link + '" type="' + typeAplication + '" width="100%" height="100%"><p>Alternative text - include a link <a href="' + pdf_link + '">to the PDF!</a></p></object> </div>';
                        $.createModal({
                            title: titulo,
                            message: iframe,
                            closeButton: false,
                            scrollable: false
                        });
                    }
                } else {
                    ////////////BEGIN Para consumir la ruta donde se sube la NOTA DE CREDITO
                    if (doc.idDocumento == 10) {
                        $('#loadModal').modal('hide');
                        //alertFactory.warning('Noooooo Puede descargar el archivo.');
                        var pdf_link = doc.existeDoc; //doc.Ruta;
                        var typeAplication = $rootScope.obtieneTypeAplication(pdf_link);
                        var titulo = doc.folio + ' :: ' + doc.descripcion;
                        var iframe = '<div id="hideFullContent"><div id="hideFullMenu"> </div><iframe id="ifDocument" src="' + pdf_link + '" frameborder="0"></iframe> </div>';
                        var iframe = '<div id="hideFullContent"><div id="hideFullMenu" onclick="nodisponible()" ng-controller="documentoController"> </div> <object id="ifDocument" data="' + pdf_link + '" type="' + typeAplication + '" width="100%" height="100%"><p>Alternative text - include a link <a href="' + pdf_link + '">to the PDF!</a></p></object> </div>';
                        $.createModal({
                            title: titulo,
                            message: iframe,
                            closeButton: false,
                            scrollable: false
                        });
                    }
                    ////////////END Para consumir la ruta donde se sube la NOTA DE CREDITO
                    ///////////BEGIN Obtiene la Poliza
                    else if (doc.idDocumento == 14) {
                        documentoRepository.getPdfArrays(doc.tipo, doc.folio, doc.idNodo).then(function (result) {
                            console.log(result, 'PDF ARRAYS')
                            $('#loadModal').modal('hide');
                            var titulo = doc.folio + ' :: ' + doc.descripcion;
                            $scope.obtengoModalArrays(result, titulo, 'Póliza', doc);

                        });
                    } else if (doc.idDocumento == 70) {
                        documentoRepository.getPdfArrays(doc.tipo, doc.folio, doc.idNodo).then(function (result) {
                            console.log(result, 'PDF ARRAYS ANTICIPO')
                            $('#loadModal').modal('hide');
                            var titulo = doc.folio + ' :: ' + doc.descripcion;
                            $scope.obtengoModalArrays(result, titulo, 'Anticipo', doc);

                        });
                    } else if (doc.idDocumento == 64 || doc.idDocumento == 68 || doc.idDocumento == 67) {
                        $scope.getPolizas(doc);
                    } else {
                        //Mando a llamar al WebService
                        documentoRepository.getPdf(doc.tipo, doc.folio, doc.idNodo).then(function (d) {
                            $('#loadModal').modal('hide');
                            //Creo la URL
                            var pdf = URL.createObjectURL(utils.b64toBlob(d.data[0].arrayB, "application/pdf"))
                            var pdf_link = pdf;
                            var typeAplication = $rootScope.obtieneTypeAplication(pdf_link);
                            var titulo = doc.folio + ' :: ' + doc.descripcion;
                            //Mando a llamar la URL desde el div sustituyendo el pdf
                            /////////  $("<object id='pdfDisplay' data='" + pdf + "' width='100%' height='400px' >").appendTo('#pdfContent');
                            var iframe = '<div id="hideFullContent"><div onclick="nodisponible()" ng-controller="documentoController"> </div> <object id="ifDocument" data="' + pdf + '" type="' + typeAplication + '" width="100%" height="100%"><p>Alternative text - include a link <a href="' + pdf + '">to the PDF!</a></p></object> </div>';
                            $.createModal({
                                title: titulo,
                                message: iframe,
                                closeButton: false,
                                scrollable: false
                            });
                            /////////$scope.loadingOrder = false; //Animacion
                        });
                    }
                }
                //}
            } else {
                alertFactory.warning('Acción no permitida para su perfil.');
            }
        } //Fin de Proceso 1
        //Inicia el Proceso 2
        if (doc.idProceso == 2) {
            /////////////////////BEGIN Lo que ya tenia para mostrar la factura/////////////////////
            // if (doc.consultar == 1) {
            //     pruebaPdf();

            // }
            /////////////////////END Lo que ya tenia para mostrar la factura/////////////////////
            /////////////////////BEGIN LOQ UE TENGO QUE MODIFICAR PARA MOSTRAR YA TODO///////////
            if (doc.consultar == 1) {

                ///////////////////////////////////////////////////////////////////////////
                //LMS Agregado para que se consulte y se despliega PDF
                //Dependiendo del nodo es el tipo de Documento OCO,OCA
                ///////////////////////////////////////////////////////////////////////////
                if (doc.idDocumento == 20 || doc.cargar == 1) {
                    //Si es cargable o 20                  

                    if (doc.descargar == 1) {
                        //alertFactory.warning('Puede descargar el archivo.');
                        var pdf_link = doc.existeDoc; //doc.Ruta;
                        var typeAplication = $rootScope.obtieneTypeAplication(pdf_link);
                        var titulo = doc.folio + ' :: ' + doc.descripcion;
                        var iframe = '<div id="hideFullContent"><iframe id="ifDocument" src="' + pdf_link + '" frameborder="0"></iframe> </div>';
                        var iframe = '<div id="hideFullContent"><div onclick="nodisponible()" ng-controller="documentoController"> </div> <object id="ifDocument" data="' + pdf_link + '" type="' + typeAplication + '" width="100%" height="100%"><p>Alternative text - include a link <a href="' + pdf_link + '">to the PDF!</a></p></object> </div>';
                        $.createModal({
                            title: titulo,
                            message: iframe,
                            closeButton: false,
                            scrollable: false
                        });
                    } else {
                        //alertFactory.warning('Noooooo Puede descargar el archivo.');
                        var pdf_link = doc.existeDoc; //doc.Ruta;
                        var typeAplication = $rootScope.obtieneTypeAplication(pdf_link);
                        var titulo = doc.folio + ' :: ' + doc.descripcion;
                        var iframe = '<div id="hideFullContent"><div id="hideFullMenu"> </div><iframe id="ifDocument" src="' + pdf_link + '" frameborder="0"></iframe> </div>';
                        var iframe = '<div id="hideFullContent"><div id="hideFullMenu" onclick="nodisponible()" ng-controller="documentoController"> </div> <object id="ifDocument" data="' + pdf_link + '" type="' + typeAplication + '" width="100%" height="100%"><p>Alternative text - include a link <a href="' + pdf_link + '">to the PDF!</a></p></object> </div>';
                        $.createModal({
                            title: titulo,
                            message: iframe,
                            closeButton: false,
                            scrollable: false
                        });
                    }



                } else {
                    if (doc.idDocumento == 35 || doc.idDocumento == 27 || doc.idDocumento == 40 || doc.idDocumento == 24) { //LQMA ADD idDocumentos 24: Anticipo, 40: Recibo de caja
                        //pruebaPdf();
                        if (doc.idDocumento == 27) {
                            facturaRepository.getInfFact(doc.folio).then(function (cotizacion) {
                                //console.log(cotizacion);
                                pdfWS(cotizacion.data[0].rfcEmisor, '', cotizacion.data[0].serie, cotizacion.data[0].folio);
                            });
                        } else if (doc.idDocumento == 35 || doc.idDocumento == 40 || doc.idDocumento == 24) { //LQMA ADD idDocumentos 24: Anticipo, 40: Recibo de caja
                            $scope.pdf = [];
                            switch (doc.idDocumento) {

                                case 35: //ADD LQMA NOTA de CREDITO
                                    facturaRepository.getInfNotaCredito(doc.folio).then(function (notacredito) {
                                        var iframe = '<div id="hideFullContent"><div><ul class="nav nav-tabs"> ';
                                        $scope.creaDivDocumentos(notacredito, doc, iframe);
                                    });
                                    break;

                                case 40: //ADD LQMA RECIBO DE CAJA
                                    // facturaRepository.getInfReciboCaja(doc.folio).then(function(notacredito) {
                                    //     var iframe = '<div id="hideFullContent"><div><ul class="nav nav-tabs"> ';
                                    //     $scope.creaDivDocumentos(notacredito, doc, iframe);
                                    // });
                                    documentoRepository.getPdfArrays(doc.tipo, doc.folio, doc.idNodo).then(function (result) {
                                        console.log(result, 'PDF ARRAYS')
                                        var titulo = doc.folio + ' :: ' + doc.descripcion;
                                        $scope.obtengoModalArrays(result, titulo, 'Recibo de Caja', doc);

                                    });
                                    break;

                                case 24: //ADD LQMA ANTICIPO
                                    facturaRepository.getInfAnticipos(doc.folio).then(function (notacredito) {
                                        var iframe = '<div id="hideFullContent"><div><ul class="nav nav-tabs"> ';
                                        $scope.creaDivDocumentos(notacredito, doc, iframe);
                                    });
                                    break;

                            }

                        }

                        var pdfWS = function (rfcemisor, rfcreceptor, serie, folio) {
                            documentoRepository.getPdfWS(rfcemisor, rfcreceptor, serie, folio).then(function (d) {
                                if (d.data.mensajeresultadoField == "") {
                                    var pdf = URL.createObjectURL(utils.b64toBlob(d.data.pdfField, "application/pdf"))
                                    //var typeAplication = $rootScope.obtieneTypeAplication(pdf_link);
                                    console.log(pdf)
                                    //var pdf2=pdf.split('blob:');
                                    var iframe = '<div id="hideFullContent"><div onclick="nodisponible()" ng-controller="documentoController"> </div> <object id="ifDocument" data="' + pdf + '" type="application/pdf" width="100%" height="100%"><p>Alternative text - include a link <a href="' + pdf + '">to the PDF!</a></p></object> </div>';
                                    $.createModal({
                                        title: doc.folio + ' :: ' + doc.descripcion,
                                        message: iframe,
                                        closeButton: false,
                                        scrollable: false
                                    });
                                } else {
                                    var iframe = '<div id="hideFullContent"><div ng-controller="documentoController"><h4 class="filesInvoce">' + d.data.mensajeresultadoField + '</h4></div>  </div>';

                                    //$("" + d.data.mensajeresultadoField + "</h2>").appendTo('#myModal');
                                    $.createModal({
                                        title: doc.folio + ' :: ' + doc.descripcion,
                                        message: iframe,
                                        closeButton: false,
                                        scrollable: false
                                    });
                                }
                            });

                        }

                    } else if (doc.tipo == 'PUN') {
                        //Mando a llamar al WebService 
                        //  documentoRepository.getPdfArrays(doc.tipo, doc.folio, 0).then(function(d) {
                        // $scope.obtengoModalArraysCxc(d, doc, iframe);
                        //  });
                        //   alert(1);
                        $rootScope.tipoPun = doc.tipo;
                        nodoRepository.getEncabezadoResumen($rootScope.folio).then(function (result) {
                            $rootScope.encabezadoResumenPun = result.data;
                            $('#modalPun').modal('show');
                            globalFactory.filtrosTabla("unidadesPun", "Unidades", 5);
                        });
                    } else if (doc.idDocumento == 25) {
                        $scope.documento = doc;
                        documentoRepository.getResumenCotiza($rootScope.folio).then(function (result) {
                            console.log('RESUMEN COTIZA', result.data);
                            $rootScope.resumenCotizaciones = result.data;
                        });
                        documentoRepository.getCotizaciones(doc.folio).then(function (result) {
                            $('#cotizacion').modal('show');
                            $rootScope.encabezadoCot = result.data[0];
                            $rootScope.cotizaciones = result.data[1];
                            $rootScope.fechaSalida = result.data[2][0];
                            $rootScope.operacion = result.data[3];
                            if ($rootScope.NodoActual.id == 4) {
                                if ($rootScope.fechaSalida != undefined && $rootScope.fechaSalida.valid > 0) {
                                    $rootScope.mensajefichasalida = "LA ULTIMA FECHA DE ESCANEO: " + $rootScope.fechaSalida.FechaEscaneado + ", NO ES IGUAL A LA FECHA ACTUAL:" + $rootScope.fechaSalida.fechaactual + ", \n FAVOR DE VOLVER A ESCANEAR LA UNIDAD";
                                } else { $rootScope.mensajefichasalida = ''; }
                            }
                            globalFactory.filtrosTablaOpcional("cotizacionesPdf", "Cotizaciones", 5);
                            console.log('Si traje las cotizaciones', $rootScope.encabezadoCot, $rootScope.cotizaciones)
                        });
                        //console.log('Entre al documento de Cotizacion')
                        $('#cotizacion').modal('show');
                    } else {


                        //Mando a llamar al WebService
                        documentoRepository.getPdf(doc.tipo, doc.folio, 0).then(function (d) {
                            //Creo la URL
                            var pdf = URL.createObjectURL(utils.b64toBlob(d.data[0].arrayB, "application/pdf"))
                            var pdf_link = pdf;
                            var typeAplication = $rootScope.obtieneTypeAplication(pdf_link);
                            var titulo = doc.folio + ' :: ' + doc.descripcion;
                            //Mando a llamar la URL desde el div sustituyendo el pdf
                            /////////  $("<object id='pdfDisplay' data='" + pdf + "' width='100%' height='400px' >").appendTo('#pdfContent');
                            var iframe = '<div id="hideFullContent"><div onclick="nodisponible()" ng-controller="documentoController"> </div> <object id="ifDocument" data="' + pdf + '" type="' + typeAplication + '" width="100%" height="100%"><p>Alternative text - include a link <a href="' + pdf + '">to the PDF!</a></p></object> </div>';
                            $.createModal({
                                title: titulo,
                                message: iframe,
                                closeButton: false,
                                scrollable: false
                            });
                            /////////$scope.loadingOrder = false; //Animacion
                        });
                    }
                }
                //}
            } else {
                alertFactory.warning('Acción no permitida para su perfil.');
            }
            /////////////////////END  LOQ UE TENGO QUE MODIFICAR PARA MOSTRAR YA TODO///////////

        } //Fin de Proceso 2
    };
    $scope.fichaSalida = function (doc) {
        //Inicia el Proceso 1 dependiendo de si eligieron CXP=2 CXC=1
        //BEGIN Consigo el tipo de proceso para mandarlo al SP que inserta la imagen

        //Mando a llamar al WebService
        documentoRepository.getPdf('fS', doc.ucu_foliocotizacion, 0).then(function (d) {
            //Creo la URL
            var pdf = URL.createObjectURL(utils.b64toBlob(d.data[0].arrayB, "application/pdf"))
            var pdf_link = pdf;
            var typeAplication = $rootScope.obtieneTypeAplication(pdf_link);
            var titulo = 'FICHA CONTROL DE SALIDA :: ' + doc.ucu_foliocotizacion;
            //Mando a llamar la URL desde el div sustituyendo el pdf
            /////////  $("<object id='pdfDisplay' data='" + pdf + "' width='100%' height='400px' >").appendTo('#pdfContent');
            var iframe = '<div id="hideFullContent"><div onclick="nodisponible()" ng-controller="documentoController"> </div> <object id="ifDocument" data="' + pdf + '" type="' + typeAplication + '" width="100%" height="100%"><p>Alternative text - include a link <a href="' + pdf + '">to the PDF!</a></p></object> </div>';
            $.createModal({
                title: titulo,
                message: iframe,
                closeButton: false,
                scrollable: false
            });
            /////////$scope.loadingOrder = false; //Animacion
        });


    };
    // --------------------------------------
    // --Obtengo la cotizacion BEGIN
    // --------------------------------------
    $rootScope.getCotizacion = function (cotizacion) {
        $rootScope.loadingPdf = true;
        //Mando a llamar al WebService
        documentoRepository.getPdfNode($scope.documento.tipo, $scope.documento.folio, cotizacion.idDetalleCotizacion).then(function (d) {
            //Creo la URL
            var pdf = URL.createObjectURL(utils.b64toBlob(d.data.arrayBits, "application/pdf"))
            var pdf_link = pdf;
            var typeAplication = $rootScope.obtieneTypeAplication(pdf_link);
            var titulo = $scope.documento.folio + ' :: ' + $scope.documento.descripcion;
            //Mando a llamar la URL desde el div sustituyendo el pdf
            /////////  $("<object id='pdfDisplay' data='" + pdf + "' width='100%' height='400px' >").appendTo('#pdfContent');
            var iframe = '<div id="hideFullContent"><div onclick="nodisponible()" ng-controller="documentoController"> </div> <object id="ifDocument" data="' + pdf + '" type="' + typeAplication + '" width="100%" height="100%"><p>Alternative text - include a link <a href="' + pdf + '">to the PDF!</a></p></object> </div>';
            $rootScope.loadingPdf = false;
            $.createModal({
                title: titulo,
                message: iframe,
                closeButton: false,
                scrollable: false
            });
            /////////$scope.loadingOrder = false; //Animacion
        });

    };
    // --------------------------------------
    // --Obtengo la cotizacion END
    // --------------------------------------

    $rootScope.verPun = function (doc) {


        documentoRepository.getPdfArraysPun($rootScope.tipoPun, doc.ucu_foliocotizacion, doc.numeroSerie).then(function (d) {
            arregloBytes = d.data.arrayBits.base64Binary;

            var pdf = URL.createObjectURL(utils.b64toBlob(arregloBytes, "application/pdf"))
            var pdf_link = pdf;
            var typeAplication = $rootScope.obtieneTypeAplication(pdf_link);
            var titulo = 'Pedido';
            var iframe = '<div id="hideFullContent"><div onclick="nodisponible()" ng-controller="documentoController"> </div> <object id="ifDocument" data="' + pdf + '" type="' + typeAplication + '" width="100%" height="100%"><p>Alternative text - include a link <a href="' + pdf + '">to the PDF!</a></p></object> </div>';
            $.createModal({
                title: titulo,
                message: iframe,
                closeButton: false,
                scrollable: false
            });
        });

    };

    $rootScope.obtieneTypeAplication = function (ruta) {

        var arreglo = ruta.split(".");
        var typeAplication = 'application/pdf';
        switch (arreglo[arreglo.length - 1].toLowerCase()) {
            case 'jpg':
                typeAplication = 'image/jpeg';
                break;
            case 'png':
                typeAplication = 'image/png';
                break;
            case 'gif':
                typeAplication = 'image/gif';
                break;
            case 'jpeg':
                typeAplication = 'image/jpeg';
        }

        return typeAplication;
    };

    $scope.NoDisponible = function () {
        //alertFactory.error('Función deshabilitada en digitalización.');
        alertFactory.warning('Acción no permitida para su perfil.');
    };

    ///////////////////////////////////////////////////////////////////////////////////
    ///Envío de documentos

    $scope.ShowEnviar = function (doc) {
        if (doc.enviarEmail == 1) {
            $('#modalSend').modal('show');
            $rootScope.currentDocument = doc;
        } else {
            alertFactory.warning('Acción no permitida para su perfil.');
        }
    };

    var enviarDocumentoSuccessCallback = function (data, status, headers, config) {
        alertFactory.success('Documento enviado correctamente.');
        $('#btnEnviar').button('reset');
        $('#modalSend').modal('hide');
    };

    //LQMA 19012015
    var muestraPolizasSuccessCallback = function (data, status, headers, config) {
        var iframe = '<div id="hideFullContent"><div><ul class="nav nav-tabs"> ';

        angular.forEach(data, function (value, key) {
            if (key == 0) {
                iframe = iframe + '<li class="active"><a data-toggle="tab" href="#divMenu' + key + '" target="_self">Póliza ' + (key + 1) + ' </a></li>';
            } else {
                iframe = iframe + '<li><a data-toggle="tab" href="#divMenu' + key + '" target="_self">Póliza ' + (key + 1) + ' </a></li>';
            }
        });

        iframe = iframe + '</ul></div> <div class="tab-content">';

        angular.forEach(data, function (value, key) {

            if (key == 0) {
                iframe = iframe + '<div class="tab-pane active" id="divMenu' + key + '"><iframe src="' + value + '" width="560" height="350" allowfullscreen="allowFullScreen"></iframe></div>';
            } else {
                iframe = iframe + '<div class="tab-pane" id="divMenu' + key + '"><iframe src="' + value + '" width="560" height="350" allowfullscreen="allowFullScreen"></iframe></div>';
            }
        });

        iframe = iframe + '</div></div>';

        $.createModal({
            title: "Pólizas de Transferencia", //titulo,
            message: iframe,
            closeButton: false,
            scrollable: false
        });

    };

    $scope.EnviarDocumento = function () {
        if ($rootScope.currentDocument.consultar == 1) {
            $('#btnEnviar').button('loading');
            documentoRepository.sendMail($rootScope.currentDocument.idDocumento, $rootScope.currentDocument.folio, $scope.correoDestinatario)
                .success(enviarDocumentoSuccessCallback)
                .error(errorCallBack);
        } else {
            alertFactory.warning('Acción no permitida para su perfil.');
        }
    };

    //////////////////////////////////////////////////////////////////////////
    /// Carga de documentos

    $scope.openUpload = function () {

        var documento = {
            "idProceso": 1,
            "idNodo": 2,
            "nombreNodo": "",
            "folio": $rootScope.currentFolioFactura,
            "nombreDocumento": "",
            "idDocumento": 15,
            "origen": "",
            "descripcion": "",
            "idPerfil": "",
            "consultar": "",
            "imprimir": "",
            "enviarEmail": "",
            "descargar": "",
            "cargar": "",
            "estatusNombre": "",
            "idEstatus": "",
            "Ruta": "",
            "existeDoc": ""
        };

        $scope.ShowCargar(documento);
    };

    $scope.ShowCargar = function (doc) {
        if (doc.idDocumento == 15 && window.location.pathname != '/factura') {
            location.href = '/factura?id=' + doc.folio + '&employee=' + $rootScope.currentEmployee + '&perfil=' + $rootScope.empleado.idPerfil + '&proceso=' + doc.idProceso + '&nodo=' + doc.idNodo;
        } else if (doc.idDocumento == 67) {
            documentoRepository.getPermisos($rootScope.currentEmployee, 8).then(function (result) {
                var permisoUsuario = result.data[0];
                if (permisoUsuario.respuesta == 1) {
                    $('#frameUpload').attr('src', '/uploader');
                    $('#modalUpload').modal('show');
                    $rootScope.currentUpload = doc;
                } else if (permisoUsuario.respuesta == 0) {
                    alertFactory.warning('El usuario no tiene permisos para subir documento')
                }
            });
        } else {
            $('#frameUpload').attr('src', '/uploader');
            $('#modalUpload').modal('show');
            $rootScope.currentUpload = doc;
        }

    };

    var uploadSuccessCallback = function (data, status, headers, config) {
        alertFactory.success('Documento cargado');
    };

    $scope.CargarDocumento = function () {
        documentoRepository.uploadFile($("#fileDoc")[0].files[0])
            .success(uploadSuccessCallback)
            .error(errorCallBack);
    };

    $scope.FinishUpload = function (name) {
        alertFactory.success('Se guardo el documento ' + name);
        var doc = $rootScope.currentUpload;

        documentoRepository.saveDocument(doc.folio, doc.idDocumento, 1, doc.idProceso, doc.idNodo, 1, global_settings.uploadPath + '/' + name)
            .success(saveDocumentSuccessCallback)
            .error(errorCallBack);
    };

    var saveDocumentSuccessCallback = function (data, status, headers, config) {
        alertFactory.success('Documento guardado.');
        //actualizar los nodos para mostrar botonerass
        //goToPage($scope.currentPage);       

        var url = window.location.pathname;
        //alert(url);
        if (url == '/factura') {
            $rootScope.muestraDocumentos();
        } else {
            setTimeout(function () {
                $rootScope.LoadActiveNode();
            }, 200);
        }
    };

    $scope.creaDivDocumentos = function (arrayDocuemtos, doc, iframe) {

        //var iframe = '<div id="hideFullContent"><div><ul class="nav nav-tabs"> ';

        angular.forEach(arrayDocuemtos.data, function (value, key) {
            if (key == 0) {
                iframe = iframe + '<li class="active"><a data-toggle="tab" href="#divMenu' + key + '" target="_self"> ' + doc.descripcion + ' ' + (key + 1) + ' </a></li>';
            } else {
                iframe = iframe + '<li><a data-toggle="tab" href="#divMenu' + key + '" target="_self"> ' + doc.descripcion + ' ' + (key + 1) + ' </a></li>';
            }
        });

        iframe = iframe + '</ul></div> <div class="tab-content">';

        angular.forEach(arrayDocuemtos.data, function (value, key) {
            documentoRepository.getPdfWS(value.rfcEmisor, '', value.serie, value.folio).then(function (d) {
                //if (d.data.mensajeresultadoField == "") {
                $scope.pdf[key] = URL.createObjectURL(utils.b64toBlob(d.data.pdfField, "application/pdf"))

                setTimeout(function () { //Para poder  visualizar los pdf
                    if (key == arrayDocuemtos.data.length - 1) {

                        angular.forEach($scope.pdf, function (value, key) {
                            if (key == 0) {
                                iframe = iframe + '<div class="tab-pane active" id="divMenu' + key + '"><iframe src="' + value + '" width="560" height="350" allowfullscreen="allowFullScreen"></iframe></div>';
                            } else {
                                iframe = iframe + '<div class="tab-pane" id="divMenu' + key + '"><iframe src="' + value + '" width="560" height="350" allowfullscreen="allowFullScreen"></iframe></div>';
                            }
                        });
                        iframe = iframe + '</div></div>';
                        $.createModal({
                            title: doc.folio + ' :: ' + doc.descripcion, //titulo,
                            message: iframe,
                            closeButton: false,
                            scrollable: false
                        });
                    }
                }, 2000);
                //}
            });
        });
    };
    $scope.obtengoModalArrays = function (arrays, titulo, nombreTab, doc) {
        documentoRepository.verificaExisteDoc(doc.existeDoc).then(function (result) {
            var existeDocumento = result.data.respuesta;
            $('#loadModal').modal('hide');
            var consecutivo = 0
            $scope.arregloBytes = arrays.data;
            var iframe = '<div id="hideFullContent"><div><ul class="nav nav-tabs"> ';
            $scope.pdf = [];
            angular.forEach($scope.arregloBytes, function (value, key) {
                var consecutivo = key + 1;
                $scope.pdf.push({
                    urlPdf: URL.createObjectURL(utils.b64toBlob(value, "application/pdf")),
                    id: key + 1
                });

            });
            if (nombreTab != 'Anticipo') {
                angular.forEach($scope.pdf, function (value, key) {
                    if (key == 0) {
                        iframe = iframe + '<li class="active"><a data-toggle="tab" href="#divMenu' + key + '" target="_self">' + nombreTab + ' ' + +(key + 1) + ' </a></li>';
                    } else {
                        iframe = iframe + '<li><a data-toggle="tab" href="#divMenu' + key + '" target="_self">' + nombreTab + ' ' + +(key + 1) + ' </a></li>';
                    }
                    consecutivo = key;
                });
                if (doc.idDocumento == 67 && existeDocumento == 1) {
                    consecutivo++;
                    iframe = iframe + '<li><a data-toggle="tab" href="#divMenu' + consecutivo + '" target="_self">' + nombreTab + ' ' + +(consecutivo + 1) + ' </a></li>';
                }
            }
            iframe = iframe + '</ul></div> <div class="tab-content">';

            angular.forEach($scope.pdf, function (value, key) {

                if (key == 0) {
                    iframe = iframe + '<div class="tab-pane active" id="divMenu' + key + '"><iframe src="' + value.urlPdf + '" width="560" height="350" allowfullscreen="allowFullScreen"></iframe></div>';
                } else {
                    iframe = iframe + '<div class="tab-pane" id="divMenu' + key + '"><iframe src="' + value.urlPdf + '" width="560" height="350" allowfullscreen="allowFullScreen"></iframe></div>';
                }
                consecutivo = key;
            });
            if (doc.idDocumento == 67 && existeDocumento == 1) {
                consecutivo++;
                var pdf_link = doc.existeDoc; //doc.Ruta;
                // var typeAplication = $rootScope.obtieneTypeAplication(pdf_link);
                // var titulo = doc.folio + ' :: ' + doc.descripcion;
                iframe = iframe + '<div class="tab-pane" id="divMenu' + consecutivo + '"><iframe src="' + pdf_link + '" width="560" height="350" allowfullscreen="allowFullScreen"></iframe></div>';
                // iframe = '<div id="hideFullContent"><iframe id="ifDocument" src="' + pdf_link + '" frameborder="0"></iframe> </div>';
                // iframe = '<div id="hideFullContent"><div onclick="nodisponible()" ng-controller="documentoController"> </div> <object id="ifDocument" data="' + pdf_link + '" type="' + typeAplication + '" width="100%" height="100%"><p>Alternative text - include a link <a href="' + pdf_link + '">to the PDF!</a></p></object> </div>';


            }

            iframe = iframe + '</div></div>';
            $.createModal({
                title: titulo,
                message: iframe,
                closeButton: false,
                scrollable: false
            });

        });

        // $scope.pdf = [];
        // console.log(arrays);
        // $scope.arregloBytes = arrays.data;
        // console.log($scope.arregloBytes, 'Solo los arreglos');
        // angular.forEach($scope.arregloBytes, function(value, key) {
        //     var consecutivo = key + 1;
        //     $scope.pdf.push({
        //         urlPdf: URL.createObjectURL(utils.b64toBlob(value, "application/pdf")),
        //         id: key + 1
        //     });

        // });

        // setTimeout(function() {
        //     var iframe = '<div class="tab-base" ng-controller="documentoController"><ul class="nav nav-tabs"><li ng-repeat="numero in pdf"><a data-toggle="tab" class="btn btn-default" ng-click="muestraFactura(numero.id)">Recibo de Caja {{numero.id}}</a></li></ul><div class="tab-content"><div id="recibo{{documento.id}}" class="tab-pane fade active in" ng-repeat="documento in pdf"><div id="pdfRecibo{{documento.id}}" ng-show="{{documento.id}} == muestraContenido"></div></div></div></div>';
        //     $.createModal({
        //         title: titulo,
        //         message: iframe,
        //         closeButton: false,
        //         scrollable: false
        //     });
        //     angular.forEach($scope.pdf, function(value, key) {
        //         var consecutivo = key + 1;
        //         $("<object class='filesInvoce' data='" + $scope.pdf[key].urlPdf + "' width='100%' height='500px' >").appendTo('#pdfRecibo' + consecutivo);
        //     });
        // }, 100);

    };
    $scope.muestraFactura = function (id) {

    };

    $scope.obtengoModalArraysCxc = function (arrays, titulo, nombreTab) {
        $scope.arregloBytes = arrays.data;
        var iframe = '<div id="hideFullContent"><div><ul class="nav nav-tabs"> ';
        $scope.pdf = [];
        angular.forEach($scope.arregloBytes, function (value, key) {
            var consecutivo = key + 1;
            $scope.pdf.push({
                urlPdf: URL.createObjectURL(utils.b64toBlob(value, "application/pdf")),
                id: key + 1
            });

        });

        angular.forEach($scope.pdf, function (value, key) {
            if (key == 0) {
                iframe = iframe + '<li class="active"><a data-toggle="tab" href="#divMenu' + key + '" target="_self">Unidad ' + (key + 1) + ' </a></li>';
            } else {
                iframe = iframe + '<li><a data-toggle="tab" href="#divMenu' + key + '" target="_self">Unidad ' + (key + 1) + ' </a></li>';
            }
        });

        iframe = iframe + '</ul></div> <div class="tab-content">';

        angular.forEach($scope.pdf, function (value, key) {

            if (key == 0) {
                iframe = iframe + '<div class="tab-pane active" id="divMenu' + key + '"><iframe src="' + value.urlPdf + '" width="560" height="350" allowfullscreen="allowFullScreen"></iframe></div>';
            } else {
                iframe = iframe + '<div class="tab-pane" id="divMenu' + key + '"><iframe src="' + value.urlPdf + '" width="560" height="350" allowfullscreen="allowFullScreen"></iframe></div>';
            }
        });

        iframe = iframe + '</div></div>';
        $.createModal({
            title: titulo,
            message: iframe,
            closeButton: false,
            scrollable: false
        });
    };


    $scope.getPolizas = function (doc) {
        documentoRepository.getPdfArrays(doc.tipo, doc.folio, doc.idNodo).then(function (result) {
            $scope.obtengoModalArrays(result, doc.nombreDocumento, doc.nombreDocumento, doc);

        });
    };
    $rootScope.imprimir = function () {
        $rootScope.loadingPdf = true;
        var rptStructure = {};
        rptStructure.resumenCotizaciones = $rootScope.resumenCotizaciones;
        rptStructure.flotilla = $rootScope.cotizaciones;
        rptStructure.operacion = $rootScope.operacion;
        var jsonData = {
            "template": { "name": "encabezadoResumenCot" },
            "data": rptStructure
        }
        console.log(jsonData);
        $scope.generaPdf(jsonData);

    };
    $rootScope.imprimirResumen = function (folio) {
        $rootScope.loadingPdf = true;
        var rptStructure = {};
        documentoRepository.getResumenGeneral($rootScope.idDetCot, folio).then(function (result) {
            console.log('ResumenJSREPORT', result.data)
            rptStructure.unidad = result.data[0][0];
            rptStructure.accesorios = result.data[1];
            rptStructure.tramites = result.data[2];
            rptStructure.otros = result.data[3];
            rptStructure.servicios = result.data[4];
            rptStructure.anticipos = result.data[5];
            rptStructure.facturas = result.data[6];
            var importe = 0;
            var iva = 0;
            var total = 0;
            var saldo = 0;
            angular.forEach(rptStructure.facturas, function (value, key) {
                importe = value.cargo + importe;
                iva = value.iva + iva;
                total = value.total + total;
                saldo = value.saldo + saldo;
            });
            rptStructure.unidad.importe = importe;
            rptStructure.unidad.iva = iva;
            rptStructure.unidad.total = total;
            rptStructure.unidad.saldo = saldo;
            //console.log(importe,iva,total,saldo,'YUJU')
            var jsonData = {
                "template": { "name": "ResumenCotizacion" },
                "data": rptStructure
            };

            console.log('QUE MANDA', jsonData);
            $scope.generaPdf(jsonData);
        });
    };
    $scope.generaPdf = function (jsonData) {
        documentoRepository.getReportePdf(jsonData).then(function (result) {
            console.log('MI PDF')

            var file = new Blob([result.data], { type: 'application/pdf' });
            var fileURL = URL.createObjectURL(file);
            //
            var typeAplication = 'application/pdf';
            var titulo = 'Resumen Cotización';
            var iframe = '<div id="hideFullContent"><div onclick="nodisponible()" ng-controller="documentoController"> </div> <object id="ifDocument" data="' + fileURL + '" type="' + typeAplication + '" width="100%" height="100%"><p>Alternative text - include a link <a href="' + fileURL + '">to the PDF!</a></p></object> </div>';
            $rootScope.loadingPdf = false;
            $.createModal({
                title: titulo,
                message: iframe,
                closeButton: false,
                scrollable: false
            });
        });
    };

});


/*var nameDocument = '';
function refresh() {
  var scope = angular.element($("#modalUpload")).scope();
  scope.$apply(function(){
    scope.FinishUpload(nameDocument);
  })
}*/