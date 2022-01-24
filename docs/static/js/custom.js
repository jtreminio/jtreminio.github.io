"use strict";const cookie={set:(e,t,o)=>{let l="";if(o){const e=new Date;e.setTime(e.getTime()+24*o*60*60*1e3),l=`; expires=${e.toUTCString()}`}t=t||"",document.cookie=`${e}=${t}${l}; path=/`},get:e=>{const t=`${e}=`,o=document.cookie.split(";");for(let e=0;e<o.length;e++){let l=o[e];for(;" "===l.charAt(0);)l=l.substring(1,l.length);if(0===l.indexOf(t))return l.substring(t.length,l.length)}return null},erase:e=>{document.cookie=`${e}=; Max-Age=-99999999;`}},themeToggle=e=>{document.querySelector("a.theme-toggle").addEventListener("click",t=>{t.preventDefault();const o=document.querySelector('[data-style="dark"]');if(o.disabled)return e.set("lighttheme",0,30),void(o.disabled=!1);e.set("lighttheme",1,30),o.disabled=!0})},addAnchors=()=>{const e=document.querySelectorAll("div.post h2, div.post h3, div.post h4");[].forEach.call(e,e=>{e.innerHTML+=`<a class="anchor-link" href="#${e.id}">`+'<i data-feather="link"></i></a>',e.classList.add("anchor-link-container")}),feather.replace()},toggleNavbarMobile=()=>{const e=document.querySelector('[data-toggle="collapse"]');e.addEventListener("click",()=>{document.querySelector(e.getAttribute("data-target")).classList.toggle("collapse")})},loadPhotoswipe=()=>{const e=[];document.querySelectorAll("figure").forEach(t=>{if(t.classList.contains("no-photoswipe"))return!0;const o=t.getElementsByTagName("a")[0],l=t.getElementsByTagName("img")[0],i=o.href,n=l.alt,c=l.src;let a;if(o.getAttribute("size")){const e=o.getAttribute("size").split("x");a={w:e[0],h:e[1],src:i,title:n,msrc:c}}else{a={src:i,w:800,h:600,title:n,msrc:c};const e=new Image;e.src=i;const t=setInterval(function(){const o=e.naturalWidth,l=e.naturalHeight;o&&l&&(clearInterval(t),a.w=o,a.h=l)},30)}const s=e.length;e.push(a),t.addEventListener("click",function(t){t.preventDefault();const o=document.querySelector(".pswp");new PhotoSwipe(o,PhotoSwipeUI_Default,e,{bgOpacity:.8,showHideOpacity:!0,index:s}).init()})})};"1"===cookie.get("lighttheme")&&(document.querySelector('[data-style="dark"]').disabled=!0),themeToggle(cookie),feather.replace(),addAnchors(),toggleNavbarMobile(),loadPhotoswipe();