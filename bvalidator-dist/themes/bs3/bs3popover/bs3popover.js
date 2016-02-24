/*
 * bValidator bs3popover theme options
 */

bValidator.defaultOptions.themes.bs3popover = {

    popoverOptions : { // see: http://getbootstrap.com/javascript/#popovers-options
        html     : 'true',
        template : '<div class="popover" role="tooltip"><div class="arrow"></div><div class="popover-content"></div></div>',
        viewport : null,
        trigger  : 'manual'
    },
    placement : 'right', // top | bottom | left | right
    content   : '<div class="bvalidator-bs3popover-msg bvalidator-bs3popover-msg-noclose">{message}</div>',
    contentClose : '<div class="bvalidator-bs3popover-msg">{message}</div><div class="bvalidator-bs3popover-close"><button type="button" class="close" aria-label="Close"><span aria-hidden="true">&times;</span></button></div>',
    showClose : true,

    dataOptionNamespace : 'bvalidatorTheme', // data-bvalidator-theme- attributes
    presenter : 'Bs3PopoverTooltipPresenter' // or constructor function
}

// set as default theme
bValidator.defaultOptions.useTheme = 'bs3popover';
