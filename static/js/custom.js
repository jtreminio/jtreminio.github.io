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
 * post images are displayed in a table for responsive and captioning support,
 * but don't include <a> links. Add them here.
 */
const linkTableImages = () => {
  document.querySelectorAll("table.img-link").forEach(imgLink => {
    imgLink.querySelectorAll("img").forEach(img => {
      const parentEl = img.parentElement;
      img.classList.add("img-thumbnail");
      parentEl.innerHTML =
        `<a href="${img.src}" target="_blank">${parentEl.innerHTML}</a>`;
    });

    imgLink.querySelectorAll("tbody tr td").forEach(td => {
      td.innerHTML = `<figcaption>${td.innerHTML}</figcaption>`;
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
  linkTableImages();
})();
