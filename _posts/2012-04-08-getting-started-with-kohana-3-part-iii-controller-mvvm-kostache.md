---
layout: post
categories: [blog]
date: 2012-04-08
title: "Getting Started with Kohana 3, Part III – Controller/MVVM/KOstache"
description: A popular framework tutorial
slug: getting-started-with-kohana-3-part-iii-controller-mvvm-kostache
redirect_from: /2012/04/getting-started-with-kohana-3-part-iii-controller-mvvm-kostache
tags:
  - webdev
  - kohana
  - tutorial
  - server
---

> I am no longer using Kohana in any of my personal or professional
> projects. I have moved to a better, more modular framework in Silex, which I will
> be writing about shortly. This series has been permanently discontinued.

> This is Part III of a multi-part series. Below are the links to other
> parts of this tutorial!
> * [Getting Started with Kohana 3, Part I – Initial Setup](2012-03-14-getting-started-with-kohana-3-part-i.md)
> * [Getting Started with Kohana 3, Part II – Bootstrap](2012-03-23-getting-started-with-kohana-3-part-ii-bootstrap.md)
> * Getting Started with Kohana 3, Part III – Controller/MVVM/KOstache

In my
[Getting Started with Kohana 3, Part II – Bootstrap](2012-03-23-getting-started-with-kohana-3-part-ii-bootstrap.md),
we went through the `bootstrap.php` file and figured out what many things did. We
also moved our routes into a separate file for easier management. In this part III,
we’ll go through the actual controller and views to get some real output into your
browser, as well as setting up a popular Kohana module, KOstache.

I’ve put all the code up on my GitHub account at
[jtreminio/Kohana-3-Tutorial](https://github.com/jtreminio/Kohana-3-Tutorial). Please
feel free to clone and send it pull requests. I will try to keep each chapter in its
own branch, so you can easily follow along.

## Cascading Filesystem

One of my favorite features of the Kohana Framework is its cascading filesystem. It’s
a great, easy to use way of extending or completely overriding core or module classes
with your own code.

[Documentation may be found here.](http://kohanaframework.org/3.2/guide/kohana/files)

The CFS is a core concept of the framework, so it would be good to go through that
page until you completely grasp how it works, which in reality is very simple.

The Kohana Framework ships with a `Date` class, which can be instantiated with
`$date = new Date`. But if you look at that class, which can be found at
`system/classes/date.php` you’ll notice it’s an empty class that simply extends
`Kohana_Date` which is found at `system/classes/kohana/date.php`. If you create a
new file at `application/classes/date.php` and set up the class then Kohana’s
autoloader would look to that class when instantiating a new `Date` object.

## Modules

In Kohana, modules are simply placed in their own folder within the modules folder.
Each module should have its own folder.

[Documentation may be found here](http://kohanaframework.org/3.2/guide/kohana/modules).

## The Controller

Kohana comes with a default controller, `Controller_Welcome`, which we renamed to
`Controller_Home` in a previous step. Visiting the base URL of your application
runs `Controller_Home::action_index()`. All URLs must have a controller prepended
with `Controller_` and an action prepended with `action_`.

[Documentation may be found here](http://kohanaframework.org/3.2/guide/kohana/mvc/controllers).

The `Controller_Home` class is extremely simple and minimal – just enough to get
some output to the screen. It extends the `Controller` class which provides it
with all the necessary tools to operate, include `$this->response->body()`.

One thing to note is that controller action methods should never `return` anything –
any reponse you want outputted to any type of request, be it API, user’s browser, or
HMVC, should be handled with the `$this->response->body()` method.

You pass HTML, JSON or anything else to `$this->response->body()`. No need to echo
as the framework handles all this for you. If you pass parameters it’ll consider
that as the output to send requestor. If no parameters are passed, it’ll return
what you’ve previously set (if anything).

```php
<?php
// ...

class Controller_Home extends Controller {
    public function action_index()
    {
        $this->response->body('hello, world!');
    }
}
```

## MVC –> MVVM

In MVC, the Controller acts as the the manager between the Model and View. In optimal
circumstances it shouldn’t be doing any heavy logic, but if you’ve been around
frameworks for even a short time you’ll know that there is no lack of fat controllers
in the wild.

Controllers should interact with the model by fetching data and then pass that data
into the View for presentation.

Unfortunately, Kohana’s MVC makes it a little difficult to keep a skinny controller,
since the Views are just templates that shouldn’t hold any logic whatsoever.

This is where MVVM comes into play. It stands for Model/View/ViewModel and it further
separates out the responsibilities of each layer.

You’ll notice that Controller isn’t in the MVVM definition, but we’ll definitely
still be using it but in a much leaner way. It will be reduced to responsibilities
like handling HMVC requests, instantiating your ViewModel and injecting any
dependencies, validation form submitions, etc. It should not deeply interact with
your models, nor be used to format any output sent in the response.

If you’ve never worked with this pattern before, it may seem overly complicated and
unnecessary, but hopefully by the end of this tutorial series you’ll see the benefits
of separating out your concerns as much as is logical.

To turn Kohana from MVC to MVVM, you do not need to edit any core files or make any
drastic changes, thanks to the Cascading File System – you only need to create more
folders and write your own code. I’ll introduce the necessary steps next.

## View/ViewModel

MVVC is very simple to achieve in Kohana. In fact, it’s mostly creating a few folders
and installing a module that fits into the pattern.

Create the following two folders:

`application/classes/view` is where your ViewModel files will go. These files can
include logic that interacts with your Models, formats HTML to be output in your
templates, and any misc. code that does not belong directly in your
presentation-layer.

`application/templates` will contain your files that will get rendered directly into
HTML or JSON or whatever type of response you’d like to output to either the user’s
browser or API script. Ideally the files in this folder should never contain any
real logic other than simple `if`, `foreach` or similar functions. You should
*not* be interacting with your model or doing any assigning in this layer.

`application/views` is where your templates were originally houses, but it will no
longer be needed. Safe to delete.

Templating
You have a multitude of options when it comes to templating with PHP.

You can go the classic route and use PHP itself as a templating engine. Every PHP
developer has done this, and at the beginning it is usually organized and legible…
but what happens when you bring in a designer or front-end developer that may not
know the backend as well as you do? Their main strengths aren’t PHP – it’s HTML/CSS
or design! Allowing full access to your models, all the powerful methods within them,
is not a great idea for someone who may or may not completely understand the
ramifications of calling them.

Many developers solve this issue by forcing the templates to only process variables
that they specifically allow it to access. This is better than nothing, but they are
still relying on the assumption that the front end guys know PHP well enough to be
able to work well with it.

For templating engines you have [Smarty](http://www.smarty.net/),
[Dwoo](http://dwoo.org/), [Savant3](http://phpsavant.com/), and one of my favorites,
[Twig](http://twig.sensiolabs.org/). I personally dislike working with Smarty with a
passion, and have tried and found faults with other engines in the past. Twig has
come close to perfect for me (I particularly like its
{% raw %}`{% block %}`{% endraw %}, but it still sometimes felt like too much logic
was being handled within templates, where none should exist.

Enter [Mustache](http://mustache.github.com/) which is similar to other templating
systems like Smarty and Twig, with the distinct difference being that Mustache
allows no logic in templates at all. It is very simple to use, is language agnostic
(Mustache templates can be used in PHP, Ruby, Javascript, Python, etc without
changing a single line), and allows you to be extremely explicit about what is
accessible from the templates.

There is a popular Kohana module for Mustache called
[KOstache that was created by Kohana’s project manager, zombor](https://github.com/zombor/KOstache).

KOstache
To install KOstache, simply go to the
[github repo](https://github.com/zombor/KOstache) and download the zip file and
extract to your modules folder, or do a `git clone`, then enable it in your bootstrap
by adding a single line:

```php
<?php
// ...

/**
 * Enable modules. Modules are referenced by a relative or absolute path.
 */
Kohana::modules(array(
    // ...
    'KOstache'  => MODPATH.'KOstache',  // Logic-less templates
));
```

In Kohana, this is all that needs done to enable a module. From here on out you can
easily access your new module by simply instantiating its’ class.

## Setting up KOstache

KOstache is a great, simple to use implementation of Mustache. It completely replaces
Kohana’s `Controller_Template` class or any other templating method you may have
previously been using. All it takes is a few simple steps and you’re up and running.

I’d like to point out one more time that Kohana allows us to easily and transparently
extend and modify core and module files without needing to ever touch the files
included in them.

Our first step will be to create a base Kostache class to extend all our viewmodels
from. This will provide us with a basic setup that we can add to later on that all
our viewmodels will have access to.

Create the file `application/classes/kostache.php` and insert:

{% raw %}
```php
<?php
// ...

/**
 * This class provides basic functionality to all Kostache classes that extend it.
 */
abstract class Kostache extends Kohana_Kostache {

    /**
    * @var string Partial name for content ( {{>content}} )
    */
    const CONTENT_PARTIAL = 'content';

    /**
    * @var string Base URL string
    */
    public $base_url;

    /**
    * @var boolean Render template in layout?
    *              This includes the base layout file with the Mustache template (Included with {{>[CONTENT_PARTIAL]}})
    */
    public $render_layout = TRUE;

    /**
    * @var string Page title
    */
    public $title;

    /** @var string Defines base template to use.
    *               It *must* have {{>[CONTENT_PARTIAL]}} in it, calling the current view body.
    *               layout filename gets changed to ".{$_layout}.mustache"
    */
    protected $_layout = 'layout';

    /** @var array Defines partials/child template files */
    protected $_partials = array();

    /**
    * @param string|null $template
    * @param array|null $partials
    */
    public function __construct($template = NULL, array $partials = NULL)
    {
        $this->base_url = URL::base(TRUE);

        parent::__construct($template, $partials);
    }

    /**
    * Change the base template
    *
    * @param String $layout
    * @return Kostache
    */
    public function set_layout($layout)
    {
        $this->_layout = $layout;

        return $this;
    }

    /**
    * Kick off the Mustache render process and return the rendered string (HTML/JSON/etc)
    *
    * @return string
    */
    public function render()
    {
        /**
        * If base layout is not to be rendered
        */
        if ( ! $this->render_layout)
        {
            return parent::render();
        }

        /**
        * We want to include the base layout
        */
        $partials = $this->_partials;

        $partials[self::CONTENT_PARTIAL] = $this->_template;

        $template = $this->_load($this->_layout);

        return $this->_stash($template, $this, $partials)->render();
    }
}
```
{% endraw %}

I won’t go through the whole file, but will point out a few things you should know:

{% raw %}
`const CONTENT_PARTIAL = 'content';` defines the tag name that you’ll insert into
your base layout file. The base layout file is a sort of master file that includes
other layouts in a single location. If you’ve ever used WordPress, the `index.php`
file is similar in that it calls the header, footer and sidebar templates. What
this constant is defining is that you will use the Mustache tag
`{{>content}}` to define where you want your current template
to work on. That is, when you are working on a single article view page, say,
“single-blog”, you won’t have to manually call the master template as KOstache
will automatically integrate the “single-blog” template into the master template
wherever you have placed the `{{>content}}` tag.
{% endraw %}

If you do not want a master template to be automatically called, and would rather
simply display the specific template you’re working with and nothing else, you
should take a look at `public $render_layout = TRUE;` and set it to `FALSE`. This
would be useful for JSON reponses where you want nothing but the JSON values to be
returned.

If you attempt to call a KOstache template with `$render_layout` set to `TRUE` and
don’t have that tag identified anywhere in your `CONTENT_PARTIAL` template, you’ll
get an error.

The protected `$_partials = array();` line identifies extra templates you can call
within either your master template (`CONTENT_PARTIAL`), the current template
(eg: “single-blog” template), or any templates any other template calls. These are
called partials.

> An important note about KOstache templates: All templates should have a
> `.mustache extension`. For example, our “single-blog” template file would be named
> `single-blog.mustache`. You should simply omit the extension when defining the names.
> Also, KOstache will look for your templates in the `application/templates` folder,
> and it supports as many subfolders as you want, so go hogwild.

`protected $_layout = '.layout';` defines the master template name… which would be
`.layout.mustache`. The preceding dot in the name isn’t necessary, but I like to put
it there as it clearly identifies a master template.

You can change the master, or base, template with the `set_layout()` method.

## Settings up the ViewModels

Now, create two new files:

```php
<?php
// application/classes/view/front.php

class View_Front extends Kostache {

    protected $_layout = 'front/.layout';
}
```

and

```php
<?php
// application/classes/view/front/home.php

class View_Front_Home extends View_Front {}
```

The purpose of creating two nearly empty classes is so you can add in specific
details to each viewmodel later on. For example, `View_Front` can be used for all
frontend templates and we could later create a `View_Admin` class that will apply
specifically to backend administrative templates. Likewise, `View_Front_Home`
will apply to your homepage template.

Since we’ll have all frontend templates in the `application/classes/view/front`
folder, we define the location of the master layout in `View_Front`. Any viewmodels
that inherit this class will automatically pick that up.

## Setting up the templates

Now let’s create our actual templates:

{% raw %}
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8" />
    <title>{{title}}</title>
</head>
<body>
    <h1>{{title}}</h1>

    <p>Begin ((>content))</p>
    {{>content}}
    <p>End ((>content))</p>
</body>
</html>
```
{% endraw %}

{% raw %}
We’re simply setting up some base HTML. Notice the `{{>content}}`.
This gets replaced with whatever our current layout’s contents are.
{% endraw %}

```html
// application/templates/front/home.mustacheXHTML

This is the home.mustache file!
```

Some text just to show where our `home.mustache` template goes.

## Setting up your controller

Now edit the front controller:

```php
<?php
// application/controller/home.php

class Controller_Home extends Controller {

    public function action_index()
    {
        $this->response->body('hello, world!');
        $view = new View_Front_Home;
        $view->title = 'This is our title!';
        $this->response->body($view->render());
    }

}
```

This is a very basic controller that we’ve set up. It instantiates a
`View_Front_Home` object, sets the title (did you see the
`{{title}}` in the `.layout.mustache` template?) and passes
the rendered output to Kohana’s response object.

`$view->render()` kicks off KOstache’s rendering process, where it turns all those
`{{foo}}` and other special tags into desired output.

Note: if you do not define a variable that is present in a Mustache template,
Mustache will parse the tag as blank, removing the empty Mustache tag. This means
you can omit the `$view->title` from above and you would have no issues. This does
not extend to partial tags!

Kohana’s `$this->response->body()` was explained previously, but it’s what actually
sends output to your browser or whatever the request method was.

## Test it Out

Open your browser and go to [kohana-tutorial.dev/](http://kohana-tutorial.dev/)

Surprise! It should be working.

{% include img.html page=page image="kohana.kostache.png" width="300px" %}

## Wrapping it up

Kohana comes packed with powerful features right out of the box, one of them being
how easy it is to change almost everything about it to better suit your workflow.

You set up a great templating engine, changed the architecture around and extended
module files – all without touching the core.

We’ve only just begun toying with this framework, and in the coming chapters we’ll
keep adding more powerful modules
(including zombor’s [Auto-Modeler v5](https://github.com/zombor/Auto-Modeler) that
breaks the Model down into separate components) and utilizing many other core
features.

I hope you join me as we continue exploring this great framework!
