/* ══════════════════════════════════════════════════
   UNDUH KARTU PESERTA – SMAN 68 Jakarta
   Firebase Firestore + PDF + QR + Session
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
let currentPeserta = null;
let jadwalData     = null;

// ── Daftar Berkas ────────────────────────────────
const BERKAS_LIST = [
  { key: 'nilaiRapor',       label: 'Nilai Rapor',                icon: 'fa-file-lines' },
  { key: 'pasFoto',          label: 'Pas Foto',                   icon: 'fa-image' },
  { key: 'aktaLahir',        label: 'Akta Kelahiran',             icon: 'fa-scroll' },
  { key: 'kartuKeluarga',    label: 'Kartu Keluarga',             icon: 'fa-users' },
  { key: 'ktpOrKia',         label: 'KTP / KIA / Kartu Pelajar', icon: 'fa-id-card' },
  { key: 'suratBaik',        label: 'Surat Keterangan Baik',      icon: 'fa-certificate' },
  { key: 'suratSehat',       label: 'Surat Kesehatan',            icon: 'fa-heart-pulse' },
  { key: 'suratPindahOrtu',  label: 'Surat Permohonan Pindah',   icon: 'fa-file-export' },
  { key: 'suratPindahSekolah', label: 'Surat Keterangan Pindah', icon: 'fa-school' },
  { key: 'linkSuratPernyataan', label: 'Surat Pernyataan',       icon: 'fa-file-signature', isRoot: true }
];

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
  setTimeout(() => { el.style.opacity = '0'; el.style.transform = 'translateX(100px)'; el.style.transition = '.3s'; setTimeout(() => el.remove(), 300); }, 4000);
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
  if (val instanceof Date) {
    return val.toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });
  }
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
function saveSession(data) {
  localStorage.setItem('sman68_peserta', JSON.stringify(data));
}
function getSession() {
  try { return JSON.parse(localStorage.getItem('sman68_peserta')); } catch { return null; }
}
function clearSession() {
  localStorage.removeItem('sman68_peserta');
}

/* ═══════════════════════════════════════════════════════
   INIT – Auto redirect if logged in
═══════════════════════════════════════════════════════ */
window.addEventListener('DOMContentLoaded', async () => {
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
  const noDaftar  = document.getElementById('inputNoDaftar').value.trim();
  const tglLahir  = document.getElementById('inputTglLahir').value;

  if (!noDaftar || !tglLahir) {
    showToast('Nomor pendaftaran dan tanggal lahir wajib diisi.', 'error');
    return;
  }

  // Show button loader
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

    // Validate tanggal lahir
    const tglDB    = formatTglInput(data.tglLahir);
    const tglInput = tglLahir.slice(0, 10);

    if (tglDB !== tglInput) {
      showStatusCard('error', 'fa-circle-xmark', 'Tanggal lahir tidak sesuai. Periksa kembali.');
      showToast('Tanggal lahir tidak sesuai.', 'error');
      resetLoginBtn(); return;
    }

    // Validate status
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

    // SUCCESS
    currentPeserta = data;
    saveSession({ noDaftar: data.noDaftar });
    renderDashboard(data);
    showPage('dashboardPage');
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

// Allow Enter key to submit
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
  // Nav & Welcome
  document.getElementById('navNama').textContent   = data.nama || '';
  document.getElementById('welcomeName').textContent = 'Selamat datang, ' + (data.nama || '') + '!';

  // Render sections
  renderDataSiswa(data);
  renderStatusBerkas(data);
  fetchAndRenderJadwal(data.noDaftar);
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
  const dokumen = data.dokumen || {};
  const grid    = document.getElementById('statusBerkasGrid');
  grid.innerHTML = '';

  BERKAS_LIST.forEach(b => {
    const link  = b.isRoot ? data[b.key] : dokumen[b.key];
    const valid = link && link.trim() !== '';
    grid.innerHTML += `
      <div class="berkas-item">
        <div class="berkas-icon ${valid ? 'valid' : 'missing'}">
          <i class="fa-solid ${valid ? 'fa-circle-check' : b.icon}"></i>
        </div>
        <div>
          <div class="berkas-name">${b.label}</div>
          <div class="berkas-status ${valid ? 'valid' : 'missing'}">
            ${valid ? '✓ VALID' : '— Belum ada'}
          </div>
        </div>
        ${valid ? `<a href="${link}" target="_blank" style="margin-left:auto;font-size:.75rem;color:var(--blue-main);font-weight:600;text-decoration:none;"><i class="fa-solid fa-arrow-up-right-from-square"></i></a>` : ''}
      </div>`;
  });
}

/* ── Jadwal ── */
async function fetchAndRenderJadwal(noDaftar) {
  const container = document.getElementById('jadwalContainer');

  try {
    // Try fetching per-student jadwal first, then general jadwal
    let jadwal = null;

    const snap = await db.collection('jadwalMutasi').limit(1).get();
    if (!snap.empty) {
      jadwal = snap.docs[0].data();
    }

    // Also try peserta-specific jadwal
    const snapPeserta = await db.collection('pendaftaranMutasi')
      .where('noDaftar', '==', noDaftar)
      .limit(1).get();

    if (!snapPeserta.empty) {
      const d = snapPeserta.docs[0].data();
      if (d.jadwalTes || d.jadwalWawancara) {
        jadwal = { ...jadwal, ...d };
      }
    }

    if (!jadwal || (!jadwal.jadwalTes && !jadwal.jadwalWawancara && !jadwal.lokasiTes)) {
      container.innerHTML = `
        <div class="jadwal-empty">
          <i class="fa-regular fa-calendar-xmark"></i>
          <p>Jadwal belum tersedia. Silakan cek berkala.</p>
        </div>`;
      return;
    }

    let html = '<div class="jadwal-timeline">';

    if (jadwal.jadwalTes) {
      html += buildJadwalItem('Tes Seleksi', jadwal.jadwalTes, jadwal.lokasiTes, 'fa-pencil');
    }
    if (jadwal.jadwalWawancara) {
      html += buildJadwalItem('Wawancara', jadwal.jadwalWawancara, jadwal.lokasiWawancara, 'fa-comments');
    }
    if (jadwal.catatanPeserta) {
      html += `<div class="jt-item" style="background:var(--blue-pale);border:1px solid #bfdbfe;border-radius:10px;padding:12px 16px;font-size:.82rem;color:var(--blue-dark);">
        <i class="fa-solid fa-circle-info" style="margin-right:8px;"></i>${jadwal.catatanPeserta}
      </div>`;
    }

    html += '</div>';
    container.innerHTML = html;
    jadwalData = jadwal;

  } catch (err) {
    console.error('Jadwal fetch error:', err);
    container.innerHTML = `
      <div class="jadwal-empty">
        <i class="fa-regular fa-calendar-xmark"></i>
        <p>Jadwal belum tersedia. Silakan cek berkala.</p>
      </div>`;
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
   KARTU PESERTA
═══════════════════════════════════════════════════════ */
function generateKartu(mode) {
  if (!currentPeserta) { showToast('Data peserta tidak tersedia.', 'error'); return; }

  const d = currentPeserta;

  // Fill kartu data
  document.getElementById('kNoDaftar').textContent    = d.noDaftar    || '-';
  document.getElementById('kNama').textContent         = d.nama         || '-';
  document.getElementById('kTglLahir').textContent     = formatTanggal(d.tglLahir);
  document.getElementById('kJK').textContent           = d.jk === 'L' ? 'Laki-laki' : d.jk === 'P' ? 'Perempuan' : (d.jk || '-');
  document.getElementById('kSekolahAsal').textContent  = d.sekolahAsal  || '-';
  document.getElementById('kNISN').textContent         = d.nisn         || '-';
  document.getElementById('kNamaTTD').textContent      = d.nama         || '';

  // Tahun ajaran
  const now = new Date();
  const yr  = now.getMonth() >= 6 ? now.getFullYear() : now.getFullYear() - 1;
  document.getElementById('kartuTahunAjaran').textContent = `TAHUN AJARAN ${yr}/${yr+1}`;

  // Foto
  const fotoEl = document.getElementById('kartuFoto');
  const foto   = d.dokumen?.pasFoto || '';
  if (foto) { fotoEl.src = foto; fotoEl.style.display = 'block'; }
  else       { fotoEl.style.display = 'none'; }

  // QR Code
  const qrEl = document.getElementById('kartuQR');
  qrEl.innerHTML = '';
  new QRCode(qrEl, {
    text: `SMAN68-MUTASI|${d.noDaftar}|${d.nama}`,
    width:  88, height: 88,
    colorDark: '#0d6c3a', colorLight: '#ffffff',
    correctLevel: QRCode.CorrectLevel.M
  });

  // Show modal
  document.getElementById('kartuModal').classList.remove('hidden');

  if (mode === 'download') {
    setTimeout(() => downloadKartuPDF(), 600);
  }
}

function closeModal() {
  document.getElementById('kartuModal').classList.add('hidden');
}

async function downloadKartuPDF() {
  showLoading('Membuat PDF...');
  try {
    await new Promise(r => setTimeout(r, 300));
    const el = document.getElementById('kartuPrint');
    const canvas = await html2canvas(el, {
      scale: 2, useCORS: true, logging: false,
      backgroundColor: '#ffffff'
    });
    const imgData = canvas.toDataURL('image/png');
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const pdfW  = pdf.internal.pageSize.getWidth();
    const ratio = canvas.height / canvas.width;
    const pdfH  = pdfW * ratio;
    pdf.addImage(imgData, 'PNG', 0, 0, pdfW, Math.min(pdfH, 297));
    const nama = (currentPeserta?.nama || 'peserta').replace(/\s+/g, '_');
    pdf.save(`Kartu_Peserta_${nama}_${currentPeserta?.noDaftar || ''}.pdf`);
    showToast('PDF berhasil diunduh!', 'success');
  } catch (err) {
    console.error(err);
    showToast('Gagal membuat PDF. Coba lagi.', 'error');
  }
  hideLoading();
}

function printKartu() {
  window.print();
}
