/*
 * bValidator gray2 theme options
 */

bValidator.defaultOptions.themes.gray2 = {

    offset        : '10,0',
    position      : 'right,center',
    template      : '<div class="bvalidator-gray2-tooltip bvalidator-gray2-tooltip-noclose"><div class="bvalidator-gray2-arrow"></div><div class="bvalidator-gray2-msg">{message}</div></div>',
    templateClose : '<div class="bvalidator-gray2-tooltip"><div class="bvalidator-gray2-arrow"></div><div class="bvalidator-gray2-msg">{message}</div><div class="bvalidator-gray2-close">&#215;</div></div>',
    showClose     : true,
    msgShowSpeed  : 'normal',
    invalidClass  : 'bvalidator-gray2-invalid',
    validClass    : '',

    closeIconSelector   : '.bvalidator-gray2-close', // selector for close icon inside templateClose
    dataOptionNamespace : 'bvalidatorTheme' // data-bvalidator-theme- attributes
}

// set as default theme
bValidator.defaultOptions.useTheme = 'gray2';
