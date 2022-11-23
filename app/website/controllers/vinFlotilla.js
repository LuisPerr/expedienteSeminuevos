const request = require('request');
const Promise = require('bluebird');
const confParams = require('../../../conf.json');

unidadFlotilla = (vin, idEmpresa, idSucursal) => {
    return new Promise((resolve) => {

        try {
            var apiKeyIntelimotor = confParams.apiKeyIntelimotor;
            var apiSecretIntelimotor = confParams.apiSecretIntelimotor;
            var urlIntelimotorsUnidades = confParams.urlGetDataByVinEmpresaSucursal;
            
            request.get(`${urlIntelimotorsUnidades}${vin}/${idEmpresa}/${idSucursal}?apiKey=${apiKeyIntelimotor}&apiSecret=${apiSecretIntelimotor}`, async (error, response) => {
                if (error) {
                    resolve({ success: 0 });
                } else {
                    if (response.statusCode == 200) {
                        let DATA = JSON.parse(response.body);
                        resolve({ success: 1, dataFleet: DATA.data.length == 1 ? DATA.data[0].fleet : false, estatusFleet: DATA.data.length == 1 ? DATA.data[0].status : 'Sin status' });                        
                    } else {
                        resolve({ success: 0 });
                    };
                };
            });
        } catch (error) {
            console.log('error', error)
            resolve({ success: 0 })
        };
    });
};


module.exports = { unidadFlotilla };