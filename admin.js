/* ============================================================
   SMAN 68 JAKARTA — SUPER PREMIUM ADMIN PANEL JS
   Firebase Auth + Firestore + Storage
   ============================================================ */

'use strict';

// ============================================================
// FIREBASE CONFIGURATION
// ============================================================
const firebaseConfig = {
    apiKey: "AIzaSyDAcKcg3alPOTH3FFGelYmsW7jcMMe2PLI",
    authDomain: "upnvjdatsystem.firebaseapp.com",
    databaseURL: "https://upnvjdatsystem-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "upnvjdatsystem",
    storageBucket: "upnvjdatsystem.firebasestorage.app",
    messagingSenderId: "57095309946",
    appId: "1:57095309946:web:b0e9f3f86380d549ffc9c3"
};

firebase.initializeApp(firebaseConfig);
const auth    = firebase.auth();
const db      = firebase.firestore();
const storage = firebase.storage();

// ============================================================
// GLOBAL STATE
// ============================================================
let currentUser           = null;
let currentPage           = 'dashboard';
let activeChatSession     = null;
let activeChatSubscriptions = {};
let notifications         = [];
let maintenanceTimer      = null;
let announcementTimer     = null;

// PTN List
const ptnList = [
    { name: 'UI',     fullName: 'Universitas Indonesia' },
    { name: 'UGM',   fullName: 'Universitas Gadjah Mada' },
    { name: 'ITB',   fullName: 'Institut Teknologi Bandung' },
    { name: 'UNAIR', fullName: 'Universitas Airlangga' },
    { name: 'IPB',   fullName: 'Institut Pertanian Bogor' },
    { name: 'UNDIP', fullName: 'Universitas Diponegoro' },
    { name: 'UNPAD', fullName: 'Universitas Padjadjaran' },
    { name: 'UB',    fullName: 'Universitas Brawijaya' },
    { name: 'ITS',   fullName: 'Institut Teknologi Sepuluh Nopember' },
    { name: 'UNJ',   fullName: 'Universitas Negeri Jakarta' },
    { name: 'UPNVJ', fullName: 'UPN Veteran Jakarta' },
    { name: 'UNAND', fullName: 'Universitas Andalas' },
    { name: 'UNHAS', fullName: 'Universitas Hasanuddin' },
    { name: 'UPNVYK',fullName: 'UPN Veteran Yogyakarta' },
    { name: 'PNJ',   fullName: 'Politeknik Negeri Jakarta' }
];

// ============================================================
// DOM SHORTCUTS
// ============================================================
const $ = (id) => document.getElementById(id);
const preloader       = $('preloader');
const loginOverlay    = $('loginOverlay');
const adminPanel      = $('adminPanel');
const loginForm       = $('loginForm');
const logoutBtn       = $('logoutBtn');
const sidebarToggle   = $('sidebarToggle');
const sidebarClose    = $('sidebarClose');
const sidebarOverlay  = $('sidebarOverlay');
const sidebar         = $('sidebar');
const pageContainer   = $('pageContainer');
const pageTitle       = $('pageTitle');
const adminNameEl     = $('adminName');
const adminEmailEl    = $('adminEmail');
const notifBell       = $('notificationBell');
const notifCount      = $('notificationCount');
const notifList       = $('notificationList');
const clearNotifBtn   = $('clearNotifications');
const datetimeEl      = $('datetime');
const toastStack      = $('toastStack');
const modalOverlay    = $('modalOverlay');
const modalContainer  = $('modalContainer');
const togglePassword  = $('togglePassword');

// ============================================================
// AUTH STATE LISTENER
// ============================================================
auth.onAuthStateChanged(async (user) => {
    setTimeout(() => preloader?.classList.add('hide'), 800);

    if (user) {
        try {
            const adminDoc = await db.collection('admins').doc(user.uid).get();
            if (adminDoc.exists) {
                currentUser = { uid: user.uid, ...adminDoc.data(), email: user.email };
                showAdminPanel();
            } else {
                await auth.signOut();
                showLoginView();
                showToast('Akun tidak memiliki akses admin.', 'error');
            }
        } catch (err) {
            showLoginView();
            showToast('Gagal memverifikasi akses.', 'error');
        }
    } else {
        showLoginView();
    }
});

// ============================================================
// LOGIN
// ============================================================
loginForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email    = $('loginEmail').value.trim();
    const password = $('loginPassword').value;
    const btnText  = loginForm.querySelector('.btn-login-text');
    const btnLoad  = loginForm.querySelector('.btn-login-loading');
    const btn      = $('loginBtn');

    btn.disabled = true;
    btnText.style.display = 'none';
    btnLoad.style.display = 'inline-flex';

    try {
        const cred = await auth.signInWithEmailAndPassword(email, password);
        const adminDoc = await db.collection('admins').doc(cred.user.uid).get();
        if (!adminDoc.exists) {
            await auth.signOut();
            throw new Error('not-admin');
        }
        showToast('Berhasil masuk! Selamat datang.', 'success');
    } catch (err) {
        let msg = 'Email atau password salah.';
        if (err.message === 'not-admin') msg = 'Akun ini bukan admin.';
        showToast(msg, 'error');
        btn.disabled = false;
        btnText.style.display = 'inline-flex';
        btnLoad.style.display = 'none';
    }
});

// Toggle password visibility
togglePassword?.addEventListener('click', () => {
    const input = $('loginPassword');
    const icon  = togglePassword.querySelector('i');
    if (input.type === 'password') {
        input.type = 'text';
        icon.className = 'fas fa-eye-slash';
    } else {
        input.type = 'password';
        icon.className = 'fas fa-eye';
    }
});

// ============================================================
// SHOW / HIDE VIEWS
// ============================================================
function showLoginView() {
    if (loginOverlay) loginOverlay.style.display = 'flex';
    if (adminPanel)   adminPanel.style.display   = 'none';
}

function showAdminPanel() {
    if (loginOverlay) loginOverlay.style.display = 'none';
    if (adminPanel)   adminPanel.style.display   = 'flex';

    // Set user info
    const name = currentUser.name || currentUser.displayName || 'Admin';
    const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    if (adminNameEl)  adminNameEl.textContent  = name;
    if (adminEmailEl) adminEmailEl.textContent = currentUser.email;

    const avatarEl = $('userAvatarInitials');
    const topbarAv = $('topbarAvatarInitials');
    if (avatarEl) avatarEl.textContent  = initials;
    if (topbarAv) topbarAv.textContent  = initials;

    initializeAdmin();
}

// ============================================================
// INITIALIZE
// ============================================================
function initializeAdmin() {
    updateDateTime();
    setInterval(updateDateTime, 1000);
    setupNavigation();
    setupSidebar();
    setupNotifications();
    setupRealtimeListeners();
    setupGlobalChatListener();
    loadDashboard();
}

// ============================================================
// DATE/TIME
// ============================================================
function updateDateTime() {
    if (!datetimeEl) return;
    const now = new Date();
    const opts = { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' };
    datetimeEl.innerHTML = `<i class="fas fa-clock"></i> ${now.toLocaleDateString('id-ID', opts)}`;
}

// ============================================================
// NAVIGATION
// ============================================================
function setupNavigation() {
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const page = item.dataset.page;
            document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
            item.classList.add('active');
            loadPage(page);
            // Close sidebar on mobile
            if (window.innerWidth <= 1024) closeSidebar();
        });
    });

    logoutBtn?.addEventListener('click', async () => {
        if (!confirm('Yakin ingin keluar?')) return;
        try {
            Object.values(activeChatSubscriptions).forEach(u => typeof u === 'function' && u());
            activeChatSubscriptions = {};
            await auth.signOut();
            showToast('Berhasil logout.', 'success');
        } catch { showToast('Gagal logout.', 'error'); }
    });
}

// ============================================================
// SIDEBAR (mobile toggle)
// ============================================================
function setupSidebar() {
    sidebarToggle?.addEventListener('click', () => {
        const isOpen = sidebar?.classList.contains('open');
        if (isOpen) closeSidebar();
        else openSidebar();
    });
    sidebarClose?.addEventListener('click', closeSidebar);
    sidebarOverlay?.addEventListener('click', closeSidebar);
}
function openSidebar() {
    sidebar?.classList.add('open');
    sidebarOverlay?.classList.add('active');
    sidebarToggle?.classList.add('open');
}
function closeSidebar() {
    sidebar?.classList.remove('open');
    sidebarOverlay?.classList.remove('active');
    sidebarToggle?.classList.remove('open');
}

// ============================================================
// PAGE ROUTER
// ============================================================
function loadPage(page) {
    currentPage = page;
    const titles = {
        dashboard: 'Dashboard',
        chat: 'Live Chat Operator',
        news: 'Manajemen Berita',
        agenda: 'Manajemen Agenda',
        gallery: 'Manajemen Galeri',
        facilities: 'Manajemen Fasilitas',
        testimonials: 'Manajemen Testimoni',
        alumni: 'Data Alumni PTN',
        feedbacks: 'Kritik & Saran',
        announcements: 'Floating Announcement',
        maintenance: 'Mode Maintenance',
        settings: 'Pengaturan Sistem'
    };
    if (pageTitle) pageTitle.textContent = titles[page] || page;

    switch (page) {
        case 'dashboard':     loadDashboard();      break;
        case 'chat':          loadChatPage();        break;
        case 'news':          loadNewsPage();         break;
        case 'agenda':        loadAgendaPage();       break;
        case 'gallery':       loadGalleryPage();      break;
        case 'facilities':    loadFacilitiesPage();   break;
        case 'testimonials':  loadTestimonialsPage(); break;
        case 'alumni':        loadAlumniPage();       break;
        case 'feedbacks':     loadFeedbacksPage();    break;
        case 'announcements': loadAnnouncementsPage();break;
        case 'maintenance':   loadMaintenancePage();  break;
        case 'settings':      loadSettingsPage();     break;
    }
}

// ============================================================
// DASHBOARD
// ============================================================
async function loadDashboard() {
    pageContainer.innerHTML = renderSkeletonDashboard();

    try {
        const [newsSnap, agendaSnap, gallerySnap, facilitySnap, pendingFB, activeChats, testimonialSnap, alumniSnap] = await Promise.all([
            db.collection('news').get(),
            db.collection('agenda').get(),
            db.collection('gallery').get(),
            db.collection('facilities').get(),
            db.collection('feedbacks').where('status', '==', 'pending').get(),
            db.collection('chatSessions').where('status', '==', 'active').get(),
            db.collection('testimonials').get(),
            db.collection('alumni').get()
        ]);

        // Firebase status
        const maintDoc = await db.collection('settings').doc('maintenance').get();
        const maintData = maintDoc.exists ? maintDoc.data() : {};
        const maintActive = maintData.active || false;

        const announceDoc = await db.collection('settings').doc('announcements').get();
        let announcementCount = 0;
        if (announceDoc.exists) {
            const list = announceDoc.data().list || [];
            announcementCount = list.filter(a => a.active).length;
        }

        const chatStatusDoc = await db.collection('settings').doc('chatStatus').get();
        const chatOnline = chatStatusDoc.exists ? chatStatusDoc.data().isOnline !== false : true;

        pageContainer.innerHTML = `
        <div class="fade-in">
            <!-- Stats Grid -->
            <div class="stats-grid stagger">
                ${statCard('green','fas fa-newspaper', newsSnap.size, 'Total Berita')}
                ${statCard('blue','fas fa-calendar-days', agendaSnap.size, 'Total Agenda')}
                ${statCard('orange','fas fa-images', gallerySnap.size, 'Total Galeri')}
                ${statCard('purple','fas fa-building', facilitySnap.size, 'Total Fasilitas')}
                ${statCard('red','fas fa-comments', activeChats.size, 'Chat Aktif')}
                ${statCard('teal','fas fa-envelope-open-text', pendingFB.size, 'Pesan Menunggu')}
            </div>

            <!-- System Status Row -->
            <div class="status-cards stagger" style="margin-bottom:28px;">
                ${statusCard(chatOnline, 'Live Chat', chatOnline ? 'Online' : 'Offline')}
                ${statusCard(!maintActive, 'Website', maintActive ? 'Maintenance' : 'Normal')}
                ${statusCard(announcementCount > 0, 'Pengumuman', announcementCount + ' Aktif', 'yellow')}
                ${statusCard(true, 'Firebase', 'Connected', 'green')}
            </div>

            <!-- Main Grid -->
            <div class="dash-grid">
                <!-- Chart -->
                <div class="card slide-up">
                    <div class="card-header">
                        <span class="card-title"><i class="fas fa-chart-bar"></i> Statistik Konten</span>
                        <span class="badge-pill blue">Realtime</span>
                    </div>
                    <div class="card-body">
                        <div class="chart-wrap">
                            <canvas id="contentChart"></canvas>
                        </div>
                    </div>
                </div>

                <!-- Quick Actions -->
                <div class="card slide-up">
                    <div class="card-header">
                        <span class="card-title"><i class="fas fa-bolt"></i> Aksi Cepat</span>
                    </div>
                    <div class="card-body">
                        <div class="quick-actions">
                            <button class="quick-action-btn" onclick="navigateTo('news')">
                                <i class="fas fa-newspaper"></i><span>Berita</span>
                            </button>
                            <button class="quick-action-btn" onclick="navigateTo('agenda')">
                                <i class="fas fa-calendar-plus"></i><span>Agenda</span>
                            </button>
                            <button class="quick-action-btn" onclick="navigateTo('gallery')">
                                <i class="fas fa-images"></i><span>Galeri</span>
                            </button>
                            <button class="quick-action-btn" onclick="navigateTo('chat')">
                                <i class="fas fa-comments"></i><span>Live Chat</span>
                            </button>
                            <button class="quick-action-btn" onclick="navigateTo('announcements')">
                                <i class="fas fa-bullhorn"></i><span>Pengumuman</span>
                            </button>
                            <button class="quick-action-btn" onclick="navigateTo('maintenance')">
                                <i class="fas fa-screwdriver-wrench"></i><span>Maintenance</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>`;

        // Init chart
        initContentChart({
            news: newsSnap.size,
            agenda: agendaSnap.size,
            gallery: gallerySnap.size,
            facilities: facilitySnap.size,
            testimonials: testimonialSnap.size,
            alumni: alumniSnap.size
        });

    } catch (err) {
        console.error(err);
        pageContainer.innerHTML = emptyState('fas fa-exclamation-triangle', 'Gagal Memuat Dashboard', 'Periksa koneksi internet Anda.');
    }
}

function statCard(color, icon, value, label) {
    return `<div class="stat-card slide-up">
        <div class="stat-icon ${color}"><i class="${icon}"></i></div>
        <div class="stat-info"><h3>${value}</h3><p>${label}</p></div>
    </div>`;
}

function statusCard(isGood, label, value, forceColor) {
    const color = forceColor || (isGood ? 'green' : 'red');
    return `<div class="status-card">
        <div class="status-indicator ${color}"></div>
        <div class="status-card-info"><p>${label}</p><strong>${value}</strong></div>
    </div>`;
}

function renderSkeletonDashboard() {
    let grid = '';
    for (let i = 0; i < 6; i++) {
        grid += `<div class="skeleton-card"><div class="skeleton skeleton-icon"></div><div style="flex:1;"><div class="skeleton skeleton-line-lg"></div><div class="skeleton skeleton-line-sm"></div></div></div>`;
    }
    return `<div class="stats-grid">${grid}</div>`;
}

function initContentChart(data) {
    const canvas = document.getElementById('contentChart');
    if (!canvas) return;
    new Chart(canvas, {
        type: 'bar',
        data: {
            labels: ['Berita', 'Agenda', 'Galeri', 'Fasilitas', 'Testimoni', 'Alumni'],
            datasets: [{
                label: 'Jumlah',
                data: [data.news, data.agenda, data.gallery, data.facilities, data.testimonials, data.alumni],
                backgroundColor: [
                    'rgba(5,150,105,0.75)',
                    'rgba(37,99,235,0.75)',
                    'rgba(234,88,12,0.75)',
                    'rgba(147,51,234,0.75)',
                    'rgba(245,158,11,0.75)',
                    'rgba(6,182,212,0.75)'
                ],
                borderRadius: 8,
                borderSkipped: false,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.05)' }, ticks: { font: { family: 'Poppins', size: 11 } } },
                x: { grid: { display: false }, ticks: { font: { family: 'Poppins', size: 11 } } }
            }
        }
    });
}

function navigateTo(page) {
    document.querySelectorAll('.nav-item').forEach(n => {
        if (n.dataset.page === page) n.classList.add('active');
        else n.classList.remove('active');
    });
    loadPage(page);
}

// ============================================================
// LIVE CHAT PAGE
// ============================================================
function loadChatPage() {
    pageContainer.innerHTML = `
    <div class="chat-layout fade-in">
        <!-- Sessions Panel -->
        <div class="chat-sessions-panel">
            <div class="chat-sessions-head">
                <h3>Sesi Chat</h3>
                <div class="chat-status-row">
                    <button class="status-toggle" id="toggleOnlineBtn">Loading...</button>
                </div>
            </div>
            <div class="chat-search">
                <i class="fas fa-magnifying-glass"></i>
                <input type="text" placeholder="Cari pengguna..." id="chatSearchInput">
            </div>
            <div class="chat-sessions-list" id="chatSessionsList">
                <div class="loading-spinner"><div class="spin-ring"></div></div>
            </div>
        </div>

        <!-- Chat Window -->
        <div class="chat-window-area">
            <div class="chat-window-head">
                <div class="chat-user-info" id="chatUserInfo">
                    <div class="session-avatar" style="background:var(--gray-200);color:var(--gray-400);">
                        <i class="fas fa-user"></i>
                    </div>
                    <div><h4>Pilih sesi chat</h4><p>Klik dari daftar di samping</p></div>
                </div>
                <button class="btn btn-sm btn-danger" id="endChatBtn" disabled>
                    <i class="fas fa-xmark"></i> Akhiri
                </button>
            </div>

            <div class="chat-messages" id="chatMessages">
                <div class="empty-state">
                    <div class="empty-state-icon"><i class="fas fa-comments"></i></div>
                    <h4>Belum ada chat dipilih</h4>
                    <p>Pilih sesi dari panel kiri untuk mulai membalas</p>
                </div>
            </div>

            <div class="chat-input-row">
                <input type="text" id="chatMessageInput" placeholder="Ketik pesan..." disabled>
                <button class="chat-send-btn" id="sendChatMessageBtn" disabled>
                    <i class="fas fa-paper-plane"></i>
                </button>
            </div>
        </div>
    </div>`;

    loadChatSessions();
    setupChatListeners();
    loadChatSettings();
}

function loadChatSessions() {
    const container = $('chatSessionsList');
    db.collection('chatSessions')
        .where('status', '==', 'active')
        .orderBy('startedAt', 'desc')
        .onSnapshot((snap) => {
            if (!container) return;
            if (snap.empty) {
                container.innerHTML = `<div class="empty-state" style="padding:30px 20px;">
                    <div class="empty-state-icon"><i class="fas fa-comments"></i></div>
                    <p>Tidak ada chat aktif</p>
                </div>`;
                return;
            }
            container.innerHTML = '';
            snap.forEach(doc => container.appendChild(buildSessionItem(doc.id, doc.data())));
        }, () => {
            if (container) container.innerHTML = `<div class="empty-state"><p>Gagal memuat sesi</p></div>`;
        });
}

function buildSessionItem(sessionId, data) {
    const div = document.createElement('div');
    div.className = 'chat-session-item';
    div.dataset.sessionId = sessionId;
    const initials = (data.userName || 'U').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    const time = data.startedAt ? new Date(data.startedAt.toDate()).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '';
    div.innerHTML = `
        <div class="session-avatar">${initials}</div>
        <div class="session-info">
            <h4>${escHtml(data.userName || 'Pengguna')}</h4>
            <p>${escHtml(data.userStatus || '')} • ${time}</p>
        </div>
        <span class="session-status"></span>`;
    div.addEventListener('click', () => selectChatSession(sessionId, data));
    return div;
}

function selectChatSession(sessionId, data) {
    if (activeChatSubscriptions[activeChatSession]) {
        activeChatSubscriptions[activeChatSession]();
        delete activeChatSubscriptions[activeChatSession];
    }
    activeChatSession = sessionId;

    document.querySelectorAll('.chat-session-item').forEach(el => el.classList.remove('active'));
    document.querySelector(`[data-session-id="${sessionId}"]`)?.classList.add('active');

    const initials = (data.userName || 'U').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    $('chatUserInfo').innerHTML = `
        <div class="session-avatar">${initials}</div>
        <div><h4>${escHtml(data.userName || 'Pengguna')}</h4><p>${escHtml(data.userPhone || '')} • ${escHtml(data.userStatus || '')}</p></div>`;

    $('chatMessageInput').disabled = false;
    $('sendChatMessageBtn').disabled = false;
    $('endChatBtn').disabled = false;

    loadChatMessages(sessionId);
}

function loadChatMessages(sessionId) {
    const container = $('chatMessages');
    container.innerHTML = `<div class="loading-spinner"><div class="spin-ring"></div></div>`;

    const unsub = db.collection('chatSessions').doc(sessionId)
        .collection('messages').orderBy('timestamp', 'asc')
        .onSnapshot((snap) => {
            container.innerHTML = '';
            if (snap.empty) {
                container.innerHTML = `<div class="empty-state"><div class="empty-state-icon"><i class="fas fa-comment"></i></div><p>Belum ada pesan</p></div>`;
                return;
            }
            snap.forEach(doc => container.appendChild(buildChatMessage(doc.data())));
            container.scrollTop = container.scrollHeight;
        });
    activeChatSubscriptions[sessionId] = unsub;
}

function buildChatMessage(data) {
    const div = document.createElement('div');
    div.className = `chat-message ${data.sender}`;
    const time = data.timestamp ? new Date(data.timestamp.toDate()).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '';
    div.innerHTML = `<div class="message-bubble">${escHtml(data.message)}<div class="message-time">${time}</div></div>`;
    return div;
}

function setupChatListeners() {
    const sendBtn = $('sendChatMessageBtn');
    const endBtn  = $('endChatBtn');
    const toggleBtn = $('toggleOnlineBtn');
    const input   = $('chatMessageInput');

    if (sendBtn) {
        const newBtn = sendBtn.cloneNode(true);
        sendBtn.parentNode.replaceChild(newBtn, sendBtn);
        newBtn.addEventListener('click', sendOperatorMessage);
    }
    input?.addEventListener('keypress', (e) => { if (e.key === 'Enter') sendOperatorMessage(); });
    endBtn?.addEventListener('click', endChatSession);
    toggleBtn?.addEventListener('click', toggleChatStatus);
}

async function sendOperatorMessage() {
    const input   = $('chatMessageInput');
    const message = input?.value.trim();
    if (!message || !activeChatSession) return;
    try {
        await db.collection('chatSessions').doc(activeChatSession).collection('messages').add({
            sender: 'operator',
            message,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        });
        if (input) input.value = '';
    } catch { showToast('Gagal mengirim pesan', 'error'); }
}

async function endChatSession() {
    if (!activeChatSession || !confirm('Akhiri sesi chat ini?')) return;
    try {
        await db.collection('chatSessions').doc(activeChatSession).update({
            status: 'ended',
            endedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        if (activeChatSubscriptions[activeChatSession]) {
            activeChatSubscriptions[activeChatSession]();
            delete activeChatSubscriptions[activeChatSession];
        }
        activeChatSession = null;
        $('chatUserInfo').innerHTML = `<div class="session-avatar" style="background:var(--gray-200);color:var(--gray-400);"><i class="fas fa-user"></i></div><div><h4>Pilih sesi chat</h4><p>Klik sesi di samping</p></div>`;
        $('chatMessages').innerHTML = `<div class="empty-state"><div class="empty-state-icon"><i class="fas fa-comments"></i></div><p>Pilih sesi chat untuk membalas</p></div>`;
        $('chatMessageInput').disabled = true;
        $('sendChatMessageBtn').disabled = true;
        $('endChatBtn').disabled = true;
        showToast('Sesi chat diakhiri', 'success');
    } catch { showToast('Gagal mengakhiri chat', 'error'); }
}

async function loadChatSettings() {
    try {
        const doc = await db.collection('settings').doc('chatStatus').get();
        updateChatStatusUI(doc.exists ? doc.data().isOnline !== false : true);
    } catch { updateChatStatusUI(true); }
}

function updateChatStatusUI(isOnline) {
    const btn = $('toggleOnlineBtn');
    if (!btn) return;
    btn.className = `status-toggle ${isOnline ? 'online' : ''}`;
    btn.innerHTML = isOnline ? '<i class="fas fa-circle-dot"></i> Online' : '<i class="fas fa-circle-xmark"></i> Offline';
}

async function toggleChatStatus() {
    try {
        const doc = await db.collection('settings').doc('chatStatus').get();
        const newStatus = !(doc.exists ? doc.data().isOnline !== false : true);
        await db.collection('settings').doc('chatStatus').set({
            isOnline: newStatus,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        updateChatStatusUI(newStatus);
        showToast(`Live Chat ${newStatus ? 'diaktifkan' : 'dinonaktifkan'}`, 'success');
    } catch { showToast('Gagal mengubah status chat', 'error'); }
}

// ============================================================
// NEWS PAGE
// ============================================================
function loadNewsPage() {
    pageContainer.innerHTML = `
    <div class="fade-in" style="display:grid;grid-template-columns:380px 1fr;gap:24px;">
        <div>
            <div class="card">
                <div class="card-header"><span class="card-title"><i class="fas fa-plus"></i> Tambah Berita</span></div>
                <div class="card-body">
                    <form id="newsForm">
                        <div class="form-group"><label><i class="fas fa-heading"></i> Judul Berita <span class="form-required">*</span></label><input type="text" id="newsTitle" class="form-input" required></div>
                        <div class="form-group"><label><i class="fas fa-align-left"></i> Ringkasan</label><input type="text" id="newsExcerpt" class="form-input"></div>
                        <div class="form-group"><label><i class="fas fa-image"></i> URL Gambar</label><input type="url" id="newsImage" class="form-input" placeholder="https://..."></div>
                        <div class="form-group"><label><i class="fas fa-file-lines"></i> Konten Lengkap <span class="form-required">*</span></label><textarea id="newsContent" class="form-input" rows="6" required></textarea></div>
                        <input type="hidden" id="newsEditId">
                        <button type="submit" class="btn btn-primary btn-full"><i class="fas fa-floppy-disk"></i> Simpan Berita</button>
                    </form>
                </div>
            </div>
        </div>
        <div>
            <div class="card">
                <div class="card-header"><span class="card-title"><i class="fas fa-newspaper"></i> Daftar Berita</span><span class="badge-pill blue" id="newsCount">0</span></div>
                <div id="newsList"><div class="loading-spinner"><div class="spin-ring"></div></div></div>
            </div>
        </div>
    </div>`;

    $('newsForm').addEventListener('submit', saveNews);
    loadNewsList();
}

async function saveNews(e) {
    e.preventDefault();
    const editId  = $('newsEditId').value;
    const title   = $('newsTitle').value.trim();
    const excerpt = $('newsExcerpt').value.trim();
    const image   = $('newsImage').value.trim();
    const content = $('newsContent').value.trim();
    if (!title || !content) { showToast('Judul dan konten wajib diisi', 'error'); return; }

    const btn = $('newsForm').querySelector('button[type="submit"]');
    setButtonLoading(btn, true);

    try {
        const data = {
            title,
            excerpt: excerpt || content.substring(0, 150),
            image: image || 'https://via.placeholder.com/800x400/059669/ffffff?text=Berita+SMAN+68',
            content,
            date: firebase.firestore.FieldValue.serverTimestamp()
        };
        if (editId) {
            await db.collection('news').doc(editId).update(data);
            showToast('Berita berhasil diperbarui!', 'success');
            $('newsEditId').value = '';
            btn.innerHTML = '<i class="fas fa-floppy-disk"></i> Simpan Berita';
        } else {
            await db.collection('news').add(data);
            showToast('Berita berhasil disimpan!', 'success');
        }
        $('newsForm').reset();
        loadNewsList();
    } catch { showToast('Gagal menyimpan berita', 'error'); }
    finally { setButtonLoading(btn, false); }
}

async function loadNewsList() {
    const container = $('newsList');
    try {
        const snap = await db.collection('news').orderBy('date', 'desc').get();
        const countEl = $('newsCount');
        if (countEl) countEl.textContent = snap.size;

        if (snap.empty) {
            container.innerHTML = emptyState('fas fa-newspaper', 'Belum Ada Berita', 'Tambahkan berita pertama Anda.');
            return;
        }
        let html = `<div class="table-wrap"><table><thead><tr><th>Judul</th><th>Tanggal</th><th>Aksi</th></tr></thead><tbody>`;
        snap.forEach(doc => {
            const d = doc.data();
            const date = d.date ? new Date(d.date.toDate()).toLocaleDateString('id-ID') : '—';
            html += `<tr>
                <td><strong>${escHtml(d.title)}</strong></td>
                <td><span class="badge-pill gray"><i class="fas fa-calendar" style="margin-right:4px;"></i>${date}</span></td>
                <td class="td-actions">
                    <button class="icon-btn icon-btn-edit" onclick="editNews('${doc.id}')" title="Edit"><i class="fas fa-pen"></i></button>
                    <button class="icon-btn icon-btn-delete" onclick="deleteItem('news','${doc.id}')" title="Hapus"><i class="fas fa-trash"></i></button>
                </td>
            </tr>`;
        });
        html += `</tbody></table></div>`;
        container.innerHTML = html;
    } catch { container.innerHTML = emptyState('fas fa-exclamation-circle', 'Gagal memuat', ''); }
}

async function editNews(id) {
    try {
        const doc = await db.collection('news').doc(id).get();
        if (!doc.exists) return;
        const d = doc.data();
        $('newsTitle').value   = d.title   || '';
        $('newsExcerpt').value = d.excerpt  || '';
        $('newsImage').value   = d.image    || '';
        $('newsContent').value = d.content  || '';
        $('newsEditId').value  = id;
        const btn = $('newsForm').querySelector('button[type="submit"]');
        btn.innerHTML = '<i class="fas fa-pen"></i> Update Berita';
        scrollToTop();
        showToast('Data berita siap diedit', 'info');
    } catch { showToast('Gagal memuat data', 'error'); }
}

// ============================================================
// AGENDA PAGE
// ============================================================
function loadAgendaPage() {
    pageContainer.innerHTML = `
    <div class="fade-in" style="display:grid;grid-template-columns:380px 1fr;gap:24px;">
        <div>
            <div class="card">
                <div class="card-header"><span class="card-title"><i class="fas fa-calendar-plus"></i> Tambah Agenda</span></div>
                <div class="card-body">
                    <form id="agendaForm">
                        <div class="form-group"><label><i class="fas fa-heading"></i> Judul <span class="form-required">*</span></label><input type="text" id="agendaTitle" class="form-input" required></div>
                        <div class="form-row">
                            <div class="form-group"><label><i class="fas fa-calendar"></i> Tanggal <span class="form-required">*</span></label><input type="date" id="agendaDate" class="form-input" required></div>
                            <div class="form-group"><label><i class="fas fa-clock"></i> Waktu <span class="form-required">*</span></label><input type="text" id="agendaTime" class="form-input" placeholder="07.30 - 12.00 WIB" required></div>
                        </div>
                        <div class="form-group"><label><i class="fas fa-location-dot"></i> Lokasi <span class="form-required">*</span></label><input type="text" id="agendaLocation" class="form-input" required></div>
                        <div class="form-group"><label><i class="fas fa-tag"></i> Kategori <span class="form-required">*</span></label>
                            <select id="agendaCategory" class="form-input" required>
                                <option value="">Pilih Kategori</option>
                                <option value="Akademik">Akademik</option>
                                <option value="Non-Akademik">Non-Akademik</option>
                                <option value="Workshop">Workshop</option>
                                <option value="Lainnya">Lainnya</option>
                            </select>
                        </div>
                        <input type="hidden" id="agendaEditId">
                        <button type="submit" class="btn btn-primary btn-full"><i class="fas fa-floppy-disk"></i> Simpan Agenda</button>
                    </form>
                </div>
            </div>
        </div>
        <div>
            <div class="card">
                <div class="card-header"><span class="card-title"><i class="fas fa-calendar-days"></i> Daftar Agenda</span></div>
                <div id="agendaList"><div class="loading-spinner"><div class="spin-ring"></div></div></div>
            </div>
        </div>
    </div>`;
    $('agendaForm').addEventListener('submit', saveAgenda);
    loadAgendaList();
}

async function saveAgenda(e) {
    e.preventDefault();
    const editId   = $('agendaEditId').value;
    const title    = $('agendaTitle').value.trim();
    const date     = $('agendaDate').value;
    const time     = $('agendaTime').value.trim();
    const location = $('agendaLocation').value.trim();
    const category = $('agendaCategory').value;
    if (!title || !date || !time || !location || !category) { showToast('Semua field wajib diisi', 'error'); return; }
    const btn = $('agendaForm').querySelector('button[type="submit"]');
    setButtonLoading(btn, true);
    try {
        const data = { title, date: firebase.firestore.Timestamp.fromDate(new Date(date)), time, location, category };
        if (editId) {
            await db.collection('agenda').doc(editId).update(data);
            showToast('Agenda diperbarui!', 'success');
            $('agendaEditId').value = '';
        } else {
            await db.collection('agenda').add(data);
            showToast('Agenda disimpan!', 'success');
        }
        $('agendaForm').reset();
        loadAgendaList();
    } catch { showToast('Gagal menyimpan', 'error'); }
    finally { setButtonLoading(btn, false); }
}

async function loadAgendaList() {
    const container = $('agendaList');
    const catColors = { 'Akademik': 'blue', 'Non-Akademik': 'green', 'Workshop': 'purple', 'Lainnya': 'gray' };
    try {
        const snap = await db.collection('agenda').orderBy('date', 'asc').get();
        if (snap.empty) { container.innerHTML = emptyState('fas fa-calendar-days', 'Belum Ada Agenda'); return; }
        let html = `<div class="table-wrap"><table><thead><tr><th>Judul</th><th>Tanggal</th><th>Waktu</th><th>Kategori</th><th>Aksi</th></tr></thead><tbody>`;
        snap.forEach(doc => {
            const d = doc.data();
            const date = d.date ? new Date(d.date.toDate()).toLocaleDateString('id-ID') : '—';
            const catColor = catColors[d.category] || 'gray';
            html += `<tr>
                <td><strong>${escHtml(d.title)}</strong><br><small style="color:var(--gray-400);">${escHtml(d.location)}</small></td>
                <td>${date}</td>
                <td>${escHtml(d.time)}</td>
                <td><span class="badge-pill ${catColor}">${escHtml(d.category)}</span></td>
                <td class="td-actions">
                    <button class="icon-btn icon-btn-edit" onclick="editAgenda('${doc.id}')" title="Edit"><i class="fas fa-pen"></i></button>
                    <button class="icon-btn icon-btn-delete" onclick="deleteItem('agenda','${doc.id}')" title="Hapus"><i class="fas fa-trash"></i></button>
                </td>
            </tr>`;
        });
        html += '</tbody></table></div>';
        container.innerHTML = html;
    } catch { container.innerHTML = emptyState('fas fa-exclamation-circle', 'Gagal memuat'); }
}

async function editAgenda(id) {
    const doc = await db.collection('agenda').doc(id).get();
    if (!doc.exists) return;
    const d = doc.data();
    $('agendaTitle').value    = d.title    || '';
    $('agendaDate').value     = d.date ? d.date.toDate().toISOString().slice(0, 10) : '';
    $('agendaTime').value     = d.time     || '';
    $('agendaLocation').value = d.location || '';
    $('agendaCategory').value = d.category || '';
    $('agendaEditId').value   = id;
    $('agendaForm').querySelector('button[type="submit"]').innerHTML = '<i class="fas fa-pen"></i> Update Agenda';
    scrollToTop();
    showToast('Data agenda siap diedit', 'info');
}

// ============================================================
// GALLERY PAGE
// ============================================================
function loadGalleryPage() {
    pageContainer.innerHTML = `
    <div class="fade-in" style="display:grid;grid-template-columns:360px 1fr;gap:24px;">
        <div>
            <div class="card">
                <div class="card-header"><span class="card-title"><i class="fas fa-plus"></i> Tambah Foto</span></div>
                <div class="card-body">
                    <form id="galleryForm">
                        <div class="form-group"><label><i class="fas fa-link"></i> URL Gambar <span class="form-required">*</span></label><input type="url" id="galleryImageUrl" class="form-input" placeholder="https://..." required></div>
                        <div class="form-group"><label><i class="fas fa-text-slash"></i> Keterangan <span class="form-required">*</span></label><input type="text" id="galleryCaption" class="form-input" required></div>
                        <input type="hidden" id="galleryEditId">
                        <div id="galleryPreviewWrap" style="margin-bottom:16px;"></div>
                        <button type="submit" class="btn btn-primary btn-full"><i class="fas fa-floppy-disk"></i> Simpan Foto</button>
                    </form>
                </div>
            </div>
        </div>
        <div>
            <div class="card">
                <div class="card-header"><span class="card-title"><i class="fas fa-images"></i> Galeri Foto</span></div>
                <div class="card-body" id="galleryList">
                    <div class="loading-spinner"><div class="spin-ring"></div></div>
                </div>
            </div>
        </div>
    </div>`;

    $('galleryForm').addEventListener('submit', saveGallery);
    $('galleryImageUrl').addEventListener('input', function() {
        const wrap = $('galleryPreviewWrap');
        if (this.value) {
            wrap.innerHTML = `<img src="${escHtml(this.value)}" alt="Preview" style="width:100%;height:140px;object-fit:cover;border-radius:var(--r-lg);border:2px solid var(--gray-200);" onerror="this.style.display='none'">`;
        } else { wrap.innerHTML = ''; }
    });
    loadGalleryList();
}

async function saveGallery(e) {
    e.preventDefault();
    const editId   = $('galleryEditId').value;
    const imageUrl = $('galleryImageUrl').value.trim();
    const caption  = $('galleryCaption').value.trim();
    if (!imageUrl || !caption) { showToast('Semua field wajib diisi', 'error'); return; }
    const btn = $('galleryForm').querySelector('button[type="submit"]');
    setButtonLoading(btn, true);
    try {
        if (editId) {
            await db.collection('gallery').doc(editId).update({ imageUrl, caption });
            showToast('Foto diperbarui!', 'success');
            $('galleryEditId').value = '';
        } else {
            await db.collection('gallery').add({ imageUrl, caption });
            showToast('Foto disimpan!', 'success');
        }
        $('galleryForm').reset();
        $('galleryPreviewWrap').innerHTML = '';
        loadGalleryList();
    } catch { showToast('Gagal menyimpan', 'error'); }
    finally { setButtonLoading(btn, false); }
}

async function loadGalleryList() {
    const container = $('galleryList');
    try {
        const snap = await db.collection('gallery').get();
        if (snap.empty) { container.innerHTML = emptyState('fas fa-images', 'Belum Ada Foto'); return; }
        let html = `<div class="gallery-grid">`;
        snap.forEach(doc => {
            const d = doc.data();
            html += `<div class="gallery-item">
                <img src="${escHtml(d.imageUrl)}" alt="${escHtml(d.caption)}" loading="lazy">
                <div class="gallery-item-overlay"><span class="gallery-item-caption">${escHtml(d.caption)}</span></div>
                <div class="gallery-item-actions">
                    <button class="icon-btn icon-btn-edit" onclick="editGallery('${doc.id}')" title="Edit"><i class="fas fa-pen"></i></button>
                    <button class="icon-btn icon-btn-delete" onclick="deleteItem('gallery','${doc.id}')" title="Hapus"><i class="fas fa-trash"></i></button>
                </div>
            </div>`;
        });
        html += '</div>';
        container.innerHTML = html;
    } catch { container.innerHTML = emptyState('fas fa-exclamation-circle', 'Gagal memuat'); }
}

async function editGallery(id) {
    const doc = await db.collection('gallery').doc(id).get();
    if (!doc.exists) return;
    const d = doc.data();
    $('galleryImageUrl').value = d.imageUrl || '';
    $('galleryCaption').value  = d.caption  || '';
    $('galleryEditId').value   = id;
    $('galleryPreviewWrap').innerHTML = d.imageUrl ? `<img src="${escHtml(d.imageUrl)}" style="width:100%;height:140px;object-fit:cover;border-radius:var(--r-lg);border:2px solid var(--gray-200);">` : '';
    $('galleryForm').querySelector('button[type="submit"]').innerHTML = '<i class="fas fa-pen"></i> Update Foto';
    scrollToTop();
    showToast('Data foto siap diedit', 'info');
}

// ============================================================
// FACILITIES PAGE
// ============================================================
function loadFacilitiesPage() {
    pageContainer.innerHTML = `
    <div class="fade-in" style="display:grid;grid-template-columns:380px 1fr;gap:24px;">
        <div>
            <div class="card">
                <div class="card-header"><span class="card-title"><i class="fas fa-plus"></i> Tambah Fasilitas</span></div>
                <div class="card-body">
                    <form id="facilityForm">
                        <div class="form-group"><label><i class="fas fa-building"></i> Nama Fasilitas <span class="form-required">*</span></label><input type="text" id="facilityName" class="form-input" required></div>
                        <div class="form-group"><label><i class="fas fa-align-left"></i> Deskripsi <span class="form-required">*</span></label><textarea id="facilityDesc" class="form-input" rows="3" required></textarea></div>
                        <div class="form-group"><label><i class="fas fa-image"></i> URL Gambar <span class="form-required">*</span></label><input type="url" id="facilityImage" class="form-input" placeholder="https://..." required></div>
                        <input type="hidden" id="facilityEditId">
                        <button type="submit" class="btn btn-primary btn-full"><i class="fas fa-floppy-disk"></i> Simpan Fasilitas</button>
                    </form>
                </div>
            </div>
        </div>
        <div>
            <div class="card">
                <div class="card-header"><span class="card-title"><i class="fas fa-building"></i> Daftar Fasilitas</span></div>
                <div class="card-body" id="facilityList"><div class="loading-spinner"><div class="spin-ring"></div></div></div>
            </div>
        </div>
    </div>`;
    $('facilityForm').addEventListener('submit', saveFacility);
    loadFacilityList();
}

async function saveFacility(e) {
    e.preventDefault();
    const editId      = $('facilityEditId').value;
    const name        = $('facilityName').value.trim();
    const description = $('facilityDesc').value.trim();
    const imageUrl    = $('facilityImage').value.trim();
    if (!name || !description || !imageUrl) { showToast('Semua field wajib diisi', 'error'); return; }
    const btn = $('facilityForm').querySelector('button[type="submit"]');
    setButtonLoading(btn, true);
    try {
        if (editId) {
            await db.collection('facilities').doc(editId).update({ name, description, imageUrl });
            showToast('Fasilitas diperbarui!', 'success');
            $('facilityEditId').value = '';
        } else {
            await db.collection('facilities').add({ name, description, imageUrl });
            showToast('Fasilitas disimpan!', 'success');
        }
        $('facilityForm').reset();
        loadFacilityList();
    } catch { showToast('Gagal menyimpan', 'error'); }
    finally { setButtonLoading(btn, false); }
}

async function loadFacilityList() {
    const container = $('facilityList');
    try {
        const snap = await db.collection('facilities').get();
        if (snap.empty) { container.innerHTML = emptyState('fas fa-building', 'Belum Ada Fasilitas'); return; }
        let html = '<div class="facility-grid">';
        snap.forEach(doc => {
            const d = doc.data();
            html += `<div class="facility-card">
                <img class="facility-card-img" src="${escHtml(d.imageUrl)}" alt="${escHtml(d.name)}" loading="lazy" onerror="this.src='https://via.placeholder.com/400x200/e2e8f0/94a3b8?text=No+Image'">
                <div class="facility-card-body">
                    <h4>${escHtml(d.name)}</h4>
                    <p>${escHtml(d.description)}</p>
                    <div class="facility-card-actions">
                        <button class="icon-btn icon-btn-edit" onclick="editFacility('${doc.id}')" title="Edit"><i class="fas fa-pen"></i></button>
                        <button class="icon-btn icon-btn-delete" onclick="deleteItem('facilities','${doc.id}')" title="Hapus"><i class="fas fa-trash"></i></button>
                    </div>
                </div>
            </div>`;
        });
        html += '</div>';
        container.innerHTML = html;
    } catch { container.innerHTML = emptyState('fas fa-exclamation-circle', 'Gagal memuat'); }
}

async function editFacility(id) {
    const doc = await db.collection('facilities').doc(id).get();
    if (!doc.exists) return;
    const d = doc.data();
    $('facilityName').value    = d.name        || '';
    $('facilityDesc').value    = d.description || '';
    $('facilityImage').value   = d.imageUrl    || '';
    $('facilityEditId').value  = id;
    $('facilityForm').querySelector('button[type="submit"]').innerHTML = '<i class="fas fa-pen"></i> Update Fasilitas';
    scrollToTop();
    showToast('Data fasilitas siap diedit', 'info');
}

// ============================================================
// TESTIMONIALS PAGE
// ============================================================
function loadTestimonialsPage() {
    pageContainer.innerHTML = `
    <div class="fade-in" style="display:grid;grid-template-columns:360px 1fr;gap:24px;">
        <div>
            <div class="card">
                <div class="card-header"><span class="card-title"><i class="fas fa-plus"></i> Tambah Testimoni</span></div>
                <div class="card-body">
                    <form id="testimonialForm">
                        <div class="form-group"><label><i class="fas fa-user"></i> Nama <span class="form-required">*</span></label><input type="text" id="testiName" class="form-input" required></div>
                        <div class="form-group"><label><i class="fas fa-id-badge"></i> Sebagai <span class="form-required">*</span></label><input type="text" id="testiRole" class="form-input" placeholder="Alumni 2023" required></div>
                        <div class="form-group"><label><i class="fas fa-star"></i> Rating</label>
                            <select id="testiStars" class="form-input">
                                <option value="5">★★★★★ Sangat Puas</option>
                                <option value="4">★★★★☆ Puas</option>
                                <option value="3">★★★☆☆ Cukup</option>
                                <option value="2">★★☆☆☆ Kurang</option>
                                <option value="1">★☆☆☆☆ Tidak Puas</option>
                            </select>
                        </div>
                        <div class="form-group"><label><i class="fas fa-comment"></i> Testimoni <span class="form-required">*</span></label><textarea id="testiText" class="form-input" rows="4" required></textarea></div>
                        <input type="hidden" id="testiEditId">
                        <button type="submit" class="btn btn-primary btn-full"><i class="fas fa-floppy-disk"></i> Simpan</button>
                    </form>
                </div>
            </div>
        </div>
        <div>
            <div class="card">
                <div class="card-header"><span class="card-title"><i class="fas fa-star"></i> Daftar Testimoni</span></div>
                <div id="testimonialList"><div class="loading-spinner"><div class="spin-ring"></div></div></div>
            </div>
        </div>
    </div>`;
    $('testimonialForm').addEventListener('submit', saveTestimonial);
    loadTestimonialList();
}

async function saveTestimonial(e) {
    e.preventDefault();
    const editId = $('testiEditId').value;
    const author = $('testiName').value.trim();
    const role   = $('testiRole').value.trim();
    const stars  = parseInt($('testiStars').value);
    const text   = $('testiText').value.trim();
    if (!author || !role || !text) { showToast('Semua field wajib diisi', 'error'); return; }
    const btn = $('testimonialForm').querySelector('button[type="submit"]');
    setButtonLoading(btn, true);
    try {
        if (editId) {
            await db.collection('testimonials').doc(editId).update({ author, role, stars, text });
            showToast('Testimoni diperbarui!', 'success');
            $('testiEditId').value = '';
        } else {
            await db.collection('testimonials').add({ author, role, stars, text });
            showToast('Testimoni disimpan!', 'success');
        }
        $('testimonialForm').reset();
        loadTestimonialList();
    } catch { showToast('Gagal menyimpan', 'error'); }
    finally { setButtonLoading(btn, false); }
}

async function loadTestimonialList() {
    const container = $('testimonialList');
    try {
        const snap = await db.collection('testimonials').get();
        if (snap.empty) { container.innerHTML = emptyState('fas fa-star', 'Belum Ada Testimoni'); return; }
        let html = `<div class="table-wrap"><table><thead><tr><th>Nama</th><th>Sebagai</th><th>Rating</th><th>Testimoni</th><th>Aksi</th></tr></thead><tbody>`;
        snap.forEach(doc => {
            const d = doc.data();
            const stars = '★'.repeat(d.stars || 0) + '☆'.repeat(5 - (d.stars || 0));
            html += `<tr>
                <td><strong>${escHtml(d.author)}</strong></td>
                <td><span class="badge-pill blue">${escHtml(d.role)}</span></td>
                <td><span class="star-display">${stars}</span></td>
                <td style="max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${escHtml(d.text.substring(0, 60))}...</td>
                <td class="td-actions">
                    <button class="icon-btn icon-btn-edit" onclick="editTestimonial('${doc.id}')" title="Edit"><i class="fas fa-pen"></i></button>
                    <button class="icon-btn icon-btn-delete" onclick="deleteItem('testimonials','${doc.id}')" title="Hapus"><i class="fas fa-trash"></i></button>
                </td>
            </tr>`;
        });
        html += '</tbody></table></div>';
        container.innerHTML = html;
    } catch { container.innerHTML = emptyState('fas fa-exclamation-circle', 'Gagal memuat'); }
}

async function editTestimonial(id) {
    const doc = await db.collection('testimonials').doc(id).get();
    if (!doc.exists) return;
    const d = doc.data();
    $('testiName').value   = d.author || '';
    $('testiRole').value   = d.role   || '';
    $('testiStars').value  = d.stars  || 5;
    $('testiText').value   = d.text   || '';
    $('testiEditId').value = id;
    $('testimonialForm').querySelector('button[type="submit"]').innerHTML = '<i class="fas fa-pen"></i> Update Testimoni';
    scrollToTop();
    showToast('Data testimoni siap diedit', 'info');
}

// ============================================================
// ALUMNI PTN PAGE
// ============================================================
function loadAlumniPage() {
    const ptnOptions  = ptnList.map(p => `<option value="${p.name}">${p.fullName} (${p.name})</option>`).join('');
    const curYear     = new Date().getFullYear();
    let yearOptions   = '';
    for (let y = curYear; y >= 2011; y--) yearOptions += `<option value="${y}">${y}</option>`;

    pageContainer.innerHTML = `
    <div class="fade-in" style="display:grid;grid-template-columns:360px 1fr;gap:24px;">
        <div>
            <div class="card">
                <div class="card-header"><span class="card-title"><i class="fas fa-graduation-cap"></i> Tambah Data Alumni</span></div>
                <div class="card-body">
                    <form id="alumniForm">
                        <div class="form-group"><label><i class="fas fa-university"></i> PTN <span class="form-required">*</span></label>
                            <select id="alumniPTN" class="form-input" required>
                                <option value="">Pilih PTN</option>${ptnOptions}
                            </select>
                        </div>
                        <div class="form-group"><label><i class="fas fa-calendar"></i> Tahun Masuk <span class="form-required">*</span></label>
                            <select id="alumniYear" class="form-input" required>
                                <option value="">Pilih Tahun</option>${yearOptions}
                            </select>
                        </div>
                        <div class="form-group"><label><i class="fas fa-users"></i> Jumlah Siswa <span class="form-required">*</span></label>
                            <input type="number" id="alumniCount" class="form-input" min="1" required>
                        </div>
                        <button type="submit" class="btn btn-primary btn-full"><i class="fas fa-floppy-disk"></i> Simpan Data</button>
                    </form>
                </div>
            </div>
        </div>
        <div>
            <div class="card">
                <div class="card-header"><span class="card-title"><i class="fas fa-graduation-cap"></i> Data Alumni PTN</span></div>
                <div id="alumniList"><div class="loading-spinner"><div class="spin-ring"></div></div></div>
            </div>
        </div>
    </div>`;
    $('alumniForm').addEventListener('submit', saveAlumni);
    loadAlumniList();
}

async function saveAlumni(e) {
    e.preventDefault();
    const ptn   = $('alumniPTN').value;
    const year  = parseInt($('alumniYear').value);
    const count = parseInt($('alumniCount').value);
    if (!ptn || !year || !count) { showToast('Semua field wajib diisi', 'error'); return; }
    const btn = $('alumniForm').querySelector('button[type="submit"]');
    setButtonLoading(btn, true);
    try {
        const batch = db.batch();
        for (let i = 0; i < count; i++) batch.set(db.collection('alumni').doc(), { ptn, year });
        await batch.commit();
        showToast(`${count} data alumni berhasil ditambahkan!`, 'success');
        $('alumniForm').reset();
        loadAlumniList();
    } catch { showToast('Gagal menyimpan data', 'error'); }
    finally { setButtonLoading(btn, false); }
}

async function loadAlumniList() {
    const container = $('alumniList');
    try {
        const snap = await db.collection('alumni').get();
        if (snap.empty) { container.innerHTML = emptyState('fas fa-graduation-cap', 'Belum Ada Data Alumni'); return; }
        const summary = {};
        snap.forEach(doc => {
            const d = doc.data();
            const key = `${d.ptn}-${d.year}`;
            if (!summary[key]) summary[key] = { ptn: d.ptn, year: d.year, count: 0 };
            summary[key].count++;
        });
        let html = `<div class="table-wrap"><table><thead><tr><th>PTN</th><th>Tahun</th><th>Jumlah</th><th>Aksi</th></tr></thead><tbody>`;
        Object.values(summary).sort((a, b) => b.year - a.year || a.ptn.localeCompare(b.ptn)).forEach(item => {
            const fullName = ptnList.find(p => p.name === item.ptn)?.fullName || item.ptn;
            html += `<tr>
                <td><div style="display:flex;align-items:center;gap:10px;">
                    <div class="ptn-logo">${escHtml(item.ptn)}</div>
                    <div><strong>${escHtml(fullName)}</strong><br><small style="color:var(--gray-400);">${escHtml(item.ptn)}</small></div>
                </div></td>
                <td><span class="badge-pill blue">${item.year}</span></td>
                <td><strong>${item.count}</strong> <small style="color:var(--gray-400);">siswa</small></td>
                <td class="td-actions">
                    <button class="icon-btn icon-btn-delete" onclick="deleteAlumniByYear('${item.ptn}',${item.year})" title="Hapus"><i class="fas fa-trash"></i></button>
                </td>
            </tr>`;
        });
        html += '</tbody></table></div>';
        container.innerHTML = html;
    } catch { container.innerHTML = emptyState('fas fa-exclamation-circle', 'Gagal memuat'); }
}

async function deleteAlumniByYear(ptn, year) {
    if (!confirm(`Hapus semua data alumni ${ptn} tahun ${year}?`)) return;
    try {
        const snap = await db.collection('alumni').where('ptn', '==', ptn).where('year', '==', year).get();
        const batch = db.batch();
        snap.forEach(doc => batch.delete(doc.ref));
        await batch.commit();
        showToast('Data alumni berhasil dihapus', 'success');
        loadAlumniList();
    } catch { showToast('Gagal menghapus', 'error'); }
}

// ============================================================
// FEEDBACKS PAGE
// ============================================================
function loadFeedbacksPage() {
    pageContainer.innerHTML = `
    <div class="fade-in">
        <div class="section-header">
            <span class="section-title"><i class="fas fa-envelope-open-text"></i> Kritik & Saran</span>
            <div style="display:flex;gap:10px;">
                <button class="btn btn-sm btn-secondary" onclick="filterFeedback('all')">Semua</button>
                <button class="btn btn-sm btn-secondary" onclick="filterFeedback('pending')">Menunggu</button>
                <button class="btn btn-sm btn-secondary" onclick="filterFeedback('replied')">Dibalas</button>
            </div>
        </div>
        <div id="feedbacksList"><div class="loading-spinner"><div class="spin-ring"></div></div></div>
    </div>`;
    loadFeedbacksList();
}

async function loadFeedbacksList(filter = 'all') {
    const container = $('feedbacksList');
    try {
        let query = db.collection('feedbacks').orderBy('createdAt', 'desc');
        if (filter !== 'all') query = query.where('status', '==', filter);
        const snap = await query.get();
        if (snap.empty) { container.innerHTML = emptyState('fas fa-envelope-open-text', 'Belum Ada Pesan'); return; }
        let html = '';
        snap.forEach(doc => {
            const d    = doc.data();
            const date = d.createdAt ? new Date(d.createdAt.toDate()).toLocaleString('id-ID') : '—';
            const initials = (d.name || 'U')[0].toUpperCase();
            const statusBadge = d.status === 'replied'
                ? '<span class="badge-pill green"><i class="fas fa-check"></i> Dibalas</span>'
                : '<span class="badge-pill yellow"><i class="fas fa-clock"></i> Menunggu</span>';

            let repliesHtml = '';
            if (d.replies && d.replies.length > 0) {
                repliesHtml = `<div class="feedback-replies">` + d.replies.map(r => `
                    <div class="feedback-reply-item">
                        <strong><i class="fas fa-reply"></i> Balasan Admin</strong>
                        <p>${escHtml(r.message)}</p>
                        <small>${r.timestamp ? new Date(r.timestamp).toLocaleString('id-ID') : ''}</small>
                    </div>`).join('') + `</div>`;
            }

            html += `<div class="feedback-card">
                <div class="feedback-card-head">
                    <div class="feedback-author">
                        <div class="feedback-avatar">${initials}</div>
                        <div>
                            <div class="feedback-name">${escHtml(d.name || 'Anonim')}</div>
                            <div class="feedback-email">${escHtml(d.email || '')}</div>
                        </div>
                    </div>
                    <div style="display:flex;align-items:center;gap:10px;">${statusBadge}<small style="color:var(--gray-400);">${date}</small></div>
                </div>
                <div class="feedback-card-body">
                    ${d.category ? `<div class="feedback-category-label"><i class="fas fa-tag"></i> ${escHtml(d.category)}</div>` : ''}
                    <div class="feedback-message">${escHtml(d.message || '')}</div>
                    ${repliesHtml}
                </div>
                <div class="feedback-card-foot">
                    <span></span>
                    ${d.status !== 'replied' ? `<button class="btn btn-sm btn-primary" onclick="showReplyModal('${doc.id}')"><i class="fas fa-reply"></i> Balas</button>` : '<span class="badge-pill green"><i class="fas fa-check"></i> Sudah Dibalas</span>'}
                </div>
            </div>`;
        });
        container.innerHTML = html;
    } catch (err) { console.error(err); container.innerHTML = emptyState('fas fa-exclamation-circle', 'Gagal memuat data'); }
}

window.filterFeedback = (filter) => loadFeedbacksList(filter);

function showReplyModal(feedbackId) {
    openModal(`
        <div class="modal-head">
            <span class="modal-title"><i class="fas fa-reply"></i> Balas Pesan</span>
            <button class="modal-close" onclick="closeModal()"><i class="fas fa-xmark"></i></button>
        </div>
        <div class="modal-body">
            <div class="form-group">
                <label><i class="fas fa-comment"></i> Pesan Balasan <span class="form-required">*</span></label>
                <textarea id="replyMessage" class="form-input" rows="5" placeholder="Tulis balasan yang informatif..."></textarea>
            </div>
        </div>
        <div class="modal-foot">
            <button class="btn btn-secondary" onclick="closeModal()">Batal</button>
            <button class="btn btn-primary" onclick="submitReply('${feedbackId}')"><i class="fas fa-paper-plane"></i> Kirim Balasan</button>
        </div>
    `);
}

async function submitReply(feedbackId) {
    const message = $('replyMessage')?.value.trim();
    if (!message) { showToast('Pesan tidak boleh kosong', 'error'); return; }
    try {
        const docRef = db.collection('feedbacks').doc(feedbackId);
        const doc    = await docRef.get();
        const replies = doc.data().replies || [];
        replies.push({ message, timestamp: new Date().toISOString() });
        await docRef.update({ replies, status: 'replied' });
        closeModal();
        showToast('Balasan berhasil dikirim!', 'success');
        loadFeedbacksList();
    } catch { showToast('Gagal mengirim balasan', 'error'); }
}

// ============================================================
// FLOATING ANNOUNCEMENTS PAGE (Multiple)
// ============================================================
function loadAnnouncementsPage() {
    pageContainer.innerHTML = `
    <div class="fade-in">
        <div class="section-header">
            <span class="section-title"><i class="fas fa-bullhorn"></i> Manajemen Pengumuman</span>
            <button class="btn btn-primary" onclick="openAnnouncementModal()"><i class="fas fa-plus"></i> Tambah Pengumuman</button>
        </div>
        <div id="announcementList"><div class="loading-spinner"><div class="spin-ring"></div></div></div>
    </div>`;
    loadAnnouncementList();
}

async function loadAnnouncementList() {
    const container = $('announcementList');
    try {
        const doc = await db.collection('settings').doc('announcements').get();
        const list = doc.exists ? (doc.data().list || []) : [];

        if (list.length === 0) {
            container.innerHTML = emptyState('fas fa-bullhorn', 'Belum Ada Pengumuman', 'Klik tombol "Tambah Pengumuman" untuk membuat yang pertama.');
            return;
        }

        let html = '<div class="announcement-list">';
        list.forEach((item, index) => {
            const expiredBadge = item.endTime && new Date(item.endTime) < new Date()
                ? '<span class="badge-pill red">Expired</span>'
                : (item.active ? '<span class="badge-pill green">Aktif</span>' : '<span class="badge-pill gray">Nonaktif</span>');

            html += `<div class="announcement-item ${item.active ? 'active-item' : ''}">
                <div class="announcement-color-dot" style="background:${item.color || '#059669'};"></div>
                <div class="announcement-body">
                    <h4>${escHtml(item.title || 'Tanpa Judul')}</h4>
                    <p>${escHtml((item.text || '').substring(0, 120))}${item.text && item.text.length > 120 ? '...' : ''}</p>
                    <div class="announcement-meta">
                        ${expiredBadge}
                        ${item.icon ? `<span class="badge-pill gray"><i class="${escHtml(item.icon)}"></i> Icon</span>` : ''}
                        ${item.endTime ? `<span class="badge-pill yellow"><i class="fas fa-clock"></i> Exp: ${new Date(item.endTime).toLocaleDateString('id-ID')}</span>` : ''}
                    </div>
                </div>
                <div class="announcement-actions">
                    <button class="icon-btn icon-btn-edit" onclick="editAnnouncement(${index})" title="Edit"><i class="fas fa-pen"></i></button>
                    <button class="icon-btn icon-btn-delete" onclick="deleteAnnouncement(${index})" title="Hapus"><i class="fas fa-trash"></i></button>
                    <label class="toggle-wrap" title="${item.active ? 'Nonaktifkan' : 'Aktifkan'}">
                        <div class="toggle-switch ${item.active ? 'on' : ''}" onclick="toggleAnnouncement(${index})"></div>
                    </label>
                </div>
            </div>`;
        });
        html += '</div>';
        container.innerHTML = html;
    } catch (err) { console.error(err); container.innerHTML = emptyState('fas fa-exclamation-circle', 'Gagal memuat'); }
}

function openAnnouncementModal(existingData = null, editIndex = null) {
    const d = existingData || {};
    openModal(`
        <div class="modal-head">
            <span class="modal-title"><i class="fas fa-bullhorn"></i> ${editIndex !== null ? 'Edit' : 'Tambah'} Pengumuman</span>
            <button class="modal-close" onclick="closeModal()"><i class="fas fa-xmark"></i></button>
        </div>
        <div class="modal-body">
            <div class="form-group"><label><i class="fas fa-heading"></i> Judul</label><input type="text" id="annTitle" class="form-input" value="${escHtml(d.title || '')}" placeholder="Judul pengumuman"></div>
            <div class="form-group"><label><i class="fas fa-align-left"></i> Teks Pengumuman <span class="form-required">*</span></label><textarea id="annText" class="form-input" rows="3">${escHtml(d.text || '')}</textarea></div>
            <div class="form-row">
                <div class="form-group"><label><i class="fas fa-palette"></i> Warna</label>
                    <select id="annColor" class="form-input">
                        <option value="#059669" ${d.color==='#059669'?'selected':''}>Hijau</option>
                        <option value="#2563eb" ${d.color==='#2563eb'?'selected':''}>Biru</option>
                        <option value="#dc2626" ${d.color==='#dc2626'?'selected':''}>Merah</option>
                        <option value="#d97706" ${d.color==='#d97706'?'selected':''}>Oranye</option>
                        <option value="#7c3aed" ${d.color==='#7c3aed'?'selected':''}>Ungu</option>
                    </select>
                </div>
                <div class="form-group"><label><i class="fas fa-icons"></i> Icon (FA class)</label>
                    <input type="text" id="annIcon" class="form-input" value="${escHtml(d.icon || '')}" placeholder="fas fa-bell">
                </div>
            </div>
            <div class="form-group"><label><i class="fas fa-link"></i> Link (opsional)</label><input type="url" id="annLink" class="form-input" value="${escHtml(d.link || '')}" placeholder="https://..."></div>
            <div class="form-row">
                <div class="form-group"><label><i class="fas fa-calendar-plus"></i> Tanggal Publish</label><input type="datetime-local" id="annStart" class="form-input" value="${d.startTime || ''}"></div>
                <div class="form-group"><label><i class="fas fa-calendar-xmark"></i> Expired Otomatis</label><input type="datetime-local" id="annEnd" class="form-input" value="${d.endTime || ''}"></div>
            </div>
            <div class="form-group">
                <label class="toggle-wrap"><div class="toggle-switch ${d.active !== false ? 'on' : ''}" id="annActiveTgl"></div><span>Aktifkan Pengumuman</span></label>
            </div>
        </div>
        <div class="modal-foot">
            <button class="btn btn-secondary" onclick="closeModal()">Batal</button>
            <button class="btn btn-primary" onclick="saveAnnouncement(${editIndex})"><i class="fas fa-floppy-disk"></i> Simpan</button>
        </div>
    `);

    // Toggle active
    $('annActiveTgl')?.addEventListener('click', function() {
        this.classList.toggle('on');
    });
}

async function saveAnnouncement(editIndex) {
    const title   = $('annTitle')?.value.trim();
    const text    = $('annText')?.value.trim();
    const color   = $('annColor')?.value;
    const icon    = $('annIcon')?.value.trim();
    const link    = $('annLink')?.value.trim();
    const start   = $('annStart')?.value;
    const end     = $('annEnd')?.value;
    const active  = $('annActiveTgl')?.classList.contains('on');

    if (!text) { showToast('Teks pengumuman wajib diisi', 'error'); return; }

    try {
        const docRef = db.collection('settings').doc('announcements');
        const doc    = await docRef.get();
        const list   = doc.exists ? (doc.data().list || []) : [];

        const item = { title: title || '', text, color: color || '#059669', icon: icon || '', link: link || '', active, startTime: start || '', endTime: end || '', createdAt: new Date().toISOString() };

        if (editIndex !== null && editIndex >= 0) {
            list[editIndex] = item;
        } else {
            list.push(item);
        }

        await docRef.set({ list, updatedAt: firebase.firestore.FieldValue.serverTimestamp() });

        // Auto expire timer
        if (end) {
            const delay = new Date(end).getTime() - new Date().getTime();
            if (delay > 0) setTimeout(async () => {
                const d2 = await docRef.get();
                const l2 = d2.data()?.list || [];
                const idx = l2.findIndex(i => i.createdAt === item.createdAt);
                if (idx >= 0) { l2[idx].active = false; await docRef.set({ list: l2 }); }
            }, delay);
        }

        closeModal();
        showToast('Pengumuman disimpan!', 'success');
        loadAnnouncementList();
    } catch (err) { console.error(err); showToast('Gagal menyimpan', 'error'); }
}

async function editAnnouncement(index) {
    const doc = await db.collection('settings').doc('announcements').get();
    const list = doc.exists ? (doc.data().list || []) : [];
    if (!list[index]) return;
    openAnnouncementModal(list[index], index);
}

async function deleteAnnouncement(index) {
    if (!confirm('Hapus pengumuman ini?')) return;
    try {
        const docRef = db.collection('settings').doc('announcements');
        const doc = await docRef.get();
        const list = doc.exists ? (doc.data().list || []) : [];
        list.splice(index, 1);
        await docRef.set({ list });
        showToast('Pengumuman dihapus', 'success');
        loadAnnouncementList();
    } catch { showToast('Gagal menghapus', 'error'); }
}

async function toggleAnnouncement(index) {
    try {
        const docRef = db.collection('settings').doc('announcements');
        const doc    = await docRef.get();
        const list   = doc.exists ? (doc.data().list || []) : [];
        if (!list[index]) return;
        list[index].active = !list[index].active;
        await docRef.set({ list });
        showToast(`Pengumuman ${list[index].active ? 'diaktifkan' : 'dinonaktifkan'}`, 'success');
        loadAnnouncementList();
    } catch { showToast('Gagal mengubah status', 'error'); }
}

// ============================================================
// MAINTENANCE PAGE
// ============================================================
function loadMaintenancePage() {
    pageContainer.innerHTML = `
    <div class="fade-in">
        <div id="maintenanceBanner"></div>
        <div class="settings-section">
            <div class="settings-section-head"><i class="fas fa-screwdriver-wrench"></i><h3>Konfigurasi Maintenance</h3></div>
            <div class="settings-section-body">
                <form id="maintenanceForm">
                    <div class="form-row">
                        <div class="form-group"><label><i class="fas fa-toggle-on"></i> Status</label>
                            <select id="maintenanceActive" class="form-input">
                                <option value="false">Nonaktif</option>
                                <option value="true">Aktif</option>
                            </select>
                        </div>
                        <div class="form-group"><label><i class="fas fa-heading"></i> Judul</label>
                            <input type="text" id="maintenanceTitle" class="form-input" placeholder="Website Sedang Dalam Pemeliharaan">
                        </div>
                    </div>
                    <div class="form-group"><label><i class="fas fa-align-left"></i> Pesan</label>
                        <textarea id="maintenanceMessage" class="form-input" rows="3" placeholder="Pesan yang ditampilkan kepada pengunjung..."></textarea>
                    </div>
                    <div class="form-row">
                        <div class="form-group"><label><i class="fas fa-calendar-plus"></i> Mulai Otomatis</label><input type="datetime-local" id="maintenanceStart" class="form-input"></div>
                        <div class="form-group"><label><i class="fas fa-calendar-check"></i> Selesai Otomatis</label><input type="datetime-local" id="maintenanceEnd" class="form-input"></div>
                    </div>
                    <div style="display:flex;gap:10px;flex-wrap:wrap;">
                        <button type="submit" class="btn btn-primary"><i class="fas fa-floppy-disk"></i> Simpan Pengaturan</button>
                        <button type="button" id="deactivateMaintenanceBtn" class="btn btn-danger"><i class="fas fa-power-off"></i> Nonaktifkan Sekarang</button>
                    </div>
                </form>
            </div>
        </div>

        <!-- History -->
        <div class="settings-section" style="margin-top:24px;">
            <div class="settings-section-head"><i class="fas fa-clock-rotate-left"></i><h3>Riwayat Maintenance</h3></div>
            <div class="settings-section-body" id="maintenanceHistory">
                <div class="loading-spinner"><div class="spin-ring"></div></div>
            </div>
        </div>
    </div>`;

    $('maintenanceForm').addEventListener('submit', saveMaintenance);
    $('deactivateMaintenanceBtn').addEventListener('click', deactivateMaintenance);
    loadMaintenanceSettings();
}

async function loadMaintenanceSettings() {
    try {
        const doc = await db.collection('settings').doc('maintenance').get();
        if (doc.exists) {
            const d = doc.data();
            $('maintenanceActive').value  = d.active ? 'true' : 'false';
            $('maintenanceTitle').value   = d.title   || '';
            $('maintenanceMessage').value = d.message || '';
            if (d.startTime) $('maintenanceStart').value = d.startTime.toDate().toISOString().slice(0, 16);
            if (d.endTime)   $('maintenanceEnd').value   = d.endTime.toDate().toISOString().slice(0, 16);
            updateMaintenanceBanner(d);
        } else {
            updateMaintenanceBanner({ active: false });
        }
    } catch {}
    loadMaintenanceHistory();
}

function updateMaintenanceBanner(data) {
    const banner = $('maintenanceBanner');
    if (!banner) return;
    const isActive = data?.active;
    banner.innerHTML = `
        <div class="maintenance-status-banner ${isActive ? 'active-banner' : 'inactive-banner'}">
            <div class="maintenance-icon ${isActive ? 'active-icon' : 'inactive-icon'}">
                <i class="fas fa-${isActive ? 'triangle-exclamation' : 'check-circle'}"></i>
            </div>
            <div class="maintenance-status-text">
                <h3 style="color:${isActive ? 'var(--danger)' : 'var(--primary)'};">
                    Maintenance Mode: ${isActive ? 'AKTIF' : 'NONAKTIF'}
                </h3>
                <p>${isActive ? 'Website sedang dalam mode pemeliharaan — pengunjung melihat halaman maintenance.' : 'Website berjalan normal dan dapat diakses pengunjung.'}</p>
            </div>
        </div>`;
}

async function saveMaintenance(e) {
    e.preventDefault();
    const active  = $('maintenanceActive').value === 'true';
    const title   = $('maintenanceTitle').value.trim();
    const message = $('maintenanceMessage').value.trim();
    const start   = $('maintenanceStart').value;
    const end     = $('maintenanceEnd').value;

    const btn = $('maintenanceForm').querySelector('button[type="submit"]');
    setButtonLoading(btn, true);
    try {
        const data = {
            active,
            title:   title   || 'Website Sedang Dalam Pemeliharaan',
            message: message || 'Mohon maaf, website sedang dalam pemeliharaan. Silakan kunjungi kembali nanti.',
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        };
        if (start) data.startTime = firebase.firestore.Timestamp.fromDate(new Date(start));
        if (end)   data.endTime   = firebase.firestore.Timestamp.fromDate(new Date(end));

        await db.collection('settings').doc('maintenance').set(data);

        // Log to history
        await db.collection('maintenanceHistory').add({
            action: active ? 'activated' : 'deactivated',
            title: data.title,
            by: currentUser?.email || 'Admin',
            at: firebase.firestore.FieldValue.serverTimestamp()
        });

        // Auto-deactivate timer
        if (end) {
            const delay = new Date(end).getTime() - Date.now();
            if (delay > 0) {
                clearTimeout(maintenanceTimer);
                maintenanceTimer = setTimeout(async () => {
                    await db.collection('settings').doc('maintenance').update({ active: false });
                    showToast('Maintenance otomatis dinonaktifkan', 'info');
                }, delay);
            }
        }

        updateMaintenanceBanner({ active });
        showToast('Pengaturan maintenance disimpan!', 'success');
    } catch { showToast('Gagal menyimpan', 'error'); }
    finally { setButtonLoading(btn, false); }
}

async function deactivateMaintenance() {
    if (!confirm('Nonaktifkan maintenance sekarang?')) return;
    try {
        await db.collection('settings').doc('maintenance').update({ active: false, updatedAt: firebase.firestore.FieldValue.serverTimestamp() });
        $('maintenanceActive').value = 'false';
        updateMaintenanceBanner({ active: false });
        showToast('Maintenance dinonaktifkan!', 'success');
    } catch { showToast('Gagal', 'error'); }
}

async function loadMaintenanceHistory() {
    const container = $('maintenanceHistory');
    if (!container) return;
    try {
        const snap = await db.collection('maintenanceHistory').orderBy('at', 'desc').limit(10).get();
        if (snap.empty) { container.innerHTML = '<p style="color:var(--gray-400);font-size:0.85rem;">Belum ada riwayat maintenance.</p>'; return; }
        let html = '<ul class="timeline">';
        snap.forEach(doc => {
            const d = doc.data();
            const isActivated = d.action === 'activated';
            const time = d.at ? new Date(d.at.toDate()).toLocaleString('id-ID') : '—';
            html += `<li class="timeline-item">
                <div class="timeline-dot" style="background:${isActivated ? 'rgba(239,68,68,0.1)' : 'rgba(5,150,105,0.1)'};color:${isActivated ? 'var(--danger)' : 'var(--primary)'};">
                    <i class="fas fa-${isActivated ? 'tools' : 'check'}"></i>
                </div>
                <div class="timeline-body">
                    <p><strong>${isActivated ? 'Maintenance Diaktifkan' : 'Maintenance Dinonaktifkan'}</strong> — ${escHtml(d.title || '')}</p>
                    <small>${escHtml(d.by || '')} • ${time}</small>
                </div>
            </li>`;
        });
        html += '</ul>';
        container.innerHTML = html;
    } catch {}
}

// ============================================================
// SETTINGS PAGE
// ============================================================
function loadSettingsPage() {
    const days = ['senin','selasa','rabu','kamis','jumat','sabtu','minggu'];
    pageContainer.innerHTML = `
    <div class="fade-in">
        <!-- Jam Operasional -->
        <div class="settings-section">
            <div class="settings-section-head"><i class="fas fa-clock"></i><h3>Jam Operasional</h3></div>
            <div class="settings-section-body">
                <form id="hoursForm">
                    <div class="hours-grid">
                        ${days.map(day => `
                        <div class="day-input-group">
                            <label>${day.charAt(0).toUpperCase() + day.slice(1)}</label>
                            <input type="text" id="${day}" class="form-input" placeholder="07.00 - 16.00 WIB">
                        </div>`).join('')}
                    </div>
                    <div style="margin-top:16px;">
                        <button type="submit" class="btn btn-primary"><i class="fas fa-floppy-disk"></i> Simpan Jam Operasional</button>
                    </div>
                </form>
            </div>
        </div>

        <!-- Live Chat Status -->
        <div class="settings-section">
            <div class="settings-section-head"><i class="fas fa-comments"></i><h3>Status Live Chat</h3></div>
            <div class="settings-section-body">
                <div class="chat-status-toggle-wrap">
                    <div class="chat-status-info">
                        <p>Status Live Chat Operator</p>
                        <small id="settingsChatLabel">Memuat...</small>
                    </div>
                    <button id="settingsChatToggle" class="btn btn-sm btn-secondary">Memuat...</button>
                </div>
            </div>
        </div>

        <!-- Info -->
        <div class="settings-section">
            <div class="settings-section-head"><i class="fas fa-info-circle"></i><h3>Informasi Sistem</h3></div>
            <div class="settings-section-body">
                <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:16px;">
                    <div class="status-card"><div class="status-indicator green"></div><div class="status-card-info"><p>Firebase Auth</p><strong>Connected</strong></div></div>
                    <div class="status-card"><div class="status-indicator green"></div><div class="status-card-info"><p>Firestore</p><strong>Connected</strong></div></div>
                    <div class="status-card"><div class="status-indicator green"></div><div class="status-card-info"><p>Logged In</p><strong>${escHtml(currentUser?.email || 'Admin')}</strong></div></div>
                </div>
            </div>
        </div>
    </div>`;

    $('hoursForm').addEventListener('submit', saveHours);
    $('settingsChatToggle').addEventListener('click', toggleChatStatusSetting);
    loadCurrentHours();
    loadChatStatusSetting();
}

async function loadCurrentHours() {
    try {
        const doc = await db.collection('settings').doc('operationalHours').get();
        if (doc.exists) {
            const d = doc.data();
            ['senin','selasa','rabu','kamis','jumat','sabtu','minggu'].forEach(day => {
                const input = $(day);
                if (input) input.value = d[day] || '';
            });
        }
    } catch {}
}

async function saveHours(e) {
    e.preventDefault();
    const hours = {};
    ['senin','selasa','rabu','kamis','jumat','sabtu','minggu'].forEach(day => {
        hours[day] = $(day)?.value.trim() || '';
    });
    const btn = $('hoursForm').querySelector('button[type="submit"]');
    setButtonLoading(btn, true);
    try {
        await db.collection('settings').doc('operationalHours').set(hours);
        showToast('Jam operasional disimpan!', 'success');
    } catch { showToast('Gagal menyimpan', 'error'); }
    finally { setButtonLoading(btn, false); }
}

async function loadChatStatusSetting() {
    try {
        const doc = await db.collection('settings').doc('chatStatus').get();
        updateChatStatusSettingUI(doc.exists ? doc.data().isOnline !== false : true);
    } catch { updateChatStatusSettingUI(true); }
}

function updateChatStatusSettingUI(isOnline) {
    const toggle = $('settingsChatToggle');
    const label  = $('settingsChatLabel');
    if (toggle) {
        toggle.className = `btn btn-sm ${isOnline ? 'btn-primary' : 'btn-secondary'}`;
        toggle.innerHTML = isOnline ? '<i class="fas fa-circle-dot"></i> Online — Klik untuk Offlinekan' : '<i class="fas fa-circle-xmark"></i> Offline — Klik untuk Onlinekan';
    }
    if (label) {
        label.textContent  = isOnline ? 'Live Chat sedang aktif dan bisa digunakan pengunjung' : 'Live Chat nonaktif — pengunjung tidak bisa memulai chat';
        label.style.color = isOnline ? 'var(--primary)' : 'var(--danger)';
    }
}

async function toggleChatStatusSetting() {
    try {
        const doc = await db.collection('settings').doc('chatStatus').get();
        const newStatus = !(doc.exists ? doc.data().isOnline !== false : true);
        await db.collection('settings').doc('chatStatus').set({
            isOnline: newStatus,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        updateChatStatusSettingUI(newStatus);
        showToast(`Live Chat ${newStatus ? 'diaktifkan' : 'dinonaktifkan'}!`, 'success');
    } catch { showToast('Gagal', 'error'); }
}

// ============================================================
// DELETE ITEM (Universal)
// ============================================================
async function deleteItem(collection, id) {
    if (!confirm('Hapus item ini? Tindakan tidak bisa dibatalkan.')) return;
    try {
        await db.collection(collection).doc(id).delete();
        showToast('Item berhasil dihapus', 'success');
        loadPage(currentPage);
    } catch { showToast('Gagal menghapus item', 'error'); }
}

// ============================================================
// NOTIFICATIONS
// ============================================================
function addNotification(type, message, link = '') {
    notifications.unshift({ type, message, link, timestamp: new Date(), read: false });
    updateNotificationUI();
}

function updateNotificationUI() {
    const unread = notifications.filter(n => !n.read).length;
    if (notifCount) {
        notifCount.textContent = unread;
        notifCount.style.display = unread > 0 ? 'flex' : 'none';
    }
    if (notifList) {
        if (notifications.length === 0) {
            notifList.innerHTML = `<div class="notif-empty"><i class="fas fa-bell-slash"></i><p>Tidak ada notifikasi</p></div>`;
            return;
        }
        notifList.innerHTML = notifications.slice(0, 15).map((n, i) => `
            <div class="notif-item ${n.read ? '' : 'unread'}" onclick="markNotificationRead(${i})">
                <div class="notif-item-icon"><i class="fas fa-${n.type === 'chat' ? 'comments' : 'envelope'}"></i></div>
                <div class="notif-item-body">
                    <p>${escHtml(n.message)}</p>
                    <small>${n.timestamp.toLocaleTimeString('id-ID')}</small>
                </div>
            </div>`).join('');
    }
}

function setupNotifications() {
    notifBell?.addEventListener('click', (e) => {
        e.stopPropagation();
        notifBell.classList.toggle('active');
    });
    document.addEventListener('click', (e) => {
        if (!notifBell?.contains(e.target)) notifBell?.classList.remove('active');
    });
    clearNotifBtn?.addEventListener('click', () => {
        notifications.forEach(n => n.read = true);
        updateNotificationUI();
    });
}

function markNotificationRead(index) {
    if (notifications[index]) { notifications[index].read = true; updateNotificationUI(); }
}

// ============================================================
// REALTIME LISTENERS
// ============================================================
function setupRealtimeListeners() {
    db.collection('feedbacks').where('status', '==', 'pending').onSnapshot((snap) => {
        const badge = $('feedbackBadge');
        if (badge) {
            badge.textContent = snap.size;
            badge.style.display = snap.size > 0 ? 'inline-flex' : 'none';
        }
    });
}

function setupGlobalChatListener() {
    db.collection('chatSessions').where('status', '==', 'active').onSnapshot((snap) => {
        const badge = $('chatBadge');
        if (badge) {
            badge.textContent = snap.size;
            badge.style.display = snap.size > 0 ? 'inline-flex' : 'none';
        }
        snap.docChanges().forEach(change => {
            if (change.type === 'added') {
                addNotification('chat', `Chat baru dari ${change.doc.data().userName || 'Pengguna'}`);
            }
        });
    });
}

// ============================================================
// MODAL
// ============================================================
function openModal(html) {
    if (!modalContainer || !modalOverlay) return;
    modalContainer.innerHTML = html;
    modalOverlay.style.display = 'flex';
    modalOverlay.classList.add('open');
}

function closeModal() {
    if (!modalOverlay) return;
    modalOverlay.style.display = 'none';
    modalOverlay.classList.remove('open');
    if (modalContainer) modalContainer.innerHTML = '';
}

modalOverlay?.addEventListener('click', (e) => {
    if (e.target === modalOverlay) closeModal();
});

// ============================================================
// TOAST NOTIFICATIONS
// ============================================================
function showToast(message, type = 'success') {
    if (!toastStack) return;
    const icons = { success: 'fas fa-check-circle', error: 'fas fa-circle-xmark', warning: 'fas fa-triangle-exclamation', info: 'fas fa-circle-info' };
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <i class="${icons[type] || icons.info} toast-icon"></i>
        <span>${escHtml(message)}</span>
        <button class="toast-dismiss" onclick="dismissToast(this.parentElement)"><i class="fas fa-xmark"></i></button>`;
    toastStack.appendChild(toast);
    setTimeout(() => dismissToast(toast), 5000);
}

function dismissToast(el) {
    if (!el || el.classList.contains('removing')) return;
    el.classList.add('removing');
    setTimeout(() => el.remove(), 310);
}

// ============================================================
// UTILITIES
// ============================================================
function escHtml(str) {
    if (str === undefined || str === null) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function emptyState(icon, title, subtitle = '') {
    return `<div class="empty-state">
        <div class="empty-state-icon"><i class="${icon}"></i></div>
        <h4>${title}</h4>
        ${subtitle ? `<p>${subtitle}</p>` : ''}
    </div>`;
}

function setButtonLoading(btn, loading) {
    if (!btn) return;
    if (loading) {
        btn.disabled = true;
        btn._original = btn.innerHTML;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Menyimpan...';
    } else {
        btn.disabled = false;
        if (btn._original) btn.innerHTML = btn._original;
    }
}

function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ============================================================
// GLOBAL WINDOW EXPOSURE
// ============================================================
window.deleteItem          = deleteItem;
window.deleteAlumniByYear  = deleteAlumniByYear;
window.showReplyModal      = showReplyModal;
window.submitReply         = submitReply;
window.closeModal          = closeModal;
window.markNotificationRead= markNotificationRead;
window.navigateTo          = navigateTo;
window.editNews            = editNews;
window.editAgenda          = editAgenda;
window.editGallery         = editGallery;
window.editFacility        = editFacility;
window.editTestimonial     = editTestimonial;
window.editAnnouncement    = editAnnouncement;
window.deleteAnnouncement  = deleteAnnouncement;
window.toggleAnnouncement  = toggleAnnouncement;
window.saveAnnouncement    = saveAnnouncement;
window.openAnnouncementModal = openAnnouncementModal;
window.dismissToast        = dismissToast;
window.filterFeedback      = filterFeedback;

console.log('✅ SMAN 68 Admin Panel — Super Premium Edition Loaded');
