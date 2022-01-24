---
layout: post
categories: [blog]
date: 2012-03-14
title: "Getting Started with Kohana 3, Part I – Initial Setup"
description: A popular framework tutorial
slug: getting-started-with-kohana-3-part-i
redirect_from:
  - /2012/03/getting-started-with-kohana-3-part-i
  - /2012/03/getting-started-with-kohana-3-part-i/
tags:
  - webdev
  - kohana
  - tutorial
  - server
---

{% blockquote warning %}
> I am no longer using Kohana in any of my personal or professional
> projects. I have moved to a better, more modular framework in Silex, which I will
> be writing about shortly. This series has been permanently discontinued.
{% endblockquote %}

{% blockquote success %}
> This is Part I of a multi-part series. Below are the links to other parts of this tutorial!
> * Getting Started with Kohana 3, Part I – Initial Setup
> * [Getting Started with Kohana 3, Part II – Bootstrap](2012-03-23-getting-started-with-kohana-3-part-ii-bootstrap.md)
> * [Getting Started with Kohana 3, Part III – Controller/MVVM/KOstache](2012-04-08-getting-started-with-kohana-3-part-iii-controller-mvvm-kostache.md)
{% endblockquote %}

The Kohana Framework started off as a fork of the very popular CodeIgniter Framework.
During the KO 2.x versions, it stayed fairly similar to how CodeIgniter functioned, and
a developer could easily jump from one to the other and feel very familiar. With the
introduction of the Kohana 3.x version, this all changed, as Kohana was completely
rewritten from the ground up. Now, unless you’re a seasoned PHP developer, you may
have difficulty making the jump from other frameworks in Kohana. I have written this
tutorial to be your step-by-step guide into the world of Kohana.

## Who is this for?

This guide will be very low-level and easy to follow, but you must be an experienced
PHP developer. If you have never used a framework before, but have a firm grasp on OO
concepts, some patterns, and best practices, you should be fine. It assumes you have
your local environment set up and are comfortable working with Apache to the extent
of setting up your own virtual hosts.

If you have already started looking into Kohana but are lost, or are not sure what
your next steps should be, I will attempt to take you to the next level by introducing
must-have modules and best practices in both Kohana and MVC (actually, MVVM but we’ll
get to that!) frameworks in general.

## What will you learn?

Following this guide, you will learn how to create a blog from start to finish. Yes,
a stupidly large majority of framework tutorials out there deal with blogs, but on
the upside at least you know exactly what components make up a blog so it will make
it much easier for you to follow along.

I will take you through initial setup of the framework, module installation and
converting Kohana from MVC, where the V(iew) is simply a template that gets passed
information from the C(ontroller), to the MVVM (often mistake as MVVC) design
pattern, where we slim the down the C(ontroller) to basically handle route
requests, and expand the responsibilities of the V(iew)M(odel) and implement
true templates.

You will even learn something most other Kohana tutorials completely skip out on –
HMVC!

By the end of this tutorial, we will have a fully functional, albeit lightweight
blog setup that will hopefully make you comfortable with Kohana as a framework.

## Requirements

I will assume you have PHP 5.3+ (I am running 5.3.10), Apache and MySQL. I will
also be using Xdebug for debugging and PhpStorm as my IDE.

## Why Kohana?

Kohana is not perfect, far from it (there, I said it). In fact, it has some
architectural decisions that may not make perfect sense. Regardless, it’s one of
my favorite frameworks, and I have the privilege of using it both at my full-time
gig and all contract jobs I take on. Each version that is released by the dev team
comes with some great improvements that keep polishing this great framework and
simply makes it much more fun to work with.

## About this tutorial

This tutorial will be made up of several chapters, each being bite-size so you can
easily absorb the information presented (and so I don’t have to write a ton each
time!).

I've put all the code up on my GitHub account at
[jtreminio/Kohana-3-Tutorial](https://github.com/jtreminio/Kohana-3-Tutorial).
Please feel free to clone and send it pull requests. I will try to keep each chapter
in its own branch, so you can easily follow along.

Now that that very long-winded introduction is out of the way, let's get started!

## Download Kohana

Go to [kohanaframework.com](http://www.kohanaframework.com) and download from the
frontpage. As of writing this article, the newest version is 3.2, with 3.3 right
around the corner. As soon as 3.3 is released I will update this tutorial to take
into account all changes that have been made since then.

Download the archive file and extract into your local server directory.

## Setup local host

For this tutorial, we will use the domain
[kohana-tutorial.dev](http://kohana-tutorial.dev). Instructions vary slightly
between OS’s, but the main two steps involve adding the domain into your hosts
file, and setting up a vhost in Apache.

In your hosts file, add `127.0.0.1 kohana-tutorial.dev` and then add the following
into your virtual hosts file:

```apache
<VirtualHost *:80>
    DocumentRoot "/www/kohana_tutorial/public"
    ServerName kohana-tutorial.dev
    ServerAlias *.kohana-tutorial.dev
    SetEnv KOHANA_ENV DEVELOPMENT
</VirtualHost>
```

This information is specific to my setup, but you should be able to easily tell
what’s going on and tailor it to your circumstances.

You must now restart Apache before continuing.

## Move publicly-accessible files &amp; chmod

One of the easiest security precautions you can take to help secure your server is
to move all but the necessary files out of your root directory. You’ll notice
Kohana does not ship with a `/public/` folder, but you’re already on your way to
rectifying this issue.

Create a `public` folder in your webroot. Your base Kohana folder structure should
now look like this:

    application
    modules
    public
    system

Move `index.php`, `install.php` and `example.htaccess` into the `public` folder.
Then, rename `example.htaccess` to `.htaccess` and open up `index.php` to change
the following lines:

```php
<?php
// ...

// $application = 'application';
$application = '../application';
// ...

// $modules = 'modules';
$modules = '../modules';
// ...

// $system = 'system';
$system = '../system';
// ...
```

What you’re doing here is telling Kohana that those three folders are no longer
in the same location as the `index.php` file, but are located one level below,
in a non-publicly accessible location.

The final step is to chmod the `application/cache` and `application/logs` folders
to 777. Kohana requires these folders be writable. In Linux you can simply do
`chmod 777 application/cache application/logs`. I do not believe Windows requires this
step but I think Mac OS X does.

## Test it out

{% image 300px %}
![kohana.install.png](/static/post/2012-03-14-getting-started-with-kohana-3-part-i/kohana.install.png)
{% endimage %}

Restart Apache and go to [kohana-tutorial.dev](http://kohana-tutorial.dev). If
all’s gone well, you should be present with the Kohana Installation page. What is
important is that your server passes all the Environment Tests, as the Optional
Tests are just that. If you do not get a screen full of green, read the error
messages and fix the issue. They’re fairly easy to figure out.

Now, delete the `public/install.php` and reload the page. You should now get the
default hello world, which means you’ve completed the very first, most basic steps
to Getting Started with Kohana!

## Wrapping it up

In this chapter, you have done the initial setup required to get a Kohana
application running on your local web server. As I mentioned in the tutorial
introduction, each chapter will be very lightweight, focusing on one main theme.
Please check back soon for the next chapter, where I will go through the execution
path that is taken from the point that your browser hits the framework to you
getting output on your screen!
