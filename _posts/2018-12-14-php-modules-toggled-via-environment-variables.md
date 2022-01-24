---
layout: post
categories: [blog]
date: 2018-12-14
title: PHP Modules Toggled via Environment Variables
description: Bringing Immense Flexibility to PHP Docker Containers
slug: php-modules-toggled-via-environment-variables
tags:
  - docker
  - php
gh_comment_id: 17
---

In my previous post,
[Docker PHP/PHP-FPM Configuration via Environment Variables](2018-11-15-php-container-image-ini-environment-variables.md)
I introduced my new PHP image that uses environment variables to configure its
INI settings.

The `Dockerfile` is a beast, to be sure.
[At over 650 lines](https://github.com/jtreminio/php-docker/blob/master/Dockerfile-env)
it documents my attempt at bringing true flexibility to an immutable PHP image.

With it, you can set any number of PHP INI settings without having to rebuild
your image:

```bash
$ docker container run --rm \
    -e PHP.error_reporting=-1 \
    jtreminio/php:7.2 php -i | \
        grep error_reporting
error_reporting => -1 => -1
```

As part of my aim for immutability, I install all of the available modules in 
[Ondřej Surý's great PHP PPA](https://launchpad.net/~ondrej/+archive/ubuntu/php).

This increases the final Docker image size by quite a bit, but in reality file
size should not be in your list of top concerns. Ease of deployment,
repeatability and speed of spinning up a new instance should top your list.

While my PHP image hit these three spot-on, it did introduce another issue:
loading all the available PHP modules would slow the engine down, or introduce
small incompatibilities and bugs to your code that you were not expecting.

If you are not doing any image work, do you really need to have the GD or
Imagick modules enabled?

More clearly, why have the Redis or Mongodb modules enabled if you ever only
work with MySQL?

## Why Not Use Environment Variables To Load Modules?

The php.ini file included with my PHP images looks like this:

```ini
allow_url_fopen = ${PHP.allow_url_fopen}
allow_url_include = ${PHP.allow_url_include}
```

This works because I have pre-defined all the variables to be used as
environment variables:

```dockerfile
ENV PHP.allow_url_fopen=1 \
    PHP.allow_url_include= \
```

If a user does not pass `PHP.allow_url_fopen` to the Docker image, it defaults
to `1`, and `PHP.allow_url_include` defaults to no value.

I am forced to pre-define values because some INI settings will crash the PHP
engine if left empty. They must have a non-empty value.

Likewise, PHP modules are loaded as:

```ini
extension=redis.so
```

Leaving this setting blank will immediately crash PHP. You cannot simply try to
not load `redis.so` by leaving the setting as `extension=`.

If you decide to break immutability in your Docker images and delete the INI
files that have these `extension=*` lines in them, you may run into other
problems like having to set up an entry-point directive in your Dockerfile to
delete these files on startup, or if you want your PHP-FPM service to have
Redis disabled but may want to use it for PHP-CLI. 

Removing the need to change the container's filesystem was the main purpose
behind going with configuration-by-environment-variables in the first place,
and this implementation only accomplishes half that.

## Meet `PHP_INI_SCAN_DIR`

When compiling PHP you tell it where to find the default `php.ini` file and
you can also define where it should scan for any additional INI files.

In Ondřej Surý's build the additional files path is set to 
`/etc/php/7.2/cli/conf.d` for CLI:

```bash
$ docker container run -it --rm \
    jtreminio/php:7.2 php --ini
Configuration File (php.ini) Path: /etc/php/7.2/cli
Loaded Configuration File:         /etc/php/7.2/cli/php.ini
Scan for additional .ini files in: /etc/php/7.2/cli/conf.d
Additional .ini files parsed:      /etc/php/7.2/cli/conf.d/10-mysqlnd.ini,
/etc/php/7.2/cli/conf.d/10-opcache.ini,
# more lines below
```

A special env var called `PHP_INI_SCAN_DIR` can be used to override this path.

By setting `PHP_INI_SCAN_DIR` to empty you can disable everything:

```bash
$ docker container run -it --rm \
    -e PHP_INI_SCAN_DIR= \
    jtreminio/php:7.2 php --ini
Configuration File (php.ini) Path: /etc/php/7.2/cli
Loaded Configuration File:         /etc/php/7.2/cli/php.ini
Scan for additional .ini files in: (none)
Additional .ini files parsed:      (none)
```

, or change the scan directory completely, whether the directory has INI files
or not:

```bash
$ docker container run -it --rm \
    -e PHP_INI_SCAN_DIR=/foo/bar \
    jtreminio/php:7.2 php --ini
Configuration File (php.ini) Path: /etc/php/7.2/cli
Loaded Configuration File:         /etc/php/7.2/cli/php.ini
Scan for additional .ini files in: /foo/bar
Additional .ini files parsed:      (none)
```

, and add additional scan directories to the default:

```bash
$ docker container run -it --rm \
    -e PHP_INI_SCAN_DIR=:/foo/bar \
    jtreminio/php:7.2 php --ini
Configuration File (php.ini) Path: /etc/php/7.2/cli
Loaded Configuration File:         /etc/php/7.2/cli/php.ini
Scan for additional .ini files in: :/foo/bar
Additional .ini files parsed:      /etc/php/7.2/cli/conf.d/10-mysqlnd.ini,
/etc/php/7.2/cli/conf.d/10-opcache.ini,
# more lines below
```

Finally, `PHP_INI_SCAN_DIR` is powerful enough that you can even define
_multiple_ directories:

```bash
$ docker container run -it --rm \
    -e PHP_INI_SCAN_DIR=:/foo/bar:/baz/bam \
    jtreminio/php:7.2 php --ini
Configuration File (php.ini) Path: /etc/php/7.2/cli
Loaded Configuration File:         /etc/php/7.2/cli/php.ini
Scan for additional .ini files in: :/foo/bar:/baz/bam
Additional .ini files parsed:      /etc/php/7.2/cli/conf.d/10-mysqlnd.ini,
/etc/php/7.2/cli/conf.d/10-opcache.ini,
# more lines below
```

One thing to keep in mind is that `PHP_INI_SCAN_DIR` only works with
directories. There is not a `PHP_INI_SCAN_FILE` equivalent and you cannot use
it to include specific files. It will load all INI files in a defined
directory.

Using `PHP_INI_SCAN_DIR` you can introduce incredible flexibility to your
environment by selectively loading INI files.

## Loading Modules with `PHP_INI_SCAN_DIR`

Since `PHP_INI_SCAN_DIR` loads all INI files in a directory you have to create
separate directories for all your optional modules.

If you install the Redis PHP module, an INI file is automatically created at
`/etc/php/7.2/cli/conf.d/20-redis.ini`. This is convenient if you want to
actually enable this module, but not desired when you are creating a Docker
image with flexibility in mind!

Simply creating another directory within `/conf.d` to hold the INI file will
not work, since `PHP_INI_SCAN_DIR` scans all children. For example, moving it
`/etc/php/7.2/cli/conf.d/redis/redis.ini` will not change anything as it will
still be loaded by default. You must move it outside of the scanned directory.

In my Docker image I chose `/etc/php/extra-mods` as the directory to hold all
optional module's INI files, so the Redis INI would go in
`/etc/php/extra-mods/redis/redis.ini`.

This INI only contains a single line:

```bash
$ docker container run -it --rm \
    jtreminio/php:7.2 cat /etc/php/extra-mods/redis/redis.ini
extension=redis.so
```

If you do not tell PHP to load this file, Redis is not enabled, but you can now
easily enable it with `PHP_INI_SCAN_DIR`:

```bash
$ docker container run -it --rm \
    -e PHP_INI_SCAN_DIR=:/etc/php/extra-mods/redis \
    jtreminio/php:7.2 php --ini
Configuration File (php.ini) Path: /etc/php/7.2/cli
Loaded Configuration File:         /etc/php/7.2/cli/php.ini
Scan for additional .ini files in: :/etc/php/extra-mods/redis
Additional .ini files parsed:      /etc/php/7.2/cli/conf.d/10-mysqlnd.ini,
[...snip...]
/etc/php/extra-mods/redis/redis.ini
```

```bash
$ docker container run -it --rm \
    -e PHP_INI_SCAN_DIR=:/etc/php/extra-mods/redis \
    jtreminio/php:7.2 php -i | grep redis
655:Redis Support => enabled
656:Redis Version => 4.1.1
667:Registered save handlers => files user redis rediscluster
```

My Docker image comes with many modules installed, and with this you can now
enable exactly the ones that you want:

```bash
$ docker container run -it --rm \
    -e PHP_INI_SCAN_DIR=:/etc/php/extra-mods/redis:/etc/php/extra-mods/gd:/etc/php/extra-mods/xdebug:/etc/php/extra-mods/mongodb \
    jtreminio/php:7.2 php --ini
Configuration File (php.ini) Path: /etc/php/7.2/cli
Loaded Configuration File:         /etc/php/7.2/cli/php.ini
Scan for additional .ini files in: :/etc/php/extra-mods/redis:/etc/php/extra-mods/gd:/etc/php/extra-mods/xdebug:/etc/php/extra-mods/mongodb
Additional .ini files parsed:      /etc/php/7.2/cli/conf.d/10-mysqlnd.ini,
[...snip...]
/etc/php/extra-mods/redis/redis.ini,
/etc/php/extra-mods/gd/gd.ini,
/etc/php/extra-mods/xdebug/xdebug.ini,
/etc/php/extra-mods/mongodb/mongodb.ini
```

This is _extremely_ powerful. Enabling modules and changing INI settings can
be done solely through environment variables, without needing to rebuild your
Docker image!

One small nitpick: this line is extremely long and unwieldy:

```bash
PHP_INI_SCAN_DIR=:/etc/php/extra-mods/redis:/etc/php/extra-mods/gd:/etc/php/extra-mods/xdebug:/etc/php/extra-mods/mongodb
```

My images conveniently symlinks the much shorter `/p` to `/etc/php/extra-mods`,
so the above now becomes:

```bash
PHP_INI_SCAN_DIR=:/p/redis:/p/gd:/p/xdebug:/p/mongodb
```

## Bonus: Separate FPM and CLI `PHP_INI_SCAN_DIR` Values

I hope you can already see the possibilities, but let me mention one that may
not be immediately obvious.

You can define `PHP_INI_SCAN_DIR` for PHP-FPM, while also setting it to a
different value for PHP-CLI.

```bash
$ docker container run -it --rm \
    --name testing \
    -e PHP_INI_SCAN_DIR=:/p/redis \
    jtreminio/php:7.2
*** Running /etc/my_init.d/00_regen_ssh_host_keys.sh...
*** Running /etc/my_init.d/10_syslog-ng.init...
Dec 15 05:24:09 a9e40e3240c2 syslog-ng[13]: syslog-ng starting up; version='3.13.2'
*** Booting runit daemon...
*** Runit started as PID 22
Dec 15 05:24:10 a9e40e3240c2 cron[27]: (CRON) INFO (pidfile fd = 3)
Dec 15 05:24:10 a9e40e3240c2 cron[27]: (CRON) INFO (Running @reboot jobs)
[15-Dec-2018 05:24:10] NOTICE: fpm is running, pid 32
[15-Dec-2018 05:24:10] NOTICE: ready to handle connections
[15-Dec-2018 05:24:10] NOTICE: systemd monitor interval set to 10000ms
```

PHP-FPM is now running with Redis enabled. Running any PHP scripts within the
container will also load Redis, even if not through PHP-FPM:

```bash
$ docker container exec \
    testing php -i | grep redis
10:Scan this dir for additional .ini files => :/p/redis
49:/p/redis/redis.ini
653:redis
655:Redis Support => enabled
656:Redis Version => 4.1.1
667:Registered save handlers => files user redis rediscluster 
877:PHP_INI_SCAN_DIR => :/p/redis
1485:$_SERVER['PHP_INI_SCAN_DIR'] => :/p/redis
2101:This program is free software; you can redistribute it and/or modify
```

However, you can also run PHP-CLI with Redis disabled, without having any
effect on the running PHP-FPM instance:

```bash
$ docker container exec \
    -e PHP_INI_SCAN_DIR=/etc/php/7.2/cli/conf.d \
    testing php -i | grep redis
2094:This program is free software; you can redistribute it and/or modify
```

## About the Image Size...

Like I mentioned, my Docker images are not optimized for size. The benefits far
outweigh something as cheap as file size.

Surprisingly, when you compare my images with the official images you will
notices that there is not much difference in size!

```bash
$ docker image ls
REPOSITORY      TAG       IMAGE ID       CREATED        SIZE
jtreminio/php   7.2       9f0102616848   26 hours ago   381MB
php             7.2-fpm   2bd622691e6e   4 days ago     371MB
```

10MB larger size with the benefit of not needing to compile modules, nor having
to maintain a separate php.ini file and instead being able to do all this
through simple environment variables!

A worthy trade-off, in my opinion.

## Want to Try It Out?

[My images are all available on the Docker hub](https://cloud.docker.com/repository/docker/jtreminio/php).

I maintain versions for PHP 7.3 - 5.6.

[You can see all the Dockerfiles used to generate the images in my repo](https://github.com/jtreminio/php-docker).

## Wrapping It Up

I would like to thank [Ondřej Surý](https://deb.sury.org/) for his years-long
work in maintaining amazing PHP, Nginx, Apache (and more!) repos.

I would also like to thank [Derick Rethans](https://derickrethans.nl/) for
letting me bounce ideas off of him. While my final solution may seem easy and
obvious in hind-sight, actually arriving at this point required hours of Derick
being supernaturally patient with me while I massacre his PHP language.

The resulting Docker images accomplish just about everything I had in mind. As
I created, tinkered and optimized them through months of use at work, and asked
the coworkers on my team to also use them.

I hope you may find them as useful and easy to use as we have, and your
productivity to match!

Until next time, this is Señor PHP Developer Juan Treminio wishing you adios!  
