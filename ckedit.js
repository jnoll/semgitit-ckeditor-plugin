// Replace the <textarea id="editor"> with an CKEditor
// instance.
CKEDITOR.replace( 'editor', {
    extraPlugins: 'pandoc',
    on : { 'instanceReady' : configurePandocOutput }
    });

// This cribbed from the 'output_for_flash.html" sample, per suggestion from 
// http://stackoverflow.com/questions/5277359/extra-spaces-inserted-with-ckeditors-entermode-causes-problems-in-xml-docs
function configurePandocOutput( env ) {
    var editor = env.editor,
	dtd = CKEDITOR.dtd,
	dataProcessor = editor.dataProcessor;
    for ( var e in CKEDITOR.tools.extend( {}, dtd.$nonBodyContent, dtd.$block, dtd.$listItem, dtd.$tableContent ) )
	{
	    dataProcessor.writer.setRules( e, {
		        indent : false,
			breakBeforeOpen : false,
			breakAfterOpen : false,
			breakBeforeClose : false,
			breakAfterClose : false
			});
	}
	dataProcessor.writer.setRules( 'br', {
	            indent : false,
		    breakBeforeOpen : false,
		    breakAfterOpen : false,
		    breakBeforeClose : false,
		    breakAfterClose : false
		    });
	dataProcessor.writer.setRules( 'p', {
            indent : true,
            breakBeforeOpen : false,
            breakAfterOpen : false,
            breakBeforeClose : true,
            breakAfterClose : false
		    });
}