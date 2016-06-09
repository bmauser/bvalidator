bValidator.defaultOptions = (function () {

    'use strict';

    // default options
    var defaultOptions = {

        singleError           : false,
        scrollToError         : true,
        scrollToErrorOffset   : -10,     // px
        lang                  : 'en',
        validateOn            : '',      // 'change', 'blur', 'keyup' ...
        errorValidateOn       : 'keyup', // 'change', 'blur', 'keyup' ...
        delayValidation       : 300,     // ms
        validateOnSubmit      : true,
        stopSubmitPropagation : true,
        validateTillInvalid   : false,
        skipValidation        : ':hidden, :disabled',
        html5ValidationOff    : true,
        enableHtml5Attr       : true,
        useTheme              : '',
        noMsgIfExistsForInstance : [],

        errorMessageAttr     : '-msg',      // attribute which holds error message text (data-bvalidator-msg)
        validateActionsAttr  : '',          // attribute for validation actions for the field (data-bvalidator)
        validationResultAttr : '-return',   // attribute for making field always valid (data-bvalidator-return)
        modifyActionsAttr    : '-modifier', // attribute for modifiers for the field (data-bvalidator-modifier)
        setThemeAttr         : '-theme',    // Attribute for setting the theme name. Can be set on <form> or <input> (data-bvalidator-theme)
        dataOptionNamespace  : 'Option',    // $.data namespace (data-bvalidator-option-)
        html5selector        : 'input[type=email],input[type=url],input[type=number],[required],input[min],input[max],input[maxlength],input[minlength],input[pattern]', // selector for HTML5 inputs, used only if enableHtml5Attr=true
        paramsDelimiter      : ':',
        actionsDelimiter     : ',',

        autoModifiers : {
            digit  : ['trim'],
            number : ['trim'],
            email  : ['trim'],
            url    : ['trim'],
            date   : ['trim'],
            ip4    : ['trim'],
            ip6    : ['trim']
        },

        ajaxValid       : 'ok',
        ajaxResponseMsg : false,
        ajaxOptions : {
            cache  : false,
            method : 'POST'
        },
        ajaxParams : null,
        ajaxUrl    : '',
        ajaxCache  : true,

        themes : {}, // theme options

        // default messages
        messages : {
            en : {
                'default' : 'Please correct this value.',
                minlen    : 'The length must be at least {0} characters.',
                maxlen    : 'The length must be at max {0} characters.',
                rangelen  : 'The length must be between {0} and {1}.',
                min       : 'Please enter a number greater than or equal to {0}.',
                max       : 'Please enter a number less than or equal to {0}.',
                between   : 'Please enter a number between {0} and {1}.',
                required  : 'This field is required.',
                alpha     : 'Please enter alphabetic characters only.',
                alphanum  : 'Please enter alphanumeric characters only.',
                digit     : 'Please enter only digits.',
                number    : 'Please enter a valid number.',
                email     : 'Please enter a valid email address.',
                url       : 'Please enter a valid URL.',
                ip4       : 'Please enter a valid IPv4 address.',
                ip6       : 'Please enter a valid IPv6 address.',
                date      : 'Please enter a valid date in format {0}',
                equal     : 'Please enter the same value again.',
                differ    : 'Please enter a different value.'
            }
        }
    }

    return defaultOptions;

})();
