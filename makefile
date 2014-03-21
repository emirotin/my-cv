watch = mimosa watch
build = mimosa build

.PHONY : start startd build build-opt clean pack

start:
	@echo "[x] Building assets and starting development server..."
	@$(watch) -s

startd:
	@echo "[x] Cleaning compiled directory, building assets and starting development server.."
	@$(watch) -sd

build:
	@echo "[x] Building assets..."
	@$(build)

build-opt:
	@echo "[x] Building and optimizing assets..."
	@$(build) -o

clean:
	@echo "[x] Removing compiled files..."
	@mimosa clean

pack:
	@echo "[x] Building and packaging application..."
	@$(build) -omp
	./node_modules/.bin/uglifyjs dist/public/javascripts/bundle.js -o dist/public/javascripts/bundle.js -mc
	rm dist/*.tar.gz
