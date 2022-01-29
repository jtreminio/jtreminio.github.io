---
layout: post
categories: [blog]
date: 2013-03-01 13:00:00
title: "Unit Testing Tutorial Part II: Assertions, Writing a Useful Test and @dataProvider"
description: PHP Unit introduction series
slug: unit-testing-tutorial-part-ii-assertions-writing-a-useful-test-and-dataprovider
redirect_from:
  - /2013/03/unit-testing-tutorial-part-2-assertions-writing-a-useful-test-and-dataprovider
  - /2013/03/unit-testing-tutorial-part-2-assertions-writing-a-useful-test-and-dataprovider/
  - /blog/unit-testing-tutorial-part-2-assertions-writing-a-useful-test-and-dataprovider
  - /blog/unit-testing-tutorial-part-2-assertions-writing-a-useful-test-and-dataprovider/
tags:
  - webdev
  - tutorial
  - phpunit
  - php
  - testing
gh_comment_id: 7
---

> This is Part II of a multi-part series. Below are the links to other parts of this
> tutorial!
>
> * [Unit Testing Tutorial Part I: Introduction to PHPUnit](2013-03-01-unit-testing-tutorial-part-i-introduction-to-phpunit.md)
> * Unit Testing Tutorial Part II: Assertions, Writing a Useful Test and @dataProvider
> * [Unit Testing Tutorial Part III: Testing Protected/Private Methods, Coverage Reports and CRAP](2013-03-03-unit-testing-tutorial-part-iii-testing-protected-private-methods-coverage-reports-and-crap.md)
> * [Unit Testing Tutorial Part IV: Mock Objects, Stub Methods and Dependency Injection](2013-03-07-unit-testing-tutorial-part-iv-mock-objects-stub-methods-and-dependency-injection.md)
> * [Unit Testing Tutorial Part V: Mock Methods and Overriding Constructors](2013-03-31-unit-testing-tutorial-part-v-mock-methods-and-overriding-constructors.md)
{:class="success"}

In the first part of this series, I walked you through initial installation and
configuration of PHPUnit for a new project. I showed you some conventions that
PHPUnit expects, and even walked you through creating a simple, stupid, and seemingly
useless test.

It did, however, introduce you to the most basic assertion PHPUnit ships with -
`assertTrue()`.

## ASSERTIONS

### What is an assertion?

Wikipedia defines an assertion as

> a predicate (a true–false statement) placed in a program to indicate that the
> developer thinks that the predicate is always true at that place.

Translated, all it is saying is that an assertion verifies a statement made equals
true.

### Assertions evaluate to true

In our initial example,

```php
<?php
// ...

public function testTrueIsTrue()
{
    $foo = true;
    $this->assertTrue($foo);
}
```

we asserted that `true` will assert to `true` ( `if (true == true)` ). There is no
magic here, what you see is what you get with assertions.

If we assert that `false` is `true` ( `if (false == true)` ), we would get a failing
test:

```php
<?php
// ...

public function testTrueIsTrue()
{
    $foo = false;
    $this->assertTrue($foo);
}
```

What if we wanted to assert that `false` is `false` ( `if (false == false)` )?

```php
<?php
// ...

public function testFalseIsFalse()
{
    $foo = false;
    $this->assertFalse($foo);
}
```

This test would pass because our assertion would be `true`, even if the assert
method is called `assertFalse()`.

### Available assertions

PHPUnit ships with 90 assertions,
[which are listed here](http://www.phpunit.de/manual/current/en/appendixes.assertions.html).
If you use a proper IDE, you will not need to memorize any of them, as they are
accessible through `$this->assert*`. You also do not need to use them all. Most of
the time you will only use `assertArrayHasKey()`, `assertEquals()`, `assertFalse()`,
`assertSame()` and `assertTrue()`. I do not think I have ever used more than 15% of
all available assertions in the time I have tested my code, so moving forward I will
focus mostly on these five assertion methods and maybe lightly showcase a few others.

### Custom assertions

PHPUnit assertion methods are just that - regular methods that return either `true` or
`false` after evaluating the code you have passed. If you cannot find an assertion to
perfectly match your requirement, creating a new one is as simple as creating a new
method! There is no complicated plugin architecture to learn - just define the method
in your test class and start using it. If you ever need it in more than one class,
move it to a parent class all your tests extend.

I will go through this in more detail in the future.

## FIRST USEFUL TEST

So enough with the introduction to the API! If you really want to, you can
[head over to the official PHPUnit manual and read through everything](http://www.phpunit.de/manual/current/en/).
Warning: it is very *dry*.

### The code

For our first non-trivial test we will create a test for a sluggify method. This
method will turn a string into a URL-safe string: "This string will be sluggified"
will turn into "this-string-will-be-sluggified".

Create a new file at `./phpUnitTutorial/URL.php` and paste the following:

```php
<?php

namespace phpUnitTutorial;

class URL
{
    public function sluggify($string, $separator = '-', $maxLength = 96)
    {
        $title = iconv('UTF-8', 'ASCII//TRANSLIT', $string);
        $title = preg_replace("%[^-/+|\w ]%", '', $title);
        $title = strtolower(trim(substr($title, 0, $maxLength), '-'));
        $title = preg_replace("/[\/_|+ -]+/", $separator, $title);

        return $title;
    }
}
```

I find this to be a great example for a first, useful test because the code is easy
to understand but has lots of room for error.

String goes in, string comes out. You can't explain that (well, you can with tests!).

### What we expect to happen

As already explained, we want to pass this method any string and expect back a
properly parsed, URL-safe slug.

### The test

Start with creating the actual test file at `./phpUnitTutorial/Test/URLTest.php`
and pasting the basic skeleton:

```php
<?php

namespace phpUnitTutorial\Test;

class URLTest extends \PHPUnit_Framework_TestCase
{
    //
}
```

### Failure!

If you run PHPUnit right now, you should get the following:

| ![01-failed-test.png](/static/post/2013-03-01-unit-testing-tutorial-part-ii-assertions-writing-a-useful-test-and-dataprovider/01-failed-test.png) |
|:--:|
| 01-failed-test.png |
{:class="table img-link"}

```bash
FAILURES!
Tests: 2, Assertions: 1, Failures: 1.
```

You see 2 tests, 1 assertion and a single failure. The other test comes from part one
of this series.

This test run failed because `./phpUnitTutorial/Test/URLTest.php` does not currently
contain any tests.

**This is perfectly OK**.

We run our suite immediately after creating the file and skeleton to verify that we
did not mess up on the file or class name of the test. This will help prevent future
frustration wherein your test passes green but then you find out that PHPUnit was not
actually running the file because you may have messed up on one of the naming
conventions.

The next step is to turn that red bar into a green! The only way to do that is to
create an empty test method.

For our first test, we want to verify that `phpUnitTutorial\URL::sluggify()` returns
a sluggified string, so name your test method accordingly:

```php
<?php

namespace phpUnitTutorial\Test;

class URLTest extends \PHPUnit_Framework_TestCase
{
    public function testSluggifyReturnsSluggifiedString()
    {
        //
    }
}
```

### Success!

Running PHPUnit now will produce the coveted green bar!

| ![02-passing-test.png](/static/post/2013-03-01-unit-testing-tutorial-part-ii-assertions-writing-a-useful-test-and-dataprovider/02-passing-test.png) |
|:--:|
| 02-passing-test.png |
{:class="table img-link"}

From here we can move on with creating the meat of our test.

### Yummy innards

We should start the actual test off with our expectations:

> "This string will be sluggified" will turn into "this-string-will-be-sluggified".

```php
<?php

namespace phpUnitTutorial\Test;

class URLTest extends \PHPUnit_Framework_TestCase
{
    public function testSluggifyReturnsSluggifiedString()
    {
        $originalString = 'This string will be sluggified';
        $expectedResult = 'this-string-will-be-sluggified';
    }
}
```

To test `phpUnitTutorial\URL::sluggify()`, we need to instantiate an object of the 
`URL` class. As simple as it sounds:

```php
<?php

namespace phpUnitTutorial\Test;

use phpUnitTutorial\URL;

class URLTest extends \PHPUnit_Framework_TestCase
{
    public function testSluggifyReturnsSluggifiedString()
    {
        $originalString = 'This string will be sluggified';
        $expectedResult = 'this-string-will-be-sluggified';
        
        $url = new URL();
    }
}
```

For convenience' sake I have also added a `use` statement so we do not have to use 
the full namespace when instantiating the object.

Now, grab the result from the `::sluggify()` method:

```php
<?php

namespace phpUnitTutorial\Test;

use phpUnitTutorial\URL;

class URLTest extends \PHPUnit_Framework_TestCase
{
    public function testSluggifyReturnsSluggifiedString()
    {
        $originalString = 'This string will be sluggified';
        $expectedResult = 'this-string-will-be-sluggified';

        $url = new URL();

        $result = $url->sluggify($originalString);
    }
}
```

The final step is asserting that `$result` equals our expectations, defined as 
`$expectedResult`. The perfect assertion is called `assertEquals()`:

```php
<?php

namespace phpUnitTutorial\Test;

use phpUnitTutorial\URL;

class URLTest extends \PHPUnit_Framework_TestCase
{
    public function testSluggifyReturnsSluggifiedString()
    {
        $originalString = 'This string will be sluggified';
        $expectedResult = 'this-string-will-be-sluggified';

        $url = new URL();

        $result = $url->sluggify($originalString);

        $this->assertEquals($expectedResult, $result);
    }
}
```

Running PHPUnit brings a smile to our faces:

| ![03-useful-passing-test.png](/static/post/2013-03-01-unit-testing-tutorial-part-ii-assertions-writing-a-useful-test-and-dataprovider/03-useful-passing-test.png) |
|:--:|
| 03-useful-passing-test.png |
{:class="table img-link"}

### More scenarios

Our initial test passed, which is great! However, there is a slight problem: we have 
only tested that a string containing letters A-Z and spaces returns the expected 
result. What would happen if we passed a string with numbers? Special characters 
`(~!@#$%^&*()_+)?` What about non-English characters? What happens if we pass an 
empty string?! So many choices yet our single, solitary test only covers a small 
part of the possibilities.

A proper test suite makes sure all your possible bases are covered, so create tests 
for more scenarios:

```php
<?php

namespace phpUnitTutorial\Test;

use phpUnitTutorial\URL;

class URLTest extends \PHPUnit_Framework_TestCase
{
    public function testSluggifyReturnsSluggifiedString()
    {
        $originalString = 'This string will be sluggified';
        $expectedResult = 'this-string-will-be-sluggified';

        $url = new URL();

        $result = $url->sluggify($originalString);

        $this->assertEquals($expectedResult, $result);
    }

    public function testSluggifyReturnsExpectedForStringsContainingNumbers()
    {
        $originalString = 'This1 string2 will3 be 44 sluggified10';
        $expectedResult = 'this1-string2-will3-be-44-sluggified10';

        $url = new URL();

        $result = $url->sluggify($originalString);

        $this->assertEquals($expectedResult, $result);
    }

    public function testSluggifyReturnsExpectedForStringsContainingSpecialCharacters()
    {
        $originalString = 'This! @string#$ %$will ()be "sluggified';
        $expectedResult = 'this-string-will-be-sluggified';

        $url = new URL();

        $result = $url->sluggify($originalString);

        $this->assertEquals($expectedResult, $result);
    }

    public function testSluggifyReturnsExpectedForStringsContainingNonEnglishCharacters()
    {
        $originalString = "Tänk efter nu – förr'n vi föser dig bort";
        $expectedResult = 'tank-efter-nu-forrn-vi-foser-dig-bort';

        $url = new URL();

        $result = $url->sluggify($originalString);

        $this->assertEquals($expectedResult, $result);
    }

    public function testSluggifyReturnsExpectedForEmptyStrings()
    {
        $originalString = '';
        $expectedResult = '';

        $url = new URL();

        $result = $url->sluggify($originalString);

        $this->assertEquals($expectedResult, $result);
    }
}
```

| ![04-duplicate-tests.png](/static/post/2013-03-01-unit-testing-tutorial-part-ii-assertions-writing-a-useful-test-and-dataprovider/04-duplicate-tests.png) |
|:--:|
| 04-duplicate-tests.png |
{:class="table img-link"}

Our test suite passes!

### Code duplication, ahoy!

Obviously you are a seasoned pro at this and can immediately detect a major problem 
with the tests above: It fails the 
[DRY principle](http://en.wikipedia.org/wiki/Don't_repeat_yourself) pretty thoroughly.

Thankfully, PHPUnit has a built-in tool in the form of the `dataProvider` annotation.

## AN INTRODUCTION ANNOTATIONS

Annotations are nothing more than special flags defined in your method docblocks:

```php
<?php
// ...

/**
 * @annotationName Annotation value
 */
public function testFoo()
{
    //
}
```

There are
[plenty of useful annotations that ship with PHPUnit](http://www.phpunit.de/manual/current/en/appendixes.annotations.html),
but the one we want right now is the very powerful `dataProvider`.

### @dataProvider

[PHPUnit defines data providers as](http://www.phpunit.de/manual/current/en/writing-tests-for-phpunit.html#writing-tests-for-phpunit.data-providers):

> A test method can accept arbitrary arguments. These arguments are to be provided by 
> a data provider method.

In layman terms, a data provider can be used to create multiple sets of information to 
be passed into a single test, removing the need to create multiple duplicate tests as 
we did above.

Instead of creating multiple test methods, you simply create a single method that 
accepts parameters corresponding to the data that is variable between tests, and 
create a data provider method to provide that data:

```php
<?php
// ...

/**
 * @dataProvider providerTestFoo
 */
public function testFoo($variableOne, $variableTwo)
{
    //
}

public function providerTestFoo()
{
    return array(
        array('test 1, variable one', 'test 1, variable two'),
        array('test 2, variable one', 'test 2, variable two'),
        array('test 3, variable one', 'test 3, variable two'),
        array('test 4, variable one', 'test 4, variable two'),
        array('test 5, variable one', 'test 5, variable two'),
    );
}
```

Here we have create a single test and data provider. Note the `@dataProvider` 
annotation that defines which method is providing data to the `testFoo()` test.

### It's turtles all the way down!

A data provider consists of nothing more than an array that contains any number of 
arrays that contain any type of information.

Take a breathe, we can get through this.

The first level array is simply a container for the number of sets of data:

```php
<?php
// ...

return array(
//    array('test 1, variable one', 'test 1, variable two'),
//    array('test 2, variable one', 'test 2, variable two'),
//    array('test 3, variable one', 'test 3, variable two'),
//    array('test 4, variable one', 'test 4, variable two'),
//    array('test 5, variable one', 'test 5, variable two'),
);
```

This is not too important, it just means that *all* data providers *must* return an 
array containing other arrays.

The second level arrays provide the actual sets of data. In our example, we have 5 
second level arrays, which corresponds to 5 tests.

```php
<?php
// ...

// return array(
    array('test 1, variable one', 'test 1, variable two'),
    array('test 2, variable one', 'test 2, variable two'),
    array('test 3, variable one', 'test 3, variable two'),
    array('test 4, variable one', 'test 4, variable two'),
    array('test 5, variable one', 'test 5, variable two'),
// );
```

The values inside those second level arrays are what is actually passed as parameters 
to the test method.

In our example, the first data set,

```php
<?php
// ...

array('test 1, variable one', 'test 1, variable two'),
```

corresponds to the two expected method parameters in `testFoo()`:

```php
<?php
// ...

testFoo($variableOne, $variableTwo)
```

This simply gets repeated for the number of second level arrays within the data 
provider.

So, now we implement this useful tool into our existing test!

### Test with @dataProvider

Replace the contents of `./phpUnitTutorial/Test/URLTest.php` with:

```php
<?php

namespace phpUnitTutorial\Test;

use phpUnitTutorial\URL;

class URLTest extends \PHPUnit_Framework_TestCase
{
    /**
     * @param string $originalString String to be sluggified
     * @param string $expectedResult What we expect our slug result to be
     *
     * @dataProvider providerTestSluggifyReturnsSluggifiedString
     */
    public function testSluggifyReturnsSluggifiedString($originalString, $expectedResult)
    {
        $url = new URL();

        $result = $url->sluggify($originalString);

        $this->assertEquals($expectedResult, $result);
    }

    public function providerTestSluggifyReturnsSluggifiedString()
    {
        return array(
            array('This string will be sluggified', 'this-string-will-be-sluggified'),
            array('THIS STRING WILL BE SLUGGIFIED', 'this-string-will-be-sluggified'),
            array('This1 string2 will3 be 44 sluggified10', 'this1-string2-will3-be-44-sluggified10'),
            array('This! @string#$ %$will ()be "sluggified', 'this-string-will-be-sluggified'),
            array("Tänk efter nu – förr'n vi föser dig bort", 'tank-efter-nu-forrn-vi-foser-dig-bort'),
            array('', ''),
        );
    }
}
```

Now run your test suite:

| ![05-dataprovider-result.png](/static/post/2013-03-01-unit-testing-tutorial-part-ii-assertions-writing-a-useful-test-and-dataprovider/05-dataprovider-result.png) |
|:--:|
| 05-dataprovider-result.png |
{:class="table img-link"}

Huzzah!

## WRAPPING UP

Today you learned about assertions, created your first "useful" test and learned
about the powerful @dataProvider annotation.

While there is still (read: **much**) more to learn, you should at least be able to
start testing non-complex code that does not have any outside dependencies. Heck, you
may even be able to do some complex tests as well!

Don't get ahead of yourself, though, because coming up next you will learn how to
test code with outside dependencies and what that means, about mocks and stubs and
the differences between them, why static methods stink and the usefulness of
dependency injection.

Until next time, this is Señor PHP Developer Juan Treminio wishing you adios!
