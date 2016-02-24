/*
 * bValidator red theme options
 */

bValidator.defaultOptions.themes.red = {

    offset        : '-23,-4',
    position      : 'right,top',
    template      : '<div class="bvalidator-red-tooltip bvalidator-red-tooltip-noclose"><div class="bvalidator-red-arrow"></div><div class="bvalidator-red-msg">{message}</div></div>',
    templateClose : '<div class="bvalidator-red-tooltip"><div class="bvalidator-red-arrow"></div><div class="bvalidator-red-msg">{message}</div><div class="bvalidator-red-close">&#215;</div></div>',
    showClose     : true,
    msgShowSpeed  : 'normal',
    invalidClass  : 'bvalidator-red-invalid',
    validClass    : '',

    closeIconSelector   : '.bvalidator-red-close', // selector for close icon inside templateClose
    dataOptionNamespace : 'bvalidatorTheme' // data-bvalidator-theme- attributes
}

// set as default theme
bValidator.defaultOptions.useTheme = 'red';
