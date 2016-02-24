bValidator.DefaultPresenter = (function ($) {

    'use strict';

    // presenter constructor
    var Constructor = function ($input, validatorInstance) {

        var Fn = function () {};
        Fn.prototype = Constructor.fn;
        this.fn = new Fn(); // object with helper functions

        this.fn.instance = this;
        this.fn.$input = $input;
        this.fn.validatorInstance = validatorInstance;
        this.fn.$tooltipContainer = null;
        this.fn.themeOptions = null;
        this.fn.chkboxOrRadio = null;
    };

    // presenter api functions
    var api = {

        // marks field as invalid (displays tooltip)
        showInvalid : function (messages) {
            this.fn.showInvalid(messages);
        },

        // marks field as valid
        showValid : function () {
            this.fn.showValid();
        },

        // clears field
        removeAll : function () {
            this.fn.removeAll();
        },

        // sets theme options
        setOptions : function (themeOptions) {
            this.fn.setOptions(themeOptions);
        },

        // checks if field is marked as invalid (if tooltip is shown)
        isInvalidOn : function () {
            return this.fn.isInvalidOn();
        }
    };

    // set api as prototype to constructor
    Constructor.prototype = api;

    // presenter core functions
    Constructor.fn = {

        // creates tooltip (hidden)
        createTooltip : function (messages) {

            var $tooltipContainer = $('<div class="bvalidator-message-container"></div>').css({
                    position   : 'absolute',
                    visibility : 'hidden'
                });
            var messagesHtml = '';
            var _instance = this.instance;
            var $tooltip;

            // insert container into the DOM
            $tooltipContainer.insertAfter(this.$input);

            // put each message into <div>
            for (var i = 0; i < messages.length; i++)
                messagesHtml += '<div>' + messages[i] + '</div>\n';

            // make tooltip from template
            if (this.themeOptions.showClose)
                $tooltip = $(this.themeOptions.templateClose.replace('{message}', messagesHtml));
            else
                $tooltip = $(this.themeOptions.template.replace('{message}', messagesHtml));

            // put tooltip to container
            $tooltip.appendTo($tooltipContainer);

            // bind close tootlip function
            $tooltip.find(this.themeOptions.closeIconSelector).click(function (e) {
                e.preventDefault();
                _instance.fn.removeInvalid(true);
            });

            // tooltip position
            var position = this.getTooltipPosition($tooltip, $tooltipContainer);

            // position the tooltip
            $tooltip.css({
                top : position.top,
                left : position.left
            });

            return {
                $tooltipContainer : $tooltipContainer,
                $tooltip : $tooltip
            }
        },

        // calculate message position
        getTooltipPosition : function ($tooltip, $tooltipContainer) {

            var offset = this.themeOptions.offset.split(',');

            var top  = -(($tooltipContainer.offset().top - this.$input.offset().top) + $tooltip.outerHeight() - parseInt(offset[1], 10));
            var left = (this.$input.offset().left + this.$input.outerWidth()) - $tooltipContainer.offset().left + parseInt(offset[0], 10);

            var position = this.themeOptions.position.split(',');
            var x = position[0]; // $.trim
            var y = position[1];

            // adjust Y
            if (y == 'center' || y == 'bottom') {
                var height = $tooltip.outerHeight() + this.$input.outerHeight();
                if (y == 'center') {
                    top += height / 2;
                }
                if (y == 'bottom') {
                    top += height;
                }
            }

            // adjust X
            if (x == 'center' || x == 'left') {
                var width = this.$input.outerWidth();
                if (x == 'center') {
                    left -= width / 2;
                }
                if (x == 'left') {
                    left -= width;
                }
            }

            return {
                top : top,
                left : left
            };
        },

        // marks field as invalid (displays tooltip)
        showInvalid : function (messages) {

            if (this.$tooltipContainer) {
                this.removeInvalid(true);
            }

            // create message in the DOM
            var msg = this.createTooltip(messages);

            msg.$tooltip.css({
                display : 'none'
            }) // hide the message for fadeIn
            msg.$tooltipContainer.css({
                visibility : 'visible'
            }); // unhide container
            msg.$tooltip.fadeIn(this.themeOptions.msgShowSpeed); // fadeIn message (better looks in browser when only message is faded in, not container)
            if (this.validatorInstance)
                this.validatorInstance.setScrollTo(msg.$tooltip.offset().top); // top position of the message for scrolling to error

            this.$tooltipContainer = msg.$tooltipContainer;

            // add css invalidClass
            if (!this.chkboxOrRadio && this.themeOptions.invalidClass) {
                this.$input.addClass(this.themeOptions.invalidClass);
            }
        },

        // marks field as valid
        showValid : function () {

            if (this.$tooltipContainer) {
                this.removeInvalid();
            }

            if (!this.chkboxOrRadio && this.themeOptions.validClass) {
                // add css validClass to the input
                this.$input.addClass(this.themeOptions.validClass);
            }
        },

        // unmarks field as invalid
        removeInvalid : function (leaveInvalidClass) {

            // remove message
            if (this.$tooltipContainer !== null) {
                this.$tooltipContainer.remove();
                this.$tooltipContainer = null;
            }

            // remove css invalidClass
            if (!leaveInvalidClass && this.themeOptions && this.themeOptions.invalidClass)
                this.$input.removeClass(this.themeOptions.invalidClass);
        },

        // unmarks field as valid
        removeValid : function () {

            // remove css validClass
            if (!this.chkboxOrRadio && this.themeOptions && this.themeOptions.invalidClass)
                this.$input.removeClass(this.themeOptions.validClass);
        },

        // clears field
        removeAll : function () {

            this.removeValid()
            this.removeInvalid()
        },

        // sets theme options
        setOptions : function (themeOptions) {
            this.themeOptions = themeOptions;

            if (this.$input[0].type == 'checkbox' || this.$input[0].type == 'radio')
                this.chkboxOrRadio = true;
            else
                this.chkboxOrRadio = false;
        },

        // checks if field is marked as invalid (if tooltip is shown)
        isInvalidOn : function () {

            if (this.$tooltipContainer !== null)
                return true;

            return false;
        }
    }

    return Constructor;

})(jQuery);
