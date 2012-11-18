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
	// XXX OK, so far it just replaces instances of "FOO" with
	// "BAR"; sue me.
	//data = data.replace( new RegExp( 'FOO', 'ig' ), 'BAR' );
	data = JSON.parse(data);
	//data = eval( '(' + data + ')' );
	data = PandocJSON.toHTML(data);
	data = 
	return data;
    },

    // This was just copied from htmlDataProcessor.
    toDataFormat : function( html, fixForBody ) {
	var writer = this.writer,
	fragment = CKEDITOR.htmlParser.fragment.fromHtml( html, fixForBody );

	writer.reset();

	fragment.writeHtml( writer, this.htmlFilter );

	var data = writer.getHtml( true );

	// Restore those non-HTML protected source. (#4475,#4880)
	// XXX Not sure why, but these don't seem to work.
	//data = unprotectRealComments( data );
	//data = unprotectSource( data, this.editor );
	alert(data);
	// Do reverse of toHtml.
	data = data.replace( new RegExp( 'BAR', 'ig' ), 'FOO' );

	return data;
    }

};

