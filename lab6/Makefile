.DEFAULT_GOAL := all 

all:
	tsc main.ts --lib es2015,dom
	tsc lot_main.ts --lib es2015,dom

clean:
	rm *.js

test:
	npx mocha -r ts-node/register testy.ts
	TS_NODE_COMPILER_OPTIONS='{"lib": ["ES2015"]}' npx mocha -r ts-node/register testy_gecko.ts

