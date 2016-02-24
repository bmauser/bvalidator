/*
 * bValidator bs3popover theme
 */

bValidator.defaultOptions.themes.bs3tooltip = {

    tooltipOptions : { // see: http://getbootstrap.com/javascript/#tooltips-options
        html     : 'true',
        viewport : null,
        trigger  : 'manual'
    },
    placement : 'right', // top | bottom | left | right
    content   : '<div class="bvalidator-bs3tooltip-msg bvalidator-bs3tooltip-msg-noclose">{message}</div>',
    contentClose : '<div class="bvalidator-bs3tooltip-msg">{message}</div><div class="bvalidator-bs3tooltip-close"><button type="button" class="close" aria-label="Close"><span aria-hidden="true">&times;</span></button></div>',
    showClose : true,

    dataOptionNamespace : 'bvalidatorTheme', // data-bvalidator-theme- attributes
    presenter : 'Bs3PopoverTooltipPresenter' // or constructor function
}

// set as default theme
bValidator.defaultOptions.useTheme = 'bs3tooltip';
