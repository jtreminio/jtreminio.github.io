---
layout: post
categories: [blog]
date: 2022-02-06
title: "OpenAPI Tutorial Part III: Paths and Basic Request Data"
description: Mapping Incoming Data to OpenAPI
slug: openapi-tutorial-part-iii-paths-and-basic-request-data
tags:
  - api
  - openapi
  - webdev
  - tutorial
  - swagger
gh_comment_id: 22
---

> This is Part III of a multi-part series. Below are the links to other parts of this tutorial!
>
> * [OpenAPI Tutorial Part I: Introduction to OpenAPI](2022-01-31-openapi-tutorial-part-i-are-you-looking-for-swagger.md)
> * [OpenAPI Tutorial Part II: Common API Example](2022-02-05-openapi-tutorial-part-ii-common-api-example.md)
> * OpenAPI Tutorial Part III: Paths and Basic Request Data
{:class="success"}

> The end result of this article can be found at
> [jtreminio/openapi-tutorial branch "part-iii"](https://github.com/jtreminio/openapi-tutorial/tree/part-iii).
> You can clone it by doing
>
> `$ git clone git@github.com:jtreminio/openapi-tutorial.git`
>
> Make sure to checkout branch `part-iii`.
{:class="info"}

[OpenAPI Tutorial Part II: Common API Example](2022-02-05-openapi-tutorial-part-ii-common-api-example.md)
introduced a basic API codebase that we will begin adding OpenAPI support to.

Today we will go over adding paths, and the basic types of request data.

## Is Redoc Documentation Server Running?

Before you go any further, make sure your Redoc server is running:

```bash
$ ./bin/docs.sh

Server started: http://127.0.0.1:8080
👀  Watching ./ for changes...
```

## Adding Paths

You will notice that the `jtreminio/openapi-tutorial` already contains some
helpful comments to help developers know how each endpoint is supposed to work.

For example:

```php
class PetController
{
    /**
     * POST /pet
     */
    public function petCreate(RequestInterface $request): string
    {
        // ...
    }
}

```

There are also endpoints using path parameters with these comments:

```php
    /**
     * PUT /pet/{id}/photo
     */
    public function petUpdatePhoto(RequestInterface $request): string
    {
        // ...
    }

```

These comments are strictly for human readers, they do not affect your OpenAPI
definitions. I included them because I expect many of your existing APIs might
contain similar data. This might be the case for other parts of the codebase -
you and your team have probably left behind comments to help each other better
understand what the intended purpose of an endpoint is, how it is supposed to be
called, what parameters it expects.

The benefit of using OpenAPI is you begin codifying these random and haphazard
comments into a strict definition.

### Definition of a Path

Paths are the endpoints your API makes available for users. They will contain
the verb (`GET`, `POST`, `PUT`, `DELETE`, etc) and, if applicable, path
parameters.

Paths combine the verb and the endpoint to create a unique definition. All this
means is that `POST /order` is a different path than `UPDATE /order`.

### Your First Path Definition

Let's begin with `PetController::petCreate()`, which does not have any path
parameters:

```php
    /**
     * POST /pet
     */
    public function petCreate(RequestInterface $request): string
    {
        // ...
    }

```

Import the `OpenApi\Annotations` annotations namespace at the top of the class:

```php
<?php

declare(strict_types=1);

namespace PetStoreApi\Controller;

use OpenApi\Annotations as OA;
use PetStoreApi\Model;
use PetStoreApi\RequestInterface;

```

Now, add our first path definition:

```php
class PetController
{
    /**
     * @OA\Post(path="/pet",
     *     summary="Add a new pet",
     *     operationId="petCreate",
     *     tags={"Pet"},
     * )
     */
    public function petCreate(RequestInterface $request): string
    {

```

Finally, generate the new definitions file:

```bash
$ ./bin/generate.php

Warning: @OA\Post() requires at least one @OA\Response()
    in \PetStoreApi\Controller\PetController->petCreate()
    in ./src/Controller/PetController.php on line 20
    in ./vendor/zircote/swagger-php/src/Loggers/DefaultLogger.php on line 27

Wrote OAS file to ./bin/../openapi.yaml

Running php-cs-fixer
Loaded config default from "./.php-cs-fixer.php".
Using cache file ".php-cs-fixer.cache".

```

Ignore the warning for now,
[reload your Redoc browser window](http://127.0.0.1:8080), and you should see
the beginning of some documentation.

| ![your-first-endpoint-definition.png](/static/post/2022-02-06-openapi-tutorial-part-iii-paths-and-basic-request-data/your-first-endpoint-definition.png) |
|:--:|
| Your first endpoint definition |
{:class="table img-link"}

If you take a look at your `openapi.yaml` file you should see the change in
the definition:

```yaml
# ...
paths:
  /pet:
    post:
      tags:
        - Pet
      summary: 'Add a new pet'
      operationId: petCreate

```

### Break It Down - Path Annotations

These four new lines of data are the core pieces of a path definition. Let's go
over each part before moving on.

#### Verb + Path

In our `PetController::petCreate()` we have added the following:

```php
class PetController
{
    /**
     * @OA\Post(path="/pet",
     *     summary="Add a new pet",
     *     operationId="petCreate",
     *     tags={"Pet"},
     * )
     */
    public function petCreate(RequestInterface $request): string
    {

```

This is a path definition. `zircote/swagger-php` has an annotation for each
major verb:

* `@OA\Delete()`
* `@OA\Get()`
* `@OA\Head()`
* `@OA\Options()`
* `@OA\Patch()`
* `@OA\Post()`
* `@OA\Put()`
* `@OA\Trace()`

You really only need `@OA\Delete()`, `@OA\Get()`, `@OA\Post()`, and `@OA\Put()`.

The type of annotation you select and the `path` value will be combined in the
generated definition.

`@OA\Post(path="/pet")` generates:

```yaml
paths:
  /pet:
    post:
      # ...

```

While `@OA\Get(path="/pet")` generates:

```yaml
paths:
  /pet:
    get:
      # ...

```

If you have two paths, one with `@OA\Post(path="/pet")` and the other with
`@OA\Get(path="/pet")` you can clearly see how OpenAPI considers these separate
definitions:

```yaml
paths:
  /pet:
    get:
      # ...
    post:
      # ...

```

#### Summary & Description

We also define a `summary` value, `summary="Add a new pet"`. In Redoc `summary`
is used for the left sidebar listing all endpoints available, along with the
verb (`Post`). Each documentation generator will work differently and if you are
using something else you will need to experiment yourself!

There is also `description` which we have not used yet. It is similar to
`summary` except longer.

#### Operation ID

`operationId` is a unique identifier for this path, `operationId="petCreate"`.
It must be unique across your entire definitions file. The convention is up to
you, some teams like to use `{verb}{Path}{Action}` like `postPetCreate`.
Others use `{action}{PathRoot}` like `createPet`.

I use `{pathRoot}{Action}` like `petCreate`. It helps group common paths
together:

* `petCreate`
* `petGet`
* `petUpdate`
* `petDelete`
* `petList`
* `petFindBy`
* `petUpdatePhoto`

#### Tags

Finally, we use `tags` to group common functionality together, `tags={"Pet"}`.

In Redoc this groups paths under a dropdown. You can think of them as categories.
We will eventually have "Pet", "Customer", and "Store" tags. One endpoint can
have one or more tags.

> A note about curly braces `{ }`. `zircote/swagger-php` uses the
> `doctrine/annotations` library to handle reading annotations. Unfortunately this
> library does not (currently) support PHP-style array braces `[ ]`, which means
> that even for true arrays we must use curly braces `{ }`.
> 
> You would normally expect to see `tags=["Pet"]` but instead we must use
> `tags={"Pet"}`.
{:class="info"}

Now it is time to let OpenAPI know what parameters this endpoint expects!

## Adding a Body Definition

The `POST /pet` is expecting data as part of the body request, and a possible
file upload.

| parameter | type                                       |
|-----------|--------------------------------------------|
| `name`    | string                                     |
| `age`     | integer                                    |
| `type`    | string `dog`, `cat`, or `fish`             |
| `status`  | string `available`, `pending`, or `sold`   |
| `info`    | object `DogInfo`, `CatInfo`, or `FishInfo` |
| `photo`   | binary (file upload)                       |
{:class="table table-striped"}

This endpoint does not use the `id` property in the `Model\Pet` class. We will
get to that later.

### Body Annotations

You tell the annotations library this is a body schema by using `@OA\Schema()`
and defining the `schema` property:

```php
/**
 * @OA\Schema(schema="Pet")
 */
class Pet
{

```

Add an `@OA\Property()` definition to the `name` property:

```php
    /**
     * @var string
     * @OA\Property()
     */
    public $name;

```

The `zircote/swagger-php` annotation library supports auto-detecting the property
type by reading the `@var` attached to each property, or detecting any default
value assigned to the property. However, I find it is best to explicitly define
the type:

```php
    /**
     * @var string
     * @OA\Property(type="string")
     */
    public $name;

```

Now, if you generate the definitions file again (`$ ./bin/generate.php`) you
will see the new schema:

```yaml
components:
  schemas:
    Pet:
      properties:
        name:
          type: string
      type: object

```

Do the same for `age`, `type`, and `status`:

```php
    /**
     * @var int
     * @OA\Property(type="integer")
     */
    public $age;

    // ...

    /**
     * @var string "dog"|"cat"|"fish"
     * @OA\Property(type="string")
     */
    public $type;

    // ...

    /**
     * @var string "available"|"pending"|"sold"
     * @OA\Property(type="string")
     */
    public $status = 'available';

```

So far the types are simple, `type="integer"` and `type="string"`. What would
you expect a file upload to be? If you guessed `type="file"` or `type="binary"`
you would be forgiven for being wrong.

```php
    /**
     * @var \SplFileInfo|null
     * @OA\Property(type="string",
     *     format="binary",
     * )
     */
    public $photo = null;

```

> For now, let's skip over adding a definition for `info`. I promise we will come
> back to it in later parts of this series, but discriminators are a bit more
> advanced than what you are learning right now.
{:class="warning"}

Regenerate your definitions file (`$ ./bin/generate.php`) and behold:

```yaml
components:
  schemas:
    Pet:
      properties:
        name:
          type: string
        age:
          type: integer
        photo:
          type: string
          format: binary
        type:
          description: '"dog"|"cat"|"fish"'
          type: string
        status:
          description: '"available"|"pending"|"sold"'
          type: string
      type: object

```

### Break It Down - Body Annotations

`zircote/swagger-php` is helping us out quite a bit here. We first tell it that
this entire class is a schema definition:

```php
/**
 * @OA\Schema(schema="Pet")
 */
class Pet
{

```

That generates this YAML:

```yaml
components:
  schemas:
    Pet:

```

You can change `schema` to any unique name you want, it is completely separate
from the actual class name. We only used the same name for class and schema to
make this easier to learn.

With the above, `zircote/swagger-php` now knows that the class directly following
the annotation will contain more annotations that should be added to the
definition. That is why this annotation works:

```php
    /**
     * @var string "dog"|"cat"|"fish"
     * @OA\Property(type="string")
     */
    public $type;

```

The `@OA\Property()` annotations works in a similar way to the `@OA\Schema()`
annotations - it is attached to the property directly following the annotation.
So, the following would not affect `$info`:

```php
    /**
     * @var string "dog"|"cat"|"fish"
     * @OA\Property(type="string")
     */
    public $type;

    /**
     * @var DogInfo|CatInfo|FishInfo
     */
    public $info;

```

You will also notice that any text added in the `@var` docblock is used as the
parameter's description. We can change this later but keep it for now.

```yaml
        type:
          description: '"dog"|"cat"|"fish"'
          type: string

```

If you reload your documentation page you will not actually see any of these
changes! For that, we need to reference this new `Pet` schema from the
`POST /pet` path.

## Referencing a Schema

Back in `PetController::petCreate()`, update the path annotation to:

```php
    /**
     * @OA\Post(path="/pet",
     *     summary="Add a new pet",
     *     operationId="petCreate",
     *     tags={"Pet"},
     *     @OA\RequestBody(
     *         @OA\MediaType(mediaType="multipart/form-data",
     *             @OA\Schema(ref="#/components/schemas/Pet"),
     *         ),
     *     ),
     * )
     */
    public function petCreate(RequestInterface $request): string
    {

```

Refresh your documentation page and see the magic:

| ![your-first-request-body.png](/static/post/2022-02-06-openapi-tutorial-part-iii-paths-and-basic-request-data/your-first-request-body.png) |
|:--:|
| Your first request body |
{:class="table img-link"}

### Break It Down - RequestBody Annotations

I just introduced two new annotations to you, `@OA\RequestBody()` and
`@OA\MediaType()`.

For an endpoint that expects body data (for example, from forms) we use the
`@OA\RequestBody()` annotation. This annotation should only be combined with
`@OA\Post()` and `@OA\Put()` (and `@OA\Patch()` if you ever use it).

`@OA\MediaType()` defines the content-type this endpoint will accept. For any
endpoint that will accept a file upload, you must use `multipart/form-data`.
You can use anything here, but should probably stick with the most common:

* `application/json`
* `application/xml`
* `text/plain; charset=utf-8`

You can see more examples in
[Swagger's Media Type page](https://swagger.io/docs/specification/media-types/).

So far what we have is

```yaml
paths:
  /pet:
    post:
      tags:
        - Pet
      summary: 'Add a new pet'
      operationId: petCreate
      requestBody:
        content:
          multipart/form-data:
            # ...

```

Finally, you see the powerful `ref` for the first time. `ref` deserves to have
a large chunk of text explaining it, but for now let's keep it simple.

#### At a Glance - `ref`

`ref` is actually `$ref` when written to the `openapi.yaml` file. However, our
annotations library expects `ref`. Here is what it looks like:

```yaml
paths:
  /pet:
    post:
      tags:
        - Pet
      summary: 'Add a new pet'
      operationId: petCreate
      requestBody:
        content:
          multipart/form-data:
            schema:
              $ref: '#/components/schemas/Pet'

```

We use this special tool to reference schema defined in other parts of our
definitions file. The first parts are the location OpenAPI can find the schema:
`#/components/schemas`.

The last part is the actual schema name, `Pet`.

This is powerful because it allows us to reuse schemas without having to copy
and paste their definitions over and over.

## Enum Property Types

So far we have only added simple property types to our definitions, those that
are `string`, `integer`, or `string::binary` (file upload).

The `string::binary` type clues us in that we can have further sub-types. One
such example are enums.

The `Pet::$type` property is currently defined as

```php
    /**
     * @var string "dog"|"cat"|"fish"
     * @OA\Property(type="string")
     */
    public $type;

```

However, the `"dog"|"cat"|"fish"` part is only a docblock description, it
does not actually apply to the OpenAPI definition (outside of description).

We can easily tell OpenAPI this is an enum by using `string::enum`:

```php
    /**
     * @var string
     * @OA\Property(type="string",
     *     enum={"dog", "cat", "fish"}
     * )
     */
    public $type;

```

Now our definitions file knows this is an enum and will require that the string
is only one of the allowed:

```yaml
components:
  schemas:
    Pet:
      properties:
        # ...
        type:
          type: string
          enum:
            - dog
            - cat
            - fish
      type: object

```
 Do the same for `status`:

```php
    /**
    * @var string
    * @OA\Property(type="string",
    *     enum={"available", "pending", "sold"}
    * )
    */
   public $status = 'available';

```

Regenerate your descriptions file:

```yaml
components:
 schemas:
   Pet:
     properties:
       # ...
       type:
         type: string
         enum:
           - dog
           - cat
           - fish
       status:
         type: string
         enum:
           - available
           - pending
           - sold
     type: object
 
 ```

 Now [reload your Redoc browser window](http://127.0.0.1:8080) and we see
 something useful:

 | ![enums.png](/static/post/2022-02-06-openapi-tutorial-part-iii-paths-and-basic-request-data/enums.png) |
|:--:|
| Enums example |
{:class="table img-link"}

### But Wait, There's More

So far we have used `zircote/swagger-php` for things that we can easily do by
manually-creating the definitions file. Let me show you one immediate benefit!

Enums are just arrays of values and are defined as you would expect:

```php
    /**
     * @var string
     * @OA\Property(type="string",
     *     enum={"dog", "cat", "fish"}
     * )
     */
    public $type;

```

Since the annotations live in a PHP class, we can benefit from actual PHP code
in the annotations. If this enum is just an array, why not create a constant
that contains the possible values?

```php
/**
 * @OA\Schema(schema="Pet")
 */
class Pet
{
    public const TYPE_ENUM = [
        'dog',
        'cat',
        'fish',
    ];

    public const STATUS_ENUM = [
        'available',
        'pending',
        'sold',
    ];

    // ...

    /**
     * @var string
     * @OA\Property(type="string",
     *     enum=\PetStoreApi\Model\Pet::TYPE_ENUM
     * )
     */
    public $type;

    // ...

    /**
     * @var string
     * @OA\Property(type="string",
     *     enum=\PetStoreApi\Model\Pet::STATUS_ENUM
     * )
     */
    public $status = 'available';

```

Note that you need to use the FQDN when reference a constant in this manner.

This is only the most basic of what you can do with constants. As we go further
along in this series we will see more useful examples!

## Wrapping It Up

We have our first path defined! It even has some (basic) parameters,
including a file upload and two enums!

In the next part of this series we will create more paths and their parameters,
and we will go over how to add complex parameter types like arrays, objects,
and arrays of objects.

So much left to do, but having the Redoc documentation to see our changes as we
make them is a great motivator. I encourage you to continue playing with the API
and reading both the
[Swagger OpenAPI Guide](https://swagger.io/docs/specification/about/) and the
[`zircote/swagger-php`](http://zircote.github.io/swagger-php/) documentation
to further familiarize yourself with the concepts we have learned so far, and
what we will learn in the upcoming parts of this series.

Until next time, this is Señor PHP Developer Juan Treminio wishing you adios!    
