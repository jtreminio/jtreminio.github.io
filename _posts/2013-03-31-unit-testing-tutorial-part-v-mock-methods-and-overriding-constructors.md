---
layout: post
categories: [blog]
date: 2013-03-31
title: "Unit Testing Tutorial Part V: Mock Methods and Overriding Constructors"
description: PHP Unit introduction series
slug: unit-testing-tutorial-part-v-mock-methods-and-overriding-constructors
redirect_from:
  - /blog/unit-testing-tutorial-part-v-mock-methods-and-overriding-constructors/
  - /2013/03/unit-testing-tutorial-part-5-mock-methods-and-overriding-constructors
  - /2013/03/unit-testing-tutorial-part-5-mock-methods-and-overriding-constructors/
  - /blog/unit-testing-tutorial-part-5-mock-methods-and-overriding-constructors
  - /blog/unit-testing-tutorial-part-5-mock-methods-and-overriding-constructors/
tags:
  - webdev
  - tutorial
  - phpunit
  - php
  - testing
gh_comment_id: 10
---

{% blockquote success %}
> This is Part V of a multi-part series. Below are the links to other parts of this
> tutorial!
> * [Unit Testing Tutorial Part I: Introduction to PHPUnit](2013-03-01-unit-testing-tutorial-part-i-introduction-to-phpunit.md)
> * [Unit Testing Tutorial Part II: Assertions, Writing a Useful Test and @dataProvider](2013-03-01-unit-testing-tutorial-part-ii-assertions-writing-a-useful-test-and-dataprovider.md)
> * [Unit Testing Tutorial Part III: Testing Protected/Private Methods, Coverage Reports and CRAP](2013-03-03-unit-testing-tutorial-part-iii-testing-protected-private-methods-coverage-reports-and-crap.md)
> * [Unit Testing Tutorial Part IV: Mock Objects, Stub Methods and Dependency Injection](2013-03-07-unit-testing-tutorial-part-iv-mock-objects-stub-methods-and-dependency-injection.md)
> * Unit Testing Tutorial Part V: Mock Methods and Overriding Constructors
{% endblockquote %}

Previously in my PHPUnit tutorial series, you learned about the very powerful
concept of mock objects and stub methods. This concept is central to successful unit
testing, and once it fully 'clicks' in your head you will start to realize how useful
and simple testing can be.

There is also another thing I want to make clear: creating tests is basically a puzzle
- you simply have to go step by step, making sure all the pieces fit together correctly
so you can get your green. I hope to make clear what I mean by the end of this tutorial.

## INTRODUCING MOCK METHODS

[In my previous tutorial](2013-03-07-unit-testing-tutorial-part-iv-mock-objects-stub-methods-and-dependency-injection.md)
you learned all about mock objects and stub methods. There is another very similar
concept you must also know about: mock methods.

To recap:

### Mock Object

A mock object is an object that you would create using PHPUnit's `getMockBuilder()`
method. It is basically an object that extends the class you define and allows you to
perform nifty tricks and assertions on it.

### Stub Method

A stub method is a method contained within a mock object that returns `null` by
default, but allows you to easily override the return value.

### Mock Method

A mock method is pretty simple - it does the exact same thing its original method
would. In other words any code that is in the method you are mocking will actually
run and will not return `null` by default (unless that is what it originally did).

Mark Nichols gives a very good explanation of what the
[difference between mock and stub methods are](http://marknic.net/2010/01/11/mocks-vs-stubs/).

Basically mock methods are useful for when you *want* the code inside of it to run,
but also want to do some assertions on the behavior of the method. These assertions
could be that specific parameters are passed to the method (if it applies), or that
the method is called exactly 3 times or not at all.

Do not worry if this does not make immediate sense yet.

## THE FOUR PATHWAYS OF GETMOCKBUILDER()

We have already explored ways of using PHPUnit's awesome `getMockBuilder()` API but
did you know there are actually 4 different ways of creating the object? It all
depends on your use, or non-use, of the `setMethods()` method.

To illustrate the differences we will use the code from the previous article.

### Do not call setMethods()

This is the simplest way:

```php
<?php
// ...

$authorizeNet = $this->getMockBuilder('\AuthorizeNetAIM')
    ->getMock();
```

This produces a mock object where the methods

* Are all stubs,
* All return `null` by default,
* Are easily overridable

### Passing an empty array

You can pass an empty array to `setMethods()`:

```php
<?php
// ...

$authorizeNet = $this->getMockBuilder('\AuthorizeNetAIM')
    ->setMethods(array())
    ->getMock();
```

This produces a mock object that is exactly the same as if you have not called
`setMethods()` at all. The methods

* Are all stubs,
* All return `null` by default,
* Are easily overridable

### Passing null

You can also pass `null`:

```php
<?php
// ...

$authorizeNet = $this->getMockBuilder('\AuthorizeNetAIM')
    ->setMethods(null)
    ->getMock();
```

This produces a mock object where the methods

* Are all mocks,
* Run the actual code contained within the method when called,
* Do not allow you to override the return value

### Passing an array containing method names

```php
<?php
// ...

$authorizeNet = $this->getMockBuilder('\AuthorizeNetAIM')
    ->setMethods(array('authorizeAndCapture', 'foobar'))
    ->getMock();
```

This produces a mock object whose methods are a mix of the above three scenarios.

The methods you have identified

* Are all stubs,
* All return `null` by default,
* Are easily overridable

Methods you did not identify

* Are all mocks,
* Run the actual code contained within the method when called,
* Do not allow you to override the return value

This means that in the `$authorizeNet` mock object the `::authorizeAndCapture()` and
`::foobar()` methods would return `null` or you can override their return values, but
any method within that class other than those two will run their original code.

## WHY WOULD YOU WANT MOCK METHODS?

I will begin with a very simple example that you may have come across during your
years as a developer:

```php
<?php

namespace phpUnitTutorial;

class BadCode
{
    protected $user;

    public function __construct(array $user)
    {
        $this->user = $user;
    }

    public function authorize($password)
    {
        if ($this->checkPassword($password)) {
            return true;
        }

        return false;
    }

    protected function checkPassword($password)
    {
        if (empty($this->user['password']) || $this->user['password'] !== $password) {
            echo 'YOU SHALL NOT PASS';
            exit;
        }

        return true;
    }
}
```


A very simple class showing a very simple problem: If a user's password is not set,
echo an error to the user and stop script execution.

The problem with this class is that calling `exit` in your code will halt the current
PHP execution, including any tests you may be running! That would be less than ideal.

The optimal solution would be not having `exit` in your code at all. You should always
try to return a value instead. If you are unable to do this, another solution would be
to wrap the exit in a method and stub it:

```php
<?php
// ...

protected function checkPassword($password)
{
    if (empty($this->user['password']) || $this->user['password'] !== $password) {
        echo 'YOU SHALL NOT PASS';
        $this->callExit();
    }

    return true;
}

protected function callExit()
{
    exit;
}
```

Suddenly this class is testable, you only need to stub out the `callExit()` method!

Here is our test:

```php
<?php

namespace phpUnitTutorial\Test;

class BadCodeTest extends \PHPUnit_Framework_TestCase
{
    public function testAuthorizeExitsWhenPasswordNotSet()
    {
        $user = array('username' => 'jtreminio');
        $password = 'foo';

        $badCode = $this->getMockBuilder('phpUnitTutorial\BadCode')
            ->setConstructorArgs(array($user))
            ->setMethods(array('callExit'))
            ->getMock();

        $badCode->expects($this->once())
            ->method('callExit');

        $this->expectOutputString('YOU SHALL NOT PASS');

        $badCode->authorize($password);
    }
}
```

By passing `array('callExit')` into `setMethods()`, you have created a mock object
with a mix of stub and mock methods. In this example `callExit()` is the only method
to be stubbed - all others are proper mocks and will run the actual code behind them.

Thanks to the magic of mock methods once your code reaches the point of
`if (empty($this->user['password']) || $this->user['password'] !== $password) {`
and calls `callExit()` your tests will not die since `callExit()` now returns `null`
instead of actually running the `exit` line inside of it.

If you stub multiple methods in a mock object you can call `expects()` as many times
as you want. These are considered 'soft' assertions in PHPUnit and do not count toward
the goal of having only a single assertion in your tests. If we remove the lines,

```php
<?php
// ...

$badCode->expects($this->once())
    ->method('callExit');
```

our test would still pass. However, since we have added the soft assertion if in the
future our code failed to call `callExit()` our test would fail and we would
immediately know something broke our code.

If you attempt to define a return value for the `checkPassword()` method with
`->will($this->returnValue('RETURN VALUE HERE!'));` PHPUnit will ignore them and
continue on with the test. Remember - mock methods do not allow you to override the
return value!

## HANDLING BAD CONSTRUCTORS

Sometimes you come across legacy code that does the the unthinkable - its constructor
goes beyond simply setting up object property values and actually **does real work**!

[Miško Hevery lays down the law on why the constructor should be sissy](http://misko.hevery.com/code-reviewers-guide/flaw-constructor-does-real-work/)
compared to the other methods in the class. It should do very little aside from simply
setting object properties from its parameters.

### An example of bad constructor design

Create the file `./phpUnitTutorial/NaughtyConstructor.php` and paste the following:

```php
<?php

namespace phpUnitTutorial;

class NaughtyConstructor
{
    public $html;

    public function __construct($url)
    {
        $this->html = file_get_contents($url);
    }

    public function getMetaTags()
    {
        $mime = 'text/plain';
        $filename = "data://{$mime};base64," . base64_encode($this->html);

        return get_meta_tags($filename);
    }

    public function getTitle()
    {
        preg_match("#<title>(.+)</title>#siU", $this->html, $matches);

        return !empty($matches[1]) ? $matches[1] : false;
    }
}
```

This class structure mimics many classes you may come across every day. To use it, you
would do the following:

```php
<?php
// ...

$naughty = new NaughtyConstructor('http://jtreminio.com');
$metaTags = $naughty->getMetaTags();
$title = $naughty->getTitle();
```

Without scrolling down this article to cheat, can you point out the biggest reason
this code can be considered bad news for testing?

Answer: What if you attempt to run your test when you are not connected to the
internet? Since you have created a dependency in your constructor on
`file_get_contents()`, you are forced to always be online to have this test pass.
Well, that kind of sucks! Tests should not rely on anything outside of themselves,
and having a requirement that you be connected to the internet completely fails that
point.

Create a basic test for the code as it currently is, file
`./phpUnitTutorial/Test/NaughtConstructorTest.php`:

```php
<?php

namespace phpUnitTutorial\Test;

use phpUnitTutorial\NaughtyConstructor;

class NaughtyConstructorTest extends \PHPUnit_Framework_TestCase
{
    public function testGetMetaTagsReturnsArrayOfProperties()
    {
        $naughty = new NaughtyConstructor('http://jtreminio.com');

        $result = $naughty->getMetaTags();

        $expectedAuthor = 'Juan Treminio';

        $this->assertEquals(
            $expectedAuthor,
            $result['author']
        );
    }
}
```

Before I run this simple test, I enable airplane mode on my laptop to kill the 
internet. Then I run the test using 
`$ ./vendor/bin/phpunit phpUnitTutorial/Test/NaughtyConstructorTest.php`. After a 
rather long, boring wait I finally get the results: Failure.

{% image 300px %}
![01-internet-dependency.png](/static/post/2013-03-31-unit-testing-tutorial-part-v-mock-methods-and-overriding-constructors/01-internet-dependency.png)
{% endimage %}

You did not expect another result, did you?

### Before we proceed, some potential fixes

There are several ways of making this class much better but for now I want you to
imagine that this particular class cannot be changed. We are only allowed to write a
unit test for it, and are unable to touch anything in the class itself.

If we *could* change the class, some possible fixes to this issue would be:

* Passing the HTML as a constructor parameter (ex
  `$naughty = new NaughtyConstructor($html);`),
* Using a locally accessible development URL (ex from your development VM),
* Moving the `file_get_contents()` function call outside of the constructor, and then
  stubbing the method

For the purposes of this tutorial, though, we will not go down any of those routes.

If you can read you already know we need to mock the constructor!

### __construct(), I hereby mock thee!

Replace the first line in your test,
`$naughty = new NaughtyConstructor('http://jtreminio.com');`, with PHPUnit's
`getMockBuilder()`:

```php
<?php
// ...

$naughty = $this->getMockBuilder('\phpUnitTutorial\NaughtyConstructor')
    ->setMethods(array('__construct'))
    ->setConstructorArgs(array('http://jtreminio.com'))
    ->getMock();
```

If you remember from earlier, whatever method you identify in `setMethods()` will be
a stub, returning `null` by default.

Except this time when you run your test it does not do that. Why?

### You cannot stub the constructor!

Think about it - a stub is a method that returns `null` by default. When you
instantiate an object using `new` PHP magically returns a new instance of the class
defined. So it would not make sense if you overwrote that magic and instead returned
`null` instead of a new object, would it?

PHPUnit has a fix in `disableOriginalConstructor()`:

```php
<?php
// ...

$naughty = $this->getMockBuilder('\phpUnitTutorial\NaughtyConstructor')
    ->setMethods(array('__construct'))
    ->setConstructorArgs(array('http://jtreminio.com'))
    ->disableOriginalConstructor()
    ->getMock();
```

Note: passing `__construct` to the `setMethods()` method seems like it would be
unnecessary - but remember that if you do not call `setMethods()` or if you pass an
empty `array()` to `setMethods()` all methods in the object would be stubs that
return `null`. That is not what we want!

Run your test again and... Failure!

{% image 300px %}
![02-removed-constructor-assignments.png](/static/post/2013-03-31-unit-testing-tutorial-part-v-mock-methods-and-overriding-constructors/02-removed-constructor-assignments.png)
{% endimage %}

Well of course it is failing - `getMetaTags();` tries to use `$this->html` which is
empty because we disabled the constructor!

This brings up another interesting point: what happens if we had tried to test a
website that we do not control? We could happily test against their HTML for weeks,
and then one day they redo their code and now no longer have an author meta tag to
assert against, making our tests fail! This is another marks against having outside
dependencies in your unit tests.

The solution to our current dilemma is simply creating sample HTML in our test and
then setting it in our code.

Here is what your test should currently look like:

```php
<?php

namespace phpUnitTutorial\Test;

use phpUnitTutorial\NaughtyConstructor;

class NaughtyConstructorTest extends \PHPUnit_Framework_TestCase
{
    public function testGetMetaTagsReturnsArrayOfProperties()
    {
        $naughty = $this->getMockBuilder('\phpUnitTutorial\NaughtyConstructor')
            ->setMethods(array('__construct'))
            ->setConstructorArgs(array('http://jtreminio.com'))
            ->disableOriginalConstructor()
            ->getMock();

        $naughty->html = $this->getHtml();

        $result = $naughty->getMetaTags();

        $expectedAuthor = 'Juan Treminio';

        $this->assertEquals(
            $expectedAuthor,
            $result['author']
        );
    }

    protected function getHtml()
    {
        return '
             <!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta name="viewport" content="width=1, initial-scale=1, maximum-scale=1, minimum-scale=1, user-scalable=no"/>
                    <meta name="description" content="Dallas PHP/MySQL Web Developer"/>
                    <meta name="author" content="Juan Treminio"/>
                    <meta name="generator" content="PieCrust 1.0.0-dev"/>
                    <meta name="template-engine" content="Twig"/>
                    <title>Juan Treminio - Dallas PHP/MySQL Web Developer &mdash; Blog</title>
                </head>
                <body>
                </body>
                </html>
        ';
    }
}
```

We have accomplished an important goal in unit testing: remove outside dependencies.

Running our test now gives us a green bar!

We can even add another test:

```php
<?php
// ...

public function testGetTitleReturnsExpectedTitle()
{
    $naughty = $this->getMockBuilder('\phpUnitTutorial\NaughtyConstructor')
        ->setMethods(array('__construct'))
        ->setConstructorArgs(array('http://jtreminio.com'))
        ->disableOriginalConstructor()
        ->getMock();

    $naughty->html = $this->getHtml();

    $result = $naughty->getTitle();

    $expectedTitle = 'Juan Treminio - Dallas PHP/MySQL Web Developer &mdash; Blog';

    $this->assertEquals(
        $expectedTitle,
        $result 
    );
}
```

Green bar!

## WRAP IT UP

Today you learned about the last piece of the mock puzzle: mock methods.

Juggling the definitions of mock objects, stub methods and mock methods in your head
can seem a little daunting at first but I am confident once you learn the differences
between the three, and when you require mock methods over stub methods or vice-versa,
you will become a better tester which will make you a better developer over-all.

In the next part of this series I will introduce the concept of using a container in
your tests, and how you can easily dominate a big ball of legacy mud with containers!

In the meantime, you may want to brush up on containers themselves with my article,
[An introduction to Pimple and Service Containers](2012-10-04-an-introduction-to-pimple-and-service-containers.md).

Until next time, this is Señor PHP Developer Juan Treminio wishing you adios!
