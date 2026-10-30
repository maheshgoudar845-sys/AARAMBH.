/*! AARAMBH Size Advisor — "Find my size" popup for product pages.
 *  Drop-in: save as size-advisor.js next to product.html and add before </body>:
 *    <script src="size-advisor.js"></script>
 *  Edit the CONFIG block below to tune sizes to your real size chart.
 */
(function () {
  'use strict';

  /* ---------------- CONFIG (edit me) ---------------- */
  var CONFIG = {
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    // Upper weight limit (kg, exclusive) for each size. Last one catches everyone heavier.
    men:   [55, 63, 73, 83, 94, 999],
    women: [45, 52, 60, 69, 79, 999],
    tallCm: 182,   // at or above = nudge size up
    shortCm: 163,  // at or below = nudge size down
    // Where to place the "Find my size" button (first match wins)
    mountAfter: '.size-options, .sizes, .size-selector, .size-buttons, #sizes, #sizeOptions, #size-options',
    storageKey: 'aarambh_size_advisor_v1'
  };

  /* ---------------- STATE ---------------- */
  var state = {
    step: 1,
    gender: 'men',
    cm: 172,
    kg: 68,
    heightUnit: 'cm',
    weightUnit: 'kg',
    chest: 'average',
    stomach: 'average',
    fit: 'true'
  };

  try {
    var saved = JSON.parse(localStorage.getItem(CONFIG.storageKey) || 'null');
    if (saved && typeof saved === 'object') {
      for (var k in saved) { if (k !== 'step' && state.hasOwnProperty(k)) state[k] = saved[k]; }
    }
  } catch (e) {}

  function persist() {
    try { localStorage.setItem(CONFIG.storageKey, JSON.stringify(state)); } catch (e) {}
  }

  /* ---------------- SIZE LOGIC ---------------- */
  function recommend() {
    var limits = CONFIG[state.gender] || CONFIG.men;
    var idx = 0;
    while (idx < limits.length - 1 && state.kg >= limits[idx]) idx++;

    var net = 0;
    var reasons = [];

    if (state.cm >= CONFIG.tallCm) { net += 0.5; reasons.push(['Height', 'Taller frame, extra length helps']); }
    else if (state.cm <= CONFIG.shortCm) { net -= 0.5; reasons.push(['Height', 'Shorter frame, a trimmer length works']); }
    else { reasons.push(['Height', 'Average height, standard length suits you']); }

    if (state.chest === 'fuller') { net += 0.5; reasons.push(['Chest', 'Fuller chest needs a little more room']); }
    else if (state.chest === 'narrower') { net -= 0.5; reasons.push(['Chest', 'Narrower chest, a closer fit through the body']); }
    else { reasons.push(['Chest', 'Right for the fit it was cut for']); }

    if (state.stomach === 'fuller') { net += 0.5; reasons.push(['Waist', 'Fuller midsection needs a little more room']); }
    else if (state.stomach === 'narrower') { net -= 0.5; reasons.push(['Waist', 'Slimmer midsection, a closer fit']); }
    else { reasons.push(['Waist', 'Right for the fit it was cut for']); }

    if (state.fit === 'loose') { net += 0.5; reasons.push(['Fit', 'You like it loose, so we sized up']); }
    else if (state.fit === 'snug') { net -= 0.5; reasons.push(['Fit', 'You like it snug, so we sized down']); }
    else { reasons.push(['Fit', 'True to size']); }

    var final = idx;
    if (net >= 1) final = idx + 1;
    else if (net <= -1) final = idx - 1;
    final = Math.max(0, Math.min(CONFIG.sizes.length - 1, final));

    var alt = null;
    if (Math.abs(net) === 0.5) {
      var a = net > 0 ? final + 1 : final - 1;
      if (a >= 0 && a < CONFIG.sizes.length) alt = CONFIG.sizes[a];
    }
    return { size: CONFIG.sizes[final], alt: alt, reasons: reasons };
  }

  function quickEstimate() {
    var limits = CONFIG[state.gender] || CONFIG.men;
    var idx = 0;
    while (idx < limits.length - 1 && state.kg >= limits[idx]) idx++;
    return CONFIG.sizes[idx];
  }

  /* ---------------- HELPERS ---------------- */
  function cmToFtIn(cm) {
    var totalIn = Math.round(cm / 2.54);
    return Math.floor(totalIn / 12) + '\u2032' + (totalIn % 12) + '\u2033';
  }
  function kgToLb(kg) { return Math.round(kg * 2.20462); }
  function heightLabel() { return state.heightUnit === 'cm' ? state.cm + ' cm' : cmToFtIn(state.cm); }
  function weightLabel() { return state.weightUnit === 'kg' ? state.kg + ' kg' : kgToLb(state.kg) + ' lb'; }

  function productName() {
    var h = document.querySelector('h1');
    return h ? h.textContent.trim() : 'AARAMBH';
  }

  /* ---------------- STYLES ---------------- */
  var css = '' +
    '.asa-trigger{display:inline-flex;align-items:center;gap:8px;margin:10px 0;padding:8px 14px;background:transparent;color:#F5F1E8;border:1px solid rgba(245,241,232,.35);border-radius:6px;font:600 13px/1 "DM Sans",system-ui,sans-serif;letter-spacing:.04em;cursor:pointer;transition:.2s}' +
    '.asa-trigger:hover{border-color:#E94E2C;color:#E94E2C}' +
    '.asa-overlay{position:fixed;inset:0;z-index:99999;display:none;align-items:center;justify-content:center;background:rgba(4,4,10,.78);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px)}' +
    '.asa-overlay.asa-open{display:flex}' +
    '.asa-modal{width:min(440px,100%);max-height:92vh;overflow-y:auto;background:#0E0E18;color:#F5F1E8;border:1px solid rgba(245,241,232,.12);border-radius:16px;font-family:"DM Sans",system-ui,sans-serif;position:relative;padding:20px 20px 22px}' +
    '@media(max-width:560px){.asa-overlay{align-items:flex-end}.asa-modal{border-radius:18px 18px 0 0;max-height:94vh}}' +
    '.asa-top{display:flex;justify-content:space-between;align-items:center;margin-bottom:14px}' +
    '.asa-kicker{font:600 11px/1 "DM Sans",sans-serif;letter-spacing:.18em;color:rgba(245,241,232,.55)}' +
    '.asa-close{background:none;border:0;color:#F5F1E8;font-size:22px;cursor:pointer;line-height:1}' +
    '.asa-prod{padding:10px 12px;background:rgba(245,241,232,.06);border-radius:8px;font:600 14px/1.3 "Syne","DM Sans",sans-serif;margin-bottom:14px}' +
    '.asa-bar{display:flex;gap:6px;margin-bottom:6px}' +
    '.asa-bar i{flex:1;height:3px;border-radius:2px;background:rgba(245,241,232,.15)}' +
    '.asa-bar i.on{background:#E94E2C}' +
    '.asa-stepl{font-size:11px;color:rgba(245,241,232,.5);margin-bottom:14px}' +
    '.asa-h{font:400 30px/1 "Bebas Neue","Syne",sans-serif;letter-spacing:.03em;margin:0 0 4px}' +
    '.asa-sub{font-size:13px;color:rgba(245,241,232,.6);margin:0 0 16px}' +
    '.asa-seg{display:flex;border:1px solid rgba(245,241,232,.2);border-radius:8px;overflow:hidden;margin-bottom:18px}' +
    '.asa-seg button{flex:1;padding:10px;background:transparent;color:rgba(245,241,232,.7);border:0;font:600 12px/1 "DM Sans",sans-serif;letter-spacing:.08em;cursor:pointer}' +
    '.asa-seg button.on{background:#F5F1E8;color:#080810}' +
    '.asa-row{margin-bottom:18px}' +
    '.asa-rowhead{display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;font-size:11px;letter-spacing:.14em;color:rgba(245,241,232,.55)}' +
    '.asa-unit{display:inline-flex;gap:4px}' +
    '.asa-unit button{padding:4px 8px;background:transparent;border:1px solid rgba(245,241,232,.2);border-radius:4px;color:rgba(245,241,232,.6);font:600 11px/1 "DM Sans",sans-serif;cursor:pointer}' +
    '.asa-unit button.on{background:#F5F1E8;color:#080810;border-color:#F5F1E8}' +
    '.asa-val{font:400 38px/1 "Bebas Neue",sans-serif;letter-spacing:.03em}' +
    '.asa-ctl{display:flex;align-items:center;gap:10px;margin-top:6px}' +
    '.asa-ctl input[type=range]{flex:1;accent-color:#E94E2C;height:4px}' +
    '.asa-step{width:28px;height:28px;border-radius:50%;border:1px solid rgba(245,241,232,.3);background:transparent;color:#F5F1E8;font-size:16px;cursor:pointer;line-height:1}' +
    '.asa-live{display:flex;justify-content:space-between;align-items:center;padding:12px 14px;border:1px solid rgba(245,241,232,.15);border-radius:8px;margin-bottom:16px}' +
    '.asa-live small{display:block;color:rgba(245,241,232,.5);font-size:11px;margin-top:3px}' +
    '.asa-live b{font:400 28px/1 "Bebas Neue",sans-serif}' +
    '.asa-q{margin-bottom:16px}' +
    '.asa-q p{margin:0 0 8px;font-size:11px;letter-spacing:.14em;color:rgba(245,241,232,.55)}' +
    '.asa-opts{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}' +
    '.asa-opts button{padding:12px 6px;background:transparent;color:#F5F1E8;border:1px solid rgba(245,241,232,.2);border-radius:8px;font:500 13px/1 "DM Sans",sans-serif;cursor:pointer}' +
    '.asa-opts button.on{border-color:#E94E2C;background:rgba(233,78,44,.14);color:#fff}' +
    '.asa-cta{width:100%;padding:15px;background:linear-gradient(90deg,#E94E2C,#FFB238);color:#080810;border:0;border-radius:8px;font:700 14px/1 "DM Sans",sans-serif;letter-spacing:.06em;cursor:pointer;margin-top:4px}' +
    '.asa-ghost{width:100%;padding:12px;background:none;color:rgba(245,241,232,.7);border:0;font:600 12px/1 "DM Sans",sans-serif;letter-spacing:.08em;cursor:pointer;margin-top:6px}' +
    '.asa-note{font-size:11px;color:rgba(245,241,232,.45);text-align:center;margin-top:12px}' +
    '.asa-ring{width:128px;height:128px;margin:6px auto 14px;border-radius:50%;border:5px solid #E94E2C;display:flex;flex-direction:column;align-items:center;justify-content:center}' +
    '.asa-ring b{font:400 54px/1 "Bebas Neue",sans-serif}' +
    '.asa-ring span{font-size:11px;color:rgba(245,241,232,.6)}' +
    '.asa-why{list-style:none;margin:0 0 14px;padding:0}' +
    '.asa-why li{display:flex;justify-content:space-between;gap:12px;padding:10px 12px;background:rgba(245,241,232,.05);border-radius:6px;margin-bottom:6px;font-size:13px}' +
    '.asa-why li span:first-child{font-weight:600}' +
    '.asa-why li span:last-child{color:rgba(245,241,232,.65);text-align:right}' +
    '.asa-sizes{display:flex;gap:8px;justify-content:center;flex-wrap:wrap;margin-bottom:14px}' +
    '.asa-sizes span{min-width:44px;text-align:center;padding:10px 0;border:1px solid rgba(245,241,232,.2);border-radius:6px;font-weight:600;font-size:13px;color:rgba(245,241,232,.6)}' +
    '.asa-sizes span.rec{background:#F5F1E8;color:#080810;border-color:#F5F1E8}' +
    '.asa-sizes span.alt{border-style:dashed;color:#FFB238;border-color:#FFB238}';

  var styleEl = document.createElement('style');
  styleEl.textContent = css;
  document.head.appendChild(styleEl);

  /* ---------------- MODAL ---------------- */
  var overlay = document.createElement('div');
  overlay.className = 'asa-overlay';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.setAttribute('aria-label', 'AARAMBH size advisor');
  var modal = document.createElement('div');
  modal.className = 'asa-modal';
  overlay.appendChild(modal);
  document.body.appendChild(overlay);

  function header(step) {
    return '' +
      '<div class="asa-top"><span class="asa-kicker">AARAMBH SIZE ADVISOR</span>' +
      '<button class="asa-close" data-a="close" aria-label="Close">&times;</button></div>' +
      '<div class="asa-prod">' + escapeHtml(productName()) + '</div>' +
      '<div class="asa-bar"><i class="' + (step >= 1 ? 'on' : '') + '"></i><i class="' + (step >= 2 ? 'on' : '') + '"></i><i class="' + (step >= 3 ? 'on' : '') + '"></i></div>' +
      '<div class="asa-stepl">Step ' + step + ' of 3</div>';
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function opts(name, list) {
    return '<div class="asa-opts">' + list.map(function (o) {
      return '<button data-a="opt" data-k="' + name + '" data-v="' + o[0] + '" class="' + (state[name] === o[0] ? 'on' : '') + '">' + o[1] + '</button>';
    }).join('') + '</div>';
  }

  function render() {
    var html = header(state.step);

    if (state.step === 1) {
      html += '<h3 class="asa-h">Let\u2019s find your fit</h3><p class="asa-sub">Two measurements, about ten seconds.</p>' +
        '<div class="asa-seg"><button data-a="gender" data-v="women" class="' + (state.gender === 'women' ? 'on' : '') + '">WOMENSWEAR</button>' +
        '<button data-a="gender" data-v="men" class="' + (state.gender === 'men' ? 'on' : '') + '">MENSWEAR</button></div>' +

        '<div class="asa-row"><div class="asa-rowhead"><span>HEIGHT</span><span class="asa-unit">' +
        '<button data-a="hunit" data-v="cm" class="' + (state.heightUnit === 'cm' ? 'on' : '') + '">CM</button>' +
        '<button data-a="hunit" data-v="ft" class="' + (state.heightUnit === 'ft' ? 'on' : '') + '">FT/IN</button></span></div>' +
        '<div class="asa-val" id="asa-hv">' + heightLabel() + '</div>' +
        '<div class="asa-ctl"><button class="asa-step" data-a="hminus" aria-label="Decrease height">\u2212</button>' +
        '<input type="range" id="asa-h" min="140" max="210" value="' + state.cm + '">' +
        '<button class="asa-step" data-a="hplus" aria-label="Increase height">+</button></div></div>' +

        '<div class="asa-row"><div class="asa-rowhead"><span>WEIGHT</span><span class="asa-unit">' +
        '<button data-a="wunit" data-v="kg" class="' + (state.weightUnit === 'kg' ? 'on' : '') + '">KG</button>' +
        '<button data-a="wunit" data-v="lb" class="' + (state.weightUnit === 'lb' ? 'on' : '') + '">LB</button></span></div>' +
        '<div class="asa-val" id="asa-wv">' + weightLabel() + '</div>' +
        '<div class="asa-ctl"><button class="asa-step" data-a="wminus" aria-label="Decrease weight">\u2212</button>' +
        '<input type="range" id="asa-w" min="35" max="150" value="' + state.kg + '">' +
        '<button class="asa-step" data-a="wplus" aria-label="Increase weight">+</button></div></div>' +

        '<div class="asa-live"><div>LIVE ESTIMATE<small>Refines in the next steps</small></div><b id="asa-est">' + quickEstimate() + '</b></div>' +
        '<button class="asa-cta" data-a="next">CONTINUE \u2192</button>' +
        '<div class="asa-note">Your answers stay on this device. Nothing is sent anywhere.</div>';
    }

    if (state.step === 2) {
      html += '<h3 class="asa-h">Your shape</h3><p class="asa-sub">Compared with most people your height and weight.</p>' +
        '<div class="asa-q"><p>CHEST</p>' + opts('chest', [['narrower', 'Narrower'], ['average', 'Average'], ['fuller', 'Fuller']]) + '</div>' +
        '<div class="asa-q"><p>STOMACH</p>' + opts('stomach', [['narrower', 'Narrower'], ['average', 'Average'], ['fuller', 'Fuller']]) + '</div>' +
        '<div class="asa-q"><p>HOW DO YOU LIKE IT TO FIT?</p>' + opts('fit', [['snug', 'Snug'], ['true', 'True to size'], ['loose', 'Loose']]) + '</div>' +
        '<button class="asa-cta" data-a="next">SEE MY SIZE \u2192</button>' +
        '<button class="asa-ghost" data-a="back">\u2190 BACK</button>';
    }

    if (state.step === 3) {
      var r = recommend();
      html += '<h3 class="asa-h" style="text-align:center">Your size</h3>' +
        '<div class="asa-ring"><b>' + r.size + '</b><span>Best fit</span></div>' +
        '<ul class="asa-why">' + r.reasons.map(function (x) {
          return '<li><span>' + x[0] + '</span><span>' + x[1] + '</span></li>';
        }).join('') + '</ul>' +
        '<div class="asa-sizes">' + CONFIG.sizes.map(function (s) {
          return '<span class="' + (s === r.size ? 'rec' : (s === r.alt ? 'alt' : '')) + '">' + s + '</span>';
        }).join('') + '</div>' +
        (r.alt ? '<div class="asa-note" style="margin:-6px 0 12px">Between sizes? ' + r.alt + ' is a close second.</div>' : '') +
        '<button class="asa-cta" data-a="apply" data-v="' + r.size + '">SELECT ' + r.size + ' ON THE PAGE</button>' +
        '<button class="asa-ghost" data-a="back">EDIT DETAILS</button>' +
        '<div class="asa-note">Based on your height, weight and shape. It\u2019s a guide, not a guarantee.</div>';
    }

    modal.innerHTML = html;
    bindSliders();
  }

  function bindSliders() {
    var h = document.getElementById('asa-h');
    var w = document.getElementById('asa-w');
    if (h) h.addEventListener('input', function () { state.cm = +h.value; refresh1(); });
    if (w) w.addEventListener('input', function () { state.kg = +w.value; refresh1(); });
  }

  function refresh1() {
    var hv = document.getElementById('asa-hv');
    var wv = document.getElementById('asa-wv');
    var est = document.getElementById('asa-est');
    var h = document.getElementById('asa-h');
    var w = document.getElementById('asa-w');
    if (hv) hv.textContent = heightLabel();
    if (wv) wv.textContent = weightLabel();
    if (est) est.textContent = quickEstimate();
    if (h) h.value = state.cm;
    if (w) w.value = state.kg;
    persist();
  }

  /* ---------------- SELECT SIZE ON PAGE ---------------- */
  function selectOnPage(size) {
    var done = false;

    var selects = document.querySelectorAll('select');
    for (var i = 0; i < selects.length; i++) {
      var opt = Array.prototype.find.call(selects[i].options, function (o) {
        return o.value.toUpperCase() === size || o.textContent.trim().toUpperCase() === size;
      });
      if (opt) {
        selects[i].value = opt.value;
        selects[i].dispatchEvent(new Event('change', { bubbles: true }));
        done = true;
        break;
      }
    }
    if (done) return true;

    var nodes = document.querySelectorAll('[data-size], button, label, .size, .size-btn, .size-option');
    for (var j = 0; j < nodes.length; j++) {
      var n = nodes[j];
      if (overlay.contains(n)) continue;
      var val = (n.getAttribute('data-size') || n.textContent || '').trim().toUpperCase();
      if (val === size) { n.click(); return true; }
    }
    return false;
  }

  /* ---------------- OPEN / CLOSE ---------------- */
  function open() {
    state.step = 1;
    render();
    overlay.classList.add('asa-open');
    document.body.style.overflow = 'hidden';
  }
  function close() {
    overlay.classList.remove('asa-open');
    document.body.style.overflow = '';
  }

  overlay.addEventListener('click', function (e) {
    if (e.target === overlay) return close();
    var t = e.target.closest('[data-a]');
    if (!t) return;
    var a = t.getAttribute('data-a');
    var v = t.getAttribute('data-v');

    if (a === 'close') close();
    else if (a === 'next') { state.step = Math.min(3, state.step + 1); persist(); render(); }
    else if (a === 'back') { state.step = Math.max(1, state.step - 1); render(); }
    else if (a === 'gender') { state.gender = v; persist(); render(); }
    else if (a === 'hunit') { state.heightUnit = v; persist(); render(); }
    else if (a === 'wunit') { state.weightUnit = v; persist(); render(); }
    else if (a === 'hminus') { state.cm = Math.max(140, state.cm - 1); refresh1(); }
    else if (a === 'hplus') { state.cm = Math.min(210, state.cm + 1); refresh1(); }
    else if (a === 'wminus') { state.kg = Math.max(35, state.kg - 1); refresh1(); }
    else if (a === 'wplus') { state.kg = Math.min(150, state.kg + 1); refresh1(); }
    else if (a === 'opt') { state[t.getAttribute('data-k')] = v; persist(); render(); }
    else if (a === 'apply') {
      var ok = selectOnPage(v);
      close();
      if (!ok) { try { alert('We recommend size ' + v + '. Please select it on the page.'); } catch (err) {} }
    }
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && overlay.classList.contains('asa-open')) close();
  });

  /* ---------------- TRIGGER BUTTON ---------------- */
  function makeTrigger() {
    var b = document.createElement('button');
    b.type = 'button';
    b.id = 'asa-open';
    b.className = 'asa-trigger';
    b.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 17 17 3l4 4L7 21z"/><path d="m8 12 2 2M11 9l2 2M14 6l2 2"/></svg>Find my size';
    return b;
  }

  function mount() {
    var existing = document.getElementById('asa-open');
    if (existing) {
      if (!existing.__asa) { existing.addEventListener('click', open); existing.__asa = true; }
      return true;
    }
    var anchor = document.querySelector(CONFIG.mountAfter);
    if (!anchor) return false;
    var btn = makeTrigger();
    btn.addEventListener('click', open);
    btn.__asa = true;
    anchor.parentNode.insertBefore(btn, anchor.nextSibling);
    return true;
  }

  function init() {
    if (mount()) return;
    var tries = 0;
    var timer = setInterval(function () {
      tries++;
      if (mount() || tries > 30) {
        clearInterval(timer);
        if (tries > 30) console.warn('AARAMBH Size Advisor: no size container found. Add <button id="asa-open">Find my size</button> where you want it.');
      }
    }, 400);
  }

  window.AARAMBHSizeAdvisor = { open: open, close: close };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
