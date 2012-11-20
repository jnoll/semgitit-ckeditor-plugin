// Replace the <textarea id="editor"> with an CKEditor
// instance, using the "bbcode" plugin, shaping some of the
// editor configuration to fit BBCode environment.
CKEDITOR.replace( 'editor'
{
        extraPlugins : 'tableresize,timestamp',
	// Remove unused plugins.
	removePlugins : 'bidi,button,dialogadvtab,div,filebrowser,flash,format,forms,horizontalrule,iframe,indent,justify,liststyle,pagebreak,showborders,stylescombo,table,tabletools,templates',
	// Width and height are not supported in the BBCode format, so object resizing is disabled.
	disableObjectResizing : true,
	// Define font sizes in percent values.
	fontSize_sizes : "30/30%;50/50%;100/100%;120/120%;150/150%;200/200%;300/300%",
	toolbar :
    [
     ['Source', '-', 'Save','NewPage','-','Undo','Redo'],
     ['Find','Replace','-','SelectAll','RemoveFormat'],
     ['Link', 'Unlink', 'Image', 'Smiley','SpecialChar','Table'],
     '/',
     ['Bold', 'Italic','Underline'],
     ['FontSize'],
     ['TextColor'],
     ['NumberedList','BulletedList','-','Blockquote'],
     ['Maximize','Timestamp']
     ],
	// Strip CKEditor smileys to those commonly used in BBCode.
	smiley_images :
    [
     'regular_smile.gif','sad_smile.gif','wink_smile.gif','teeth_smile.gif','tounge_smile.gif',
     'embaressed_smile.gif','omg_smile.gif','whatchutalkingabout_smile.gif','angel_smile.gif','shades_smile.gif',
     'cry_smile.gif','kiss.gif'
     ],
	smiley_descriptions :
    [
     'smiley', 'sad', 'wink', 'laugh', 'cheeky', 'blush', 'surprise',
     'indecision', 'angel', 'cool', 'crying', 'kiss'
     ]
	} );

