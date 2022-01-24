---
layout: post
categories: [blog]
date: 2018-11-15
title: Docker PHP/PHP-FPM Configuration via Environment Variables
description: PHP Docker Container Image with Full Environment Variable INI Configuration
slug: docker-php-php-fpm-configuration-via-environment-variables
redirect_from:
  - /blog/docker-php-php-fpm-configuration-via-environment-variables/
  - /blog/docker-php/php-fpm-configuration-via-environment-variables/
  - /blog/docker-php/php-fpm-configuration-via-environment-variables
tags:
  - docker
  - php
gh_comment_id: 16
---

_ed: If you want to run the containers right now, jump ahead to
**[How to Use the Images](#how-to-use-the-images)**._

For several months now I have been working on 
[PuPHPet.com's](https://puphpet.com) replacement. It is a Docker-based GUI
functionally similar to PuPHPet.

Docker, like Vagrant, allows sharing directories and files from the host to
the container/VM. Unlike Vagrant, Docker images are easy to create, easy
to share and easy to configure.

One of the most convenient differences is that with Docker containers you can
pass flags to the container which can be used for configuration (if the image
was created with this in mind).

For example, with the [MariaDB image](https://hub.docker.com/_/mariadb/)
you create a new container and define the database credentials:

```bash
docker run -it --rm \
    -e MYSQL_DATABASE=dbname \
    -e MYSQL_USER=dbuser \
    -e MYSQL_PASSWORD=dbpassword \
    mariadb
```

This creates a new MariaDB container with a database named `dbname`,
user `dbuser` and password `dbpassword`. You do not need to create a separate
configuration file, the above takes care of that for you!

What if we could do the same for a PHP container? Having to keep track of a
separate INI file for both PHP and PHP-FPM is not nearly as smooth as how
MariaDB's image can be configured.

## Our Goals

I will talk you through the thought process required for creating a Docker
image that is capable of configuring its service using environment variable
flags:

```bash
-e {ENV_NAME}={ENV_VALUE}
```

I will detail the gotchas you would encounter trying to create this for
yourself from scratch, and the solutions I came up with and implemented.

## Quick Introduction to Docker Images

It will definitely help if you know Docker at a usable level. If you know 
Docker enough to only run pre-built images then I hope this will help solidify
your understanding of how Docker works.

That said I am not an expert in the internal workings of Docker, and I might
get some things wrong.

Docker _images_ are blueprints for Docker _containers_. You need an image
to run one or more instances which are known as containers.

An image can be grabbed from the [Docker Hub](https://hub.docker.com) or you
can easily create your own images by writing a _Dockerfile_. This is a simple
text file that contains instructions for creating your image.

Unless you are doing some hardcore stuff, you always start with an existing
base image. For example, `FROM ubuntu:18.04` means we will start with an Ubuntu
18.04 image to create our final image.

You can have as many layers as you want, with each new image extending the
parent and adding more functionality. That is exactly what we will end up doing
today.

## PHP INI with Environment Variables (env vars)

A little-known fact is that PHP's INI file (and PHP-FPM conf, too!) can be
configured normally,

```bash
display_errors=0
error_reporting=Off
date.timezone=UTC
```

but it can also read env vars!

```bash
display_errors=${DISPLAY_ERRORS}
error_reporting=${ERROR_REPORTING}
date.timezone=${DATE_TIMEZONE}
```

PHP-FPM can also be configured this way:

```bash
pm = ${FPM_PM}
pm.max_children = ${FPM_PM_MAX_CHILDREN}
pm.start_servers = ${FPM_PM_START_SERVICE}
```

Since we can pass environment variable values when spinning up a Docker
container, this can be combined to remove the need for maintaining a
separate php.ini file in your project's repo!

### Caveats

A few things to keep in mind:

* You need to be explicit about which settings you want to allow env vars for.
    This means you can only use env vars if you have set the INI value to read
    from an env var (`display_errors=${DISPLAY_ERRORS}`)!
* If an env var is not set, the value will be empty. This means you must either
    set a default value when creating the initial INI file (not always desired),
    or the INI value must allow empty values.
* Bash has a default value fallback when working with variables. It looks like
    `FOO=${BAR:-"default value"}`. While this would have been great for our use
    case, INI files are _not_ processed as Bash and thus the default value
    trick does not work here.

The first point means you cannot use just any Docker image, it must have been
built with env vars in mind from the start. A quick search on the Docker Hub
does not bring up many results for this - just about all major PHP Docker
images require managing the PHP INI file directly.

The second point hurts us a little bit because some INI settings simply cannot
have empty values. For example, you cannot have an `extension=`. PHP will
complain.

In FPM if you have `slowlog=` FPM will crash immediately. Unfortunately some
INI settings are not amenable to env vars unless you enforce a value for them.

The final point is a minor inconvenience. You cannot define a setting with an
inline env var in the same line. You have to do this process separately.

This means you cannot simply have your INI file look like:

```bash
display_errors=${DISPLAY_ERRORS:-"Off"}
error_reporting=${ERROR_REPORTING:-0}
date.timezone=${DATE_TIMEZONE:-"UTC"}
```

This would have been great but since it is strictly a Bashism it does not work
within the PHP INI parser.

This forces you to keep a separate list of env vars and their values, and a
separate list of INI settings calling the env vars.

We will go through these points in more detail later on.

## Building Docker Image with Env Vars

Adding an env var to a Docker image within a Dockerfile is simple enough:

```dockerfile
FROM ubuntu:18.04

ENV allow_url_fopen=1
```

Now all containers that use this image and all images that extend this image,
would have the env var `allow_url_fopen` available to them.

To change this value when spinning up a container you would simply do

```bash
docker container run -it --rm \
    -e allow_url_fopen=0 \
    {image_name}
```

and in the php.ini using

```ini
allow_url_fopen=${allow_url_fopen}
```

would allow us to change the setting on the fly without having to further edit
a static INI file.

My end goal was not to have just one or two settings available for changing,
I want developers to take my images and plug them into their projects and
configure as much as possible only through env vars. This means I needed to add
as many INI settings as I can.

This leads to a problem. Dockerfile cannot read and grab env vars from a
separate file. _You have to define all env vars in the Dockerfile_ to be able
to use them in child images or containers.

In a docker-compose file you can simply use `env_file` like so:

```yaml
services:
  my_special_service:
    image: something
    env_file:
      - env-file.env
```

If you are spinning up a container from an existing image you can likewise do

```bash
docker container run \
    --env-file=${PWD}/env-file.env \
    [..]
```

However, you cannot do the same when _building_ a new image. There is no
`ENV_FILE` in a Dockerfile - you have to list each env var one by one!

The problem is more obvious when I tell you I identified over 650 PHP INI
settings I wanted to set as env vars. Then realize I want to support all active
versions of PHP (5.6, 7.0, 7.1, 7.2, 7.3) and that means each of the four
Dockerfiles now need to have 650+ lines just for the env vars.

If Dockerfile supports an `ENV_VAR` directive this would be a single-line
solution. Since it does not, I needed to come up with some other way to add
these hundreds of env vars, without junking up my Dockerfiles.

### Create a Parent Image

The solution turned out to be quite simple! Since each Dockerfile extends a
parent image (via `FROM`), and everything available to that base image is
available to the current Dockerfile, I created a Dockerfile that does nothing
but define all the INI env vars my PHP images will be able to use.

[You can see it here.](https://github.com/jtreminio/php-docker/blob/master/Dockerfile-env)

For settings that have no default value, and can remain blank, I did

```ini
PHP.allow_url_include=
```

For settings that ship with default values, I did

```ini
PHP.allow_url_fopen=1
```

{% blockquote info %}
> Notice that I namespaced all my variables. The actual variable name is
> `PHP.allow_url_fopen` and so the INI file must reference this as
> `allow_url_fopen=${PHP.allow_url_fopen}`. This simply helps avoid naming
> collisions. You might also know that in Bash all variable names must only
> contain alphanumeric or `_` characters. The `.` in `PHP.allow_url_fopen` makes
> this an invalid variable name in Bash.
> 
> Thankfully we are not reading these values in Bash, we are reading them in a
> PHP INI/FPM config file so the variable names are perfectly valid.
{% endblockquote %}

### Child Images

Now that I have created an image that defines all the INI settings I want to
expose to env vars, I can create child images that can reference the env vars
in their php.ini files!

[You can see the INI file that all my images inject here.](https://github.com/jtreminio/php-docker/blob/master/files/php.ini)

Any image that extends the previous image can use the defined env vars.

The following slice of php.ini:

```ini
allow_url_fopen = ${PHP.allow_url_fopen}
allow_url_include = ${PHP.allow_url_include}
always_populate_raw_post_data = ${PHP.always_populate_raw_post_data}
```

is read as the following by the PHP engine:

```ini
allow_url_fopen = 1
allow_url_include =
always_populate_raw_post_data =
```

Blank values are perfectly acceptable for these settings.

Likewise, in [the PHP-FPM config file](https://github.com/jtreminio/php-docker/blob/master/files/fpm.conf)
we have:

```ini
pm = ${FPM.pm}
pm.max_children = ${FPM.pm.max_children}
pm.start_servers = ${FPM.pm.start_servers}
```

which is read as

```ini
pm = dynamic
pm.max_children = 5
pm.start_servers = 2
```

I deliberately chose not to add all possible settings. Like I mentioned earlier,
FPM's `slowlog` setting _must_ have a value. If it is blank FPM immediately dies
with a segfault. Settings like this where developers may not always want to have
but cannot leave blank are not friendly to the env var method.

## Removing CMD from Dockerfile

One thing I ran into was that the service defined via Dockerfile's `CMD` will
not receive updated env var values!

For example, in my 
[PHP images I would have PHP-FPM service handled via `CMD`](https://github.com/jtreminio/php-docker/commit/05c6a32e023e4095081620a6493c6da4a2823ce5)
and this service would pick up env var values as set at that point. If the
Dockerfile had `ENV FPM.pm=dynamic` that is what the `CMD` service would use,
even if you later changed the env var value.

The list of possible solutions included having the `CMD` reload the current
env vars, or starting a new session, or any number of hacky things just to get
around this limitation.

What I ended up doing was simply removing `CMD` from my Dockerfiles. Now the
PHP images are truly open between being used for CLI or FPM! You simply call
the PHP-FPM service when spinning up the container.

## How to Use the Images

It is simple enough to use these images.

For the default INI values:

```bash
$ docker container run --rm \
    jtreminio/php:7.2 php -i | grep error_reporting
195:error_reporting => 0 => 0
```

To override the defaults:

```bash
$ docker container run --rm \
    -e PHP.error_reporting=-1 \
    jtreminio/php:7.2 php -i | grep error_reporting
195:error_reporting => -1 => -1
```

You can just as easily override multiple settings:

```bash
$ docker container run --rm \
    -e PHP.error_reporting=-1 \
    -e PHP.display_errors=On \
    -e "PHP.date.timezone=America/Chicago" \
    jtreminio/php:7.2 php -i | \
        egrep 'error_reporting|display_errors|date.timezone'
display_errors => STDOUT => STDOUT
error_reporting => -1 => -1
date.timezone => America/Chicago => America/Chicago
```

To run PHP-FPM you just call the service:

```bash
$ docker container run --rm \
    -e PHP.error_reporting=-1 \
    -e PHP.display_errors=On \
    -e "PHP.date.timezone=America/Chicago" \
    jtreminio/php:7.2 /usr/bin/php-fpm
[15-Nov-2018 23:32:39] NOTICE: fpm is running, pid 9
[15-Nov-2018 23:32:39] NOTICE: ready to handle connections
[15-Nov-2018 23:32:39] NOTICE: systemd monitor interval set to 10000ms
```

You can test if PHP-FPM is reading env vars as well by doing:

```bash
$ docker container run --rm \
  -e PHP.error_reporting=-1 \
  -e PHP.display_errors=On \
  -e "PHP.date.timezone=America/Chicago" \
  -e FPM.pm=foobar \
  jtreminio/php:7.2 /usr/bin/php-fpm
[15-Nov-2018 23:33:08] ERROR: [/etc/php/7.2/fpm/php-fpm.conf:14] unable to parse value for entry 'pm': invalid process manager (static, dynamic or ondemand)
[15-Nov-2018 23:33:08] ERROR: failed to load configuration file '/etc/php/7.2/fpm/php-fpm.conf'
[15-Nov-2018 23:33:08] ERROR: FPM initialization failed
```

## Wrapping It Up

Not all services are amenable to configuration by environment variables, which
is a shame. Tools like Nginx require special modules (Lua) for this
functionality.

The PHP core team was forward-thinking enough to have added support for
env vars long ago, and we get to enjoy its benefits.

Some future nice-to-haves would include default values, but for now this works
pretty well.

Having to manage less files to run your Docker containers is a win in my book.

If you see some INI settings that you think should be included,
[please submit a PR to the repo](https://github.com/jtreminio/php-docker).

Until next time, this is Señor PHP Developer Juan Treminio wishing you adios!
