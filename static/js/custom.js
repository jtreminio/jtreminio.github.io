"use strict";

const cookie = {
  set: (name, value, days) => {
    let expires = "";
    if (days) {
      const date = new Date();
      date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
      expires = `; expires=${date.toUTCString()}`;
    }

    value = value || "";
    document.cookie = `${name}=${value}${expires}; path=/`;
  },

  get: name => {
    const nameEQ = `${name}=`;
    const ca = document.cookie.split(";");
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === " ") {
        c = c.substring(1, c.length);
      }
      if (c.indexOf(nameEQ) === 0) {
        return c.substring(nameEQ.length, c.length);
      }
    }
    return null;
  },

  erase: name => {
    document.cookie = `${name}=; Max-Age=-99999999;`;
  },
};

/**
 * switch between light and dark theme
 */
const themeToggle = cookie => {
  document.querySelector("a.theme-toggle").addEventListener("click", e => {
    e.preventDefault();

    const dark = document.querySelector('[data-dark-style]');

    if (dark.disabled) {
      cookie.set("lighttheme", 0, 30);
      setDataTheme("dark");
      utterancesThemeToggle("dark");
      dark.disabled = false;

      return;
    }

    cookie.set("lighttheme", 1, 30);
    setDataTheme("light");
    utterancesThemeToggle("light");
    dark.disabled = true;
  });
};

const setDataTheme = value => {
  document.documentElement.setAttribute("data-theme", value);
};

/**
 * Set utterances theme on page load
 * @param style "light" or "dark"
 */
const utterancesThemeInit = style => {
  addEventListener("message", event => {
    if (event.origin !== "https://utteranc.es") {
      return;
    }

    utterancesThemeToggle(style)
  });
};

/**
 * Set utterances theme on site theme change
 */
const utterancesThemeToggle = style => {
  const theme = style === "light" ? "github-light" : "photon-dark";

  if (document.querySelector("iframe.utterances-frame")) {
    const message = {
      type: "set-theme",
      theme,
    };

    const utterances = document.querySelector("iframe.utterances-frame");
    utterances.contentWindow.postMessage(message, "https://utteranc.es");
  }
};

/**
 * add anchors to h# elements
 */
const addAnchors = () => {
  const anchorLinkSelectors = document
    .querySelectorAll("div.post h2, div.post h3, div.post h4");

  [].forEach.call(anchorLinkSelectors, anchorSelector => {
    anchorSelector.innerHTML +=
      `<a class="anchor-link" href="#${anchorSelector.id}">` +
      '<i data-feather="link"></i></a>';

    anchorSelector.classList.add("anchor-link-container");
  });

  // Trigger feather JS
  feather.replace();
};

/**
 * hide/show navbar on mobile
 */
const toggleNavbarMobile = () => {
  const ele = document.querySelector('[data-toggle="collapse"]');
  ele.addEventListener("click", () => {
    const target = document.querySelector(
      ele.getAttribute("data-target"),
    );

    target.classList.toggle("collapse");
  });
};

/**
 * load photoswipe
 */
const loadPhotoswipe = () => {
  // array of slide objects that will be passed to PhotoSwipe()
  const items = [];
  const figures = document.querySelectorAll("figure");

  figures.forEach(figure => {
    if (figure.classList.contains("no-photoswipe")) {
      return true;
    }

    const anchor = figure.getElementsByTagName("a")[0];
    const img = figure.getElementsByTagName("img")[0];
    const src = anchor.href;
    const title = img.alt;
    const msrc = img.src;
    let item;

    // if data-size on <a> tag is set, read it and create an item
    if (anchor.getAttribute("size")) {
      const size = anchor.getAttribute("size").split("x");
      item = {
        w: size[0],
        h: size[1],
        src,
        title,
        msrc,
      };
    }

    // if not, set temp default size then load the image to check actual size
    else {
      item = {
        src: src,
        w: 800, // temp default size
        h: 600, // temp default size
        title: title,
        msrc: msrc,
      };
      // load the image to check its dimensions
      // update the item as soon as w and h are known (check every 30ms)
      const image = new Image();
      image.src = src;

      const wait = setInterval(function () {
        const w = image.naturalWidth;
        const h = image.naturalHeight;

        if (w && h) {
          clearInterval(wait);
          item.w = w;
          item.h = h;
        }
      }, 30);
    }

    // Save the index of this image then add it to the array
    const index = items.length;
    items.push(item);

    // Event handler for click on a figure
    figure.addEventListener("click", function (event) {
      event.preventDefault(); // prevent the normal behaviour i.e. load the <a> hyperlink
      // Get the PSWP element and initialise it with the desired options
      const pswp = document.querySelector(".pswp");

      const options = {
        bgOpacity: 0.8,
        showHideOpacity: true,
        index,
      };

      new PhotoSwipe(pswp, PhotoSwipeUI_Default, items, options).init();
    });
  });
};

(() => {
  /**
   * set theme CSS
   */
  if (cookie.get("lighttheme") === "1") {
    document.querySelector('[data-dark-style]').disabled = true;
    setDataTheme("light");
    utterancesThemeInit("light");
  } else {
    setDataTheme("dark");
    // Utterances starts off in dark mode, no need to toggle
    // utterancesThemeInit("dark");
  }

  themeToggle(cookie);
  feather.replace();
  addAnchors();
  toggleNavbarMobile();
  loadPhotoswipe();
})();
