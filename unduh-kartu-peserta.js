/* ══════════════════════════════════════════════════
   UNDUH KARTU PESERTA – SMAN 68 Jakarta
   Firebase Firestore + PDF + QR + Session
   v2.0 – With photo upload, stamp image, home button
══════════════════════════════════════════════════ */

// ── Firebase Config ──────────────────────────────
const firebaseConfig = {
  apiKey: "AIzaSyDAcKcg3alPOTH3FFGelYmsW7jcMMe2PLI",
  authDomain: "upnvjdatsystem.firebaseapp.com",
  projectId: "upnvjdatsystem",
  storageBucket: "upnvjdatsystem.firebasestorage.app",
  messagingSenderId: "57095309946",
  appId: "1:57095309946:web:b0e9f3f86380d549ffc9c3"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// ── State ────────────────────────────────────────
let currentPeserta  = null;
let jadwalData      = null;
let fotoBase64      = null;   // foto yang baru dipilih tapi belum disimpan
let fotoTersimpan   = null;   // foto yang sudah tersimpan di Firestore
let stampBase64     = null;   // stempel sekolah (dari file yang diupload)

/* ══════════════════════════════════════════════════════
   JADWAL MASA UNDUH KARTU — ATUR DI SINI
   Format: 'YYYY-MM-DDTHH:MM:SS' (waktu lokal server/Jakarta)

   Skenario yang didukung:
   1. downloadOpen = null, downloadClose = null  → tidak ada banner
   2. downloadOpen = null, downloadClose = tgl   → langsung buka, hitung mundur penutupan
   3. downloadOpen = tgl,  downloadClose = null  → hitung mundur pembukaan, setelah buka tidak ada batas
   4. downloadOpen = tgl,  downloadClose = tgl   → hitung mundur pembukaan, lalu hitung mundur penutupan
══════════════════════════════════════════════════════ */
const JADWAL_UNDUH = {
  downloadOpen:  null,                   // contoh: '2025-07-15T08:00:00'
  downloadClose: '2026-06-08T15:00:00',  // contoh: '2025-08-01T23:59:59'
};
/* ─────────────────────────────────────────────────── */

// ── State countdown ───────────────────────────────
let _cdInterval = null;

/* ══════════════════════════════════════════════════════
   MASA UNDUH — ENGINE (GATE FULLSCREEN)
══════════════════════════════════════════════════════ */

/** Hitung status masa unduh berdasarkan waktu sekarang */
function getMasaUnduhStatus() {
  const now   = new Date();
  const open  = JADWAL_UNDUH.downloadOpen  ? new Date(JADWAL_UNDUH.downloadOpen)  : null;
  const close = JADWAL_UNDUH.downloadClose ? new Date(JADWAL_UNDUH.downloadClose) : null;

  if (!open && !close)          return { mode: 'open' };
  if (close && now >= close)    return { mode: 'closed' };
  if (open  && now <  open)     return { mode: 'opening', target: open };
  if (close && now <  close)    return { mode: 'open' };
  return { mode: 'open' };
}

const LOGO_URL = 'https://upload.wikimedia.org/wikipedia/id/1/19/Logo_SMAN_68_Jakarta.png';

function _schoolHeader() {
  return `
    <div class="gate-school-header">
      <img src="${LOGO_URL}" alt="Logo SMAN 68" />
      <div class="gate-school-text">
        <h1>SMAN 68 Jakarta</h1>
        <p>Sistem Penerimaan Murid Mutasi</p>
      </div>
    </div>
    <div class="gate-divider"></div>`;
}

function _cdHTML(target) {
  const diff = Math.max(0, target - new Date());
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000)   / 1000);
  const pad = n => String(n).padStart(2, '0');
  return `
    <div class="cd-unit"><span class="cd-num" id="cdH">${pad(h)}</span><span class="cd-label">JAM</span></div>
    <span class="cd-sep">:</span>
    <div class="cd-unit"><span class="cd-num" id="cdM">${pad(m)}</span><span class="cd-label">MENIT</span></div>
    <span class="cd-sep">:</span>
    <div class="cd-unit"><span class="cd-num" id="cdS">${pad(s)}</span><span class="cd-label">DETIK</span></div>`;
}

function _tickCD(target) {
  const diff = Math.max(0, target - new Date());
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000)   / 1000);
  const pad = n => String(n).padStart(2, '0');
  const q = id => document.getElementById(id);
  if (q('cdH')) q('cdH').textContent = pad(h);
  if (q('cdM')) q('cdM').textContent = pad(m);
  if (q('cdS')) q('cdS').textContent = pad(s);
}

/** Render konten di dalam gate-card sesuai mode */
function _gateCardHTML(status) {
  if (status.mode === 'closed') {
    return `
      <div class="gate-card">
        ${_schoolHeader()}
        <div class="gate-icon-wrap closed-icon"><i class="fa-solid fa-lock"></i></div>
        <h2 class="gate-title closed">Masa Unduh Kartu Calon Siswa Mutasi Telah Ditutup</h2>
        <p class="gate-subtitle">Terima kasih telah mendaftar. Hubungi operator sekolah untuk informasi lebih lanjut.</p>
        <div class="gate-footer"><i class="fa-solid fa-shield-check"></i> Portal Resmi – SMAN 68 Jakarta</div>
      </div>`;
  }

  if (status.mode === 'opening') {
    return `
      <div class="gate-card">
        ${_schoolHeader()}
        <div class="gate-icon-wrap opening-icon"><i class="fa-solid fa-clock-rotate-left"></i></div>
        <h2 class="gate-title">Masa Unduh Kartu Peserta</h2>
        <p class="gate-subtitle">Silakan menunggu. Unduh kartu peserta akan segera dibuka.</p>
        <p class="gate-countdown-label">Masa Unduh Dibuka Dalam</p>
        <div class="countdown-units">${_cdHTML(status.target)}</div>
        <div class="gate-footer"><i class="fa-solid fa-shield-check"></i> Portal Resmi – SMAN 68 Jakarta</div>
      </div>`;
  }

  return ''; // mode 'open' → tidak perlu gate
}

/**
 * Buat HTML bar countdown untuk banner atas (login & dashboard).
 * Hanya muncul saat mode 'open' DAN ada jadwal downloadClose.
 */
function _bannerBarHTML(target) {
  return `
    <div class="banner-countdown-bar">
      <div class="bcb-label">
        <i class="fa-solid fa-hourglass-half"></i>
        <span>Masa Unduh Kartu Ditutup Dalam</span>
      </div>
      <div class="countdown-units">
        ${_cdHTML(target)}
      </div>
    </div>`;
}

/**
 * Init gate masa unduh + banner countdown atas.
 *
 * mode closed / opening → gate fullscreen, form login hidden, banner hidden
 * mode open + ada close → form login tampil, banner countdown tampil di atas
 * mode open + tdk ada close → form login tampil, tidak ada banner
 */
function initMasaUnduhBanner() {
  if (_cdInterval) { clearInterval(_cdInterval); _cdInterval = null; }

  const status  = getMasaUnduhStatus();
  const gate    = document.getElementById('masaUnduhGate');
  const inner   = document.getElementById('loginPageInner');
  const gCont   = document.getElementById('gateContent');
  const bannerLogin  = document.getElementById('bannerLogin');
  const bannerDash   = document.getElementById('bannerDashboard');

  const blockLogin   = (status.mode === 'closed' || status.mode === 'opening');
  const showCountBar = (status.mode === 'open' && !!JADWAL_UNDUH.downloadClose);

  // ── Gate fullscreen ──────────────────────────────
  if (blockLogin) {
    gCont.innerHTML = _gateCardHTML(status);
    gate.classList.remove('hidden');
    if (inner) inner.style.display = 'none';
  } else {
    gate.classList.add('hidden');
    if (inner) inner.style.display = '';
  }

  // ── Banner countdown atas (login & dashboard) ──
  const closeTarget = JADWAL_UNDUH.downloadClose ? new Date(JADWAL_UNDUH.downloadClose) : null;
  const barHTML = showCountBar ? _bannerBarHTML(closeTarget) : '';

  if (bannerLogin)  bannerLogin.innerHTML  = barHTML;
  if (bannerDash)   bannerDash.innerHTML   = barHTML;

  // Geser form login bawah jika ada banner
  if (inner) {
    if (showCountBar) inner.classList.add('with-banner');
    else              inner.classList.remove('with-banner');
  }

  // ── Tick countdown ───────────────────────────────
  if (status.mode === 'opening') {
    // Countdown pembukaan — saat 0 switch ke open
    _cdInterval = setInterval(() => {
      if (status.target - new Date() <= 0) {
        clearInterval(_cdInterval); _cdInterval = null;
        initMasaUnduhBanner();
        return;
      }
      _tickCD(status.target);
    }, 1000);

  } else if (showCountBar && closeTarget) {
    // Countdown penutupan — tick angka di banner atas
    _cdInterval = setInterval(() => {
      if (closeTarget - new Date() <= 0) {
        clearInterval(_cdInterval); _cdInterval = null;
        initMasaUnduhBanner(); // switch ke closed
        return;
      }
      _tickCD(closeTarget);
    }, 1000);
  }
}

// ── Daftar Berkas ────────────────────────────────
const BERKAS_LIST = [
  { key: 'nilaiRapor',         label: 'Nilai Rapor',                icon: 'fa-file-lines' },
  { key: 'pasFoto',            label: 'Pas Foto',                   icon: 'fa-image' },
  { key: 'aktaLahir',          label: 'Akta Kelahiran',             icon: 'fa-scroll' },
  { key: 'kartuKeluarga',      label: 'Kartu Keluarga',             icon: 'fa-users' },
  { key: 'ktpOrKia',           label: 'KTP / KIA / Kartu Pelajar', icon: 'fa-id-card' },
  { key: 'suratBaik',          label: 'Surat Keterangan Baik',      icon: 'fa-certificate' },
  { key: 'suratSehat',         label: 'Surat Kesehatan',            icon: 'fa-heart-pulse' },
  { key: 'suratPindahOrtu',    label: 'Surat Permohonan Pindah',   icon: 'fa-file-export' },
  { key: 'suratPindahSekolah', label: 'Surat Keterangan Pindah',   icon: 'fa-school' },
  { key: 'linkSuratPernyataan', label: 'Surat Pernyataan',         icon: 'fa-file-signature', isRoot: true }
];

/* ═══════════════════════════════════════════════════════
   LOAD STAMP IMAGE from embedded base64
═══════════════════════════════════════════════════════ */
async function loadStampImage() {
  // Muat gambar stempel dari file yang diunggah (disimpan di Firestore)
  // Jika tidak tersedia dari Firestore, coba load dari path relatif
  try {
    const stampSnap = await db.collection('aset').doc('stempelSekolah').get();
    if (stampSnap.exists && stampSnap.data().base64) {
      stampBase64 = stampSnap.data().base64;
    } else {
      // Fallback: load gambar stempel dari path lokal via fetch
      await loadStampFromLocal();
    }
  } catch {
    await loadStampFromLocal();
  }
}

async function loadStampFromLocal() {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    // Coba load dari path relatif (gambar stempel yang diupload admin)
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width; canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      try { stampBase64 = canvas.toDataURL('image/png'); } catch { stampBase64 = null; }
      resolve();
    };
    img.onerror = () => { stampBase64 = null; resolve(); };
    img.src = './1780197522531_image.png';
  });
}

/* ═══════════════════════════════════════════════════════
   UTILITIES
═══════════════════════════════════════════════════════ */
function showLoading(text = 'Memuat data...') {
  document.getElementById('loadingText').textContent = text;
  document.getElementById('loadingOverlay').classList.remove('hidden');
}
function hideLoading() {
  document.getElementById('loadingOverlay').classList.add('hidden');
}

function showToast(msg, type = 'info') {
  const icons = { success: 'fa-circle-check', error: 'fa-circle-exclamation', info: 'fa-circle-info' };
  const el = document.createElement('div');
  el.className = `toast toast-${type}`;
  el.innerHTML = `<i class="fa-solid ${icons[type]}"></i><span>${msg}</span>`;
  document.getElementById('toastContainer').appendChild(el);
  setTimeout(() => {
    el.style.opacity = '0';
    el.style.transform = 'translateX(100px)';
    el.style.transition = '.3s';
    setTimeout(() => el.remove(), 300);
  }, 4500);
}

function showPage(pageId) {
  document.querySelectorAll('.page').forEach(p => { p.classList.remove('active'); p.classList.add('hidden'); });
  const pg = document.getElementById(pageId);
  pg.classList.remove('hidden');
  pg.classList.add('active');
}

function formatTanggal(val) {
  if (!val) return '-';
  if (val?.toDate) val = val.toDate();
  if (val instanceof Date) return val.toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });
  if (typeof val === 'string') {
    const d = new Date(val);
    if (!isNaN(d)) return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });
    return val;
  }
  return '-';
}

function formatTglInput(val) {
  if (!val) return '';
  if (val?.toDate) val = val.toDate();
  if (val instanceof Date) return val.toISOString().split('T')[0];
  if (typeof val === 'string') return val.slice(0, 10);
  return '';
}

/* ═══════════════════════════════════════════════════════
   SESSION
═══════════════════════════════════════════════════════ */
function saveSession(data) { localStorage.setItem('sman68_peserta', JSON.stringify(data)); }
function getSession() { try { return JSON.parse(localStorage.getItem('sman68_peserta')); } catch { return null; } }
function clearSession() { localStorage.removeItem('sman68_peserta'); }

/* ═══════════════════════════════════════════════════════
   INIT
═══════════════════════════════════════════════════════ */
window.addEventListener('DOMContentLoaded', async () => {
  // Init banner masa unduh
  initMasaUnduhBanner();

  // Load stempel di background
  loadStampImage();

  const session = getSession();
  if (session?.noDaftar) {
    showLoading('Memuat sesi...');
    try {
      const snap = await db.collection('pendaftaranMutasi')
        .where('noDaftar', '==', session.noDaftar)
        .limit(1).get();

      if (!snap.empty) {
        const data = snap.docs[0].data();
        if (data.status === 'diterima') {
          currentPeserta = data;
          renderDashboard(data);
          showPage('dashboardPage');
          initMasaUnduhBanner(); // refresh banner di dashboard
          showToast('Selamat datang kembali, ' + data.nama + '!', 'success');
          hideLoading();
          return;
        }
      }
    } catch(e) { console.warn(e); }
    clearSession();
    hideLoading();
  }
  showPage('loginPage');
});

/* ═══════════════════════════════════════════════════════
   LOGIN
═══════════════════════════════════════════════════════ */
async function handleLogin() {
  const noDaftar = document.getElementById('inputNoDaftar').value.trim();
  const tglLahir = document.getElementById('inputTglLahir').value;

  if (!noDaftar || !tglLahir) {
    showToast('Nomor pendaftaran dan tanggal lahir wajib diisi.', 'error');
    return;
  }

  document.getElementById('btnLoginText').classList.add('hidden');
  document.getElementById('btnLoginLoader').classList.remove('hidden');
  document.getElementById('statusCard').className = 'status-card hidden';

  try {
    const snap = await db.collection('pendaftaranMutasi')
      .where('noDaftar', '==', noDaftar)
      .limit(1).get();

    if (snap.empty) {
      showStatusCard('error', 'fa-circle-xmark', 'Nomor pendaftaran tidak ditemukan. Periksa kembali nomor Anda.');
      showToast('Nomor pendaftaran tidak ditemukan.', 'error');
      resetLoginBtn(); return;
    }

    const data = snap.docs[0].data();
    const tglDB    = formatTglInput(data.tglLahir);
    const tglInput = tglLahir.slice(0, 10);

    if (tglDB !== tglInput) {
      showStatusCard('error', 'fa-circle-xmark', 'Tanggal lahir tidak sesuai. Periksa kembali.');
      showToast('Tanggal lahir tidak sesuai.', 'error');
      resetLoginBtn(); return;
    }

    const status = (data.status || '').toLowerCase();

    if (status === 'pending') {
      showStatusCard('pending', 'fa-clock', 'Pendaftaran Anda masih menunggu verifikasi operator.', data.catatanOperator);
      resetLoginBtn(); return;
    }
    if (status === 'proses') {
      showStatusCard('proses', 'fa-spinner', 'Berkas Anda sedang diproses operator.', data.catatanOperator);
      resetLoginBtn(); return;
    }
    if (status === 'ditolak') {
      showStatusCard('ditolak', 'fa-circle-xmark', 'Pendaftaran Anda tidak disetujui.', data.catatanOperator);
      resetLoginBtn(); return;
    }
    if (status !== 'diterima') {
      showStatusCard('error', 'fa-circle-xmark', 'Status pendaftaran tidak dikenali. Hubungi operator.');
      resetLoginBtn(); return;
    }

    currentPeserta = data;
    saveSession({ noDaftar: data.noDaftar });
    renderDashboard(data);
    showPage('dashboardPage');
    initMasaUnduhBanner(); // refresh banner di dashboard
    showToast('Login berhasil! Selamat datang, ' + data.nama + '.', 'success');

  } catch (err) {
    console.error(err);
    showToast('Terjadi kesalahan jaringan. Coba lagi.', 'error');
  }

  resetLoginBtn();
}

function resetLoginBtn() {
  document.getElementById('btnLoginText').classList.remove('hidden');
  document.getElementById('btnLoginLoader').classList.add('hidden');
}

function showStatusCard(type, icon, msg, catatan) {
  const sc = document.getElementById('statusCard');
  const typeMap = { pending: 'pending', proses: 'proses', ditolak: 'ditolak', error: 'ditolak' };
  sc.className = `status-card ${typeMap[type] || 'ditolak'}`;
  sc.innerHTML = `<i class="fa-solid ${icon}"></i>
    <div>
      <div>${msg}</div>
      ${catatan ? `<div class="catatan"><strong>Catatan Operator:</strong> ${catatan}</div>` : ''}
    </div>`;
  sc.classList.remove('hidden');
}

document.addEventListener('keydown', e => {
  if (e.key === 'Enter' && document.getElementById('loginPage').classList.contains('active')) {
    handleLogin();
  }
});

/* ═══════════════════════════════════════════════════════
   LOGOUT
═══════════════════════════════════════════════════════ */
function handleLogout() {
  clearSession();
  currentPeserta = null;
  fotoBase64     = null;
  fotoTersimpan  = null;
  document.getElementById('inputNoDaftar').value = '';
  document.getElementById('inputTglLahir').value = '';
  document.getElementById('statusCard').className = 'status-card hidden';
  showPage('loginPage');
  showToast('Anda telah keluar dari sistem.', 'info');
}

/* ═══════════════════════════════════════════════════════
   RENDER DASHBOARD
═══════════════════════════════════════════════════════ */
function renderDashboard(data) {
  document.getElementById('navNama').textContent    = data.nama || '';
  document.getElementById('welcomeName').textContent = 'Selamat datang, ' + (data.nama || '') + '!';

  renderDataSiswa(data);
  renderStatusBerkas(data);
  fetchAndRenderJadwal(data.noDaftar);
  renderFotoSection(data);
  updateEditButton(data);
}

/* ── Data Siswa ── */
function renderDataSiswa(data) {
  const jkMap = { L: 'Laki-laki', P: 'Perempuan' };
  const fields = [
    { label: 'Nomor Pendaftaran', value: data.noDaftar || '-' },
    { label: 'Nama Lengkap',      value: data.nama || '-' },
    { label: 'Tanggal Lahir',     value: formatTanggal(data.tglLahir) },
    { label: 'Jenis Kelamin',     value: jkMap[data.jk] || data.jk || '-' },
    { label: 'Agama',             value: data.agama || '-' },
    { label: 'Sekolah Asal',      value: data.sekolahAsal || '-', wide: true },
    { label: 'NISN',              value: data.nisn || '-' },
    { label: 'NPSN Sekolah Asal', value: data.npsn || '-' },
    { label: 'Email',             value: data.email || '-' },
    { label: 'No. HP Siswa',      value: data.telpMurid || '-' },
    { label: 'No. HP Orang Tua',  value: data.telpOrtu || '-' },
    { label: 'Alasan Pindah',     value: data.alasanPindah || '-', wide: true },
  ];

  const grid = document.getElementById('dataSiswaGrid');
  grid.innerHTML = fields.map(f =>
    `<div class="data-item${f.wide ? ' wide' : ''}">
      <div class="di-label">${f.label}</div>
      <div class="di-value">${f.value}</div>
    </div>`
  ).join('');
}

/* ── Status Berkas ── */
function renderStatusBerkas(data) {
  // Firestore bisa simpan dokumen di beberapa lokasi berbeda tergantung form pendaftaran
  const dokumen = data.dokumen || data.docs || data.berkas || {};
  const grid    = document.getElementById('statusBerkasGrid');
  grid.innerHTML = '';

  BERKAS_LIST.forEach(b => {
    let link = '';
    if (b.isRoot) {
      // Field di root document
      link = data[b.key] || data.linkSuratPernyataan || data.linkSurat || '';
    } else {
      // Cek di nested object DULU, lalu fallback ke root
      link = dokumen[b.key] || data[b.key] || '';
    }
    const valid = !!(link && String(link).trim() !== '' && String(link).trim() !== '-');

    grid.innerHTML += `
      <div class="berkas-item">
        <div class="berkas-icon ${valid ? 'valid' : 'missing'}">
          <i class="fa-solid ${valid ? 'fa-circle-check' : b.icon}"></i>
        </div>
        <div>
          <div class="berkas-name">${b.label}</div>
          <div class="berkas-status ${valid ? 'valid' : 'missing'}">
            ${valid ? '✓ Terverifikasi' : '— Belum ada'}
          </div>
        </div>
        ${valid ? `<a href="${link}" target="_blank" style="margin-left:auto;font-size:.75rem;color:var(--blue-main);font-weight:600;text-decoration:none;" title="Lihat dokumen"><i class="fa-solid fa-arrow-up-right-from-square"></i></a>` : ''}
      </div>`;
  });
}

/* ── Jadwal ── */
async function fetchAndRenderJadwal(noDaftar) {
  const container = document.getElementById('jadwalContainer');
  try {
    let jadwal = null;

    const snap = await db.collection('jadwalMutasi').limit(1).get();
    if (!snap.empty) jadwal = snap.docs[0].data();

    const snapPeserta = await db.collection('pendaftaranMutasi')
      .where('noDaftar', '==', noDaftar).limit(1).get();

    if (!snapPeserta.empty) {
      const d = snapPeserta.docs[0].data();
      if (d.jadwalTes || d.jadwalWawancara) jadwal = { ...jadwal, ...d };
    }

    if (!jadwal || (!jadwal.jadwalTes && !jadwal.jadwalWawancara && !jadwal.lokasiTes)) {
      container.innerHTML = `<div class="jadwal-empty"><i class="fa-regular fa-calendar-xmark"></i><p>Jadwal belum tersedia. Silakan cek berkala.</p></div>`;
      return;
    }

    let html = '<div class="jadwal-timeline">';
    if (jadwal.jadwalTes)       html += buildJadwalItem('Tes Seleksi', jadwal.jadwalTes, jadwal.lokasiTes, 'fa-pencil');
    if (jadwal.jadwalWawancara) html += buildJadwalItem('Wawancara', jadwal.jadwalWawancara, jadwal.lokasiWawancara, 'fa-comments');
    if (jadwal.catatanPeserta) {
      html += `<div class="jt-item" style="background:var(--blue-pale);border:1px solid #bfdbfe;border-radius:10px;padding:12px 16px;font-size:.82rem;color:var(--blue-dark);">
        <i class="fa-solid fa-circle-info" style="margin-right:8px;"></i>${jadwal.catatanPeserta}
      </div>`;
    }
    html += '</div>';
    container.innerHTML = html;
    jadwalData = jadwal;

  } catch (err) {
    console.error(err);
    container.innerHTML = `<div class="jadwal-empty"><i class="fa-regular fa-calendar-xmark"></i><p>Jadwal belum tersedia. Silakan cek berkala.</p></div>`;
  }
}

function buildJadwalItem(title, tanggal, lokasi, icon) {
  return `
    <div class="jadwal-item">
      <div class="jt-dot-wrap">
        <div class="jt-dot"></div>
        <div class="jt-line"></div>
      </div>
      <div class="jt-content">
        <div class="jt-title"><i class="fa-solid ${icon}" style="margin-right:6px;color:var(--blue-main);"></i>${title}</div>
        <div class="jt-detail"><i class="fa-solid fa-calendar"></i> ${formatTanggal(tanggal)}</div>
        ${lokasi ? `<div class="jt-detail"><i class="fa-solid fa-location-dot"></i> ${lokasi}</div>` : ''}
      </div>
    </div>`;
}

/* ═══════════════════════════════════════════════════════
   PAS FOTO – UPLOAD & SIMPAN
═══════════════════════════════════════════════════════ */

function renderFotoSection(data) {
  // Cek apakah sudah ada foto tersimpan di Firestore
  const fotoUrl = data.pasFotoKartu || (data.dokumen && data.dokumen.pasFotoKartu) || '';

  if (fotoUrl && fotoUrl.startsWith('data:image')) {
    // Ada foto tersimpan
    fotoTersimpan = fotoUrl;
    tampilkanFotoPreview(fotoUrl);
    setFotoStatus(true);
  } else {
    fotoTersimpan = null;
    setFotoStatus(false);
  }
}

function setFotoStatus(adaFoto) {
  const elBelum = document.getElementById('fotoStatusBelum');
  const elAda   = document.getElementById('fotoStatusAda');
  if (adaFoto) {
    elBelum.classList.add('hidden');
    elAda.classList.remove('hidden');
  } else {
    elBelum.classList.remove('hidden');
    elAda.classList.add('hidden');
  }
}

function tampilkanFotoPreview(base64) {
  const img = document.getElementById('fotoPreviewImg');
  const placeholder = document.getElementById('fotoPreviewPlaceholder');
  img.src = base64;
  img.classList.remove('hidden');
  placeholder.classList.add('hidden');
}

function sembunyikanFotoPreview() {
  const img = document.getElementById('fotoPreviewImg');
  const placeholder = document.getElementById('fotoPreviewPlaceholder');
  img.src = '';
  img.classList.add('hidden');
  placeholder.classList.remove('hidden');
}

function handleFotoSelected(event) {
  const file = event.target.files[0];
  if (!file) return;

  // Validasi ukuran
  if (file.size > 2 * 1024 * 1024) {
    showToast('Ukuran foto melebihi 2MB. Pilih foto yang lebih kecil.', 'error');
    event.target.value = '';
    return;
  }

  // Validasi tipe file
  if (!['image/jpeg', 'image/png'].includes(file.type)) {
    showToast('Format foto harus JPG atau PNG.', 'error');
    event.target.value = '';
    return;
  }

  const reader = new FileReader();
  reader.onload = (e) => {
    fotoBase64 = e.target.result;
    tampilkanFotoPreview(fotoBase64);
    // Aktifkan tombol simpan
    document.getElementById('btnSimpanFoto').disabled = false;
    showToast('Foto dipilih. Klik "Simpan Perubahan" untuk menyimpan.', 'info');
  };
  reader.readAsDataURL(file);
}

async function simpanFoto() {
  if (!fotoBase64) {
    showToast('Pilih foto terlebih dahulu.', 'error');
    return;
  }
  if (!currentPeserta?.noDaftar) {
    showToast('Data peserta tidak ditemukan.', 'error');
    return;
  }

  showLoading('Menyimpan foto...');

  try {
    // Simpan base64 foto ke Firestore di field pasFotoKartu
    const snap = await db.collection('pendaftaranMutasi')
      .where('noDaftar', '==', currentPeserta.noDaftar)
      .limit(1).get();

    if (snap.empty) {
      showToast('Data peserta tidak ditemukan di database.', 'error');
      hideLoading();
      return;
    }

    const docRef = snap.docs[0].ref;
    await docRef.update({ pasFotoKartu: fotoBase64 });

    // Update state lokal
    fotoTersimpan = fotoBase64;
    currentPeserta.pasFotoKartu = fotoBase64;
    fotoBase64 = null;

    // Nonaktifkan tombol simpan
    document.getElementById('btnSimpanFoto').disabled = true;
    setFotoStatus(true);

    hideLoading();
    showToast('Pas foto berhasil disimpan!', 'success');

    // Langsung tampilkan kartu setelah simpan
    setTimeout(() => {
      showToast('Kartu peserta siap diunduh atau dicetak.', 'info');
    }, 1500);

  } catch (err) {
    console.error('Simpan foto error:', err);
    hideLoading();
    showToast('Gagal menyimpan foto. Periksa koneksi internet.', 'error');
  }
}

/* ═══════════════════════════════════════════════════════
   KARTU PESERTA
═══════════════════════════════════════════════════════ */
function generateKartu(mode) {
  if (!currentPeserta) { showToast('Data peserta tidak tersedia.', 'error'); return; }

  // Cek foto
  const fotoAktif = fotoTersimpan || currentPeserta.pasFotoKartu || '';
  if (!fotoAktif) {
    showToast('Anda tidak dapat melakukan ' + (mode === 'print' ? 'cetak' : 'simpan PDF') + ' karena belum menambahkan pas foto.', 'error');
    // Scroll ke seksi foto
    document.getElementById('fotoSection').scrollIntoView({ behavior: 'smooth', block: 'center' });
    return;
  }

  const d = currentPeserta;

  // Isi data kartu
  document.getElementById('kNoDaftar').textContent   = d.noDaftar   || '-';
  document.getElementById('kNama').textContent        = d.nama        || '-';
  document.getElementById('kTglLahir').textContent    = formatTanggal(d.tglLahir);
  document.getElementById('kJK').textContent          = d.jk === 'L' ? 'Laki-laki' : d.jk === 'P' ? 'Perempuan' : (d.jk || '-');
  document.getElementById('kSekolahAsal').textContent = d.sekolahAsal || '-';
  document.getElementById('kNISN').textContent        = d.nisn        || '-';
  document.getElementById('kNPSN').textContent        = d.npsn        || '-';
  document.getElementById('kNamaTTD').textContent     = d.nama        || '';

  // Tahun ajaran
  const now = new Date();
  const yr  = now.getMonth() >= 6 ? now.getFullYear() : now.getFullYear() - 1;
  document.getElementById('kartuTahunAjaran').textContent = `TAHUN AJARAN ${yr}/${yr+1}`;

  // Foto peserta — reset dulu, lalu set
  const fotoEl = document.getElementById('kartuFoto');
  const fotoPlaceholder = document.getElementById('kartuFotoPlaceholder');
  fotoEl.classList.remove('hidden');
  fotoPlaceholder.style.display = 'none';
  fotoEl.src = fotoAktif;

  // Stempel sekolah di header kartu
  const stempelHeaderEl = document.getElementById('kartuStempelImg');
  const stempelTTDEl    = document.getElementById('ttdStempelImg');
  if (stampBase64) {
    stempelHeaderEl.src = stampBase64;
    stempelTTDEl.src    = stampBase64;
  } else {
    // Coba load ulang
    loadStampImage().then(() => {
      if (stampBase64) {
        stempelHeaderEl.src = stampBase64;
        stempelTTDEl.src    = stampBase64;
      }
    });
  }

  // QR Code
  const qrEl = document.getElementById('kartuQR');
  qrEl.innerHTML = '';
  new QRCode(qrEl, {
    text: `SMAN68-MUTASI|${d.noDaftar}|${d.nama}`,
    width: 88, height: 88,
    colorDark: '#0d6c3a', colorLight: '#ffffff',
    correctLevel: QRCode.CorrectLevel.M
  });

  // Tampilkan modal
  document.getElementById('kartuModal').classList.remove('hidden');

  if (mode === 'download') {
    setTimeout(() => downloadKartuPDF(), 800);
  }
}

function closeModal() {
  document.getElementById('kartuModal').classList.add('hidden');
}

async function downloadKartuPDF() {
  const fotoAktif = fotoTersimpan || currentPeserta?.pasFotoKartu || '';
  if (!fotoAktif) {
    showToast('Belum ada pas foto. Unggah pas foto terlebih dahulu.', 'error');
    closeModal();
    document.getElementById('fotoSection').scrollIntoView({ behavior: 'smooth', block: 'center' });
    return;
  }

  showLoading('Membuat PDF berkualitas tinggi...');
  try {
    // Tunggu semua gambar dalam kartu benar-benar termuat
    await new Promise(r => setTimeout(r, 600));

    const el = document.getElementById('kartuPrint');

    // Deteksi DPR perangkat, minimum 3 untuk kualitas tajam di HP
    const deviceDPR = window.devicePixelRatio || 1;
    const renderScale = Math.max(3, deviceDPR * 2);

    const canvas = await html2canvas(el, {
      scale: renderScale,
      useCORS: true,
      allowTaint: true,
      logging: false,
      backgroundColor: '#ffffff',
      imageTimeout: 15000,
      removeContainer: true,
      // Paksa render ukuran penuh agar tidak terpotong
      windowWidth: el.scrollWidth,
      windowHeight: el.scrollHeight,
    });

    // Gunakan JPEG kualitas 1.0 (lossless) agar tidak buram
    const imgData = canvas.toDataURL('image/jpeg', 1.0);

    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: false,   // jangan kompres agar kualitas terjaga
    });

    const pdfW = pdf.internal.pageSize.getWidth();   // 210mm
    const pdfH = pdf.internal.pageSize.getHeight();  // 297mm

    // Hitung tinggi gambar proporsional, jangan melebihi 1 halaman A4
    const imgRatio = canvas.height / canvas.width;
    const imgH = Math.min(pdfW * imgRatio, pdfH);

    // Posisikan di tengah atas halaman
    const marginTop = 0;
    pdf.addImage(imgData, 'JPEG', 0, marginTop, pdfW, imgH);

    const nama = (currentPeserta?.nama || 'peserta').replace(/\s+/g, '_');
    pdf.save(`Kartu_Peserta_${nama}_${currentPeserta?.noDaftar || ''}.pdf`);
    showToast('PDF berhasil diunduh dengan kualitas tinggi!', 'success');
  } catch (err) {
    console.error('PDF error:', err);
    showToast('Gagal membuat PDF. Coba lagi.', 'error');
  }
  hideLoading();
}

function printKartu() {
  const fotoAktif = fotoTersimpan || currentPeserta?.pasFotoKartu || '';
  if (!fotoAktif) {
    showToast('Belum ada pas foto. Unggah pas foto terlebih dahulu.', 'error');
    closeModal();
    document.getElementById('fotoSection').scrollIntoView({ behavior: 'smooth', block: 'center' });
    return;
  }

  // Ambil HTML kartu
  const kartuEl  = document.getElementById('kartuPrint');
  const kartuHTML = kartuEl.outerHTML;

  // Kumpulkan semua CSS dari halaman ini
  const allCSS = Array.from(document.styleSheets).map(sheet => {
    try {
      return Array.from(sheet.cssRules).map(r => r.cssText).join('\n');
    } catch { return ''; }
  }).join('\n');

  // Buka popup window bersih — hanya berisi kartu, 1 halaman
  const popup = window.open('', '_blank', 'width=850,height=1100');
  popup.document.write(`<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>Kartu Peserta – ${currentPeserta?.nama || ''}</title>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap" rel="stylesheet"/>
  <style>
    ${allCSS}
    /* Override khusus print popup */
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    html, body {
      margin: 0; padding: 0;
      background: #fff;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    #kartuPrint {
      width: 210mm;
      max-width: 100%;
      margin: 0 auto;
      box-shadow: none !important;
      border-radius: 0 !important;
    }
    @media print {
      @page { size: A4 portrait; margin: 0; }
      html, body { width: 210mm; }
      #kartuPrint {
        width: 210mm;
        page-break-after: avoid;
        break-after: avoid;
      }
    }
  </style>
</head>
<body>
  ${kartuHTML}
  <script>
    // Tunggu semua resource termuat lalu print otomatis
    window.onload = function() {
      // Tunggu font & gambar benar-benar render
      setTimeout(function() {
        window.focus();
        window.print();
        // Tutup popup setelah print dialog selesai
        setTimeout(function() { window.close(); }, 1000);
      }, 800);
    };
  <\/script>
</body>
</html>`);
  popup.document.close();
}

/* ═══════════════════════════════════════════════════════
   EDIT BIODATA – 1x KESEMPATAN
═══════════════════════════════════════════════════════ */

function updateEditButton(data) {
  const btn = document.getElementById('btnEditBiodata');
  if (!btn) return;
  const sudahEdit = data.sudahEdit === true;
  if (sudahEdit) {
    btn.innerHTML = '<i class="fa-solid fa-lock"></i> Batas Perbaikan Sudah Terpakai';
    btn.classList.add('used');
    btn.disabled = true;
  } else {
    btn.innerHTML = '<i class="fa-solid fa-pen-to-square"></i> Edit Biodata';
    btn.classList.remove('used');
    btn.disabled = false;
  }
}

function bukaModalEdit() {
  if (!currentPeserta) return;

  const sudahEdit = currentPeserta.sudahEdit === true;
  if (sudahEdit) {
    showToast('Batas perbaikan biodata sudah terpakai.', 'error');
    return;
  }

  const d = currentPeserta;
  document.getElementById('editNama').value         = d.nama || '';
  document.getElementById('editTglLahir').value     = formatTglInput(d.tglLahir);
  document.getElementById('editJK').value           = d.jk || 'L';
  document.getElementById('editAgama').value        = d.agama || 'Islam';
  document.getElementById('editSekolahAsal').value  = d.sekolahAsal || '';
  document.getElementById('editNisn').value         = d.nisn || '';
  document.getElementById('editEmail').value        = d.email || '';
  document.getElementById('editTelpMurid').value    = d.telpMurid || '';
  document.getElementById('editTelpOrtu').value     = d.telpOrtu || '';
  document.getElementById('editAlasanPindah').value = d.alasanPindah || '';

  document.getElementById('editBiodataModal').classList.remove('hidden');
}

function tutupModalEdit() {
  document.getElementById('editBiodataModal').classList.add('hidden');
}

async function simpanPerubahanPermanen() {
  if (!currentPeserta?.noDaftar) return;

  const sudahEdit = currentPeserta.sudahEdit === true;
  if (sudahEdit) {
    showToast('Batas perbaikan biodata sudah terpakai.', 'error');
    tutupModalEdit();
    return;
  }

  const nama         = document.getElementById('editNama').value.trim();
  const tglLahir     = document.getElementById('editTglLahir').value;
  const jk           = document.getElementById('editJK').value;
  const agama        = document.getElementById('editAgama').value;
  const sekolahAsal  = document.getElementById('editSekolahAsal').value.trim();
  const nisn         = document.getElementById('editNisn').value.trim();
  const email        = document.getElementById('editEmail').value.trim();
  const telpMurid    = document.getElementById('editTelpMurid').value.trim();
  const telpOrtu     = document.getElementById('editTelpOrtu').value.trim();
  const alasanPindah = document.getElementById('editAlasanPindah').value.trim();

  if (!nama) { showToast('Nama lengkap wajib diisi.', 'error'); return; }
  if (!tglLahir) { showToast('Tanggal lahir wajib diisi.', 'error'); return; }

  // Konfirmasi sekali lagi
  if (!confirm('⚠️ Perhatian!\n\nAnda hanya memiliki 1 kesempatan edit.\n\nSetelah klik OK, data tidak dapat diubah lagi.\n\nLanjutkan simpan perubahan?')) return;

  const btn = document.getElementById('btnSimpanPermanen');
  btn.disabled = true;
  btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Menyimpan...';
  showLoading('Menyimpan perubahan...');

  try {
    const snap = await db.collection('pendaftaranMutasi')
      .where('noDaftar', '==', currentPeserta.noDaftar)
      .limit(1).get();

    if (snap.empty) {
      showToast('Data peserta tidak ditemukan.', 'error');
      hideLoading();
      btn.disabled = false;
      btn.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> Simpan Perubahan Permanen';
      return;
    }

    const updateData = {
      nama, tglLahir, jk, agama, sekolahAsal, nisn, email,
      telpMurid, telpOrtu, alasanPindah,
      sudahEdit: true,
      waktuEdit: new Date().toISOString()
    };

    await snap.docs[0].ref.update(updateData);

    // Update local state
    Object.assign(currentPeserta, updateData);

    // Refresh tampilan
    renderDataSiswa(currentPeserta);
    document.getElementById('navNama').textContent = currentPeserta.nama;
    document.getElementById('welcomeName').textContent = 'Selamat datang, ' + currentPeserta.nama + '!';
    updateEditButton(currentPeserta);

    tutupModalEdit();
    hideLoading();
    showToast('Biodata berhasil disimpan secara permanen!', 'success');

  } catch (err) {
    console.error('Edit biodata error:', err);
    hideLoading();
    btn.disabled = false;
    btn.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> Simpan Perubahan Permanen';
    showToast('Gagal menyimpan. Periksa koneksi internet.', 'error');
  }
}

// Tutup modal edit jika klik backdrop
document.addEventListener('click', (e) => {
  if (e.target.id === 'editBiodataModal') tutupModalEdit();
});
