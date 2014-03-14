/*!
 * jQuery bValidator plugin
 *
 * http://code.google.com/p/bvalidator/
 *
 * Copyright (c) 2012 Bojan Mauser
 *
 * Released under the MIT license
 * http://www.opensource.org/licenses/mit-license.php
 *
 * $Id: jquery.bvalidator.js 125 2014-03-14 00:22:10Z bmauser $
 */

(function($){

	// constructor
	$.fn.bValidator = function(overrideOptions, instanceName){
		return this.each(function(){
			new bValidator($(this), overrideOptions, instanceName);
   		});
	};

	// bValidator class
	bValidator = function(mainElement, overrideOptions, instanceName){

		// default options
		var options = {

			singleError:         false,		// validate all inputs at once
			offset:              {x:-23, y:-4},	// offset position for error message tooltip
			position:            {x:'right', y:'top'}, // error message placement x:left|center|right  y:top|center|bottom
			template:            '<div class="{errMsgClass}"><em/>{message}</div>', // template for error message
			templateCloseIcon:   '<div style="display:table"><div style="display:table-cell">{message}</div><div style="display:table-cell"><div class="{closeIconClass}">x</div></div></div>', // template for error message container when showCloseIcon option is true
			showCloseIcon:       true,	// put close icon on error message
			showErrMsgSpeed:    'normal',	// message's fade-in speed 'fast', 'normal', 'slow' or number of milliseconds
			scrollToError:       true,	// scroll to first error
			// css class names
			classNamePrefix:     'bvalidator_',	// prefix for css class names
			closeIconClass:      'close_icon',	// close error message icon class
			errMsgClass:         'errmsg',		// error message class
			errorClass:          'invalid',		// input field class name in case of validation error
			validClass:          '',		// input field class name in case of valid value

			lang: 'en', 				// default language for error messages 
			errorMessageAttr:    'data-bvalidator-msg',// name of the attribute for overridden error message
			validateActionsAttr: 'data-bvalidator', // name of the attribute which stores info what validation actions to do
			forceValidAttr:      'data-bvalidator-forcevalid', // name of the attribute which which makes validator to act like the field is valid
			modifyActionsAttr:   'data-bvalidator-modifier',
			paramsDelimiter:     ':',		// delimiter for validator action options inside []
			actionsDelimiter:    ',',		// delimiter for validator actions

			// when to validate
			validateOn:          null,		// null, 'change', 'blur', 'keyup'
			errorValidateOn:     'keyup',		// null, 'change', 'blur', 'keyup'

			// callback functions
			onBeforeValidate:    null,
			onAfterValidate:     null,
			onValidateFail:      null,
			onValidateSuccess:   null,
			onBeforeElementValidation: null,
			onAfterElementValidation:  null,
			onBeforeAllValidations:    null,
			onAfterAllValidations:     null,
			
			validateOnSubmit: true,  // should validation occur on form submit if validator is bind to a form
			stopSubmitPropagation: true, // should submit event be stopped on error if validator is bind to a form
			noMsgIfExistsForInstance: [],
			validateTillInvalid: false,
			
			autoModifiers: {
				'digit':  ['trim'],
				'number': ['trim'],
				'email':  ['trim'],
				'url':    ['trim'],
				'date':   ['trim'],
				'ip4':    ['trim'],
				'ip6':    ['trim']
				},
			
			ajaxAnswerValid: 'ok',
			ajaxDelay: 300,
			ajaxOptions: {cache: false},
			ajaxParamName: 'bValue',
			ajaxParams: null,

			// default messages
			errorMessages: {
				en: {
					'default':    'Please correct this value.',
					'equalto':    'Please enter the same value again.',
					'differs':    'Please enter a different value.',
					'minlength':  'The length must be at least {0} characters',
					'maxlength':  'The length must be at max {0} characters',
					'rangelength':'The length must be between {0} and {1}',
					'min':        'Please enter a number greater than or equal to {0}.',
					'max':        'Please enter a number less than or equal to {0}.',
					'between':    'Please enter a number between {0} and {1}.',
					'required':   'This field is required.',
					'alpha':      'Please enter alphabetic characters only.',
					'alphanum':   'Please enter alphanumeric characters only.',
					'digit':      'Please enter only digits.',
					'number':     'Please enter a valid number.',
					'email':      'Please enter a valid email address.',
					'image':      'This field should only contain image types',
					'url':        'Please enter a valid URL.',
					'ip4':        'Please enter a valid IPv4 address.',
					'ip6':        'Please enter a valid IPv6 address.',
					'date':       'Please enter a valid date in format {0}.'
				}
			}
		},

		_ajaxValidation = function(element, instanceName, ajaxUrl, sync){
			
			var ajax_data = element.data("ajaxData.bV" + instanceName);
			
			if(!ajax_data){
				ajax_data = {};
				element.data("ajaxData.bV" + instanceName, ajax_data);
			}
			else{
				clearTimeout(ajax_data.timeOut);
			}
			
			// value to validate
			ajax_data.val = element.val();
			
			// do not do ajax if value is already validated
			if(ajax_data.lastValidated === ajax_data.val)
				return validator.ajax(ajax_data.lastResponse);
			
			var ajaxOptions = $.extend({}, options.ajaxOptions);
			if(typeof ajaxOptions.data != 'object')
				ajaxOptions.data = {}
			ajaxOptions.url = ajaxUrl;
			
			if(options.ajaxParams)
				$.extend(true, ajaxOptions.data, typeof options.ajaxParams == 'function' ? options.ajaxParams.call(element[0]) : options.ajaxParams);
			
			if(sync){
				var ret = false;
				ajaxOptions.async = false;
				ajaxOptions.data[options.ajaxParamName] = ajax_data.val;
				
				$.ajax(ajaxOptions).done(function(ajaxResponse){
					ajax_data.lastValidated = ajax_data.val;
					ajax_data.lastResponse = ajaxResponse;
					ret = validator.ajax(ajaxResponse)
				});
		
				return ret;
			}
			else{
				ajax_data.timeOut = setTimeout(function() {
	
					var val = element.val();
					
					// only check if the value has not changed
					if(ajax_data.val == val){
						
						ajaxOptions.async = true;
						ajaxOptions.data[options.ajaxParamName] = val;
						
						$.ajax(ajaxOptions).done(function(ajaxResponse){
							ajax_data.lastValidated = val;
							ajax_data.lastResponse = ajaxResponse;
							instance.validate(false, element, undefined, ajaxResponse)
						});
					}
				}, options.ajaxDelay);
			}
			
			return;
		},

		// returns all inputs
		_getElementsForValidation = function(element){
			// skip hidden and input fields witch we do not want to validate
			return element.is(':input') ? element : element.find(':input[' + options.validateActionsAttr + '], :input[' + options.modifyActionsAttr + ']').not(":button, :image, :reset, :submit, :hidden, :disabled");
		},

		// binds validateOn event
		_bindValidateOn = function(elements){
			elements.bind(options.validateOn + '.bV' + instanceName, {'bVInstance': instance}, function(event){
				event.data.bVInstance.validate(false, $(this));
			});
		},
		
		// checks does message from validator instance exists on element
		_isMsgFromInstanceExists = function(element, instance_names){
			for(var i=0; i<instance_names.length; i++){
				if(element.data("errMsg.bV" + instance_names[i]))
					return true;
			}
			
			return false;
		},

		// displays message
		_showMsg = function(element, messages){

			// if message already exists remove it from DOM
			_removeMsg(element);

			msg_container = $('<div class="bVErrMsgContainer"></div>').css('position','absolute');
			element.data("errMsg.bV" + instanceName, msg_container);
			msg_container.insertAfter(element);

			var messagesHtml = '';

			for(var i=0; i<messages.length; i++)
				messagesHtml += '<div>' + messages[i] + '</div>\n';

			if(options.showCloseIcon)
				messagesHtml = options.templateCloseIcon.replace('{message}', messagesHtml).replace('{closeIconClass}', options.classNamePrefix+options.closeIconClass);

			// make tooltip from template
			var tooltip = $(options.template.replace('{errMsgClass}', options.classNamePrefix+options.errMsgClass).replace('{message}', messagesHtml));
			tooltip.appendTo(msg_container);
			
			// bind close tootlip function
			tooltip.find('.' + options.classNamePrefix+options.closeIconClass).click(function(e){
				e.preventDefault();
				$(this).closest('.'+ options.classNamePrefix+options.errMsgClass).css('visibility', 'hidden');
			});

			var pos = _getErrMsgPosition(element, tooltip); 

			tooltip.css({visibility: 'visible', position: 'absolute', top: pos.top, left: pos.left}).fadeIn(options.showErrMsgSpeed);

			if(options.scrollToError){
				// get most top tolltip
				var tot = tooltip.offset().top;
				if(scroll_to === null || tot < scroll_to)
					scroll_to = tot;
			}
		},

		// removes message from DOM
		_removeMsg = function(element){
			var existingMsg = element.data("errMsg.bV" + instanceName)
			if(existingMsg){
				existingMsg.remove();
				element.data("errMsg.bV" + instanceName, null);
			}
		},

		// calculates message position
		_getErrMsgPosition = function(input, tooltip){

		        var tooltipContainer = input.data("errMsg.bV" + instanceName),
		         top  = - ((tooltipContainer.offset().top - input.offset().top) + tooltip.outerHeight() - options.offset.y),
		         left = (input.offset().left + input.outerWidth()) - tooltipContainer.offset().left + options.offset.x,
			 x = options.position.x,
			 y = options.position.y;

			// adjust Y
			if(y == 'center' || y == 'bottom'){
				var height = tooltip.outerHeight() + input.outerHeight();
				if (y == 'center') 	{top += height / 2;}
				if (y == 'bottom') 	{top += height;}
			}

			// adjust X
			if(x == 'center' || x == 'left'){
				var width = input.outerWidth();
				if (x == 'center') 	{left -= width / 2;}
				if (x == 'left')  	{left -= width;}
			}

			return {top: top, left: left};
		},

		// calls callback function
		_callBack = function(type, param1, param2, param3){
		        if($.isFunction(options[type])){
		        	return options[type](param1, param2, param3);
			}
		},
		
		// returns checkboxes in a group
		_chkboxGroup = function(chkbox){
			var name = chkbox.attr('name');
			if(name && /^[^\[\]]+\[.*\]$/.test(name)){
				return $('input:checkbox').filter(function(){
					var r = new RegExp(name.match(/^[^\[\]]+/)[0] + '\\[.*\\]$');
					return this.name.match(r);
				});
			}
			
			return chkbox;
		},
		
		// gets element value	
		_getValue = function(element){

			var ret = {};

			// checkbox
			if(element.is('input:checkbox')){
				ret['value'] = element.attr('name') ? ret['selectedInGroup'] = _chkboxGroup(element).filter(':checked').length : element.attr('checked');
			}
			else if(element.is('input:radio')){
				ret['value'] = element.attr('name') ? ret['value'] = $('input:radio[name="' + element.attr('name') + '"]:checked').length : element.val();
			}
			else if(element.is('select')){
				ret['selectedInGroup'] =  $("option:selected", element).length;
				ret['value'] = element.val();
			}
			else if(element.is(':input')){
				ret['value'] = element.val();
			}
			
			return ret;
		},
		
		// parses bValidator attributes
		_parseAttr = function(attrVal){
		
			// value of validateActionsAttr input attribute
			var action_str = $.trim(attrVal).replace(new RegExp('\\s*\\' + options.actionsDelimiter + '\\s*', 'g'), options.actionsDelimiter);  
			
			if(!action_str)
				return null;

			return action_str.split(options.actionsDelimiter);
		},
		
		// parses validator action and parameters
		_parseAction = function(actionStr){
		
			var ap = $.trim(actionStr).match(/^(.*?)\[(.*?)\]/);
		
			if(ap && ap.length == 3){
				return {
					name: ap[1], 
					params: ap[2].split(options.paramsDelimiter)
				}
			}
			else{
				return {
					name: actionStr, 
					params:[]
				}
			}
		},
		
		// applys modifier
		_applyModifier = function(action, el){
			
			var oldVal, newVal = _callModifier(action, el);
			if(typeof newVal !== 'undefined'){
				oldVal = $(el).val();
				if(oldVal != newVal)
					$(el).val(newVal);
			}
		},
		
		// calls modifier
		_callModifier = function(action, el){

			var apply_params = [$(el).val()].concat(action.params);
			
			if(typeof modifier[action.name] == 'function')
				return modifier[action.name].apply(el, apply_params);
			else if(typeof window[action.name] == 'function')
				return window[action.name].apply(el, apply_params);
			else if(window.console.warn)
				window.console.warn('[bValidator] unknown modifier: ' + action.name);
		},
		
		// calls validator
		_callValidator = function(action, el, value){
			
			if(typeof validator[action.name] == 'function'){
				return validator[action.name].apply(el, [value].concat(action.params)); // add input value to beginning of action.params
			}
			
			// call custom user defined function
			if(typeof window[action.name] == 'function'){
				return window[action.name].apply(el, [value.value].concat(action.params));
			}
			
			if(window.console.warn)
				window.console.warn('[bValidator] unknown validator: ' + action.name);
		},					

		// object with validator actions
		validator = {

			equalto: function(v, elementId){
				return v.value == $('#' + elementId).val();
			},

			differs: function(v, elementId){
				return v.value != $('#' + elementId).val();
			},

			minlength: function(v, minlength){
				return (v.value.length >= parseInt(minlength))
			},

			maxlength: function(v, maxlength){
				return (v.value.length <= parseInt(maxlength))
			},

			rangelength: function(v, minlength, maxlength){		
				return (v.value.length >= parseInt(minlength) && v.value.length <= parseInt(maxlength))
			},

			min: function(v, min){		
				if(v.selectedInGroup)
					return v.selectedInGroup >= parseFloat(min)
				else{
					if(!validator.number(v))
			 			return false;
			 		return (parseFloat(v.value) >= parseFloat(min))
				}
			},

			max: function(v, max){		
				if(v.selectedInGroup)
					return v.selectedInGroup <= parseFloat(max)
				else{
					if(!validator.number(v))
			 			return false;
			 		return (parseFloat(v.value) <= parseFloat(max))
				}
			},

			between: function(v, min, max){
				if(v.selectedInGroup)
					return (v.selectedInGroup >= parseFloat(min) && v.selectedInGroup <= parseFloat(max))
			   	if(!validator.number(v))
			 		return false;
				var va = parseFloat(v.value);
				return (va >= parseFloat(min) && va <= parseFloat(max))
			},

			required: function(v){
				if(!v.value || !$.trim(v.value))
					return false
				return true
			},

			alpha: function(v){
				return validator.regex(v, /^[a-z ._\-]+$/i);
			},
			
			alphanum: function(v){
				return validator.regex(v, /^[a-z\d ._\-]+$/i);
			},

			digit: function(v){
				return validator.regex(v, /^\d+$/);
			},

			number: function(v){
				return validator.regex(v, /^[-+]?\d+(\.\d+)?$/);
			},

			email: function(v){
				return validator.regex(v, /^([a-zA-Z\d_\.\-\+%])+\@(([a-zA-Z\d\-])+\.)+([a-zA-Z\d]{2,4})+$/);
			},

			image: function(v){
				return validator.regex(v, /\.(jpg|jpeg|png|gif|bmp)$/i);
			},

			url: function(v){
				return validator.regex(v, /^\b(https?|ftp):\/\/([-A-Z0-9.]+)(\/[-A-Z0-9+&@#\/%=~_|!:,.;]*)?(\?[A-Z0-9+&@#\/%=~_|!:,.;]*)?$/i);
			},

			regex: function(v, regex, mod){
				if(typeof regex === "string")
					regex = new RegExp(regex, mod);
				return regex.test(v.value);
			},

			ip4: function(v){
				return validator.regex(v, /^(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?)$/);
			},
			
			ip6: function(v){
				return validator.regex(v, /^(?:(?:(?:[A-F\d]{1,4}:){5}[A-F\d]{1,4}|(?:[A-F\d]{1,4}:){4}:[A-F\d]{1,4}|(?:[A-F\d]{1,4}:){3}(?::[A-F\d]{1,4}){1,2}|(?:[A-F\d]{1,4}:){2}(?::[A-F\d]{1,4}){1,3}|[A-F\d]{1,4}:(?::[A-F\d]{1,4}){1,4}|(?:[A-F\d]{1,4}:){1,5}|:(?::[A-F\d]{1,4}){1,5}|:):(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)\.){3}(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)|(?:[A-F\d]{1,4}:){7}[A-F\d]{1,4}|(?:[A-F\d]{1,4}:){6}:[A-F\d]{1,4}|(?:[A-F\d]{1,4}:){5}(?::[A-F\d]{1,4}){1,2}|(?:[A-F\d]{1,4}:){4}(?::[A-F\d]{1,4}){1,3}|(?:[A-F\d]{1,4}:){3}(?::[A-F\d]{1,4}){1,4}|(?:[A-F\d]{1,4}:){2}(?::[A-F\d]{1,4}){1,5}|[A-F\d]{1,4}:(?::[A-F\d]{1,4}){1,6}|(?:[A-F\d]{1,4}:){1,7}:|:(?::[A-F\d]{1,4}){1,7})$/i);
			},

			date: function(v, format){ // format can be any combination of mm,dd,yyyy with separator between. Example: 'mm.dd.yyyy' or 'yyyy-mm-dd'
				if(v.value.length == 10 && format.length == 10){
					var s = format.match(/[^mdy]+/g);
					if(s.length == 2 && s[0].length == 1 && s[0] == s[1]){

						var d = v.value.split(s[0]),
						 f = format.split(s[0]);

						for(var i=0; i<3; i++){
							if(f[i] == 'dd') var day = d[i];
							else if(f[i] == 'mm') var month = d[i];
							else if(f[i] == 'yyyy') var year = d[i];
						}

						var dobj = new Date(year, month-1, day)
						if ((dobj.getMonth()+1!=month) || (dobj.getDate()!=day) || (dobj.getFullYear()!=year))
							return false

						return true
					}
				}
				return false;
			},

			extension: function(){
				var v = arguments[0],
				 r = '';
				if(!arguments[1])
					return false
				for(var i=1; i<arguments.length; i++){
					r += arguments[i];
					if(i != arguments.length-1)
						r += '|';
				}
				return validator.regex(v, '\\.(' +  r  + ')$', 'i');
			},
			
			ajax: function(ajaxResponse){
				if(ajaxResponse == options.ajaxAnswerValid)
					return true;
				return false;
			}
		},
		
		// object with modifiers
		modifier = {
			
			trim: function(v){
				return $.trim(v);
			}
		},

		// validator instance, scroll position flag
		instance = this, scroll_to;
		

		// global options
		if(window['bValidatorOptions'])
			$.extend(true, options, window['bValidatorOptions']);

		// passed options
		if(overrideOptions)
			$.extend(true, options, overrideOptions);
	
	
		// object with all validator instances
		var allInstances = mainElement.data("bValidators");
		if(!allInstances){
			allInstances = {};
			mainElement.data("bValidators", allInstances);
		}
		
		// if there is already first instance
		if(mainElement.data("bValidator")){
			if(!instanceName)
				return mainElement.data("bValidator"); // return existing instance

			if(allInstances[instanceName])
				return allInstances[instanceName];
		}
		else{
			if(!instanceName)
				instanceName = 'first';
			mainElement.data("bValidator", this);
		}
		
		allInstances[instanceName] = this;
		
		
		// if bind to a form
		if(mainElement.is('form')){
			
			// bind validation on form submit
			if(options.validateOnSubmit){
				mainElement.bind("submit.bV" + instanceName, function(event){
					
					if(instance.validate(false, undefined, 1))
						return true;
					else if(options.stopSubmitPropagation){
						event.stopImmediatePropagation();
						return false;
					}
				});
			}

			// bind reset on form reset
			mainElement.bind("reset.bV" + instanceName, function(){
				instance.reset();			
			});
		}

		// bind validateOn event
		if(options.validateOn)
			_bindValidateOn(_getElementsForValidation(mainElement));


		// API functions:

		// validation function
		this.validate = function(doNotshowMessages, elementsOverride, forceAjaxSync, ajaxResponse, onlyIsValidCheck){

			// return value, elements to validate
			var ret = true, elementsl;
			
			if(elementsOverride)
				elementsl = elementsOverride;
			else{
				if(mainElement.attr(options.forceValidAttr) == 'true')
					return true;
				
				elementsl = _getElementsForValidation(mainElement);
			}

			scroll_to = null;

			if(typeof ajaxResponse !== 'undefined' || _callBack('onBeforeAllValidations', elementsl) !== false){

				// validate each element
				elementsl.each(function(){

					var actions_exp = _parseAttr($(this).attr(options.validateActionsAttr)), // all validation actions
					 modifiers_exp = _parseAttr($(this).attr(options.modifyActionsAttr)), // all modifier actions
					 k = -1, action_data = [], action, is_valid = 0;
					
					// call modifiers
					if(modifiers_exp){
						for(var i=0; i<modifiers_exp.length; i++){
						
							action = _parseAction(modifiers_exp[i]);
							
							if(!action.name)
								continue;
							
							// call modifier
							_applyModifier(action, this);
						}
					}
					
					// call auto modifiers and prepare validation actions
					if(actions_exp){
						for(var i=0; i<actions_exp.length; i++){
						
							action = _parseAction(actions_exp[i]);
							
							if(!action.name)
								continue;
							
							// auto modifiers
							if(options.autoModifiers && options.autoModifiers[action.name]){
								for(var h=0; h<options.autoModifiers[action.name].length; h++)
									_applyModifier(_parseAction(options.autoModifiers[action.name][h]), this);
							}
							
							if(action.name == 'required')
								var flagRequired = 1;
							else if(action.name == 'ajax')
								var flagAjax = 1;
							
							if(action.name == 'valempty')
								var flagValempty = 1;
							else
								action_data[++k] = action; // action objects, with name and params
							
						}
					}
					else
						return true; // no actions for validation
						
					var inputValue = _getValue($(this)), // value of input field for validation;
					 errorMessages = [], validationResult;
					
					// call async ajax validation and skip element
					if(!forceAjaxSync && flagAjax && typeof ajaxResponse === 'undefined'){
						
						var skipAjaxAction = 0;
						
						// call all validators till ajax
						for(var i=0; i<action_data.length; i++){
							if(action_data[i].name == 'ajax')
								break;
							
							if(!_callValidator(action_data[i], this, inputValue)){
								skipAjaxAction = 1;
								break;
							}
						}
						
						if(!skipAjaxAction){
							ajaxResponse = _ajaxValidation($(this), instanceName, action.params[0]);
							if(typeof ajaxResponse === 'undefined'){
								return true;
							}
						}
					}
						
					// do not show message if exists for instance specified by noMsgIfExistsForInstance option
					if(options.noMsgIfExistsForInstance.length && _isMsgFromInstanceExists($(this), options.noMsgIfExistsForInstance))
						doNotshowMessages = 1;

					// if value is not required and is empty
					if((!flagRequired && !flagValempty && !validator.required(inputValue)) || $(this).attr(options.forceValidAttr) == 'true')
						is_valid = 1;

					if(!is_valid){

						// get message from attribute
						var errMsg = $(this).attr(options.errorMessageAttr),
						 skip_messages = 0;

						// mark field as validated
						$(this).data('checked.bV' + instanceName, 1);

						if(_callBack('onBeforeElementValidation', $(this)) !== false){
		
							// for each validation action
							for(var i=0; i<action_data.length; i++){
								
								if(action_data[i].name == 'valempty')
									continue;
									
								if((options.validateTillInvalid || onlyIsValidCheck) && errorMessages.length){
									break;
								}
								
								if(_callBack('onBeforeValidate', $(this), action_data[i].name) === false)
									continue;

								if(action_data[i].name == 'ajax'){
									
									if(skipAjaxAction)
										continue;
										
									if(forceAjaxSync || typeof ajaxResponse === 'undefined'){
										if(!errorMessages.length){
											validationResult = _ajaxValidation($(this), instanceName, action_data[i].params[0], 1);
										}
										else
											validationResult = true; // skip ajax validation if value is already invalid
									}
									else{
										validationResult = validator.ajax.apply(this, [ajaxResponse]);
									}
								}
								else{
									validationResult = _callValidator(action_data[i], this, inputValue);
								}
								
								if(_callBack('onAfterValidate', $(this), action_data[i].name, validationResult) === false)
									continue;
		
								// if validation failed
								if(!validationResult){
									
									// if messages needs to be shown
									if(!doNotshowMessages){
		
										if(!skip_messages){
											
											// if there is no message from errorMessageAttr
											if(!errMsg){
												
												if (options.singleError && errorMessages.length){
													skip_messages = 1;
													errMsg = '';
												}
												else{
													// lang set
													if(options.errorMessages[options.lang] && options.errorMessages[options.lang][action_data[i].name])
														errMsg = options.errorMessages[options.lang][action_data[i].name];
													// lang en
													else if(options.errorMessages.en[action_data[i].name])
														errMsg = options.errorMessages.en[action_data[i].name];
													else{
														// action msg attribute
														var tt = $(this).attr(options.errorMessageAttr + '-' + action_data[i].name);
														if(tt)
															errMsg = tt;
														// lang set default msg
														else if(options.errorMessages[options.lang] && options.errorMessages[options.lang]['default'])
															errMsg = options.errorMessages[options.lang]['default'];
														// lang en default msg
														else
															errMsg = options.errorMessages.en['default'];
													}
												}
												
											}
											else{
												skip_messages = 1;
											}
		
											// replace values in braces
											if(errMsg.indexOf('{')){
												for(var j=0; j<action_data[i].params.length; j++)
													errMsg = errMsg.replace(new RegExp("\\{" + j + "\\}", "g"), action_data[i].params[j]);
											}
		
											if(!(errorMessages.length && action_data[i].name == 'required'))
												errorMessages[errorMessages.length] = errMsg;
		
											errMsg = null;
										}
									}
									else
										errorMessages[errorMessages.length] = '';
		
									ret = false;
		
									_callBack('onValidateFail', $(this), action_data[i].name, errorMessages);
								}
								else{
									_callBack('onValidateSuccess', $(this), action_data[i].name);
								}
							}
						}
						
						var onAfterElementValidation = _callBack('onAfterElementValidation', $(this), errorMessages);	
					}
						
					
					// show messages and bind events
					if(!doNotshowMessages && onAfterElementValidation !== false && $(this).data('checked.bV' + instanceName)){

						var chk_rad = $(this).is('input:checkbox,input:radio') ? 1 : 0;
	
						// if validation failed
						if(errorMessages.length){
							
							if(onAfterElementValidation !== 0)
								_showMsg($(this), errorMessages)
	
							if(!chk_rad){
								$(this).removeClass(options.classNamePrefix+options.validClass);
								if(options.errorClass)
									$(this).addClass(options.classNamePrefix+options.errorClass);
							}
			
							// input validation event
							if (options.errorValidateOn){
								if(options.validateOn)
									$(this).unbind(options.validateOn + '.bV' + instanceName);
	
								var evt = chk_rad || $(this).is('select,input:file') ? 'change' : options.errorValidateOn;
	
								if(chk_rad){
									var group = $(this).is('input:checkbox') ? _chkboxGroup($(this)) : $('input:radio[name="' + $(this).attr('name') + '"]');
									$(group).unbind('.bVerror' + instanceName);
									$(group).bind('change.bVerror' + instanceName, {'bVInstance': instance, 'groupLeader': $(this)}, function(event){
										event.data.bVInstance.validate(false, event.data.groupLeader);
									});
								}
								else{
									$(this).unbind('.bVerror' + instanceName);
									$(this).bind(evt + '.bVerror' + instanceName, {'bVInstance': instance}, function(event){
										event.data.bVInstance.validate(false, $(this));
									});
								}
							}
						}
						else{
							if(onAfterElementValidation !== 0)
								_removeMsg($(this));
	
							if(!chk_rad){
								$(this).removeClass(options.classNamePrefix+options.errorClass);
								if(options.validClass)
									$(this).addClass(options.classNamePrefix+options.validClass);
							}
	
							if (options.validateOn){
								$(this).unbind(options.validateOn + '.bV' + instanceName);
								_bindValidateOn($(this));
							}
							
							$(this).data('checked.bV' + instanceName, 0);
						}
					}
					
					if((options.singleError || onlyIsValidCheck) && ret === false)
						return false;
					
				});
			}

			_callBack('onAfterAllValidations', elementsl, ret);

			// scroll to message
			if(scroll_to && !elementsOverride && ($(window).scrollTop() > scroll_to || $(window).scrollTop()+$(window).height() < scroll_to)){
				var ua = navigator.userAgent.toLowerCase();			
				$(ua.indexOf('chrome')>-1 || ua.indexOf('safari')>-1 ? 'body' : 'html').animate({scrollTop: scroll_to - 10}, {duration: 'slow'});
			}

			return ret;
		}

		// returns options object
		this.getOptions = function(){
			return options;
		}
		
		// returns validator object
		this.getValidators = this.getActions = function(){
			return validator;
		}
		
		// returns modifier object
		this.getModifiers = function(){
			return modifier;
		}

		// checks validity
		this.isValid = function(elements){
			return this.validate(true, elements, 1, undefined, true);
		}

		// deletes message
		this.removeMsg = this.removeErrMsg = function(elements){
			elements.each(function(){
				_removeMsg($(this));
			});
		}
		
		// shows message
		this.showMsg = function(elements, message){
			if(elements.length){
				if(typeof(message)=='string')
					message = [message];
				
				elements.each(function(){
					_showMsg($(this), message);
				});
			}
		}

		// returns all inputs
		this.getInputs = function(){
			return _getElementsForValidation(mainElement);
		}

		// binds validateOn event
		this.bindValidateOn = function(elements){
			_bindValidateOn(elements);
		}

		// resets validation
		this.reset = function(elements){
			
			if(!elements || !elements.length)
				elements = _getElementsForValidation(mainElement);
				
			if (options.validateOn)
				_bindValidateOn(elements);
			elements.each(function(){
				_removeMsg($(this));
				$(this).unbind('.bVerror' + instanceName);
				$(this).removeClass(options.classNamePrefix+options.errorClass);
				$(this).removeClass(options.classNamePrefix+options.validClass);
				$(this).removeData('ajaxData.bV' + instanceName);
				$(this).removeData('errMsg.bV' + instanceName);
				$(this).removeData('checked.bV' + instanceName);
			});
		}

		this.destroy = function(){
			if (mainElement.is('form'))
				mainElement.unbind('.bV' + instanceName);
			
			this.reset();
			
			mainElement.removeData("bValidator");
			mainElement.removeData("bValidators");
		}
	}

})(jQuery);
