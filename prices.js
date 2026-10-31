/* AARAMBH — single source of truth for prices (in rupees).
   Change a number below and every page that loads this file follows.
   Add this line before </head> on each page:  <script src="prices.js"></script>

   Lookup order for any product:
   1. designColors  ('Design|Colour')   most specific
   2. designs       (design / product name)
   3. colors        (colour name)
   4. base          (fallback for the whole group)
*/
(function () {
  'use strict';

  /* ================= EDIT PRICES HERE ================= */
  var PRICE_TABLE = {
    polo: {
      base: 399,
      colors: { /* 'Black': 429, 'Maroon': 419 */ }
    },
    oversized: {
      base: 399,
      colors: { /* 'Red': 419, 'Lavender': 429 */ }
    },
    shirt: {
      base: 649,
      colors: { /* 'Pink': 679 */ }
    },
    hoodie: {
      base: 599,
      colors: { /* 'Black': 649 */ }
    },
    crop: {
      base: 349,
      designs: {
        'Self Love': 349,
        'Bloom and Shine': 349,
        'Glorious Butterfly': 349,
        'Stay Cool': 349,
        'Vintage': 349
      },
      designColors: { /* 'Vintage|Red': 369 */ }
    },
    printed: {
      base: 549,
      designs: {
        'Unseen': 549,
        'Veiled Bloom': 549,
        'Luffy': 549,
        'Justice': 549,
        'Porsche': 549,
        'Grace': 599,
        'Anime': 599,
        'Naruto': 599,
        'One Piece': 599,
        'Tanjiro': 599,
        'Deadpool': 599,
        'Calm Acid Wash': 649,
        'Conquer Acid Wash': 649,
        'Spider Acid Wash': 649,
        'Explore Space Acid Wash': 699
      },
      designColors: { /* 'Unseen|Black': 579, 'Grace|White': 619 */ }
    }
  };
  /* ==================================================== */

  function norm(s) { return String(s || '').toLowerCase().replace(/[^a-z0-9]/g, ''); }

  function nmap(obj, pair) {
    var out = {}, k;
    for (k in (obj || {})) {
      out[pair ? k.split('|').map(norm).join('|') : norm(k)] = obj[k];
    }
    return out;
  }

  var CACHE = {};
  function maps(g) {
    if (CACHE[g]) return CACHE[g];
    var r = PRICE_TABLE[g] || {};
    CACHE[g] = { dc: nmap(r.designColors, true), d: nmap(r.designs, false), c: nmap(r.colors, false), base: r.base };
    return CACHE[g];
  }

  function groupOf(type) {
    var t = String(type || '').toLowerCase();
    if (t.indexOf('crop') > -1) return 'crop';
    if (t.indexOf('polo') > -1) return 'polo';
    if (t.indexOf('hoodie') > -1) return 'hoodie';
    if (t.indexOf('printed') > -1) return 'printed';
    if (t.indexOf('oversized') > -1) return 'oversized';
    if (t.indexOf('shirt') > -1) return 'shirt';
    return null;
  }

  function get(type, product, color) {
    var g = groupOf(type);
    if (!g || !PRICE_TABLE[g]) return null;
    var m = maps(g), p = norm(product), c = norm(color), v;
    if ((v = m.dc[p + '|' + c]) != null) return v;
    if ((v = m.d[p]) != null) return v;
    if ((v = m.c[c]) != null) return v;
    return m.base != null ? m.base : null;
  }

  /* Short names used by the homepage (data-price="unseen" and formatPrice('polo')) */
  var PRICES = {
    unseen: get('Printed T-Shirt', 'Unseen', 'White'),
    veiled: get('Printed T-Shirt', 'Veiled Bloom', 'Royal Blue'),
    polo: get('Polo', 'Polo T-Shirt', 'White'),
    oversized_royal_blue: get('Oversized', 'Royal Blue Oversized Tee', 'Royal Blue'),
    shirt_red_boxy: get('Boxy Shirt', 'Red Boxy Shirt', 'Red'),
    crop_self_love: get('Printed Crop Top', 'Self Love', 'Black')
  };
  window.PRICES = PRICES;
  window.formatPrice = function (key) { return '\u20B9' + PRICES[key]; };
  window.AARAMBH_PRICES = { get: get, table: PRICE_TABLE };

  /* ---- product.html / order.html: correct the price in the URL before the page reads it ---- */
  var nativeReplace = history.replaceState;
  try {
    var q = new URLSearchParams(location.search);
    if (q.has('product') && q.has('type')) {
      var v0 = get(q.get('type'), q.get('product'), q.get('color'));
      if (v0 != null && String(v0) !== q.get('price')) {
        q.set('price', String(v0));
        nativeReplace.call(history, null, '', '?' + q.toString() + location.hash);
      }
    }
  } catch (e) {}

  /* ---- product.html: when the colour swatch changes, keep the price in sync ---- */
  function onPrice(v) {
    try { if (typeof productData !== 'undefined') productData.price = v; } catch (e) {}
    ['productPrice', 'mobileProductPrice'].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.textContent = '\u20B9' + v;
    });
  }
  history.replaceState = function (state, title, url) {
    var out = url;
    try {
      if (typeof url === 'string' && url.charAt(0) === '?') {
        var p = new URLSearchParams(url);
        if (p.has('product') && p.has('type')) {
          var v = get(p.get('type'), p.get('product'), p.get('color'));
          if (v != null) { p.set('price', String(v)); out = '?' + p.toString(); onPrice(v); }
        }
      }
    } catch (e) {}
    return nativeReplace.call(history, state, title, out);
  };

  /* ---- listing pages and homepage ---- */
  function onReady(fn) {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn);
    else fn();
  }

  onReady(function () {
    /* homepage: <span data-price="unseen"> */
    document.querySelectorAll('[data-price]').forEach(function (el) {
      var key = el.getAttribute('data-price');
      if (PRICES[key] != null) el.textContent = '\u20B9' + PRICES[key];
    });

    var page = (location.pathname.split('/').pop() || 'index').replace(/\.html$/, '').toLowerCase();
    var TYPES = { polo: 'Polo', oversized: 'Oversized', shirt: 'Boxy Shirt', hoodie: 'Hoodie', croptop: 'Printed Crop Top', printed: 'Printed T-Shirt' };
    var type = TYPES[page];
    if (!type) return;

    function info(card) {
      var nameEl = card.querySelector('.product-name, h3');
      var colEl = card.querySelector('.selected-color, .spot-colorname');
      var name = nameEl ? nameEl.textContent.trim() : '';
      var color = colEl ? colEl.textContent.trim() : name.replace(/\s+(Hoodie|Boxy Shirt|Oversized Tee)$/i, '');
      return { name: name, color: color };
    }

    function refresh(card) {
      var priceEl = card.querySelector('.price, .product-price, .spot-price');
      if (!priceEl) return;
      var i = info(card), v = get(type, i.name, i.color);
      if (v == null) return;
      priceEl.textContent = '\u20B9' + v;
      card.dataset.price = v;
    }

    function summary() {
      var vals = [];
      document.querySelectorAll('.product-card, .tee-card').forEach(function (c) {
        var n = Number(c.dataset.price);
        if (n) vals.push(n);
      });
      if (!vals.length) return;
      var min = Math.min.apply(null, vals), max = Math.max.apply(null, vals);
      var lead = min === max ? '' : 'From ';
      document.querySelectorAll('.meta-chip').forEach(function (ch) {
        if (/\u20B9/.test(ch.textContent)) ch.textContent = lead + '\u20B9' + min;
      });
      var lab = document.querySelector('.products-label');
      if (lab && /\u20B9/.test(lab.textContent)) {
        lab.textContent = lab.textContent.replace(/(From\s)?\u20B9\s?\d+/, lead + '\u20B9' + min);
      }
    }

    document.querySelectorAll('.product-card, .tee-card, .spot-slide').forEach(function (card) {
      refresh(card);
      var el = card.querySelector('.selected-color, .spot-colorname');
      if (el && window.MutationObserver) {
        new MutationObserver(function () { refresh(card); summary(); })
          .observe(el, { childList: true, characterData: true, subtree: true });
      }
    });
    summary();

    /* shirt.html sends the price straight to order.html, so correct it at click time */
    if (typeof window.buyNowSized === 'function') {
      var orig = window.buyNowSized;
      window.buyNowSized = function (btn, name, t, color, price, image) {
        var v = get(t, name, color);
        return orig.call(this, btn, name, t, color, v == null ? price : v, image);
      };
    }
  });
})();
