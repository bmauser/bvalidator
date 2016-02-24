bValidator.Bs3FormPresenter = (function ($) {

    'use strict';

    // presenter constructor
    var Constructor = function ($input, validatorInstance) {

        var Fn = function () {};
        Fn.prototype = Constructor.fn;
        this.fn = new Fn(); // object with helper functions

        this.fn.$input = $input;
        this.fn.validatorInstance = validatorInstance;
        this.fn.$msgContainer = null;
        this.fn.themeOptions = null;
        this.fn.chkboxOrRadio = null;
        this.fn.$formGroupElement = null; // elemnet with 'form-group' class
        this.fn.$msgParent = null; // elemet into which validation message will be appended
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

    // presenter core functions
    Constructor.fn = {

        // creates message
        createMsg : function (messages) {

            var messagesHtml = '';

            // put each message into <div>
            for (var i = 0; i < messages.length; i++)
                messagesHtml += '<div>' + messages[i] + '</div>';

            // make message from template
            return $(this.themeOptions.template.replace('{message}', messagesHtml));
        },

        // marks field as invalid (displays message)
        showInvalid : function (messages) {

            // remove message if shown
            this.removeInvalid(true);

            if (this.validatorInstance) {
                // top position of the message for scrolling to error
                this.validatorInstance.setScrollTo(this.$input.offset().top);
            }

            // add 'has-error' class
            this.getFormGroupElement().addClass(this.themeOptions.formGroupInvalidClass);

            if (this.themeOptions.showMessages === true) {

                // create message
                this.$msgContainer = this.createMsg(messages);

                // insert messages
                this.getMsgContainer().append(this.$msgContainer);
            }
        },

        // returns element for 'has-error' class
        getFormGroupElement : function () {

            if (this.$formGroupElement !== null && this.$formGroupElement.length)
                return this.$formGroupElement;

            var $formGroupElement = null;
            var selector = this.themeOptions.formGroup;

            // if selector is for id
            if (selector[0] == '#')
                $formGroupElement = $(selector);

            // find 'form-group' element in parents
            else {
                if (this.validatorInstance)
                    $formGroupElement = this.$input.closest(selector, this.validatorInstance.fn.$mainElement);
                else
                    $formGroupElement = this.$input.closest(selector);
            }

            if ($formGroupElement.length === 0)
                window.console.warn('[bValidator \'bs3form\' theme] missing form-group element');

            this.$formGroupElement = $formGroupElement;

            return $formGroupElement;
        },

        getMsgContainer : function () {

            // if msgParent option is not set use 'form-group' element
            if (!this.themeOptions.msgParent)
                return this.getFormGroupElement();

            if (this.$msgParent !== null && this.$msgParent.length)
                return this.$msgParent;

            var $msgParent = null;
            var selector = this.themeOptions.msgParent;

            // if selector is for id
            if (selector[0] == '#')
                $msgParent = $(selector);

            // find 'bvalidator-bs3form-msg' element in parents
            else {
                if (this.validatorInstance)
                    $msgParent = this.$input.closest(selector, this.validatorInstance.fn.$mainElement);
                else
                    $msgParent = this.$input.closest(selector);
            }

            // use 'form-group' element if $msgParent is no found
            if ($msgParent.length === 0)
                $msgParent = this.getFormGroupElement();

            this.$msgParent = $msgParent;

            return $msgParent;
        },

        // marks field as valid
        showValid : function () {

            this.removeInvalid();

            // add 'has-success' class
            if (this.themeOptions.formGroupValidClass)
                this.getFormGroupElement().addClass(this.themeOptions.formGroupValidClass);
        },

        // unmarks field as invalid
        removeInvalid : function () {

            // remove message
            if (this.$msgContainer !== null) {
                this.$msgContainer.remove();
                this.$msgContainer = null;
            }

            // remove 'has-error' class
            this.getFormGroupElement().removeClass(this.themeOptions.formGroupInvalidClass);
        },

        // unmarks field as valid
        removeValid : function () {
            // remove 'has-success' class
            this.getFormGroupElement().removeClass(this.themeOptions.formGroupValidClass);
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
