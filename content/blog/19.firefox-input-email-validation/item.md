---
date: 2015-10-31
title: Firefox Input Email Validation
description: Long-standing bug
aliases: /2015/10/firefox-email-validation
tags:
    - html
---

I hope to write more of these short tip-type posts in the future that explain
some small thing I've run across and how I've fixed them.

[Firefox has a long-standing bug](https://bugzilla.mozilla.org/show_bug.cgi?id=726758)
wherein any `<input type="email" />` field will fail HTML5 validation if there is a space
either at the beginning or end of the string.

For example, `foo@bar.com` will validate fine, but `<space>foo@bar.com` and `foo@bar.com<space>` will not.

This is a small-enough bug that one would think it would have been fixed years ago.

Chrome, IE and Safari do not have this issue. Why is Firefox the only stand out in refusing to silently
trim user's input when email?

No idea, but the solution is fairly simple:

```javascript
$(document).on('keypress', 'input[type="email"]', function (e) {
    if (e.keyCode == 32) {
        e.preventDefault();
    }
});
```

`e.keyCode == 32` is the space character. If a user enters space in an email input field,
it is silently ignored and not inserted. Since spaces are not valid email characters this
works fine across all browsers.

This does not take into account a user pasting a string containing spaces, nor does it
affect auto-fill values like what Chrome offers.

You could go around this by doing something like

```javascript
$(document).on('change', 'input[type="email"]', function (e) {
    $(this).val($(this).val().trim());
});
```

but this has the unintended side effect of not letting you edit the non-ending of a string.

I have not figured out a way around this small issue as preventing space character is an easy
enough solution.

Until next time, this is Señor PHP Developer Juan Treminio wishing you adios!
