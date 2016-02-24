bValidator.InsertPresenter = (function ($) {

    'use strict';

    // presenter constructor
    var Constructor = function ($input, validatorInstance) {

        var Fn = function () {};
        Fn.prototype = Constructor.fn;
        this.fn = new Fn(); // object with helper functions

        this.fn.$input = $input;
        this.fn.validatorInstance = validatorInstance;
        this.fn.$msgContainer = null; // can be 0 if no template
        this.fn.themeOptions = null;
        this.fn.chkboxOrRadio = null;
    };

    // presenter api functions
    var api = {

        // marks field as invalid (displays message)
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

        // checks if field is marked as invalid (if message is shown)
        isInvalidOn : function () {
            return this.fn.isInvalidOn();
        }
    };

    // set api as prototype to constructor
    Constructor.prototype = api;

    // functions
    Constructor.fn = {

        // creates message
        createMsg : function (messages) {

            var messagesHtml = '';
            var $msgContainer = 0;

            if (this.themeOptions.template) {

                // put each message into <div>
                for (var i = 0; i < messages.length; i++)
                    messagesHtml += '<div>' + messages[i] + '</div>\n';

                // make message from template
                $msgContainer = $(this.themeOptions.template.replace('{message}', messagesHtml).replace('{msgClass}', this.themeOptions.msgClass));

                // insert container into the DOM
                if (this.themeOptions.placement == 'before')
                    $msgContainer.insertBefore(this.$input);
                else if (this.themeOptions.placement == 'after')
                    $msgContainer.insertAfter(this.$input);
            }

            return $msgContainer;
        },

        // marks field as invalid (displays message)
        showInvalid : function (messages) {

            // remove message if shown
            this.removeInvalid(true);

            // create message
            var msg = this.createMsg(messages);

            if (this.validatorInstance) {
                // top position of the message for scrolling to error
                if (msg)
                    this.validatorInstance.setScrollTo(msg.offset().top);
                else
                    this.validatorInstance.setScrollTo(this.$input.offset().top); // if no message use $input top position
            }

            this.$msgContainer = msg;

            // add css invalidClass
            if (!this.chkboxOrRadio && this.themeOptions.invalidClass) {
                this.$input.addClass(this.themeOptions.invalidClass);
            }
        },

        // marks field as valid
        showValid : function () {

            this.removeInvalid();

            if (!this.chkboxOrRadio && this.themeOptions.validClass) {
                // add css validClass to the input
                this.$input.addClass(this.themeOptions.validClass);
            }
        },

        // unmarks field as invalid
        removeInvalid : function (leaveInvalidClass) {

            // remove message
            if (this.$msgContainer !== null) {
                if (this.$msgContainer)
                    this.$msgContainer.remove();
                this.$msgContainer = null;
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

        // checks if field is marked as invalid (if message is shown)
        isInvalidOn : function () {

            if (this.$msgContainer !== null)
                return true;

            return false;
        }
    }

    return Constructor;

})(jQuery);
