(function (bValidator, $) {

    'use strict';

    // bValidator jQuery plugin constructor
    $.fn.bValidator = function (param1, param2, param3) {

        var retUnchaninable;

        // chainable api
        var retChaninable = this.each(function () {

            var $input = $(this);

            // call function on existing instance
            if (typeof param1 == 'string') { // param1=apiFunction, param2,param3=apiFunctionArgument

                var validator = $input.data('bValidator');

                if (!validator)
                    validator = new bValidator($input); // make a new instance

                // call api function with arguments
                retUnchaninable = validator[param1](param2, param3);

                if (retUnchaninable !== undefined) // not chainable api funcion if returns something
                    return false; // break .each()
            } else
                // make a new instance
                new bValidator($input, param1, param2); // param1=options, param2=instanceName
        });

        if (retUnchaninable !== undefined) // not chainable api functions returns value
            return retUnchaninable;
        else
            return retChaninable;
    }

    // bValidator data API
    $(window).on('load', function () {
        $('[data-bvalidator-validate]').each(function () {
            bValidator.fn.makeInstance($(this));
        })
    })

})(bValidator, jQuery);
