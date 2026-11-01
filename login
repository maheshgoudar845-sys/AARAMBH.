<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Log In | AARAMBH</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap" rel="stylesheet">
  <script src="api.js"></script>

  <style>
    :root {
      --bg: #080810;
      --surface: #0f0f1a;
      --surface2: #15151f;
      --accent: #A90E02;
      --accent2: #FFFACD;
      --text: #f0f0f0;
      --muted: #888;
      --border: rgba(255,255,255,0.08);
      --error: #ff6b6b;
    }
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'DM Sans', sans-serif;
      background: var(--bg); color: var(--text);
      min-height: 100vh;
      display: flex; flex-direction: column;
    }
    nav {
      display: flex; align-items: center; justify-content: space-between;
      padding: 16px 40px;
      background: rgba(8,8,16,0.92);
      border-bottom: 1px solid var(--border);
    }
    .nav-logo img { height: 42px; }
    .nav-back {
      font-family: 'Syne', sans-serif; font-size: 12px; font-weight: 700;
      letter-spacing: 1.5px; text-transform: uppercase;
      color: var(--muted); text-decoration: none;
    }
    .nav-back:hover { color: var(--accent2); }

    .wrap { flex: 1; display: flex; align-items: center; justify-content: center; padding: 40px 20px; }
    .card {
      position: relative; overflow: hidden;
      width: 100%; max-width: 420px;
      background: linear-gradient(160deg, var(--surface), var(--surface2));
      border: 1px solid var(--border); border-radius: 22px;
      padding: 34px 30px;
    }
    .card::before {
      content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px;
      background: linear-gradient(90deg, var(--accent), var(--accent2), var(--accent));
      background-size: 200% 100%; animation: shine 3.5s linear infinite;
    }
    @keyframes shine { 0% { background-position: 0% 0; } 100% { background-position: 200% 0; } }

    h1 {
      font-family: 'Bebas Neue', sans-serif; font-size: 42px; letter-spacing: 1px;
      line-height: 1; margin-bottom: 6px;
    }
    .sub { color: var(--muted); font-size: 13.5px; margin-bottom: 24px; line-height: 1.6; }

    .tabs {
      display: grid; grid-template-columns: 1fr 1fr; gap: 6px;
      background: rgba(255,255,255,0.03); border: 1px solid var(--border);
      border-radius: 100px; padding: 4px; margin-bottom: 24px;
    }
    .tab {
      background: none; border: none; color: var(--muted); cursor: pointer;
      font-family: 'Syne', sans-serif; font-size: 11.5px; font-weight: 800;
      letter-spacing: 1.5px; text-transform: uppercase;
      padding: 11px; border-radius: 100px; transition: background .25s, color .25s;
    }
    .tab.active { background: var(--accent); color: #fff; }

    .form-group { margin-bottom: 16px; }
    .form-group label {
      display: block; font-family: 'Syne', sans-serif; font-size: 11px; font-weight: 700;
      letter-spacing: 1.5px; text-transform: uppercase; color: var(--muted); margin-bottom: 8px;
    }
    input {
      width: 100%;
      background: rgba(255,255,255,0.03); border: 1px solid var(--border);
      border-radius: 12px; padding: 13px 15px;
      color: var(--text); font-family: 'DM Sans', sans-serif; font-size: 14px;
      transition: border-color .25s, box-shadow .25s;
    }
    input:focus {
      outline: none; border-color: rgba(169,14,2,0.5);
      box-shadow: 0 0 0 3px rgba(169,14,2,0.12);
    }
    .hidden { display: none; }

    .msg { font-size: 13px; margin-bottom: 14px; min-height: 18px; line-height: 1.5; }
    .msg.error { color: var(--error); }
    .msg.ok { color: #9be6b4; }

    .submit-btn {
      width: 100%; padding: 15px 20px;
      background: var(--accent); color: #fff; border: none;
      font-family: 'Syne', sans-serif; font-size: 13px; font-weight: 800;
      letter-spacing: 2px; text-transform: uppercase;
      border-radius: 100px; cursor: pointer;
      box-shadow: 0 10px 30px rgba(169,14,2,0.3);
      transition: background .3s, transform .2s;
    }
    .submit-btn:hover { background: #8a0b02; transform: translateY(-2px); }
    .submit-btn:disabled { opacity: .6; cursor: not-allowed; transform: none; }

    .hint { color: var(--muted); font-size: 12px; margin-top: 14px; text-align: center; line-height: 1.6; }
    .hint a { color: var(--accent2); text-decoration: none; }

    footer { text-align: center; padding: 24px 20px; border-top: 1px solid var(--border); }
    footer p { color: var(--muted); font-size: 12.5px; }
    footer a { color: var(--accent2); text-decoration: none; }
  </style>
</head>
<body>

  <nav>
    <a href="index.html" class="nav-logo"><img src="logo.webp" alt="AARAMBH"></a>
    <a href="index.html" class="nav-back">← Back to Shop</a>
  </nav>

  <div class="wrap">
    <div class="card">
      <h1 id="title">Log In</h1>
      <p class="sub" id="subtitle">Log in to pay online and track your orders.</p>

      <div class="tabs">
        <button type="button" class="tab active" id="tabLogin">Log In</button>
        <button type="button" class="tab" id="tabSignup">Sign Up</button>
      </div>

      <form id="authForm" novalidate>
        <div class="form-group hidden" id="nameGroup">
          <label for="name">Full Name</label>
          <input type="text" id="name" maxlength="80" placeholder="Your full name" autocomplete="name">
        </div>

        <div class="form-group hidden" id="phoneGroup">
          <label for="phone">Phone Number</label>
          <input type="tel" id="phone" maxlength="10" placeholder="9876543210" inputmode="numeric" autocomplete="tel">
        </div>

        <div class="form-group">
          <label for="email">Email</label>
          <input type="email" id="email" maxlength="120" placeholder="you@example.com" autocomplete="email" required>
        </div>

        <div class="form-group">
          <label for="password">Password</label>
          <input type="password" id="password" maxlength="100" placeholder="At least 8 characters" autocomplete="current-password" required>
        </div>

        <div class="msg" id="msg" role="alert"></div>

        <button type="submit" class="submit-btn" id="submitBtn">Log In</button>
      </form>

      <p class="hint" id="hint">New to AARAMBH? <a href="#" id="switchHint">Create an account</a></p>
    </div>
  </div>

  <footer>
    <p>© 2025 AARAMBH — <a href="mailto:arambhofficial2025@gmail.com">arambhofficial2025@gmail.com</a> — <a href="tel:9405074832">9405074832</a></p>
  </footer>

  <script>
    const params = new URLSearchParams(location.search);
    // Only allow redirects to pages on this site (prevents open redirects)
    function safeNext() {
      const next = params.get('next') || 'index.html';
      if (/^(https?:|\/\/|javascript:)/i.test(next)) return 'index.html';
      return next;
    }

    const tabLogin = document.getElementById('tabLogin');
    const tabSignup = document.getElementById('tabSignup');
    const nameGroup = document.getElementById('nameGroup');
    const phoneGroup = document.getElementById('phoneGroup');
    const title = document.getElementById('title');
    const subtitle = document.getElementById('subtitle');
    const submitBtn = document.getElementById('submitBtn');
    const passwordInput = document.getElementById('password');
    const hint = document.getElementById('hint');
    const msg = document.getElementById('msg');
    let mode = 'login';

    function setMode(newMode) {
      mode = newMode;
      const signup = mode === 'signup';
      tabLogin.classList.toggle('active', !signup);
      tabSignup.classList.toggle('active', signup);
      nameGroup.classList.toggle('hidden', !signup);
      phoneGroup.classList.toggle('hidden', !signup);
      title.textContent = signup ? 'Sign Up' : 'Log In';
      subtitle.textContent = signup
        ? 'Create an account to pay online and track your orders.'
        : 'Log in to pay online and track your orders.';
      submitBtn.textContent = signup ? 'Create Account' : 'Log In';
      passwordInput.autocomplete = signup ? 'new-password' : 'current-password';
      passwordInput.placeholder = signup ? 'At least 8 characters' : 'Your password';
      hint.innerHTML = signup
        ? 'Already have an account? <a href="#" id="switchHint">Log in</a>'
        : 'New to AARAMBH? <a href="#" id="switchHint">Create an account</a>';
      bindSwitch();
      msg.textContent = '';
      msg.className = 'msg';
    }

    function bindSwitch() {
      document.getElementById('switchHint').addEventListener('click', (e) => {
        e.preventDefault();
        setMode(mode === 'login' ? 'signup' : 'login');
      });
    }

    tabLogin.addEventListener('click', () => setMode('login'));
    tabSignup.addEventListener('click', () => setMode('signup'));
    bindSwitch();

    function showMsg(text, type) {
      msg.textContent = text;
      msg.className = 'msg ' + (type || '');
    }

    document.getElementById('authForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('email').value.trim();
      const password = passwordInput.value;

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return showMsg('Please enter a valid email address.', 'error');
      }
      if (!password) {
        return showMsg('Please enter your password.', 'error');
      }

      submitBtn.disabled = true;
      const originalText = submitBtn.textContent;
      submitBtn.textContent = 'Please wait...';
      showMsg('', '');

      try {
        if (mode === 'signup') {
          const name = document.getElementById('name').value.trim();
          const phone = document.getElementById('phone').value.trim();
          if (name.length < 2) throw new Error('Please enter your full name.');
          if (!/^[6-9]\d{9}$/.test(phone)) throw new Error('Please enter a valid 10-digit phone number.');
          if (password.length < 8) throw new Error('Password must be at least 8 characters.');
          await AarambhAPI.register(name, email, phone, password);
          showMsg('Account created. Taking you back...', 'ok');
        } else {
          await AarambhAPI.login(email, password);
          showMsg('Logged in. Taking you back...', 'ok');
        }
        setTimeout(() => { location.href = safeNext(); }, 700);
      } catch (err) {
        showMsg(err.message || 'Something went wrong. Please try again.', 'error');
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
      }
    });

    // If already logged in, skip this page
    if (AarambhAPI.isLoggedIn()) {
      location.href = safeNext();
    }
  </script>
</body>
</html>
