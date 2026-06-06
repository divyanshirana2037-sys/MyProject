/* =========================================
   VendorBridge ERP — app.js
   ========================================= */

// ── Navigation helpers ──────────────────────
function goTo(path) {
  window.location.href = path;
}

// ── Password visibility toggle ──────────────
function initPasswordToggle() {
  document.querySelectorAll('.toggle-pass').forEach(btn => {
    btn.addEventListener('click', () => {
      const input = btn.closest('.input-icon-wrap').querySelector('input');
      const isPass = input.type === 'password';
      input.type = isPass ? 'text' : 'password';
      btn.innerHTML = isPass
        ? `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
             stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
             <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
             <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
             <line x1="1" y1="1" x2="23" y2="23"/>
           </svg>`
        : `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
             stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
             <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
             <circle cx="12" cy="12" r="3"/>
           </svg>`;
    });
  });
}

// ── Login form submit ───────────────────────
function initLogin() {
  const form = document.getElementById('loginForm');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const btn = form.querySelector('.btn-primary');
    btn.innerHTML = `<svg class="spin" xmlns="http://www.w3.org/2000/svg" width="20" height="20"
      viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
    </svg> Signing in…`;
    btn.disabled = true;

    setTimeout(() => {
      goTo('register.html');
    }, 900);
  });
}

// ── Register form submit ─────────────────────
function initRegister() {
  const form = document.getElementById('registerForm');
  if (!form) return;

  // Avatar preview
  const avatarInput = document.getElementById('avatarInput');
  const avatarPreview = document.getElementById('avatarPreview');
  if (avatarInput && avatarPreview) {
    avatarInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        avatarPreview.innerHTML = `<img src="${ev.target.result}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">`;
      };
      reader.readAsDataURL(file);
    });
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    // collect & store basic data
    const data = {
      firstName:   form.querySelector('#firstName')?.value  || '',
      lastName:    form.querySelector('#lastName')?.value   || '',
      email:       form.querySelector('#email')?.value      || '',
      phone:       form.querySelector('#phone')?.value      || '',
      role:        form.querySelector('#role')?.value       || '',
      country:     form.querySelector('#country')?.value    || '',
      info:        form.querySelector('#addInfo')?.value    || '',
    };
    sessionStorage.setItem('vb_user', JSON.stringify(data));

    const btn = form.querySelector('.btn-primary');
    btn.innerHTML = `<svg class="spin" xmlns="http://www.w3.org/2000/svg" width="20" height="20"
      viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
    </svg> Setting up your workspace…`;
    btn.disabled = true;

    setTimeout(() => {
      goTo('dashboard.html');
    }, 1100);
  });
}

// ── Dashboard ───────────────────────────────
function initDashboard() {
  if (!document.querySelector('.dashboard-layout')) return;

  // Restore user info
  const raw = sessionStorage.getItem('vb_user');
  if (raw) {
    try {
      const u = JSON.parse(raw);
      const fullName = [u.firstName, u.lastName].filter(Boolean).join(' ') || 'Alex Morgan';
      const initials = ((u.firstName?.[0] || 'A') + (u.lastName?.[0] || 'M')).toUpperCase();
      const role = u.role || 'Procurement Manager';

      document.querySelectorAll('.user-display-name').forEach(el => el.textContent = fullName);
      document.querySelectorAll('.user-display-role').forEach(el => el.textContent = role);
      document.querySelectorAll('.user-initials').forEach(el => el.textContent = initials);
    } catch(_) {}
  }

  // Live date/time
  function updateDateTime() {
    const now = new Date();
    const dayEl  = document.getElementById('dateDay');
    const metaEl = document.getElementById('dateMeta');
    if (dayEl) dayEl.textContent = now.getDate();
    if (metaEl) metaEl.textContent = now.toLocaleDateString('en-US', {
      weekday: 'short', month: 'short', year: 'numeric'
    });
  }
  updateDateTime();
  setInterval(updateDateTime, 60000);

  // Animate KPI bars
  setTimeout(() => {
    document.querySelectorAll('.kpi-bar-fill').forEach(el => {
      const target = el.dataset.width || '60';
      el.style.width = target + '%';
    });
  }, 400);

  // Sidebar active nav
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', () => {
      document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
      item.classList.add('active');
    });
  });

  // Notification bell
  const bell = document.getElementById('notifBtn');
  if (bell) {
    bell.addEventListener('click', () => {
      const dot = bell.querySelector('.notif-dot');
      if (dot) dot.style.display = 'none';
      showToast('All notifications marked as read');
    });
  }

  // Quick action buttons
  document.querySelectorAll('.qa-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      showToast(btn.dataset.msg || 'Feature coming soon');
    });
  });
}

// ── Toast notification ───────────────────────
function showToast(msg) {
  const existing = document.getElementById('vb-toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.id = 'vb-toast';
  toast.style.cssText = `
    position:fixed; bottom:28px; right:28px; z-index:9999;
    background: #0f2044; color:#fff;
    padding: 13px 22px; border-radius: 12px;
    font-family: 'Plus Jakarta Sans', sans-serif; font-size: .88rem; font-weight:500;
    box-shadow: 0 8px 32px rgba(10,22,40,.28);
    border: 1px solid rgba(255,255,255,.1);
    transform: translateY(16px); opacity:0;
    transition: all .28s cubic-bezier(.4,0,.2,1);
    display:flex; align-items:center; gap:10px;
  `;
  toast.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
      fill="none" stroke="#10b981" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>${msg}`;
  document.body.appendChild(toast);
  requestAnimationFrame(() => {
    toast.style.transform = 'translateY(0)';
    toast.style.opacity = '1';
  });
  setTimeout(() => {
    toast.style.transform = 'translateY(16px)';
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// ── CSS spinner keyframes injected ──────────
(function injectSpinStyle() {
  const s = document.createElement('style');
  s.textContent = `
    @keyframes spin { to { transform:rotate(360deg); } }
    .spin { animation: spin .7s linear infinite; }
  `;
  document.head.appendChild(s);
})();

// ── Init on DOM ready ────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initPasswordToggle();
  initLogin();
  initRegister();
  initDashboard();
});