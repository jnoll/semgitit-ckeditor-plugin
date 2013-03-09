## jhnoll@gmail.com
PANDOC=$(wildcard *.pandoc)
JSON=$(PANDOC:.pandoc=.json)
HTML=$(PANDOC:.pandoc=.html)
JTIDY=$(HOME)/bin/jtidy
#JTIDY=cat
TIDY=cat
#TIDY=tidy -i
all: index.html $(JSON) $(HTML)

index.html: $(HTML) Makefile
	echo "<html>\n <body>" > $@
	for f in $(HTML) ; do \
	  echo "  <ul>" >> $@ ;\
	  echo "   <li><a href='$$f'>$$f</a></li>" >> $@; \
	  echo "  </ul>" >> $@ ;\
	done 
	echo " </body>\n</html>" >> $@

what:
	@echo $(JSON)

%.json: %.pandoc Makefile
	pandoc -t json -f markdown $< | $(JTIDY) > $@


%.html: %.json ../test.js ../pandocjson.js
	-export NODE_PATH=:..; node  ../test.js  < $< | $(TIDY) > $@

clean: 
	rm -f $(JSON) $(HTML)