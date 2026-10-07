FROM nginx:1.27-alpine

# Static assets.
COPY html/ /usr/share/nginx/html/

# Config template; nginx renders it with envsubst at startup using
# BACKEND_HOST / BACKEND_PORT from the environment.
COPY default.conf.template /etc/nginx/templates/default.conf.template

ENV BACKEND_HOST=backend \
    BACKEND_PORT=3000

EXPOSE 8080
