---
date: 2013-03-07
title: "Unit Testing Tutorial Part IV: Mock Objects, Stub Methods and Dependency Injection"
description: PHP Unit introduction series
slug: unit-testing-tutorial-part-iv-mock-objects-stub-methods-and-dependency-injection
aliases:
    - /2013/03/unit-testing-tutorial-part-4-mock-objects-stub-methods-dependency-injection
    - /blog/unit-testing-tutorial-part-4-mock-objects-stub-methods-and-dependency-injection
tags:
    - webdev
    - tutorial
    - phpunit
    - php
    - testing
---

{{% notice blue %}}
This is Part IV of a multi-part series. Below are the links to other parts of this
tutorial!

* [Unit Testing Tutorial Part I: Introduction to PHPUnit](/blog/unit-testing-tutorial-part-i-introduction-to-phpunit)
* [Unit Testing Tutorial Part II: Assertions, Writing a Useful Test and @dataProvider](/blog/unit-testing-tutorial-part-ii-assertions-writing-a-useful-test-and-dataprovider)
* [Unit Testing Tutorial Part III: Testing Protected/Private Methods, Coverage Reports and CRAP](/blog/unit-testing-tutorial-part-iii-testing-protected-private-methods-coverage-reports-and-crap)
* Unit Testing Tutorial Part IV: Mock Objects, Stub Methods and Dependency Injection
* [Unit Testing Tutorial Part V: Mock Methods and Overriding Constructors](/blog/unit-testing-tutorial-part-v-mock-methods-and-overriding-constructors)
{{% /notice %}}

In my previous articles, I have brought you up to speed with writing basic tests for
basic methods. You are now able to use the `@dataProvider` annotation, generate
coverage reports, and how to use a few select assertions.

So far we have written tests for simple, straight-forward methods. Maybe a call to an
internal method inside the same class, even an if block thrown in for good measure,
but nothing at all complex.

While this is great for learning, in the real world you will rarely come across
something as simple as what you have encountered so far. What you will usually see are
methods that instantiate other class objects, call methods within the same class, use
statics, or have foreign object dependencies injected via parameters.

## PAYMENT CLASS

Today I will showcase more advanced testing concepts using code we are all familiar
with and may have used in the past: the payment processor API. Specifically for
Authorize.net, but just as easily could be any processor API.

### Grab the authorize.net files

First, update your `./composer.json` file with the following:

```json
{
    "require": {
        "ajbdev/authorizenet-php-api": "dev-master"
    },
    "require-dev": {
        "phpunit/phpunit": "3.7.14"
    },
    "autoload": {
        "psr-0": {
            "phpUnitTutorial": ""
        }
    }
}
```

We are simply adding in an unofficial Authorize.net entry to grab all the files.

To install, run `./composer.phar update`.

### Payment class

Now create an empty file at `./phpUnitTutorial/Payment.php` and paste the following
code:

```php
<?php

namespace phpUnitTutorial;

class Payment
{
    const API_ID = 123456;
    const TRANS_KEY = 'TRANSACTION KEY';

    public function processPayment(array $paymentDetails)
    {
        $transaction = new \AuthorizeNetAIM(self::API_ID, self::TRANS_KEY);
        $transaction->amount = $paymentDetails['amount'];
        $transaction->card_num = $paymentDetails['card_num'];
        $transaction->exp_date = $paymentDetails['exp_date'];

        $response = $transaction->authorizeAndCapture();

        if ($response->approved) {
            return $this->savePayment($response->transaction_id);
        } else {
            throw new \Exception($response->error_message);
        }
    }

    public function savePayment($transactionId)
    {
        // Logic for saving transaction ID to database or anywhere else would go in here
        return true;
    }
}
```

This code could have come right out of any number of projects around the world that
implement eCommerce features. It is simple, to the point, and untestable! You will
soon find out why.

### Test skeleton

Create a new file at `./phpUnitTutorial/Test/PaymentTest.php` and create the minimum
required:

```php
<?php

namespace phpUnitTutorial\Test;

use phpUnitTutorial\Payment;

class PaymentTest extends \PHPUnit_Framework_TestCase
{
    //
}
```

Running our test suite shows a single failure:

```
1) Warning
No tests found in class "phpUnitTutorial\Test\PaymentTest".
```

We are good to go!

### First test

Before writing the first test, think about what we need to actually test from the
code given.

The two most obvious outcomes are:

* `$response->approved` is `true`, which triggers the call to `::savePayment()`
  which returns `true`, and
* `$response->approved` is `false`, which then throws `\Exception()`.

Create our first, empty test method:

```php
<?php
// ...

public function testProcessPaymentReturnsTrueOnSuccessfulPayment()
{
    //
}
```

We know that `::processPayment()` accepts an array, and from the code we can see it 
uses the `amount`, `card_num` and `exp_date` keys, so set that up:

```php
<?php
// ...

$paymentDetails = array(
    'amount'   => 123.99,
    'card_num' => '4111-1111-1111-1111',
    'exp_date' => '03/2013',
);
```

We basically recreated what a normal payment would look like.

Now that we have the required parameter and its keys set up, instantiate the object, 
pass in the array and set our expected result - a return value of `true`:

```php
<?php

namespace phpUnitTutorial\Test;

use phpUnitTutorial\Payment;

class PaymentTest extends \PHPUnit_Framework_TestCase
{
    public function testProcessPaymentReturnsTrueOnSuccessfulPayment()
    {
        $paymentDetails = array(
            'amount'   => 123.99,
            'card_num' => '4111-1111-1111-1111',
            'exp_date' => '03/2013',
        );

        $payment = new Payment();
        $result = $payment->processPayment($paymentDetails);

        $this->assertTrue($result);
    }
}
```

{{< imgproc "01-failed-by-outside-dependency.png" Resize "300x" />}}

### Explosions!

Our test suite blew up. What exactly happened?

Authorize.net responded to our test by saying "The merchant login ID or password is
invalid or the account is inactive.". Oops!

Maybe we should get valid Authorize.net credentials and plug them in to our test!

While that would certainly solve the issue, another quickly takes its place:

If you dive into the `\AuthorizeNetAIM` class, you will notice the complexity quickly
grows - the methods call other methods, which call even more. Eventually there is
even a cURL call that is what actually contacts Authorize.net's servers.

What happens if the Authorize.net servers are unavailable when you are writing and/or
running your tests?

Should we allow our tests to fail and throw a red bar because Authorize.net may not be
down? Or because our internet is down?

Why are we even worrying about what happens in this foreign class? We don't want to
depend on an outside source that is out of our control! There must be a better way...

## ENTER THE MOCK

PHPUnit comes with a very powerful feature to help us handle outside dependencies. It
basically involves replacing the actual object with a fake, or 'mock', object that we
fully control, removing all dependencies on outside systems or code that we really
have no need to test.

In the `\AuthorizeNetAIM` class we know that the method `::authorizeAndCapture()`
brings some serious problems to our testing code - in that it pings an outside server
that we neither have control over nor desire to control.

There is still a minor issue, however: how do we actually get out mocked object into
the code we are testing? The code that instantiates the Authorize.net object is pretty
concrete and leaves no room for interpretation, right?

```php
<?php
// ...

$transaction = new \AuthorizeNetAIM(self::API_ID, self::TRANS_KEY);
```

## DEPENDING ON DEPENDENCY INJECTION

There is this concept called dependency injection. It is a fancy name for something
that is ultimately a very simple concept to understand.

Instead of using the `new` keyword in your methods, pass in the object in parameters.

So this:

```php
<?php
// ...

public function processPayment(array $paymentDetails)
{
    $transaction = new \AuthorizeNetAIM(self::API_ID, self::TRANS_KEY);
    $transaction->amount = $paymentDetails['amount'];
    $transaction->card_num = $paymentDetails['card_num'];
    $transaction->exp_date = $paymentDetails['exp_date'];

    $response = $transaction->authorizeAndCapture();

    if ($response->approved) {
        return $this->savePayment($response->transaction_id);
    }

    throw new \Exception($response->error_message);
}
```

becomes this:

```php
<?php
// ...

public function processPayment(\AuthorizeNetAIM $transaction, array $paymentDetails)
{
    $transaction->amount = $paymentDetails['amount'];
    $transaction->card_num = $paymentDetails['card_num'];
    $transaction->exp_date = $paymentDetails['exp_date'];

    $response = $transaction->authorizeAndCapture();

    if ($response->approved) {
        return $this->savePayment($response->transaction_id);
    }

    throw new \Exception($response->error_message);
}
```

You are moving the responsibility of object creation out of the `Payment` class and
into whatever class calls it. If you want more information on dependency injection,
[click here for an article that explains it in much more detail than I ever could](http://fabien.potencier.org/article/11/what-is-dependency-injection).

The concept is simple, the benefits are many.

### But why dependency injection?

We want to replace a dependency in your code with a fake (mock) object. How exactly
do you do that if your code is very explicit on the object it is creating?

```php
<?php
// ...

$transaction = new \AuthorizeNetAIM(self::API_ID, self::TRANS_KEY);
```

Short answer: You can't.

Long answer: You can, but the "solution" is horrible and should be avoided at all
costs: [runkit](http://php.net/manual/en/book.runkit.php).

Runkit allows you to replace code during runtime, which at first glance sounds like
what you want, right? Replace an actual object in your code with a fake object?

The process is called [monkey patching](http://en.wikipedia.org/wiki/Monkey_patch),
and for
[a fairly good rundown of why it is a bad idea, click here](http://www.littlehart.net/atthekeyboard/2012/07/13/monkey-patching-is-for-closers/).

Referencing a blog post that references me? Circlejerk complete!

So, again, we're back to "You can't.".

The other way to replace that dependency is to provide the method with a
pre-instantiated object in its parameters.

Actually, there's a third way: service container. I won't be going over a container
today, but will speak about the benefits it brings to code quality and testing in the
near future. For a quick rundown on what a service container is,
[just click here](http://jtreminio.com/2012/10/an-introduction-to-pimple-and-service-containers)!

Instead of the impossible-to-replace object instantiation shown above, passing in
the dependency with `public function processPayment(\AuthorizeNetAIM $transaction,
array $paymentDetails)` means you can now pass in an object that will pass an `is_a()`
check.

What exactly are the requirements of `is_a()`?

> is_a — Checks if the object is of this class or has this class as one of its parents

Any class that extends `\AuthorizeNetAIM` will pass an `is_a()` check. That part is
pretty easy. So, how would we pass an object that passes this check? It would need to
pass certain requirements:

* Has all the methods your code is expecting, and
* Any methods that cause problems in your code (like `authorizeAndCapture()`) should
  be changed to make them safe for your tests.

Well, that sounds like simply extending the `\AuthorizeNetAIM` class would do the
trick, right? Simply create a new class, say, `\AuthorizeNetAIMFake`, which overwrites
all the methods and simply returns some expected value to remove any and all surprises.

That is actually not a bad idea, and in fact can easily work well for smaller
codebases... but what happens when you have 5 classes you need to override like this?
10? 50? You can easily go over several hundred classes needing to be overridden. Do
you really want to create, and maintain, several hundred files that do nothing more
than extend another class and override all its methods? There must be a better way!

## PHPUnit's Mock Helper

Taking into account the changes made to our code, our test would then look something
like this:

```php
<?php

namespace phpUnitTutorial\Test;

use phpUnitTutorial\Payment;

class PaymentTest extends \PHPUnit_Framework_TestCase
{
    public function testProcessPaymentReturnsTrueOnSuccessfulPayment()
    {
        $paymentDetails = array(
            'amount'   => 123.99,
            'card_num' => '4111-1111-1111-1111',
            'exp_date' => '03/2013',
        );

        $payment = new Payment();

        $authorizeNet = new \AuthorizeNetAIM($payment::API_ID, $payment::TRANS_KEY);

        $result = $payment->processPayment($authorizeNet, $paymentDetails);

        $this->assertTrue($result);
    }
}
```

The problem with this code is that you are still dependent on the `\AuthorizeNetAIM`
class and all the code within its methods. We also don't want to create a blank class
file to do this, for the reasons listed above. What to do?

### PHPUnit to the rescue!

One of the most powerful tools available to you is the `getMock()` method - it allows
you to create a new class that passes our two major requirements above, all on the fly.
You do not need to create separate files for each class, you do not have to worry about
maintaining a steadily-growing file structure.

To use it, you simply call it and pass in a few parameters, most of them optional.

```php
<?php
// ...

$authorizeNet = $this->getMock('\AuthorizeNetAIM', array(), array($payment::API_ID, $payment::TRANS_KEY));
```

### Wait, what's that second parameter?

Just by looking at this code, you can tell the first parameter is the class name and
the third parameter is an array containing the constructor parameters. What's that
`array()`, though?

Turns out `getMock()` is kind of ... ugly and unwieldy:

```php
<?php
// ...

public function getMock($originalClassName, $methods = array(), array $arguments = array(), $mockClassName = '', $callOriginalConstructor = TRUE, $callOriginalClone = TRUE, $callAutoload = TRUE, $cloneArguments = TRUE)
```

This is ugly. There are 8 parameters, most of them optional, for this single method.
Do you really want to have a window open all the time when you are writing tests? Of
course not - what will happen is you will stop writing tests because this sucks.

### getMockBuilder()

A few versions ago PHPUnit introduced a handy helper: `getMockBuilder()`. It is little
more than a wrapper around the `getMock()` method above, but it provides a much more
human-readable format of chained methods, making creating mocked objects a breeze.

Here is our `$authorizeNet` with `getMockBuilder()`:

```php
<?php
// ...

$authorizeNet = $this->getMockBuilder('\AuthorizeNetAIM')
    ->setConstructorArgs(array($payment::API_ID, $payment::TRANS_KEY))
    ->getMock();
```

Thanks to the method names you immediately know what they are for and you can
completely skip the optional methods.

In fact, the only requirements are `getMockBuilder()` and `getMock()`.

## EXAMINING A MOCKED OBJECT

`getMockBuilder()` returns a mock object, which is simply an object that has behavior
similar to the original object.

In fact, if you dump the mock you can see it is very similar to the original:

```php
<?php
// ...

$authorizeNet = $this->getMockBuilder('\AuthorizeNetAIM')
    ->setConstructorArgs(array($payment::API_ID, $payment::TRANS_KEY))
    ->getMock();

var_dump($authorizeNet);
```

Which prints:

```php
<?php
// ...

class Mock_AuthorizeNetAIM_084f7b20#17 (12) {
    private $__phpunit_invocationMocker => NULL
    protected $_x_post_fields           => array(5) {
        'version'        => string(3) "3.1"
        'delim_char'     => string(1) ","
        'delim_data'     => string(4) "TRUE"
        'relay_response' => string(5) "FALSE"
        'encap_char'     => string(1) "|"
    }
    private $_additional_line_items => array(0) {}
    protected $_custom_fields       => array(0) {}
    public $verify_x_fields         => bool(true)
    private $_all_aim_fields        => array(61) {
        [0]  => string(7) "address"
        [1]  => string(18) "allow_partial_auth"
        [2]  => string(6) "amount"
        [3]  => string(9) "auth_code"
        [4]  => string(24) "authentication_indicator"
        [5]  => string(13) "bank_aba_code"
        [6]  => string(14) "bank_acct_name"
        [7]  => string(13) "bank_acct_num"
        [8]  => string(14) "bank_acct_type"
        [9]  => string(17) "bank_check_number"
        [10] => string(9) "bank_name"
        [11] => string(9) "card_code"
        [12] => string(8) "card_num"
        [13] => string(31) "cardholder_authentication_value"
        [14] => string(4) "city"
        [15] => string(7) "company"
        [16] => string(7) "country"
        [17] => string(7) "cust_id"
        [18] => string(11) "customer_ip"
        [19] => string(10) "delim_char"
        [20] => string(10) "delim_data"
        [21] => string(11) "description"
        [22] => string(16) "duplicate_window"
        [23] => string(4) "duty"
        [24] => string(11) "echeck_type"
        [25] => string(5) "email"
        [26] => string(14) "email_customer"
        [27] => string(10) "encap_char"
        [28] => string(8) "exp_date"
        [29] => string(3) "fax"
        [30] => string(10) "first_name"
        [31] => string(20) "footer_email_receipt"
        [32] => string(7) "freight"
        [33] => string(20) "header_email_receipt"
        [34] => string(11) "invoice_num"
        [35] => string(9) "last_name"
        [36] => string(9) "line_item"
        [37] => string(5) "login"
        [38] => string(6) "method"
        [39] => string(5) "phone"
        [40] => string(6) "po_num"
        [41] => string(17) "recurring_billing"
        [42] => string(14) "relay_response"
        [43] => string(15) "ship_to_address"
        [44] => string(12) "ship_to_city"
        [45] => string(15) "ship_to_company"
        [46] => string(15) "ship_to_country"
        [47] => string(18) "ship_to_first_name"
        [48] => string(17) "ship_to_last_name"
        [49] => string(13) "ship_to_state"
        [50] => string(11) "ship_to_zip"
        [51] => string(15) "split_tender_id"
        [52] => string(5) "state"
        [53] => string(3) "tax"
        [54] => string(10) "tax_exempt"
        [55] => string(12) "test_request"
        [56] => string(8) "tran_key"
        [57] => string(8) "trans_id"
        [58] => string(4) "type"
        [59] => string(7) "version"
        [60] => string(3) "zip"
    }
    protected $_api_login       => int(123456)
    protected $_transaction_key => string(15) "TRANSACTION KEY"
    protected $_post_string     => NULL
    public $VERIFY_PEER         => bool(true)
    protected $_sandbox         => bool(true)
    protected $_log_file        => bool(false)
}
```

It also matches the methods of the original,

```php
<?php
// ...

print_r(get_class_methods($authorizeNet));
```

Which prints:

```php
[0] => __clone
[1] => authorizeAndCapture
[2] => priorAuthCapture
[3] => authorizeOnly
[4] => void
[5] => captureOnly
[6] => credit
[7] => __set
[8] => setFields
[9] => setCustomFields
[10] => addLineItem
[11] => setECheck
[12] => setField
[13] => setCustomField
[14] => unsetField
[15] => setSandbox
[16] => setLogFile
[17] => getPostString
[18] => expects
[19] => staticExpects
[20] => __phpunit_getInvocationMocker
[21] => __phpunit_getStaticInvocationMocker
[22] => __phpunit_hasMatchers
[23] => __phpunit_verify
[24] => __phpunit_cleanup
[25] => __construct
```

For all intents and purposes, the mock created using `getMockBuilder()` is a real,
working method... with one exception!

Try dumping the output of any method call:

```php
<?php
// ...

var_dump($authorizeNet->authorizeAndCapture());
```

The result you will get is `NULL`.

If you try more methods, the result will *always* be `NULL`. Your mocked object's
methods all return `NULL`.

These methods are considered stubs!

## STUB METHODS

A stub method is a method that mimics the origin method in two ways - same name and
same parameters accepted. What makes a stub method special, however, is that all the
code within it has been erased.

Here's the original method from the `\AuthorizeNetAIM` class:

```php
<?php
// ...

public function authorizeAndCapture($amount = false, $card_num = false, $exp_date = false)
{
    ($amount ? $this->amount = $amount : null);
    ($card_num ? $this->card_num = $card_num : null);
    ($exp_date ? $this->exp_date = $exp_date : null);
    $this->type = "AUTH_CAPTURE";
    return $this->_sendRequest();
}
```

For now we can consider the stub method to be like this:

```php
<?php
// ...

public function authorizeAndCapture($amount = false, $card_num = false, $exp_date = false)
{
    return null;
}
```

All other methods in your mock object are also stubs, and they also return `NULL`.

What is great about this is that the `authorizeAndCapture()` method is no longer
sending a request to the Authorize.net servers. Instead, it is returning a known
value (`NULL`) every single time it is called.

Here is the kicker, though: **You can now override the value returned by a stub
method from within your test.**

This means that you define the value return by your stub in your test, and when you
run your test your code will think the value returned is normal, and act accordingly
to your wishes.

A returned value can be anything - `null`, a string, an array, integers, other
objects and even other mocked objects.

We will get into that in more detail in an upcoming chapter, however.

For now, take a look at your test code so far:

```php
<?php

namespace phpUnitTutorial\Test;

use phpUnitTutorial\Payment;

class PaymentTest extends \PHPUnit_Framework_TestCase
{
    public function testProcessPaymentReturnsTrueOnSuccessfulPayment()
    {
        $paymentDetails = array(
            'amount'   => 123.99,
            'card_num' => '4111-1111-1111-1111',
            'exp_date' => '03/2013',
        );

        $payment = new Payment();

        $authorizeNet = $this->getMockBuilder('\AuthorizeNetAIM')
            ->setConstructorArgs(array($payment::API_ID, $payment::TRANS_KEY))
            ->getMock();

        $result = $payment->processPayment($authorizeNet, $paymentDetails);

        $this->assertTrue($result);
    }
}
```

If you run your test now, you will get:

```
There was 1 error:

1) phpUnitTutorial\Test\PaymentTest::testProcessPaymentReturnsTrueOnSuccessfulPayment
Trying to get property of non-object

/webroot/phpUnitTutorial/phpUnitTutorial/Payment.php:18
/webroot/phpUnitTutorial/phpUnitTutorial/Test/PaymentTest.php:23

FAILURES!
Tests: 11, Assertions: 10, Errors: 1.
```

`Payment.php:18` corresponds with `if ($response->approved) {`. `$response` was
instantiated with `$response = $transaction->authorizeAndCapture();`. Using the
knowledge you just gained above, you know this is because all stub methods return
`NULL` unless otherwise overridden.

What is happened is that `$response` is `NULL`, but then we attempt to call `approved`
from the object, which does not exist, thus the error.

We know we have to override the return value of `authorizeAndCapture()`, and
thankfully it is fairly simple!

## OVERRIDING STUB METHOD RETURN VALUES

To override the return value of a stub, you have to be introduced to 5 new PHPUnit
methods:

```php
<?php
// ...

$authorizeNet->expects($this->once())
    ->method('authorizeAndCapture')
    ->will($this->returnValue('RETURN VALUE HERE!'));
```

Walk through the logic with me.

We are stating that the `$authorizeNet` object expects to call one time the method
`authorizeAndCapture()`, and it will return the value `RETURN VALUE HERE!`.

You start this process off by calling `expects()`, which accepts a single parameter:
the number of times we are expecting the method to be called in our code. There are
multiple options for the number method, include `once()`, `any()`, `never()` and a
few more. The names are self-explanatory.

If we state that the method is expecting to be called one time, and it ends up never
being called, or called more than once, our test will fail.

If we state it should never be called, but it is, the test will fail.

`any()` is a cheat that says, "I don't care if it is ever called, but if it is, here
is the expected return.".

`method()` accepts the name of the method to override. In our case, it would correspond
with the call `$response = $transaction->authorizeAndCapture();` in our code.

Then we have `will()` which is simply wraps the important `returnValue()` where you
actually define what value is returned. In this case, it is `RETURN VALUE HERE!`.

Running our test now will still fail, because `authorizeAndCapture()` is returning a
string, when our code is expecting an object with an `approved` and `transaction_id`
key. A simple shortcut for these types of objects is to use `\stdClass()`:

```php
<?php
// ...

$response = new \stdClass();
$response->approved = true;
$response->transaction_id = 123;
```

Now you can pass that into the `returnValue()` method. Here is our completed test:

```php
<?php

namespace phpUnitTutorial\Test;

use phpUnitTutorial\Payment;

class PaymentTest extends \PHPUnit_Framework_TestCase
{
    public function testProcessPaymentReturnsTrueOnSuccessfulPayment()
    {
        $paymentDetails = array(
            'amount'   => 123.99,
            'card_num' => '4111-1111-1111-1111',
            'exp_date' => '03/2013',
        );

        $payment = new Payment();

        $response = new \stdClass();
        $response->approved = true;
        $response->transaction_id = 123;

        $authorizeNet = $this->getMockBuilder('\AuthorizeNetAIM')
            ->setConstructorArgs(array($payment::API_ID, $payment::TRANS_KEY))
            ->getMock();

        $authorizeNet->expects($this->once())
            ->method('authorizeAndCapture')
            ->will($this->returnValue($response));

        $result = $payment->processPayment($authorizeNet, $paymentDetails);

        $this->assertTrue($result);
    }
}
```

Running it results in rainbows and unicorns: `OK (11 tests, 12 assertions)`.

## WRAP IT UP

There is still much more work to be done. Simply looking at our code we know that we
need to cover the scenario where `$response->approved` is `false`, and then how to
handle the `throw new \Exception($response->error_message);` line.

However, you have now learned of the concept of mocked objects, stubbed methods, and
why dependency injection is such a useful tool for testing.

Next up I will introduce mocked methods (similar but slightly different from mocked
objects and stubbed methods!), catching exceptions and writing tests for ever more
complex code.

Until next time, this is Señor PHP Developer Juan Treminio wishing you adios!
