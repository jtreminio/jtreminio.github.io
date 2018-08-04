---
date: 2012-10-02
title: Composer Namespaces in 5 Minutes
description: The best thing in recent years
slug: composer-namespaces-in-5-minutes
aliases: /2012/10/composer-namespaces-in-5-minutes
tags:
    - webdev
    - tutorial
    - server
    - php
    - composer
---

You’ve heard of [Composer](http://getcomposer.org/), right? The nifty new tool for
PHP that aims to centralize and streamline package management?

Do you also know of, but don’t really understand how namespaces work in PHP?

Then let’s set you straight! In 5 minutes you’ll learn how Composer’s autoloader and
namespaces work!

Ready? Go!

## Setup Composer and Download Packages

Download composer to your server:

```bash
$ curl -s https://getcomposer.org/installer | php
```

Create a simple `composer.json` file and add some packages to it. Packages can be
found at [packagist.org](http://packagist.org/):

```json
{
    "require": {
        "symfony/validator":         "2.1.*",
        "doctrine/dbal":             "2.2.*",
        "monolog/monolog":           "dev-master",
        "jtreminio/test-extensions": "dev-master"
    },
    "minimum-stability": "dev"
}
```

Run install, which will make composer setup initial environment and download
requested packages:

```bash
$ ./composer.phar install
```

## What’s Been Created

You’ll now have a `composer.json`, `composer.lock` and `composer.phar` file, as well
as a `vendor` folder which contains:

```bash
vendor/composer
vendor/jtreminio
vendor/symfony
vendor/autoload.php
```

The `vendor/autoload.php` file is basically a fake loader (it calls
`vendor/composer/autoload_real.php` – that’s about as fake as you can get!). Ignore
it.

Inside `vendor/bin` is the PHPUnit bin (YOU’RE TESTING, RIGHT???). They were created
by the `phpunit/PHPUnit` package that the `jtreminio/test-extensions` package
requires. Ignore it.

## The autoload_namespaces.php file

Now, open up `vendor/composer/autoload_namespaces.php` and you’ll see:

```php
<?php
// ...

    return array(
        'jtreminio\\TestExtensions'     => $vendorDir . '/jtreminio/test-extensions/src/',
        'Symfony\\Component\\Validator' => $vendorDir . '/symfony/validator/',
        'Symfony\\Component\\Finder\\'  => $vendorDir . '/symfony/finder/',
        'Monolog'                       => $vendorDir . '/monolog/monolog/src/',
        'Doctrine\\DBAL'                => $vendorDir . '/doctrine/dbal/lib/',
        'Doctrine\\Common'              => $vendorDir . '/doctrine/common/lib/',
    );
```

These are your available namespaces. For all intents and purposes these are the
namespaces your application can use (if this is the only autoloader you’re using).
If the namespace is not listed in here, you can’t autoload that class.

The double backslash is for escaping purposes – composer inserts double backspaces
so it won’t escape an apostrophe. It can manually be changed to a single backspace,
but Don’t Do That. Never edit any files inside the vendor folder.

If you remove or add any namespaces manually, the next time you run
`./composer.phar update` all your changes will be thrown out the window. These
namespaces are set via the `composer.json` file. You can also define custom
namespaces, which I will show you at the end of this article.

## Hurry it up!

Ok it’s been, what, 3 minutes? I guess I only have 2 minutes to explain namespaces now!

Here it is: your app’s `index.php` file (or whatever) needs to require the
`vendor/autoload.php` file:

```php
<?php
// ...

require_once __DIR__.'/vendor/autoload.php';
```

And now you can call any namespace identified by composer!

```php
<?php
// ...

$foo = new \Monolog\Logger('foo');
```

## 1 minute 30 seconds!

What’s the magic?

In `vendor/composer/autoload_namespaces.php`:

```php
<?php
// ...

return array(
    'jtreminio\\TestExtensions'     => $vendorDir . '/jtreminio/test-extensions/src/',
    'Symfony\\Component\\Validator' => $vendorDir . '/symfony/validator/',
    'Symfony\\Component\\Finder\\'  => $vendorDir . '/symfony/finder/',
    'Monolog'                       => $vendorDir . '/monolog/monolog/src/',
    'Doctrine\\DBAL'                => $vendorDir . '/doctrine/dbal/lib/',
    'Doctrine\\Common'              => $vendorDir . '/doctrine/common/lib/',
);
```

Looking at this specific line: `'Monolog' => $vendorDir . '/monolog/monolog/src/',`

`Monolog` is the namespace, and `$vendorDir . '/monolog/monolog/src/'` is where this
namespace can be found. All a namespace is in this instance is a folder name. Check
your folder directory. The `Logger()` class is found in
`vendor/monolog/monolog/src/Monolog/Logger.php`

`vendor/monolog/monolog/src/` is the path to the namespace, `Monolog` is the base
namespace, and `Logger.php` contains the Logger class.

What about the other namespaces?

```php
<?php
// \TestExtensions\TestExtensions

// PHP Code
$bar = new \jtreminio\TestExtensions\TestExtensions();

// Namespace Identifier
'jtreminio\\TestExtensions' => $vendorDir . '/jtreminio/test-extensions/src/',

// Maps to
vendor/jtreminio/test-extensions/src/jtreminio/TestExtensions/TestExtensions.php
```

```php
<?php
// \Symfony\Component\Validator

// PHP Code
$baz = new \Symfony\Component\Validator\Validator();

// Namespace Identifier
'Symfony\\Component\\Validator' => $vendorDir . '/symfony/validator/',

// Maps to
vendor/symfony/validator/Symfony/Component/Validator/Validator.php
```

Holy shit this is simple

```php
<?php
// \Symfony\Component\Finder

// PHP Code
$qux = new \Symfony\Component\Finder\Finder();

// Namespace Identifier
'Symfony\\Component\\Finder\\' => $vendorDir . '/symfony/finder/',

// Maps to
vendor/symfony/finder/Symfony/Component/Finder.php
```

```php
<?php
// \Doctrine\DBAL

// PHP Code
$qwe = new \Doctrine\DBAL\Connection();

// Namespace Identifier
'Doctrine\\DBAL' => $vendorDir . '/doctrine/dbal/lib/',

// Maps to
vendor/doctrine/dbal/lib/Doctrine/DBAL/Connection.php

// * Won’t actually run because classes are either abstract
//   or require constructor arguments.
```

Got it? Good! Because that’s 5 minutes.

## Bonus Round: Custom Namespaces

So you’ve been contracted to write the next Facebook for ponies? You’re getting 10%
of all future profit?! JAWESOME!

It needs a name! Let’s call it … `Brony`. Just roll with it.

Your app’s namespace should be `Brony`. It’s safe to use because I swear to God no
one has had the guts to name their application `Brony` before you.

Open up the `composer.json` file and make it look like this:

```json
{
    "require": {
        "symfony/validator":         "2.1.*",
        "doctrine/dbal":             "2.2.*",
        "monolog/monolog":           "dev-master",
        "jtreminio/test-extensions": "dev-master"
    },
    "minimum-stability": "dev",
    "autoload": {
        "psr-0": {
            "Brony":        "src/",
            "Brony\\Tests": "tests/",
        }
    }
}
```

Run `./composer.phar update` and checkout `vendor/composer/autoload_namespaces.php`.
You should see these two lines somewhere in that array:

```php
<?php
// ...

    'Brony\\Tests' => $baseDir . '/tests/',
    'Brony'        => $baseDir . '/src/',
```

That’s it, brother. Your own custom namespace about emotionally disturbed ponies.
Your final application structure
would look like this:

```bash
/src/     // The "Brony" namespace
/vendor/  // Contains all composer packages
/tests/   // The "Brony/Tests" namespace
index.php // Calls the autoloader
```

Have fun out there!
