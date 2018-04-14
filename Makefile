dev:
	cd client; \
	npm run build; \
	cd ..; \
	gunicorn server:app --threads=12;