var fs = require("fs");
const Promise = require('bluebird');

function saveDocumentoLogic(nombreDocumento, archivo, rutaSave, idExpediente, docVarios, proceso, carpetaVarios) {
    return new Promise(function (resolve) {
        if (!fs.existsSync(`${rutaSave}${idExpediente}`)) {//Si no existe el expediente
            fs.mkdirSync(`${rutaSave}${idExpediente}`);
            setTimeout(() => {
                if (!fs.existsSync(`${rutaSave}${idExpediente}\\\\${proceso}`)) {//si no existe el proceso
                    fs.mkdirSync(`${rutaSave}${idExpediente}\\\\${proceso}`);

                    setTimeout(() => {
                        if (docVarios == 0) {
                            fs.writeFile(`${rutaSave}${idExpediente}\\\\${proceso}\\\\${nombreDocumento}`, archivo, 'base64', function (err) {
                                if (err) {
                                    resolve({
                                        success: 0, msg: 'Error al guardar'
                                    });
                                } else {
                                    resolve({
                                        success: 1, msg: 'Se guardo con éxito'
                                    });
                                }
                            });
                        } else {
                            if (!fs.existsSync(`${rutaSave}${idExpediente}\\\\${proceso}\\\\${carpetaVarios}`)) {//Si no existe carpeta de varios
                                fs.mkdirSync(`${rutaSave}${idExpediente}\\\\${proceso}\\\\${carpetaVarios}`);

                                setTimeout(() => {
                                    fs.writeFile(`${rutaSave}${idExpediente}\\\\${proceso}\\\\${carpetaVarios}\\\\${nombreDocumento}`, archivo, 'base64', function (err) {
                                        if (err) {
                                            resolve({
                                                success: 0, msg: 'Error al guardar'
                                            });
                                        } else {
                                            resolve({
                                                success: 1, msg: 'Se guardo con éxito'
                                            });
                                        }
                                    });
                                }, 1000);

                            } else {
                                fs.writeFile(`${rutaSave}${idExpediente}\\\\${proceso}\\\\${carpetaVarios}\\\\${nombreDocumento}`, archivo, 'base64', function (err) {
                                    if (err) {
                                        resolve({
                                            success: 0, msg: 'Error al guardar'
                                        });
                                    } else {
                                        resolve({
                                            success: 1, msg: 'Se guardo con éxito'
                                        });
                                    }
                                });
                            }
                        }
                    }, 1000);

                } else { //Si existe el proceso
                    if (docVarios == 0) {
                        fs.writeFile(`${rutaSave}${idExpediente}\\\\${proceso}\\\\${nombreDocumento}`, archivo, 'base64', function (err) {
                            if (err) {
                                resolve({
                                    success: 0, msg: 'Error al guardar'
                                });
                            } else {
                                resolve({
                                    success: 1, msg: 'Se guardo con éxito'
                                });
                            }
                        });
                    } else {
                        if (!fs.existsSync(`${rutaSave}${idExpediente}\\\\${proceso}\\\\${carpetaVarios}`)) {
                            fs.mkdirSync(`${rutaSave}${idExpediente}\\\\${proceso}\\\\${carpetaVarios}`);

                            setTimeout(() => {
                                fs.writeFile(`${rutaSave}${idExpediente}\\\\${proceso}\\\\${carpetaVarios}\\\\${nombreDocumento}`, archivo, 'base64', function (err) {
                                    if (err) {
                                        resolve({
                                            success: 0, msg: 'Error al guardar'
                                        });
                                    } else {
                                        resolve({
                                            success: 1, msg: 'Se guardo con éxito'
                                        });
                                    }
                                });
                            }, 1000);
                        } else {
                            fs.writeFile(`${rutaSave}${idExpediente}\\\\${proceso}\\\\${carpetaVarios}\\\\${nombreDocumento}`, archivo, 'base64', function (err) {
                                if (err) {
                                    resolve({
                                        success: 0, msg: 'Error al guardar'
                                    });
                                } else {
                                    resolve({
                                        success: 1, msg: 'Se guardo con éxito'
                                    });
                                }
                            });
                        }
                    }
                }
            }, 1000);
        } else {// si existe el expediente
            if (!fs.existsSync(`${rutaSave}${idExpediente}\\\\${proceso}`)) {
                fs.mkdirSync(`${rutaSave}${idExpediente}\\\\${proceso}`);

                setTimeout(() => {
                    if (docVarios == 0) {
                        fs.writeFile(`${rutaSave}${idExpediente}\\\\${proceso}\\\\${nombreDocumento}`, archivo, 'base64', function (err) {
                            if (err) {
                                resolve({
                                    success: 0, msg: 'Error al guardar'
                                });
                            } else {
                                resolve({
                                    success: 1, msg: 'Se guardo con éxito'
                                });
                            }
                        });
                    } else {
                        if (!fs.existsSync(`${rutaSave}${idExpediente}\\\\${proceso}\\\\${carpetaVarios}`)) {//carpeta de varios
                            fs.mkdirSync(`${rutaSave}${idExpediente}\\\\${proceso}\\\\${carpetaVarios}`);

                            setTimeout(() => {
                                fs.writeFile(`${rutaSave}${idExpediente}\\\\${proceso}\\\\${carpetaVarios}\\\\${nombreDocumento}`, archivo, 'base64', function (err) {
                                    if (err) {
                                        resolve({
                                            success: 0, msg: 'Error al guardar'
                                        });
                                    } else {
                                        resolve({
                                            success: 1, msg: 'Se guardo con éxito'
                                        });
                                    }
                                });
                            }, 1000);

                        } else {
                            fs.writeFile(`${rutaSave}${idExpediente}\\\\${proceso}\\\\${carpetaVarios}\\\\${nombreDocumento}`, archivo, 'base64', function (err) {
                                if (err) {
                                    resolve({
                                        success: 0, msg: 'Error al guardar'
                                    });
                                } else {
                                    resolve({
                                        success: 1, msg: 'Se guardo con éxito'
                                    });
                                }
                            });
                        }
                    }
                }, 1000);

            } else {
                if (docVarios == 0) {
                    fs.writeFile(`${rutaSave}${idExpediente}\\\\${proceso}\\\\${nombreDocumento}`, archivo, 'base64', function (err) {
                        if (err) {
                            resolve({
                                success: 0, msg: 'Error al guardar'
                            });
                        } else {
                            resolve({
                                success: 1, msg: 'Se guardo con éxito'
                            });
                        }
                    });
                } else {
                    if (!fs.existsSync(`${rutaSave}${idExpediente}\\\\${proceso}\\\\${carpetaVarios}`)) {
                        fs.mkdirSync(`${rutaSave}${idExpediente}\\\\${proceso}\\\\${carpetaVarios}`);

                        setTimeout(() => {
                            fs.writeFile(`${rutaSave}${idExpediente}\\\\${proceso}\\\\${carpetaVarios}\\\\${nombreDocumento}`, archivo, 'base64', function (err) {
                                if (err) {
                                    resolve({
                                        success: 0, msg: 'Error al guardar'
                                    });
                                } else {
                                    resolve({
                                        success: 1, msg: 'Se guardo con éxito'
                                    });
                                }
                            });
                        }, 1000);
                    } else {
                        fs.writeFile(`${rutaSave}${idExpediente}\\\\${proceso}\\\\${carpetaVarios}\\\\${nombreDocumento}`, archivo, 'base64', function (err) {
                            if (err) {
                                resolve({
                                    success: 0, msg: 'Error al guardar'
                                });
                            } else {
                                resolve({
                                    success: 1, msg: 'Se guardo con éxito'
                                });
                            }
                        });
                    };
                };
            };
        };
    });
};

module.exports = { saveDocumentoLogic };