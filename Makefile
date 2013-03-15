## jhnoll@gmail.com
PUBLIC_HTML=$(HOME)/public_html/test
#CKEDITOR.dir=$(HOME)/src/ckeditor-3.6.4
#CKEDITOR.dir=$(HOME)/src/ckeditor-3.6.5
CKEDITOR.src = ckeditor
TARGET.dir=$(PUBLIC_HTML)/ckeditor
CKEDITOR.dir=$(TARGET.dir)/ckeditor
PLUGIN.dir=$(CKEDITOR.dir)/plugins/pandoc
SAMPLE.dir=$(TARGET.dir)
SAMPLE=pandoc.html # native.html tscript.html # ckedit.js
PLUGIN=pandoc/plugin.js pandocjson.js
CONFIG=config.js

DIR_MODE  = ug+rwX,o+rX
SCRIPT_MODE  = ug+rwx,o+rX
FILE_MODE = ug+rw,o+r

all: test.json install

%.json: %.pandoc
	pandoc -t json -f markdown $< | $(HOME)/bin/jtidy > $@



install: 
	install  -m $(DIR_MODE) -d $(TARGET.dir)
	rsync --cvs-exclude -a $(CKEDITOR.src) $(TARGET.dir)
	install  -m $(DIR_MODE) -d $(PLUGIN.dir)
	install --compare -m $(FILE_MODE) $(PLUGIN) $(PLUGIN.dir)
	install --compare -m $(FILE_MODE) $(SAMPLE) $(SAMPLE.dir)
	install --compare -m $(FILE_MODE) $(CONFIG) $(CKEDITOR.dir)
	install --compare -m $(FILE_MODE) pandocjson.js $(TARGET.dir)
