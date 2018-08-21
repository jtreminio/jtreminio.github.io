"use strict";

var cookie = {
    set: function(name, value, days) {
        var expires = "";
        if (days) {
            var date = new Date();
            date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
            expires = "; expires=" + date.toUTCString();
        }
        document.cookie = name + "=" + (value || "") + expires + "; path=/";
    },

    get: function(name) {
        var nameEQ = name + "=";
        var ca = document.cookie.split(';');
        for (var i = 0; i < ca.length; i++) {
            var c = ca[i];
            while (c.charAt(0) == ' ') c = c.substring(1, c.length);
            if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
        }
        return null;
    },

    erase: function(name) {
        document.cookie = name + '=; Max-Age=-99999999;';
    },
};

// set theme CSS
(function() {
    if (cookie.get('lighttheme') === '1') {
        document.querySelector('[data-style="dark"]').disabled = true;
    }
})();

// switch between light and dark theme
(function () {
    document.querySelector('a.theme-toggle').addEventListener('click', function(e) {
        e.preventDefault();

        var darkCss = document.querySelector('[data-style="dark"]');

        if (darkCss.disabled) {
            cookie.set('lighttheme', 0, 30);
            darkCss.disabled = false;

            return;
        }

        cookie.set('lighttheme', 1, 30);
        darkCss.disabled = true;
    });
})();

// add anchors to h# elements
(function () {
    var anchorLinkSelectors = document
        .querySelectorAll('div.post h2, div.post h3, div.post h4');

    [].forEach.call(anchorLinkSelectors, function (anchorSelector) {
        anchorSelector.innerHTML +=
            '<a class="anchor-link" href="#' + anchorSelector.id + '">' +
            '<i class="feather icon-link"></i></a>';

        anchorSelector.classList.add('anchor-link-container');
    });
})();

// hide/show navbar on mobile
(function () {
    document
        .querySelector('[data-toggle="collapse"]')
        .addEventListener('click', function () {
            var target = document.querySelector(this.getAttribute('data-target'));

            target.classList.toggle('collapse');
        });
})();

// load photoswipe
(function() {
    var items = []; // array of slide objects that will be passed to PhotoSwipe()
    var figures = document.querySelectorAll('figure');

    [].forEach.call(figures, function (figure) {
        if (figure.classList.contains('no-photoswipe')) {
            return true;
        }

        var anchor = figure.getElementsByTagName('a')[0];
        var img    = figure.getElementsByTagName('img')[0];
        var src    = anchor.href;
        var title  = img.alt;
        var msrc   = img.src;

        var item;

        // if data-size on <a> tag is set, read it and create an item
        if (anchor.getAttribute('size')) {
            var size = anchor.getAttribute('size').split('x');
            item = {
                src: src,
                w: size[0],
                h: size[1],
                title: title,
                msrc: msrc
            };
        }

        // if not, set temp default size then load the image to check actual size
        else {
            item = {
                src: src,
                w: 800, // temp default size
                h: 600, // temp default size
                title: title,
                msrc: msrc
            };
            // load the image to check its dimensions
            // update the item as soon as w and h are known (check every 30ms)
            var image = new Image();
            image.src = src;

            var wait = setInterval(function () {
                var w = image.naturalWidth,
                    h = image.naturalHeight;

                if (w && h) {
                    clearInterval(wait);
                    item.w = w;
                    item.h = h;
                }
            }, 30);
        }

        // Save the index of this image then add it to the array
        var index = items.length;
        items.push(item);

        // Event handler for click on a figure
        figure.addEventListener('click', function (event) {
            event.preventDefault(); // prevent the normal behaviour i.e. load the <a> hyperlink
            // Get the PSWP element and initialise it with the desired options
            var pswp = document.querySelector('.pswp');

            var options = {
                index: index,
                bgOpacity: 0.8,
                showHideOpacity: true
            };

            new PhotoSwipe(pswp, PhotoSwipeUI_Default, items, options).init();
        });
    });
})();

var AffixedHeader = function () {
    this.previousTop = 0;
};
AffixedHeader.init = (function () {
    var MQL = 1170;
    var currentTop;
    var navbar = document.querySelector('nav.navbar');
    var navbarHeight = navbar.offsetHeight;

    if (window.innerWidth < MQL) {
        return;
    }

    window.addEventListener('scroll', function () {
        currentTop = getBodyScrollTop();

        // check if user is scrolling up
        if (currentTop < this.previousTop) {
            // if scrolling up
            if (currentTop > 0 && navbar.classList.contains('is-fixed')) {
                navbar.classList.add('is-visible');
            } else {
                navbar.classList.remove('is-visible');
                navbar.classList.remove('is-fixed');
            }
        } else if (currentTop > this.previousTop) {
            // if scrolling down
            navbar.classList.remove('is-visible');
            if (currentTop > navbarHeight && !navbar.classList.contains('is-fixed')) {
                navbar.classList.add('is-fixed');
            }
        }

        this.previousTop = currentTop;
    });
})();

function getBodyScrollTop() {
    const el = document.scrollingElement || document.documentElement;
    return el.scrollTop;
}
