registrationModule.directive('clickedDisable', function() {
    return {
        restrict: 'A',
        link: function(scope, ele, attrs) {
            $(ele).click(function() {
                $(ele).attr('disabled', true);
            });
        }
    };
});