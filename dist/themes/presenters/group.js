bValidator.GroupPresenter = (function ($) {

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

        // returns container for messages
        makeMsgContainer : function ($form) {

            // make container for messages
            var $intoElement = $('<div class="' + this.themeOptions.msgClass + '"></div>'); // container for messages

            // insert message container into form
            $form.prepend($intoElement);

            return $intoElement;
        },

        // returns container element for messages
        getIntoElement : function () {

            var $intoElement;

            // if presenter is called from validator instance reference to $intoElement
            // is stored into this.validatorInstance.$groupThemeMsg
            if (this.validatorInstance && this.validatorInstance.$groupThemeMsg)
                return this.validatorInstance.$groupThemeMsg;

            // get $intoElement from intoElement() function
            if (typeof this.themeOptions.makeMsgContainer === 'function') {
                if (this.validatorInstance)
                    $intoElement = this.themeOptions.makeMsgContainer(this.validatorInstance.fn.$mainElement, this.$input);
                else
                    $intoElement = this.themeOptions.makeMsgContainer(null, this.$input);
            }
            // default
            else if (this.validatorInstance) {
                $intoElement = this.makeMsgContainer(this.validatorInstance.fn.$mainElement, this.$input);
            }

            if (this.validatorInstance)
                this.validatorInstance.$groupThemeMsg = $intoElement;

            return $intoElement;
        },

        // creates message
        createMsg : function (messages) {

            var messagesHtml = '';

            // put each message into <div>
            for (var i = 0; i < messages.length; i++)
                messagesHtml += '<div>' + messages[i] + '</div>\n';

            var $msgContainer = $('<div>' + messagesHtml + '</div>\n');

            this.getIntoElement().append($msgContainer);

            return $msgContainer;
        },

        // marks field as invalid (displays message)
        showInvalid : function (messages) {

            // remove message if shown
            if (this.$msgContainer) {
                this.removeInvalid(true);
            }

            // create message
            this.$msgContainer = this.createMsg(messages);

            if (this.validatorInstance)
                this.validatorInstance.setScrollTo(this.getIntoElement().offset().top); // top position of the message for scrolling to error

            // add css invalidClass
            if (!this.chkboxOrRadio && this.themeOptions.invalidClass) {
                this.$input.addClass(this.themeOptions.invalidClass);
            }
        },

        // marks field as valid
        showValid : function () {

            if (this.$msgContainer) {
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
            if (this.$msgContainer !== null) {
                this.$msgContainer.remove();
                this.$msgContainer = null;
            }

            // remove css invalidClass
            if (!leaveInvalidClass && this.themeOptions && this.themeOptions.invalidClass)
                this.$input.removeClass(this.themeOptions.invalidClass);

            // remove container for all messages
            if (this.validatorInstance && this.validatorInstance.$groupThemeMsg) {
                if (!this.validatorInstance.$groupThemeMsg.children().length) {
                    this.validatorInstance.$groupThemeMsg.remove();
                    this.validatorInstance.$groupThemeMsg = null;
                }
            }
        },

        // unmarks field as valid
        removeValid : function () {

            // remove css validClass
            if (!this.chkboxOrRadio && this.themeOptions && this.themeOptions.invalidClass)
                this.$input.removeClass(this.themeOptions.validClass);
        },

        // clears field
        removeAll : function () {

            this.removeValid();
            this.removeInvalid();
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
