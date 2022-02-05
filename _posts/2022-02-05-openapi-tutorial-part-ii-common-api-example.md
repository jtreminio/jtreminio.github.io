---
layout: post
categories: [blog]
date: 2022-02-05
title: "OpenAPI Tutorial Part II: Common API Example"
description: Does This Look Familiar?
slug: openapi-tutorial-part-ii-common-api-example
tags:
  - api
  - openapi
  - webdev
  - tutorial
  - swagger
gh_comment_id: 21
---

> This is Part II of a multi-part series. Below are the links to other parts of this tutorial!
>
> * [OpenAPI Tutorial Part I: Introduction to OpenAPI](2022-01-31-openapi-tutorial-part-i-are-you-looking-for-swagger.md)
> * OpenAPI Tutorial Part II: Common API Example
{:class="success"}

In the first part of this series we

* lightly touched on the differences between Swagger and OpenAPI
* mentioned some things we can do with an OpenAPI definitions file
* recommended tools for
  * definitions file generation
  * documentation generation
  * SDK generation
* decided to implement an API similar to the common [Pet Store API](https://petstore.swagger.io/#/)
* created annotations for generating an almost empty definitions file
* viewed our empty documentation via Redoc

Today, I want to begin with an already created, simple API. The purpose of this
tutorial series is not to show you how to build an API from scratch, but rather
to learn how you can take your existing API and use OpenAPI to make the whole
process _better_.

## jtreminio/openapi-tutorial

I want to introduce you to my repo,
[`jtreminio/openapi-tutorial`](https://github.com/jtreminio/openapi-tutorial).
I will use this repo to follow along with the progress made in this tutorial
series.

This repo contains a (very) basic API example and I highly suggest you clone it
locally to follow along. For this article we will begin with branch `part-ii`.

```bash
$ git clone git@github.com:jtreminio/openapi-tutorial.git
$ cd openapi-tutorial
$ git checkout part-ii

```

Let us take a look at what is going on with this API!

### Controllers

We will have
[three basic controllers](https://github.com/jtreminio/openapi-tutorial/tree/part-ii/src/Controller),
one each for managing
[pets](https://github.com/jtreminio/openapi-tutorial/blob/part-ii/src/Controller/PetController.php),
[customers](https://github.com/jtreminio/openapi-tutorial/blob/part-ii/src/Controller/CustomerController.php),
and [orders](https://github.com/jtreminio/openapi-tutorial/blob/part-ii/src/Controller/OrderController.php).
You have probably seen code like this before, it is a basic _CRUD_ web
application! Each controller will have the most common functionality:

* **C**reate
* **R**etrieve
* **U**pdate
* **D**elete

Controllers represent data being sent _from_ the user _to_ our API. OpenAPI calls
these _requests_.

> Please note that this is a basic implementation of _only_ the API structure.
> We are not going to implement database functionality like retrieving or
> persisting data. Anywhere that you see `// persist $pet here` or
> `// find pet in DB here` assume that we would have the logic for performing
> those actions there. However, for the purposes of this tutorial series we can
> just hand-wave those concerns away!
{:class="info"}

#### Pet Controller

The [PetController](https://github.com/jtreminio/openapi-tutorial/blob/part-ii/src/Controller/PetController.php)
class is used for managing pets. Our Pet Store will have an inventory of pets,
and these endpoints are what will be used. Users can add new pets, update existing
pets (including uploading a photo of a pet), search for pets by a unique `id`
value or by some terms, and delete pets from the store.

Here is the list of actions and a short description for each:

| endpoint              | description                                           |
|-----------------------|-------------------------------------------------------|
| `POST /pet`           | Add a new pet to the store                            |
| `GET /pet/{id}`       | Gets a single pet by `{id}`                           |
| `GET /pet/findBy`     | Finds one or more pets by `name`, `type`, or `status` |
| `GET /pet/list`       | Returns paginated list of pets                        |
| `PUT /pet/{id}`       | Update a single pet by `{id}`                         |
| `PUT /pet/{id}/photo` | Update a single pet's photo                           |
| `DELETE /pet/{id}`    | Delete a single pet by `{id}`                         |
{:class="table table-striped"}

#### Customer Controller

The [CustomerController](https://github.com/jtreminio/openapi-tutorial/blob/part-ii/src/Controller/CustomerController.php)
class is used for managing customers. The actions available will be very similar
to those found in the `PetController`.

Here is the list of actions and a short description for each:

| endpoint                      | description                                     |
|-------------------------------|-------------------------------------------------|
| `POST /customer`              | Add a new customer to the store                 |
| `GET /customer/{id}`          | Gets a single customer by `{id}`                |
| `GET /customer/findBy`        | Finds one or more customers by `name`, `email_address`, `address`, or `phone_number` |
| `GET /customer/list`          | Returns paginated list of customers             |
| `PUT /customer/{id}`          | Update a single customer by `{id}`              |
| `DELETE /customer/{id}`       | Delete a single customer by `{id}`              |
| `PUT /customer/{id}/phone`    | Add a phone number to an existing customer      |
| `DELETE /customer/{id}/phone` | Delete a phone number from an existing customer |
{:class="table table-striped"}

#### Order Controller

The [OrderController](https://github.com/jtreminio/openapi-tutorial/blob/part-ii/src/Controller/OrderController.php)
class is used for managing orders. The actions available will be very similar
to those found in the `PetController`.

Here is the list of actions and a short description for each:

| endpoint             | description                                                      |
|----------------------|------------------------------------------------------------------|
| `POST /order`        | Add a new order to the store                                     |
| `GET /order/{id}`    | Gets a single order by `{id}`                                    |
| `GET /order/findBy`  | Finds one or more orders by `customer_id`, `pet_id`, or `status` |
| `GET /order/list`    | Returns paginated list of orders                                 |
| `PUT /order/{id}`    | Update a single order by `{id}`                                  |
| `DELETE /order/{id}` | Delete a single order by `{id}`                                  |
{:class="table table-striped"}

### Models

We have three root models, and a few extra models that will be nested within
the root models.

These models contain no logic, they are strictly for holding data in a known shape
(in other words, a [DTO](https://dzone.com/articles/practical-php/practical-php-patterns-data)).

#### Pet Model

The [Pet Model](https://github.com/jtreminio/openapi-tutorial/blob/part-ii/src/Model/Pet.php)
has some interesting properties:

| property | description                                                             |
|----------|-------------------------------------------------------------------------|
| `photo`  | A photo of a pet. It is `nullable`. The photo comes from a user upload  |
| `type`   | An enum with an allowed value of `dog`, `cat`, or `fish`                |
| `info`   | Depending on the `type` value above, a different sub-class will be used. [`DogInfo`](https://github.com/jtreminio/openapi-tutorial/blob/part-ii/src/Model/DogInfo.php) for `dog`, [`CatInfo`](https://github.com/jtreminio/openapi-tutorial/blob/part-ii/src/Model/CatInfo.php) for `cat`, [`FishInfo`](https://github.com/jtreminio/openapi-tutorial/blob/part-ii/src/Model/FishInfo.php) for `fish` |
| `status` | Another enum with an allowed value of `available`, `pending`, or `sold` |
{:class="table table-striped"}

#### Customer Model

The [Customer Model](https://github.com/jtreminio/openapi-tutorial/blob/part-ii/src/Model/Customer.php)
has some interesting properties:

| property        | description                                                       |
|-----------------|-------------------------------------------------------------------|
| `address`       | Address of the customer, represented by the [`Address`](https://github.com/jtreminio/openapi-tutorial/blob/part-ii/src/Model/Address.php) model |
| `phone_numbers` | An array of [`Phone`](https://github.com/jtreminio/openapi-tutorial/blob/part-ii/src/Model/Phone.php) models |
{:class="table table-striped"}

#### Order Model

The [Order Model](https://github.com/jtreminio/openapi-tutorial/blob/part-ii/src/Model/Order.php)
is pretty boring, with only one note-worthy property:

| property | description                                                          |
|----------|----------------------------------------------------------------------|
| `status` | An enum with an allowed value of `placed`, `shipped`, or `delivered` |
{:class="table table-striped"}

## Why This API?

So the above API is pretty boring, right? Nothing exciting about it, at all.
That is the point. Start off with something you have seen a thousand times
before and apply some new tooling to end up with an amazing new result.

Looks can be deceiving, though. Yes, this API is boring, but it actually has
some very interesting properties I would like to point out.

### Verbs

We saw the use of several REST verbs above:

* `POST /pet`
* `PUT /pet/{id}`
* `GET /pet/{id}`
* `DELETE /pet/{id}`

There are a few more, but these four will meet almost all your needs. Their
purpose is pretty clear and different from the other:

* `POST` - Create a new record, like creating a new pet
* `PUT` - Similar to `POST` but used to update en existing record, like changing
  the name of an existing pet
* `GET` - Get an existing record, like searching for an existing pet
* `DELETE` - Delete an existing record, like deleting an existing pet

### Enums

If you are a PHP developer you know that Enums are available as of version 8.1.

However, you can define properties as enum in OpenAPI easily. The endpoint
`GET /customer/findBy` has a `type` string property that can only be one of the
following values:

* `name`
* `email_address`
* `address`
* `phone_number`

We will learn how to define this using OpenAPI.

### Nested Objects

The Customer Model's
[`address`](https://github.com/jtreminio/openapi-tutorial/blob/part-ii/src/Model/Customer.php#L29-L32)
property is a single non-nullable instance of the
[`Address`](https://github.com/jtreminio/openapi-tutorial/blob/part-ii/src/Model/Address.php)
model.

### Arrays

The Customer Model's
[`phone_numbers`](https://github.com/jtreminio/openapi-tutorial/blob/part-ii/src/Model/Customer.php#L34-L37)
property is defined as an array of `Phone` objects, (`Phone[]`).

### Polymorphism

Feels like you are back in college, right?

The Pet Model has a very special
[`info`](https://github.com/jtreminio/openapi-tutorial/blob/part-ii/src/Model/Pet.php#L34-L37)
property that can be one of three types. The value of this `info` property
completely depends on the value of the
[`type`](https://github.com/jtreminio/openapi-tutorial/blob/part-ii/src/Model/Pet.php#L29-L32) property:

| scenario          | `info` instance type                |
|-------------------|-------------------------------------|
| `type === "dog"`  | `info` is an instance of `DogInfo`  |
| `type === "cat"`  | `info` is an instance of `CatInfo`  |
| `type === "fish"` | `info` is an instance of `FishInfo` |
{:class="table table-striped"}

In OpenAPI this is called a
[discriminator](https://swagger.io/docs/specification/data-models/inheritance-and-polymorphism/).
Its purpose is to figure out the value of a property or properties, depending
on the value of another property.

We will take a deeper look at discriminators as we go further along.

## Wrapping It Up

We now have our starter API. It currently has no OpenAPI functionality, other
than the setup we performed in
[OpenAPI Tutorial Part I: Introduction to OpenAPI](2022-01-31-openapi-tutorial-part-i-are-you-looking-for-swagger.md).
However, it provides a solid foundation that should be very familiar to most
web developers, and focuses on what I believe to be the most common use-case for
OpenAPI - working with an existing API codebase.

In the next part of this series we will begin adding OpenAPI to our API using
the [zircote/swagger-php](http://zircote.github.io/swagger-php/) annotations
library. We should begin seeing both the power of OpenAPI and the benefits of
using annotations for writing our OpenAPI definitions.

We still have a ways to go and much to learn!

Until next time, this is Señor PHP Developer Juan Treminio wishing you adios!    
