---
layout: post
categories: [blog]
date: 2022-01-31
title: "OpenAPI Tutorial Part I: Introduction to OpenAPI"
description: Wait, Don't You Mean Swagger?
slug: openapi-tutorial-part-i-introduction-to-openapi
tags:
  - api
  - openapi
  - webdev
  - tutorial
  - swagger
gh_comment_id: 20
---

> This is Part I of a multi-part series. Below are the links to other parts of this tutorial!
>
> * OpenAPI Tutorial Part I: Introduction to OpenAPI
> * [OpenAPI Tutorial Part II: Common API Example](2022-02-05-openapi-tutorial-part-ii-common-api-example.md)
> * [OpenAPI Tutorial Part III: Paths and Basic Request Data](2022-02-06-openapi-tutorial-part-iii-paths-and-basic-request-data.md)
{:class="success"}

> The end result of this article can be found at
> [jtreminio/openapi-tutorial branch "part-i"](https://github.com/jtreminio/openapi-tutorial/tree/part-i).
> You can clone it by doing
>
> `$ git clone git@github.com:jtreminio/openapi-tutorial.git`
>
> Make sure to checkout branch `part-i`.
{:class="info"}

Stop me if one of these scenarios sounds familiar:

* You have a public API but no SDKS. You expect your clients to use cURL to use
  your API.
* You have an internal API, but no documentation. Your team's engineers add
  functionality to endpoints willy-nilly and now it is hard to keep track of
  what parameters, and the types of each parameter, each endpoint expects.
* You have a product, but no API. You have no idea how to even create an API,
  documentation, or examples. How do I even REST?
* You have a mature public API and SDKs across several different languages.
  * Nancy, who maintained the **Ruby SDK**, left 2 years ago and no one else on
    your team knows how to code in Ruby so it is far behind the Python SDK.
  * Joe maintains the **Python SDK**, but he is lazy and slow and does not add
    new features in a timely manner. The Python SDK has some features the Ruby
    SDK is missing but has not been updated in several months and now customers
    are opening GitHub issues demanding an update to at least apply a security
    patch to some random library it uses.
  * Your team is mostly a PHP team so the **PHP SDK** is kind of, more or less,
    almost, but not quite, on par with the actual API implementation. cURL will
    always have access to all the latest API endpoints and parameters. Why can't
    your customers just use cURL?
  * LOL there is no **Java or .Net SDK**. We're a web development company, not
    a Windows shop!

You can use OpenAPI to drastically reduce, and sometimes completely eliminate,
the workload required for creating, maintaining, and updating your API
definition, keeping public documentation on-par with your internal API
representation, and generating, maintaining, and updating your SDKs.

From a single YAML (or JSON) file you can define cURL examples, callback events,
OAuth, and so much more. To be clear, while most of the work required to get
these benefits will be done for you once you have your OpenAPI definitions file
ready, some (especially SDK generation) will still require fine-tuning to both
get around bugs in the tooling and to fit your specific use-case.

## OpenAPI? I Thought It Was Swagger?

Swagger's initial release was in 2011. The company that invented Swagger was
eventually purchased by [SmartBear Software](https://smartbear.com/).
In 2016 the Swagger specification was renamed to OpenAPI Specification. 

Now, "Swagger" refers to the tools offered by the SmartBear Software company,
including:

* [Swagger Editor](https://swagger.io/swagger-editor/)
* [Swagger UI](https://swagger.io/swagger-ui/)
* [Swagger Codegen](https://swagger.io/swagger-codegen/)

They offer several more tools, and if you want to read much more details on the
differences and products offered by Swagger, read their
[What Is the Difference Between Swagger and OpenAPI?](https://swagger.io/blog/api-strategy/difference-between-swagger-and-openapi/)
page.

"OpenAPI" refers only to the actual specification. In other words, OpenAPI is
what is [defined in these files](https://github.com/OAI/OpenAPI-Specification/tree/main/versions).

I will refer back to Swagger's tools only when comparing them to other tools that,
in my opinion, offer more robust support for the latest OpenAPI features.

The distinction here is important. Swagger is a group of tools, but OpenAPI is
just a spec. By itself, OpenAPI does not actually _do_ anything. For that, we
must rely on the overall ecosystem built around the spec. This will become
clearer as you read along.

## What Can I Do With OpenAPI?

At the risk of being too simplistic and getting corrected by internet nerds the
world over, the OpenAPI Spec (OAS) allows you to define a RESTful API in a
YAML or JSON file(s), which we will call your definitions file(s).

You can:

* define endpoints (`POST /account/create`)
* what parameters the endpoints will accept
    (maybe the `POST /account/create` endpoint expects an `email_address`)
* responses from the API to the requester in the form of
  * HTTP codes (`HTTP 200 OK`)
  * or full JSON responses
* authorization, like Basic Auth, API keys, OAuth2, etc

There are a few more main points in the OAS and we will get to them in due time.
The above all exist in your definitions file, but it is just a static text file.
The file itself just implements the rules from the OAS. It is once you have
your spec file that you can begin playing around with the tooling that has
evolved alongside the OAS.

All of the following tools do their work from your definitions file, _that_ is
where the magic of OpenAPI begins to shine.

### Documentation

Several tools exist that read your definitions file and generate beautiful
documentation for end-users to read.

The documentation generated can look different based on which generator you use.
For example, some will create beautiful HTML pages you can open in your browser.
Others can spit out Markdown (or other) files.

There are a number of
[products that you can read about here](https://nordicapis.com/7-open-source-openapi-documentation-generators/).
Some are open-sourced, others are paid. Each one generates pages that look
different from the others, and each one implements the OAS differently as well!

### SDK Generation

You can generate SDKs for end-users in a number of different languages. There are
two major open-sourced generators:

* [openapi-generator](https://github.com/OpenAPITools/openapi-generator)
* [swagger-codegen](https://github.com/swagger-api/swagger-codegen)

Additionally, I know of one major commercial product called
[APIMatic](https://www.apimatic.io/) that can generate SDKs,
documentation, and several others things. They might be a good option if you
want a third-party company to handle almost everything OpenAPI-related for you,
but are somewhat expensive.

## Before Getting Started, Tools to Use

The OpenAPI tool ecosystem is large and fast paced. Because the OAS is just a
file that does not do anything by itself, figuring out all the different
possibilities and deciding which tools to use can be daunting.

Rather than showing your OpenAPI definitions code and letting you figure out
what to do with it, I figure it is easier to recommend some tools you can
install on your machine before we dive in.

### Generating Your Definitions File

You can write your definitions file by hand but I have found that to be
cumbersome and slow. While the OAS allows reusing definitions so you do not have
to copy/paste the same things over and over, it is fairly limited.

For generating your definitions file I recommend using an annotations-based tool.
While this series can be considered language-agnostic, meaning whether you are
strongest in PHP, Javascript, Ruby, etc, I will use a PHP-based
tool called
[zircote/swagger-php](http://zircote.github.io/swagger-php/)
to help generate the OpenAPI definitions file from PHP annotations.

There are a number of similar projects for other languages, and the information
in this series should translate easily! Here are a few:

* PHP - [zircote/swagger-php](http://zircote.github.io/swagger-php/)
* Typescript - [tsoa](https://github.com/lukeautry/tsoa)
* Python - [drf-yasg](https://github.com/axnsan12/drf-yasg)
* Ruby - [source2swagger](https://github.com/solso/source2swagger)
* [See more languages](https://swagger.io/blog/api-development/swagger-annotation-libraries/)

These types of annotations-based tools offer several benefits over manually
maintaining your definitions file:

* They are based on your language of choice and allow you to use language features
  like constants, greatly reducing the need to copy/paste data where the OAS'
  reusability falls short.
* Annotations can be placed alongside the code they are tied to. If you have a
  class that lists all properties an endpoint expects you can add property
  annotations in the same place. This makes maintaining your actual implementation
  with your OpenAPI definitions much simpler.
* Your IDE may assist you with auto-complete

To help reduce language barriers I will first show code using the
`zircote/swagger-php` annotations and then show the result of generating the
definitions so you can compare between your results and mine.

You can install `zircote/swagger-php` via composer with
`composer require zircote/swagger-php`. I will provide setup instructions later
on.

If you are not using PHP please follow the instructions for your specific tool.

### Generating Documentation

For documentation generation I highly recommend using
[redoc-cli](https://redoc.ly/docs/redoc/quickstart/cli/). It
is a CLI-based tool that reads your definitions file and starts a server on your
local machine, using Redoc.

[Redoc is a free, MIT-licensed tool](https://github.com/Redocly/redoc),
and the company that created it also offers a
[paid, commercial product called Redocly](https://redoc.ly/reference-docs).

I am not receiving any kickbacks for recommending Redoc, I simply have tested
a complex definitions file and found that Redoc is the only one that supports
all of the OAS 3.0's features. As we come across those specific features in this
tutorial series I will point them out.

Install `redoc-cli` by
[following the instructions in their quickstart guide](https://redoc.ly/docs/redoc/quickstart/cli/).

You can install it globally by running `npm i -g redoc-cli`.

### SDK Generation

For SDK generation, stick with
[openapi-generator](https://github.com/OpenAPITools/openapi-generator).
It has a large, active community and the
[number of languages it supports](https://openapi-generator.tech/docs/generators/)
is quite impressive.

After extensive testing I have found `openapi-generator` to be the least buggy
and most feature-complete. _That said_, each language that `openapi-generator`
supports is maintained by separate contributors, so code quality, features, and
usability will vary greatly between them!

[Follow their instructions to install](https://openapi-generator.tech/docs/installation/).

If you are on MacOS I highly recommend installing via Homebrew:
`brew install openapi-generator`.

If you are on Linux (or have Docker installed on Windows), use Docker.

`openapi-generator` is a Java application and its dependencies might be a bit
frustrating to setup.

### Choosing an API to Implement

For this tutorial series we will create an API similar (but different) to the
[Pet Store API](https://petstore.swagger.io/#/) from the ground up. Doing so
will help make it clear how all the separate pieces fit together to create
the final product. I will try to make the process mimic how a company with an
existing, manually-maintained API would implement OpenAPI.

Additionally, we will extend this API to include some more advanced features
available in OAS 3.x. Not all APIs are as simple as the default Pet Store
example, so I am hoping this will turn out to be a good learning experience.

We will make mistakes, and implement code that may look weird or seem like alot
of copy and pasting, but I want this tutorial series to seem organic. Not
everyone begins with a well-made API before moving to OpenAPI, and I want to
make this useful as a real-world guide.

## Initial Setup

Assuming you have already installed the tools from above we can now create the
scripts to call these tools. First, our project's basic directory structure.

### Organizing Our Code

We will create a directory to contain our executables so we do not have to
memorize the commands for regenerating the definitions file, starting the
documentation server, and  (eventually) creating our SDKs. This will be the
`bin` directory.

Create directories to hold our Controller and Model classes:

```bash
$ mkdir -p ./bin ./src/Controller ./src/Model

$ tree
.
├── bin
│   └── // ... empty
└── src
    ├── Controller
    │   └── // ... empty
    └── Model
        └── // ... empty

```

### Setting Up `zircote/swagger-php`

Install it with composer:

```bash
$ composer require zircote/swagger-php

Using version ^4.2 for zircote/swagger-php
./composer.json has been created
Running composer update zircote/swagger-php
Loading composer repositories with package information

# ... snip

Package operations: 10 installs, 0 updates, 0 removals
  - Installing symfony/yaml (v5.4.3): Extracting archive
  - Installing zircote/swagger-php (4.2.4): Extracting archive
1 package suggestions were added by new dependencies, use `composer suggest` to see details.
Generating autoload files

```

Create a file at `./bin/generate.php`:

```php
#!/usr/bin/env php
<?php

require_once __DIR__.'/../vendor/autoload.php';

use OpenApi\Generator;
use Symfony\Component\Yaml\Yaml;

$openapi = Generator::scan([__DIR__.'/../src']);
$yaml = $openapi->toYaml(
    Yaml::DUMP_OBJECT_AS_MAP
    ^ Yaml::DUMP_EMPTY_ARRAY_AS_SEQUENCE
    ^ Yaml::DUMP_MULTI_LINE_LITERAL_BLOCK
);

$oas_file = __DIR__.'/../openapi.yaml';
file_put_contents($oas_file, $yaml);
echo "Wrote OAS file to {$oas_file}\n";

```

You can make it executable with `chmod +x ./bin/generate.php` or run it directly
with php.

All we have done here is told `zircote/swagger-php` (namespaced as `OpenApi`)
to scan the `./src` directory for its annotations, then write the generated
definitions to the `./openapi.yaml` file.

Whenever we make a change to our OpenAPI annotations we can run this script to
regenerate our definitions file.

### Setting Up `redoc-cli`

Create a file at `./bin/docs.sh`:

```bash
#!/usr/bin/env bash

set -e
DIR=$(cd `dirname $0` && pwd)

redoc-cli serve \
  "${DIR}/../openapi.yaml" \
  --port=8080 \
  --watch \
  --options.requiredPropsFirst=1

```

Make it executable with `chmod +x ./bin/docs.sh`.

Once we create our initial definitions file we can run this script to keep
Redoc open in a browser. Whenever we regenerate the definitions file refreshing
the browser will show the latest changes.

### Create OpenApi Entry File

Before we can run the generator for the first time we need to create a file with
the minimum annotations requirements. Create a `./src/OpenApi.php` file with
the following contents:

```php
<?php

declare(strict_types=1);

namespace PetStoreApi;

use OpenApi\Annotations as OA;

/**
 * @OA\OpenApi(openapi="3.0.3")
 * @OA\Info(title="Pet Store Api",
 *     version="1.0.0",
 * )
 * @OA\Server(url="https://petstore.example.com/")
 */
class OpenApi
{
}

```

The `@OA` annotations will be read by the `zircote/swagger-php` library when
generating our definitions file.

If you are following along in PHP you may want to read a little of the
[zircote/swagger-php](http://zircote.github.io/swagger-php/) documentation. If
you are using another language, do the same with your tool!

#### Initial Generation

When you run the generator script it will create a file for you. Do not worry
about warnings at this point, we will fill out the requirements in the next steps.

```bash
$ php ./bin/generate.php

Warning: Required @OA\PathItem() not found in ./vendor/zircote/swagger-php/src/Loggers/DefaultLogger.php on line 27
Wrote OAS file to ./bin/../openapi.yaml

```

Take a look at the newly-created `./openapi.yaml` file. It should have the
following contents:

```yaml
openapi: 3.0.0
info:
  title: 'Pet Store Api'
  version: 1.0.0
servers:
  -
    url: 'https://petstore.example.com/'

```

Now you can run the documentation script to get Redoc working!

```bash
$ ./bin/docs.sh

Server started: http://127.0.0.1:8080
👀  Watching ./ for changes...

```

Open [http://127.0.0.1:8080](http://127.0.0.1:8080) in your browser and you
should see the Redoc documentation. It will be bare bones right now, but we will
quickly start filling this in.

### Final Project Structure

As of now you should have a project structure that looks like this:

```bash
$ tree -a --filesfirst
.
├── composer.json
├── composer.lock
├── openapi.yaml
├── bin
│   ├── docs.sh
│   └── generate.php
├── src
│   ├── OpenApi.php
    ├── Controller
    │   └── // ... empty
    └── Model
        └── // ... empty
└── vendor
    ├── autoload.php
    ├── bin
    │   └── openapi -> ../zircote/swagger-php/bin/openapi
    └── // ... snip

```

### Extra Credit

We are going to be writing a lot of annotations, and sometimes an IDE may get
confused with exactly how many spaces to indent multi-nested definitions.

For example, the `info` block in your definitions file can contain much more
information, like so:

```php
/**
 * @OA\OpenApi(openapi="3.0.3")
 * @OA\Info(title="Pet Store Api",
 *     version="1.0.0",
 *     @OA\License(name="MIT",
 *          url="https://opensource.org/licenses/MIT"
 *      ),
 * )
 */

```

If you care about consistent spacing the above should look like this:

```php
/**
 * @OA\OpenApi(openapi="3.0.3")
 * @OA\Info(title="Pet Store Api",
 *     version="1.0.0",
 *     @OA\License(name="MIT",
 *         url="https://opensource.org/licenses/MIT"
 *     ),
 * )
 */

```

It is a small thing, but once you get 4, 5 levels deep the small differences
can get annoying.

Let's use `friendsofphp/php-cs-fixer` to automatically format our code every time
we regenerate our definitions file:

```bash
$ composer require --dev friendsofphp/php-cs-fixer

Using version ^3.4 for friendsofphp/php-cs-fixer
./composer.json has been updated
# ... snip
```

Create a `./.php-cs-fixer.php` file to contain the configuration options:

```php
<?php

$finder = PhpCsFixer\Finder::create()
    ->in(__DIR__.'/src');

$config = new PhpCsFixer\Config();
return $config->setRules([
    '@DoctrineAnnotation' => true,
    '@Symfony'            => true,
])
    ->setFinder($finder)
    ->setRiskyAllowed(true);

```

Now update the `./bin/generate.php` file so its contents are as follows:

```php
#!/usr/bin/env php
<?php

require_once __DIR__.'/../vendor/autoload.php';

use OpenApi\Generator;
use Symfony\Component\Yaml\Yaml;

$openapi = Generator::scan([__DIR__.'/../src']);
$yaml = $openapi->toYaml(
    Yaml::DUMP_OBJECT_AS_MAP
    ^ Yaml::DUMP_EMPTY_ARRAY_AS_SEQUENCE
    ^ Yaml::DUMP_MULTI_LINE_LITERAL_BLOCK
);

$oas_file = __DIR__.'/../openapi.yaml';
file_put_contents($oas_file, $yaml);
echo "Wrote OAS file to {$oas_file}\n";

echo "\nRunning php-cs-fixer\n";
shell_exec(__DIR__.'/../vendor/bin/php-cs-fixer fix');

```

Your annotations will be fixed every time you generate:

```bash
$ ./bin/generate.php

Warning: Required @OA\PathItem() not found in ./vendor/zircote/swagger-php/src/Loggers/DefaultLogger.php on line 27
Wrote OAS file to ./bin/../openapi.yaml

Running php-cs-fixer
Loaded config default from "./.php-cs-fixer.php".
Using cache file ".php-cs-fixer.cache".

```

You should have ended up with this:

```bash
$ tree -a --filesfirst
.
├── .php-cs-fixer.cache
├── .php-cs-fixer.php
├── composer.json
├── composer.lock
├── openapi.yaml
├── bin
│   ├── docs.sh
│   └── generate.php
├── src
│   ├── OpenApi.php
    ├── Controller
    │   └── // ... empty
    └── Model
        └── // ... empty
└── vendor
    ├── autoload.php
    ├── bin
    │   ├── openapi -> ../zircote/swagger-php/bin/openapi
    │   └── php-cs-fixer -> ../friendsofphp/php-cs-fixer/php-cs-fixer
    └── // ... snip

```

## Wrapping It Up

Today we briefly spoke about the differences between Swagger and OpenAPI.
We touched on the various things you can do with an OpenAPI definitions file,
and some of the tools you can use to do these things.

We have installed tools to generate our definitions file, run a documentation
server, and (optionally) do some formatting of our annotations declarations.

We even generated our first definitions file (even though it is missing some
required data) and saw our documentation page (even though it's pretty blank!).

In the next part of this series we will start implementing actual endpoints and
their parameters. Eventually we will begin adding more advanced features like
authentication.

Until next time, this is Señor PHP Developer Juan Treminio wishing you adios!    
