/* AARAMBH — product-extras.js
   Adds to product.html: hoodie fabric update (320 GSM), delivery times, "Before you buy" answers, and a Try On preview.
   Load it with one line just above </body> in product.html:  <script src="product-extras.js"></script> */
(function () {
  'use strict';
  var q = function (s) { return document.querySelector(s); };
  var qs = new URLSearchParams(location.search);
  var type = (qs.get('type') || '').toLowerCase();
  var isHoodie = type === 'hoodie';
  var isCrop = type.indexOf('crop') > -1;
  var isPrinted = type.indexOf('printed') > -1 || isCrop;
  var isRegular = isPrinted && type.indexOf('regular') > -1;
  var isPolo = type === 'polo';
  var isShirt = type === 'boxy shirt';

  /* ---------- 1. Hoodie fabric details ---------- */
  if (isHoodie) {
    var mat = q('#materialDetail'), gsm = q('#gsmDetail'), desc = q('#productDescription');
    if (mat) mat.textContent = '88% Cotton, 12% Polyester — Brushed Fleece';
    if (gsm) gsm.textContent = '320 GSM';
    if (desc) desc.textContent = 'Heavyweight 320 GSM brushed-fleece hoodie (88% cotton, 12% polyester) with a relaxed fit for layering.';
  }

  /* ---------- 2. Styles ---------- */
  var css = document.createElement('style');
  css.textContent = [
    '.ex-box{background:var(--card);border:1px solid var(--line);border-radius:12px;padding:14px 16px;margin:0 0 18px;}',
    '.ex-title{font-family:"Syne",sans-serif;font-size:.78rem;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:var(--muted);margin-bottom:10px;}',
    '.ex-row{display:flex;gap:12px;padding:9px 0;border-top:1px solid var(--line);font-size:.88rem;line-height:1.5;}',
    '.ex-row:first-of-type{border-top:none;padding-top:0;}',
    '.ex-row b{flex:0 0 92px;font-family:"Syne",sans-serif;font-size:.78rem;letter-spacing:.4px;color:var(--accent2);}',
    '.ex-row span{color:var(--muted);}',
    '.ex-row span strong{color:var(--text);}',
    '.faq details{border-top:1px solid var(--line);padding:11px 0;}',
    '.faq details:first-of-type{border-top:none;}',
    '.faq summary{cursor:pointer;font-weight:600;font-size:.92rem;list-style:none;display:flex;justify-content:space-between;gap:10px;}',
    '.faq summary::-webkit-details-marker{display:none;}',
    '.faq summary::after{content:"+";color:var(--accent2);font-size:1.2rem;line-height:1;transition:transform .25s;}',
    '.faq details[open] summary::after{transform:rotate(45deg);}',
    '.faq p{color:var(--muted);font-size:.86rem;line-height:1.6;margin-top:8px;}',
    '.faq button.linkish{background:none;border:none;color:var(--accent2);text-decoration:underline;cursor:pointer;font:inherit;padding:0;}',
    '.tryon-btn{width:100%;height:48px;margin:0 0 14px;background:transparent;color:var(--text);border:1px dashed var(--accent2);border-radius:8px;font-family:"Syne",sans-serif;font-weight:700;font-size:.9rem;letter-spacing:.6px;cursor:pointer;transition:.2s var(--ease);display:flex;align-items:center;justify-content:center;gap:8px;}',
    '.tryon-btn:hover{background:rgba(232,69,44,.12);transform:translateY(-2px);}',
    '.tryon-btn svg{width:18px;height:18px;}',
    '.tryon-overlay{position:fixed;inset:0;background:rgba(0,0,0,.8);display:none;align-items:center;justify-content:center;z-index:120;padding:12px;}',
    '.tryon-overlay.open{display:flex;animation:fadeIn .25s ease;}',
    '.tryon-modal{background:var(--card);border:1px solid var(--line);border-radius:14px;width:100%;max-width:520px;max-height:94vh;overflow-y:auto;padding:18px;}',
    '.tryon-head{display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;}',
    '.tryon-note{color:var(--muted);font-size:.8rem;line-height:1.5;margin-bottom:12px;}',
    '.tryon-drop{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;text-align:center;border:1px dashed var(--line);border-radius:12px;padding:34px 16px;cursor:pointer;color:var(--muted);font-size:.88rem;line-height:1.5;}',
    '.tryon-drop strong{color:var(--text);font-family:"Syne",sans-serif;}',
    '.tryon-drop:hover{border-color:var(--accent);}',
    '.tryon-stage{position:relative;margin:0 auto 12px;overflow:hidden;border-radius:12px;background:#0b0b13;touch-action:none;user-select:none;-webkit-user-select:none;width:min(100%,calc(58vh * var(--ar,.75)));aspect-ratio:var(--ar,.75);cursor:grab;}',
    '.tryon-stage img{position:absolute;display:block;-webkit-user-drag:none;pointer-events:none;}',
    '#tryPhoto{inset:0;width:100%;height:100%;object-fit:cover;}',
    '#tryGarment{left:50%;top:50%;width:60%;height:auto;transform:translate(-50%,-50%);filter:drop-shadow(0 6px 10px rgba(0,0,0,.35));}',
    '.tryon-row{display:flex;align-items:center;gap:10px;margin-bottom:10px;font-size:.78rem;color:var(--muted);}',
    '.tryon-row label{flex:0 0 58px;text-transform:uppercase;letter-spacing:1px;font-weight:600;}',
    '.tryon-row input[type=range]{flex:1;accent-color:var(--accent);}',
    '.tryon-seg{display:flex;gap:8px;margin-bottom:12px;flex-wrap:wrap;align-items:center;}',
    '.tryon-seg button,.tryon-actions button{padding:10px 14px;border-radius:8px;border:1px solid var(--line);background:var(--card);color:var(--text);cursor:pointer;font-family:"DM Sans",sans-serif;font-weight:600;font-size:.82rem;}',
    '.tryon-seg button.active{background:var(--accent);border-color:var(--accent);}',
    '.tryon-swatch{width:26px;height:26px;border-radius:50%;border:2px solid var(--line);cursor:pointer;padding:0;}',
    '.tryon-swatch.active{box-shadow:0 0 0 2px var(--bg),0 0 0 4px var(--accent);}',
    '.tryon-actions{display:flex;gap:8px;flex-wrap:wrap;}',
    '.tryon-actions button{flex:1 1 30%;}',
    '.tryon-actions .primary{background:var(--accent);border-color:var(--accent);font-family:"Syne",sans-serif;font-weight:700;}',
    '.tryon-load{position:absolute;inset:0;display:none;align-items:center;justify-content:center;background:rgba(0,0,0,.45);color:#fff;font-size:.85rem;z-index:3;}'
  ].join('');
  document.head.appendChild(css);

  /* ---------- 3. Delivery + FAQ blocks ---------- */
  function fmt(d) { return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }); }
  function plus(n) { var d = new Date(); d.setDate(d.getDate() + n); return d; }
  var deliveryText = isPrinted ? '7 to 10 days' : '7 days';
  var deliveryDates = isPrinted ? ('Estimated arrival: ' + fmt(plus(7)) + ' – ' + fmt(plus(10))) : ('Estimated arrival: by ' + fmt(plus(7)));

  var anchor = q('.policy-note');
  if (anchor) {
    var box = document.createElement('div');
    box.className = 'ex-box';
    box.innerHTML =
      '<div class="ex-title">Before you buy</div>' +
      '<div class="ex-row"><b>Delivery</b><span><strong>' + deliveryText + '</strong> from the day you order. ' + deliveryDates + '.</span></div>' +
      '<div class="ex-row"><b>Shipping</b><span>₹30 for Goa and Karnataka, ₹50 for the rest of India. Price shown is per piece.</span></div>' +
      '<div class="ex-row"><b>Returns</b><span>Accepted only for print-related issues, reported within 3 days of delivery. Please check the size chart before ordering.</span></div>';
    anchor.parentNode.insertBefore(box, anchor.nextSibling);

    var fit = (q('#fitDetail') || {}).textContent || '';
    var matTxt = (q('#materialDetail') || {}).textContent || '';
    var gsmTxt = (q('#gsmDetail') || {}).textContent || '';
    var sizeTip =
      isHoodie ? 'This hoodie has a relaxed fit. Take your usual size for comfortable layering, or one size up if you want it roomier.' :
      isCrop ? 'This is a cropped fit, so the length is shorter than a regular tee. Take your usual size and check the chest and length on the size chart.' :
      isShirt ? 'This is a boxy cut with a relaxed, structured drape. Take your usual size and check chest and length on the size chart.' :
      isPolo ? 'This polo has a regular fit. Take your usual size; if you are between two sizes, go one up for comfort.' :
      isRegular ? 'This tee has a regular fit. Take your usual size; if you are between two sizes, go one up for comfort.' :
      'This tee is cut oversized with a drop shoulder. Take your usual size for the intended loose look, or one size down for a closer fit.';
    var care = isPrinted
      ? 'To keep the print looking good: wash inside out in cold water, avoid bleach, dry in shade and do not iron directly on the print.'
      : 'Wash in cold water, avoid bleach, and dry in shade to keep the colour and fabric feel.';
    var faqs = [
      ['What is it made of?', 'Material: ' + matTxt + '. Fabric weight: ' + gsmTxt + '. Fit: ' + fit + '.'],
      ['Which size should I choose?', sizeTip + ' <button type="button" class="linkish" id="faqChart">Open the size chart</button>'],
      ['When will it reach me?', 'Plain pieces (tees, polos, hoodies, shirts) take 7 days. Printed pieces take 7 to 10 days. ' + deliveryDates + '.'],
      ['How much is delivery?', '₹30 for Goa and Karnataka, ₹50 for the rest of India.'],
      ['Can I return it?', 'Returns are accepted only for print-related issues, and the issue must be reported within 3 days of receiving the delivery. Because of this, please review the size chart carefully before you order.'],
      ['Will the colour match the photos?', 'We photograph every piece to show the colour as close as possible. Slight differences can appear depending on your screen brightness.'],
      ['How do I care for it?', care],
      ['How will it look on me?', 'Tap “Try On” above the size buttons, add your photo, and move the garment over yourself. It is a quick visual preview, so use the size chart for the actual fit.']
    ];
    var faq = document.createElement('div');
    faq.className = 'ex-box faq';
    faq.innerHTML = '<div class="ex-title">Questions, answered</div>' + faqs.map(function (f) {
      return '<details><summary>' + f[0] + '</summary><p>' + f[1] + '</p></details>';
    }).join('');
    box.parentNode.insertBefore(faq, box.nextSibling);
    var fc = faq.querySelector('#faqChart');
    if (fc) fc.addEventListener('click', function () { var b = q('#openChart'); if (b) b.click(); });
  }

  /* ---------- 4. Try On ---------- */
  var buyRow = q('.buy-row');
  if (!buyRow) return;
  var tryBtn = document.createElement('button');
  tryBtn.type = 'button';
  tryBtn.className = 'tryon-btn';
  tryBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8"/></svg>TRY ON';
  buyRow.parentNode.insertBefore(tryBtn, buyRow);

  var ov = document.createElement('div');
  ov.className = 'tryon-overlay';
  ov.id = 'tryOnOverlay';
  ov.setAttribute('role', 'dialog');
  ov.setAttribute('aria-modal', 'true');
  ov.setAttribute('aria-label', 'Try on AARAMBH');
  ov.innerHTML =
    '<div class="tryon-modal">' +
    '<div class="tryon-head"><h2 class="display" style="font-size:1.5rem;">TRY ON</h2><button class="modal-close" id="tryClose" aria-label="Close">&times;</button></div>' +
    '<p class="tryon-note">Your photo stays on your phone. It is never uploaded anywhere.</p>' +
    '<label class="tryon-drop" id="tryDrop"><strong>Add your photo</strong><span>Upload one or take a selfie. Standing straight against a plain background works best.</span>' +
    '<input type="file" id="tryFile" accept="image/*" hidden></label>' +
    '<div id="tryWork" hidden>' +
    '<div class="tryon-stage" id="tryStage"><img id="tryPhoto" alt="Your photo"><img id="tryGarment" alt="AARAMBH garment preview"><div class="tryon-load" id="tryLoad">Preparing garment…</div></div>' +
    '<p class="tryon-note">Drag the garment to move it. Pinch or use the sliders to resize and rotate. This is a visual preview, so check the size chart for fit.</p>' +
    '<div class="tryon-seg"><button type="button" id="tryFront" class="active">Front</button><button type="button" id="tryBack">Back</button><span id="trySwatches" style="display:flex;gap:8px;margin-left:auto;"></span></div>' +
    '<div class="tryon-row"><label for="trySize">Size</label><input type="range" id="trySize" min="20" max="140" value="60"></div>' +
    '<div class="tryon-row"><label for="tryRot">Rotate</label><input type="range" id="tryRot" min="-30" max="30" value="0"></div>' +
    '<div class="tryon-actions"><button type="button" id="tryReset">Reset</button><button type="button" id="tryChange">Change photo</button><button type="button" id="trySave">Save look</button><button type="button" class="primary" id="tryCart" style="flex-basis:100%;">ADD TO CART</button></div>' +
    '</div></div>';
  document.body.appendChild(ov);

  var $ = function (id) { return document.getElementById(id); };
  var photo = $('tryPhoto'), garment = $('tryGarment'), stage = $('tryStage');
  var st = { cx: 0.5, cy: 0.52, sc: 0.6, rot: 0 };
  var side = 0, cache = {}, token = 0;

  function apply() {
    garment.style.left = (st.cx * 100) + '%';
    garment.style.top = (st.cy * 100) + '%';
    garment.style.width = (st.sc * 100) + '%';
    garment.style.transform = 'translate(-50%,-50%) rotate(' + st.rot + 'deg)';
    $('trySize').value = Math.round(st.sc * 100);
    $('tryRot').value = Math.round(st.rot);
  }
  function reset() { st = { cx: 0.5, cy: 0.52, sc: 0.6, rot: 0 }; apply(); }

  /* Removes a plain photo background so only the garment is left (skips images that are already transparent) */
  function cutout(src) {
    if (cache[src]) return Promise.resolve(cache[src]);
    return new Promise(function (resolve) {
      var im = new Image();
      im.onload = function () {
        var out = src;
        try {
          var m = 700, s = Math.min(1, m / Math.max(im.naturalWidth, im.naturalHeight));
          var w = Math.max(1, Math.round(im.naturalWidth * s)), h = Math.max(1, Math.round(im.naturalHeight * s));
          var c = document.createElement('canvas'); c.width = w; c.height = h;
          var x = c.getContext('2d', { willReadFrequently: true });
          x.drawImage(im, 0, 0, w, h);
          var d = x.getImageData(0, 0, w, h), p = d.data;
          if (p[3] > 200) {
            var r0 = p[0], g0 = p[1], b0 = p[2], T = 90;
            var seen = new Uint8Array(w * h), stack = [], i;
            var match = function (k) { var o = k * 4; return Math.abs(p[o] - r0) + Math.abs(p[o + 1] - g0) + Math.abs(p[o + 2] - b0) < T; };
            var push = function (k) { if (!seen[k] && match(k)) { seen[k] = 1; stack.push(k); } };
            for (i = 0; i < w; i++) { push(i); push((h - 1) * w + i); }
            for (i = 0; i < h; i++) { push(i * w); push(i * w + w - 1); }
            while (stack.length) {
              var k = stack.pop(), px = k % w, py = (k - px) / w;
              p[k * 4 + 3] = 0;
              if (px > 0) push(k - 1);
              if (px < w - 1) push(k + 1);
              if (py > 0) push(k - w);
              if (py < h - 1) push(k + w);
            }
            x.putImageData(d, 0, 0);
          }
          var minx = w, miny = h, maxx = 0, maxy = 0, xx, yy;
          for (yy = 0; yy < h; yy++) for (xx = 0; xx < w; xx++) {
            if (p[(yy * w + xx) * 4 + 3] > 10) { if (xx < minx) minx = xx; if (xx > maxx) maxx = xx; if (yy < miny) miny = yy; if (yy > maxy) maxy = yy; }
          }
          if (maxx > minx && maxy > miny) {
            var oc = document.createElement('canvas'); oc.width = maxx - minx + 1; oc.height = maxy - miny + 1;
            oc.getContext('2d').drawImage(c, minx, miny, oc.width, oc.height, 0, 0, oc.width, oc.height);
            out = oc.toDataURL('image/png');
          }
        } catch (e) { out = src; }
        cache[src] = out;
        resolve(out);
      };
      im.onerror = function () { resolve(src); };
      im.src = src;
    });
  }

  function loadGarment() {
    var el = side ? $('imgBack') : $('imgFront');
    var src = el ? (el.currentSrc || el.src) : '';
    if (!src) return;
    var my = ++token;
    $('tryLoad').style.display = 'flex';
    cutout(src).then(function (url) {
      if (my !== token) return;
      garment.onload = function () { $('tryLoad').style.display = 'none'; };
      garment.src = url;
    });
  }

  function buildSwatches() {
    var wrap = $('trySwatches'); wrap.innerHTML = '';
    var real = document.querySelectorAll('#swatches .swatch');
    if (real.length < 2) return;
    real.forEach(function (sw) {
      var b = document.createElement('button');
      b.type = 'button'; b.className = 'tryon-swatch' + (sw.classList.contains('active') ? ' active' : '');
      b.style.background = sw.style.background; b.title = sw.title; b.setAttribute('aria-label', 'Try ' + sw.title);
      b.addEventListener('click', function () {
        sw.click();
        setTimeout(function () { buildSwatches(); loadGarment(); }, 30);
      });
      wrap.appendChild(b);
    });
  }

  function setSide(n) {
    side = n;
    $('tryFront').classList.toggle('active', n === 0);
    $('tryBack').classList.toggle('active', n === 1);
    loadGarment();
  }

  function openModal() {
    ov.classList.add('open');
    document.body.style.overflow = 'hidden';
    if (!$('tryWork').hidden) { buildSwatches(); loadGarment(); }
  }
  function closeModal() { ov.classList.remove('open'); document.body.style.overflow = ''; }

  tryBtn.addEventListener('click', openModal);
  $('tryClose').addEventListener('click', closeModal);
  ov.addEventListener('click', function (e) { if (e.target === ov) closeModal(); });
  addEventListener('keydown', function (e) { if (e.key === 'Escape') closeModal(); });

  $('tryFile').addEventListener('change', function (e) {
    var f = e.target.files && e.target.files[0];
    if (!f) return;
    var url = URL.createObjectURL(f);
    photo.onload = function () {
      stage.style.setProperty('--ar', photo.naturalWidth / photo.naturalHeight);
      $('tryDrop').hidden = true;
      $('tryWork').hidden = false;
      side = 0; $('tryFront').classList.add('active'); $('tryBack').classList.remove('active');
      reset(); buildSwatches(); loadGarment();
    };
    photo.src = url;
  });
  $('tryChange').addEventListener('click', function () {
    $('tryFile').value = '';
    $('tryWork').hidden = true;
    $('tryDrop').hidden = false;
  });
  $('tryFront').addEventListener('click', function () { setSide(0); });
  $('tryBack').addEventListener('click', function () { setSide(1); });
  $('tryReset').addEventListener('click', reset);
  $('trySize').addEventListener('input', function () { st.sc = Number(this.value) / 100; apply(); });
  $('tryRot').addEventListener('input', function () { st.rot = Number(this.value); apply(); });
  $('tryCart').addEventListener('click', function () {
    var b = q('#addCartDesktop'); closeModal(); if (b) b.click();
  });

  /* drag with one finger, pinch/rotate with two, mouse wheel to resize */
  var ptrs = {}, start = null;
  function pts() { return Object.keys(ptrs).map(function (k) { return ptrs[k]; }); }
  function snap() {
    var a = pts(), r = stage.getBoundingClientRect();
    if (a.length === 1) start = { t: 1, x: a[0].x, y: a[0].y, cx: st.cx, cy: st.cy, r: r };
    else if (a.length >= 2) {
      var dx = a[1].x - a[0].x, dy = a[1].y - a[0].y;
      start = { t: 2, d: Math.hypot(dx, dy) || 1, a: Math.atan2(dy, dx), sc: st.sc, rot: st.rot };
    } else start = null;
  }
  stage.addEventListener('pointerdown', function (e) {
    ptrs[e.pointerId] = { x: e.clientX, y: e.clientY };
    try { stage.setPointerCapture(e.pointerId); } catch (_) {}
    snap();
  });
  stage.addEventListener('pointermove', function (e) {
    if (!ptrs[e.pointerId] || !start) return;
    ptrs[e.pointerId] = { x: e.clientX, y: e.clientY };
    var a = pts();
    if (start.t === 1 && a.length === 1) {
      st.cx = Math.min(1.2, Math.max(-0.2, start.cx + (a[0].x - start.x) / start.r.width));
      st.cy = Math.min(1.2, Math.max(-0.2, start.cy + (a[0].y - start.y) / start.r.height));
    } else if (start.t === 2 && a.length >= 2) {
      var dx = a[1].x - a[0].x, dy = a[1].y - a[0].y;
      st.sc = Math.min(1.4, Math.max(0.2, start.sc * Math.hypot(dx, dy) / start.d));
      st.rot = Math.min(30, Math.max(-30, start.rot + (Math.atan2(dy, dx) - start.a) * 180 / Math.PI));
    }
    apply();
  });
  function up(e) { delete ptrs[e.pointerId]; snap(); }
  stage.addEventListener('pointerup', up);
  stage.addEventListener('pointercancel', up);
  stage.addEventListener('wheel', function (e) {
    e.preventDefault();
    st.sc = Math.min(1.4, Math.max(0.2, st.sc * (e.deltaY < 0 ? 1.06 : 0.94)));
    apply();
  }, { passive: false });

  /* save the finished look as an image */
  $('trySave').addEventListener('click', function () {
    try {
      var s = Math.min(1, 1400 / Math.max(photo.naturalWidth, photo.naturalHeight));
      var W = Math.round(photo.naturalWidth * s), H = Math.round(photo.naturalHeight * s);
      var c = document.createElement('canvas'); c.width = W; c.height = H;
      var x = c.getContext('2d');
      x.drawImage(photo, 0, 0, W, H);
      var gw = st.sc * W, gh = gw * garment.naturalHeight / garment.naturalWidth;
      x.save();
      x.translate(st.cx * W, st.cy * H);
      x.rotate(st.rot * Math.PI / 180);
      x.shadowColor = 'rgba(0,0,0,.35)'; x.shadowBlur = W * 0.012; x.shadowOffsetY = W * 0.006;
      x.drawImage(garment, -gw / 2, -gh / 2, gw, gh);
      x.restore();
      x.shadowColor = 'rgba(0,0,0,.6)'; x.shadowBlur = 6;
      x.fillStyle = '#fff'; x.font = '700 ' + Math.round(W * 0.04) + 'px sans-serif';
      x.fillText('AARAMBH', W * 0.04, H - W * 0.04);
      c.toBlob(function (b) {
        if (!b) { alert('Could not save the image. Please take a screenshot instead.'); return; }
        var a = document.createElement('a');
        a.href = URL.createObjectURL(b); a.download = 'AARAMBH-try-on.png';
        document.body.appendChild(a); a.click(); a.remove();
      }, 'image/png');
    } catch (err) {
      alert('Could not save the image. Please take a screenshot instead.');
    }
  });

  apply();
})();
