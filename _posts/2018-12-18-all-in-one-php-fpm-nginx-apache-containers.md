---
layout: post
categories: [blog]
date: 2018-12-18
title: All-in-One PHP-FPM + Nginx/Apache Containers
description: Highly Customizable, Production-Ready and Development-Friendly Containers
slug: all-in-one-php-fpm-nginx-apache-containers
redirect_from:
  - /blog/all-in-one-php-fpm-nginx-apache-containers/
tags:
  - docker
  - php
  - nginx
  - apache
gh_comment_id: 18
---

In a previous post,
[Docker PHP/PHP-FPM Configuration via Environment Variables](2018-11-15-php-container-image-ini-environment-variables.md),
I described how to use environment variables to configure PHP FPM and CLI. With
my method you can override one of over 650 PHP INI settings. More INI settings
are but a PR away! 

In a more recent post,
[PHP Modules Toggled via Environment Variables](2018-12-14-php-modules-toggled-via-environment-variables.md)
I extended this concept to include modules. You can now easily (and quickly!)
enable over 20 common modules, including GD, Imagick, Mongodb, and more! The
images I built come with over 30 modules installed, with a small selection
enabled by default, and the rest toggable by simple environment variables. 

With these two concepts combined my other post,
[Developing at Full Speed with Xdebug](2018-07-23-developing-at-full-speed-with-xdebug.md)
becomes that much more powerful, because now you can easily enable Xdebug via a
very simple env var flag. A truly delay-free debug-ready development
environment has never been easier to maintain.

However, my Xdebug post uses a method that requires two separate PHP-FPM
servers, one with Xdebug enabled and another without. To run a normal PHP
project you would be required to run 4 containers in total:

* 2 PHP (FPM)
* 1 Nginx (Webserver)
* 1 MySQL (Database)

While this falls inline with Docker's vision of one-container per
responsibility, it is a hassle to have to maintain separate containers for both
Nginx and PHP, with the main reason being that both separate services need
access to your project's source code in order to properly work.

You can argue that PHP-FPM _depends_ on a webserver to actually function and
this responsibility can be considered as one. Thus, one container running both
Nginx (or your webserver of choice) and PHP is desirable.

## Managing Multiple Services Under Docker

Docker containers _can_ run multiple services just fine. However, the daemon
actively checks only a single main process which includes monitoring it for
health (is this service still running?) and using it for stdout/stderr logging.

The [official Docker documentation](https://docs.docker.com/config/containers/multi-service_container/)
recommends using either writing your own wrapper script, or using a process
manager like `supervisord`.

You could install Supervisord. It is a great process manager! However, why go
that route when you can use a Docker-ready image to build from?

Enter [baseimage-docker](http://phusion.github.io/baseimage-docker/).

This Ubuntu 18.04-based image comes preinstalled and configured with nifty
tools like `runit` for process management (Does not require crazy weird
`init.d` config files!), `syslog-ng` for log management, and `cron` which is
sorely-missing from most Docker images!

I will not go into detail about `baseimage-docker` as their documentation is
top-notch. Later you will be able to see what I created using this tool as an
example.

## Setting up Nginx

[The Nginx images extend my PHP images](https://github.com/jtreminio/php-docker/blob/master/nginx/Dockerfile-7.2).
We already have a strong PHP-focused base to start from and can simply add
Nginx to it.

[The runit file is fairly simple](https://github.com/jtreminio/php-docker/blob/3e1a6c355f9462dd676628016648882a17b613b2/nginx/files/nginx).

In it we spin up Nginx as most folks do: `nginx -g "daemon off;"`

However, the [Nginx build I am using](https://launchpad.net/~ondrej/+archive/ubuntu/nginx)
comes with support for the handy Perl module. This allows us to pass
environment variables to the Nginx config files. Normally Nginx has no support
for this (which is a huge gaping hole, in my opinion) but using the Perl module
you get a workable implementation.

The one thing I have baked in to the Nginx images is passing in an Xdebug port.

This works nicely with my _Developing at Full Speed with Xdebug_ blog post.

You can setup Nginx env var as follows:

```bash
perl_set $phpfpm_xdebug_port 'sub { return $ENV{"PHPFPM_XDEBUG_PORT"}; }';
```

The runit file then looks like this:

```bash
PHPFPM_XDEBUG=${PHPFPM_XDEBUG:-""}
if [ "${PHPFPM_XDEBUG,,}" = "on" ]; then
    PHPFPM_XDEBUG_PORT=9999
else
    PHPFPM_XDEBUG_PORT=9000
fi

exec nginx -g "daemon off; env PHPFPM_XDEBUG_PORT=${PHPFPM_XDEBUG_PORT};"
```

Everything hinges on the `PHPFPM_XDEBUG` env var. If it is set to `On` or `on`
Nginx is told to use port `9999` for Xdebug requests, otherwise to use the
standard `9000`.

The final piece of the Nginx puzzle is the
[virtual host config](https://github.com/jtreminio/php-docker/blob/04ce87d1fe6784768761f872e33ee6e44c0a9f5c/nginx/files/vhost.conf):

```bash
map $cookie_XDEBUG_SESSION $my_fastcgi_pass {
    default 127.0.0.1:9000;
    xdebug  127.0.0.1:${phpfpm_xdebug_port};
}
```

If Nginx detects a cookie named `XDEBUG_SESSION` it uses `${phpfpm_xdebug_port}`,
otherwise defaults to the standard `9000`.

What happens when Xdebug support is _not_ requested is that both cases would be
interpreted as simply

```bash
map $cookie_XDEBUG_SESSION $my_fastcgi_pass {
    default 127.0.0.1:9000;
    xdebug  127.0.0.1:9000;
}
```

This allows us to toggle Xdebug without having to actually make any file
changes.

Likewise, if Xdebug support is enabled (via the `PHPFPM_XDEBUG=On` env var)
then it would be interpreted as

```bash
map $cookie_XDEBUG_SESSION $my_fastcgi_pass {
    default 127.0.0.1:9000;
    xdebug  127.0.0.1:9999;
}
```

## Setting up PHP-FPM

The [PHP-FPM runit init file is already created](https://github.com/jtreminio/php-docker/blob/04ce87d1fe6784768761f872e33ee6e44c0a9f5c/files/php-fpm)
at the `jtreminio/php:7.2` level. Nginx can immediately start working with this
existing service and nothing else is required on your part. However, we want to
also optionally add a second PHP-FPM instance with Xdebug enabled _but only when
`PHPFPM_XDEBUG=On`_!

runit requires a bash file with `+x` flag set (making it executable). One route
we could have taken was to simply mount a file volume via a 
`docker-compose.yml` file but unfortunately any files shared in this manner are
not set as executable. This means we have to bake in the init file into the
image itself. However, if we want to continue down the path of not requiring
any file system changes and make everything configurable via env vars then
we need to figure out a way to prevent runit from running a second PHP-FPM
instance when Xdebug is not to be enabled.

[The solution I implemented](https://github.com/jtreminio/php-docker/blob/875edc1b59b4cad83e48f457d599c709b1e932dc/apache/files/fpm-xdebug)
does just that.

If `PHPFPM_XDEBUG` is _not_ set to `On|on` then a harmless, low-resource
service is run:

```bash
exec tail -f /var/log/fpm-xdebug-tail
```

This is because runit needs to run _something_, and simply exiting at this
point would cause the daemon to try restarting the service over and over. There
is no disable flag to tell runit, "Hey, don't run this!".

Otherwise, if `PHPFPM_XDEBUG=On` then a second PHP-FPM service is run using

```bash
exec /usr/sbin/php-fpm \
    -d FPM.pid="/var/run/php-fpm/php-fpm-xdebug.pid" \
    -d FPM.listen="127.0.0.1:9999" \
    [...]
```

We override the `pid` and `listen` directives to prevent any collisions with
the non-Xdebug PHP-FPM instance. 

## Bonus: Setting up Apache

Since we are using PHP-FPM the webserver engine becomes much easier to switch
out. As long as it can speak TCP it is ok, which means adding Apache support is
fairly simple.

[The Dockerfile for the Apache image](https://github.com/jtreminio/php-docker/blob/f8b499cb59882cc903cdf174f0b50bc37689ab7d/apache/Dockerfile-7.2)
is very similar to the Nginx one.

Likewise, [the runit init file for Apache looks similar](https://github.com/jtreminio/php-docker/blob/f8b499cb59882cc903cdf174f0b50bc37689ab7d/apache/files/apache)
and [the runit init file for PHP-FPM is identical](https://github.com/jtreminio/php-docker/blob/875edc1b59b4cad83e48f457d599c709b1e932dc/apache/files/fpm-xdebug).

Apache has built-in support for env vars (looking at you, Nginx) so
[only the vhost config file needs changed](https://github.com/jtreminio/php-docker/blob/f8b499cb59882cc903cdf174f0b50bc37689ab7d/apache/files/vhost.conf).

Apache has no `map` directive, but does support `If/Else`:

```bash
<FilesMatch "\.php$">
    <If "%{HTTP_COOKIE} =~ /XDEBUG_SESSION/">
        SetHandler proxy:fcgi://127.0.0.1:${PHPFPM_XDEBUG_PORT}
    </If>
    <Else>
        SetHandler proxy:fcgi://127.0.0.1:9000
    </Else>
</FilesMatch>
```

The same idea from Nginx applies here, `$PHPFPM_XDEBUG_PORT` defaults to `9000`
unless `PHPFPM_XDEBUG=On` then it defaults to `9999`.

## Try It Out

You can try this out fairly quickly, but first some helpers.

[Grab the PhpStorm bookmarklets](https://www.jetbrains.com/phpstorm/marklets/).
You do not need to use PhpStorm to use these, they simply create an
`XDEBUG_SESSION` cookie in your browser. This is the cookie the webserver
listens for. Again, if this cookie does not exist all traffic is routed to the
non-Xdebug PHP-FPM instance, and vice-versa.

Next, setup Traefik. You may remember Traefik from my
[Traefik on Docker for Web Developers](2018-07-31-traefik-on-docker-for-web-developers.md)
post. It is an amazing tool that helps map domain names to containers.

```bash
TRAEFIK=$(docker container ls --filter name=traefik_proxy | grep -c traefik_proxy || true)
if [ ${TRAEFIK} -eq 0 ]; then
    NETWORK=$(docker network ls --filter name=traefik_webgateway | grep -c traefik_webgateway || true)
    if [ ${NETWORK} -eq 0 ]; then
        docker network create --driver bridge traefik_webgateway
    fi

    docker container run -d \
        --name traefik_proxy \
        --network traefik_webgateway \
        --publish 80:80 \
        --publish 8080:8080 \
        --restart always \
        --volume /var/run/docker.sock:/var/run/docker.sock \
        --volume /dev/null:/traefik.toml \
        traefik --api --docker --docker.domain=docker.localhost --logLevel=DEBUG
fi
```

We setup Traefik via bash instead of a `docker-compose.yml` file so it is not
tied to a specific project (the container name would have the parent directory
prepended to it otherwise).

Now you can run the PHP/Nginx instance using:

```yaml
version: '3.2'
networks:
  public:
    external:
      name: traefik_webgateway
services:
  web:
    image: jtreminio/php-nginx:7.2
    labels:
      - traefik.backend=php-nginx
      - traefik.docker.network=traefik_webgateway
      - traefik.frontend.rule=Host:php-nginx.localhost
      - traefik.port=8080
    networks:
      - public
    volumes:
      - ./:/var/www/
    environment:
      - PHP.display_errors=On
      - PHP.error_reporting=-1
      - PHPFPM_XDEBUG=On
```

Run `docker-compose up` and then open [php-nginx.localhost](http://php-nginx.localhost)
in Chrome (or another browser if you have dnsmasq installed).

Create an `index.php` file that simply contains `<?php phpinfo();` to test this
out.

If you want to try with Apache, use the following:

```yaml
version: '3.2'
networks:
  public:
    external:
      name: traefik_webgateway
services:
  web:
    image: jtreminio/php-apache:7.2
    labels:
      - traefik.backend=php-apache
      - traefik.docker.network=traefik_webgateway
      - traefik.frontend.rule=Host:php-apache.localhost
      - traefik.port=8080
    networks:
      - public
    volumes:
      - ./:/var/www/
    environment:
      - PHP.display_errors=On
      - PHP.error_reporting=-1
      - PHPFPM_XDEBUG=On
```

Run `docker-compose up` and then open [php-apache.localhost](http://php-apache.localhost)
in Chrome (or another browser if you have dnsmasq installed).

You can try the Xdebug feature by either commenting out `PHPFPM_XDEBUG=On` or
changing it to anything not `On|on`: `PHPFPM_XDEBUG=Off`.

## Wrapping It Up

This project is the end result of weeks/months testing different solutions,
always poking and refactoring while trying to achieve a truly immutable image.

Not to say that this project is _done_, but I believe it is on the right path
to becoming something many developers and companies can build their Docker
deployments on.

Not needing to manage separate containers for PHP/Nginx|Apache, enabling or
disabling Xdebug and many other modules, and configuring PHP with nothing more
than simple environment variables reduces complexity and speeds up development
time.

I would love to hear your feedback on this and would be elated if you would
drop me a line if you decide to implement my images into your workflow.

Until next time, this is Señor PHP Developer Juan Treminio wishing you adios!    
