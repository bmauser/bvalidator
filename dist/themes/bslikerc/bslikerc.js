/*
 * bValidator bslikerc theme options
 */

bValidator.defaultOptions.themes.bslikerc = {

    offset        : '15,0',
    position      : 'right,center',
    template      : '<div class="bvalidator-bslikerc-tooltip bvalidator-bslikerc-tooltip-noclose"><div class="bvalidator-bslikerc-arrow"></div><div class="bvalidator-bslikerc-msg">{message}</div></div>',
    templateClose : '<div class="bvalidator-bslikerc-tooltip"><div class="bvalidator-bslikerc-arrow"></div><div class="bvalidator-bslikerc-msg">{message}</div><div class="bvalidator-bslikerc-close">&#215;</div></div>',
    showClose     : true,
    msgShowSpeed  : 'normal',
    invalidClass  : 'bvalidator-bslikerc-invalid',
    validClass    : '',

    closeIconSelector   : '.bvalidator-bslikerc-close', // selector for close icon inside templateClose
    dataOptionNamespace : 'bvalidatorTheme' // data-bvalidator-theme- attributes
}

// set as default theme
bValidator.defaultOptions.useTheme = 'bslikerc';
