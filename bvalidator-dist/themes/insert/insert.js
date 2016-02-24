/*
 * bValidator 'insert' theme options
 */

bValidator.defaultOptions.themes.insert = {

    placement     : 'after', // message 'after' or 'before'
    template      : '<div class="{msgClass}">{message}</div>',
    invalidClass  : 'bvalidator-insert-invalid',
    validClass    : '',
    msgClass      : 'bvalidator-insert-msg',

    dataOptionNamespace : 'bvalidatorTheme', // data-bvalidator-theme- attributes
    presenter : 'InsertPresenter'
}

// set as default theme
bValidator.defaultOptions.useTheme = 'insert';
