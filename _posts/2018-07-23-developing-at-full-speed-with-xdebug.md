---
layout: post
categories: [blog]
date: 2018-07-23
title: Developing at Full Speed with Xdebug
description: You won't believe this incredible hack!
slug: developing-at-full-speed-with-xdebug
tags:
  - webdev
  - server
  - php
  - xdebug
  - docker
gh_comment_id: 12
---

##  A quick history

_ed: If you want to jump right to the solution, jump ahead to **[Nginx map](#nginx-map)**._

[Docker](https://github.com/docker/for-mac/issues/2659) [for](https://github.com/docker/for-mac/issues/2707)
[Mac](https://forums.docker.com/t/painfully-slow/32078)
[is](https://spin.atomicobject.com/2017/06/20/docker-mac-overcoming-slow-volumes/)
[very](https://medium.com/@TomKeur/how-get-better-disk-performance-in-docker-for-mac-2ba1244b5b70)
[slow](https://medium.freecodecamp.org/speed-up-file-access-in-docker-for-mac-fbeee65d0ee7).

It is so slow that I purchased a new Dell XPS laptop and for the first time in 6 years am now using a non-MacOS
(Fedora) machine as my daily driver.

Not everyone has the luxury of switching their OS, though, and they are stuck on slow Docker.

A normal Symfony 2.4 application will commonly see between 400ms-750ms response times in development
mode, _without_ Xdebug installed. If Xdebug is activated response times of 1,200ms+ can frustrate even the
most devoted Xdebug fan.

Before switching to Fedora I tried everything I could to minimize Xdebug's impact on performance.
[I have been using Xdebug for several years](2012-07-05-xdebug-and-you-why-you-should-be-using-a-real-debugger.md)
and while I always felt the benefits of Xdebug far out-weighed the extra slowness, I knew there had to be a
better way.

##  How Xdebug decides to run

There are several ways of enabling Xdebug for a specific session. The more popular ways are using cookies,
like those generated by [PhpStorms bookmarklets](https://www.jetbrains.com/phpstorm/marklets/). You can
also kick Xdebug off via CLI to debug command line scripts without a web portion.

All methods share the same requirement: Xdebug must be installed and loaded on the system to work.

The all also let the PHP layer of your application decide whether to enable Xdebug for the current session.

If you take a look at PhpStorm's bookmarklets, the code is actually quite simple:

```javascript
javascript:(/** @version 0.5.2 */function() {document.cookie='XDEBUG_SESSION='+'xdebug'+';path=/;';})()
```

It simply sets a cookie named `XDEBUG_SESSION` and sets a value to it. By default PhpStorm wants to
use... `phpstorm`, but I always set it to `xdebug` as above.

Knowing this,would it be possible to move the decision one layer above, out of PHP's hands? Instead of PHP
reading for the `XDEBUG_SESSION` cookie and acting on it, do it somewhere else.

##  Docker configuration

A normal Docker PHP application looks like:

- 1 webserver like Nginx
- 1 PHP container with Xdebug installed

The problem so far has been that the PHP side of things is slowing everything down, due to Xdebug being
installed.

What if instead of the above, we had:

- 1 webserver like Nginx
- 1 PHP container with Xdebug installed (named `php_xdebug`)
- 1 PHP container without Xdebug installed (named `php`)

The trick here is making the decision to invoke Xdebug before PHP becomes aware that a new request is
being processed. Thankfully, Nginx's `map` can help us tremendously!

##  Nginx map

Nginx maps are quite simple, and what I came up with to handle the Xdebug cookie requirement is this:

```nginx
map $cookie_XDEBUG_SESSION $my_fastcgi_pass {
    default php;
    xdebug php_xdebug;
}
```

In PHP the above would look like this:

```php
<?php

switch ($cookie_XDEBUG_SESSION) {
    case 'xdebug':
        $my_fastcgi_pass = 'php_xdebug';
        break;
    default:
        $my_fastcgi_pass = 'php';
}
```

`$cookie_XDEBUG_SESSION` is the cookie set by PhpStorm's bookmarklet, and `$my_fastcgi_pass`
is the server Nginx will use for this request.

A full Symfony 3 Nginx config would look like this:

```nginx
# default Docker DNS server
resolver 127.0.0.11;

map $cookie_XDEBUG_SESSION $my_fastcgi_pass {
    default php;
    xdebug php_xdebug;
}

server {
    listen *:8080 default_server;

    server_name _;
    root /var/www/public;

    autoindex off;

    location / {
        try_files $uri /app.php$is_args$args;
    }

    location ~ ^/(app_dev|config)\.php(/|$) {
        set $path_info $fastcgi_path_info;

        fastcgi_pass $my_fastcgi_pass:9000;
        fastcgi_split_path_info ^(.+\.php)(/.*)$;

        include fastcgi_params;

        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
        fastcgi_param DOCUMENT_ROOT $realpath_root;
    }

    location ~ ^/app\.php(/|$) {
        set $path_info $fastcgi_path_info;

        fastcgi_pass php:9000;
        fastcgi_split_path_info ^(.+\.php)(/.*)$;

        include fastcgi_params;

        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
        fastcgi_param DOCUMENT_ROOT $realpath_root;

        internal;
    }

    location ~ \.php$ {
        return 404;
    }
}
```

You can see how we're actually using the result of the map at `fastcgi_pass $my_fastcgi_pass:9000;`.

The Nginx part is simple, but critical. Nginx reads the cookie and sends traffic either to the `php` server
or the `php_xdebug` server. There is nothing magical about this, and PHP is not aware that a request
is being made until Nginx has made the decision to route the request to its server. The other server
would remain blissfully unaware of the request.

##  Good solution or hacky workaround?

Your normal workflow with Xdebug would look like this:

- You enable the Xdebug cookie in your browser
- You create a breakpoint and enable the listener in your IDE
- You load the page in your browser, Xdebug and your IDE connect and stop at the breakpoint defined.

With my Nginx map solution, your workflow _remains exactly the same_. It does _not_ change!

_But_, instead of Xdebug slowing down every single request, whether you have set a breakpoint or not,
_whenever you do not have the `XDEBUG_SESSION` cookie enabled, you are hitting the non-Xdebug
server!_ In real-world testing this means that the majority of my requests are now routed directly to the
PHP server that does not have Xdebug installed.

On my MacBook Pro requests see a normal response time of sub-500ms. This is still not great
(because, Docker), but is worlds better than _every single request_ being 1,000ms+!

When I _do_ want to enable debugging, I set my breakpoint, enable the `XDEBUG_SESSION` cookie
by using PhpStorm's bookmarklets, and Nginx routes my request to the PHP server with Xdebug installed.

When this happens, I have a breakpoint enabled and will be looking at my IDE, so response times do not
matter at all. The biggest (and only) painpoint that Xdebug introduces is completely eliminated.

##  What took so long?

Until 6 months ago I was using Vagrant virtual machines for all my development. My FOSS
[PuPHPet](https://puphpet.com) is evidence that I was all-in on VMs.

However, since completely making the switch to Docker containers, my workflow has changed
for the better, even with the slowness Docker for Mac shows.

Docker containers have the benefit of being incredibly light-weight compared to virtual machines,
and this makes spinning up two PHP containers for each of my projects completely feasible.

This solution would have been much heavier on virtual machines. On containers it is easier,
simpler and faster.

##  Downsides

I have not found any downsides to this technique. If you use file-based sessions (why?) then
you'll have to share the volumes between the PHP containers.

##  Test it out

If you want to try this out in a real-world project, and are not familiar enough with Docker to do
so quickly, then you can clone my new [FOSS Dashtainer repo](https://github.com/jtreminio/dashtainer)
and run the `bin/init` script to get you up and running in a single step.

On a very related note, if you want to get started with Docker but need some help for the initial
hurdles, my [FOSS Dashtainer](https://dashtainer.com) is the successor to my other
[FOSS PuPHPet](https://puphpet.com) and is aimed at developers who need an introduction to
the strange new world of containers.

_edit_: I have created a barebones repo for you to test this out. Clone my [jtreminio/blog](https://github.com/jtreminio/blog) repo and run `init` inside the `developing-at-full-speed-with-xdebug` directory.

##  Bonus: Identical configurations in Windows, MacOS and Linux

Docker has a special hostname, `host.docker.internal` that points to the host machine. Unfortunately this only works on Windows and MacOS, Docker on Linux does not have this feature.

This makes setting the `xdebug.remote_host` value in the PHP INI annoying becuase not all of your team can simply spin up your Docker container and have Xdebug connect back to the host automatically if they are not on Linux.

There is `xdebug.remote_connect_back` which does just that, though, except it has always been a double-edged sword because it would attempt to connect back for every single request. My solution above resolves this completely!

Simply set `xdebug.remote_connect_back=1` in your INI and Xdebug will connect back to your IDE everytime you enabled the session using PhpStorm's bookmarklets.

##  Wrapping it up

With this small technique you gain the ability to develop at full speed without sacrificing modern
tools like the incredible Xdebug. Usually with these sorts of things there's also some downside,
but all I see is positives.

Until next time, this is Señor PHP Developer Juan Treminio wishing you adios!