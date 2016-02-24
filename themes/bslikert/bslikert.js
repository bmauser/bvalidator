/*
 * bValidator bslikert theme options
 */

bValidator.defaultOptions.themes.bslikert = {

    offset        : '-27,-6',
    position      : 'right,top',
    template      : '<div class="bvalidator-bslikert-tooltip bvalidator-bslikert-tooltip-noclose"><div class="bvalidator-bslikert-arrow"></div><div class="bvalidator-bslikert-msg">{message}</div></div>',
    templateClose : '<div class="bvalidator-bslikert-tooltip"><div class="bvalidator-bslikert-arrow"></div><div class="bvalidator-bslikert-msg">{message}</div><div class="bvalidator-bslikert-close">&#215;</div></div>',
    showClose     : true,
    msgShowSpeed  : 'normal',
    invalidClass  : 'bvalidator-bslikert-invalid',
    validClass    : '',

    closeIconSelector   : '.bvalidator-bslikert-close', // selector for close icon inside templateClose
    dataOptionNamespace : 'bvalidatorTheme' // data-bvalidator-theme- attributes
}

// set as default theme
bValidator.defaultOptions.useTheme = 'bslikert';
