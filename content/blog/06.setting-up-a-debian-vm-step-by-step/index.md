---
date: 2012-07-04
title: "Setting Up a Debian VM, Step by Step"
description: Deprecated, use PuPHPet
slug: setting-up-a-debian-vm-step-by-step
aliases: /2012/07/setting-up-a-debian-vm-step-by-step
tags:
    - tutorial
    - server
    - vm
---

Previously, I created a tutorial on installing a 32-bit Ubuntu VM with PHP 5.3.x.
I’ve since moved on to PHP 5.4.x and Debian, which is universally considered a safer
bet for a server OS. This tutorial is what I will point back to in the future when I
want to show people how to create a VM, so you should consider the Ubuntu-based
tutorial obsolete.

In reality, Ubuntu is based on Debian, so the bulk of this tutorial will be very
similar to the Ubuntu one, albeit with some minor changes here and there.

## Why do you need a VM?

There’s many reasons to do your development work on a virtual machine over your daily
desktop:

* It separates out programs and settings from your local desktop that can interfere
  with the operations of a server. Did you know that if you run Skype and try to
  install XAMPP, the server won’t start? That’s because Skype is using port 80 for
  its connection, and you have to manually go in and disable this for XAMPP to work,
* It keeps server-related software out of your desktop,
* If you’re running Windows and a prepackaged server like XAMPP, you may have run into
  some flakiness when trying to run PEAR, or install memcache or APC, or several of
  the more popular PHP extensions. XAMPP is great for getting an “it just works”
  server up and running within minutes, but the drawbacks become too great when
  you want to do something more in-depth,
* The most important reason of all is that you want your development environment to
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

There’s two popular VM applications: [Oracle VirtualBox](https://www.virtualbox.org/)
and [VMare](http://www.vmware.com/). For this tutorial we’ll be using Virtualbox,
which works across all major operating systems.

[Download the appropriate package from VirtualBox’s website](https://www.virtualbox.org/wiki/Downloads)
and install it on your computer. All the default settings will do fine.

The VM OS we’ll be installing is Debian. Go to this Debian mirror and download the
latest netinst ISO. It should match `debian-#.#.#-amd64-i386-netinst.iso`.
[Download Debian ISO to your computer](http://ftp.cae.tntech.edu/debian-cd/).

!! The VM we will end up building and running is *not* secure and should
!! not be used in a production environment. You should only set this up as a virtual
!! machine on your local desktop!

## Install the VM

Open Virtualbox and hit the New button.

{{< imgproc "step1.png" Resize "300x" />}}

At the Create New Virtual Machine screen, name your VM “Debian VM” and hit Next

{{< imgproc "step2.png" Resize "300x" />}}

Give your VM 1GB of RAM. If your computer has less than 6GB of RAM, you should
probably lower it down to 512MB.

{{< imgproc "step3.png" Resize "300x" />}}

Click next until you reach the Virtual desk storage details page, and select
“Fixed size”

{{< imgproc "step4.png" Resize "300x" />}}

Give it 8 GB of space

{{< imgproc "step5.png" Resize "300x" />}}

Virtualbox will now create the initial VM image file which may take a minute or two.
When it is finished, close the process by hitting the “Create” button.

Right now you have your VM set up, but haven’t installed the actual operating system
on it. To do so, simply double click on the Debian VM line and click “next”.

Click the folder icon and search for your Debian iso file, clicking next until the
VM boots up.

{{< imgproc "step6.png" Resize "300x" />}}

The Debian installation is very straight-forward, but there are a few pages I’d like
to highlight as being important.

Choose the 64 bit install option

{{< imgproc "step7.png" Resize "300x" />}}

At the hostname screen, choose what you would like to name your server. This name will
be used later on to access the server via SSH and when setting up a network folder on
your host machine (the desktop you use).

{{< imgproc "step8.png" Resize "300x" />}}

The Domain name field can be left blank, unless you require something different on
your network

{{< imgproc "step9.png" Resize "300x" />}}

Continue on, making sure to hit choose the defaults for most settings until you get
to the “Partition disks” page where you should choose “Guided – use entire disk and
set up LVM”

{{< imgproc "step10.png" Resize "300x" />}}

For easier VM management, place all files in a single partition

{{< imgproc "step11.png" Resize "300x" />}}

Confirm changes

{{< imgproc "step12.png" Resize "300x" />}}

Finish creating partitions

{{< imgproc "step13.png" Resize "300x" />}}

There’s another confirmation page, just continue on.

At the software selection screen, choose Mail server, SSH server and Standard system
utilities

{{< imgproc "step15.png" Resize "300x" />}}

Continue choosing the defaults until installation is complete and your VM reboots.

## Install sudo

Debian doesn’t come with sudo out of the box, which is a handy little tool for
temporarily giving you root access.

```bash
$ su
$ apt-get install sudo
$ nano /etc/sudoers
```

Add below `root ALL=(ALL) ALL`:

```
USERNAME ALL=(ALL) NOPASSWD: ALL
```

replace `USERNAME` with your username. The `NOPASSWD` flag removes the requirement
to enter a password every time you use `sudo`. This is *not* a good idea on a
production server! Don’t be stupid!

Reboot your machine to make the changes take effect: `$ reboot`

From now on all operations that require root should be run with the `sudo` prefix,
and you will not be required to enter a password each time.

## Set up the network

Log in to your new VM using the username and password you chose during installation.
We’re going to add a network connection to your VM that will allow you to easily SSH
into the server.

```bash
$ sudo nano /etc/network/interfaces
```

Add the following to the end of the file:

```
auto eth1
iface eth1 inet static
address 192.168.56.101
netmask 255.255.255.0
```

and hit `CTRL + X`, then `Y` and `ENTER` to save changes.

Now shutdown the VM

```bash
$ sudo shutdown -h now
```

At the main VirtualBox screen, hit the settings button. then select Network from the
list on the left, choose Adapter 2 from the tabs, check “Enable Network Adapter” and
choose “Host-only Adapter” from the dropdown, then hit OK

{{< imgproc "step16.png" Resize "300x" />}}

What we’ve done in this section is set up your VM to use a static IP address. This is
a good idea because it allows us to always access our VM using a single IP
address/hostname without having to look it up each time we boot.

By default VirtualBox utilizes the `192.168.56.1` address in your network, and it
assigns IP addresses in the `192.168.56.1xx` range to all your VMs.

By editing `/etc/network/interfaces` we told the OS that it should expect a network
resource to be available at that address.

## Setup your hosts file

You’ve got your server configured just right, now let’s add the hostname to your hosts
file!

Simply add the following entry into your hosts file. This should be done in your host
machine – be it Windows or Mac OS X or Linux, not the VM itself.

```bash
192.168.56.101    debian-vm
```

Keep in mind that for every domain you want to setup on your VM, you’ll need to add it
to your hosts file.

## Log in via SSH!

Now that you have setup the network adapter in VirtualBox, and added the correct
settings to the VM interfaces file, you’re ready to actually SSH into your server
and begin installing everything!

You may be wondering why do you need to SSH and not simply use the VM window to do
all the work? The only reason for me is that the server does not support copy/paste!
There’s a lot of typing ahead and having the ability to simply copy/paste into your
terminal is going to speed everything up quite a bit!

For SSH on Windows, I use [KiTTy](http://kitty.9bis.com/). It’s an SSH client that
adds some nifty features to
[PuTTY](http://www.chiark.greenend.org.uk/~sgtatham/putty/download.html). There’s
also [Poderosa](http://en.poderosa.org/). For Mac/Linux just use the terminal!

Since you’ve already added the correct lines to your hosts file, you can set the
address to connect to as `debian-vm` (or whatever you chose during setup).

Make sure to actually start the VM from VirtualBox before attempting to login. Just
start it, there’s no need to login from the VirtualBox server window.

## Installing the basics

First thing’s first, we’re going to install the basic necessities, like `make`,
`curl`, `wget`, as well as the Apache server, Mercurial, Git and Subversion:

```bash
$ sudo apt-get install gcc make wget cron curl libxml2 libxml2-dev libzip-dev \
    libbz2-dev curl libcurl4-openssl-dev libcurl3 libcurl3-gnutls libjpeg62 \
    libjpeg62-dev libpng12-0 libpng12-dev libmcrypt-dev libmcrypt4 libxslt1-dev \
    libxml2-dev apache2 apache2-mpm-prefork apache2-prefork-dev apache2-utils \
    apache2.2-common git mercurial subversion libcupsys2 samba samba-common
```

Edit the new Apache2 config file, `$ sudo nano /etc/apache2/httpd.conf` and add

```apacheconfig
ServerName localhost
```

You’ll now have the Apache server up and running! Just point your browser to
[http://debian-vm](http://debian-vm) and behold the magic!

{{< imgproc "step17.png" Resize "300x" />}}

Let’s enable Apache’s `ModRewrite` module now:

```bash
$ sudo a2enmod rewrite
```

This module allows us to use htaccess for pretty URLs.

## Installing MySQL

We’ll be installing MySQL 5.1 from repo, as this is easiest and works fairly well.

```bash
$ sudo apt-get install mysql-client-5.1 mysql-server-5.1
```

On the screens asking for a MySQL password, leave it blank and hit enter. Since this
is only for a local server there’s no point in setting up a password.

!! Do NOT use a blank password in production environments! That’s just stupid.

## Setting up MySQL

We need to update the IP address that MySQL will listen to for connections by editing
`$ sudo nano /etc/mysql/my.cnf`

Do a search for `bind-address` (`CTRL + W`) and change the setting to:

```ini
;bind-address           = 127.0.0.1
bind-address            = 192.168.56.101
```

Now let’s grant the root MySQL user all permissions:

```
$ mysql -u root
GRANT ALL ON *.* TO 'root'@'%';
exit;
```

and restart the service:

```bash
$ sudo service mysql restart
```

## Compiling PHP 5.4.9 from Source

Next we’ll compile PHP from source.

The initial steps leading up to the compiling are fairly easy, we’re going to
install all build dependencies that PHP5 requires and also download the actual
source from php.net:

```bash
$ sudo apt-get build-dep php5
$ wget http://us2.php.net/get/php-5.4.9.tar.gz/from/this/mirror
$ mv mirror php-5.4.9.tar.gz
$ tar -xzf php-5.4.9.tar.gz
$ cd php-5.4.4
```

Now we’ll actually compile PHP. The options shown are fairly standard and should
get you up and running with most applications. This process will take a few minutes.

```bash
$ ./configure --with-apxs2=/usr/bin/apxs2 --with-config-file-path=/etc/php5 \
    --with-mysql=mysqlnd --enable-inline-optimization --disable-debug \
    --enable-bcmath --enable-calendar --enable-ctype --enable-ftp --with-gd \
    --disable-sigchild --with-jpeg-dir=/usr --with-png-dir=/usr --with-zlib=yes \
    --with-zlib-dir=/usr --with-openssl --with-xsl=/usr --with-mcrypt=/usr \
    --with-mhash=/usr --enable-mbstring=all --with-curl=/usr/bin --enable-mbregex \
    --with-bz2=/usr --with-iconv --with-pdo-mysql=mysqlnd --enable-fileinfo \
    --with-pear --enable-exif --enable-soap --with-regex --enable-zip --with-tidy \
    --sysconfdir=/etc --with-gettext \
    --with-freetype-dir=/usr/include/freetype2/freetype --with-libxml-dir \
    --enable-sockets --enable-pcntl
$ make
$ sudo make -i install
```

Create a symlink to the bin

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
$ sudo cp ~/php-5.4.9/php.ini-development /etc/php5/php.ini
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

Now whenever you want to update server-related files, just go to this `_lamp` folder
in your home directory and edit the files directly.

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

We'll also install some popular extensions:

```bash
$ sudo pecl install intl
$ sudo pecl install memcache
$ sudo pecl install pecl_http
```

And finally, configure our `php.ini` with all the extensions we’ve installed, as well
as some other sane defaults

```bash
$ sudo nano ~/_lamp/php.ini
```

To do a text search in nano, you press `CTRL + W`. To go to the next search result,
press `CTRL + W` again and just hit `ENTER` without typing anything.

```ini
; ...
error_reporting = -1
; ...
display_errors = On
```

We want to use `-1` for `error_reporting` to get back every single error, warning and
notice possible.

Tell PHP where MySQL stuff is:

```ini
pdo_mysql.default_socket = /var/run/mysqld/mysqld.sock
mysql.default_socket = /var/run/mysqld/mysqld.sock
```

Search for `date.timezone` and edit:

```ini
; ...
;date.timezone =
date.timezone = America/Chicago
```

Right above date.timezone, add the following blocks:

```ini
[xdebug]
zend_extension=/usr/local/lib/php/extensions/no-debug-non-zts-20100525/xdebug.so
xdebug.remote_enable=1
xdebug.remote_connect_back=1
xdebug.remote_port=9000
xdebug.show_local_vars=0
xdebug.var_display_max_data=10000
xdebug.var_display_max_depth=20
xdebug.show_exception_trace=0

extension=/usr/local/lib/php/extensions/no-debug-non-zts-20100525/http.so
extension=/usr/local/lib/php/extensions/no-debug-non-zts-20100525/memcache.so
extension=/usr/local/lib/php/extensions/no-debug-non-zts-20100525/intl.so
```

Exit nano by hitting `CTRL + X`, type `Y` to confirm and hit `ENTER` to exit.

Now restart Apache:

```bash
$ sudo service apache2 restart
```

You’ll now have the Xdebug extension installed, and all the new configuration
settings changed.

To test this out, we can print out `phpinfo()`, but first we need to give our user
permission to edit the webroot. Simply replace `USERNAME` with your username in the
lines below:

```bash
$ sudo usermod -a -G www-data USERNAME
$ sudo chown -R root:www-data /var/www
$ sudo chmod -R 775 /var/www
```

Now go to the webroot, remove `index.html` that is currently in there and replace it
with a PHP file:

```bash
$ cd /var/www
$ rm -F index.html
$ nano index.php
```

and enter in `<?php phpinfo();`.

[Refresh your browser window](http://debian-vm/), which should show your PHP’s
information. Do a search for `xdebug` and if you find it you’ll have done everything
correctly.

## Setting up SAMBA

SAMBA is a great utility that allows you to access remote locations as a shared
network file. This will be the way we access the files on our server for editing.

Replace `USERNAME` with your username:

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

Replace `USERNAME` with your username.

Set up a password:

```bash
$ sudo smbpasswd -a USERNAME
```

You’ll now be able to access the webroot and map it as a network drive. Just open
up Windows Explorer (or the tool of your OS of choice) and go to `\\debian-vm`

Awesome!

## Setting up Apache

I like to keep all my site configurations in a single file, as opposed to creating
a separate file for each site. So let’s edit the default `$ sudo nano ~/_lamp/default`

We can erase everything in here, and enter the following

```apacheconfig
<VirtualHost *:80>
    DocumentRoot "/var/www/"
    ServerName localhost
    ServerAlias debian-vm
    ServerAlias *
</VirtualHost>
```

The `ServerAlias *` is your catch-all.

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

Not only did you install Apache, PHP and MySQL, but you also set up important tools
like Xdebug and PHPUnit, both of which I will be writing about in articles not too
far in the future!

Remember, there’s no shame on using Windows or Mac OS X as your operating system,
but for best results you should always use a Linux VM to handle all your development
stuff!
