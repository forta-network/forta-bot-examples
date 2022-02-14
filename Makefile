.PHONY: all test clean

build:
	sh ./utils/runner.sh "npm i && npm run postinstall"

test:
	sh ./utils/test.sh "npm run test"