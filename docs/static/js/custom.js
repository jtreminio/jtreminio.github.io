"use strict";const cookie={set:(e,t,o)=>{let a="";if(o){const e=new Date;e.setTime(e.getTime()+24*o*60*60*1e3),a=`; expires=${e.toUTCString()}`}t=t||"",document.cookie=`${e}=${t}${a}; path=/`},get:e=>{const t=`${e}=`,o=document.cookie.split(";");for(let e=0;e<o.length;e++){let a=o[e];for(;" "===a.charAt(0);)a=a.substring(1,a.length);if(0===a.indexOf(t))return a.substring(t.length,a.length)}return null},erase:e=>{document.cookie=`${e}=; Max-Age=-99999999;`}},themeToggle=e=>{document.querySelector("a.theme-toggle").addEventListener("click",t=>{t.preventDefault();const o=document.querySelector("[data-dark-style]");if(o.disabled)return e.set("lighttheme",0,30),setDataTheme("dark"),utterancesThemeToggle(),void(o.disabled=!1);e.set("lighttheme",1,30),setDataTheme("light"),utterancesThemeToggle(),o.disabled=!0})},setDataTheme=e=>{document.documentElement.setAttribute("data-theme",e)},utterancesThemeToggle=()=>{if(document.querySelector(".utterances-frame")){const e={type:"set-theme",theme:"dark"===document.documentElement.getAttribute("data-theme")?"photon-dark":"github-light"};document.querySelector(".utterances-frame").contentWindow.postMessage(e,"https://utteranc.es")}},addAnchors=()=>{const e=document.querySelectorAll("div.post h2, div.post h3, div.post h4");[].forEach.call(e,e=>{e.innerHTML+=`<a class="anchor-link" href="#${e.id}">`+'<i data-feather="link"></i></a>',e.classList.add("anchor-link-container")}),feather.replace()},toggleNavbarMobile=()=>{const e=document.querySelector('[data-toggle="collapse"]');e.addEventListener("click",()=>{document.querySelector(e.getAttribute("data-target")).classList.toggle("collapse")})},loadPhotoswipe=()=>{const e=[];document.querySelectorAll("figure").forEach(t=>{if(t.classList.contains("no-photoswipe"))return!0;const o=t.getElementsByTagName("a")[0],a=t.getElementsByTagName("img")[0],n=o.href,s=a.alt,r=a.src;let c;if(o.getAttribute("size")){const e=o.getAttribute("size").split("x");c={w:e[0],h:e[1],src:n,title:s,msrc:r}}else{c={src:n,w:800,h:600,title:s,msrc:r};const e=new Image;e.src=n;const t=setInterval(function(){const o=e.naturalWidth,a=e.naturalHeight;o&&a&&(clearInterval(t),c.w=o,c.h=a)},30)}const i=e.length;e.push(c),t.addEventListener("click",function(t){t.preventDefault();const o=document.querySelector(".pswp");new PhotoSwipe(o,PhotoSwipeUI_Default,e,{bgOpacity:.8,showHideOpacity:!0,index:i}).init()})})};"1"===cookie.get("lighttheme")?(document.querySelector("[data-dark-style]").disabled=!0,setDataTheme("light")):setDataTheme("dark"),themeToggle(cookie),feather.replace(),addAnchors(),toggleNavbarMobile(),loadPhotoswipe(),addEventListener("message",e=>{if("https://utteranc.es"!==e.origin)return;const t={type:"set-theme",theme:"github-dark"};document.querySelector("iframe").contentWindow.postMessage(t,"https://utteranc.es")});