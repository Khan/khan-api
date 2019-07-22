all: deps jsx build

deps:
	npm install

jsx: deps
	mkdir -p static/js/app/views
	node_modules/.bin/jsx -x jsx jsx/ static/js/app/views

uglify: jsx
	node_modules/.bin/r.js -o app.build.js

build: uglify
	$(eval sha := $(shell sha1sum static/js/main.js | cut -f 1 -d" "))
	mv static/js/main.js "static/js/main_$(sha).js"
	echo "SHASUM = '$(sha)'" > js_version.py

deploy: build
	gcloud app deploy ../app.yaml --project khan-api-explorer --no-promote

clean:
	rm -rf static/js/app/views static/js/main*.js
