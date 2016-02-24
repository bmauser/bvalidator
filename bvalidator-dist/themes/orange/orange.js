/*
 * bValidator orange theme options
 */

bValidator.defaultOptions.themes.orange = {

    offset        : '-24,-4',
    position      : 'right,top',
    template      : '<div class="bvalidator-orange-tooltip bvalidator-orange-tooltip-noclose"><div class="bvalidator-orange-arrow"></div><div class="bvalidator-orange-msg">{message}</div></div>',
    templateClose : '<div class="bvalidator-orange-tooltip"><div class="bvalidator-orange-arrow"></div><div class="bvalidator-orange-msg">{message}</div><div class="bvalidator-orange-close">&#215;</div></div>',
    showClose     : true,
    msgShowSpeed  : 'normal',
    invalidClass  : 'bvalidator-orange-invalid',
    validClass    : '',

    closeIconSelector   : '.bvalidator-orange-close', // selector for close icon inside templateClose
    dataOptionNamespace : 'bvalidatorTheme' // data-bvalidator-theme- attributes
}

// set as default theme
bValidator.defaultOptions.useTheme = 'orange';
