// ==UserScript==
// @name         eBay: hide eBay Live
// @namespace    https://github.com/JA-Marshall/ebay-userscripts
// @version      1.0.0
// @description  Removes eBay Live from eBay: the nav tab, the homepage live-stream carousel, promo slides and tiles.
// @match        https://www.ebay.co.uk/*
// @match        https://www.ebay.com/*
// @match        https://www.ebay.de/*
// @match        https://www.ebay.fr/*
// @match        https://www.ebay.it/*
// @match        https://www.ebay.es/*
// @match        https://www.ebay.com.au/*
// @match        https://www.ebay.ca/*
// @match        https://www.ebay.ie/*
// @run-at       document-start
// @grant        none
// @downloadURL  https://raw.githubusercontent.com/JA-Marshall/ebay-userscripts/main/ebay-hide-live.user.js
// @updateURL    https://raw.githubusercontent.com/JA-Marshall/ebay-userscripts/main/ebay-hide-live.user.js
// ==/UserScript==

(function () {
  'use strict';

  // Pure CSS: :has() keeps matching as eBay re-renders, so no observer is needed.
  const css = `
    /* Homepage "eBay Live" stream carousel */
    #dp-live-events-carousel,
    [class*="live-event-video-carousel"],
    /* Nav tab, "Popular destinations" tile and similar single-link items */
    li:has(> a[href*="/ebaylive"]),
    /* "Grow your business with Live" slide in the top banner carousel */
    li.carousel__snap-point:has(a[href*="/ebaylive"]),
    /* eBay Live inside the nav's "More" overflow menu */
    #vl-flyout-nav a[href*="/ebaylive"] {
      display: none !important;
    }
  `;

  const style = document.createElement('style');
  style.id = 'hide-ebay-live';
  style.textContent = css;
  (document.head || document.documentElement).appendChild(style);
})();
