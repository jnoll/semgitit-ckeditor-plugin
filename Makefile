## jhnoll@gmail.com
PUBLIC_HTML=$(HOME)/public_html/test
CKEDITOR.dir=$(HOME)/src/ckeditor-3.6.4
PLUGIN.dir=$(CKEDITOR.dir)/plugins/pandoc
SAMPLE.dir=$(CKEDITOR.dir)/_samples
SAMPLE=pandoc.html native.html tscript.html ckedit.js
PLUGIN=pandoc/plugin.js

DIR_MODE  = ug+rwX,o+rX
SCRIPT_MODE  = ug+rwx,o+rX
FILE_MODE = ug+rw,o+r

all: test.json install

%.json: %.pandoc
	pandoc -t json -f markdown $< | $(HOME)/bin/jtidy > $@



install: 
	install -m $(DIR_MODE) -d $(PLUGIN.dir)
	install -m $(FILE_MODE) $(PLUGIN) $(PLUGIN.dir)
	install -m $(FILE_MODE) pandocjson.js $(PLUGIN.dir)
	install -m $(FILE_MODE) $(SAMPLE) $(SAMPLE.dir)