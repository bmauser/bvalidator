/*!
 * jQuery bValidator plugin
 *
 * http://bmauser.github.io/bvalidator/
 */

var bValidator = (function ($) {

    'use strict';

    // bValidator constructor
    var Constructor = function ($mainElement, overrideOptions, instanceName) {

        // object with all validator instances
        var allInstances = $mainElement.data('bValidators');

        // make a new object with all instances
        if (!allInstances) {
            allInstances = {};
            $mainElement.data('bValidators', allInstances);
        }

        if (!instanceName)
            instanceName = 'bvalidator'; // default instance name
        else
            instanceName = instanceName.toLowerCase();

        // put reference to first instance to .data store
        if (!$mainElement.data('bValidator'))
            $mainElement.data('bValidator', this);
        allInstances[instanceName] = this;

        // object with helper functions
        var Fn = function () {};
        Fn.prototype = bValidator.fn;
        this.fn = new Fn();

        // object with validators
        this.fn.validators = bValidator.validators;

        // object with modifiers
        this.fn.modifiers = bValidator.modifiers;

        // values used by functions in fn object
        this.fn.options = $.extend(true, {}, bValidator.defaultOptions, this.fn.getAttrOptions($mainElement, instanceName + bValidator.defaultOptions.dataOptionNamespace), overrideOptions); // get options from default options, from data-bvalidator-option attributes, from overrideOptions parameter
        this.fn.instance = this;
        this.fn.dataNamespace = this.fn.getDataNamespace(instanceName); // .data() namespace
        this.fn.eventNamespace = this.fn.dataNamespace; // event namespace
        this.fn.$mainElement = $mainElement;
        this.fn.instanceName = instanceName;
        this.fn.dataAttrPrefix = 'data-' + instanceName;

        // bind validateOn event
        if (this.fn.options.validateOn)
            this.fn.bindValidateOn(this.fn.getElementsForValidation($mainElement));

        // bind validator to form
        if ($mainElement.is('form'))
            this.fn.bindToForm($mainElement);

    };

    // object with core functions
    Constructor.fn = {

        // binds validation on form submit and reset
        bindToForm : function ($form) {

            var fn = this;

            if (fn.options.validateOnSubmit) {

                $form.on('submit', function (submitEvent) {

                    var validationResult = true;

                    if (!fn.bValidatorSkip) {

                        $form.trigger($.Event('beforeFormValidation' + fn.eventNamespace, {
                                bValidator : {
                                    instance : fn.instance
                                }
                            }));

                        validationResult = fn.validate(false, false, submitEvent, 'scroll');

                        // validation is continued in ajax call
                        if (validationResult == 'withAjax') {
                            submitEvent.stopImmediatePropagation(); // stop submit event
                            return false;
                        }

                        if (!validationResult && fn.options.stopSubmitPropagation) {
                            submitEvent.stopImmediatePropagation(); // stop submit event
                            // return false;
                        }
                    }

                    fn.bValidatorSkip = false;

                    $form.trigger($.Event('afterFormValidation' + fn.eventNamespace, {
                            bValidator : {
                                instance : fn.instance,
                                validationResult : validationResult
                            }
                        }));

                    return validationResult;
                });
            }

            // bind reset on form reset
            $form.on('reset', function () {
                fn.instance.reset();
            });

            // disable html5 validation
            if (fn.options.html5ValidationOff) {
                $form.attr('novalidate', 'novalidate');
            }
        },

        // makes request for 'ajax' action
        getDataNamespace : function (instanceName) {
            return '.' + instanceName;
        },

        // makes request for 'ajax' action
        serverValidate : function (ajaxActions, inputsAndMessages, fromEvent, onlyValidCheck, allFieldsOK) {

            var postInputs = {};
            var fn = this;
            var useMsgFromCache = false;
            var postName;

            // for each ajax validation
            for (var i = 0; i < ajaxActions.length; i++) {

                var $input = ajaxActions[i].$input;

                // value to validate
                var inputValue = $input.val();

                // check to use value from cache
                if (fn.options.ajaxCache) {

                    // data from last ajax response
                    var ajaxCache = $input.data('ajaxCache' + fn.dataNamespace);

                    if (!ajaxCache) {
                        ajaxCache = {};
                        $input.data('ajaxCache' + fn.dataNamespace, ajaxCache);
                    }

                    // if input value is not changed
                    if (ajaxCache.lastInputValue === inputValue && !fn.ajaxFailed) {
                        // show last error message
                        if (ajaxCache.lastMessage) {
                            fn.addToInputsAndMessages(inputsAndMessages, $input, ajaxCache.lastMessage)
                            useMsgFromCache = true;
                        }

                        continue;
                    } else
                        ajaxCache.lastInputValue = inputValue;
                }

                // post parameter name
                postName = fn.getPostName($input);

                postInputs[postName] = {
                    $input : $input,
                    inputValue : inputValue,
                    actionData : ajaxActions[i]
                };
            }

            // nothing to validate with ajax
            if ($.isEmptyObject(postInputs)) {
                if (useMsgFromCache) {
                    this.$mainElement.trigger($.Event('afterAjax' + fn.eventNamespace, {
                            bValidator : {
                                instance : fn.instance,
                                validationResult : false
                            }
                        }));
                    return 0; // using cache
                } else {
                    return false; // nothing to validate
                }
            }

            // options for jQuery.ajax
            var ajaxOptions = fn.getAjaxOptions(postInputs);

            // values to post
            for (postName in postInputs) {
                if (postInputs.hasOwnProperty(postName)) {
                    ajaxOptions.data[postName] = postInputs[postName].inputValue;
                }
            }

            // do ajax request
            $.ajax(ajaxOptions)
            .done(function (ajaxResponse) {
                fn.ajaxFailed = false;
                fn.afterAjaxRequest(ajaxResponse, postInputs, inputsAndMessages, fromEvent, onlyValidCheck, allFieldsOK);
            })
            .fail(function (xhr, textStatus, errorThrown) {
                fn.ajaxFailed = true;
                fn.throwException('ajax request error: ' + xhr.status + ' ' + errorThrown);
            });

            return true; // request is sent
        },

        // helper function for serverValidate() function
        afterAjaxRequest : function (ajaxResponse, postInputs, inputsAndMessages, fromEvent, onlyValidCheck, allFieldsOK) {

            var fn = this;
            var allAjaxValidationsResult = true;

            // for each field in post params
            for (var postName in postInputs) {
                if (postInputs.hasOwnProperty(postName)) {

                    var $input = postInputs[postName].$input;
                    var actionData = postInputs[postName].actionData;
                    var ajaxValidationResult;
                    var errorMsg = [];

                    // input value after ajax request
                    var inputValue = $input.val();

                    // skip field if value is changed since ajax request started
                    if (inputValue != postInputs[postName].inputValue)
                        continue;

                    // default ajax validation function has some additional arguments
                    actionData.params = [ajaxResponse, postName].concat(actionData.params)

                    // call ajax validator
                    ajaxValidationResult = fn.callValidator(actionData);

                    // if invalid
                    if (ajaxValidationResult != fn.options.ajaxValid) {

                        allAjaxValidationsResult = false;
                        allFieldsOK = false;

                        if (onlyValidCheck)
                            break;

                        // get error message
                        if (fn.options.ajaxResponseMsg)
                            errorMsg = [ajaxValidationResult]; // ajax response is error message
                        else
                            errorMsg = [fn.getErrMsg($input, 'ajax', actionData.params).msg];

                        // save last message to cache
                        if (fn.options.ajaxCache) {
                            var ajaxCache = $input.data('ajaxCache' + fn.dataNamespace);
                            ajaxCache.lastMessage = errorMsg;
                        }
                    }

                    if (!onlyValidCheck)
                        fn.addToInputsAndMessages(inputsAndMessages, $input, errorMsg);
                }
            }

            // trigger afterAjax event
            this.$mainElement.trigger($.Event('afterAjax' + fn.eventNamespace, {
                    bValidator : {
                        instance : fn.instance,
                        validationResult : allFieldsOK
                    }
                }));

            // show messages
            if (!onlyValidCheck)
                fn.afterAllValidations(inputsAndMessages, fromEvent, allAjaxValidationsResult, null);

            // @todo maybe validate again
            // validate(false, $input, undefined, ajaxResponse)
        },

        // fills inputsAndMessages helper object
        addToInputsAndMessages : function (inputsAndMessages, $input, messages) {

            if (typeof messages == 'string')
                messages = [messages];

            for (var i in inputsAndMessages) {
                if (inputsAndMessages[i].$input == $input) {
                    inputsAndMessages[i].errorMessages = inputsAndMessages[i].errorMessages.concat(messages);
                    return;
                }
            }

            inputsAndMessages[Object.keys(inputsAndMessages).length] = {
                $input : $input,
                errorMessages : messages
            };
        },

        // returns options for jQuery.ajax
        getAjaxOptions : function (postInputs) {

            var fn = this;

            var ajaxOptions = $.extend({}, fn.options.ajaxOptions);

            // options.data for jQuery.ajax
            if (typeof ajaxOptions.data != 'object')
                ajaxOptions.data = {}

            // options.data from options.ajaxParams
            if (fn.options.ajaxParams)
                $.extend(true, ajaxOptions.data, typeof fn.options.ajaxParams === 'function' ? fn.options.ajaxParams.call(postInputs) : fn.options.ajaxParams);

            // ajax url
            ajaxOptions.url = fn.options.ajaxUrl;

            return ajaxOptions;
        },

        // returns name for post parameter
        getPostName : function ($input) {

            var postName = $input.attr('name'); // check if field has name attribute

            if (!postName) {
                postName = $input.attr('id'); // check if field has id attribute
                if (postName)
                    postName = '#' + postName;
            }

            if (postName)
                return postName;

            this.throwException('field with ajax action must have "name" or "id" attribute set');
        },

        // returns all inputs for validation
        getElementsForValidation : function ($container) {

            var selector = '[' + this.dataAttrPrefix + this.options.validateActionsAttr + '],[' + this.dataAttrPrefix + this.options.modifyActionsAttr + ']';

            // HTML5 fileds
            if (this.options.enableHtml5Attr)
                selector += ',' + this.options.html5selector;

            return $container.is(':input') ? $container : $container.find(selector).not(this.options.skipValidation);
        },

        // binds validateOn events
        bindValidateOn : function ($inputs) {
            if (this.options.validateOn) {
                this.bindValidationOnEvents($inputs, this.options.validateOn.split(','));
            }
        },

        // binds errorValidateOn events
        bindErrorValidateOn : function ($inputs) {
            if (this.options.errorValidateOn) {
                this.bindValidationOnEvents($inputs, this.options.errorValidateOn.split(','));
            }
        },

        // binds validation on events
        bindValidationOnEvents : function ($inputs, eventNames) {

            var fn = this;

            $inputs.each(function () {

                var $input = $(this);
                var $bindEventOnInput;

                if ($input[0].type == 'checkbox') {
                    $bindEventOnInput = fn.chkboxGroup($input);
                    eventNames = ['change'];
                } else if ($input[0].type == 'radio') {
                    $bindEventOnInput = $('input:radio[name="' + $input.attr('name') + '"]');
                    eventNames = ['change'];
                } else {
                    $bindEventOnInput = $input;
                    if ($input[0].type.substring(0, 6) == 'select' || $input[0].type == 'file')
                        eventNames = ['change'];
                }
                // remove all events
                $bindEventOnInput.off(fn.eventNamespace);

                // bind validation on each event
                $.map(eventNames, function (eventName) {
                    $bindEventOnInput.on(eventName + fn.eventNamespace, function (fromEvent) {
                        fn.validateWithTimeOut($input, fromEvent);
                    });
                });
            });
        },

        // calls validate() function with timeout if set in options
        validateWithTimeOut : function ($input, fromEvent) {

            var fn = this;

            if (fn.options.delayValidation) {

                if (fn.instance.validateTimeOut)
                    clearTimeout(fn.instance.validateTimeOut);

                fn.instance.validateTimeOut = setTimeout(function () {
                        fn.validate($input, null, fromEvent);
                    }, fn.options.delayValidation);
            } else
                fn.validate($input, null, fromEvent);
        },

        // checks if message from validator instance exists on the element
        isMsgFromInstanceExists : function ($input, instanceNames) {
            for (var i = 0; i < instanceNames.length; i++) {

                // presenter instance
                var presenter = $input.data('presenter' + this.getDataNamespace(instanceNames[i]));

                if (presenter.isInvalidOn())
                    return true;
            }

            return false;
        },

        // returns checkboxes in a group
        chkboxGroup : function ($chkbox) {
            var name = $chkbox.attr('name');
            if (name && /^[^\[\]]+\[.*\]$/.test(name)) {
                return $('input:checkbox').filter(function () {
                    var r = new RegExp(name.match(/^[^\[\]]+/)[0] + '\\[.*\\]$');
                    return this.name.match(r);
                });
            }

            return $chkbox;
        },

        // gets element value
        getValue : function ($input) {

            // checkbox
            if ($input[0].type == 'checkbox') {
                if ($input.attr('name'))
                    return this.chkboxGroup($input).filter(':checked').length;
                return $input.prop('checked');
                // radio
            } else if ($input[0].type == 'radio') {
                var name = $input.attr('name');
                if (name)
                    return $('input:radio[name="' + name + '"]:checked').length
                    // multi select
            } else if ($input[0].type == 'select-multiple') {
                return $('option:selected', $input).length; // number of selected items
            }

            return $input.val();
        },

        // parses bValidator attributes for validation actions
        getActions : function ($input, attributeName, html5) {

            // get value from from data-bvalidator attribute
            var attributeValue = $.trim($input.attr(attributeName));
            var actions = [];

            if (attributeValue){
                // delete whitespaces before and after ,
                attributeValue = attributeValue.replace(new RegExp('\\s*\\' + this.options.actionsDelimiter + '\\s*', 'g'), this.options.actionsDelimiter);

                // split with :
                actions = attributeValue.split(this.options.actionsDelimiter);

                // get object with function name and arguments
                for (var i = 0; i < actions.length; i++) {
                    actions[i] = this.parseAction(actions[i]);
                }
            }

            // HTML5 attributes
            if (html5 && this.options.enableHtml5Attr){
                actions = actions.concat(this.getHtml5Actions($input));
            }

            return actions
        },

        // maps HTML5 attributes to validation functions
        getHtml5Actions : function ($input) {

            var ret = [];

            // type = email, url, number
            if ($input[0].type == 'email' || $input[0].type == 'url' || $input[0].type == 'number')
                ret[ret.length] = { name: $input[0].type };

            // min
            var min = $input.attr('min');
            if (min)
                ret[ret.length] = { name: 'min', params: [min] };

            // max
            var max = $input.attr('max');
            if (max)
                    ret[ret.length] = { name: 'max', params: [max] };

            // minlength
            var minlength = $input.attr('minlength');
            if (minlength)
                ret[ret.length] = { name: 'minlen', params: [minlength] };

            // maxlength
            var maxlength = $input.attr('maxlength');
            if (maxlength)
                ret[ret.length] = { name: 'maxlen', params: [maxlength] };

            // pattern
            var pattern = $input.attr('pattern');
            if (pattern)
                ret[ret.length] = { name: 'pattern', params: ['^' + pattern + '$'] };

            // required
            if ($input.attr('required'))
                ret[ret.length] = { name: 'required' };

            return ret;
        },

        // returns object with function name and parameters
        parseAction : function (actionStr) {

            var ap = $.trim(actionStr).match(/^(.*?)\[(.*?)\]/);
            var ret;

            if (ap && ap.length == 3) {
                ret = {
                    name : ap[1],
                    params : ap[2].split(this.options.paramsDelimiter)
                }
            } else {
                ret = {
                    name : actionStr,
                    params : []
                }
            }

            if (!ret.name)
                this.throwException('error parsing action: ' + actionStr);

            return ret;
        },

        // calls modifier
        callModifier : function ($input, modifierAction) {

            var oldVal;
            var newVal;
            var applyParams = [$input.val()].concat(modifierAction.params);

            // this.modifiers.actionName()
            if (typeof this.modifiers[modifierAction.name] == 'function') {
                this.modifiers.$input = $input; // put $input to modifier function context
                newVal = this.modifiers[modifierAction.name].apply(this.modifiers, applyParams);
            }
            // window.actionName()
            else if (typeof window[modifierAction.name] == 'function')
                newVal = window[modifierAction.name].apply($input[0], applyParams);
            else
                this.throwException('undefined modifier function: ' + modifierAction.name);

            if (typeof newVal != 'undefined' && newVal != null) {
                oldVal = $input.val();
                if (oldVal != newVal)
                    $input.val(newVal);
            }
        },

        // call modifiers
        callModifiers : function ($input) {

            // all modifier actions
            var modifiersToDo = this.getActions($input, this.dataAttrPrefix + this.options.modifyActionsAttr, false);

            for (var i = 0; i < modifiersToDo.length; i++) {
                this.callModifier($input, modifiersToDo[i]);
            }
        },

        // call auto modifiers
        callAutoModifiers : function ($input, validationActionName) {
            if (this.options.autoModifiers && this.options.autoModifiers[validationActionName]) {
                for (var h = 0; h < this.options.autoModifiers[validationActionName].length; h++) {
                    this.callModifier($input, this.parseAction(this.options.autoModifiers[validationActionName][h]));
                }
            }
        },

        // calls validator
        callValidator : function (actionData) {

            var ret;

            // first try to call function from validator object
            if (typeof this.validators[actionData.name] === 'function') {
                this.validators.$input = actionData.$input; // put $input to validation function context
                ret = this.validators[actionData.name].apply(this.validators, [actionData.inputValue].concat(actionData.params)); // add input value to beginning of actionData.params
            }
            // then try to call user defined function in global scope
            else if (typeof window[actionData.name] === 'function') {
                ret = window[actionData.name].apply(actionData.$input[0], [actionData.inputValue].concat(actionData.params));
            } else
                this.throwException('undefined validation function: ' + actionData.name);

            return ret;
        },

        // returns presenter instance
        getPresenter : function ($input) {

            var themeName = this.getThemeName($input);
            var presenter = $input.data('presenter' + this.dataNamespace);

            // does presenter need to be replaced
            if (presenter && presenter.forTheme != themeName) {

                // destroy presenter
                if (typeof presenter.destroy === 'function') {
                    presenter.destroy();
                } else
                    presenter.removeAll(); // hide messages

                presenter = null;
            }

            if (!presenter) {
                if (themeName && this.options.themes[themeName].presenter) {
                    if (typeof this.options.themes[themeName].presenter == 'string')
                        presenter = new bValidator[this.options.themes[themeName].presenter]($input, this.instance);
                    else
                        presenter = new this.options.themes[themeName].presenter($input, this.instance);
                } else
                    presenter = new bValidator.DefaultPresenter($input, this.instance); // default presenter

                presenter.forTheme = themeName;

                $input.data('presenter' + this.dataNamespace, presenter);
            }

            // send theme options to presenter
            presenter.setOptions(this.getThemeOptions($input));

            return presenter;
        },

        // validation function
        validate : function ($inputsToValidate, onlyValidCheck, fromEvent, scrollToMsg) {

            var allFieldsOK = true;
            var inputsAndMessages = {};
            var ajaxActions = [];
            var fn = this;

            // get all inputs to validate
            if (!$inputsToValidate)
                $inputsToValidate = fn.getElementsForValidation(fn.$mainElement);

            // check data-bvalidator-return attribute on the form
            var forceValidationResultForm = fn.$mainElement.attr(fn.dataAttrPrefix + fn.options.validationResultAttr);

            // validate each input
            $inputsToValidate.each(function () {

                var $input = $(this);
                var validationsToCall = []
                var errorMessages = [];
                var fieldRequired = false;
                var ajaxActionData = false;
                var allFieldActionsOK = true;
                var lastMsg = false;
                var forceValidationResultInput;

                var stopValidations = function () {
                    return false; // exit .foreach
                }

                var fieldIsValid = function () {
                    fn.addToInputsAndMessages(inputsAndMessages, $input, []);
                    return true; // continue .foreach
                }

                var fieldForceInvalid = function () {
                    allFieldsOK = false;
                    fn.addToInputsAndMessages(inputsAndMessages, $input, [fn.getErrMsg($input).msg]);
                    return true; // continue .foreach
                }

                // check data-bvalidator-return attribute on the field
                if (forceValidationResultForm === undefined)
                    forceValidationResultInput = $input.attr(fn.dataAttrPrefix + fn.options.validationResultAttr);
                else
                    forceValidationResultInput = forceValidationResultForm;

                // if data-bvalidator-return attribute value is set
                if (forceValidationResultInput === 'true')
                    return fieldIsValid();
                if (forceValidationResultInput === 'false')
                    return fieldForceInvalid();

                // do not validate field if there is error message from another instance
                if (fn.options.noMsgIfExistsForInstance.length && fn.isMsgFromInstanceExists($input, fn.options.noMsgIfExistsForInstance))
                    return stopValidations();

                // call modifiers
                fn.callModifiers($input);

                // array of validations to do from data-bvalidator attribute
                var validationsToDo = fn.getActions($input, fn.dataAttrPrefix + fn.options.validateActionsAttr, true);
                // console.log(fn.$mainElement.attr('id'));
                // console.log(validationsToDo);
                // if empty data-bvalidator attribute
                if (validationsToDo.length === 0)
                    return fieldIsValid();

                var valempty = false;

                // fill validationsToCall and ajaxActions arrays
                for (var i = 0; i < validationsToDo.length; i++) {

                    // object containing action name and parameters from data-bvalidator attribute
                    var actionData = validationsToDo[i];
                    actionData.$input = $input;

                    // call auto modifiers
                    fn.callAutoModifiers($input, actionData.name);

                    if (actionData.name == 'valempty')
                        valempty = true;
                    else {
                        if (actionData.name == 'ajax')
                            ajaxActionData = actionData;
                        else {
                            if (actionData.name == 'required')
                                fieldRequired = true;

                            validationsToCall[validationsToCall.length] = actionData;
                        }
                    }
                }

                // object containing value of the input for validation
                var inputValue = fn.getValue($input);

                // if value is not required and is empty
                if (!valempty && (!fieldRequired && !fn.validators.required(inputValue)))
                    return fieldIsValid();

                // fire beforeValidationAction event
                if (!onlyValidCheck)
                    $input.trigger($.Event('beforeFieldValidation' + fn.eventNamespace, {
                            bValidator : {
                                instance : fn.instance
                            }
                        }));

                // for each validation action
                for (i = 0; i < validationsToCall.length; i++) {

                    // skip the rest of validation actions if already invalid
                    if ((fn.options.validateTillInvalid || onlyValidCheck) && allFieldActionsOK === false)
                        break;

                    validationsToCall[i].inputValue = inputValue;

                    // call validator function
                    var actionResult = fn.callValidator(validationsToCall[i]);

                    // if invalid
                    if (actionResult !== true) {

                        allFieldsOK = allFieldActionsOK = false;

                        if (!lastMsg && !onlyValidCheck) {

                            var errMsg = {};

                            if (typeof actionResult === 'string') {
                                errMsg.msg = actionResult; // message from validation function
                            } else {
                                errMsg = fn.getErrMsg($input, validationsToCall[i].name, validationsToCall[i].params);
                                lastMsg = errMsg.lastMsg;
                            }

                            // skip required message if field already has a message
                            if (!(errorMessages.length && validationsToCall[i].name == 'required'))
                                errorMessages[errorMessages.length] = errMsg.msg;
                        }
                    }
                }

                // add ajax validation
                if (ajaxActionData !== false && allFieldActionsOK)
                    ajaxActions[ajaxActions.length] = ajaxActionData;

                // todo kod ajaxa je drugacije za afterFieldValidation event
                if (!onlyValidCheck) {

                    // fire afterFieldValidation event
                    $input.trigger($.Event('afterFieldValidation' + fn.eventNamespace, {
                            bValidator : {
                                instance : fn.instance,
                                validationResult : allFieldActionsOK,
                                errorMessages : errorMessages
                            }
                        }));

                    // fill array with fields and messages to show
                    fn.addToInputsAndMessages(inputsAndMessages, $input, errorMessages);
                }

                if ((fn.options.singleError || onlyValidCheck) && allFieldActionsOK === false)
                    return stopValidations();

            }); // .each this=field

            if (onlyValidCheck && !allFieldsOK)
                return false;

            // add ajax validation
            if (ajaxActions.length) { // skip ajax validation if any field is invalid

                var serverValidate = fn.serverValidate(ajaxActions, inputsAndMessages, fromEvent, onlyValidCheck, allFieldsOK);

                if (serverValidate === true)
                    return 'withAjax'; // validating with ajax

                if (serverValidate === 0) { // error messages from ajax cache
                    allFieldsOK = false;
                }
            }

            // show messages and bind events
            if (!onlyValidCheck) {
                fn.afterAllValidations(inputsAndMessages, fromEvent, null, scrollToMsg);
            }

            // return validation result true/false
            return allFieldsOK;
        },

        // shows messages and binds events
        getErrMsg : function ($input, actionName, actionParams) {

            var fn = this;

            var ret = {};
            ret.lastMsg = false; // last message to show
            ret.msg = null;

            // helper function which sets ret.msg and ret.lastMsg
            var setRetMsg = function () {

                // from data-bvalidator-msg attribute
                ret.msg = $input.attr(fn.dataAttrPrefix + fn.options.errorMessageAttr);

                if (ret.msg) {
                    ret.lastMsg = true;
                    return;
                }

                if (actionName) {

                    // from data-bvalidator-msg-actionName attribute
                    ret.msg = $input.attr(fn.dataAttrPrefix + fn.options.errorMessageAttr + '-' + actionName);
                    if (ret.msg)
                        return;

                    // from options.messages.lang.actionName
                    if (fn.options.messages[fn.options.lang] && fn.options.messages[fn.options.lang][actionName]) {
                        ret.msg = fn.options.messages[fn.options.lang][actionName];
                        return;
                    }

                    // from options.messages.en.actionName
                    if (fn.options.messages.en[actionName]) {
                        ret.msg = fn.options.messages.en[actionName];
                        return;
                    }
                }

                // from options.messages.lang.default
                if (fn.options.messages[fn.options.lang] && fn.options.messages[fn.options.lang]['default']) {
                    ret.msg = fn.options.messages[fn.options.lang]['default'];
                    return;
                }

                // from options.messages.en.default
                ret.msg = fn.options.messages.en['default'];
            }

            setRetMsg();

            // error for no message
            if (!ret.msg)
                fn.throwException('no message for validation action ' + actionName);

            // replace values in braces
            if (actionParams && actionParams.length && ret.msg.indexOf('{')) {
                for (var j = 0; j < actionParams.length; j++)
                    ret.msg = ret.msg.replace(new RegExp('\\{' + j + '\\}', 'g'), actionParams[j]);
            }

            return ret;
        },

        // shows messages and binds events
        afterAllValidations : function (inputsAndMessages, fromEvent, allAjaxValidationsResult, scrollToMsg) {

            var fn = this;

            $.map(inputsAndMessages, function (data) {
                fn.afterFieldValidation(data.$input, data.errorMessages, fromEvent);
            });

            // scroll to message
            if (scrollToMsg && this.options.scrollToError)
                this.scrollToError();

            // @todo: if validation is not ok, trigger some event

            // submit the form and skip validation on submit
            if (allAjaxValidationsResult && fromEvent && fromEvent.type == 'submit') {

                this.bValidatorSkip = true;

                // trigger submit event
                $(fromEvent.target).submit();
            }
        },

        // shows messages and binds events for the field
        afterFieldValidation : function ($input, errorMessages, fromEvent) {

            var fn = this;
            var presenter = fn.getPresenter($input);
            var fieldIsValid = true;
            var submitEvent = false;

            // if there is messages for the field, field is invalid
            if (errorMessages !== null && errorMessages.length)
                fieldIsValid = false;

            var errorMessagesStr = errorMessages.toString();

            if (fromEvent && fromEvent.type == 'submit')
                submitEvent = true;

            // if same messages are already shown do nothing
            if (presenter.isInvalidOn() && !submitEvent && $input.data('lastMessages' + fn.dataNamespace) === errorMessagesStr)
                return;

            // field is valid
            if (fieldIsValid) {

                // show valid message
                if (typeof presenter.showValid === 'function')
                    presenter.showValid();

                // bind validation on events
                // if(typeof $input.data("lastMessages" + fn.dataNamespace) != 'undefined') // if field is validated first time and is valid
                fn.bindValidateOn($input);
            }
            // field is invalid
            else {

                // show invalid message
                presenter.showInvalid(errorMessages);

                // bind validation on events
                fn.bindErrorValidateOn($input);
            }

            // save last shown messages for the input
            $input.data('lastMessages' + fn.dataNamespace, errorMessagesStr);
        },

        // resets validation
        reset : function ($inputs) {

            var fn = this;

            if (!$inputs || !$inputs.length)
                $inputs = fn.getElementsForValidation(fn.$mainElement);

            // unbind events
            $inputs.off(fn.eventNamespace);

            // bind validateOn event
            if (fn.options.validateOn)
                fn.bindValidateOn($inputs);

            $inputs.removeData('ajaxCache' + fn.dataNamespace);

            // hide messages
            $inputs.each(function () {

                var $input = $(this);
                var presenter = fn.getPresenter($input);

                presenter.removeAll();
            });
        },

        // destroys validator
        destroy : function () {
            this.reset();
            this.$mainElement.removeData('bValidator').removeData('bValidators');
        },

        // sets scrollTo value
        setScrollTo : function (toppx) {
            if (this.options.scrollToError) {
                if (!this.scrollTo || toppx < this.scrollTo)
                    this.scrollTo = toppx;
            }
        },

        // writes message to console
        throwException : function (msg) {

            if (this.instanceName == 'bvalidator')
                throw '[bValidator] ' + msg;
            else
                throw '[bValidator.' + this.instanceName + '] ' + msg;
        },

        scrollToError : function () {
            return this.scroll(this.scrollTo);
        },

        // scrolls window
        scroll : function (toppx) {

            if (typeof toppx == 'undefined')
                return toppx;

            toppx = parseInt(toppx) + parseInt(this.options.scrollToErrorOffset);

            if (($(window).scrollTop() > toppx || $(window).scrollTop() + $(window).height() < toppx))
                $('html, body').animate({
                    scrollTop : toppx
                }, {
                    duration : 'slow'
                });

            return toppx;
        },

        // gets options from data attributes
        getAttrOptions : function ($input, dataAttrNamespace) {

            if (!dataAttrNamespace)
                return {};

            var data = $input.data();
            var ret = {};
            var len = dataAttrNamespace.length;

            for (var i in data) {
                if (i.substr(0, len) == dataAttrNamespace && i.length > len) {
                    var optionName = i.substring(len);
                    optionName = optionName.charAt(0).toLowerCase() + optionName.substr(1);
                    ret[optionName] = data[i];
                }
            }

            return ret
        },

        // returns theme options
        getThemeOptions : function ($input) {

            var themeName = this.getThemeName($input);

            // if theme (presenter) support options from html attributes (data-bvalidator-theme-)
            if (this.options.themes[themeName].dataOptionNamespace)
                return $.extend({}, this.options.themes[themeName], this.getAttrOptions(this.$mainElement, this.options.themes[themeName].dataOptionNamespace), this.getAttrOptions($input, this.options.themes[themeName].dataOptionNamespace));

            return $.extend({}, this.options.themes[themeName]);
        },

        // returns theme name
        getThemeName : function ($input) {

            var themeName;

            // get theme name from data-bvalidator-theme attribute
            themeName = $input.attr(this.dataAttrPrefix + this.options.setThemeAttr);

            if (!themeName) {
                // get theme name from data-bvalidator-theme attribute on the form
                themeName = this.$mainElement.attr(this.dataAttrPrefix + this.options.setThemeAttr);

                if (!themeName) {
                    // get theme name form options
                    themeName = this.options.useTheme;

                    if (!themeName)
                        this.throwException('useTheme option not set');
                }
            }

            if (!this.options.themes[themeName])
                this.throwException('no options for theme: ' + themeName);

            return themeName;
        },

        // makes plugin instance
        makeInstance : function ($mainElement) {

            if (typeof $mainElement.data('bValidators') != 'undefined')
                return;

            var instanceNames = $mainElement.attr('data-bvalidator-validate');

            if (instanceNames) {
                instanceNames = instanceNames.split(',');
                for (var i = 0; i < instanceNames.length; i++) {
                    $mainElement.bValidator({}, instanceNames[i]);
                }
            } else
                $mainElement.bValidator();
        }
    };

    // API functions
    Constructor.api = {

        // validation function
        validate : function ($inputsToValidate) {
            return this.fn.validate($inputsToValidate, null, null, 'scroll');
        },

        // returns options object
        getOptions : function () {
            return this.fn.options;
        },

        // returns validator object
        getValidators : function () {
            return this.fn.validators;
        },

        // returns modifier object
        getModifiers : function () {
            return this.fn.modifiers;
        },

        // checks validity
        isValid : function ($inputs) {
            return this.fn.validate($inputs, 'only_valid_check');
        },

        // deletes message
        removeMsg : function ($inputs) {

            if (typeof $inputs == 'undefined')
                this.fn.throwException('removeMsg function expects argument with jQuery object containing inputs');

            var fn = this.fn;
            $inputs.each(function () {
                fn.getPresenter($(this)).removeAll();
            });
        },

        // shows message
        showMsg : function ($inputs, message) {

            var fn = this.fn;

            if (typeof $inputs == 'undefined')
                fn.throwException('showMsg function expects first argument with jQuery object containing inputs');

            if ($inputs.length) {

                $inputs.each(function () {

                    if (!message)
                        message = $(this).attr(fn.dataAttrPrefix + fn.options.errorMessageAttr); // message from data-bvalidator-msg attribute

                    if (typeof message == 'undefined')
                        fn.throwException('showMsg function expects message to show in second argument or data attribute');

                    if (typeof message == 'string')
                        message = [message];

                    var presenter = fn.getPresenter($(this));

                    presenter.removeAll();
                    presenter.showInvalid(message);
                });
            }
        },

        // returns elements for validation
        getInputs : function () {
            return this.fn.getElementsForValidation(this.fn.$mainElement);
        },

        // returns form element
        getForm : function () {
            return this.fn.$mainElement;
        },

        // binds validateOn event
        bindValidateOn : function ($inputs) {

            if (typeof $inputs == 'undefined')
                this.fn.throwException('bindValidateOn function expects argument with jQuery object containing inputs');

            this.fn.bindValidateOn($inputs);
        },

        // resets validation
        reset : function ($inputs) {
            this.fn.reset($inputs);
        },

        // destroys validator
        destroy : function () {
            this.fn.destroy();
        },

        // sets scrollTo value
        setScrollTo : function (toppx) {

            if (typeof toppx == 'undefined')
                this.fn.throwException('setScrollTo function expects argument with integer value');

            this.fn.setScrollTo(toppx);
        }
    };

    // set api as prototype to constructor
    Constructor.prototype = Constructor.api;

    // return constructor function
    return Constructor;

})(jQuery);

bValidator.defaultOptions = (function () {

    'use strict';

    // default options
    var defaultOptions = {

        singleError           : false,
        scrollToError         : true,
        scrollToErrorOffset   : -10,     // px
        lang                  : 'en',
        validateOn            : '',      // 'change', 'blur', 'keyup' ...
        errorValidateOn       : 'keyup', // 'change', 'blur', 'keyup' ...
        delayValidation       : 300,     // ms
        validateOnSubmit      : true,
        stopSubmitPropagation : true,
        validateTillInvalid   : false,
        skipValidation        : ':hidden, :disabled',
        html5ValidationOff    : true,
        enableHtml5Attr       : true,
        useTheme              : '',
        noMsgIfExistsForInstance : [],

        errorMessageAttr     : '-msg',      // attribute which holds error message text (data-bvalidator-msg)
        validateActionsAttr  : '',          // attribute for validation actions for the field (data-bvalidator)
        validationResultAttr : '-return',   // attribute for making field always valid (data-bvalidator-return)
        modifyActionsAttr    : '-modifier', // attribute for modifiers for the field (data-bvalidator-modifier)
        setThemeAttr         : '-theme',    // Attribute for setting the theme name. Can be set on <form> or <input> (data-bvalidator-theme)
        dataOptionNamespace  : 'Option',    // $.data namespace (data-bvalidator-option-)
        html5selector        : 'input[type=email],input[type=url],input[type=number],[required],input[min],input[max],input[maxlength],input[minlength],input[pattern]', // selector for HTML5 inputs, used only if enableHtml5Attr=true
        paramsDelimiter      : ':',
        actionsDelimiter     : ',',

        autoModifiers : {
            digit  : ['trim'],
            number : ['trim'],
            email  : ['trim'],
            url    : ['trim'],
            date   : ['trim'],
            ip4    : ['trim'],
            ip6    : ['trim']
        },

        ajaxValid       : 'ok',
        ajaxResponseMsg : false,
        ajaxOptions : {
            cache  : false,
            method : 'POST'
        },
        ajaxParams : null,
        ajaxUrl    : '',
        ajaxCache  : true,

        themes : {}, // theme options

        // default messages
        messages : {
            en : {
                'default' : 'Please correct this value.',
                minlen    : 'The length must be at least {0} characters.',
                maxlen    : 'The length must be at max {0} characters.',
                rangelen  : 'The length must be between {0} and {1}.',
                min       : 'Please enter a number greater than or equal to {0}.',
                max       : 'Please enter a number less than or equal to {0}.',
                between   : 'Please enter a number between {0} and {1}.',
                required  : 'This field is required.',
                alpha     : 'Please enter alphabetic characters only.',
                alphanum  : 'Please enter alphanumeric characters only.',
                digit     : 'Please enter only digits.',
                number    : 'Please enter a valid number.',
                email     : 'Please enter a valid email address.',
                url       : 'Please enter a valid URL.',
                ip4       : 'Please enter a valid IPv4 address.',
                ip6       : 'Please enter a valid IPv6 address.',
                date      : 'Please enter a valid date in format {0}',
                equal     : 'Please enter the same value again.',
                differ    : 'Please enter a different value.'
            }
        }
    }

    return defaultOptions;

})();

bValidator.modifiers = (function ($) {

    'use strict';

    // object with modifiers
    var modifiers = {

        trim : function (value) {
            return $.trim(value);
        }
    }

    return modifiers;

})(jQuery);

bValidator.validators = (function ($) {

    'use strict';

    // object with validator actions
    var validators = {

        minlen : function (value, minlength) {
            return (value.length >= parseInt(minlength))
        },

        maxlen : function (value, maxlength) {
            return (value.length <= parseInt(maxlength))
        },

        rangelen : function (value, minlength, maxlength) {
            return (value.length >= parseInt(minlength) && value.length <= parseInt(maxlength))
        },

        equal : function (value, elementId) {
            return value == $('#' + elementId).val();
        },

        differ : function (value, elementId) {
            return value != $('#' + elementId).val();
        },

        min : function (value, min) {
            if (!this.number(value))
                return false;
            return (parseFloat(value) >= parseFloat(min))
        },

        max : function (value, max) {
            if (!this.number(value))
                return false;
            return (parseFloat(value) <= parseFloat(max))
        },

        between : function (value, min, max) {
            if (!this.number(value))
                return false;
            var va = parseFloat(value);
            return (va >= parseFloat(min) && va <= parseFloat(max))
        },

        required : function (value) {
            if (!value || !$.trim(value))
                return false;

            return true;
        },

        pattern : function (value, regex, mod) {
            if (typeof regex === 'string')
                regex = new RegExp(regex, mod);
            return regex.test(value);
        },

        alpha : function (value) {
            return this.pattern(value, /^[a-z ._\-]+$/i);
        },

        alphanum : function (value) {
            return this.pattern(value, /^[a-z\d ._\-]+$/i);
        },

        digit : function (value) {
            return this.pattern(value, /^\d+$/);
        },

        number : function (value) {
            return this.pattern(value, /^[-+]?\d+(\.\d+)?$/);
        },

        email : function (value) {
            return this.pattern(value, /^([a-zA-Z\d_\.\-\+%])+\@(([a-zA-Z\d\-])+\.)+([a-zA-Z\d])+$/);
        },

        url : function (value) {
            return this.pattern(value, /^\b(https?|ftp):\/\/([-A-Z0-9.]+)(\/[-A-Z0-9+&@#\/%=~_|!:,.;]*)?(\?[A-Z0-9+&@#\/%=~_|!:,.;]*)?$/i);
        },

        ip4 : function (value) {
            return this.pattern(value, /^(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?)$/);
        },

        ip6 : function (value) {
            return this.pattern(value, /^(?:(?:(?:[A-F\d]{1,4}:){5}[A-F\d]{1,4}|(?:[A-F\d]{1,4}:){4}:[A-F\d]{1,4}|(?:[A-F\d]{1,4}:){3}(?::[A-F\d]{1,4}){1,2}|(?:[A-F\d]{1,4}:){2}(?::[A-F\d]{1,4}){1,3}|[A-F\d]{1,4}:(?::[A-F\d]{1,4}){1,4}|(?:[A-F\d]{1,4}:){1,5}|:(?::[A-F\d]{1,4}){1,5}|:):(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)\.){3}(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)|(?:[A-F\d]{1,4}:){7}[A-F\d]{1,4}|(?:[A-F\d]{1,4}:){6}:[A-F\d]{1,4}|(?:[A-F\d]{1,4}:){5}(?::[A-F\d]{1,4}){1,2}|(?:[A-F\d]{1,4}:){4}(?::[A-F\d]{1,4}){1,3}|(?:[A-F\d]{1,4}:){3}(?::[A-F\d]{1,4}){1,4}|(?:[A-F\d]{1,4}:){2}(?::[A-F\d]{1,4}){1,5}|[A-F\d]{1,4}:(?::[A-F\d]{1,4}){1,6}|(?:[A-F\d]{1,4}:){1,7}:|:(?::[A-F\d]{1,4}){1,7})$/i);
        },

        date : function (value, format) { // format can be any combination of mm,dd,yyyy with separator between. Example: 'mm.dd.yyyy' or 'yyyy-mm-dd'
            if (value.length == 10 && format.length == 10) {
                var s = format.match(/[^mdy]+/g);
                if (s.length == 2 && s[0].length == 1 && s[0] == s[1]) {

                    var d = value.split(s[0]);
                    var f = format.split(s[0]);
                    var day;
                    var month;
                    var year;

                    for (var i = 0; i < 3; i++) {
                        if (f[i] == 'dd')
                            day = d[i];
                        else if (f[i] == 'mm')
                            month = d[i];
                        else if (f[i] == 'yyyy')
                            year = d[i];
                    }

                    var dobj = new Date(year, month - 1, day);

                    if ((dobj.getMonth() + 1 != month) || (dobj.getDate() != day) || (dobj.getFullYear() != year))
                        return false;

                    return true;
                }
            }
            return false;
        },

        extension : function (value) {

            var r = '';

            if (!arguments[1])
                return false;

            for (var i = 1; i < arguments.length; i++) {
                r += arguments[i];
                if (i != arguments.length - 1)
                    r += '|';
            }

            return this.pattern(value, '\\.(' + r + ')$', 'i');
        },

        ajax : function (value, ajaxResponse, postName) {

            var validationResult;

            // check if response from server is JSON
            try {
                var results = $.parseJSON(ajaxResponse);
                if (results[postName])
                    validationResult = results[postName];
            }
            // ajaxResponse is not json
            catch (err) {
                validationResult = ajaxResponse;
            }

            return validationResult
        }
    }

    return validators;

})(jQuery);

(function (bValidator, $) {

    'use strict';

    // bValidator jQuery plugin constructor
    $.fn.bValidator = function (param1, param2, param3) {

        var retUnchaninable;

        // chainable api
        var retChaninable = this.each(function () {

            var $input = $(this);

            // call function on existing instance
            if (typeof param1 == 'string') { // param1=apiFunction, param2,param3=apiFunctionArgument

                var validator = $input.data('bValidator');

                if (!validator)
                    validator = new bValidator($input); // make a new instance

                // call api function with arguments
                retUnchaninable = validator[param1](param2, param3);

                if (retUnchaninable !== undefined) // not chainable api funcion if returns something
                    return false; // break .each()
            } else
                // make a new instance
                new bValidator($input, param1, param2); // param1=options, param2=instanceName
        });

        if (retUnchaninable !== undefined) // not chainable api functions returns value
            return retUnchaninable;
        else
            return retChaninable;
    }

    // bValidator data API
    $(window).on('load', function () {
        $('[data-bvalidator-validate]').each(function () {
            bValidator.fn.makeInstance($(this));
        })
    })

})(bValidator, jQuery);
