/*
 * bValidator 'bs3form' theme options
 */

bValidator.defaultOptions.themes.bs3form = {

    template : '<div class="help-block">{message}</div>', // template for messages
    formGroupInvalidClass : 'has-error',
    formGroupValidClass : '', // has-success
    showMessages : true, // you can set this to false for inline forms

    // Selector for element with 'form-group' class.
    // If selector is not #id, search with .closest() is used.
    formGroup : '.form-group',

    // Selector for element to append validation message.
    // If selector is not #id, search with .closest() is used.
    // If not found 'form-group' element is used.
    msgParent : '.bvalidator-bs3form-msg',

    dataOptionNamespace : 'bvalidatorTheme', // data-bvalidator-theme- attributes
    presenter : 'Bs3FormPresenter'
}

// set as default theme
bValidator.defaultOptions.useTheme = 'bs3form';
