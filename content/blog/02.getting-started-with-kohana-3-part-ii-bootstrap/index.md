---
date: 2012-03-23
title: "Getting Started with Kohana 3, Part II – Bootstrap"
description: A popular framework tutorial
slug: getting-started-with-kohana-3-part-ii-bootstrap
aliases: /2012/03/getting-started-with-kohana-3-part-ii-bootstrap
tags:
    - webdev
    - kohana
    - tutorial
    - server
---

{{% notice yellow %}}
I am no longer using Kohana in any of my personal or professional
projects. I have moved to a better, more modular framework in Silex, which I will
be writing about shortly. This series has been permanently discontinued.
{{% /notice %}}

{{% notice blue %}}
This is Part II of a multi-part series. Below are the links to other
parts of this tutorial!

* [Getting Started with Kohana 3, Part I – Initial Setup](/blog/getting-started-with-kohana-3-part-i)
* [Getting Started with Kohana 3, Part III – Controller/MVVM/KOstache](/blog/getting-started-with-kohana-3-part-iii-controller-mvvm-kostache)
{{% /notice %}}

In my
[Getting Started with Kohana 3, Part I – Initial Setup](/blog/getting-started-with-kohana-3-part-i),
I walked you through the bare minimum to getting Kohana up and running on your local
server. In this part II, I’ll take you through editing your bootstrap file and
setting up your default router.

I’ve put all the code up on my GitHub account at
[jtreminio/Kohana-3-Tutorial](https://github.com/jtreminio/Kohana-3-Tutorial). Please
feel free to clone and send it pull requests. I will try to keep each chapter in its
own branch, so you can easily follow along.

## What is the bootstrap

The bootstrap is called on every single request to your Kohana application. In it you
can set several options, such as default language, setting your app’s base URL, turning
the index.php in your URL off/on, as well as choosing what, if any, modules you want
to enable. By default routes are also included in this file.

This important file is located at `application/bootstrap.php`.

## Environment Flag

Open the bootstrap file and change the following:

```php
<?php
// ...

if (isset($_SERVER['KOHANA_ENV']))
{
    Kohana::$environment = constant('Kohana::'.strtoupper($_SERVER['KOHANA_ENV']));
}

Kohana::$environment = isset($_SERVER['KOHANA_ENV'])
    ? constant('Kohana::'.strtoupper($_SERVER['KOHANA_ENV']))
    : Kohana::PRODUCTION;
```

What’s happening here is that we’re automatically setting our environment flag.
Remember the `KOHANA_ENV` variable you set in your virtual hosts file in part I?
It comes into play now. Kohana comes with 4 environments defined out of the box:
`PRODUCTION`, `STAGING`, `TESTING` and `DEVELOPMENT`. You’re welcome to add more
by extending the Core class (more on this in a future article) and adding in
your own constant.

You can easily switch between flags by setting up a different virtual host for
each flag (`kohana-tutorial.dev`, `kohana-tutorial.test`, etc), or simply changing
the variable value in your one host.

## Init Flags

We now move on to the `Kohana::init()` settings. These control some rather
important things about your Kohana application. Using the `Kohana::$environment`
value we can automatically disable or enable each one. You can read details about
what options you have available, but for now I’ll simply tell you which values
are best changed.

`base_url` – change this if you have installed Kohana in a subfolder. It’ll
automatically be inserted into all URLs you create using Kohana’s link building
tools.

`index_file` – This shows or hides the index.php part in your URLs, making them
‘prettier’. As a developer you want to be exposed to as much information of your
app as possible, so you want this *on* in a non-prod environment.

`errors` – Should Kohana catch errors in your application and show its’ internal
error_view?

`profile` – This enables or disables the Kohana Profiler module. Disable on prod.

`caching` – This is Kohana’s internal caching to help speed up its
`Kohana::find_file()` method. It is not the same as cache module that’s inside the
modules folder.

Here’s what your `Kohana::init()` should look like:

```php
<?php
// ...

Kohana::init(array(
    'base_url'    => '/',
    'index_file'  => Kohana::$environment === Kohana::PRODUCTION,
    'errors'      => Kohana::$environment !== Kohana::PRODUCTION,
    'profile'     => Kohana::$environment !== Kohana::PRODUCTION,
    'caching'     => Kohana::$environment === Kohana::PRODUCTION,
));
```

## Routes

At the bottom of the bootstrap.php file you’ll see a single route. I have always
been of the opinion that routes do not belong in the bootstrap file – a sufficiently
complex website will have tens, if not hundreds, of routes and they should all be
defined in a separate file.

[Click here to see the official documentation on routing.](http://kohanaframework.org/3.2/guide/kohana/routing)

In this tutorial, I will recommend you move the routes out of the bootstrap and
into their own routes file. Replace the following code in the bootstrap:

```php
<?php
// ...

/**
 * Set the routes. Each route must have a minimum of a name, a URI and a set of
 * defaults for the URI.
 */
Route::set('default', '(<controller>(/<action>(/<id>)))')
    ->defaults(array(
        'controller' => 'welcome',
        'action'     => 'index',
    ));

/**
 * Include separate routes file
 */
require_once APPPATH.'config/routes.php';
```

Create a new file at `application/config/routes.php`, and paste the following:

```php
<?php
// ...

/**************************************************************
 * Default Router
 **************************************************************/
Route::set('default', '(<controller>(/<action>(/<id>)))')
    ->defaults(array(
        'controller' => 'home',
        'action'     => 'index',
    ));
```

You’ll notice that I’ve changed the ‘controller’ value to ‘home’ – if you reload
your app you’ll get a 404 error. This is because we’ve sent the default controller
and action (class and method) to be `Controller_Home::action_index()`. The solution
is to rename `application/classes/controller/welcome.php` to
`application/classes/controller/home.php` and the class to `Controller_Home`. Reload
your page and you’ve got ‘hello, world!’ again!

## Wrapping it up

In this chapter, you want through one of the most important files in the Kohana
stack – the bootstrap. You set some sane values for development and production
environments, as well as moved routes to their own file. We’re slowly deviating away
from the default state of Kohana, which points to one of the strengths of this
framework: the flexibility it offers you to go your own way. Over the coming
chapters you’ll see me move further and further away from the default Kohana
structure and into a more flexible, powerful and modularized framework that’s
still easy to work with.
