FROM nginx:alpine

COPY build/nginx.conf /etc/nginx/nginx.conf
COPY build/vhost.conf /etc/nginx/conf.d/default.conf

RUN rm -rf /usr/share/nginx/html

COPY public /usr/share/nginx/html
