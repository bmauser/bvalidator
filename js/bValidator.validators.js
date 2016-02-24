bValidator.validators = (function ($) {

    'use strict';

    // object with validator actions
    var validators = {

        minlen : function (value, minlength) {
            return (value.length >= parseInt(minlength))
        },

        maxlen : function (value, maxlength) {
            return (value.length <= parseInt(maxlength))
        },

        rangelen : function (value, minlength, maxlength) {
            return (value.length >= parseInt(minlength) && value.length <= parseInt(maxlength))
        },

        equal : function (value, elementId) {
            return value == $('#' + elementId).val();
        },

        differ : function (value, elementId) {
            return value != $('#' + elementId).val();
        },

        min : function (value, min) {
            if (!this.number(value))
                return false;
            return (parseFloat(value) >= parseFloat(min))
        },

        max : function (value, max) {
            if (!this.number(value))
                return false;
            return (parseFloat(value) <= parseFloat(max))
        },

        between : function (value, min, max) {
            if (!this.number(value))
                return false;
            var va = parseFloat(value);
            return (va >= parseFloat(min) && va <= parseFloat(max))
        },

        required : function (value) {
            if (!value || !$.trim(value))
                return false;

            return true;
        },

        pattern : function (value, regex, mod) {
            if (typeof regex === 'string')
                regex = new RegExp(regex, mod);
            return regex.test(value);
        },

        alpha : function (value) {
            return this.pattern(value, /^[a-z ._\-]+$/i);
        },

        alphanum : function (value) {
            return this.pattern(value, /^[a-z\d ._\-]+$/i);
        },

        digit : function (value) {
            return this.pattern(value, /^\d+$/);
        },

        number : function (value) {
            return this.pattern(value, /^[-+]?\d+(\.\d+)?$/);
        },

        email : function (value) {
            return this.pattern(value, /^([a-zA-Z\d_\.\-\+%])+\@(([a-zA-Z\d\-])+\.)+([a-zA-Z\d])+$/);
        },

        url : function (value) {
            return this.pattern(value, /^\b(https?|ftp):\/\/([-A-Z0-9.]+)(\/[-A-Z0-9+&@#\/%=~_|!:,.;]*)?(\?[A-Z0-9+&@#\/%=~_|!:,.;]*)?$/i);
        },

        ip4 : function (value) {
            return this.pattern(value, /^(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?)$/);
        },

        ip6 : function (value) {
            return this.pattern(value, /^(?:(?:(?:[A-F\d]{1,4}:){5}[A-F\d]{1,4}|(?:[A-F\d]{1,4}:){4}:[A-F\d]{1,4}|(?:[A-F\d]{1,4}:){3}(?::[A-F\d]{1,4}){1,2}|(?:[A-F\d]{1,4}:){2}(?::[A-F\d]{1,4}){1,3}|[A-F\d]{1,4}:(?::[A-F\d]{1,4}){1,4}|(?:[A-F\d]{1,4}:){1,5}|:(?::[A-F\d]{1,4}){1,5}|:):(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)\.){3}(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)|(?:[A-F\d]{1,4}:){7}[A-F\d]{1,4}|(?:[A-F\d]{1,4}:){6}:[A-F\d]{1,4}|(?:[A-F\d]{1,4}:){5}(?::[A-F\d]{1,4}){1,2}|(?:[A-F\d]{1,4}:){4}(?::[A-F\d]{1,4}){1,3}|(?:[A-F\d]{1,4}:){3}(?::[A-F\d]{1,4}){1,4}|(?:[A-F\d]{1,4}:){2}(?::[A-F\d]{1,4}){1,5}|[A-F\d]{1,4}:(?::[A-F\d]{1,4}){1,6}|(?:[A-F\d]{1,4}:){1,7}:|:(?::[A-F\d]{1,4}){1,7})$/i);
        },

        date : function (value, format) { // format can be any combination of mm,dd,yyyy with separator between. Example: 'mm.dd.yyyy' or 'yyyy-mm-dd'
            if (value.length == 10 && format.length == 10) {
                var s = format.match(/[^mdy]+/g);
                if (s.length == 2 && s[0].length == 1 && s[0] == s[1]) {

                    var d = value.split(s[0]);
                    var f = format.split(s[0]);
                    var day;
                    var month;
                    var year;

                    for (var i = 0; i < 3; i++) {
                        if (f[i] == 'dd')
                            day = d[i];
                        else if (f[i] == 'mm')
                            month = d[i];
                        else if (f[i] == 'yyyy')
                            year = d[i];
                    }

                    var dobj = new Date(year, month - 1, day);

                    if ((dobj.getMonth() + 1 != month) || (dobj.getDate() != day) || (dobj.getFullYear() != year))
                        return false;

                    return true;
                }
            }
            return false;
        },

        extension : function (value) {

            var r = '';

            if (!arguments[1])
                return false;

            for (var i = 1; i < arguments.length; i++) {
                r += arguments[i];
                if (i != arguments.length - 1)
                    r += '|';
            }

            return this.pattern(value, '\\.(' + r + ')$', 'i');
        },

        ajax : function (value, ajaxResponse, postName) {

            var validationResult;

            // check if response from server is JSON
            try {
                var results = $.parseJSON(ajaxResponse);
                if (results[postName])
                    validationResult = results[postName];
            }
            // ajaxResponse is not json
            catch (err) {
                validationResult = ajaxResponse;
            }

            return validationResult
        }
    }

    return validators;

})(jQuery);
