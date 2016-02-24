/*
 * bValidator gray theme options
 */

bValidator.defaultOptions.themes.gray = {

    offset        : '-23,-4',
    position      : 'right,top',
    template      : '<div class="bvalidator-gray-tooltip bvalidator-gray-tooltip-noclose"><div class="bvalidator-gray-arrow"></div><div class="bvalidator-gray-msg">{message}</div></div>',
    templateClose : '<div class="bvalidator-gray-tooltip"><div class="bvalidator-gray-arrow"></div><div class="bvalidator-gray-msg">{message}</div><div class="bvalidator-gray-close">&#215;</div></div>',
    showClose     : true,
    msgShowSpeed  : 'normal',
    invalidClass  : 'bvalidator-gray-invalid',
    validClass    : '',

    closeIconSelector   : '.bvalidator-gray-close', // selector for close icon inside templateClose
    dataOptionNamespace : 'bvalidatorTheme' // $.data namespace fordata-bvalidator-theme- attributes
}

// set as default theme
bValidator.defaultOptions.useTheme = 'gray';
