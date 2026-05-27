/**
 * ================================================================
 * PORTAL GURU — SMAN 68 JAKARTA
 * Premium Dashboard JavaScript
 * Version 2.0 — 2026
 * ================================================================
 */

'use strict';

// ================================================================
// FIREBASE CONFIGURATION
// ================================================================
const firebaseConfig = {
    apiKey:            "AIzaSyDAcKcg3alPOTH3FFGelYmsW7jcMMe2PLI",
    authDomain:        "upnvjdatsystem.firebaseapp.com",
    projectId:         "upnvjdatsystem",
    storageBucket:     "upnvjdatsystem.firebasestorage.app",
    messagingSenderId: "57095309946",
    appId:             "1:57095309946:web:b0e9f3f86380d549ffc9c3"
};
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// ================================================================
// GLOBAL STATE
// ================================================================
let currentGuru        = null;
let selectedStatus     = '';
let quickSelectedStatus= '';
let jadwalChecked      = {};
let currentPage        = 'dashboard';
let kalenderMonth      = new Date().getMonth();
let kalenderYear       = new Date().getFullYear();
let countdownInterval  = null;
let loginAttempts      = 0;
let loginLocked        = false;
let resetDocId         = null;          // pending reset doc id

// ================================================================
// QUOTES HARIAN
// ================================================================
const QUOTES = [
    { text: "Guru adalah lilin yang membakar diri untuk menerangi orang lain.", author: "Peribahasa Pendidikan" },
    { text: "Mendidik adalah pekerjaan yang paling mulia, karena menyentuh masa depan.", author: "Christa McAuliffe" },
    { text: "Guru yang baik adalah orang yang bisa membuat hal sulit terasa mudah.", author: "Ralph Waldo Emerson" },
    { text: "Setiap anak membawa kelebihan masing-masing. Tugas guru adalah menemukannya.", author: "Haim Ginott" },
    { text: "Ing ngarso sung tulodo, ing madyo mangun karso, tut wuri handayani.", author: "Ki Hajar Dewantara" },
    { text: "Seorang guru mempengaruhi kehidupan selamanya. Kita tidak pernah tahu sampai di mana pengaruh itu berakhir.", author: "Henry Adams" },
];

// ================================================================
// PRELOADER
// ================================================================
function hidePreloader() {
    setTimeout(() => {
        const p = document.getElementById('preloader');
        if (p) p.classList.add('hide');
    }, 1800);
}
hidePreloader();

// ================================================================
// TOAST NOTIFICATION
// ================================================================
/**
 * @param {'success'|'error'|'warning'|'info'} type
 * @param {string} title
 * @param {string} message
 * @param {number} [duration=4000]
 */
function showToast(type, title, message, duration = 4000) {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const icons = {
        success: 'fa-check-circle',
        error:   'fa-exclamation-circle',
        warning: 'fa-exclamation-triangle',
        info:    'fa-info-circle'
    };

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <i class="fas ${icons[type] || 'fa-bell'} toast-icon"></i>
        <div>
            <div class="toast-title">${sanitize(title)}</div>
            <div class="toast-msg">${sanitize(message)}</div>
        </div>
    `;
    container.appendChild(toast);

    setTimeout(() => {
        toast.classList.add('leaving');
        setTimeout(() => toast.remove(), 350);
    }, duration);
}

// ================================================================
// INPUT SANITIZATION
// ================================================================
function sanitize(str) {
    if (typeof str !== 'string') return '';
    return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// ================================================================
// PARTICLES BACKGROUND (Login)
// ================================================================
function initParticles() {
    const container = document.getElementById('particles');
    if (!container) return;
    for (let i = 0; i < 20; i++) {
        const p = document.createElement('div');
        p.className = 'particle';
        const size = 20 + Math.random() * 60;
        p.style.cssText = `
            width: ${size}px; height: ${size}px;
            left: ${Math.random() * 100}%;
            animation-duration: ${8 + Math.random() * 15}s;
            animation-delay: ${Math.random() * 10}s;
            opacity: ${0.1 + Math.random() * 0.3};
        `;
        container.appendChild(p);
    }
}
initParticles();

// ================================================================
// REALTIME CLOCK
// ================================================================
function updateLoginClock() {
    const now  = new Date();
    const h    = String(now.getHours()).padStart(2,'0');
    const m    = String(now.getMinutes()).padStart(2,'0');
    const s    = String(now.getSeconds()).padStart(2,'0');

    const clockEl = document.getElementById('loginClock');
    const dateEl  = document.getElementById('loginDate');
    if (clockEl) clockEl.textContent = `${h}:${m}:${s}`;
    if (dateEl)  dateEl.textContent  = now.toLocaleDateString('id-ID', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
    });
}
setInterval(updateLoginClock, 1000);
updateLoginClock();

function updateTopbarClock() {
    const now = new Date();
    const timeEl = document.getElementById('topbarTime');
    const dateEl = document.getElementById('topbarDateShort');
    if (timeEl) timeEl.textContent = now.toLocaleTimeString('id-ID',{hour:'2-digit',minute:'2-digit'});
    if (dateEl) dateEl.textContent = now.toLocaleDateString('id-ID',{weekday:'short',day:'numeric',month:'short'});
}
setInterval(updateTopbarClock, 1000);
updateTopbarClock();

// ================================================================
// MOTIVATIONAL QUOTE
// ================================================================
function setDailyQuote() {
    const today = new Date().getDay();
    const q     = QUOTES[today % QUOTES.length];
    const el    = document.getElementById('motivationalQuote');
    const authorEl = document.querySelector('.quote-author');
    if (el) el.textContent = q.text;
    if (authorEl) authorEl.textContent = `— ${q.author}`;
}
setDailyQuote();

// ================================================================
// THEME — Light Mode Only
// ================================================================
document.documentElement.setAttribute('data-theme', 'light');

// ================================================================
// PASSWORD TOGGLE
// ================================================================
document.getElementById('loginPassToggle')?.addEventListener('click', function () {
    const input   = document.getElementById('loginPassword');
    const icon    = document.getElementById('passEyeIcon');
    if (!input) return;
    const isPass  = input.type === 'password';
    input.type    = isPass ? 'text' : 'password';
    if (icon) { icon.className = isPass ? 'fas fa-eye-slash' : 'fas fa-eye'; }
});

// ================================================================
// LOGIN FORM
// ================================================================
document.getElementById('loginForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Rate limiter
    if (loginLocked) {
        showToast('error', 'Terkunci', 'Terlalu banyak percobaan. Tunggu 1 menit.');
        return;
    }

    const nip      = document.getElementById('loginNip')?.value.trim();
    const password = document.getElementById('loginPassword')?.value;
    const remember = document.getElementById('rememberMe')?.checked;

    if (!nip)      { showToast('error', 'Gagal', 'NIP / NUPTK wajib diisi!'); return; }
    if (!password) { showToast('error', 'Gagal', 'Password wajib diisi!'); return; }

    // UI loading
    const btn     = document.getElementById('loginBtn');
    const btnText = btn?.querySelector('.btn-text');
    const btnLoad = btn?.querySelector('.btn-loader');
    if (btn)     btn.disabled    = true;
    if (btnText) btnText.style.display = 'none';
    if (btnLoad) btnLoad.style.display = 'flex';

    try {
        // Query by NIP or NUPTK
        let snapshot = await db.collection('guru')
            .where('nip', '==', nip)
            .where('password', '==', password)
            .get();

        // Fallback: try NUPTK
        if (snapshot.empty) {
            snapshot = await db.collection('guru')
                .where('nuptk', '==', nip)
                .where('password', '==', password)
                .get();
        }

        if (snapshot.empty) {
            loginAttempts++;
            if (loginAttempts >= 5) {
                loginLocked = true;
                setTimeout(() => { loginLocked = false; loginAttempts = 0; }, 60000);
                showToast('error', 'Akun Terkunci', 'Terlalu banyak percobaan. Akun dikunci 1 menit.');
            } else {
                showToast('error', 'Login Gagal', `NIP/NUPTK atau Password salah! (${5 - loginAttempts} percobaan tersisa)`);
            }
            return;
        }

        const doc   = snapshot.docs[0];
        currentGuru = { id: doc.id, ...doc.data() };

        if (currentGuru.status && currentGuru.status !== 'approved') {
            showToast('warning', 'Akun Pending', 'Akun Anda belum disetujui operator sekolah.');
            currentGuru = null;
            return;
        }

        loginAttempts = 0;

        // Session save — always save to localStorage for quick re-login,
        // also save session record to Firestore for cross-device awareness
        if (remember) {
            localStorage.setItem('portalGuruSession', JSON.stringify({
                ...currentGuru,
                loginAt: new Date().toISOString()
            }));
        }
        // Save session info to Firestore (cross-device)
        db.collection('sessions').doc(currentGuru.id).set({
            guruId:   currentGuru.id,
            nama:     currentGuru.nama,
            nip:      currentGuru.nip || nip,
            loginAt:  firebase.firestore.FieldValue.serverTimestamp(),
            device:   navigator.userAgent.substring(0, 100),
            remember: !!remember,
        }).catch(() => {});

        // Log login activity
        await db.collection('loginLog').add({
            guruId: currentGuru.id,
            nama:   currentGuru.nama,
            nip:    currentGuru.nip || nip,
            waktu:  firebase.firestore.FieldValue.serverTimestamp(),
            device: navigator.userAgent.substring(0, 100)
        }).catch(() => {}); // non-critical

        showToast('success', 'Berhasil Masuk!', `Selamat datang, ${currentGuru.nama?.split(' ')[0]}!`);
        setTimeout(() => enterPortal(), 800);

    } catch (err) {
        console.error('Login error:', err);
        showToast('error', 'Error Jaringan', 'Tidak dapat terhubung ke server. Periksa koneksi internet.');
    } finally {
        if (btn)     btn.disabled    = false;
        if (btnText) btnText.style.display = 'flex';
        if (btnLoad) btnLoad.style.display = 'none';
    }
});

// Enter key on NIP field
document.getElementById('loginNip')?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') document.getElementById('loginPassword')?.focus();
});

// ================================================================
// ENTER PORTAL
// ================================================================
function enterPortal() {
    document.getElementById('loginOverlay').style.display = 'none';
    document.getElementById('mainPortal').style.display   = 'flex';
    document.getElementById('bottomNav').style.display    = '';

    // Update UI with user info
    const name  = currentGuru?.nama  || 'Guru';
    const mapel = currentGuru?.mapel || 'Mata Pelajaran';
    const nip   = currentGuru?.nip   || currentGuru?.nuptk || '-';

    document.getElementById('spName').textContent      = name;
    document.getElementById('spRole').textContent      = mapel;
    document.getElementById('topbarName').textContent  = name;
    document.getElementById('topbarMapel').textContent = mapel;

    // Profile page pre-fill
    document.getElementById('pNama').value  = name;
    document.getElementById('pNip').value   = nip;
    document.getElementById('pNuptk').value = currentGuru?.nuptk || '';
    document.getElementById('pMapel').value = mapel;
    document.getElementById('pHp').value    = currentGuru?.hp    || '';
    document.getElementById('pEmail').value = currentGuru?.email || '';
    document.getElementById('profileName').textContent  = name;
    document.getElementById('profileMapel').textContent = mapel;

    // Restore avatar if saved in Firestore
    if (currentGuru?.photoBase64) {
        const src = currentGuru.photoBase64;
        document.getElementById('profileAvatarImg').innerHTML = `<img src="${src}" alt="foto">`;
        document.getElementById('spAvatar').innerHTML          = `<img src="${src}" alt="foto">`;
        document.getElementById('topbarAvatar').innerHTML      = `<img src="${src}" alt="foto">`;
    }

    initPortal();
    navigateTo('dashboard');
}

// ================================================================
// PORTAL INITIALIZATION
// ================================================================
function initPortal() {
    setupSidebar();
    setupNavigation();
    loadKalender();
    loadJadwal();
    updateTopbarClock();
    checkTodayAbsen();
    loadDashboardStats();
    loadActivityTimeline();
    loadDashboardPengumuman();
}

// ================================================================
// SIDEBAR LOGIC
// ================================================================
let sidebarCollapsed = false;
let sidebarMobileOpen = false;

function setupSidebar() {
    const sidebar    = document.getElementById('sidebar');
    const collapseBtn= document.getElementById('sidebarCollapseBtn');
    const hamburger  = document.getElementById('hamburgerBtn');

    // Overlay for mobile
    let overlay = document.getElementById('sidebarMobileOverlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'sidebarMobileOverlay';
        overlay.className = 'sidebar-overlay';
        document.getElementById('portalMain')?.before(overlay);
        overlay.addEventListener('click', closeMobileSidebar);
    }

    collapseBtn?.addEventListener('click', () => {
        sidebarCollapsed = !sidebarCollapsed;
        sidebar.classList.toggle('collapsed', sidebarCollapsed);
    });

    hamburger?.addEventListener('click', () => {
        if (sidebarMobileOpen) {
            closeMobileSidebar();
        } else {
            sidebar.classList.add('mobile-open');
            overlay.classList.add('visible');
            sidebarMobileOpen = true;
        }
    });
}

function closeMobileSidebar() {
    document.getElementById('sidebar')?.classList.remove('mobile-open');
    document.getElementById('sidebarMobileOverlay')?.classList.remove('visible');
    sidebarMobileOpen = false;
}

// ================================================================
// NAVIGATION
// ================================================================
function setupNavigation() {
    // Desktop nav
    document.querySelectorAll('.nav-item[data-page]').forEach(item => {
        item.addEventListener('click', () => {
            navigateTo(item.dataset.page);
            closeMobileSidebar();
        });
    });

    // Mobile bottom nav
    document.querySelectorAll('.bn-item[data-page]').forEach(item => {
        item.addEventListener('click', () => navigateTo(item.dataset.page));
    });

    // Dashboard quick buttons
    document.getElementById('goJadwalBtn')?.addEventListener('click', () => navigateTo('jadwal'));
    document.getElementById('goPengumumanBtn')?.addEventListener('click', () => navigateTo('pengumuman'));
}

function navigateTo(page) {
    // Hide all pages
    document.querySelectorAll('.page-content').forEach(p => p.style.display = 'none');
    // Show target
    const target = document.getElementById(`page-${page}`);
    if (target) { target.style.display = 'block'; target.classList.add('fade-in'); }

    // Update nav active
    document.querySelectorAll('.nav-item[data-page]').forEach(i => {
        i.classList.toggle('active', i.dataset.page === page);
    });
    document.querySelectorAll('.bn-item[data-page]').forEach(i => {
        i.classList.toggle('active', i.dataset.page === page);
    });

    // Breadcrumb
    const labels = {
        dashboard: '&#xf009; Dashboard',
        absensi:   '&#xf46d; Absensi',
        jadwal:    '&#xf017; Jam Mengajar',
        kalender:  '&#xf073; Kalender Pendidikan',
        profile:   '&#xf2bd; Profil Saya',
        laporan:   '&#xf080; Laporan Absensi',
        pengumuman:'&#xf0a1; Pengumuman',
    };
    const bc = document.getElementById('topbarBreadcrumb');
    if (bc) bc.innerHTML = labels[page] || page;

    currentPage = page;

    // Date updates
    const fullDate = new Date().toLocaleDateString('id-ID',{weekday:'long',day:'numeric',month:'long',year:'numeric'});
    ['absensiPageDate','jadwalPageDate'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.textContent = fullDate;
    });

    document.getElementById('dashboardFullDate').textContent = fullDate;
    document.getElementById('dashGreeting').textContent = `${getGreeting()}, ${currentGuru?.nama?.split(' ')[0] || 'Guru'}`;

    // Lazy loads
    if (page === 'absensi')   loadHistory();
    if (page === 'laporan')   initLaporan();
    if (page === 'pengumuman') loadPengumuman();
}

function getGreeting() {
    const h = new Date().getHours();
    if (h < 11) return 'Selamat Pagi';
    if (h < 15) return 'Selamat Siang';
    if (h < 18) return 'Selamat Sore';
    return 'Selamat Malam';
}

// ================================================================
// ABSENSI - STATUS SELECTION
// ================================================================
// Halaman Absensi
document.querySelectorAll('.status-opt').forEach(opt => {
    opt.addEventListener('click', () => {
        document.querySelectorAll('.status-opt').forEach(o => o.classList.remove('active'));
        opt.classList.add('active');
        selectedStatus = opt.dataset.status;

        const ket = document.getElementById('keteranganGroup');
        if (ket) ket.style.display = selectedStatus !== 'hadir' ? 'block' : 'none';
    });
});

// Quick absensi on dashboard
document.querySelectorAll('.qs-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.qs-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        quickSelectedStatus = btn.dataset.status;

        const form = document.getElementById('quickAbsensiForm');
        if (form) {
            form.style.display = 'block';
            form.classList.add('slide-up');
        }

        // If 'hadir', clear keterangan
        if (quickSelectedStatus === 'hadir') {
            const ket = document.getElementById('qsKeterangan');
            if (ket) ket.placeholder = 'Catatan (opsional)...';
        }
    });
});

// Quick absen submit
document.getElementById('btnQuickAbsen')?.addEventListener('click', async () => {
    if (!quickSelectedStatus) { showToast('warning','Pilih Status','Pilih status kehadiran terlebih dahulu!'); return; }
    const buktiUrl = document.getElementById('qsBuktiUrl')?.value.trim();
    if (!buktiUrl) { showToast('error','Link Diperlukan','Link Google Drive wajib diisi!'); return; }

    const keterangan = document.getElementById('qsKeterangan')?.value.trim() || '-';
    await submitAbsensi(quickSelectedStatus, keterangan, buktiUrl, document.getElementById('btnQuickAbsen'), 'quick');
});

// Full absensi form submit
document.getElementById('absensiForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!selectedStatus) { showToast('error','Pilih Status','Pilih status kehadiran!'); return; }

    const buktiUrl   = document.getElementById('buktiUrl')?.value.trim();
    const keterangan = document.getElementById('keterangan')?.value.trim() || '-';

    if (!buktiUrl) { showToast('error','Link Diperlukan','Link Google Drive wajib diisi!'); return; }
    if (selectedStatus !== 'hadir' && keterangan === '-') {
        showToast('error','Keterangan','Keterangan wajib diisi untuk status ini!'); return;
    }

    await submitAbsensi(selectedStatus, keterangan, buktiUrl, document.getElementById('absenBtn'), 'full');
});

/**
 * Submit absensi to Firestore
 */
async function submitAbsensi(status, keterangan, buktiUrl, btn, mode) {
    if (btn) { btn.disabled = true; btn.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i> Mengirim...'; }

    try {
        const now      = new Date();
        const todayStr = now.toISOString().split('T')[0];

        // Check duplicate
        const existing = await db.collection('absensiGuru')
            .where('guruId', '==', currentGuru.id)
            .where('tanggal', '==', todayStr)
            .get();

        if (!existing.empty) {
            showToast('warning','Sudah Absen','Anda sudah melakukan absensi hari ini!');
            return;
        }

        const jamAbsen = now.toLocaleTimeString('id-ID',{hour:'2-digit',minute:'2-digit'});
        const jamBatas = new Date(); jamBatas.setHours(7,0,0,0);
        const terlambat = status === 'hadir' && now > jamBatas;

        await db.collection('absensiGuru').add({
            guruId:    currentGuru.id,
            nama:      currentGuru.nama,
            nip:       currentGuru.nip  || '-',
            nuptk:     currentGuru.nuptk || '-',
            mapel:     currentGuru.mapel || '-',
            status,
            keterangan,
            buktiUrl,
            tanggal:   todayStr,
            jamAbsen,
            terlambat,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        });

        const msg = status === 'hadir'
            ? (terlambat ? `⚠️ Terlambat hadir pada ${jamAbsen}` : `✅ Hadir tepat waktu pada ${jamAbsen}`)
            : `Absen (${statusLabel(status)}) dikirim pada ${jamAbsen}`;

        showToast('success', 'Absensi Berhasil!', msg, 5000);

        // Reset forms
        if (mode === 'full') {
            document.getElementById('absensiForm')?.reset();
            document.querySelectorAll('.status-opt').forEach(o => o.classList.remove('active'));
            selectedStatus = '';
            document.getElementById('keteranganGroup').style.display = 'none';
        }
        if (mode === 'quick') {
            document.getElementById('quickAbsensiForm').style.display = 'none';
            document.getElementById('qsBuktiUrl').value = '';
            document.getElementById('qsKeterangan').value = '';
            document.querySelectorAll('.qs-btn').forEach(b => b.classList.remove('active'));
            quickSelectedStatus = '';

            const badge = document.getElementById('todayAbsenBadge');
            if (badge) { badge.textContent = 'Sudah Absen ✓'; badge.className = 'absen-status-badge sudah'; }
        }

        loadHistory();
        loadDashboardStats();
        loadActivityTimeline();

    } catch (err) {
        console.error('Absensi error:', err);
        showToast('error','Gagal','Terjadi kesalahan saat mengirim absensi. Coba lagi.');
    } finally {
        if (btn) {
            btn.disabled = false;
            btn.innerHTML = mode === 'full'
                ? '<i class="fas fa-paper-plane"></i><span>Kirim Absensi</span>'
                : '<i class="fas fa-paper-plane"></i> Kirim Absensi';
        }
    }
}

// Status label helper
function statusLabel(s) {
    const map = {
        hadir:              'Hadir',
        sakit:              'Sakit',
        izin:               'Izin',
        dispensasi_dinas:   'Dispensasi Dinas',
        dispensasi_sekolah: 'Dispensasi Sekolah',
    };
    return map[s] || s;
}

// Status icon helper
function statusIcon(s) {
    const map = {
        hadir:              'fa-check-circle',
        sakit:              'fa-notes-medical',
        izin:               'fa-envelope-open-text',
        dispensasi_dinas:   'fa-building',
        dispensasi_sekolah: 'fa-school',
    };
    return map[s] || 'fa-circle';
}

// ================================================================
// CHECK TODAY'S ABSEN
// ================================================================
async function checkTodayAbsen() {
    if (!currentGuru) return;
    const todayStr = new Date().toISOString().split('T')[0];
    try {
        const snap = await db.collection('absensiGuru')
            .where('guruId','==', currentGuru.id)
            .where('tanggal','==', todayStr)
            .get();

        const badge = document.getElementById('todayAbsenBadge');
        if (!snap.empty && badge) {
            badge.textContent = 'Sudah Absen ✓';
            badge.className   = 'absen-status-badge sudah';
        }
    } catch (e) {}
}

// ================================================================
// LOAD ABSENSI HISTORY
// ================================================================
async function loadHistory() {
    const container = document.getElementById('historyList');
    const countEl   = document.getElementById('riwayatCount');
    if (!container || !currentGuru) return;

    container.innerHTML = '<div class="skeleton" style="height:60px;margin:16px 20px;border-radius:12px;"></div>'.repeat(4);

    try {
        const snap = await db.collection('absensiGuru')
            .where('guruId','==', currentGuru.id)
            .orderBy('timestamp','desc')
            .limit(30)
            .get();

        if (snap.empty) {
            container.innerHTML = '<p class="empty-state">Belum ada riwayat absensi.</p>';
            if (countEl) countEl.textContent = '0 data';
            return;
        }

        if (countEl) countEl.textContent = `${snap.size} data`;

        container.innerHTML = '';
        snap.forEach(doc => {
            const d      = doc.data();
            const tgl    = d.timestamp?.toDate();
            const dateStr= tgl ? tgl.toLocaleDateString('id-ID',{weekday:'long',day:'numeric',month:'long',year:'numeric'}) : d.tanggal;
            const timeStr= tgl ? tgl.toLocaleTimeString('id-ID',{hour:'2-digit',minute:'2-digit'}) : '-';

            const item = document.createElement('div');
            item.className = 'riwayat-item fade-in';
            item.innerHTML = `
                <div class="riwayat-icon ${d.status}">
                    <i class="fas ${statusIcon(d.status)}"></i>
                </div>
                <div class="riwayat-info">
                    <div class="riwayat-date">${sanitize(dateStr)}</div>
                    <div class="riwayat-meta">
                        ${timeStr}
                        <span class="status-chip ${d.status}" style="margin-left:6px;">${statusLabel(d.status)}</span>
                        ${d.terlambat ? '<span style="color:#f59e0b;font-size:0.72rem;margin-left:4px;">⚠️ Terlambat</span>' : ''}
                    </div>
                    ${d.keterangan && d.keterangan !== '-' ? `<div class="riwayat-keterangan">${sanitize(d.keterangan)}</div>` : ''}
                </div>
                ${d.buktiUrl ? `<a href="${sanitize(d.buktiUrl)}" target="_blank" rel="noopener" class="riwayat-link"><i class="fab fa-google-drive"></i> Bukti</a>` : ''}
            `;
            container.appendChild(item);
        });
    } catch (e) {
        container.innerHTML = '<p class="empty-state">Gagal memuat riwayat. Periksa koneksi internet.</p>';
    }
}

// ================================================================
// DASHBOARD STATS
// ================================================================
async function loadDashboardStats() {
    if (!currentGuru) return;

    const now   = new Date();
    const year  = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2,'0');
    const prefix = `${year}-${month}`;

    try {
        const snap = await db.collection('absensiGuru')
            .where('guruId','==', currentGuru.id)
            .get();

        let hadir = 0, sakit = 0, izin = 0, thisMonth = 0, hadirMonth = 0;

        snap.forEach(doc => {
            const d = doc.data();
            if (d.status === 'hadir') hadir++;
            if (d.status === 'sakit') sakit++;
            if (d.status === 'izin')  izin++;
            if (d.tanggal?.startsWith(prefix)) {
                thisMonth++;
                if (d.status === 'hadir') hadirMonth++;
            }
        });

        document.getElementById('statHadir').textContent = hadir;
        document.getElementById('statSakit').textContent = sakit;
        document.getElementById('statIzin').textContent  = izin;
        document.getElementById('statPersen').textContent = thisMonth > 0
            ? `${Math.round((hadirMonth/thisMonth)*100)}%`
            : '-';
    } catch (e) {}
}

// ================================================================
// ACTIVITY TIMELINE
// ================================================================
async function loadActivityTimeline() {
    const container = document.getElementById('activityTimeline');
    if (!container || !currentGuru) return;

    try {
        const snap = await db.collection('absensiGuru')
            .where('guruId','==', currentGuru.id)
            .orderBy('timestamp','desc')
            .limit(5)
            .get();

        if (snap.empty) { container.innerHTML = '<p class="empty-state-mini">Belum ada aktivitas.</p>'; return; }

        container.innerHTML = '';
        snap.forEach(doc => {
            const d   = doc.data();
            const tgl = d.timestamp?.toDate();
            const item = document.createElement('div');
            item.className = 'at-item';
            item.innerHTML = `
                <div class="at-dot-wrap">
                    <div class="at-dot" style="background:${statusColor(d.status)}"></div>
                    <div class="at-line"></div>
                </div>
                <div class="at-content">
                    <div class="at-title">Absen ${statusLabel(d.status)}</div>
                    <div class="at-time">${tgl ? tgl.toLocaleDateString('id-ID',{day:'numeric',month:'short',year:'numeric'}) + ' · ' + tgl.toLocaleTimeString('id-ID',{hour:'2-digit',minute:'2-digit'}) : d.tanggal}</div>
                </div>
            `;
            container.appendChild(item);
        });

        // Also add login log entries
        const loginSnap = await db.collection('loginLog')
            .where('guruId','==', currentGuru.id)
            .orderBy('waktu','desc')
            .limit(2)
            .get();

        loginSnap.forEach(doc => {
            const d   = doc.data();
            const tgl = d.waktu?.toDate();
            const item = document.createElement('div');
            item.className = 'at-item';
            item.innerHTML = `
                <div class="at-dot-wrap">
                    <div class="at-dot" style="background:#3b82f6"></div>
                    <div class="at-line"></div>
                </div>
                <div class="at-content">
                    <div class="at-title">Login ke Portal</div>
                    <div class="at-time">${tgl ? tgl.toLocaleDateString('id-ID',{day:'numeric',month:'short',year:'numeric'}) + ' · ' + tgl.toLocaleTimeString('id-ID',{hour:'2-digit',minute:'2-digit'}) : '-'}</div>
                </div>
            `;
            container.appendChild(item);
        });

    } catch (e) {}
}

function statusColor(s) {
    const map = { hadir:'#10b981', sakit:'#ef4444', izin:'#f59e0b', dispensasi_dinas:'#3b82f6', dispensasi_sekolah:'#8b5cf6' };
    return map[s] || '#8da3c0';
}

// ================================================================
// TODAY'S JADWAL PREVIEW (dashboard)
// ================================================================
function loadJadwal() {
    const jadwal = [
        { time: '07:00–08:30', kelas: 'XII.3', mapel: currentGuru?.mapel || 'Mata Pelajaran' },
        { time: '08:30–10:00', kelas: 'XII.5', mapel: currentGuru?.mapel || 'Mata Pelajaran' },
        { time: '10:15–11:45', kelas: 'XI.2',  mapel: currentGuru?.mapel || 'Mata Pelajaran' },
        { time: '12:00–13:30', kelas: 'XI.4',  mapel: currentGuru?.mapel || 'Mata Pelajaran' },
        { time: '13:30–15:00', kelas: 'X.1',   mapel: currentGuru?.mapel || 'Mata Pelajaran' },
    ];

    // Dashboard preview (3 items)
    const dashContainer = document.getElementById('todayJadwalList');
    if (dashContainer) {
        dashContainer.innerHTML = '';
        const now = new Date();
        const currentMins = now.getHours() * 60 + now.getMinutes();

        jadwal.slice(0,3).forEach((j, i) => {
            const [startStr] = j.time.split('–');
            const [sh, sm] = startStr.split(':').map(Number);
            const startMins = sh * 60 + sm;
            const endMins   = startMins + 90;
            const isNow     = currentMins >= startMins && currentMins < endMins;
            const isDone    = currentMins >= endMins;

            const item = document.createElement('div');
            item.className = 'tj-item';
            item.innerHTML = `
                <div class="tj-dot ${isDone ? 'done' : ''}"></div>
                <div class="tj-time">${j.time}</div>
                <div>
                    <div class="tj-kelas">${j.kelas}</div>
                    <div class="tj-mapel">${j.mapel}</div>
                </div>
                ${isNow ? '<span style="margin-left:auto;font-size:0.68rem;font-weight:800;color:#10b981;">SEDANG</span>' : ''}
            `;
            dashContainer.appendChild(item);
        });
    }

    // Full jadwal page
    const jadwalContainer = document.getElementById('jadwalList');
    if (!jadwalContainer) return;
    jadwalContainer.innerHTML = '';

    const now = new Date();
    const currentMins = now.getHours() * 60 + now.getMinutes();

    jadwal.forEach((j, i) => {
        const [startStr, endStr] = j.time.split('–');
        const [sh, sm] = startStr.split(':').map(Number);
        const [eh, em] = endStr.split(':').map(Number);
        const startMins = sh * 60 + sm;
        const endMins   = eh * 60 + em;
        const isNow     = currentMins >= startMins && currentMins < endMins;
        const isDone    = jadwalChecked[i] || currentMins >= endMins;
        const isNext    = !isNow && !isDone && currentMins < startMins &&
                          jadwal.findIndex((x,ii) => {
                              const [s] = x.time.split('–');
                              const [sh2,sm2] = s.split(':').map(Number);
                              return (sh2*60+sm2) > currentMins && !jadwalChecked[ii];
                          }) === i;

        const item = document.createElement('div');
        item.className = `jadwal-item-premium ${isDone ? 'done' : ''} ${isNow ? 'active' : ''}`;
        item.innerHTML = `
            <div class="jp-time">${j.time}</div>
            <div class="jp-info">
                <div class="jp-kelas">${j.kelas}</div>
                <div class="jp-mapel">${j.mapel}</div>
            </div>
            ${isNow  ? '<span class="jp-label now">Sedang</span>' : ''}
            ${isNext ? '<span class="jp-label next">Selanjutnya</span>' : ''}
            ${isDone && !isNow ? '<span class="jp-label done">Selesai</span>' : ''}
            <div class="jp-check ${jadwalChecked[i] ? 'checked' : ''}" data-index="${i}">
                <i class="fas ${jadwalChecked[i] ? 'fa-check' : 'fa-circle'}"></i>
            </div>
        `;
        jadwalContainer.appendChild(item);

        item.querySelector('.jp-check').addEventListener('click', () => {
            jadwalChecked[i] = !jadwalChecked[i];
            loadJadwal();
        });
    });
}

// ================================================================
// KALENDER PENDIDIKAN
// ================================================================
const EVENTS = {
    // Format: "YYYY-MM-DD": { class, label }
    [`${new Date().getFullYear()}-06-01`]: { cls: 'blue',   label: 'Upacara' },
    [`${new Date().getFullYear()}-06-02`]: { cls: 'blue',   label: 'Rapat' },
    [`${new Date().getFullYear()}-06-17`]: { cls: 'red',    label: 'Libur' },
    [`${new Date().getFullYear()}-05-01`]: { cls: 'red',    label: 'Libur' },
    [`${new Date().getFullYear()}-06-10`]: { cls: 'yellow', label: 'PAT' },
    [`${new Date().getFullYear()}-06-11`]: { cls: 'yellow', label: 'PAT' },
    [`${new Date().getFullYear()}-06-12`]: { cls: 'yellow', label: 'PAT' },
    [`${new Date().getFullYear()}-06-13`]: { cls: 'yellow', label: 'PAT' },
    [`${new Date().getFullYear()}-06-24`]: { cls: 'green',  label: 'Libur' },
    [`${new Date().getFullYear()}-06-25`]: { cls: 'green',  label: 'Libur' },
    [`${new Date().getFullYear()}-06-26`]: { cls: 'green',  label: 'Libur' },
    [`${new Date().getFullYear()}-06-27`]: { cls: 'green',  label: 'Libur' },
    [`${new Date().getFullYear()}-06-28`]: { cls: 'green',  label: 'Libur' },
    [`${new Date().getFullYear()}-06-29`]: { cls: 'green',  label: 'Libur' },
    [`${new Date().getFullYear()}-06-30`]: { cls: 'green',  label: 'Libur' },
};

function loadKalender() {
    const grid    = document.getElementById('kalenderGrid');
    const title   = document.getElementById('kalenderMonthTitle');
    if (!grid) return;

    const today  = new Date();
    const month  = kalenderMonth;
    const year   = kalenderYear;

    const monthNames = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
    if (title) title.textContent = `${monthNames[month]} ${year}`;

    const daysInMonth = new Date(year, month+1, 0).getDate();
    const startDay    = new Date(year, month, 1).getDay(); // 0=Sun
    const dayNames    = ['Min','Sen','Sel','Rab','Kam','Jum','Sab'];

    let html = '<div class="kal-day-headers">';
    dayNames.forEach((d,i) => {
        html += `<div class="kal-day-header${i===0||i===6?' weekend':''}">${d}</div>`;
    });
    html += '</div><div class="kal-grid">';

    // Empty cells before first day
    for (let i = 0; i < startDay; i++) html += '<div class="kal-day empty"></div>';

    for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = `${year}-${String(month+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
        const event   = EVENTS[dateStr];
        const isToday = year===today.getFullYear() && month===today.getMonth() && day===today.getDate();
        const dayOfWeek = new Date(year, month, day).getDay();
        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

        html += `<div class="kal-day${isToday?' today':''}${event?' '+event.cls:''}${isWeekend&&!event?' weekend':''}">
            ${day}
            ${event ? `<span class="kal-event-label">${event.label}</span>` : ''}
        </div>`;
    }

    html += '</div>';
    grid.innerHTML = html;
}

// Kalender navigation
document.getElementById('kalPrev')?.addEventListener('click', () => {
    kalenderMonth--;
    if (kalenderMonth < 0) { kalenderMonth = 11; kalenderYear--; }
    loadKalender();
});
document.getElementById('kalNext')?.addEventListener('click', () => {
    kalenderMonth++;
    if (kalenderMonth > 11) { kalenderMonth = 0; kalenderYear++; }
    loadKalender();
});

// ================================================================
// LOGOUT
// ================================================================
document.getElementById('logoutBtn')?.addEventListener('click', () => {
    if (!confirm('Apakah Anda yakin ingin keluar dari portal?')) return;

    const logoutGuruId = currentGuru?.id;
    currentGuru = null;
    localStorage.removeItem('portalGuruSession');
    if (logoutGuruId) {
        db.collection('sessions').doc(logoutGuruId).delete().catch(() => {});
    }
    if (pengumumanUnsubscribe) { pengumumanUnsubscribe(); pengumumanUnsubscribe = null; }

    document.getElementById('mainPortal').style.display  = 'none';
    document.getElementById('bottomNav').style.display   = 'none';
    document.getElementById('loginOverlay').style.display = 'flex';

    // Reset form
    document.getElementById('loginForm')?.reset();
    showToast('info','Berhasil Keluar','Sesi Anda telah diakhiri.');
});

// ================================================================
// LUPA PASSWORD MODAL
// ================================================================
document.getElementById('forgotBtn')?.addEventListener('click', () => {
    document.getElementById('forgotModal').classList.add('open');
});
document.getElementById('forgotModalClose')?.addEventListener('click', () => {
    document.getElementById('forgotModal').classList.remove('open');
});
document.getElementById('forgotModal')?.addEventListener('click', (e) => {
    if (e.target === e.currentTarget) e.currentTarget.classList.remove('open');
});

document.getElementById('forgotForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const nip   = document.getElementById('forgotNip')?.value.trim();
    const nuptk = document.getElementById('forgotNuptk')?.value.trim();
    const nama  = document.getElementById('forgotNama')?.value.trim();

    if (!nip || !nuptk || !nama) { showToast('error','Lengkapi Data','Semua field wajib diisi!'); return; }
    if (nuptk.length < 16) { showToast('error','NUPTK Salah','NUPTK harus 16 digit!'); return; }

    const btn = e.target.querySelector('button');
    if (btn) { btn.disabled = true; btn.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i> Mengirim...'; }

    try {
        await db.collection('resetPasswordRequest').add({
            nip, nuptk, nama,
            status:    'pending',
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            alasan:    ''
        });

        document.getElementById('forgotModal').classList.remove('open');
        document.getElementById('forgotForm')?.reset();
        showToast('success','Permintaan Dikirim!',
            'Request reset password berhasil dikirim. Mohon tunggu operator menyetujui dalam waktu maksimal 1x24 jam.',
            7000);
    } catch (err) {
        showToast('error','Gagal','Terjadi kesalahan. Coba lagi.');
    } finally {
        if (btn) { btn.disabled = false; btn.innerHTML = '<i class="fas fa-paper-plane"></i> Kirim Permintaan Reset'; }
    }
});

// ================================================================
// CEK STATUS RESET PASSWORD MODAL
// ================================================================
document.getElementById('checkResetBtn')?.addEventListener('click', () => {
    document.getElementById('checkResetModal').classList.add('open');
});
document.getElementById('checkResetModalClose')?.addEventListener('click', () => {
    document.getElementById('checkResetModal').classList.remove('open');
});
document.getElementById('checkResetModal')?.addEventListener('click', (e) => {
    if (e.target === e.currentTarget) e.currentTarget.classList.remove('open');
});

document.getElementById('doCheckReset')?.addEventListener('click', async () => {
    const nip = document.getElementById('checkResetNip')?.value.trim();
    if (!nip) { showToast('error','Isi NIP','Masukkan NIP atau NUPTK terlebih dahulu!'); return; }

    const resultEl = document.getElementById('resetStatusResult');
    if (resultEl) resultEl.innerHTML = '<div class="skeleton" style="height:80px;border-radius:12px;"></div>';

    try {
        let snap = await db.collection('resetPasswordRequest')
            .where('nip','==', nip)
            .orderBy('createdAt','desc')
            .limit(1)
            .get();

        if (snap.empty) {
            snap = await db.collection('resetPasswordRequest')
                .where('nuptk','==', nip)
                .orderBy('createdAt','desc')
                .limit(1)
                .get();
        }

        if (snap.empty) {
            resultEl.innerHTML = `<div class="reset-status-card" style="background:var(--bg-glass-2);">
                <p style="color:var(--text-2);font-size:0.85rem;">Tidak ditemukan permintaan reset password untuk NIP/NUPTK ini.</p>
            </div>`;
            return;
        }

        const doc  = snap.docs[0];
        const data = doc.data();
        resetDocId = doc.id;

        const statusMap = {
            pending:    { cls: 'pending',    icon: 'fa-clock',         color: '#f59e0b', label: 'Menunggu Persetujuan' },
            processing: { cls: 'processing', icon: 'fa-spinner',       color: '#3b82f6', label: 'Sedang Diproses' },
            approved:   { cls: 'approved',   icon: 'fa-check-circle',  color: '#10b981', label: 'Disetujui' },
            rejected:   { cls: 'rejected',   icon: 'fa-times-circle',  color: '#ef4444', label: 'Ditolak' },
        };

        const s = statusMap[data.status] || statusMap.pending;

        let extraHTML = '';
        if (data.status === 'approved') {
            extraHTML = `
                <div style="margin-top:14px;padding-top:14px;border-top:1px solid var(--border);">
                    <p style="font-size:0.8rem;color:#10b981;font-weight:700;margin-bottom:10px;">
                        <i class="fas fa-exclamation-circle"></i> Segera reset password Anda sebelum link kedaluwarsa!
                    </p>
                    <button onclick="openResetPasswordModal()" class="btn-submit-modal green" style="margin-top:0;">
                        <i class="fas fa-key"></i> Reset Password Sekarang
                    </button>
                </div>
            `;
        }
        if (data.status === 'rejected') {
            extraHTML = `
                <div style="margin-top:12px;padding:12px;background:rgba(239,68,68,0.08);border-radius:10px;border:1px solid rgba(239,68,68,0.2);">
                    <p style="font-size:0.78rem;font-weight:700;color:#ef4444;margin-bottom:4px;"><i class="fas fa-comment-alt"></i> Alasan Penolakan:</p>
                    <p style="font-size:0.82rem;color:var(--text-2);">${sanitize(data.alasan || 'Tidak ada alasan yang diberikan.')}</p>
                </div>
                <button onclick="reajukanReset()" class="btn-submit-modal" style="margin-top:12px;background:rgba(245,158,11,0.2);color:#f59e0b;border:1px solid rgba(245,158,11,0.3);box-shadow:none;">
                    <i class="fas fa-redo"></i> Ajukan Ulang
                </button>
            `;
        }

        resultEl.innerHTML = `
            <div class="reset-status-card ${s.cls}">
                <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px;">
                    <i class="fas ${s.icon}" style="font-size:1.4rem;color:${s.color}"></i>
                    <div>
                        <div style="font-weight:800;font-size:0.92rem;color:var(--text-1);">Status: ${s.label}</div>
                        <div style="font-size:0.75rem;color:var(--text-2);">
                            Nama: ${sanitize(data.nama)} &nbsp;|&nbsp; NIP: ${sanitize(data.nip)}
                        </div>
                    </div>
                </div>
                ${extraHTML}
            </div>
        `;
    } catch (err) {
        if (resultEl) resultEl.innerHTML = '<p style="color:#ef4444;font-size:0.82rem;">Gagal memuat status. Coba lagi.</p>';
    }
});

function openResetPasswordModal() {
    document.getElementById('checkResetModal').classList.remove('open');
    document.getElementById('resetPasswordModal').classList.add('open');
    startCountdown(180); // 3 minutes
}
window.openResetPasswordModal = openResetPasswordModal;

function reajukanReset() {
    document.getElementById('checkResetModal').classList.remove('open');
    document.getElementById('forgotModal').classList.add('open');
}
window.reajukanReset = reajukanReset;

// ================================================================
// RESET PASSWORD MODAL
// ================================================================
document.getElementById('resetPasswordModalClose')?.addEventListener('click', () => {
    document.getElementById('resetPasswordModal').classList.remove('open');
    if (countdownInterval) clearInterval(countdownInterval);
});

document.getElementById('resetPasswordForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const newPass  = document.getElementById('newPassword')?.value;
    const confPass = document.getElementById('confirmPassword')?.value;

    if (newPass.length < 8) { showToast('error','Terlalu Pendek','Password minimal 8 karakter!'); return; }
    if (newPass !== confPass){ showToast('error','Tidak Cocok','Konfirmasi password tidak sesuai!'); return; }
    if (!resetDocId)         { showToast('error','Error','Sesi reset tidak valid.'); return; }

    const btn = e.target.querySelector('button');
    if (btn) { btn.disabled = true; btn.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i>'; }

    try {
        // Get the request doc to find the guru
        const reqDoc = await db.collection('resetPasswordRequest').doc(resetDocId).get();
        if (!reqDoc.exists) throw new Error('Request not found');

        const { nip, nuptk } = reqDoc.data();

        // Find the guru document
        let guruSnap = await db.collection('guru').where('nip','==', nip).get();
        if (guruSnap.empty) guruSnap = await db.collection('guru').where('nuptk','==', nuptk).get();

        if (!guruSnap.empty) {
            await guruSnap.docs[0].ref.update({ password: newPass });
        }

        // Mark request as completed
        await db.collection('resetPasswordRequest').doc(resetDocId).update({ status: 'completed' });

        if (countdownInterval) clearInterval(countdownInterval);
        document.getElementById('resetPasswordModal').classList.remove('open');
        showToast('success','Password Diperbarui!','Password baru Anda telah berhasil disimpan. Silakan login kembali.', 6000);
        resetDocId = null;
    } catch (err) {
        showToast('error','Gagal','Tidak dapat memperbarui password. Hubungi operator.');
    } finally {
        if (btn) { btn.disabled = false; btn.innerHTML = '<i class="fas fa-save"></i> Simpan Password Baru'; }
    }
});

// Countdown timer for reset link
function startCountdown(seconds) {
    if (countdownInterval) clearInterval(countdownInterval);
    let remaining = seconds;
    const total   = seconds;
    const circumference = 2 * Math.PI * 44; // r=44 from SVG

    function update() {
        const mins = Math.floor(remaining / 60);
        const secs = String(remaining % 60).padStart(2,'0');
        const display = document.getElementById('countdownDisplay');
        const label   = document.getElementById('countdownLabel');
        const circle  = document.getElementById('countdownCircle');

        if (display) display.textContent = `${mins}:${secs}`;
        if (label)   label.textContent   = `${mins} menit ${remaining%60} detik`;
        if (circle) {
            const offset = circumference * (1 - remaining/total);
            circle.style.strokeDashoffset = offset;
        }

        if (remaining <= 0) {
            clearInterval(countdownInterval);
            document.getElementById('resetPasswordModal').classList.remove('open');
            showToast('error','Link Kedaluwarsa','Waktu reset password telah habis. Ajukan permintaan baru.', 6000);
        }
        remaining--;
    }

    update();
    countdownInterval = setInterval(update, 1000);
}

// ================================================================
// PROFILE FORM
// ================================================================
document.getElementById('profileForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!currentGuru) return;

    const updates = {
        nama:  document.getElementById('pNama')?.value.trim(),
        nuptk: document.getElementById('pNuptk')?.value.trim(),
        mapel: document.getElementById('pMapel')?.value.trim(),
        hp:    document.getElementById('pHp')?.value.trim(),
        email: document.getElementById('pEmail')?.value.trim(),
    };

    const btn = e.target.querySelector('button[type=submit]');
    if (btn) { btn.disabled = true; btn.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i> Menyimpan...'; }

    try {
        await db.collection('guru').doc(currentGuru.id).update(updates);
        Object.assign(currentGuru, updates);

        // Update UI
        document.getElementById('profileName').textContent  = updates.nama || '-';
        document.getElementById('profileMapel').textContent = updates.mapel || '-';
        document.getElementById('spName').textContent       = updates.nama || '-';
        document.getElementById('spRole').textContent       = updates.mapel || '-';
        document.getElementById('topbarName').textContent   = updates.nama || '-';
        document.getElementById('topbarMapel').textContent  = updates.mapel || '-';

        // Update session
        const session = JSON.parse(localStorage.getItem('portalGuruSession') || '{}');
        if (session.id) {
            localStorage.setItem('portalGuruSession', JSON.stringify({ ...session, ...updates }));
        }

        showToast('success','Profil Diperbarui','Data profil Anda berhasil disimpan.');
    } catch (err) {
        showToast('error','Gagal','Tidak dapat menyimpan profil.');
    } finally {
        if (btn) { btn.disabled = false; btn.innerHTML = '<i class="fas fa-save"></i> Simpan Perubahan'; }
    }
});

// Profile photo upload
document.getElementById('avatarInput')?.addEventListener('change', function () {
    const file = this.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { showToast('error','File Salah','Pilih file gambar!'); return; }

    const reader = new FileReader();
    reader.onload = (e) => {
        const src    = e.target.result;
        const imgDiv = document.getElementById('profileAvatarImg');
        if (imgDiv) imgDiv.innerHTML = `<img src="${src}" alt="foto">`;

        // Update sidebar and topbar avatars
        document.getElementById('spAvatar').innerHTML      = `<img src="${src}" alt="foto">`;
        document.getElementById('topbarAvatar').innerHTML  = `<img src="${src}" alt="foto">`;

        // Save avatar to Firestore (note: base64 stored in Firestore for cross-device)
        if (currentGuru?.id) {
            db.collection('guru').doc(currentGuru.id).update({ photoBase64: src }).catch(() => {});
            currentGuru.photoBase64 = src;
            // Also update localStorage session if exists
            const session = JSON.parse(localStorage.getItem('portalGuruSession') || '{}');
            if (session.id) {
                localStorage.setItem('portalGuruSession', JSON.stringify({ ...session, photoBase64: src }));
            }
        }

        showToast('success','Foto Diperbarui','Foto profil berhasil diperbarui.');
    };
    reader.readAsDataURL(file);
});

// ================================================================
// PENGUMUMAN — Load from Firebase Firestore
// ================================================================
let pengumumanUnsubscribe = null;

function loadPengumuman() {
    const grid = document.getElementById('pengumumanGrid');
    if (!grid) return;

    // Unsubscribe previous listener
    if (pengumumanUnsubscribe) {
        pengumumanUnsubscribe();
        pengumumanUnsubscribe = null;
    }

    grid.innerHTML = '<div class="pengumuman-empty"><i class="fas fa-circle-notch fa-spin"></i><p>Memuat pengumuman...</p></div>';

    try {
        pengumumanUnsubscribe = db.collection('pengumuman')
            .orderBy('createdAt', 'desc')
            .onSnapshot((snap) => {
                if (snap.empty) {
                    grid.innerHTML = '<div class="pengumuman-empty"><i class="fas fa-bullhorn"></i><p>Belum ada pengumuman.</p></div>';
                    return;
                }

                grid.innerHTML = '';
                snap.forEach(doc => {
                    const d = doc.data();
                    const card = buildPengumumanCard(doc.id, d);
                    grid.appendChild(card);
                });

                // Update badge count
                const badge = document.getElementById('navBadgePengumuman');
                if (badge) badge.textContent = snap.size;

            }, (err) => {
                console.error('Pengumuman error:', err);
                grid.innerHTML = '<div class="pengumuman-empty"><i class="fas fa-exclamation-circle"></i><p>Gagal memuat pengumuman.</p></div>';
            });
    } catch(e) {
        grid.innerHTML = '<div class="pengumuman-empty"><i class="fas fa-exclamation-circle"></i><p>Gagal memuat pengumuman.</p></div>';
    }
}

function loadDashboardPengumuman() {
    const container = document.getElementById('dashAnnouncementList');
    if (!container) return;

    db.collection('pengumuman')
        .orderBy('createdAt', 'desc')
        .limit(4)
        .onSnapshot((snap) => {
            if (snap.empty) {
                container.innerHTML = '<p class="empty-state-mini">Belum ada pengumuman.</p>';
                return;
            }
            container.innerHTML = '';
            snap.forEach(doc => {
                const d = doc.data();
                const dotColor = d.kategori === 'penting' ? 'red' : d.kategori === 'kegiatan' ? 'blue' : 'green';
                const tgl = d.createdAt?.toDate
                    ? d.createdAt.toDate().toLocaleDateString('id-ID', {day:'numeric', month:'long', year:'numeric'})
                    : '-';
                const item = document.createElement('div');
                item.className = 'announcement-item' + (d.kategori === 'penting' ? ' pinned' : '');
                item.innerHTML = `
                    <div class="ann-dot ${dotColor}"></div>
                    <div class="ann-content">
                        <span class="ann-title">${sanitize(d.judul || '')}</span>
                        <span class="ann-date">${tgl}</span>
                    </div>
                    ${d.kategori === 'penting' ? '<span class="ann-pin"><i class="fas fa-thumbtack"></i></span>' : ''}
                `;
                item.addEventListener('click', () => navigateTo('pengumuman'));
                container.appendChild(item);
            });
        }, () => {
            container.innerHTML = '<p class="empty-state-mini">Gagal memuat pengumuman.</p>';
        });
}

/**
 * Build a pengumuman card with "Baca Selengkapnya" feature
 * Paragraf baru dipisah berdasarkan \n dalam konten
 */
function buildPengumumanCard(id, d) {
    const card = document.createElement('div');
    const isPenting = d.kategori === 'penting';
    card.className = 'pengumuman-card' + (isPenting ? ' pinned' : '');

    const badgeMap = {
        penting:  { cls: 'pin',   icon: 'fa-thumbtack',  label: 'Penting' },
        info:     { cls: 'info',  icon: 'fa-info-circle', label: 'Info' },
        kegiatan: { cls: 'event', icon: 'fa-star',        label: 'Kegiatan' },
    };
    const badge = badgeMap[d.kategori] || { cls: 'umum', icon: 'fa-bullhorn', label: 'Umum' };

    const tgl = d.createdAt?.toDate
        ? d.createdAt.toDate().toLocaleDateString('id-ID', {day:'numeric', month:'long', year:'numeric'})
        : '-';

    // Convert isi with newlines into separate <p> tags, no text-indent
    const isiParagraphs = (d.isi || '')
        .split(/\n+/)
        .filter(p => p.trim())
        .map(p => `<p>${sanitize(p.trim())}</p>`)
        .join('');

    card.innerHTML = `
        <div class="pengumuman-badge ${badge.cls}"><i class="fas ${badge.icon}"></i> ${badge.label}</div>
        <h4>${sanitize(d.judul || 'Tanpa Judul')}</h4>
        <div class="pengumuman-body collapsed" id="body-${id}">${isiParagraphs}</div>
        <button class="btn-baca-selengkapnya" id="btn-${id}">
            Baca Selengkapnya <i class="fas fa-chevron-down"></i>
        </button>
        <div class="pengumuman-footer">
            <span><i class="fas fa-calendar"></i> ${tgl}</span>
            <span><i class="fas fa-user-tie"></i> ${sanitize(d.pengirim || 'Operator Sekolah')}</span>
        </div>
    `;

    // Toggle baca selengkapnya
    const bodyEl = card.querySelector(`#body-${id}`);
    const btnEl  = card.querySelector(`#btn-${id}`);
    let expanded = false;

    // Check if content is short enough not to need expansion
    const checkOverflow = () => {
        // If content fits without clamp, hide button
        if (bodyEl.scrollHeight <= bodyEl.clientHeight + 2) {
            btnEl.style.display = 'none';
        }
    };
    setTimeout(checkOverflow, 100);

    btnEl.addEventListener('click', () => {
        expanded = !expanded;
        bodyEl.classList.toggle('collapsed', !expanded);
        btnEl.innerHTML = expanded
            ? 'Tutup <i class="fas fa-chevron-up"></i>'
            : 'Baca Selengkapnya <i class="fas fa-chevron-down"></i>';
    });

    return card;
}

// ================================================================
// LAPORAN ABSENSI
// ================================================================
function initLaporan() {
    // Set defaults
    const now = new Date();
    const bulanEl = document.getElementById('laporanBulan');
    const tahunEl = document.getElementById('laporanTahun');
    if (bulanEl) bulanEl.value = now.getMonth();
    if (tahunEl) tahunEl.value = now.getFullYear();
}

document.getElementById('btnLoadLaporan')?.addEventListener('click', loadLaporan);

async function loadLaporan() {
    if (!currentGuru) return;

    const bulan = parseInt(document.getElementById('laporanBulan')?.value);
    const tahun = parseInt(document.getElementById('laporanTahun')?.value);
    const prefix = `${tahun}-${String(bulan+1).padStart(2,'0')}`;

    const tbody   = document.getElementById('laporanTableBody');
    const summary = document.getElementById('laporanSummary');

    if (tbody) tbody.innerHTML = '<tr><td colspan="7" class="empty-state"><i class="fas fa-circle-notch fa-spin"></i> Memuat data...</td></tr>';

    try {
        const snap = await db.collection('absensiGuru')
            .where('guruId','==', currentGuru.id)
            .get();

        const filtered = snap.docs
            .map(d => d.data())
            .filter(d => d.tanggal?.startsWith(prefix))
            .sort((a,b) => a.tanggal.localeCompare(b.tanggal));

        // Stats
        const stats = { hadir:0, sakit:0, izin:0, dispensasi:0 };
        filtered.forEach(d => {
            if (d.status === 'hadir') stats.hadir++;
            else if (d.status === 'sakit') stats.sakit++;
            else if (d.status === 'izin') stats.izin++;
            else stats.dispensasi++;
        });

        if (summary) {
            summary.innerHTML = `
                <div class="ls-card"><span class="ls-val">${filtered.length}</span><span class="ls-label">Total Data</span></div>
                <div class="ls-card"><span class="ls-val" style="color:#10b981;">${stats.hadir}</span><span class="ls-label">Hadir</span></div>
                <div class="ls-card"><span class="ls-val" style="color:#ef4444;">${stats.sakit}</span><span class="ls-label">Sakit</span></div>
                <div class="ls-card"><span class="ls-val" style="color:#f59e0b;">${stats.izin + stats.dispensasi}</span><span class="ls-label">Izin/Dispensasi</span></div>
            `;
        }

        if (filtered.length === 0) {
            if (tbody) tbody.innerHTML = '<tr><td colspan="7" class="empty-state">Tidak ada data untuk bulan ini.</td></tr>';
            return;
        }

        if (tbody) {
            tbody.innerHTML = '';
            filtered.forEach((d,i) => {
                const tgl = new Date(d.tanggal + 'T00:00:00');
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${i+1}</td>
                    <td>${d.tanggal}</td>
                    <td>${tgl.toLocaleDateString('id-ID',{weekday:'long'})}</td>
                    <td><span class="status-chip ${d.status}">${statusLabel(d.status)}</span></td>
                    <td>${d.jamAbsen || '-'}</td>
                    <td>${sanitize(d.keterangan !== '-' ? d.keterangan : '')}</td>
                    <td>${d.buktiUrl ? `<a href="${sanitize(d.buktiUrl)}" target="_blank" style="color:var(--blue-500);font-size:0.78rem;"><i class="fab fa-google-drive"></i> Lihat</a>` : '-'}</td>
                `;
                tbody.appendChild(row);
            });
        }
    } catch (err) {
        if (tbody) tbody.innerHTML = '<tr><td colspan="7" class="empty-state">Gagal memuat data.</td></tr>';
    }
}

// Download PDF (basic print)
document.getElementById('downloadPdfBtn')?.addEventListener('click', () => {
    window.print();
});

// ================================================================
// SESSION AUTO-LOGIN
// ================================================================
(function checkSession() {
    try {
        const saved = localStorage.getItem('portalGuruSession');
        if (!saved) return;

        const session = JSON.parse(saved);
        const loginAt = new Date(session.loginAt);
        const now     = new Date();
        const diffHrs = (now - loginAt) / (1000 * 60 * 60);

        if (diffHrs < 24 && session.id) {
            currentGuru = session;
            enterPortal();
        } else {
            localStorage.removeItem('portalGuruSession');
        }
    } catch (e) {
        localStorage.removeItem('portalGuruSession');
    }
})();

// ================================================================
// SESSION TIMEOUT (auto logout after 8 hours of inactivity)
// ================================================================
let lastActivity = Date.now();
const SESSION_TIMEOUT = 8 * 60 * 60 * 1000; // 8 hours

document.addEventListener('mousemove', () => { lastActivity = Date.now(); });
document.addEventListener('keydown',   () => { lastActivity = Date.now(); });
document.addEventListener('touchstart',() => { lastActivity = Date.now(); });

setInterval(() => {
    if (currentGuru && Date.now() - lastActivity > SESSION_TIMEOUT) {
        currentGuru = null;
        localStorage.removeItem('portalGuruSession');
        document.getElementById('mainPortal').style.display   = 'none';
        document.getElementById('bottomNav').style.display    = 'none';
        document.getElementById('loginOverlay').style.display = 'flex';
        showToast('warning','Sesi Berakhir','Anda telah dikeluarkan karena tidak aktif selama 8 jam.');
    }
}, 60000);

console.log('%c✅ Portal Guru SMAN 68 Jakarta — v2.0', 'color:#006633;font-weight:800;font-size:14px;');
console.log('%cDesain Premium Glassmorphism 2026', 'color:#0288d1;font-size:11px;');
