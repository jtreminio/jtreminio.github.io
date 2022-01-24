---
layout: post
categories: [blog]
date: 2018-07-31
title: Traefik on Docker for Web Developers
description: With bonus Let's Encrypt SSL!
slug: traefik-on-docker-for-web-developers
redirect_from: /blog/automatic-lets-encrypt-with-traefik-and-docker
tags:
  - webdev
  - docker
  - lets-encrypt
gh_comment_id: 13
---

Over the last 5+ years I have done all my development on local virtual machines 
managed by Vagrant and provisioned by Puppet. I even created a fairly
well-received FOSS called [PuPHPet](https://puphpet.com).

At the end of 2017 I started really looking into containers, and as of January
started working on what will become [PuPHPet's](https://puphpet.com) successor,
[Dashtainer](https://dashtainer.com).

While this is not a post on containers in general, or Dashtainer, the thing I
will talk about fits in perfectly in the container world and is used heavily
in [Dashtainer](https://dashtainer.com).

## Problems with Docker

While Docker is an amazingly useful tool, it does not come without its own set
of problems.

One of the biggest is what I call _Docker port dancing_. In Docker, you can bind
a port on your host to forward to a container.

For example, you can bind port `80` on host to port `80` on a container, so going
to `http://localhost` will automatically forward the request to the container.
In this way you can bind a webserver (`80`), PHP-FPM (`9000`) and MySQL (`3306`)
and very quickly have a complete working environment on your local machine
without having to actually install any of those tools, existing only within
their containers.

If you ever have only a single project, this may be fine, but once you start
spinning up more projects you quickly realize the biggest limitation: you
cannot bind a port on host multiple times.

If port `80` is mapped to `web-server-A` you must choose another port to bind
for `web-server-B` and `web-server-C`. This can quickly get old because you
must remember that `http://localhost` goes to `A`, `http://localhost:81`
goes to`B` and `http://localhost:82` goes to `C`. Of course the actual port
you bind is completely up to you so you can do `8080` or `8000` or any unused
port on your local machine.

On virtual machines this problem does not really occur because you can assign
a static IP address to your servers, and bind it to your system's hosts file
(`/etc/hosts`). Containers are ephemeral by nature and do not normally get
created on your host's network but rather private networks with their own
random IP addresses within special ranges. However, you _must_ edit `/etc/hosts`
for every VM you spin up and the list grows with the number of projects you
handle.

Træfik solves both of these problems, first by removing the need to use ports
in URLs and second by not needing you to edit `/etc/hosts` at all.  

## What is Træfik?

[Træfik](https://traefik.io/) (pronounced _traffic_, spelled _Traefik_ from
now on) is a reverse proxy / load balancer similar to HAProxy or Nginx in
reverse proxy mode.

Simply put, as a reverse proxy it monitors traffic to specified ports
(`80`,`443`) and routes traffic to the proper endpoint.

Traefik includes baked-in support for Docker and you can configure it almost
fully through flags, with no need for config files. It supports hot-loading
and automatically detects changes to environment. Best of all, it supports
Let's Encrypt right out of the box.

Traefik runs as a separate container and this single container can work across
any number of separate projects you want. It works by listening to the Docker
daemon and reacting to `labels` you define for each container.

## Creating a Traefik Container

First create the network Traefik will use:

```bash
docker network create --driver bridge traefik_webgateway
```

Then create the actual Traefik container:

```bash
docker container run -d --name traefik_proxy \
    --network traefik_webgateway \
    -p 80:80 \
    -p 8080:8080 \
    --restart always \
    --volume /var/run/docker.sock:/var/run/docker.sock \
    --volume /dev/null:/traefik.toml \
    traefik --api --docker
```

With the above we,

* tell Traefik to watch to a specific network (`--network traefik_webgateway`)
    for new containers. Any containers attached to this network can be monitored
    by Traefik.
* tell Traefik to attach itself to the Docker daemon
    (`--volume /var/run/docker.sock:/var/run/docker.sock`). This is what
    allows Traefik to listen to the above network and read other containers'
    labels.
* decline the use of a config file (`--volume /dev/null:/traefik.toml`) to
    highlight Traefik's ability to be completely configured via arguments.
* bind host's ports `80` and `8080` (`-p 80:80` and `-p 8080:8080`) to Traefik.
* enable the Traefik GUI dashboard (`--api`)

## How Traefik Solves the Port Dance

Traefik can automatically pick up any containers that use the
`traefik_webgateway` network and reads labels applied.

For example, to spin up a new Nginx container you could do something like:

```bash
docker run -d --name some-nginx \
    -v ${PWD}:/usr/share/nginx/html:ro \
    --network traefik_webgateway \
    --label traefik.docker.network=traefik_webgateway \
    --label traefik.frontend.rule=Host:some-nginx.localhost \
    --label traefik.port=80 \
    nginx:alpine
```

Here we tell Traefik that this container's hostname is `some-nginx.localhost`
and it receives traffic on port `80`.

If you open [some-nginx.localhost](http://some-nginx.localhost) in Chrome[^1]
you should see the Nginx container responding.

Using hostnames directly without having to append port numbers to them
makes working with Docker containers much easier than having to remember
which port goes with which project and which container.

[^1]: I specify Chrome because as of this writing I believe it is the only
    browser that will always resolve any *.localhost to the loopback interface.
    This means you do not need to touch the `/etc/hosts` file, the hostname
    will work automatically. If you do not want to use Chrome then you must
    install dnsmasq on MacOS or Acrylic on Windows.

## Traefik GUI

Above I mentioned the Traefik GUI dashboard. It listens on port `8080` so
simply open [localhost:8080](http://localhost:8080) and you will see all the
containers Traefik is currently monitoring for changes.

## Non-port 80 Example

Some containers do not listen on port 80 by default. This is fine because you
can forward any traffic on port `80` on the container's hostname to the
specified port.

For example, MailHog's GUI sits on port `8025`. You can run it with:

```bash
docker run -d --name some-mailhog \
    --network traefik_webgateway \
    --label traefik.docker.network=traefik_webgateway \
    --label traefik.frontend.rule=Host:mailhog.localhost \
    --label traefik.port=8025 \
    mailhog/mailhog
```

Even though the container listens to `8025`, opening
[mailhog.localhost](http://mailhog.localhost) will automatically forward
traffic to the proper port.

If you open the Traefik dashboard you will see this new container listed.

When you run `docker container rm -f some-mailhog` it will automatically be
removed.

## Built-in Let's Encrypt Support

Once you are ready to go live with your website configuring Traefik to
automatically request and maintain a valid Let's Encrypt SSL certificate is
fairly easy!

There are some extra arguments you must define but nothing too foreign:

```bash
docker container run -d --name traefik_proxy \
    --network traefik_webgateway \
    -p 80:80 \
    -p 443:443 \
    -p 8080:8080 \
    --restart always \
    --volume /var/run/docker.sock:/var/run/docker.sock \
    --volume /dev/null:/traefik.toml \
    --volume /root/acme.json:/root/acme.json \
    traefik --docker --logLevel=INFO \
        --acme \
        --acme.acmelogging \
        --acme.dnschallenge=false \
        --acme.entrypoint="https" \
        --acme.httpchallenge \
        --acme.httpChallenge.entryPoint="http" \
        --acme.onhostrule=true \
        --acme.storage="/root/acme.json" \
        --acme.email="your-email-here@example.com" \
        --entrypoints="Name:http Address::80 Redirect.EntryPoint:https" \
        --entrypoints="Name:https Address::443 TLS" \
        --defaultentrypoints="http,https"
```

Since we will handle SSL traffic we add `-p 443:443` to the ports list, and since
this is for a live server we remove the dashboard (`--api`).

Let's Encrypt stores its data in files and it requires special permissions before
it will work. Unfortunately this is the only thing you cannot do via only
CLI arguments. You **must** create this file and set permissions properly before
running the above command.

Simply do `touch /root/acme.json && chmod 600 /root/acme.json` and you are all
set.

We redirect all `80` traffic to `443` to encrypt all traffic (as you should
already be doing!). Let's Encrypt cert is generated after it pings
`http://your-website.com/.well-known/acme-challenge` to verify ownership.

Traefik will take care of keeping all certs up to date.

## Explicitly Disable Traefik for Non-HTTP Services

It seems by default Traefik will attempt to generate a Let's Encrypt cert for
all containers, even if the containers are not on the Traefik network.

To prevent Let's Encrypt errors from breaking your build, you _must_ explicitly
disable Traefik on containers that do not need a cert, like a PHP-FPM container.

It is easy enough:

```bash
docker run -d --name php-fpm \
    --network private \
    --label traefik.enable=false \
    your-php/image
```

The above is not required on dev since you will not be generating SSL certs.

## Limitations

Traefik only handles HTTP/HTTPS traffic. It cannot currently handle TCP/UDP.

This means any database containers cannot be aliased to a hostname, and you
will need to do the port dance on these services.

This is an unfortunate limitation, and
[the GitHub issue](https://github.com/containous/traefik/issues/10)
has been open for a while without much movement.

This does _not_ mean your services cannot communicate with each other via normal
Docker hostnames. For example, a service named `php-fpm` on network `foobar`
can still communicate with a service named `mysql` on the same `foobar` network,
using the hostname `mysql`.

You, however, cannot access `mysql` from your host via a GUI like Sequel Pro
or MySQL Administrator. You can either bind a port from host to container,
or use something like Adminer.

## Via docker-compose.yml

If you prefer to try this out using Docker-Compose, create the following 3 files:

```ini
; traefik/.env
COMPOSE_PROJECT_NAME=traefik
```

```yaml
# traefik/docker-compose.yml
version: '3.2'

services:
  proxy:
    image: traefik
    command: --api --docker --docker.domain=docker.localhost --logLevel=DEBUG
    networks:
      - webgateway
    ports:
      - "80:80"
      - "8080:8080"
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
      - /dev/null:/traefik.toml

networks:
  webgateway:
    driver: bridge
```


```yaml
# app/docker-compose.yml
version: '3.2'

networks:
  private:
  public:
    external:
      name: traefik_webgateway
services:
  nginx:
    image: nginx:alpine
    labels:
      - traefik.backend=nginx
      - traefik.docker.network=traefik_webgateway
      - traefik.frontend.rule=Host:some-nginx.localhost
      - traefik.port=80
    networks:
      - private
      - public
  mailhog:
    image: mailhog/mailhog
    labels:
      - traefik.backend=mailhog
      - traefik.docker.network=traefik_webgateway
      - traefik.frontend.rule=Host:mailhog.localhost
      - traefik.port=8025
    networks:
      - private
      - public
```

Run `docker-compose up -d` in the `traefik` directory, then the `app` directory.

## Shameless Plug

If you are new to the world of containers, I have created a FOSS called
[Dashtainer](https://dashtainer.com) to help you quickly generate and run
containers tailored to your app's requirements.

If you give it a go, I would love to hear from you!

## Wrapping it up

Docker has brought containers to the mainstream, but little gotchas like port
dancing can be frustrating to new users. Hopefully with this small tutorial
you are able to get up and running and get back to developing your
_Make the World a Better Place_ app.

Until next time, this is Señor PHP Developer Juan Treminio wishing you adios!
