---
date: 2015-12-15
title: Queues - Working Smarter, Faster and in Parallel
description: Don't wait, queue today!
slug: queues-working-smart-faster-in-parallel
aliases: /2015/12/queues-working-smart-faster-in-parallel
tags:
    - webdev
    - tutorial
    - php
gh_comment_id: 11
---

A common mistake I keep coming across when browsing through other developer's
code is attempting to do too much work in a single request.

Imagine you have an image gallery application. A user can upload one or more
images and the app will automatically create small thumbnails of the images
for a gallery list page.

{{< imgproc "gallery-list-view" Resize "300x" />}}

If a user uploads one or two images, they probably will not have long to wait
for the app to finish processing thumbnails. If you have a very beefy server,
then it can probably handle more than a few!

What happens when your user wants to upload a folder containing 40 images? 100?
What if they are importing their whole image collection consisting of thousands
of images?

You are probably familiar with being able to upload more than one file at a time:

{{< imgproc "multi-file-select.png" Resize "300x" />}}

Your browser can easily handle uploading as many files as you want. It can
either upload files one by one (working on a single file and waiting until it
is fully uploaded before moving on to the next file) or it can upload files
in parallel. If your users are uploading tens or hundreds of files they will
not appreciate being forced to upload a single file at a time. It would take
far too long!

The same logic applies to when the files are uploaded to your server and work
needs performed on them. Do you want your users to have to sit and wait while
their images are processed? A better solution would be to allow them to upload
the images, and then use what is called a work queue to perform the needed
processing outside of the user's browser request.

## A typical workflow

Here is what the process normally looks like, without a queue system:

{{< imgproc "typical-workflow.png" Resize "300x" />}}

There are alot of different things that can happen while a user is sitting at their
desk, waiting for your app to finish processing the images. The user could get
frustrated and close your website because they feel it was far too slow. The connection
could timeout. If there is an error in your processing code it would bring
the whole thing down and the user would need to re-upload the images!

Or, it could actually work as intended and eventually the user can go back
to using your app after waiting however long it took.

## PHP + work queue workflow

So, what does a workflow with a queue look like? Simple:

{{< imgproc "queue-workflow.png" Resize "300x" />}}

In this diagram you can see that we have three workers, each assigned to a
different task: image, video and email.

As soon as your user finishes uploading their images, a job is added to the
image processing queue. The image worker sees the new job and begins generating
thumbnails.

Meanwhile, we can display a simple "We're working on your images!" message
to the user and allow them to keep browsing around your application, doing
who knows what else. Hey! They could even upload more images to be processed!

The worker is chugging along, working as fast as it can, processing all
the uploaded images. If it is only 5 or 6 images it could finish quickly. If it is
a million images, it could take a while! However, the user is not tied to
the actual processing being done.

Once the worker finishes all the work, though, it can then notify the user that
all the work has been completed. How it notifies the user is up to you. You
can create a simple notification bubble that will show on the user's next
page request, or use AJAX to show it immediately, or send an email.

The image worker then goes back to being idle.

The other two workers, video and email, have stayed idle. They have nothing
in their queue and so are not doing any actual work. The moment they detect
new jobs in their queue, however, they will start doing whatever it is you have
programmed them to do.

## Moar queues!

You can even have workers add new jobs to other workers' queues!

That sort of process is not much different from the previous one:

{{< imgproc "queue-workflow-advanced.png" Resize "300x" />}}

As soon as the image worker is finished with a job, it adds a job to the email
worker's queue. The email worker generates an email and sends it off to the user,
letting them know that their image processing is complete.

Once that is done, it goes back to being idle while it waits for new jobs to
appear in its queue.

## Still confused?

If you are still confused about the purpose of a job queue, read this. If not,
skip to the next section below!

If the above did not make much sense, I will use an example that nerds can easily
understand: a pizza store!

When you call Pizza Hut (or insert your favorite artisanal pizza joint here) and
place an order, you kick off a process involving multiple steps.

Someone takes your order, your pizza toppings and sauce are added to the dough,
it is thrown in the oven, then boxed and goes out the door to be delivered to
your front door, where you pay the delivery person while wearing boxer shorts
and having some Cheeto crumbs on your shirt and fingertips.

Imagine how slow this process would be if it were just one person doing everything!
Sure, if they only had one order at a time, this would probably be fine, one
person can handle this whole process themselves. What happens when 5 people
call in their orders within a minute of each other? One person attempting to do
the whole process suddenly becomes overwhelmed.

Orders are taken down wrong, too much sauce is put on one pizza, another is burnt.
When it comes time to deliver 5 pizzas, one address is in the opposite direction
from the others and that person gets cold pizza for breakfast!

If you think in terms of a job queue, then it all becomes much easier to handle.

A single person sits at the front, waiting for a call to come in. When no orders
are in queue, all the other pimply teenagers sit around, waiting for
something to do. As soon as someone calls and places an order, the frontdesk
sends the job to the back, where the cook begins preparing the pizza and
throws it into the oven. Someone else can then pull out the pizza at the right
time and box it up, then hands the pizza off to one of many delivery drivers
waiting for an order to deliver.

With this process in place, many more orders can simultaneously be handled,
and the chance for getting a cold, soggy pizza with pepperoni when you really
wanted anchovies with pineapples goes down dramatically!

## So what is a work queue, anyway?

For this tutorial, we are going to work with my favorite work queue of all,
[beanstalkd](http://kr.github.io/beanstalkd/). beanstalkd is simple, fast and,
best of all, extremely stable.

You can think of a work queue is a stripped-down database. You can as many
queues as you want. They are like database tables.

For the previous examples, we would have an `image_import`, `video_import`,
and `email` queues. A worker can then listen to a specific queue that it cares
about.

Inserting a job into a queue is very similar to inserting a new row into a
database table, and most work queues follow FIFO (first in first out).
The first job inserted is worked on, then the next until all jobs are
completed.

Once a job is finished, it can be removed from the queue.

One of the nice things about a work queue like beanstalkd is that it can
"reserve" jobs in a queue so no other workers monitoring the same queue
accidentally pick up the same job. In pizza shop terms, this would mean
a worker can reserve a pizza delivery so another worker does not
attempt to deliver the same pizza. One pizza -> one worker. One job ->
one worker.

## What is a worker?

A worker can be anything you want it to be! It can be any language (PHP,
Ruby, Python, C, Go) as long as there is a client library for it to
communicate with beanstalkd. For PHP I highly recommend the popular
[Pheanstalk](https://github.com/pda/pheanstalk).

A very simple example of a worker would be something like this:

```php
<?php

use Pheanstalk\Pheanstalk;

// This opens the connection to beanstalkd
$pheanstalk = new Pheanstalk('127.0.0.1');

// This worker is for processing images and creating thumbnails
$pheanstalk->watch('image_import');

// Grab a job from queue, if there is one,
// and prevent other workers from grabbing it
if ($job = $pheanstalk->reserve()) {
    // Inside here would be your image processing code
}
```

All this code is doing is opening a connection to beanstalk using the
Pheanstalk library, setting its queue to `image_import` and grabbing
the next job available. If there is a job, whatever code is within
the `if` block gets executed, and if there is no job (or when the
current job is complete), the script exits.

There is a small problem, though. If a job exists, it never gets removed
from the queue! This means the next time this script runs, the same
job will be worked on.

beanstalkd lets you easily remove a job from the queue:

```php
<?php

use Pheanstalk\Pheanstalk;

// This opens the connection to beanstalkd
$pheanstalk = new Pheanstalk('127.0.0.1');

// This worker is for processing images and creating thumbnails
$pheanstalk->watch('image_import');

// Grab a job from queue, if there is one,
// and prevent other workers from grabbing it
if ($job = $pheanstalk->reserve()) {
    // Inside here would be your image processing code

    // Once the current job is completed, remove it from the queue
    $pheanstalk->delete($job);
}
```

## Running a worker

Actually getting a worker script to run and watch a queue is up to you,
but there are a few different ways to do this.

The easiest and most limited way would be to kick off the worker script
via cron. Have cron spin up the script once every 5 minutes.

The upside to this is that you know every 5 minutes jobs in the queue
will start being processed. The downside is that you know there is at
the most a 5 minute gap between a job being entered and it being
processed.

Another way would be to spin up the worker as a long-running process.
Since PHP 5.3 implemented the revamped garbage collector, PHP can easily
run scripts for extended periods of time. My personal record is 2 years,
4 months between when I spun up a script and when I killed it to refresh
its code.

I highly recommend using a process control system like
[Supervisord](http://supervisord.org/). It is very easy to set up and can
keep any type of script/process running, even after reboots. If a script
crashes, it spins it back up again. You can also spin up any number of
the same script.

While I will not go into detail on Supervisord this time, I am writing
a simple tutorial on it which will be available soon.

## Do the while loop!

The previous example is fine and dandy, but it has a major drawback:
it grabs a single job from the queue and then exits. If you are using
cron kicking this off every 5 minutes, and you have thousands of jobs
in queue that need worked on, it would take an inordinate amount of time
to finish everything.

The good news is that you do not have to exit. You can stick this all
in a while loop and keep the process running forever, as described in
the previous section.

The code would look like this:

```php
<?php

use Pheanstalk\Pheanstalk;

// This opens the connection to beanstalkd
$pheanstalk = new Pheanstalk('127.0.0.1');

// This worker is for processing images and creating thumbnails
$pheanstalk->watch('image_import');

// Start the loop
while (true) {
    // Grab a job from queue, if there is one,
    // and prevent other workers from grabbing it
    if (!$job = $pheanstalk->reserve()) {
        // If no job found, go back and check again.
        // And again. Keep doing this. Forever.
        continue;
    }

    // Here would be your image processing code

    // Once the current job is completed, remove it from the queue
    $pheanstalk->delete($job);

    // Go back to the beginning and grab the next job in line
}
```

This is the most basic example that utilizes the power of work queues
to their fullest.

## Adding a job to the queue

Before your workers can grab jobs, you need to add some. This process
is even easier than grabbing jobs.

```php
<?php

use Pheanstalk\Pheanstalk;

$pheanstalk = new Pheanstalk('127.0.0.1');

// Your code for handling file uploads goes here

// WARNING: Don't trust user input! Do file validation!
// Be careful out there, it is a dangerous internet!
foreach ($_FILES as $image) {
    $data = [
        'location' => $image['tmp_name'],
        'name'     => $image['name'],
    ]

    // Add a new job to the image_import queue
    // (beanstalkd calls them tubes)
    $pheanstalk
        ->useTube('image_import')
        ->put(json_encode($data));
}
```

With this basic example you have added a new job to the `image_import`
queue, which the previous worker would immediately pick up and begin
working on. If your user has uploaded 1,000 images, then 1,000 new
jobs are added.

You will notice the `$data` array that gets passed into the `put()`
method after is has been `json_encode()`ed. beanstalkd saves any
data you send it as text. Attempting to pass a true array to `put()`
would cause a PHP notice and you would end up with the string literal
`array()` as the job's data.

If you `json_encode()` first, then beanstalkd saves the data as

```json
{"location": "/tmp/foobar", "name": "pickle_pie.jpg"}
```

## Grabbing data via your worker

You are astute, so I am sure you noticed that the `image_import` worker
grabs jobs from the queue and deletes them, but never actually grabs
the data. Doing this is quite simple:

```php
<?php

use Pheanstalk\Pheanstalk;

// This opens the connection to beanstalkd
$pheanstalk = new Pheanstalk('127.0.0.1');

// This worker is for processing images and creating thumbnails
$pheanstalk->watch('image_import');

// Start the loop
while (true) {
    // Grab a job from queue, if there is one,
    // and prevent other workers from grabbing it
    if (!$job = $pheanstalk->reserve()) {
        // If no job found, go back and check again.
        // And again. Keep doing this. Forever.
        continue;
    }

    // Grab the data for this job
    $data = json_decode($job->getData(), true);

    // Here would be your image processing code

    // Once the current job is completed, remove it from the queue
    $pheanstalk->delete($job);

    // Go back to the beginning and grab the next job in line
}
```

We are running `json_decode()` on the pulled data because we know
it is in json format.

## Further reading

The beanstalkd api has many more features, but using the two last
examples above you can accomplish most of what you require.

Some advanced topics would be replicating data across multiple servers
(hint: just send the data multiple times), temporarily "*burying*"
a job to work on later (ie putting a job on hold status for x amount
of time) and kicking a buried job to bring it back to active status.

All this and more can be learned by reading both the beanstalkd api,
or the Pheanstalk project's documentation.

## Wrapping it up

Today you learned about job queues, why you should be using them and
the proper use case, and how to create and pull jobs from a queue.

As always, the best way to learn and become more familiar with a
specific tool is to pop on your headphones and start jamming out
some code.
