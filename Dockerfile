FROM nginx:alpine

RUN rm -rf /usr/share/nginx/html

COPY public /usr/share/nginx/html
