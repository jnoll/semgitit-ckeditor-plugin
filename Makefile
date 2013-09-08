## jhnoll@gmail.com
include ../Makefile.in
include ../Make.rules

# Installation targets
PUBLIC_HTML=$(HOME)/public_html/test
#TARGET.dir=$(PUBLIC_HTML)/ckeditor
TARGET.dir=$(JS.dir)/ckeditor
CKEDITOR.dir=$(TARGET.dir)/ckeditor
CKPLUGIN.dir=$(CKEDITOR.dir)/plugins/pandoc
SAMPLE.dir=$(TARGET.dir)

# Installation sources
CKEDITOR.src = ckeditor
CKPLUGIN=pandoc/plugin.js
SGPLUGINS=CKEditArea.hs FromHTML.hs
SGTEMPLATES=edit_default_ckeditor.st
SGPAGES=Practice_templates.page		     # XXX s.b. renamed to something non-semgitit specific.
CONFIG=config.js # XXX pandocjson.js

## Test harness
SAMPLE=pandoc.html  native.html tscript.html # ckedit.js
TESTINPUT = $(wildcard test/*.pandoc)
TESTCASES = header inline-simple links lists table-simple table-nohead table-multiline table-multiline-noheader


# Rules - shouldn't need to change any of these unless the source structure is changed.
all: install
test: install_test

%.json: %.pandoc
	pandoc -t json -f markdown $< | $(HOME)/bin/jtidy > $@


build: index.html

install: 
	install  -m $(DIR_MODE) -d $(TARGET.dir)
	rsync --cvs-exclude -a $(CKEDITOR.src) $(TARGET.dir)
	install  -m $(DIR_MODE) -d $(CKPLUGIN.dir)
	install --compare -m $(FILE_MODE) $(CKPLUGIN) $(CKPLUGIN.dir)
	install --compare -m $(FILE_MODE) $(CONFIG) $(CKEDITOR.dir)
	install --compare -m $(FILE_MODE) $(SGPLUGINS) $(PLUGIN.dir)
	install --compare -m $(FILE_MODE) $(SGTEMPLATES) $(TEMPLATES.dir)
	install --compare -m $(FILE_MODE) $(SGPAGES) $(PAGE.dir)
	$(INIT_GIT)

	# Following is for html->json which is not used at present.
	#install --compare -m $(FILE_MODE) pandocjson.js $(JS.dir)

install_test: test.json build install
	install --compare -m $(FILE_MODE) $(SAMPLE) $(SAMPLE.dir)
	install  -m $(DIR_MODE) -d $(TARGET.dir)/input
	install --compare -m $(FILE_MODE) $(TESTINPUT) $(TARGET.dir)/input
	$(MAKE) -C backend install
	install --compare index.html $(TARGET.dir)

index.html: FORCE
	printf "<html>\n<head></head>\n<body>\n<ul>" > $@
	for f in $(TESTCASES); do printf "<li><a href='cgi-bin/ckedit.cgi?editText=%s.html'>%s.html</a> <a href='cgi-bin/ckedit.cgi?editText=%s.json'>%s.json</a></li>\n" $$f $$f $$f $$f >> $@; done
	printf "</ul>\n</body>\n</html>" >> $@

FORCE: