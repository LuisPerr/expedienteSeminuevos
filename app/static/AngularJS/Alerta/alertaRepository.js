var alertaUrl = global_settings.urlCORS + '/api/alertaapi/';

registrationModule.factory('alertaRepository', function ($http) {
    return {
        get: function (id) {
            return $http.get(alertaUrl + '0|' + id);
        },
        getByNodo: function (idproceso, nodo, folio) {
            return $http.get(alertaUrl + '1|' + idproceso + '|' + nodo + '|' + folio);
        },
        update: function (id) {
            return $http.post(alertaUrl + '2|' + id);
        }
    };
});