/* AARAMBH: navbar login state.
   When a customer is logged in, "Log In" becomes "My Account" and a "Log Out" link is added.
   Works on any page that has the standard AARAMBH navbar (.nav-links and #mobileMenu). */
(function () {
  var token = null;
  try { token = localStorage.getItem('arambhToken'); } catch (e) {}
  if (!token) return;

  function logout(e) {
    e.preventDefault();
    try {
      localStorage.removeItem('arambhToken');
      localStorage.removeItem('arambhUser');
    } catch (err) {}
    location.replace('index.html');
  }

  // 1) Log In -> My Account (desktop nav and mobile menu)
  document.querySelectorAll('.nav-links a[href="login.html"], #mobileMenu a[href="login.html"]').forEach(function (a) {
    a.textContent = 'My Account';
    a.setAttribute('href', 'account.html');
  });

  // 2) Add Log Out to the desktop nav
  var list = document.querySelector('.nav-links');
  if (list) {
    var li = document.createElement('li');
    var a1 = document.createElement('a');
    a1.href = '#';
    a1.textContent = 'Log Out';
    a1.addEventListener('click', logout);
    li.appendChild(a1);
    list.appendChild(li);
  }

  // 3) Add Log Out to the mobile menu
  var menu = document.getElementById('mobileMenu');
  if (menu) {
    var a2 = document.createElement('a');
    a2.href = '#';
    a2.textContent = 'Log Out';
    a2.addEventListener('click', logout);
    menu.appendChild(a2);
  }
})();
