**Notes about this fork**

bValidator by default skips over hidden elements via the `:hidden` selector.
This created problems when wanting validation to run on hidden inputs when using
libraries like chosen (http://harvesthq.github.io/chosen/).

This commit adds a new option, `hiddenElementSelector`. Pass it in with your other
bValidator options. This should be a selector for hidden elements that you want
to be validated. For instance, with chosen, you would pass:

```javascript
$('form').bValidator({
	hiddenElementSelector : 'select'
});
```

Or you could be more specific with the selector to just run on chosen selects.

```javascript
$('form').bValidator({
	hiddenElementSelector : 'select.chosen-select'
});
```

bValidator needs an element to figure out where to place the validation error tooltip.
When the element is hidden, the tooltip can't be placed properly. To get around this, we
**need to wrap our hidden elements with a `span` tag**, or whatever other visible element
of your choosing. The code will take the immediate parent of any hidden elements to help
place the tooltip.

An exmaple of the html needed for a chosen select, either of the two JavaScript options above would initialize this:

```html
<span>
	<select class="chosen-select" data-placeholder="Choose..." data-bvalidator="required">
		<option></option>
		<option value="1">Option 1</option>
		<option value="2">Option 2</option>
		<option value="3">Option 3</option>
	</select>
</span>
```

The css update on the tooltip container adding a `z-index` was required to show
validation errors on top of chosen selects.

No other bValidator functionality was touched.
