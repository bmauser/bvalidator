$(document).ready(function () {

    'use strict'

    // set get method for ajax, because github forbids post requests
    bValidator.defaultOptions.ajaxOptions = {
        cache  : false,
        method : 'GET'
    };

    $('.bdocs-highlight-source').bDocs('formatSource');

    $('.bdocs-live-example').bDocs('makeSourceEditable');

    // for themes examples
    $('.bdocs-theme-example form').each(function () {
        var $form = $(this);
        $form.off('submit');
        $form.bValidator('getOptions').scrollToError = false;
    })

    $('#bvd_section_themes form').each(function () {
        var $form = $(this);
        $form.bValidator('getOptions').scrollToError = false;
        $form.bValidator('validate');
        $form.bValidator('getOptions').scrollToError = true;
    })

    // change theme menu
    $('#bvd_change_theme a').each(function () {
        $(this).on('click', function (e) {
            e.preventDefault();

            var $a = $(this);
            var $forms = $('.bdocs-example-html-container form, #input-container');
            var withCloseIcon = $a.attr('data-bvd-theme-option-close');

            // show/hide close icon
            if (withCloseIcon) {

                if (withCloseIcon == 'no') {
                    withCloseIcon = true;
                    $a.attr('data-bvd-theme-option-close', 'yes');
                    $a.html('Without close icon');
                } else {
                    withCloseIcon = false;
                    $a.attr('data-bvd-theme-option-close', 'no');
                    $a.html('With close icon');
                }

                $forms.each(function () {

                    var $form = $(this);
                    var options = $form.data('bValidator').getOptions();

                    for (var themeName in options.themes) {
                        if (options.themes.hasOwnProperty(themeName)) {
                            options.themes[themeName].showClose = withCloseIcon;
                        }
                    }
                });
            }
            // change theme
            else {

                var theme = $a.data('bvdTheme'); // theme name
                var themeNiceName = $a.html();

                // change theme for each validator
                $forms.each(function () {
                    $(this).data('bValidator').getOptions().useTheme = theme;
                });

                // set default theme
                bValidator.defaultOptions.useTheme = theme;

                // rename theme in the menu
                $('#bvd_menu_theme_name').html(themeNiceName);
            }
        })
    });

    var $window = $(window);
    var $body = $(document.body);

    $body.scrollspy({
        target : '.bdocs-sidebar'
    })

    $window.on('load', function () {
        $body.scrollspy('refresh');
    })

    // theme name in the menu
    $('#bvd_menu_theme_name').html(bValidator.defaultOptions.useTheme);

});
