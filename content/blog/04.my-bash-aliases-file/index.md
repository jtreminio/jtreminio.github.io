---
date: 2012-04-22 01:00:00
title: "My .bash_aliases file"
slug: my-bash-aliases-file
aliases: /2012/04/my-bash-aliases-file
tags:
    - server
    - terminal
---

Just a quick post to show my .bash_aliases file with a bunch of great shortcuts!

```bash
if [ -f /etc/bash_completion ]; then
    source /etc/bash_completion
fi

__has_parent_dir () {
    # Utility function so we can test for things like .git/.hg without firing
    # up a separate process
    test -d "$1" && return 0;

    current="."
    while [ ! "$current" -ef "$current/.." ]; do
        if [ -d "$current/$1" ]; then
            return 0;
        fi
        current="$current/..";
    done

    return 1;
}

__vcs_name() {
    if [ -d .svn ]; then
        echo "-[svn]";
    elif __has_parent_dir ".git"; then
        echo "-[$(__git_ps1 'git %s')]";
    elif __has_parent_dir ".hg"; then
        echo "-[hg $(hg branch)]"
    fi
}

black=$(tput -Txterm setaf 0)
red=$(tput -Txterm setaf 1)
green=$(tput -Txterm setaf 2)
yellow=$(tput -Txterm setaf 3)
dk_blue=$(tput -Txterm setaf 4)
pink=$(tput -Txterm setaf 5)
lt_blue=$(tput -Txterm setaf 6)

bold=$(tput -Txterm bold)
reset=$(tput -Txterm sgr0)

export PS1='\n\[$bold\]\[$black\][\[$dk_blue\]\@\[$black\]]-[\[$green\]\u\[$yellow\]@\[$green\]\h\[$black\]]-[\[$pink\]\w\[$black\]]\[\033[0;33m\]$(__vcs_name) \[\033[00m\]\[$reset\]\n\[$reset\]\$ '

#PS1='\[\033[01;32m\]\n\u@\h\[\033[00m\] -> \[\033[01;34m\]\w\[\033[0;33m\]$(__vcs_name) \[\033[00m\]\n\$ '

alias ls='ls -F --color=always'
alias dir='dir -F --color=always'
alias ll='ls -l'
alias cp='cp -iv'
alias rm='rm -i'
alias mv='mv -iv'
alias grep='grep --color=auto -i'
alias v='vim'

alias ..='cd ..'

alias chmod_files='find -maxdepth 10 -type f -exec chmod 644 {} \;'
alias chmod_folders='find -maxdepth 10 -type d -exec chmod 755 {} \;'

alias apache_error='sudo tail -f  /var/log/apache2/error.log'

del_recursive() {
    find . | grep '$1' | xargs rm
}

process() {
    ps -ef | grep $1
}

apache() {
    sudo service apache2 $1
}

function extract()    # Handy Extract Program.
{
     if [ -f $1 ] ; then
         case $1 in
             *.tar.bz2)   tar xvjf $1     ;;
             *.tar.gz)    tar xvzf $1     ;;
             *.bz2)       bunzip2 $1      ;;
             *.rar)       unrar x $1      ;;
             *.gz)        gunzip $1       ;;
             *.tar)       tar xvf $1      ;;
             *.tbz2)      tar xvjf $1     ;;
             *.tgz)       tar xvzf $1     ;;
             *.zip)       unzip $1        ;;
             *.Z)         uncompress $1   ;;
             *.7z)        7z x $1         ;;
             *)           echo "'$1' cannot be extracted via >extract<" ;;
         esac
     else
         echo "'$1' is not a valid file"
     fi
}
```
