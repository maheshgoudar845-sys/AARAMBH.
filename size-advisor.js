/* AARAMBH Size Advisor — "Find my size" (3 steps: measurements, shape, recommendation)
   Loaded by product.html through <script src="size-advisor.js"></script>. No other changes needed. */
(function(){
  'use strict';
  if(window.__aarambhSizeAdvisor) return;
  window.__aarambhSizeAdvisor = true;

  /* ================= CONFIG (edit me) =================
     Weight limits (kg) for each size, in the same order as sizes.
     A person lighter than the number is in that size. The last number (999) catches everyone heavier.
     tallCm / shortCm: at or above / at or below these heights the size nudges up / down. */
  var CONFIG = {
    sizes:  ['XS', 'S', 'M', 'L', 'XL', '2XL'],
    men:    [55, 63, 73, 83, 94, 999],
    women:  [45, 52, 60, 69, 79, 999],
    tallCm: 182,
    shortCm: 163
  };

  function init(){
    var sizeHead = document.querySelector('.size-head');
    var openChart = document.getElementById('openChart');
    if(!sizeHead || !openChart) return;

    var ALL = CONFIG.sizes;
    var KEY = 'aarambhSizeAdvisor';
    var st = {g:'men', cm:175, kg:72, hu:'cm', wu:'kg', chest:1, stomach:1, hips:1, fit:'true'};
    try { var saved = JSON.parse(localStorage.getItem(KEY)); if(saved && typeof saved === 'object'){ for(var k in st){ if(saved[k] !== undefined) st[k] = saved[k]; } } } catch(_){}
    var step = 1, result = null, lastFocus = null;

    /* ---------- Styles ---------- */
    var css = document.createElement('style');
    css.textContent = [
      '.sa-link{display:inline-flex;align-items:center;gap:6px;background:none;border:1px solid var(--accent,#E8452C);color:var(--text,#F5F3EE);border-radius:999px;padding:6px 12px;font-family:inherit;font-size:.78rem;font-weight:600;cursor:pointer;transition:background .2s,transform .2s;}',
      '.sa-link:hover{background:rgba(232,69,44,.14);transform:translateY(-1px);}',
      '.sa-link svg{width:14px;height:14px;}',
      '.sa-overlay{position:fixed;inset:0;z-index:110;background:rgba(0,0,0,.72);display:none;align-items:center;justify-content:center;padding:16px;}',
      '.sa-overlay.open{display:flex;animation:saFade .25s ease;}',
      '.sa-overlay.open .sa-sheet{animation:saIn .35s cubic-bezier(.2,.7,.2,1);}',
      '@keyframes saFade{from{opacity:0}to{opacity:1}}',
      '@keyframes saIn{from{opacity:0;transform:translateY(24px) scale(.97)}to{opacity:1;transform:none}}',
      '.sa-sheet{background:var(--card,#101018);color:var(--text,#F5F3EE);border:1px solid var(--line,#232130);border-radius:16px;width:100%;max-width:440px;max-height:92vh;overflow-y:auto;padding:18px 18px 16px;font-family:"DM Sans",sans-serif;}',
      '@media(max-width:560px){.sa-overlay{align-items:flex-end;padding:0;}.sa-sheet{max-width:none;border-radius:18px 18px 0 0;max-height:94vh;}}',
      '.sa-top{display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;}',
      '.sa-eyebrow{font-family:"Syne",sans-serif;font-size:.68rem;font-weight:700;letter-spacing:2px;color:var(--muted,#9A96A8);}',
      '.sa-x{background:none;border:none;color:var(--muted,#9A96A8);font-size:1.6rem;line-height:1;cursor:pointer;padding:0 4px;}',
      '.sa-prod{display:flex;align-items:center;gap:12px;background:rgba(255,255,255,.04);border:1px solid var(--line,#232130);border-radius:12px;padding:10px;margin-bottom:12px;}',
      '.sa-pimg{width:40px;height:50px;border-radius:6px;background:#0b0b13;overflow:hidden;flex:0 0 auto;}',
      '.sa-pimg img{width:100%;height:100%;object-fit:contain;display:block;}',
      '.sa-pname{font-family:"Syne",sans-serif;font-weight:700;font-size:.92rem;}',
      '.sa-pprice{color:var(--muted,#9A96A8);font-size:.82rem;margin-top:2px;}',
      '.sa-bars{display:flex;gap:6px;margin-bottom:8px;}',
      '.sa-bars i{flex:1;height:3px;border-radius:3px;background:var(--line,#232130);transition:background .3s;}',
      '.sa-bars i.on{background:var(--accent,#E8452C);}',
      '.sa-stepname{color:var(--muted,#9A96A8);font-size:.76rem;margin-bottom:14px;}',
      '.sa-h{font-family:"Bebas Neue",sans-serif;letter-spacing:1px;font-size:1.9rem;line-height:1;margin-bottom:4px;}',
      '.sa-sub{color:var(--muted,#9A96A8);font-size:.88rem;margin-bottom:14px;}',
      '.sa-tabs{display:grid;grid-template-columns:1fr 1fr;border:1px solid var(--line,#232130);border-radius:10px;overflow:hidden;margin-bottom:16px;}',
      '.sa-tabs button{background:transparent;border:none;color:var(--muted,#9A96A8);padding:11px 8px;font-family:"Syne",sans-serif;font-weight:700;font-size:.72rem;letter-spacing:1.4px;text-transform:uppercase;cursor:pointer;transition:.2s;}',
      '.sa-tabs button.on{background:var(--text,#F5F3EE);color:#080810;}',
      '.sa-field{margin-bottom:16px;}',
      '.sa-fhead{display:flex;justify-content:space-between;align-items:center;margin-bottom:2px;}',
      '.sa-flabel{font-size:.68rem;letter-spacing:1.6px;text-transform:uppercase;color:var(--muted,#9A96A8);font-weight:600;}',
      '.sa-units{display:flex;border:1px solid var(--line,#232130);border-radius:6px;overflow:hidden;}',
      '.sa-units button{background:transparent;border:none;color:var(--muted,#9A96A8);font-size:.66rem;font-weight:700;padding:4px 8px;cursor:pointer;letter-spacing:.5px;}',
      '.sa-units button.on{background:var(--text,#F5F3EE);color:#080810;}',
      '.sa-big{font-family:"Syne",sans-serif;font-weight:700;font-size:1.7rem;margin:2px 0 6px;}',
      '.sa-slide{display:flex;align-items:center;gap:10px;}',
      '.sa-slide input[type=range]{flex:1;accent-color:#E8452C;height:28px;}',
      '.sa-step{width:30px;height:30px;border-radius:50%;border:1px solid var(--line,#232130);background:var(--card,#101018);color:var(--text,#F5F3EE);font-size:1.05rem;cursor:pointer;flex:0 0 auto;}',
      '.sa-step:active{transform:scale(.92);}',
      '.sa-live{display:flex;justify-content:space-between;align-items:center;border:1px solid var(--line,#232130);border-radius:10px;padding:12px 14px;background:rgba(255,255,255,.03);}',
      '.sa-live small{display:block;font-size:.66rem;letter-spacing:1.6px;color:var(--muted,#9A96A8);font-weight:600;}',
      '.sa-live em{display:block;font-style:normal;font-size:.76rem;color:var(--muted,#9A96A8);margin-top:2px;}',
      '.sa-live b{font-family:"Syne",sans-serif;font-size:1.5rem;color:var(--accent2,#FF7A45);}',
      '.sa-group{margin-bottom:16px;}',
      '.sa-group .sa-flabel{margin-bottom:8px;}',
      '.sa-seg{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;}',
      '.sa-seg button{padding:11px 6px;border-radius:8px;border:1px solid var(--line,#232130);background:var(--card,#101018);color:var(--text,#F5F3EE);font-family:inherit;font-weight:500;font-size:.85rem;cursor:pointer;transition:.2s;}',
      '.sa-seg button.on{border-color:var(--accent,#E8452C);background:rgba(232,69,44,.16);}',
      '.sa-ring{width:128px;height:128px;border-radius:50%;border:7px solid #3fae6a;margin:6px auto 12px;display:flex;flex-direction:column;align-items:center;justify-content:center;}',
      '.sa-ring.mid{border-color:#e9a23b;}',
      '.sa-ring b{font-family:"Syne",sans-serif;font-size:2.6rem;line-height:1;}',
      '.sa-ring span{font-size:.78rem;color:var(--muted,#9A96A8);margin-top:4px;}',
      '.sa-title{text-align:center;font-family:"Syne",sans-serif;font-weight:700;font-size:.8rem;letter-spacing:1.5px;text-transform:uppercase;color:var(--muted,#9A96A8);}',
      '.sa-msg{background:rgba(255,255,255,.05);border-radius:10px;padding:12px 14px;font-size:.88rem;line-height:1.55;margin-bottom:12px;}',
      '.sa-rows{margin-bottom:12px;}',
      '.sa-row{display:flex;justify-content:space-between;align-items:center;padding:9px 4px;border-bottom:1px solid var(--line,#232130);font-size:.86rem;gap:10px;}',
      '.sa-row span:first-child{font-weight:600;}',
      '.sa-row span:last-child{display:flex;align-items:center;gap:8px;color:var(--muted,#9A96A8);text-align:right;}',
      '.sa-dot{width:8px;height:8px;border-radius:50%;background:#3fae6a;flex:0 0 auto;}',
      '.sa-dot.mid{background:#e9a23b;}',
      '.sa-you{text-align:center;font-size:.62rem;letter-spacing:1.6px;color:var(--accent2,#FF7A45);font-weight:700;margin-top:6px;}',
      '.sa-chips{display:flex;justify-content:center;gap:8px;flex-wrap:wrap;margin:4px 0 10px;}',
      '.sa-chip{min-width:46px;padding:9px 10px;text-align:center;border-radius:8px;border:1px solid var(--line,#232130);color:var(--muted,#9A96A8);font-weight:600;font-size:.85rem;}',
      '.sa-chip.on{background:var(--accent,#E8452C);border-color:var(--accent,#E8452C);color:#fff;}',
      '.sa-chip.off{opacity:.35;text-decoration:line-through;}',
      '.sa-note{font-size:.78rem;color:var(--muted,#9A96A8);line-height:1.55;margin-bottom:12px;}',
      '.sa-foot{margin-top:6px;}',
      '.sa-btn{width:100%;height:50px;border-radius:10px;border:none;background:var(--accent,#E8452C);color:#fff;font-family:"Syne",sans-serif;font-weight:700;font-size:.95rem;letter-spacing:.4px;cursor:pointer;transition:.2s;}',
      '.sa-btn:hover{background:var(--accent2,#FF7A45);}',
      '.sa-btn.ghost{background:transparent;border:1px solid var(--line,#232130);color:var(--text,#F5F3EE);margin-top:8px;height:44px;font-size:.85rem;}',
      '.sa-btn.ghost:hover{border-color:var(--accent,#E8452C);background:rgba(232,69,44,.1);}',
      '.sa-links{display:flex;justify-content:center;gap:18px;margin-top:10px;}',
      '.sa-links button{background:none;border:none;color:var(--muted,#9A96A8);font-size:.7rem;letter-spacing:1.4px;text-transform:uppercase;font-weight:600;cursor:pointer;text-decoration:underline;font-family:inherit;}',
      '.sa-privacy{text-align:center;color:var(--muted,#9A96A8);font-size:.72rem;margin-top:12px;}'
    ].join('\n');
    document.head.appendChild(css);

    /* ---------- Button next to "Size Chart" ---------- */
    var wrap = document.createElement('div');
    wrap.style.cssText = 'display:flex;align-items:center;gap:14px;';
    var openBtn = document.createElement('button');
    openBtn.type = 'button';
    openBtn.className = 'sa-link';
    openBtn.id = 'openSizeAdvisor';
    openBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 17 17 3l4 4L7 21H3v-4Z"/><path d="m13 7 2 2M10 10l2 2M7 13l2 2"/></svg>Find my size';
    sizeHead.insertBefore(wrap, openChart);
    wrap.appendChild(openBtn);
    wrap.appendChild(openChart);

    /* ---------- Modal ---------- */
    var ov = document.createElement('div');
    ov.className = 'sa-overlay';
    ov.id = 'saOverlay';
    ov.setAttribute('role', 'dialog');
    ov.setAttribute('aria-modal', 'true');
    ov.setAttribute('aria-label', 'AARAMBH size advisor');
    ov.innerHTML =
      '<div class="sa-sheet">' +
        '<div class="sa-top"><span class="sa-eyebrow">SIZE ADVISOR</span><button type="button" class="sa-x" id="saClose" aria-label="Close">&times;</button></div>' +
        '<div class="sa-prod"><div class="sa-pimg"><img id="saImg" alt="AARAMBH product"></div><div><div class="sa-pname" id="saName"></div><div class="sa-pprice" id="saPrice"></div></div></div>' +
        '<div class="sa-bars"><i id="saB1"></i><i id="saB2"></i><i id="saB3"></i></div>' +
        '<div class="sa-stepname" id="saStepName"></div>' +

        '<section id="saS1">' +
          '<h3 class="sa-h">LET\'S FIND YOUR FIT</h3><p class="sa-sub">Two measurements, about ten seconds.</p>' +
          '<div class="sa-tabs"><button type="button" data-g="women">Womenswear</button><button type="button" data-g="men">Menswear</button></div>' +
          '<div class="sa-field"><div class="sa-fhead"><span class="sa-flabel">Height</span><div class="sa-units" id="saHU"><button type="button" data-u="cm">CM</button><button type="button" data-u="ft">FT/IN</button></div></div>' +
            '<div class="sa-big" id="saHVal"></div>' +
            '<div class="sa-slide"><button type="button" class="sa-step" id="saHm" aria-label="Decrease height">&minus;</button><input type="range" id="saH" min="140" max="210" step="1" aria-label="Height"><button type="button" class="sa-step" id="saHp" aria-label="Increase height">+</button></div></div>' +
          '<div class="sa-field"><div class="sa-fhead"><span class="sa-flabel">Weight</span><div class="sa-units" id="saWU"><button type="button" data-u="kg">KG</button><button type="button" data-u="lb">LB</button></div></div>' +
            '<div class="sa-big" id="saWVal"></div>' +
            '<div class="sa-slide"><button type="button" class="sa-step" id="saWm" aria-label="Decrease weight">&minus;</button><input type="range" id="saW" min="35" max="130" step="1" aria-label="Weight"><button type="button" class="sa-step" id="saWp" aria-label="Increase weight">+</button></div></div>' +
          '<div class="sa-live"><div><small>LIVE ESTIMATE</small><em>Refines in the next steps</em></div><b id="saLive">M</b></div>' +
        '</section>' +

        '<section id="saS2" hidden>' +
          '<h3 class="sa-h">YOUR SHAPE</h3><p class="sa-sub">Compared with most people your height and weight.</p>' +
          '<div class="sa-group"><div class="sa-flabel">Chest</div><div class="sa-seg" data-k="chest"><button type="button" data-v="0">Narrower</button><button type="button" data-v="1">Average</button><button type="button" data-v="2">Fuller</button></div></div>' +
          '<div class="sa-group"><div class="sa-flabel">Stomach</div><div class="sa-seg" data-k="stomach"><button type="button" data-v="0">Narrower</button><button type="button" data-v="1">Average</button><button type="button" data-v="2">Fuller</button></div></div>' +
          '<div class="sa-group"><div class="sa-flabel">Hips</div><div class="sa-seg" data-k="hips"><button type="button" data-v="0">Narrower</button><button type="button" data-v="1">Average</button><button type="button" data-v="2">Fuller</button></div></div>' +
          '<div class="sa-group"><div class="sa-flabel">How do you like it to fit?</div><div class="sa-seg" data-k="fit"><button type="button" data-v="snug">Snug</button><button type="button" data-v="true">True to size</button><button type="button" data-v="loose">Loose</button></div></div>' +
        '</section>' +

        '<section id="saS3" hidden></section>' +

        '<div class="sa-foot" id="saFoot"></div>' +
        '<div class="sa-privacy">Your answers stay on this device. Nothing is sent anywhere.</div>' +
      '</div>';
    document.body.appendChild(ov);

    function $(id){ return document.getElementById(id); }
    var sheet = ov.querySelector('.sa-sheet');

    /* ---------- Helpers ---------- */
    function ftin(cm){ var t = Math.round(cm / 2.54), f = Math.floor(t / 12), i = t % 12; return f + "'" + i + '"'; }
    function lb(kg){ return Math.round(kg * 2.2046); }
    function availableSizes(){
      var out = [];
      document.querySelectorAll('.size-btn').forEach(function(b){
        if(b.style.display !== 'none' && ALL.indexOf(b.dataset.size) > -1) out.push(b.dataset.size);
      });
      return out.length ? out : ['S','M','L','XL','2XL'];
    }
    function baseIdx(){
      var lim = st.g === 'women' ? CONFIG.women : CONFIG.men, n = lim.length, i = 0;
      while(i < n - 1 && st.kg >= lim[i]) i++;
      var upper = lim[i], lower = i === 0 ? lim[0] - 10 : lim[i - 1];
      if(i === n - 1) upper = lower + 12;
      var frac = Math.max(0, Math.min(1, (st.kg - lower) / (upper - lower)));
      return i - 0.5 + frac;
    }
    function nearest(idx, avail){
      var best = avail[0], bd = 99;
      avail.forEach(function(s){ var d = Math.abs(idx - ALL.indexOf(s)); if(d < bd){ bd = d; best = s; } });
      return best;
    }
    function fitKind(){
      var f = (typeof selectedFit !== 'undefined') ? String(selectedFit) : 'Regular';
      return f;
    }

    /* ---------- Step 1 ---------- */
    function paintStep1(){
      ov.querySelectorAll('.sa-tabs button').forEach(function(b){ b.classList.toggle('on', b.dataset.g === st.g); });
      $('saHU').querySelectorAll('button').forEach(function(b){ b.classList.toggle('on', b.dataset.u === st.hu); });
      $('saWU').querySelectorAll('button').forEach(function(b){ b.classList.toggle('on', b.dataset.u === st.wu); });
      $('saH').value = st.cm; $('saW').value = st.kg;
      $('saHVal').textContent = st.hu === 'cm' ? st.cm + ' cm' : ftin(st.cm);
      $('saWVal').textContent = st.wu === 'kg' ? st.kg + ' kg' : lb(st.kg) + ' lb';
      $('saLive').textContent = nearest(baseIdx(), availableSizes());
    }
    ov.querySelectorAll('.sa-tabs button').forEach(function(b){ b.addEventListener('click', function(){ st.g = b.dataset.g; paintStep1(); }); });
    $('saHU').addEventListener('click', function(e){ var b = e.target.closest('button'); if(b){ st.hu = b.dataset.u; paintStep1(); } });
    $('saWU').addEventListener('click', function(e){ var b = e.target.closest('button'); if(b){ st.wu = b.dataset.u; paintStep1(); } });
    $('saH').addEventListener('input', function(){ st.cm = Number(this.value); paintStep1(); });
    $('saW').addEventListener('input', function(){ st.kg = Number(this.value); paintStep1(); });
    $('saHm').onclick = function(){ st.cm = Math.max(140, st.cm - 1); paintStep1(); };
    $('saHp').onclick = function(){ st.cm = Math.min(210, st.cm + 1); paintStep1(); };
    $('saWm').onclick = function(){ st.kg = Math.max(35, st.kg - 1); paintStep1(); };
    $('saWp').onclick = function(){ st.kg = Math.min(130, st.kg + 1); paintStep1(); };

    /* ---------- Step 2 ---------- */
    function paintStep2(){
      ov.querySelectorAll('#saS2 .sa-seg').forEach(function(seg){
        var k = seg.dataset.k;
        seg.querySelectorAll('button').forEach(function(b){ b.classList.toggle('on', String(st[k]) === b.dataset.v); });
      });
    }
    ov.querySelectorAll('#saS2 .sa-seg').forEach(function(seg){
      seg.addEventListener('click', function(e){
        var b = e.target.closest('button'); if(!b) return;
        var k = seg.dataset.k; st[k] = k === 'fit' ? b.dataset.v : Number(b.dataset.v); paintStep2();
      });
    });

    /* ---------- Recommendation ---------- */
    function compute(){
      var avail = availableSizes();
      var oc = st.chest - 1, os = st.stomach - 1, oh = st.hips - 1;
      var base = baseIdx();
      var hn = st.cm >= CONFIG.tallCm ? 0.4 : (st.cm <= CONFIG.shortCm ? -0.4 : 0);
      var fn = st.fit === 'loose' ? 0.5 : (st.fit === 'snug' ? -0.5 : 0);
      var idx = base + 0.5 * oc + 0.35 * os + 0.25 * oh + hn + fn;
      var size = nearest(idx, avail), si = ALL.indexOf(size);
      var dist = Math.abs(idx - si);
      var altIdx = si + (idx > si ? 1 : -1);
      var alt = (dist > 0.3 && altIdx >= 0 && altIdx < ALL.length && avail.indexOf(ALL[altIdx]) > -1) ? ALL[altIdx] : null;
      function status(dimIdx, word){
        var d = si - dimIdx;
        if(d >= 0.6) return {ok:false, t: word === 'length' ? 'Will sit longer on you' : 'A bit roomy'};
        if(d <= -0.6) return {ok:false, t: word === 'length' ? 'Will sit shorter on you' : 'A bit snug'};
        return {ok:true, t:'Right for the fit it was cut for'};
      }
      var fitText = st.fit === 'loose' ? 'You like it loose, so we sized up' : (st.fit === 'snug' ? 'You like it snug, so we sized down' : 'True to size');
      return {
        size:size, alt:alt, avail:avail, close: dist <= 0.3,
        rows:[
          ['Chest', status(base + 0.8 * oc, 'chest')],
          ['Waist', status(base + 0.8 * os, 'waist')],
          ['Hips',  status(base + 0.8 * oh, 'hips')],
          ['Length', status(base + (st.cm >= CONFIG.tallCm ? 0.8 : (st.cm <= CONFIG.shortCm ? -0.8 : 0)), 'length')],
          ['Fit', {ok:true, t:fitText}]
        ]
      };
    }
    function fitNote(){
      var f = fitKind();
      if(f === 'Oversized') return 'Cut oversized with a drop shoulder, so this size gives the relaxed look. Go one size down for a closer fit.';
      if(f === 'Relaxed') return 'Relaxed fit made for layering. Go one size down if you want it closer to the body.';
      if(f === 'Boxy') return 'Boxy cut with a structured drape. This size keeps the boxy shape.';
      if(f === 'Cropped') return 'Cropped stretch fit. If you are between sizes, go one up for a looser, longer feel.';
      return 'Regular cut. If you like it roomier, go one size up.';
    }
    function paintStep3(){
      result = compute();
      var r = result;
      var msg = r.close
        ? r.size + ' lines up best for the fit it was cut for through the body.'
        : 'You are between ' + (r.alt && ALL.indexOf(r.alt) < ALL.indexOf(r.size) ? r.alt + ' and ' + r.size : r.size + ' and ' + (r.alt || r.size)) + '. ' + r.size + ' is the closest match' + (r.alt ? '; ' + r.alt + ' will feel ' + (ALL.indexOf(r.alt) > ALL.indexOf(r.size) ? 'roomier.' : 'closer.') : '.');
      var rows = r.rows.map(function(x){
        return '<div class="sa-row"><span>' + x[0] + '</span><span><i class="sa-dot' + (x[1].ok ? '' : ' mid') + '"></i>' + x[1].t + '</span></div>';
      }).join('');
      var chips = ALL.map(function(s){
        var cls = s === r.size ? 'on' : (r.avail.indexOf(s) < 0 ? 'off' : '');
        return '<div class="sa-chip ' + cls + '">' + s + '</div>';
      }).join('');
      $('saS3').innerHTML =
        '<div class="sa-title">Your size</div>' +
        '<div class="sa-ring' + (r.close ? '' : ' mid') + '"><b>' + r.size + '</b><span>' + (r.close ? 'Best fit' : 'Closest fit') + '</span></div>' +
        '<div class="sa-msg">' + msg + '</div>' +
        '<div class="sa-rows">' + rows + '</div>' +
        '<div class="sa-chips">' + chips + '</div>' +
        '<div class="sa-you">YOU: ' + r.size + '</div>' +
        '<p class="sa-note">' + fitNote() + ' Based on your height, weight and shape. It is a guide, so check the size chart too.</p>';
    }

    /* ---------- Navigation ---------- */
    function product(){
      var n = document.getElementById('productName'), p = document.getElementById('productPrice'), im = document.getElementById('imgFront');
      $('saName').textContent = n ? n.textContent : 'AARAMBH';
      $('saPrice').textContent = p ? p.textContent : '';
      var img = $('saImg');
      if(im && im.getAttribute('src')){ img.src = im.getAttribute('src'); img.alt = 'AARAMBH ' + (n ? n.textContent : 'product'); }
    }
    function go(n){
      step = n;
      $('saS1').hidden = n !== 1; $('saS2').hidden = n !== 2; $('saS3').hidden = n !== 3;
      $('saB1').className = 'on'; $('saB2').className = n >= 2 ? 'on' : ''; $('saB3').className = n >= 3 ? 'on' : '';
      $('saStepName').textContent = n === 1 ? 'Step 1 of 3 · Measurements' : n === 2 ? 'Step 2 of 3 · Body shape' : 'Your recommendation';
      var foot = $('saFoot');
      if(n === 1){
        paintStep1();
        foot.innerHTML = '<button type="button" class="sa-btn" id="saNext">Continue &rarr;</button>';
        $('saNext').onclick = function(){ go(2); };
      } else if(n === 2){
        paintStep2();
        foot.innerHTML = '<button type="button" class="sa-btn" id="saNext">Continue &rarr;</button><button type="button" class="sa-btn ghost" id="saBack">Back</button>';
        $('saNext').onclick = function(){ save(); go(3); };
        $('saBack').onclick = function(){ go(1); };
      } else {
        paintStep3();
        foot.innerHTML =
          '<button type="button" class="sa-btn" id="saAdd">Add size ' + result.size + ' to bag</button>' +
          '<div class="sa-links"><button type="button" id="saSel">Select ' + result.size + ' on the page</button><button type="button" id="saEdit">Edit details</button><button type="button" id="saChart">Size chart</button></div>';
        $('saAdd').onclick = function(){ pick(result.size); close(); if(typeof addToCart === 'function') addToCart(); };
        $('saSel').onclick = function(){ pick(result.size); close(); };
        $('saEdit').onclick = function(){ go(1); };
        $('saChart').onclick = function(){ close(); openChart.click(); };
      }
      sheet.scrollTop = 0;
    }
    function pick(sz){
      document.querySelectorAll('.size-btn').forEach(function(b){ b.classList.toggle('active', b.dataset.size === sz); });
    }
    function save(){ try { localStorage.setItem(KEY, JSON.stringify(st)); } catch(_){} }
    function open(){
      lastFocus = document.activeElement;
      product();
      go(1);
      ov.classList.add('open');
      document.body.style.overflow = 'hidden';
      $('saClose').focus();
    }
    function close(){
      ov.classList.remove('open');
      document.body.style.overflow = '';
      save();
      if(lastFocus && lastFocus.focus){ try { lastFocus.focus(); } catch(_){} }
    }
    openBtn.addEventListener('click', open);
    $('saClose').addEventListener('click', close);
    ov.addEventListener('click', function(e){ if(e.target === ov) close(); });
    document.addEventListener('keydown', function(e){ if(e.key === 'Escape' && ov.classList.contains('open')) close(); });
  }

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
