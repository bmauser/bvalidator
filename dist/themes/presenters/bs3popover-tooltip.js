bValidator.Bs3PopoverTooltipPresenter = (function ($) {

    'use strict';

    // presenter constructor
    var Constructor = function ($input, validatorInstance) {

        var Fn = function () {};
        Fn.prototype = Constructor.fn;

        this.fn = new Fn();
        this.fn.$input = $input;
        this.fn.validatorInstance = validatorInstance;
        this.fn.$tooltipContainer = null;
        this.fn.type = null;
    }

    Constructor.prototype = {

        removeAll : function () {
            this.fn.removeInvalid();
        },

        isInvalidOn : function () {
            return this.fn.isInvalidOn();
        },

        setOptions : function (themeOptions) {
            this.fn.setOptions(themeOptions);
        },

        showInvalid : function (messages) {
            this.fn.showInvalid(messages);
        },

        showValid : function () {
            this.fn.removeInvalid();
        },

        destroy : function () {
            this.fn.destroy();
        }
    }

    Constructor.fn = {

        // removes popover from the DOM
        removeInvalid : function () {
            this.$input[this.type]('hide');
        },

        // checks if popover is shown
        isInvalidOn : function () {
            if (this.$input.data()['bs.' + this.type] && this.$input.data()['bs.' + this.type].tip().hasClass('in'))
                return true;
            return false;
        },

        // returns tooltip message content
        getTooltipContent : function (messages) {

            var tooltipContent = '';
            var $tooltipContent;

            // put each message into <div>
            for (var i = 0; i < messages.length; i++)
                tooltipContent += '<div>' + messages[i] + '</div>\n';

            // popover content
            if (this.themeOptions.showClose)
                $tooltipContent = $(this.themeOptions.contentClose.replace('{message}', tooltipContent));
            else
                $tooltipContent = $(this.themeOptions.content.replace('{message}', tooltipContent));

            return $tooltipContent;
        },

        // sets theme options
        setOptions : function (themeOptions) {
            this.themeOptions = themeOptions;

            if (themeOptions.popoverOptions)
                this.type = 'popover';
            else
                this.type = 'tooltip';
        },

        // destroys popup
        destroy : function () {
            this.$input[this.type]('destroy');
            this.$tooltipContainer.detach();
            this.$tooltipContainer = null;
        },

        // displays message
        showInvalid : function (messages) {

            var tooltipContent = this.getTooltipContent(messages);

            // if popover is already initialized just replace the content
            if (this.$tooltipContainer) {
                this.$input.data('bs.' + this.type).options.content = tooltipContent;
            }
            // make a new tooltip
            else {

                // message container
                this.$tooltipContainer = $('<div class="bvalidator-bs3' + this.type + '-container"></div>')
                this.$tooltipContainer.insertAfter(this.$input);

                // options for tooltip or popover
                var options = {
                    container : this.$tooltipContainer,
                    placement : this.themeOptions.placement
                }

                if (this.type == 'tooltip') {
                    options.title = tooltipContent;
                    options = $.extend({}, options, this.themeOptions.tooltipOptions);
                } else { // popover
                    options.content = tooltipContent;
                    options = $.extend({}, options, this.themeOptions.popoverOptions);
                }

                // init popover or tooltip with options
                this.$input[this.type](options);
            }

            // show popup
            this.$input[this.type]('show');

            var $popup = this.$input.data()['bs.' + this.type].tip();
            var presenter = this;

            // bind close on click
            $popup.find('button').click(function () {
                presenter.removeInvalid();
            });

            // set scroll position
            this.validatorInstance.setScrollTo($popup.offset().top);
        }
    }

    return Constructor;

})(jQuery);
