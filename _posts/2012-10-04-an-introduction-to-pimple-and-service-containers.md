---
layout: post
categories: [blog]
date: 2012-10-04
title: An introduction to Pimple and Service Containers
description: Container and service locator
slug: an-introduction-to-pimple-and-service-containers
redirect_from:
  - /2012/10/an-introduction-to-pimple-and-service-containers
  - /2012/10/an-introduction-to-pimple-and-service-containers/
tags:
  - webdev
  - tutorial
  - server
  - php
  - pimple
---

Recently I’ve picked up the [Silex framework](http://silex.sensiolabs.org/) for a
project I’m building. It uses a service container for managing dependencies in your
application, which is great for defining (not instantiating) objects and their default
behaviors in a single location, rather than sprinkled throughout your code in a
multitude of places.

A service container is basically an array (or object) that contains other objects
and sets default behaviors. Silex extends [Pimple](https://github.com/fabpot/Pimple),
which is a tiny and effective container created by the makers of
[Symfony 2](http://symfony.com/). In fact, without comments it’s actually less than
90 lines of code in total.

If only all our projects had this high an effectiveness:LOC ratio!

Using Pimple you can define several hundreds of objects, and then easily instantiate
them using the container object.

## Simple Container

I mention Pimple, simply because it is a popular container used in many different
projects, but the idea of a container is extremely simple to understand, as it’s
really just an array:

```php
<?php
// ...

$container = array();
$container['dateTime'] = new DateTime();
```

{% image 300px %}
![1.png](/static/post/2012-10-04-an-introduction-to-pimple-and-service-containers/1.png)
{% endimage %}

Here you can see that the `dateTime` key in the `$container` array holds an
instantiated `DateTime` object.

You can access this object in this manner:

```php
<?php
// ...

$container = array();
$container['dateTime'] = new DateTime();
$date = $container['dateTime'];

$formatted = $date->format('Y-m-d H:i:s');
```

{% image 300px %}
![2.png](/static/post/2012-10-04-an-introduction-to-pimple-and-service-containers/2.png)
{% endimage %}

Let’s define several more!

```php
<?php
// ...

$container = array();
$container['dateTimeOne'] = new DateTime();
$container['dateTimeTwo'] = new DateTime();
$container['dateTimeThree'] = new DateTime();
$container['dateTimeFour'] = new DateTime();
$container['dateTimeFive'] = new DateTime();
```

{% image 300px %}
![3.png](/static/post/2012-10-04-an-introduction-to-pimple-and-service-containers/3.png)
{% endimage %}

Notice something? By simple defining the keys you’re actually instantiating the
objects and putting them in memory. For something as simple as `DateTime` that’s not
too bad, but what if you’re defining a key to hold a much larger class? One or two
may not be bad, but you’ll typically define several times that many in your
application. That’s far too large an overhead to make this method scaleable or useful!

The solution is anonymous functions. Each container key should actually be an
anonymous function, rather than instantiating an object directly.

Let’s try it out:

```php
<?php
// ...

$container = array();

$container['dateTimeOne'] = function() {
    return new DateTime();
};

$container['dateTimeTwo'] = function() {
    return new DateTime();
};

$container['dateTimeThree'] = function() {
    return new DateTime();
};

$container['dateTimeFour'] = function() {
    return new DateTime();
};

$container['dateTimeFive'] = function() {
    return new DateTime();
};

$date = $container['dateTimeOne'];
```

{% image 300px %}
![7.png](/static/post/2012-10-04-an-introduction-to-pimple-and-service-containers/7.png)
{% endimage %}

Oops. Looks like `$date` is just a `Closure` and not the `DateTime` object we were
expecting! If you try to use `$date` as a `DateTime` object here you’ll get some
dirty looks from PHP.

## Enter the Pimple

The answer to this issue is Pimple. One our end it’s exactly the same as what we’ve
been doing, but there’s a few more gears turning in the background in Pimple’s code.

```php
<?php
// ...

$container = new Pimple();

$container['dateTimeOne'] = function() {
    return new DateTime();
};

$container['dateTimeTwo'] = function() {
    return new DateTime();
};

$container['dateTimeThree'] = function() {
    return new DateTime();
};

$container['dateTimeFour'] = function() {
    return new DateTime();
};

$container['dateTimeFive'] = function() {
    return new DateTime();
};
```

{% image 300px %}
![4.png](/static/post/2012-10-04-an-introduction-to-pimple-and-service-containers/4.png)
{% endimage %}

You now have the same keys defined, but each key does not automatically instantiate
the object within it, it just holds a closure. Using it is just as simple as before:

```php
<?php
// ...

$container = new Pimple();

$container['dateTimeOne'] = function() {
    return new DateTime();
};

$container['dateTimeTwo'] = function() {
    return new DateTime();
};

$container['dateTimeThree'] = function() {
    return new DateTime();
};

$container['dateTimeFour'] = function() {
    return new DateTime();
};

$container['dateTimeFive'] = function() {
    return new DateTime();
};

$date = $container['dateTimeOne'];
$formatted = $date->format('Y-m-d H:i:s');
```

{% image 300px %}
![5.png](/static/post/2012-10-04-an-introduction-to-pimple-and-service-containers/5.png)
{% endimage %}

You still have 5 closures, but can now instantiate an object on demand – just as if
you were using the `new` keyword – and you no longer have 5 `DateTime` objects just
sitting in memory, waiting to be played with.

## Upgrading to a Service Container

Ok, so now you’ve got a working container and you can instantiate objects left and
right. So what, right? It’s basically just a wrapper around the `new` keyword? Well,
not exactly.

You see, each container key is a full function in its own right, meaning that you can
do much more than simply return `new DateTime();`.

When access a database using `PDO`, you must first instantiate a `PDO` object. You can
do all of the setup within the container:

```php
<?php
// ...

$container = new Pimple();

$container['db'] = function() {
    $host = 'localhost';
    $dbName = 'wordpress';
    $user = 'root';
    $pass = '';

    return new \PDO("mysql:host={$host};dbname={$dbName}", $user, $pass);
};
```

Now you have an easily accessible `PDO` object that’s available for immediate use,
only for when you need it.

All a service container boils down to is returning objects that have been instantiated
and configured with pre-determined options.

## But Wait, There’s More!

OK, so you’ve got several services setup (or maybe you don’t). Is that it? You’re
basically replacing using the `new` keyword throughout your code with a call to the
service container. Big deal!

Well, it is a big deal, for a couple of important reasons:

## You can easily override what object is returned from one central location,

instead of hunting throughout your code for all instances of object instantiation.
So, imagine you set up a new service called `dataHandling`:

```php
<?php
// ...

$container = new Pimple();

$container['dataHandling'] = function() {
    //
};
```

What comes to mind when you think of data handling? Usually something like `PDO` that
can save data to a database, or retrieve data.

So you set this `dataHandling` service up and pass it in to whatever objects require
storing features. Simple enough. If your database ever changes settings, you can
simply come back here and change the settings in a single location. That’s nice.

What if later you want to change where your data is being stored or retrieved from?
Say you’ve now got this nifty `Memcache` server and would rather send information
there. You could add another service and change all calls to the `dataHandling`
service you’ve set up in your code. Or, you could simply overwrite what the
`dataHandling` service returns! Have it return a `Memcache` object instead! What
about saving information to the local filesystem? Or to a remote website through
its API?

Once you’re using a service container, big changes like these are made much easier
to implement, all because you have a single place where you’ve defined what the
service actually is.

One thing you’ll quickly realize is that you’ll have to create classes for each
of these services that implement the same interfaces. It would be pointless if your
`dataHandling` service returns a `PDO` object which has methods like `::query()`
or `::exec()` if you change this to `Memcache` which has neither of these methods.

The solution is creating an interface class that has methods like `::save()` and
`::get()`, and then creating wrapper methods for `PDO`, `Memcache`, file handler and
anything else you may want to create.

## It allows for extremely simple mocking

Using the `new` keyword inside a class makes it very difficult to mock this class
for testing, meaning that the instantiated class and any classes it instantiates
will actually run in your tests, possibly introducing a dependency hell so deep
you’ll never get that coveted green bar.

I will soon introduce an in-depth series of unit testing using PHPUnit that will
take you from a complete amateur to writing several great tests that will make
you a better developer overall. Keep an eye on my website!

## Inversion of Control!

While this isn’t strictly about a service container, it enables you to use the
inversion of control pattern, where instead of injecting objects into another via
many different methods, you inject the service container once and then interact
with it directly. There are, of course, downsides to this, with
[many listed here](http://www.martinfowler.com/articles/injection.html#ServiceLocatorVsDependencyInjection).

## Further Reading

For further reading, and to further understand how Pimple can be used, have a look
at the following resources:

[http://pimple.sensiolabs.org/](http://pimple.sensiolabs.org/)

[http://silex.sensiolabs.org/doc/services.html](http://silex.sensiolabs.org/doc/services.html)

To get a better understanding of dependency injection, Fabien Potencier wrote a
very in-depth series of articles explaining what’s what:

[http://fabien.potencier.org/article/11/what-is-dependency-injection](http://fabien.potencier.org/article/11/what-is-dependency-injection)
