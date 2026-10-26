// ==UserScript==
// @name         eBay card labels
// @namespace    proofhardware
// @version      1.0.1
// @description  Put your own name next to each saved card on eBay checkout (x-1234 -> "Business").
// @match        https://pay.ebay.co.uk/*
// @match        https://pay.ebay.com/*
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_registerMenuCommand
// @run-at       document-idle
// @downloadURL  https://raw.githubusercontent.com/JA-Marshall/ebay-userscripts/main/ebay-card-labels.user.js
// @updateURL    https://raw.githubusercontent.com/JA-Marshall/ebay-userscripts/main/ebay-card-labels.user.js
// ==/UserScript==

(function () {
  'use strict';

  const STORE_KEY = 'cardLabels';           // { "1234": "Business", ... }
  const CARD_RE = /(?:^|\s)x-(\d{4})\b/;     // eBay shows saved cards as "x-1234"
  const COLOURS = ['#3665f3', '#0a8a4a', '#c2410c', '#8b2fc9', '#b91c5c', '#0e7490', '#a16207'];

  const getLabels = () => GM_getValue(STORE_KEY, {});

  function setLabel(last4, text) {
    const all = getLabels();
    if (text) all[last4] = text; else delete all[last4];
    GM_setValue(STORE_KEY, all);
    render();
  }

  function editLabel(last4) {
    const current = getLabels()[last4] || '';
    const text = prompt(`Label for card ending ${last4} (leave blank to remove):`, current);
    if (text !== null) setLabel(last4, text.trim());
  }

  // Same label always gets the same colour, so cards are easy to tell apart at a glance.
  function colourFor(text) {
    let h = 0;
    for (const c of text) h = (h * 31 + c.charCodeAt(0)) >>> 0;
    return COLOURS[h % COLOURS.length];
  }

  const style = document.createElement('style');
  style.textContent = `
    .ph-card-label {
      display: inline-block; margin-left: 10px; padding: 2px 10px; border-radius: 999px;
      font: 600 13px/1.5 system-ui, sans-serif; color: #fff; cursor: pointer;
      vertical-align: middle; white-space: nowrap;
    }
    .ph-card-label.ph-empty {
      background: transparent !important; color: #8a8a8a; border: 1px dashed #8a8a8a; font-weight: 400;
    }
    .ph-card-label:hover { filter: brightness(1.15); }
  `;
  document.head.appendChild(style);

  function isVisible(el) {
    const r = el.getBoundingClientRect();
    return r.width > 2 && r.height > 2;
  }

  // Elements whose own text shows a saved card number, e.g. <span>x-1234</span>.
  function findCardElements() {
    const found = [];
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    for (let node = walker.nextNode(); node; node = walker.nextNode()) {
      const el = node.parentElement;
      if (!el || el.closest('.ph-card-label, script, style')) continue;
      const m = CARD_RE.exec(node.nodeValue);
      if (m && isVisible(el)) found.push({ el, last4: m[1] });
    }
    return found;
  }

  function render() {
    const labels = getLabels();
    for (const { el, last4 } of findCardElements()) {
      let tag = el.nextElementSibling;
      if (!tag || !tag.classList.contains('ph-card-label') || tag.dataset.last4 !== last4) {
        tag = document.createElement('span');
        tag.className = 'ph-card-label';
        tag.dataset.last4 = last4;
        tag.title = 'Click to edit this card\'s label';
        // Keep the click from also selecting the card's radio button.
        tag.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          editLabel(last4);
        });
        el.after(tag);
      }
      const text = labels[last4] || '+ label';
      if (tag.textContent !== text) tag.textContent = text;
      tag.classList.toggle('ph-empty', !labels[last4]);
      tag.style.background = labels[last4] ? colourFor(labels[last4]) : '';
    }
  }

  // eBay's checkout is a single-page app that re-renders, so re-apply after DOM changes.
  let queued = false;
  new MutationObserver(() => {
    if (queued) return;
    queued = true;
    setTimeout(() => { queued = false; render(); }, 50);
  }).observe(document.body, { childList: true, subtree: true, characterData: true });

  GM_registerMenuCommand('Edit a card label', () => {
    const last4 = prompt('Last 4 digits of the card:');
    if (last4 && /^\d{4}$/.test(last4.trim())) editLabel(last4.trim());
  });

  render();
})();
