// Pandoc json decoder/encoder plugin.

CKEDITOR.plugins.add( 'pandoc', {
    requires : [ 'htmldataprocessor' ],
    init: function( editor ) {
	// All plugin logic goes here.

	// The only thing this plugin does is decode JSON from
	// server to HTML, and encode HTML to JSON to send back.
	var dataProcessor = editor.dataProcessor = new CKEDITOR.pandocDataProcessor( editor );
				
    }
} );


CKEDITOR.pandocDataProcessor = function( editor ) {
    this.editor = editor;

    this.writer = new CKEDITOR.htmlWriter();
    this.dataFilter = new CKEDITOR.htmlParser.filter();
    this.htmlFilter = new CKEDITOR.htmlParser.filter();
};

CKEDITOR.pandocDataProcessor.prototype = {
    toHtml : function( data, fixForBody ) {
	//alert('toHtml' + data);
	var tmp = [], i = 0;
	// This hack turns data into an object.  Pandoc converts a
	// document into an array, while JSON.parse() expects an
	// object.
	tmp[i++] = '{"d":';
	tmp[i++] = data;
	tmp[i++] = '}';
	data = JSON.parse(tmp.join(''));
	//data = eval( '(' + data + ')' );
	data = PandocJSON.toHTML(data);
	
	return data;
    },

    // Convert editor's HTML to JSON.
    // This was just copied from htmlDataProcessor.
    toDataFormat : function( html, fixForBody ) {
	var parser = new CKEDITOR.htmlParser();
	var data = [], i = 0;
	// Stack of blocks.  Each block is an object with an array of elements.
	var blocks = [], num_els = [], block_level = -1;
	var in_paraish = [];	// is current block paragraph-like?
	var in_array = [];
	var alist = [];
	var objects = [];

	newBlock = function(bracket, is_paraish, array) {
	    incrEls()
	    block_level++;
	    num_els[block_level] = 0;
	    data[i++] = bracket;
	    in_paraish[block_level] = is_paraish ? true : in_paraish[block_level-1];
	    in_array[block_level] = array;
	};

	endBlock = function(bracket) {
	    data[i++] = bracket;
	    block_level--;
	};

        newObject = function(name, is_paraish) {
	    newBlock('{', is_paraish, false);
	    data[i++] = stringify(name) + ':';
	    objects.push(name);
	}

	endObject = function() {
	    endBlock('}');
	    objects.pop();
	}

        newArray = function() {
	    newBlock('[', false, true);
        };

        endArray = function() {
	    endBlock(']');
	};

	inArray = function() {
	    return in_array[block_level];
	};

	inParaish = function() {
	    return in_paraish[block_level];
	};

	needsPlain = function() {
	    return (objects[objects.length-1] == 'OrderedList'
		    || objects[objects.length-1] == 'BulletList'
		    || objects[objects.length-1] == 'DefinitionList')
	}

	inPlain = function() {
	    return (objects[objects.length-1] == 'Plain' )
	}

        incrEls = function() {
	    //alert('incrEls: inArray=' + inArray() + ' num_els=' + num_els[block_level]);
	    if (inArray() && num_els[block_level] > 0) {
		data[i++] = ',';
	    }
	    num_els[block_level]++;
	}

	addElement = function(el) {
	    //alert('addElement: ' + el);
	    incrEls();
	    data[i++] = el;
	};

	mkHeader = function(level) {
	    newObject('Header', true);
	    newArray([]);
	    addElement(level);
	    newArray();
	};

	stringify = function(text) {
	    // JSON doesn't like real newlines, so convert to '\n'.
	    return '"' + text.replace(/(\r\n|\n|\r)/gm, '\\n') + '"';
	}

	getAttribute = function (attr_name) { 
	    return alist[alist.length - 1][attr_name]; 
	};

	parser.onTagOpen = function(tag, attributes, selfClosing) {
	    switch (tag) {
	    case 'h1': mkHeader(1); break;
	    case 'h2': mkHeader(2); break;
	    case 'h3': mkHeader(3); break;
	    case 'h4': mkHeader(4); break;
	    case 'h5': mkHeader(5); break;
	    case 'p':
	    newObject('Para',  true);
	    alist.push(attributes);
	    newArray();
	    break;
	    case 'i':
	    case 'em':
	    newObject('Emph', false);
	    alist.push(attributes);
	    newArray();
	    break;
	    case 'b':
	    case 'strong':
	    newObject('Strong', false);
	    alist.push(attributes)
	    newArray();
	    break;

	    case 'ol':
	    newObject('OrderedList', true);
	    alist.push(attributes);
	    newArray(); 	// list contents.
	    newArray();	           // list attributes XXX can editor specify these
	    addElement(1);	   // start number
	    addElement(stringify("DefaultStyle")); // numbering hierarchy
	    addElement(stringify("DefaultDelim"));  // separator
	    endArray();
	    newArray();		// list items;
	    break;
	    case 'ul':
	    newObject('BulletList', true);
	    alist.push(attributes);
	    newArray();		// list items;
	    break;
	    case 'li':
	    newArray();		
	    break;
	    case 'a':
	    newObject('Link', false);
	    alist.push(attributes);
	    newArray();
	    newArray(); // for text between <a href="..."> and </a>
	    break;
	    case 'img':
	    break;
	    case 'table':
	    break;
	    default:
	    break;
	    }
	};

	parser.onTagClose = function(tag) {
	    switch (tag) {
	    case 'h1' : case 'h2': case 'h3': case 'h4': case 'h5':
	    endArray();
	    endArray();
	    endObject(); 
	    alist.pop();
	    break;
	    case 'p' : 
	    case 'i':
	    case 'em':
    	    case 'b':
	    case 'strong':
	    endArray();
	    endObject(); 
	    alist.pop();
	    break;
	    case 'ol':
	    endArray(); 	// list items
	    endArray(); 	// list
	    endObject(); 	// list object
	    alist.pop();
	    break;
	    case 'ul':
	    endArray(); 	// list items
	    endObject();	// list object
	    alist.pop();
	    break;
	    case 'li':
	    endArray(); 	// item contents
	    break;
	    case 'a': 
	    endArray();
	    newArray();		// for href.
	    //alert("href: " +  getAttribute('href'));
	    href = getAttribute('href').split(/\#/);
	    addElement(stringify(href[0]));
	    if (href.length > 1) { // link title
		addElement(stringify(decodeURI(href[1]))); 
	    } else {
		addElement(stringify("")); 
	    }

	    endArray();		// href+title
	    endArray();		// link data
	    endObject();	// Link
	    alist.pop();
	    break;
	    case 'img':
	    break;
	    case 'table':
	    break;
	    default:
	    break;
	    }
	};

	parser.onText = function(text) {
	    var close_para = false;

	    if (!inParaish()) {
		newObject('Para', true);
		newArray();
		close_para = true;
	    } else if (needsPlain()) {
		newObject('Plain', false);
		newArray();
	    }

	    newObject('Str', false);
	    addElement(stringify(text));
	    endObject();

	    if (inPlain()) {
		endArray();
		endObject();
	    }
	    if (close_para) {
		endArray();
		endObject()
	    }
	};


	// Setup data output.
	block_level = -1;	// so base level is 0.
	num_els[block_level] = 0;
	in_paraish[block_level] = false;
	in_array[block_level] = false;
	newArray();		   // The document is an array of [header, body]
	// The first element in block 0 is the document header, which
	// is empty in the current JSON->html impl.
	addElement( '{"docTitle":[],"docAuthors":[],"docDate":[]}' ); 

	// The second element in block 0 is an array representing the
	// body, which is itself a block.
	newArray();

	parser.parse(html);

	// At end, close off body and document.
	endArray();		// body
	endArray();		// doc

	result = data.length === 0 ? '' : data.join('');
	//alert('toDataFormat: ' + result);
	return result;
    }

};

