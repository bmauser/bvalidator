bValidator.modifiers = (function ($) {

    'use strict';

    // object with modifiers
    var modifiers = {

        trim : function (value) {
            return $.trim(value);
        }
    }

    return modifiers;

})(jQuery);
