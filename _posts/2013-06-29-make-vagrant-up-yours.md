---
layout: post
categories: [blog]
date: 2013-06-29
title: Make $ vagrant up yours
description: My conference virtualization presentation
slug: make-vagrant-up-yours
redirect_from:
  - /2013/06/make_vagrant_up_yours
  - /2013/06/make_vagrant_up_yours/
tags:
  - vagrant
  - puppet
  - puphpet
  - open-source
  - server
  - vm
---

[Vagrant](http://vagrantup.com) is a command line tool to manage virtual machines.
[Puppet](https://puppetlabs.com) is a command line tool to install software on virtual
machines.
[PuPHPet](https://puphpet.com) is an unpronounceable GUI tool to help take the pain
out of working with both!

## Why should I use a virtual machine?

Being a PHP developer has a much lower barrier to entry than Python, Ruby. Only
Javascript is easier to start with. Tools such as XAMPP, MAMP, Homebrew, etc,
make installing a basic LAMP stack on your computer extremely easy.

So why would you want to give this up and use a slow, bulky and cryptic virtual
machine?

### Some tools are difficult to install

I used to develop using XAMPP on Windows. Attempting to install any PEAR packages
would cause my hair to fall out. PEAR is old, it should work 100% of the time.

If PEAR is no problem for you, think about how involved tools like memcached, APC,
Gearman, etc, are to install on a proper server and then think about the steps that
may require to be different on a non-server OS.

### Some programs on your daily OS may interfere

Did you know Skype uses port 80 by default, unless you tell it otherwise? What other
programs that you use may interfere in unknown ways with a server?

### It works on my machine

Nothing makes me go into table-flipping mode faster than this phrase. Eliminate
inconsistencies between your development environment and your production environment
by mimicking prod as close as possible.

## What is Vagrant?

Simply put, Vagrant makes virtual machines disposable items. It helps you create a
new VM from the ground up, and allows you to destroy it at will.

### Why not manually manage a virtual machine?

A year or so ago I wrote a long-winded tutorial on setting up a Debian virtual machine
using Virtualbox. It has over 30 steps, takes over 15 minutes to complete from start
to finish (after you've done it several times), and is error prone because people
fat-finger their keyboards.

Every time I needed to make a change on the virtual machine I would walk on egg
shells. If you screw your system up, and you will, you have to start over from
scratch. It's a huge pain in the butt.

There's also no way for me share my VM with other people, unless I want to upload
a 1GB file to the internet, not once but everytime I change something on it.

## Enter Vagrant

A vagrant file is really just a single, small, easy to understand text file called …
"Vagrantfile".

You start by deciding what operating system you want to use. The official ones are
all Ubuntu flavors, in both 32 and 64 bit architectures, but there's a ton of
operating systems to choose, from Debian to CentOS, to more esoteric ones like
Amazon, DigitalOcean and Rackspace.

The operating systems must come in prepackaged files called boxes. They're basically
minimal images using the VM provider of your choice (VirtualBox, VMWare, and others).

Boxes, get it? Vagrants (homeless people) live in boxes? Classy!

A typical, minimalistic Vagrantfile may look like

```ruby
Vagrant.configure("2") do |config|
    config.vm.box = "precise64"
    config.vm.box_url = "http://files.vagrantup.com/precise64.box"

    config.vm.network :private_network, ip: "192.168.56.101"
    config.ssh.forward_agent = true

    config.vm.synced_folder "~/www", "/var/www", id: "vagrant-root"
end
```

Here we have named our box, `precise64`, we have told Vagrant where to download the
box if it has not done so before, `http://files.vagrantup.com/precise64.box`, we
give the box its own local IP address, `192.168.56.101`, and we set up shared
folders between our operating system `~/www` and the VM `/var/www`

### Kick it off

To get Vagrant working, you simply open the terminal, `cd` into the folder where
the Vagrantfile is located and run `$ vagrant up`.

| ![1.png](/static/post/2013-06-29-make-vagrant-up-yours/1.png) |
|:--:|
| 1.png |
{:class="table img-link"}

You now have a fully functional virtual machine! What, you don't see it? That's
because it's invisible by default! To access your new VM, just `$ vagrant ssh`
and Vagrant will connect you to your VM via SSH.

You can check to see that the shared folders are actually set up:

| ![2.png](/static/post/2013-06-29-make-vagrant-up-yours/2.png) |
|:--:|
| 2.png |
{:class="table img-link"}

MAGIC!

### Well, that's a neat trick, but…

Great, you've got a VM up and running… now what? How do you make it useful? You
need Apache, PHP, MySQL, XDebug, XHProf! Or Nginx, Postgresql, MongoDB!

You *could* install everything by hand, but that sounds like work and no one
likes to work!

## Puppet

To handle installing software on your VM, there are several tools available
to you, including Puppet, Chef, Salt, or god forbid straight terminal commands
and bash scripts.

I like Puppet. Why? Because I Chef is geared more toward people familiar with
Ruby, I couldn't get Salt's hello world working, and terminal commands are hard
to maintain. Puppet is powerful, logical and appears to be favored more by true
dev ops (of which I am not one).

### What exactly does Puppet do?

Puppet uses a DSL, which is a fancy term for, "This language we invented", to
install software.

It's fairly simple to understand. To install Apache, for example, you would do:

```puppet
Package { 'apache2': }
```

| ![3.png](/static/post/2013-06-29-make-vagrant-up-yours/3.png) |
|:--:|
| 3.png |
{:class="table img-link"}

We can go to the IP address we've assigned the VM to test that Apache is installed:

| ![4.png](/static/post/2013-06-29-make-vagrant-up-yours/4.png) |
|:--:|
| 4.png |
{:class="table img-link"}

### Puppet Modules

Out of the box, Puppet can install almost any package for you using
`Package { 'PACKAGE_NAME': }`. However, to do more complex setup you'll want to
install modules.

Puppet modules are similar to PHP libraries. Think of Zend_Db, or the Symfony
YAML library. Just as how these libraries do one thing, Puppet modules help
with one task.

There's a many Puppet Apache modules, for example. They can help you set up
vhosts, enable or disable Apache modules, and change configuration settings.
A PHP module can help you choose which PHP version to install, set up ini
settings, install PECL modules, etc.

Puppet modules are written by users and shared with others. An example of
setting up an Apache vhost may look like

```puppet
apache::vhost { 'puphpet':
  server_name   => 'puphpet.dev',
  serveraliases => ['www.puphpet.dev'],
  docroot       => '/var/www/puphpet.dev/web',
  port          => '80',
  priority      => '1'
}
```

However, since each module can be written by somebody different, the exact
details may change between them.

## Downsides of Puppet

### Puppet is … finicky.

It does not execute lines in order. It will randomly choose a path through
your instructions and try to do things as it wants (kind of). The way you
write Puppet instructions are with depend flags. For example, if you want
to install PHP PEAR, you have to tell Puppet that PEAR depends on PHP.
Before you set up an Apache vhost, you have to ensure that Apache itself
is installed.

The Puppet workflow can be a bit confusing at first for people new to Puppet.
However, if you stick with it there will come a time when the concept "clicks"
in your head and you will realize how truly powerful and convinient this method
is.

### Puppet uses its own language

While Puppet's language is not difficult to pick up, there are some nuances you
must come to understand, else you will be bumping your head against a wall out
of frustration. Thankfully, Puppet's API documentation is excellent!

### Sometimes Puppet errors are cryptic

Until you come to understand how Puppet works, some of its error messages may
leave you scratching your head.

## A sample Puppet manifest

A manifest is simply the file where you define what you want your VM to have.
Here is a simple sample one:

```puppet
exec { 'apt-get update':
  command => 'apt-get update',
  path    => '/usr/bin/',
  timeout => 60,
  tries   => 3
}

class { 'apt':
  always_apt_update => true
}

package { ['build-essential', 'python-software-properties', 'puppet-lint',
           'vim', 'curl', 'zip']:
  ensure  => 'installed',
  require => Exec['apt-get update'],
}

file { '/home/vagrant/.bash_aliases':
  source => 'puppet:///modules/puphpet/dot/.bash_aliases',
  ensure => 'present',
}

apt::ppa { 'ppa:ondrej/php5':
  before  => Class['php']
}

git::repo { 'puphpet':
  path   => '/var/www/puphpet.dev/',
  source => 'https://github.com/jtreminio/Puphpet.git'
}

class { 'apache':
  require => Apt::Ppa['ppa:ondrej/php5'],
}

apache::dotconf { 'custom':
  content => 'EnableSendfile Off',
}

apache::module { 'rewrite': }

apache::vhost { 'puphpet':
  server_name   => 'puphpet.dev',
  serveraliases => ['www.puphpet.dev'],
  docroot       => '/var/www/puphpet.dev/web',
  port          => '80',
  priority      => '1',
  require       => Git::Repo['puphpet']
}

class { 'php':
  service => 'apache',
  require => Package['apache'],
}

php::module { 'php5-cli': }
php::module { 'php5-curl': }
php::module { 'php5-intl': }
php::module { 'php5-mcrypt': }
php::module { 'php5-mysql': }

class { 'php::pear':
  require => Class['php'],
}

class { 'php::devel':
  require => Class['php'],
}

class { 'php::composer': }

php::composer::run { 'puphpet':
  path    => '/var/www/puphpet.dev/',
  require => Git::Repo['puphpet']
}

php::ini { 'default':
  value  => [
    'date.timezone = America/Chicago',
    'display_errors = On',
    'error_reporting = -1'
  ],
  target => 'error_reporting.ini'
}

class { 'xdebug': }

xdebug::config { 'cgi': }
xdebug::config { 'cli': }

php::pecl::module { 'xhprof':
  use_package => false,
}

apache::vhost { 'xhprof':
  server_name => 'xhprof',
  docroot     => '/var/www/xhprof/xhprof_html',
  port        => '80',
  priority    => '1',
  require     => Php::Pecl::Module['xhprof']
}
```

In 100 lines, you've installed several server tools (`build-essential`,
`python-software-properties`, `puppet-lint`, `vim`, `curl`, `zip`),
created a `.bash_aliases` file, installed Apache, set up 2 vhosts,
installed pHP 5.4 along with 5 PHP modules, installed PEAR, XDebug,
XHProf and Composer. Simple, right?

Well, kind of…

## A tool born out of frustration

I using Vagrant and Puppet with the intention of only learning the minimum
necessary to get a PHP 5.4 server with Apache, a few vhosts and MySQL up
and running. This quickly devolved into an exercises in frustration. Many
a table were flipped. As soon as I "got" one thing, several more popped up
to block my way forward. I am a PHP-focused developer, I wasn't very
interested in learning how to manage my own server using these tools - I
simply wanted to consume.

Once I got to the point of getting a working server with most everything I
wanted, I realized I didn't want to go through this whole process again in
the future, and I wanted to save other people the headaches I experienced.
And so, PuPHPet was born.

Get it, Puppet + PHP = PuPHPet?

## PuPHPet!

[PuPHPet](https://puphpet.com) is a web-based GUI to help you configure a
Vagrant/Puppet virtual machine in seconds with the most common options.
You simply choose your settings, check a few boxes and download a generated
zip file containing your customized Vagrantfile and Puppet manifest, along
with the required Puppet modules.

It's completely open source, free to use and fork. I am gladly accepting
pull requests!

You can even run a copy of [PuPHPet.com](https://puphpet.com) on your local
machine by creating a VM using PuPHPet. That's kind of like inception, right?
It requires PHP 5.4, and soon 5.5. Why? Because we control the full stack of
its tools, so why not?

Upcoming features include things like deploying to different hosting providers
like [Digital Ocean](https://www.digitalocean.com/?refcode=475274cc0939) and
Amazon, installing non-PHP tools like Ruby, Python, Node.js, etc, and adding
more and more PHP-related features. Eventually it may even be able to write
your code for you.
