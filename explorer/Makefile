all: deps jsx build

deps:
	npm install

jsx:
	node_modules/.bin/jsx -x jsx jsx/ static/js/app/views

uglify:
	node_modules/.bin/r.js -o app.build.js

build: deps jsx uglify
	$(eval sha := $(shell sha1sum static/js/main.js | cut -f 1 -d" "))
	mv static/js/main.js "static/js/main_$(sha).js"
	echo "SHASUM = '$(sha)'" > js_version.py

deploy: build
	appcfg.py update ..

clean:
	rm -rf static/js/app/views static/js/main*.js
