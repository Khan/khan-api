all: deps jsx

deps:
	npm install

jsx:
	node_modules/.bin/jsx -x jsx jsx/ static/js/app/views

deploy:
	appcfg.py update ..
