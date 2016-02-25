/*!
 * JS for bValidator docs
 *
 * http://bojanmauser.from.hr/bvalidator/
 */

(function ($) {

    'use strict';

    // api
    var bDocs = {

        formatSource : function ($element) {
            $element.html(this.fn.formatSource($element.html()));
        },

        makeSourceEditable : function ($element) {
            this.fn.makeSourceEditable($element);
        },

        alertSubmit : function ($forms) {
            this.fn.alertSubmit($forms);
        }
    };

    // functions
    bDocs.fn = {

        formatSource : function (source) {
            return prettyPrintOne($.trim(source), 'html');
        },

        // alert on submit
        alertSubmit : function ($forms) {
            $forms.submit(function () {
                window.alert('Form is submitted.');
                return false;
            });
        },

        initExample : function ($htmlContainer, resizeLabels) {

            // if labels should be resized
            if (resizeLabels)
                this.resizeLabels($htmlContainer);

            // init bvalidator
            $htmlContainer.find('[data-bvalidator-validate]').each(function () {
                bValidator.fn.makeInstance($(this))
            })

            // stop form submit
            this.alertSubmit($htmlContainer.find('form'));

        },

        resizeLabels : function ($element) {

            var $labels = $element.find('label');

            $labels.each(function () {

                var labelTextLen = $(this).text().length;

                if (labelTextLen <= 15) {
                    $(this).addClass('bdocs-width1');
                } else if (labelTextLen <= 35) {
                    $(this).addClass('bdocs-width2');
                }
            });
        },

        brAfterInput : function (source) {
            return source
            .replace(/ type="text">/g, 'type="text"><br />')
            .replace(/ type="password">/g, 'type="password"><br />')
            .replace(/ type="text" >/g, 'type="text"><br /><br />')
            .replace(/ type="file">/g, 'type="file"><br />');
        },

        updateExampleSourceFromEditor : function ($sourceContainer, codeMirror, $htmlContainer) {

            if (!codeMirror)
                codeMirror = $sourceContainer.data('codeMirror.bDocs');
            if (!$htmlContainer)
                $htmlContainer = $sourceContainer.find('.bdocs-example-html-container');

            var source = codeMirror.getValue();
            if ($htmlContainer.hasClass('bdocs-example-html') && $sourceContainer.data('bdocsBrInput') === true)
                source = this.brAfterInput(source);

            var $updateIndicator = $('<div class="bdocs-example-update-indicator"></div>');

            $htmlContainer.html(source).append($updateIndicator);

            $updateIndicator.width($updateIndicator.width() + 20).height($updateIndicator.height() + 20)
            .fadeOut('slow', function () {
                $updateIndicator.remove();
            });
        },

        makeSourceEditable : function ($sourceContainer, source) {

            var fn = this;

            var $htmlContainer = $sourceContainer.find('.bdocs-example-html-container');

            // get the source code
            if (!source) {

                var srcUrl = $sourceContainer.data('bdocsSrc'); // from data-bdocs-src element

                if (srcUrl) {
                    jQuery.get(srcUrl, function (source) {
                        fn.makeSourceEditable($sourceContainer, source);
                    });
                } else {
                    source = $.trim($htmlContainer.text());
                    $htmlContainer.html('');
                }
            }

            var sourceBr;

            if (!$sourceContainer.data('bdocsNostyles') && $sourceContainer.data('bdocsBrInput') === true) // data-bdocs-nostyles
                sourceBr = fn.brAfterInput(source);
            else
                sourceBr = source;

            var resizeLabels = false;

            // if labels should be resized
            if ($sourceContainer.data('bdocsResizeLabels') === true)
                resizeLabels = true;

            $htmlContainer.append(sourceBr);

            var $editorContainer = $sourceContainer.find('.bdocs-example-editor-container');

            if ($editorContainer) {

                var $editor = $editorContainer.find('.bdocs-editor');
                var $showSourceBtt = $sourceContainer.find('.bdocs-example-show-editor-btt');
                var $removeStylesBtt = $editorContainer.find('.bdocs-remove-styles-btt');

                $showSourceBtt.on('click', function () {

                    var codeMirror = $sourceContainer.data('codeMirror.bDocs');

                    if (!codeMirror) {

                        codeMirror = CodeMirror($editor[0], {
                                value : source,
                                mode : 'htmlmixed',
                                indentUnit : 1,
                                smartIndent : true,
                                tabSize : 4,
                                indentWithTabs : false,
                                lineWrapping : false,
                                lineNumbers : true,
                                styleActiveLine : true,
                                theme : 'bdocs'
                            });

                        $sourceContainer.data('codeMirror.bDocs', codeMirror);

                        codeMirror.on('changes', function () {

                            if ($sourceContainer.updateTimeout)
                                clearTimeout($sourceContainer.updateTimeout);

                            $sourceContainer.updateTimeout = setTimeout(function () {
                                    fn.updateExampleSourceFromEditor($sourceContainer, codeMirror, $htmlContainer);
                                    fn.initExample($htmlContainer, resizeLabels);
                                }, 300);
                        })
                    }

                    // open or hide editor
                    $editorContainer.toggle(400, function () {

                        if ($editorContainer.is(':visible')) {
                            codeMirror.refresh();
                            $showSourceBtt.html('Hide editor');
                        } else {
                            $showSourceBtt.html('Source');
                        }

                        $('body').scrollspy('refresh');
                    });
                });

                $removeStylesBtt.on('click', function () {
                    if ($htmlContainer.hasClass('bdocs-example-html')) {
                        $htmlContainer.removeClass('bdocs-example-html');
                        $removeStylesBtt.html('Add styling');
                    } else {
                        $htmlContainer.addClass('bdocs-example-html')
                        $removeStylesBtt.html('No styling');
                    }
                });
            }

            fn.initExample($htmlContainer, resizeLabels);
        }
    };

    // jQuery plugin constructor
    $.fn.bDocs = function (functionName) {

        return this.each(function () {
            if (typeof functionName == 'string')
                bDocs[functionName]($(this))
        });
    };

})(jQuery);
