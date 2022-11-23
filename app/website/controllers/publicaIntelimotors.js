const request = require('request');
const Promise = require('bluebird');
const confParams = require('../../../conf.json');

function publica(vin, unitId) {
    return new Promise(function (resolve, reject) {
        let urlIntelimotors = confParams.urlPublicaIntelimotor;
        let apiKey = confParams.apiKeyIntelimotor;
        let apiSecret = confParams.apiSecretIntelimotor;
        var options = {
            'method': 'POST',
            'url': `${urlIntelimotors}?apiKey=${apiKey}&apiSecret=${apiSecret}`,
            'headers': {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ "vin": vin, "businessUnitId": unitId })
        };
        request(options, function (error, response) {
            if (error) {
                resolve({ success: 0, err: error });
            } else {
                resolve({ success: 1, data: response });
            };
        });
    });
};

module.exports = { publica };