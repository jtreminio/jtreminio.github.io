---
layout: post
categories: [blog]
date: 2013-05-14
title: Introduction to Vagrant/Puppet and introducing PuPHPet - A simple to use Vagrant/Puppet GUI Configurator!
description: Introduction to Vagrant and Puppet
slug: introduction-to-vagrant-puppet-and-introducing-puphpet-a-simple-to-use-vagrant-puppet-gui-configurator
redirect_from:
  - /2013/05/introduction_to_vagrant_puppet_and_introducing_puphpet_a_simple_to_use_vagrant_puppet_gui_configurator
  - /2013/05/introduction_to_vagrant_puppet_and_introducing_puphpet_a_simple_to_use_vagrant_puppet_gui_configurator/
tags:
  - vagrant
  - puppet
  - open-source
  - server
  - vm
---

I just released the initial version of [PuPHPet](http://puphpet.com), my
GUI-based generator for Vagrant/Puppet environments!

That is a mouthful, so let me explain the what, why and how!

## What is Vagrant?

[Vagrant](http://vagrantup.com) is for managing VMs. If you previously read
my length tutorial,
[Setting Up a Debian VM, Step by Step](2012-07-04-setting-up-a-debian-vm-step-by-step.md),
you know how tiresome and error-prone setting up a virtual machine can be.

Errors suck!

Spending time away from developing sucks!

Vagrant can help!

Vagrant helps abstract and automate the initial setup of a virtual machine. Basically
everything from the initial OS setup, to assigning a static IP address and sharing
folders between host and slave are handled with a few short lines in Vagrant.

Vagrant is also easy to read and understand. Heck, just take a look at my default
[Vagrantfile](https://github.com/jtreminio/vagrant-puppet-lamp/blob/master/Vagrantfile)
- even if you have never encountered Vagrant before you can probably pick up on what
is going on in that file… mostly, anyway!

It also allows you to boot up, shut down, suspend, reload and package your VM for the
command line, all with some very simple, easy to remember commands.

Vagrant is great for the basics - but that is as far as you should use it, only for
the initial set up. For more complicated tasks like installing software packages,
configuring installed packages, setting up users, creating MySQL tables and more,
you should use what Vagrant calls provisioners. Out of the box, Vagrant has support
for shell (basically `sh` files), [Chef](http://www.opscode.com/chef/) and
[Puppet](https://puppetlabs.com/). You are free to use any provisioner you want -
at the end of the day they all end up doing the same thing - but I have chosen to
go with Puppet.

## What is Puppet?

[Puppet](https://puppetlabs.com/) is one of the main provisioners available to
Vagrant. I will not explain the differences between Puppet and Chef here, but
Google will keep you occupied for hours on the subject!

From the Puppet website,

> Puppet uses its own configuration language, which was designed to be accessible
> to sysadmins.
{:class="info"}

[Here you can see an example of Puppet's configuration language](https://github.com/jtreminio/vagrant-puppet-lamp/blob/master/manifests/default.pp).

Easy to understand at first glance, moderately-to-very hard to master, and very
powerful once it "clicks" for you.

You can see that Puppet comprises the bulk of your server configuration. It handles
package installation,

```puppet
package { ['gcc', 'make', 'python-software-properties',
           'vim', 'curl', 'git', 'subversion'] :
    ensure  => 'installed',
    require => Exec['apt-get update'],
}
```

It can process tasks like creating virtual hosts in Apache,

```puppet
apache::vhost { 'invoise' :
    server_name   => 'invoise.dev',
    serveraliases => ['www.invoise.dev'],
    docroot       => '/var/www/invoi.se/web',
    port          => '80',
    priority      => '1'
}
```

Heck, you can even set up MySQL root users!

```puppet
class { 'mysql' :
    root_password => $mysql_root_password,
}
```

Puppet takes the long, arduous process of making your virtual machine *useful* and
automates it away!

## So why use Vagrant/Puppet over manual VM management?

Managing a VM is hard! Let's go shopping!

I am a developer focused on PHP by trade. I am not a server admin. I do not want to
worry about having to keep my VM running properly, keeping packages up to date,
having to spend time Googling why package X isn't installing. What I really want to
do is get my environment set up as quickly as possible and get back to facerolling
on my keyboard!

What I was running a manual VM, everytime I installed a new package I was worried
that it may screw up the machine in some way, and I would have to start over from
scratch, wasting many hours. Several times I even ran into the issue where
`apt-get` would stop working completely! How do I fix that?!

Thanks to Vagrant, I no longer have to worry about screwing my VM up. If I do change
something in some way that is not easily reverted, I simply shrug, `$ vagrant destroy`
and `$ vagrant up` and having a brand new, working VM within 3 minutes. I no longer
have to tip-toe, making sure not to disturb anything. It's the ultimate VM neuralyzer!

Sharing my setup with coworkers, or strangers on the internet, is now as simple as
pointing them to my Github repo and having them clone it. It is less than 1MB of
files and within 10 minutes they can have an exact duplicate of my environment
running on their machines! Awesomesauce!

This is much preferable to having to upload a multi-gig vbox file and them having
to download it, open it in Virtualbox and running it… and possibly keeping multiple
copies saved in case they screw one copy up!

## But, Vagrant lacks documentation and Puppet is hard to learn!

Over the past 2 weeks I have spent many frustrating hours trying to learn this new
technology.

Vagrant is actively pushing version 2 (1.1.x), but doesn't have a complete listing
of all availabe API properties anywhere. The concepts are simple enough, and the
code is clean enough that you can quickly pick everything up and immediately start
using it, but if they don't actually list what is available you will never be able
to get anywhere!

Vagrant also has non-official boxes created by users around the world. This is
great and can potentially speed up your process, except that many of the available
boxes are badly made. For instance, I setup my Vagrantfile to use a pre-built Debian
box from [vagrantbox.es](http://vagrantbox.es). I wasted many hours trying to get
the VM to load my shared folders without any success, before realizing that the
box I was using wasn't setup right! Switching to an official box immediately
solved the problem.

Puppet is very powerful. It has clean syntax, a range of options available to you
basically handle every possible scenario you may ever come across. The problem is
that Puppet is non-linear: it will not simply process commands in the order they
are defined! It semi-randomly chooses what command to run, and then runs it.
This causes problems when it tries to install Xdebug, but has not installed PHP
yet! The Puppet way of solving this is to define what each command's requirements
are, and it steps back until it reachs the parent and then executes.

For example, Xdebug depends on PECL, which depends on PEAR, which depends on PHP,
which may or may not have been defined as PHP 5.4, which would require `apt-get`
to have added a custom PPA and then run `apt-get update`.

It is a web of requirements that at first glance may be a little hard to decypher.
In fact, there are many hairs yanked out of my head that are laying on the ground
around my desk thanks to Puppet.

Once it 'clicks', though, it makes perfect sense and is much easier to manage. The
trouble is the journey to understanding, of course!

## PuPHPet takes the pain, suffering and yanked hairs away!

Enter [PuPHPet](http://puphpet.com), my GUI configurator. I have created a simple,
easy to use web app that targets PHP developers and the classic LAMP stack. You
will not need to learn the ins and outs of Vagrant or Puppet to build your own
working VM to your specific needs.

As of now you can define things like custom virtual hosts, what version of PHP to
install, set up some MySQL databases, etc, all without having to touch a manifest
file.

It also comes with popular PHP-focused tools, like PEAR and Xdebug out of the box.
In fact, you can immediately set a breakpoint in the code and the server will pick
up the connection!

As this is the initial release, options are fairly limited. For example, in the
future I want to provide the option to choose either Apache, Nginx or PHP's built-in
web server. Also MySQL vs MariaDB, PostgreSQL, MongoDB and other no-SQLs, etc.

For now, however, the few options that are available work and you can get up and
running in 5 minutes flat!

It is [completely open-sourced](https://github.com/jtreminio/Puphpet) and I would be
elated to receive pull requests!
