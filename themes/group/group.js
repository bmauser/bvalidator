/*
 * bValidator 'group' theme options
 */

bValidator.defaultOptions.themes.group = {

    invalidClass : 'bvalidator-group-invalid',
    validClass   : '',
    msgClass     : 'bvalidator-group-msg',

    // Function that returns $element into which messages will be appended: funtion($form, $input)
    makeMsgContainer : null,

    dataOptionNamespace : 'bvalidatorTheme', // data-bvalidator-theme- attributes
    presenter : 'GroupPresenter'
}

// set as default theme
bValidator.defaultOptions.useTheme = 'group';
