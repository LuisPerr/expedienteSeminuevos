registrationModule.factory('alertFactory', function () {
    return {
        success: function (text) {
            toastr.options = { "positionClass": "toast-top-right", "closeButton": true}
            toastr.success(text, '¡Éxito!');
        },
        successTopFull: function (text) {
            toastr.options = { "positionClass": "toast-top-full-width", "closeButton": true}
            toastr.success(text, '¡Éxito!');
        },
        error: function (text) {
            toastr.options = { "positionClass": "toast-top-right", "closeButton": true}
            toastr.error(text , 'Error');
        },
        info: function (text) {
            toastr.options = { "positionClass": "toast-top-right", "closeButton": true}
            toastr.info(text, 'Información');
        },
        infoTopFull: function (text) {
            toastr.options = { "positionClass": "toast-top-full-width", "closeButton": true}
            toastr.info(text, 'Información');
        },
        warning: function (text) {
            toastr.options = { "positionClass": "toast-top-right", "closeButton": true}
            toastr.warning(text, 'Atención');
        }
    };
});