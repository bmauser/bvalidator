/*
 * bValidator postit theme options
 */

bValidator.defaultOptions.themes.postit = {

    offset        : '-29,-10',
    position      : 'right,top',
    template      : '<div class="bvalidator-postit-tooltip bvalidator-gray3-tooltip-noclose"><div class="bvalidator-postit-arrow"></div><div class="bvalidator-postit-msg">{message}</div></div>',
    templateClose : '<div class="bvalidator-postit-tooltip"><div class="bvalidator-postit-arrow"></div><div class="bvalidator-postit-msg">{message}</div><div class="bvalidator-postit-close">&#215;</div></div>',
    showClose     : true,
    msgShowSpeed  : 'normal',
    invalidClass  : 'bvalidator-postit-invalid',
    validClass    : '',

    closeIconSelector   : '.bvalidator-postit-close', // selector for close icon inside templateClose
    dataOptionNamespace : 'bvalidatorTheme' // data-bvalidator-theme- attributes
}

// set as default theme
bValidator.defaultOptions.useTheme = 'postit';
