/*
 * bValidator gray3 theme options
 */

bValidator.defaultOptions.themes.gray3 = {

    offset        : '-23,-6',
    position      : 'right,top',
    template      : '<div class="bvalidator-gray3-tooltip bvalidator-gray3-tooltip-noclose"><div class="bvalidator-gray3-arrow"></div><div class="bvalidator-gray3-msg">{message}</div></div>',
    templateClose : '<div class="bvalidator-gray3-tooltip"><div class="bvalidator-gray3-arrow"></div><div class="bvalidator-gray3-msg">{message}</div><div class="bvalidator-gray3-close">&#215;</div></div>',
    showClose     : true,
    msgShowSpeed  : 'normal',
    invalidClass  : 'bvalidator-gray3-invalid',
    validClass    : '',

    closeIconSelector   : '.bvalidator-gray3-close', // selector for close icon inside templateClose
    dataOptionNamespace : 'bvalidatorTheme' // data-bvalidator-theme- attributes
}

// set as default theme
bValidator.defaultOptions.useTheme = 'gray3';
