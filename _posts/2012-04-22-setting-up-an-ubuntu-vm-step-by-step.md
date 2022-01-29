---
layout: post
categories: [blog]
date: 2012-04-22 13:00:00
title: "Setting Up an Ubuntu VM, Step by Step"
description: Deprecated, use PuPHPet
slug: setting-up-an-ubuntu-vm-step-by-step
redirect_from:
  - /2012/04/setting-up-an-ubuntu-vm-step-by-step
  - /2012/04/setting-up-an-ubuntu-vm-step-by-step/
tags:
  - tutorial
  - server
  - vm
---

> This tutorial has been replaced by
> [Setting Up a Debian VM, Step by Step](2012-07-04-setting-up-a-debian-vm-step-by-step.md).
{:class="warning"}

[Recently on r/php](http://www.reddit.com/r/PHP/comments/s8bwt/what_is_your_php_development_environment_like/)
there was a thread asking users about their development environments. The usual
answers came tumbling out – mostly about IDEs and methods for uploading their code
(side note: FTP is a horrible way to do this!). Out of 144 responses, I noticed that
very few mentioned virtual machines. Most that said anything about operating systems
or platforms made it clear they were developing on their local machine, with no
separation between their everyday driver and their development environment.

This has got to stop, especially amongst PHP developers where we have tools like
XAMPP that require nothing more than a simple zip extract to get up and running with
your own “server”.

## Why do you need a VM?

There are many reasons to do your development work on a virtual machine over your daily
desktop:

- It separates out programs and settings from your local desktop that can interfere
  with the operations of a server. Did you know that if you run Skype and try to
  install XAMPP, the server won’t start? That’s because Skype is using port 80 for
  its connection, and you have to manually go in and disable this for XAMPP to work,
- It keeps server-related software out of your desktop,
- If you’re running Windows and a prepackaged server like XAMPP, you may have run
  into some flakiness when trying to run PEAR, or install memcache or APC, or several
  of the more popular PHP extensions. XAMPP is great for getting an “it just works”
  server up and running within minutes, but the drawbacks become too great when you
  want to do something more in-depth,
- The most important reason of all is that you want your development environment to
  mimic your production environment as closely as possible, and it’s even better if
  it is an exact mirror of all the programs and settings. What usually happens when
  you start a new job at a development company that has its act together is that
  you’re given a VM image to use on your computer that mimics the production server.
  The reasons for having your dev environment mimic prod is that it greatly reduces
  the chances of hearing the phrase, “It works on my computer” because now you don’t
  have to deal with the minor differences between software versions messing up your
  application. This tutorial, however, is not meant to replace such a scenario. My
  aim is to get you up and running a generic VM that allows you to quickly setup new,
  or modify existing, applications, as is the case for freelancers who have multiple
  clients that are running on generic webhosts.

## Getting Started

There’s two popular VM applications:
[Oracle VirtualBox](https://www.virtualbox.org/) and
[VMare](http://www.vmware.com/). For this tutorial we’ll be using Virtualbox, which
works across all major operating systems.

[Download the appropriate package from VirtualBox’s website](https://www.virtualbox.org/wiki/Downloads)
and install it on your computer. All the default settings will do fine.

The VM OS we’ll be installing is Ubuntu Server 32-bit, which as of the time of this
article is still version 11.10, but I have tested everything in 12.04 beta and it
works the same.

We’ll using this OS for a couple of reasons:

- Ubuntu’s apt-get is great for quickly getting packages,
- For production servers, the 64-bit version is recommended, but as this is just a
  local server where we won’t give it the preferred 4GB of ram, the 32-bit should be
  fine,
- We’re using the Server edition as we have no need for the GUI

[Download Ubuntu Server ISO to your computer](http://www.ubuntu.com/start-download?distro=server&bits=32&release=11.10).

> The VM we will end up building and running is *not* secure and should
> not be used in a production environment. You should only set this up as a virtual
> machine on your local desktop!
{:class="danger"}

## Install the VM

Open Virtualbox and hit the New button.

| ![step1.png](/static/post/2012-04-22-setting-up-an-ubuntu-vm-step-by-step/step1.png) |
|:--:|
| step1.png |
{:class="table img-link"}

At the Create New Virtual Machine screen, name your VM “Ubuntu VM” and hit Next

| ![step2.png](/static/post/2012-04-22-setting-up-an-ubuntu-vm-step-by-step/step2.png) |
|:--:|
| step2.png |
{:class="table img-link"}

Give your VM 1GB of RAM. If your computer has less than 6GB of RAM, you should
probably lower it down to 512MB.

| ![step3.png](/static/post/2012-04-22-setting-up-an-ubuntu-vm-step-by-step/step3.png) |
|:--:|
| step3.png |
{:class="table img-link"}

Click next until you reach the Virtual desk storage details page, and select
“Fixed size”

| ![step4.png](/static/post/2012-04-22-setting-up-an-ubuntu-vm-step-by-step/step4.png) |
|:--:|
| step4.png |
{:class="table img-link"}

Give it 20 GB of space

| ![step5.png](/static/post/2012-04-22-setting-up-an-ubuntu-vm-step-by-step/step5.png) |
|:--:|
| step5.png |
{:class="table img-link"}

Virtualbox will now create the initial VM image file which may take a minute or two.
When it is finished, close the process by hitting the “Create” button.

Right now you have your VM set up, but haven’t installed the actual operating system
on it. To do so, simply double click on the Ubuntu VM line and click “next”.

| ![step6.png](/static/post/2012-04-22-setting-up-an-ubuntu-vm-step-by-step/step6.png) |
|:--:|
| step6.png |
{:class="table img-link"}

Click the folder icon and search for your Ubuntu Server iso file, clicking next
until the VM boots up and you’re presented with the Ubuntu language selection screen.

| ![step7.png](/static/post/2012-04-22-setting-up-an-ubuntu-vm-step-by-step/step7.png) |
|:--:|
| step7.png |
{:class="table img-link"}

The Ubuntu installation is very straight-forward, but there are a few pages I’d like
to highlight as being important.

At the hostname screen, choose what you would like to name your server. This name
will be used later on to access the server via SSH and when setting up a network
folder on your host machine (the desktop you use).

| ![step8.png](/static/post/2012-04-22-setting-up-an-ubuntu-vm-step-by-step/step8.png) |
|:--:|
| step8.png |
{:class="table img-link"}

Continue on, making sure to hit choose the defaults for most settings, until you get
to the “Partition disks” page, where you simply select Yes with your arrow keys, and
hit enter

| ![step9.png](/static/post/2012-04-22-setting-up-an-ubuntu-vm-step-by-step/step9.png) |
|:--:|
| step9.png |
{:class="table img-link"}

You’ll soon get another confirmation screen, follow the same steps

| ![step10.png](/static/post/2012-04-22-setting-up-an-ubuntu-vm-step-by-step/step10.png) |
|:--:|
| step10.png |
{:class="table img-link"}

Make sure you disable automatic updates

| ![step11.png](/static/post/2012-04-22-setting-up-an-ubuntu-vm-step-by-step/step11.png) |
|:--:|
| step11.png |
{:class="table img-link"}

And on the next page, select “OpenSSH Server”, “Mail server”, and “Samba file server”
using the spacebar.

| ![step12.png](/static/post/2012-04-22-setting-up-an-ubuntu-vm-step-by-step/step12.png) |
|:--:|
| step12.png |
{:class="table img-link"}

Continue choosing the defaults until installation is complete and your VM reboots.

## Set up the network

Virtualbox has this great feature called Snapshots, where you can save the state of
your VM at any given point in time. This is great for novices that experiment a bit
and often end up with a broken server – just load up the snapshot and start off from
a verified working copy!

Before we do that, though, let’s set up one small configuration.

Log in to your new VM using the username and password you chose during installation.
We’re going to add a network connection to your VM that will allow you to easily SSH
into the server.

`$ sudo nano /etc/network/interfaces`

Add the following to the end of the file:

```
auto eth1
iface eth1 inet static
address 192.168.56.101
netmask 255.255.255.0
```

and hit `CTRL + X`, then `Y` and `ENTER` to save changes.

Now shutdown the VM

`$ sudo shutdown -h now`

At the main VirtualBox screen, hit the settings button

| ![step13.png](/static/post/2012-04-22-setting-up-an-ubuntu-vm-step-by-step/step13.png) |
|:--:|
| step13.png |
{:class="table img-link"}

Select Network from the list on the left, choose Adapter 2 from the tabs, check
“Enable Network Adapter” and choose “Host-only Adapter” from the dropdown, then hit OK

| ![step14.png](/static/post/2012-04-22-setting-up-an-ubuntu-vm-step-by-step/step14.png) |
|:--:|
| step14.png |
{:class="table img-link"}

What we’ve done in this section is set up your VM to use a static IP address. This
is a good idea because it allows us to always access our VM using a single IP
address/hostname without having to look it up each time we boot.

By default VirtualBox utilizes the `192.168.56.1` address in your network, and it
assigns IP addresses in the `192.168.56.1xx` range to all your VMs.

By editing the `/etc/network/interfaces` file we told Ubuntu that it should expect a
network resource to be available at that address.

## Take a snapshot

As mentioned previously, Snapshots are a great way to save the current state of your
VM and quickly revert back to it in case you ever screw it up.

Setting one up is extremely simple, just select the Snapshots icon in the mainscreen
and CTRL + SHIFT + S to create a new Snapshot.

| ![step15.png](/static/post/2012-04-22-setting-up-an-ubuntu-vm-step-by-step/step15.png) |
|:--:|
| step15.png |
{:class="table img-link"}

If you ever need to, simply come back to this screen and restore that snapshot.

## Setup your hosts file

You’ve got your server configured just right, now let’s add the hostname to your
hosts file!

Simply add the following entry into your hosts file.

```bash
192.168.56.101    ubuntu-vm
```

Keep in mind that for every domain you want to setup on your VM, you’ll need to add
it to your hosts file.

## Log in via SSH!

Now that you have setup the network adapter in VirtualBox, and added the correct
settings to the VM interfaces file, you’re ready to actually SSH into your server
and begin installing everything!

You may be wondering why do you need to SSH and not simply use the VM window to do
all the work? The only reason for me is that the server does not support copy/paste!
There’s a lot of typing ahead and having the ability to simply copy/paste into your
terminal is going to speed everything up quite a bit!

For SSH on Windows, I use [Kitty](http://kitty.9bis.com/). It’s an SSH client that
adds some nifty features to
[PuTTY](http://www.chiark.greenend.org.uk/~sgtatham/putty/download.html). There’s
also [Poderosa](http://en.poderosa.org/). For Mac/Linux just use the terminal!

Since you’ve already added the correct lines to your hosts file, you can set the
address to connect to as `ubuntu-vm` (or whatever you chose during setup).

Make sure to actually start the VM from VirtualBox before attempting to login. Just
start it, there’s no need to login from the VirtualBox server window.

Installing the basics
First thing’s first, we’re going to install the basic necessities, like `make`,
`curl`, `wget`, as well as the Apache server, Mercurial, Git and Subversion:

```bash
$ sudo apt-get install gcc make wget cron curl libxml2 libxml2-dev libzip-dev \
    libbz2-dev curl libcurl4-openssl-dev libcurl3 libcurl3-gnutls libjpeg62 \
    libjpeg62-dev libpng12-0 libpng12-dev libmcrypt-dev libmcrypt4 libxslt1-dev \
    libxml2-dev apache2 apache2-mpm-prefork apache2-prefork-dev apache2-utils \
    apache2.2-common git mercurial subversion
```

Edit the new Apache2 config file, `$ sudo nano /etc/apache2/httpd.conf` and add

```apacheconfig
ServerName localhost
```

You’ll now have the Apache server up and running! Just point your browser to
[ubuntu-vm](http://ubuntu-vm) and behold the magic!

| ![step16.png](/static/post/2012-04-22-setting-up-an-ubuntu-vm-step-by-step/step16.png) |
|:--:|
| step16.png |
{:class="table img-link"}

Let’s enable Apache’s ModRewrite module now:

```bash
$ sudo a2enmod rewrite
```

This module allows us to use htaccess for pretty URLs.

## Installing MySQL

We’ll be installing MySQL 5.5 from repo, as this is easiest and works fairly well.
Unfortunately, Ubuntu 11.10′s repo only goes up to MySQL 5.1, so we’ll add in
dotdeb.org’s repos for the latest version.

Add to top of the file `$ sudo nano /etc/apt/sources.list`:

```
deb http://packages.dotdeb.org stable all
deb-src http://packages.dotdeb.org stable all
```

Then type:

```bash
$ wget http://www.dotdeb.org/dotdeb.gpg && cat dotdeb.gpg | sudo apt-key add -
$ sudo apt-get update
```

Your system can now download MySQL 5.5!

```bash
    $ sudo apt-get install mysql-client-5.5 mysql-server-5.5
```

On the screens asking for a MySQL password, leave it blank and hit enter. Since
this is only for a local server there’s no point in setting up a password.

> Do NOT use a blank password in production environments! That’s just
> stupid.
{:class="danger"}

## Setting up MySQL

We need to update the IP address that MySQL will listen to for connections by
editing `$ sudo nano /etc/mysql/my.cnf`

Do a search for `bind-address` (CTRL + W) and change the setting to:

```ini
;bind-address           = 127.0.0.1
bind-address            = 192.168.56.101
```

Now let’s grant the root MySQL user all permissions:

```bash
$ mysql -u root
GRANT ALL ON *.* TO 'root'@'%';
exit;
```

and restart the service:

```bash
$ sudo service mysql restart
```

## Compiling PHP from Source

Next we’ll compile PHP from source.

! I’ve updated the following steps from simpy installing PHP from repo,
! and actually compiling PHP from source. I’ve figured out that Xdebug and PHP from
! repo sources don’t play well and cause segfaults when exceptions are thrown in the
! page. Compiling PHP from source resolves this major issue. Plus, it’s pretty easy
! to do!

The initial steps leading up to the compiling are fairly easy, we’re going to install
all build dependencies that PHP5 requires and also download the actual source from
php.net. I’ll be setting up PHP 5.3.11, but the steps for 5.4.1 are identical, and
I’ll provide the link for it in the same code:

```bash
$ sudo apt-get build-dep php5
$ wget http://us3.php.net/get/php-5.3.11.tar.gz/from/this/mirror -O php-5.3.11.tar.gz
# $ wget http://us2.php.net/get/php-5.4.1.tar.gz/from/this/mirror -O php-5.4.1.tar.gz
$ tar -xzf php-*.tar.gz
$ cd php-5*
```

Now we’ll actually compile PHP. The options shown are fairly standard and should get
you up and running with most applications. This process will take a few minutes.

```bash
$ ./configure --with-apxs2=/usr/bin/apxs2 --with-config-file-path=/etc/php5 \
    --with-mysql=mysqlnd --enable-inline-optimization --disable-debug \
    --enable-bcmath --enable-calendar --enable-ctype --enable-ftp --with-gd \
    --disable-sigchild --with-jpeg-dir=/usr --with-png-dir=/usr --with-zlib=yes \
    --with-zlib-dir=/usr --with-openssl --with-xsl=/usr --with-mcrypt=/usr \
    --with-mhash=/usr --enable-mbstring=all --with-curl=/usr/bin \
    --with-curlwrappers --enable-mbregex --enable-zend-multibyte --with-bz2=/usr \
    --with-iconv --with-pdo-mysql=mysqlnd --enable-fileinfo --with-pear \
    --enable-exif --enable-soap --with-regex --enable-zip --with-tidy \
    --sysconfdir=/etc --with-gettext \
    --with-freetype-dir=/usr/include/freetype2/freetype --with-libxml-dir
$ make
$ sudo make -i install
```

Create a symlink into the bin

```bash
$ sudo ln -s /usr/local/bin/php /usr/bin/php
```

Let the Apache web server know about PHP by first creating a conf file,
`$ sudo nano /etc/apache2/mods-available/php5.conf`, and adding

```apacheconfig
AddType application/x-httpd-php .php .phtml .php3
AddType application/x-httpd-php-source .phps
```

And finally enable PHP as an Apache module

```bash
$ sudo a2enmod php5
```

The last steps are copying over the default ini file and restarting Apache

```bash
$ sudo mkdir /etc/php5/
$ sudo cp ~/php*/php.ini-development /etc/php5/php.ini
$ sudo service apache2 restart
```

Try it out with `$ php -v` and you should get back confirmation that you’ve
successfully installed PHP.

Before moving into editing the php.ini, or adding sites to apache’s vhosts, I want
to setup some simple shortcuts for quickly editing these and other files.

```bash
$ cd
$ mkdir _lamp && cd _lamp
$ sudo ln -s /etc/apache2/httpd.conf
$ sudo ln -s /etc/apache2/sites-available/default
$ sudo ln -s /etc/php5/php.ini
```

Now whenever you want to update server-related files, just go to this _lamp folder
in your home directory.

Now we’ll want to install Xdebug (because you’re using Xdebug to debug, right?)

```bash
$ cd
$ git clone git://github.com/derickr/xdebug.git
$ cd xdebug*
$ phpize
$ ./configure --enable-xdebug
$ make
$ sudo make install
```

And finally, configure our php.ini with all the extensions we’ve installed, as well
as some other sane defaults

```bash
$ cd ~/_lamp
$ sudo nano php.ini
```

To do a text search in nano, you press `CTRL + W`. To go to the next search result,
press `CTRL + W` again and just hit enter.

```ini
# ...
error_reporting = -1
# ...
display_errors = On
```

We want to use `-1` for `error_reporting` to get back every single error, warning
and notice possible.

Search for `date.timezone` and edit:

```ini
# ...
;date.timezone =
date.timezone = America/Chicago
```

Right above `date.timezone`, add the following block:

```ini
[xdebug]
zend_extension=/usr/local/lib/php/extensions/no-debug-non-zts-20090626/xdebug.so
xdebug.remote_enable=1
xdebug.remote_connect_back=1
xdebug.remote_port=9000
xdebug.show_local_vars=0
xdebug.var_display_max_data=10000
xdebug.var_display_max_depth=20
xdebug.show_exception_trace=0
```

Exit nano by hitting `CTRL + X`, type `Y` to confirm and hit `Enter` to exit.

Now restart Apache:

```bash
$ sudo service apache2 restart
```

You’ll now have the Xdebug extension installed, and all the new configuration
settings changed.

To test this out, we can print out `phpinfo()`, but first we need to give our user
permission to edit the webroot. Simply replace “USERNAME” with your username in the
lines below:

```bash
$ sudo usermod -a -G www-data USERNAME
$ sudo chown -R root:www-data /var/www
$ sudo chmod -R 775 /var/www
```

Now go to the webroot, remove the `index.html` file that is currently in there and
replace it with a PHP file:

```bash
$ cd /var/www
$ rm -F index.html
$ nano index.php
```

and enter in `phpinfo();`.

Refresh your browser window, which should show your PHP’s information. Do a search
for `xdebug` and if you find it you’ll have done everything correctly.

The following is optional, but you should really consider doing it: installing PHPUnit:

```bash
$ sudo pear config-set auto_discover 1
$ sudo pear install pear.phpunit.de/PHPUnit
$ sudo pear install phpunit/DbUnit
$ sudo pear install phpunit/PHPUnit_Selenium
$ sudo pear install phpunit/PHPUnit_TestListener_XHProf
```

! Update: Composer is a much better solution for installing PHPUnit. An
! upcoming series of articles will lay out the details

Setting up SAMBA

## SAMBA is a great utility that allows you to access remote locations as a shared
network file. This will be the way we access the files on our server for editing.

Replace USERNAME with your username:

```bash
$ sudo adduser USERNAME www-data
```

And edit the SAMBA config file `$ sudo nano /etc/samba/smb.conf`

```ini
[www]
comment = www
path = /var/www
public = yes
writable = yes
valid users = USERNAME
create mask = 0775
directory mask = 0775
force user = USERNAME
force group = www-data
follow symlinks = yes
wide links = yes
```

Replace USERNAME with your username.

Set up a password:

```bash
$ sudo smbpasswd -a USERNAME
```

And restart SAMBA:

```bash
$ sudo service smbd restart
```

After it completes, you’ll now be able to access the webroot and map it as a network
drive. Just open up Windows Explorer (or the tool of your OS of choice) and go to
`\\ubuntu-vm`

Awesome!

## Setting up Apache

I like to keep all my site configurations in a single file, as opposed to creating a
separate file for each site. So let’s edit the default `$ sudo nano ~/_lamp/default`

We can erase everything in here, and enter the following

```apacheconfig
<VirtualHost *:80>
    DocumentRoot "/var/www/"
    ServerName localhost
    ServerAlias ubuntu-vm
</VirtualHost>
```

Every site you add can always be in this file. Just copy/paste the above, changing
out the correct bits. For example, for a site called “google.dev”:

```apacheconfig
<VirtualHost *:80>
    DocumentRoot "/var/www/google.dev"
    ServerName google.dev
    ServerAlias www.google.dev
</VirtualHost>
```

and restart Apache with `$ sudo service apache2 restart`.

## Finishing up

You’ve now got a fully functional, working Linux VM running independently of what
you have on your daily OS.

Now only did you install Apache, PHP and MySQL, but you also set up important tools
like Xdebug and PHPUnit, both of which I will be writing about in articles not too
far in the future!

[I’d like to point you to my .bash_aliases file, as well](2012-04-22-my-bash-aliases-file.md)!

This magic file allows you to add eye candy to the terminal, as well as some nifty
shortcuts. Instead of having to type `$ sudo service apache2 restart` you can now
do `$ apache restart`, and much more!

Remember, there’s no shame on using Windows or Mac OS X as your operating system,
but for best results you should always using a Linux VM to handle all your LAMP stuff!
