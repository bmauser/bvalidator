/*
 * bValidator gray4 theme options
 */

bValidator.defaultOptions.themes.gray4 = {

    offset        : '0,-4',
    position      : 'left,top',
    template      : '<div class="bvalidator-gray4-tooltip bvalidator-gray4-tooltip-noclose"><div class="bvalidator-gray4-arrow"></div><div class="bvalidator-gray4-msg">{message}</div></div>',
    templateClose : '<div class="bvalidator-gray4-tooltip"><div class="bvalidator-gray4-arrow"></div><div class="bvalidator-gray4-msg">{message}</div><div class="bvalidator-gray4-close">&#215;</div></div>',
    showClose     : false,
    msgShowSpeed  : 'normal',
    invalidClass  : 'bvalidator-gray4-invalid',
    validClass    : '',

    closeIconSelector   : '.bvalidator-gray4-close', // selector for close icon inside templateClose
    dataOptionNamespace : 'bvalidatorTheme' // data-bvalidator-theme- attributes
}

// set as default theme
bValidator.defaultOptions.useTheme = 'gray4';
