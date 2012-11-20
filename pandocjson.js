
var PandocJSON;
// Someone might define this someday.
if (!PandocJSON) {
    PandocJSON = {};
}


// Following prevailing wisdom, use a closure to prevent polluting namespace.
(function (PandocJSON) {
	toHTML = function toHTML(value) {
	    switch (typeof value) {
	    case 'string':
	    //console.warn('toHTML: string');
	    return stringToHTML(value);

	    case 'number':
	    //console.warn('toHTML: number');
	    // JSON numbers must be finite. Encode non-finite numbers as null.
	    return isFinite(value) ? String(value) : 'null';

	    case 'boolean':
	    //console.warn('toHTML: boolean');
	    case 'null':
	    //console.warn('toHTML: null');
	    // If the value is a boolean or null, convert it to a string. Note:
	    // typeof null does not produce 'null'. The case is included here in
	    // the remote chance that this gets fixed someday.
	    return String(value);

	    // Type 'object' might be an object, array, or null.
	    case 'object': 
	    if (!value) {
		//console.warn('toHTML: null object');
		return '';	// null
	    }


	    if (Object.prototype.toString.apply(value) === '[object Array]') {
		// Make an array to hold the partial results of
		// stringifying this object value.
		var partial = [], i;
		// The value is an array. Stringify every element. Use
		// null as a placeholder for non-JSON values.
		var length = value.length;
		//console.warn('toHTML: [object Array] of length ' + length.toString());
		for (i = 0; i < length; i += 1) {
		    //console.warn('toHTML: processing element ' + i + ' of ' + length);
		    partial[i] = toHTML(value[i]);
		}
		// Join all of the member texts together, without separator
		// (Pandoc already provides spaces when necessary).
		return  partial.length === 0 ? '' : partial.join('');

	    } else {
		// Make an array to hold the partial results of
		// stringifying this object value.
		var partial = [], i = 0, k;

		// Iterate through all of the keys in the object.
		for (k in value) {

		    if (Object.prototype.hasOwnProperty.call(value, k)) {
			//console.warn('toHTML: key: ' + k + ' value: ' + value[k].toString());
			var v = kvToHTML(k, value[k]);
			if (v) {
			    partial[i++] = v;
			}
		    }
		}
		// Join all of the member texts together, without separator
		// (Pandoc already provides spaces when necessary).
		return  partial.length === 0 ? '' : partial.join('');

	    }


	    } // switch
	} //toHTML

    if (typeof PandocJSON.toHTML !== 'function') {
	PandocJSON.toHTML = toHTML;
    } // PandocJSON.toHTML

    function listToHTML(value) {

	//console.warn('listToHTML: ' + Object.prototype.toString.apply(value));
	// Make an array to hold the partial results of
	// stringifying this object value.
	var partial = [], i;
	// The value is an array. Stringify every element. Use
	// null as a placeholder for non-JSON values.
	var length = value.length;
	//console.warn('listToHTML: [object Array] of length ' + length.toString());
	for (i = 0; i < length; i += 1) {
	    //console.warn('listToHTML: processing element ' + i + ' of ' + length);
	    partial[i] = '<li>' + toHTML(value[i]) + '</li>\n';
	}
	// Join all of the member texts together, without separator
	// (Pandoc already provides spaces when necessary).
	return  partial.length === 0 ? '' : partial.join('');
    }

    function stringToHTML(value) {
	switch (value) {
	case 'Space': return ' ';
	case 'LineBreak': return '<br/>\n';
	default: return value;
	}
    }

    function tableToHTML(value) {
	// XXX 1st element is caption, second is alignment, third is widths.
	// Fifth element is an array of rows.
	var i, j, k = 0, result = [],
	    caption = value[0],
	    align = value[1],
	    widths = value[2],
	    colheads = value[3],
	    rows = value[4];
	
	if (colheads.length) {
	    result[k++]= '<thead>\n<tr>';
	    for (j = 0; j < colheads.length; j++) {
		var alignment = '';
		switch (align[j]) {
		case 'AlignRight': alignment = 'right'; break;
		case 'AlignLeft': alignment = 'left'; break;
		case 'AlignCenter': alignment = 'center'; break;
		case 'AlignDefault': alignment = 'default'; break;
		}
		result[k++] = '<th align="' + alignment + '">' + toHTML(colheads[j]) + '</th>\n';
	    }
	    result[k++] = '</tr>\n</thead>\n<tbody>\n';
	}

	for (i = 0; i < rows.length; i++) {
	    result[k++] = '<tr>';
	    var row = rows[i];
	    for (j = 0; j < row.length; j++) {
		result[k++] = '<td>' + toHTML(row[j]) + '</td>';
	    }
	    result[k++] = '</tr>\n';
	}
	result[k++] = '</tbody>';

	return result.length === 0 ? '' : result.join('');
    }

    function kvToHTML(key, value) {

	switch (key) {
	case 'Str': return value;
	case 'Para': return '<p>' + toHTML(value) + '</p>\n';

	case 'BlockQuote': return '<quote>\n' + toHTML(value) + '\n</quote>\n';
	    // XXX Need to add code class attribute.
	case 'CodeBlock': return '<pre>\n' + toHTML(value) + '\n</pre>\n';
	    // Plain denotes a list item that is not a paragraph.

	case 'Plain' : return  toHTML(value) + '\n';

	case 'Strong' : return  '<strong>' + toHTML(value) + '</strong>\n';

	case 'Emph' : return  '<em>' + toHTML(value) + '</em>\n';

	case 'Strikeout' : return  '<del>' + toHTML(value) + '</del>\n';

	case 'Superscript' : return  '<sup>' + toHTML(value) + '</sup>\n';

	case 'Subscript' : return  '<sub>' + toHTML(value) + '</sub>\n';


	case 'Code' : 
	    var attr = value[0];	// XXX the class tag appears in the
	    // middle element; not sure what the
	    // others are for.
	    return '<code class="sourceCode ' + attr[1] + '">' + toHTML(value[1]) + '</code>\n';

	    // XXX Ugh, the first item is the list specification, then
	    // comes the list array. 

	case 'OrderedList': return '<ol>\n' + listToHTML(value[1]) + '</ol>\n';
	case 'BulletList':  return '<ul>\n' + listToHTML(value) + '</ul>\n';
	    // XXX Ugh, already a complication: value will have the
	    // level as part of the string.

	case 'Header': 
	    // header value is a two element array: [level, text]
	    var level = value[0];
	    return '<h' + level + '>' + toHTML(value[1]) + '</h' + level + '>\n';

	case 'Table' : return '<table>' + tableToHTML(value) + '</table>\n';
	default: 
	    //console.warn('kvToHTML: key is ' + key);
	    return toHTML(value);
	}
    }

})(PandocJSON);

module.exports = PandocJSON;

