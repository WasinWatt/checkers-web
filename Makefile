dev:
	cd client; \
	npm run build; \
	cd ..; \
	python3 server.py;