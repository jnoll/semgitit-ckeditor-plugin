/*
Copyright (c) 2003-2012, CKSource - Frederico Knabben. All rights reserved.
For licensing, see LICENSE.html or http://ckeditor.com/license
*/

CKEDITOR.editorConfig = function( config )
{
    // Define changes to default configuration here. For example:
    // config.language = 'fr';
    // config.uiColor = '#AADC6E';
    // XXX only for JSON i/o config.extraPlugins = 'pandoc';
    // Remove unused plugins.
    config.removePlugins = 'bidi,button,dialogadvtab,div,filebrowser,flash,forms,horizontalrule,iframe,justify,liststyle,pagebreak,showborders,stylescombo,templates';
    // Width and height are not supported in the BBCode format, so object resizing is disabled.
    config.disableObjectResizing =  true;
    config.toolbar = [
		      ['Format'],
		      ['Source', '-', 'Save','NewPage','-','Undo','Redo'],
		      ['Find','Replace','-','SelectAll','RemoveFormat'],
		      ['Link', 'Unlink', 'Anchor', 'Image'],
		      ['Bold', 'Italic','Underline'],
		      ['NumberedList','BulletedList','-','Outdent','Indent','Blockquote'],
		      ['Table'],
		      ['Maximize']
		     ];
    config.on = {instanceReady : function( ev ) {
	    // Output paragraphs as <p>Text</p>.
	    this.dataProcessor.writer.setRules( 'p',  {
		indent : false,
		breakBeforeOpen : false,
		breakAfterOpen : false,
		breakBeforeClose : false,
		breakAfterClose : false
		});
	}
    };
};
