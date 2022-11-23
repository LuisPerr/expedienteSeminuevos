var empleadoUrl = global_settings.urlCORS + '/api/empleadoApi/';
var empleadoApiUrl = global_settings.urlApiNode + '/api/empleado/';

registrationModule.factory('empleadoRepository', function ($http) {
    return {
        //Se comenta porque ya no se va a consultar la API Central ya que siempre trae el idPerfil = 1 
        //y se requiere que el perfil sea dinámico
        /*get: function (id) {
            return $http.get(empleadoUrl + '1|' + id);
        },*/
        
        get: (id) => {
            
            return $http({
                url: empleadoApiUrl + 'usuario/',
                method: "GET",
                params: {
                    idUsuario: id,
                    url: global_settings.urlApiNode.split(':')[2] //Es el puerto de la aplicación de expediente unidad. Se puede consultar en la tabla [Seguridad].[dbo].[SEG_APLICACION]
                                //También se le puede pasar la URL correspondiente a la aplicación, sin embargo, como todos los puertos son diferentes 
                                //se le pasa solamente el puerto 
                },
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        },
        update: function (id) {
            return $http.post(empleadoUrl + '2|' + id);
        },
        // getUsuarioCXP: function (folio) {
        //     return $http.get(empleadoUrl + '2|' + folio);
        // }
        getUsuarioCXP: function(folio) {
            return $http({
                url: empleadoApiUrl + 'usuarioCXP/',
                method: "GET",
                params: {
                    folio: folio
                },
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        },
        getPermisosUsuario: function(idUsuario, idPerfil) {
            return $http({
                url: empleadoApiUrl + 'permisosUsuario/',
                method: "GET",
                params: {
                    idUsuario: idUsuario,
                    idPerfil: idPerfil
                },
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        }
    };
});