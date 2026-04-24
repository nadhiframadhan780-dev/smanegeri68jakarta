// ============================================
// SMAN 68 JAKARTA - ADMIN PANEL (COMPLETE)
// ============================================

// Firebase Configuration
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
const auth = firebase.auth();
const db = firebase.firestore();

// ============================================
// GLOBAL VARIABLES
// ============================================
let currentUser = null;
let currentPage = 'dashboard';
let activeChatSession = null;
let activeChatSubscriptions = {};
let notifications = [];

const ptnList = [
    { name: 'UI', fullName: 'Universitas Indonesia' },
    { name: 'UGM', fullName: 'Universitas Gadjah Mada' },
    { name: 'ITB', fullName: 'Institut Teknologi Bandung' },
    { name: 'UNAIR', fullName: 'Universitas Airlangga' },
    { name: 'IPB', fullName: 'Institut Pertanian Bogor' },
    { name: 'UNDIP', fullName: 'Universitas Diponegoro' },
    { name: 'UNPAD', fullName: 'Universitas Padjadjaran' },
    { name: 'UB', fullName: 'Universitas Brawijaya' },
    { name: 'ITS', fullName: 'Institut Teknologi Sepuluh Nopember' },
    { name: 'UNJ', fullName: 'Universitas Negeri Jakarta' },
    { name: 'UPNVJ', fullName: 'UPN Veteran Jakarta' }
];

// ============================================
// DOM ELEMENTS
// ============================================
const preloader = document.getElementById('preloader');
const loginOverlay = document.getElementById('loginOverlay');
const adminPanel = document.getElementById('adminPanel');
const loginForm = document.getElementById('loginForm');
const logoutBtn = document.getElementById('logoutBtn');
const sidebarToggle = document.getElementById('sidebarToggle');
const sidebar = document.getElementById('sidebar');
const pageContainer = document.getElementById('pageContainer');
const pageTitle = document.getElementById('pageTitle');
const adminNameSpan = document.getElementById('adminName');
const adminEmailSpan = document.getElementById('adminEmail');
const notificationBell = document.getElementById('notificationBell');
const notificationCountEl = document.getElementById('notificationCount');
const notificationList = document.getElementById('notificationList');
const clearNotificationsBtn = document.getElementById('clearNotifications');
const datetime = document.getElementById('datetime');
const toastEl = document.getElementById('toast');
const modalOverlay = document.getElementById('modalOverlay');
const modalContainer = document.getElementById('modalContainer');

// ============================================
// AUTH
// ============================================
auth.onAuthStateChanged(async (user) => {
    setTimeout(() => preloader?.classList.add('hide'), 500);
    
    if (user) {
        const adminDoc = await db.collection('admins').doc(user.uid).get();
        if (adminDoc.exists) {
            currentUser = { uid: user.uid, ...adminDoc.data() };
            showAdminPanel();
        } else {
            await auth.signOut();
            showLoginOverlay();
            showToast('Anda tidak memiliki akses admin.', 'error');
        }
    } else {
        showLoginOverlay();
    }
});

loginForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    const btn = loginForm.querySelector('button');
    
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';
    btn.disabled = true;
    
    try {
        const userCredential = await auth.signInWithEmailAndPassword(email, password);
        const adminDoc = await db.collection('admins').doc(userCredential.user.uid).get();
        
        if (!adminDoc.exists) {
            await auth.signOut();
            throw new Error('Akun bukan admin');
        }
        showToast('Login berhasil!', 'success');
    } catch (error) {
        showToast('Email atau password salah', 'error');
        btn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Login';
        btn.disabled = false;
    }
});

function showLoginOverlay() {
    if (loginOverlay) loginOverlay.style.display = 'flex';
    if (adminPanel) adminPanel.style.display = 'none';
}

function showAdminPanel() {
    if (loginOverlay) loginOverlay.style.display = 'none';
    if (adminPanel) adminPanel.style.display = 'flex';
    
    adminNameSpan.textContent = currentUser.name || 'Admin';
    adminEmailSpan.textContent = currentUser.email;
    
    initializeAdmin();
}

// ============================================
// INITIALIZE
// ============================================
function initializeAdmin() {
    updateDateTime();
    setInterval(updateDateTime, 1000);
    
    loadDashboard();
    setupNavigation();
    setupRealtimeListeners();
    setupGlobalLiveChatListener();
    setupNotifications();
}

function updateDateTime() {
    const now = new Date();
    const options = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' };
    if (datetime) datetime.textContent = now.toLocaleDateString('id-ID', options);
}

// ============================================
// NAVIGATION
// ============================================
function setupNavigation() {
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const page = item.dataset.page;
            
            document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
            item.classList.add('active');
            
            loadPage(page);
        });
    });
    
    sidebarToggle?.addEventListener('click', () => sidebar?.classList.toggle('active'));
    
    logoutBtn?.addEventListener('click', async () => {
        try {
            Object.values(activeChatSubscriptions).forEach(unsub => {
                if (typeof unsub === 'function') unsub();
            });
            activeChatSubscriptions = {};
            await auth.signOut();
            showToast('Berhasil logout', 'success');
        } catch (error) {
            showToast('Gagal logout', 'error');
        }
    });
}

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
        settings: 'Pengaturan'
    };
    
    if (pageTitle) pageTitle.textContent = titles[page] || page;
    
    switch(page) {
        case 'dashboard': loadDashboard(); break;
        case 'chat': loadChatPage(); break;
        case 'news': loadNewsPage(); break;
        case 'agenda': loadAgendaPage(); break;
        case 'gallery': loadGalleryPage(); break;
        case 'facilities': loadFacilitiesPage(); break;
        case 'testimonials': loadTestimonialsPage(); break;
        case 'alumni': loadAlumniPage(); break;
        case 'feedbacks': loadFeedbacksPage(); break;
        case 'settings': loadSettingsPage(); break;
    }
}

// ============================================
// DASHBOARD
// ============================================
async function loadDashboard() {
    pageContainer.innerHTML = `<div class="loading-spinner"><i class="fas fa-spinner fa-spin"></i><p>Memuat dashboard...</p></div>`;
    
    try {
        const [newsSnap, agendaSnap, gallerySnap, facilitySnap, pendingFB, activeChatsSnap] = await Promise.all([
            db.collection('news').get(),
            db.collection('agenda').get(),
            db.collection('gallery').get(),
            db.collection('facilities').get(),
            db.collection('feedbacks').where('status', '==', 'pending').get(),
            db.collection('chatSessions').where('status', '==', 'active').get()
        ]);
        
        pageContainer.innerHTML = `
            <div class="stats-grid">
                <div class="stat-card"><div class="stat-icon green"><i class="fas fa-newspaper"></i></div><div class="stat-info"><h3>${newsSnap.size}</h3><p>Total Berita</p></div></div>
                <div class="stat-card"><div class="stat-icon blue"><i class="fas fa-calendar-alt"></i></div><div class="stat-info"><h3>${agendaSnap.size}</h3><p>Total Agenda</p></div></div>
                <div class="stat-card"><div class="stat-icon orange"><i class="fas fa-images"></i></div><div class="stat-info"><h3>${gallerySnap.size}</h3><p>Total Galeri</p></div></div>
                <div class="stat-card"><div class="stat-icon purple"><i class="fas fa-building"></i></div><div class="stat-info"><h3>${facilitySnap.size}</h3><p>Total Fasilitas</p></div></div>
                <div class="stat-card"><div class="stat-icon red"><i class="fas fa-comments"></i></div><div class="stat-info"><h3>${activeChatsSnap.size}</h3><p>Chat Aktif</p></div></div>
                <div class="stat-card"><div class="stat-icon teal"><i class="fas fa-envelope"></i></div><div class="stat-info"><h3>${pendingFB.size}</h3><p>Pesan Belum Dibaca</p></div></div>
            </div>
        `;
    } catch (error) {
        pageContainer.innerHTML = `<div class="empty-state"><i class="fas fa-exclamation-triangle"></i><p>Gagal memuat dashboard</p></div>`;
    }
}

// ============================================
// LIVE CHAT OPERATOR
// ============================================
function loadChatPage() {
    pageContainer.innerHTML = `
        <div class="chat-container">
            <div class="chat-sessions">
                <div class="chat-sessions-header">
                    <h3>Sesi Chat Aktif</h3>
                    <div style="display:flex;align-items:center;gap:10px;">
                        <span id="chatOnlineStatus">🟢 Online</span>
                        <button id="toggleOnlineBtn" class="btn-secondary" style="padding:5px 12px;font-size:0.8rem;">Offlinekan</button>
                    </div>
                </div>
                <div class="chat-sessions-list" id="chatSessionsList">
                    <div class="loading-spinner"><i class="fas fa-spinner fa-spin"></i></div>
                </div>
            </div>
            <div class="chat-window" id="chatWindow">
                <div class="chat-window-header">
                    <div class="chat-user-info" id="chatUserInfo">
                        <i class="fas fa-user-circle" style="font-size:2rem;"></i>
                        <div><h4>Pilih sesi chat</h4><p>Klik sesi di samping untuk memulai</p></div>
                    </div>
                    <button class="btn-secondary" id="endChatBtn" disabled><i class="fas fa-times"></i> Akhiri Chat</button>
                </div>
                <div class="chat-messages" id="chatMessages">
                    <div class="empty-state"><i class="fas fa-comments"></i><p>Pilih sesi chat untuk melihat pesan</p></div>
                </div>
                <div class="chat-input-area">
                    <input type="text" id="chatMessageInput" placeholder="Ketik pesan..." disabled>
                    <button id="sendChatMessageBtn" disabled><i class="fas fa-paper-plane"></i></button>
                </div>
            </div>
        </div>
    `;
    
    loadChatSessions();
    setupChatListeners();
    loadChatSettings();
}

function setupGlobalLiveChatListener() {
    db.collection('chatSessions').where('status', '==', 'active').onSnapshot((snapshot) => {
        const badge = document.getElementById('chatBadge');
        if (badge) {
            badge.textContent = snapshot.size;
            badge.style.display = snapshot.size > 0 ? 'inline-block' : 'none';
        }
        snapshot.docChanges().forEach((change) => {
            if (change.type === 'added') {
                const data = change.doc.data();
                addNotification('chat', `Chat baru dari ${data.userName}`, change.doc.id);
            }
        });
    });
}

async function loadChatSettings() {
    try {
        const doc = await db.collection('settings').doc('chatStatus').get();
        const isOnline = doc.exists ? (doc.data().isOnline !== false) : true;
        updateChatStatusUI(isOnline);
    } catch (error) { console.log('Default chat status'); }
}

function updateChatStatusUI(isOnline) {
    const statusEl = document.getElementById('chatOnlineStatus');
    const toggleBtn = document.getElementById('toggleOnlineBtn');
    if (statusEl) statusEl.innerHTML = isOnline ? '🟢 Online' : '🔴 Offline';
    if (toggleBtn) {
        toggleBtn.textContent = isOnline ? 'Offlinekan' : 'Onlinekan';
        toggleBtn.style.background = isOnline ? '#ef4444' : '#10b981';
        toggleBtn.style.color = 'white';
    }
}

async function toggleChatStatus() {
    try {
        const doc = await db.collection('settings').doc('chatStatus').get();
        const currentStatus = doc.exists ? (doc.data().isOnline !== false) : true;
        const newStatus = !currentStatus;
        await db.collection('settings').doc('chatStatus').set({
            isOnline: newStatus,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        updateChatStatusUI(newStatus);
        showToast('Berhasil', `Chat ${newStatus ? 'Online' : 'Offline'}`, 'success');
    } catch (error) { showToast('Gagal', 'Gagal mengubah status', 'error'); }
}

function loadChatSessions() {
    const container = document.getElementById('chatSessionsList');
    db.collection('chatSessions').where('status', '==', 'active').orderBy('startedAt', 'desc')
        .onSnapshot((snapshot) => {
            if (!container) return;
            if (snapshot.empty) {
                container.innerHTML = '<div class="empty-state"><i class="fas fa-comments"></i><p>Tidak ada chat aktif</p></div>';
                return;
            }
            container.innerHTML = '';
            snapshot.forEach(doc => container.appendChild(createChatSessionItem(doc.id, doc.data())));
        }, (error) => {
            if (container) container.innerHTML = '<div class="empty-state"><p>Gagal memuat sesi chat</p></div>';
        });
}

function createChatSessionItem(sessionId, data) {
    const div = document.createElement('div');
    div.className = 'chat-session-item';
    div.dataset.sessionId = sessionId;
    const initials = data.userName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    const time = data.startedAt ? new Date(data.startedAt.toDate()).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '';
    div.innerHTML = `
        <div class="session-avatar">${initials}</div>
        <div class="session-info"><h4>${data.userName}</h4><p>${data.userStatus} • ${time}</p></div>
        <span class="session-status"></span>
    `;
    div.addEventListener('click', () => selectChatSession(sessionId, data));
    return div;
}

function selectChatSession(sessionId, data) {
    if (activeChatSubscriptions[activeChatSession]) {
        activeChatSubscriptions[activeChatSession]();
        delete activeChatSubscriptions[activeChatSession];
    }
    activeChatSession = sessionId;
    
    document.querySelectorAll('.chat-session-item').forEach(item => item.classList.remove('active'));
    document.querySelector(`[data-session-id="${sessionId}"]`)?.classList.add('active');
    
    const initials = data.userName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    document.getElementById('chatUserInfo').innerHTML = `
        <div class="session-avatar">${initials}</div>
        <div><h4>${data.userName}</h4><p>${data.userPhone} • ${data.userStatus}</p></div>
    `;
    
    document.getElementById('chatMessageInput').disabled = false;
    document.getElementById('sendChatMessageBtn').disabled = false;
    document.getElementById('endChatBtn').disabled = false;
    
    loadChatMessages(sessionId);
}

function loadChatMessages(sessionId) {
    const container = document.getElementById('chatMessages');
    container.innerHTML = '<div class="loading-spinner"><i class="fas fa-spinner fa-spin"></i></div>';
    
    const unsubscribe = db.collection('chatSessions').doc(sessionId).collection('messages')
        .orderBy('timestamp', 'asc')
        .onSnapshot((snapshot) => {
            container.innerHTML = '';
            if (snapshot.empty) {
                container.innerHTML = '<div class="empty-state"><p>Belum ada pesan</p></div>';
                return;
            }
            snapshot.forEach(doc => container.appendChild(createChatMessage(doc.data())));
            container.scrollTop = container.scrollHeight;
        });
    
    activeChatSubscriptions[sessionId] = unsubscribe;
}

function createChatMessage(data) {
    const div = document.createElement('div');
    div.className = `chat-message ${data.sender}`;
    const time = data.timestamp ? new Date(data.timestamp.toDate()).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '';
    div.innerHTML = `<div class="message-bubble">${data.message}<div class="message-time">${time}</div></div>`;
    return div;
}

function setupChatListeners() {
    const sendBtn = document.getElementById('sendChatMessageBtn');
    const endBtn = document.getElementById('endChatBtn');
    const toggleBtn = document.getElementById('toggleOnlineBtn');
    const input = document.getElementById('chatMessageInput');
    
    if (sendBtn) {
        const newBtn = sendBtn.cloneNode(true);
        sendBtn.parentNode.replaceChild(newBtn, sendBtn);
        newBtn.addEventListener('click', sendOperatorMessage);
    }
    if (input) input.addEventListener('keypress', (e) => { if (e.key === 'Enter') sendOperatorMessage(); });
    if (endBtn) endBtn.addEventListener('click', endChatSession);
    if (toggleBtn) toggleBtn.addEventListener('click', toggleChatStatus);
}

async function sendOperatorMessage() {
    const input = document.getElementById('chatMessageInput');
    const message = input?.value.trim();
    if (!message || !activeChatSession) return;
    
    try {
        await db.collection('chatSessions').doc(activeChatSession).collection('messages').add({
            sender: 'operator', message: message,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        });
        if (input) input.value = '';
    } catch (error) { showToast('Gagal mengirim pesan', 'error'); }
}

async function endChatSession() {
    if (!activeChatSession) return;
    if (!confirm('Akhiri sesi chat ini?')) return;
    
    try {
        await db.collection('chatSessions').doc(activeChatSession).update({
            status: 'ended', endedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        if (activeChatSubscriptions[activeChatSession]) {
            activeChatSubscriptions[activeChatSession]();
            delete activeChatSubscriptions[activeChatSession];
        }
        activeChatSession = null;
        document.getElementById('chatUserInfo').innerHTML = `<i class="fas fa-user-circle" style="font-size:2rem;"></i><div><h4>Pilih sesi chat</h4><p>Klik sesi di samping</p></div>`;
        document.getElementById('chatMessages').innerHTML = '<div class="empty-state"><i class="fas fa-comments"></i><p>Pilih sesi chat</p></div>';
        document.getElementById('chatMessageInput').disabled = true;
        document.getElementById('sendChatMessageBtn').disabled = true;
        document.getElementById('endChatBtn').disabled = true;
        showToast('Chat diakhiri', 'success');
    } catch (error) { showToast('Gagal mengakhiri chat', 'error'); }
}

// ============================================
// NEWS PAGE
// ============================================
function loadNewsPage() {
    pageContainer.innerHTML = `
        <div class="form-container">
            <h3>Tambah Berita Baru</h3>
            <form id="newsForm">
                <div class="form-group"><label>Judul Berita <span style="color:red;">*</span></label><input type="text" id="newsTitle" class="form-input" required></div>
                <div class="form-group"><label>Ringkasan</label><input type="text" id="newsExcerpt" class="form-input"></div>
                <div class="form-group"><label>URL Gambar</label><input type="url" id="newsImage" class="form-input" placeholder="https://..."></div>
                <div class="form-group"><label>Konten Lengkap <span style="color:red;">*</span></label><textarea id="newsContent" class="form-input" rows="6" required></textarea></div>
                <button type="submit" class="btn-primary"><i class="fas fa-save"></i> Simpan Berita</button>
            </form>
        </div>
        <div class="data-table" style="margin-top:30px;"><h3 style="padding:20px;">Daftar Berita</h3><div id="newsList"></div></div>
    `;
    document.getElementById('newsForm').addEventListener('submit', saveNews);
    loadNewsList();
}

async function saveNews(e) {
    e.preventDefault();
    const title = document.getElementById('newsTitle').value.trim();
    const excerpt = document.getElementById('newsExcerpt').value.trim();
    const image = document.getElementById('newsImage').value.trim();
    const content = document.getElementById('newsContent').value.trim();
    
    if (!title || !content) { showToast('Judul dan konten wajib diisi', 'error'); return; }
    
    try {
        await db.collection('news').add({
            title, excerpt: excerpt || content.substring(0, 150),
            image: image || 'https://via.placeholder.com/400x200/0088cc/ffffff?text=Berita',
            content, date: firebase.firestore.FieldValue.serverTimestamp()
        });
        showToast('Berita berhasil disimpan!', 'success');
        document.getElementById('newsForm').reset();
        loadNewsList();
    } catch (error) { showToast('Gagal menyimpan berita', 'error'); }
}

async function loadNewsList() {
    const container = document.getElementById('newsList');
    try {
        const snapshot = await db.collection('news').orderBy('date', 'desc').get();
        if (snapshot.empty) { container.innerHTML = '<div class="empty-state"><p>Belum ada berita</p></div>'; return; }
        let html = '<table><thead><tr><th>Judul</th><th>Tanggal</th><th>Aksi</th></tr></thead><tbody>';
        snapshot.forEach(doc => {
            const data = doc.data();
            const date = data.date ? new Date(data.date.toDate()).toLocaleDateString('id-ID') : '';
            html += `<tr><td>${data.title}</td><td>${date}</td><td><button class="btn-secondary" onclick="deleteItem('news','${doc.id}')"><i class="fas fa-trash"></i></button></td></tr>`;
        });
        html += '</tbody></table>';
        container.innerHTML = html;
    } catch (error) { console.error(error); }
}

// ============================================
// AGENDA PAGE
// ============================================
function loadAgendaPage() {
    pageContainer.innerHTML = `
        <div class="form-container">
            <h3>Tambah Agenda Baru</h3>
            <form id="agendaForm">
                <div class="form-group"><label>Judul Agenda <span style="color:red;">*</span></label><input type="text" id="agendaTitle" class="form-input" required></div>
                <div class="form-row">
                    <div class="form-group"><label>Tanggal <span style="color:red;">*</span></label><input type="date" id="agendaDate" class="form-input" required></div>
                    <div class="form-group"><label>Waktu <span style="color:red;">*</span></label><input type="text" id="agendaTime" class="form-input" placeholder="07.30 - 12.00 WIB" required></div>
                </div>
                <div class="form-group"><label>Lokasi <span style="color:red;">*</span></label><input type="text" id="agendaLocation" class="form-input" required></div>
                <div class="form-group"><label>Kategori <span style="color:red;">*</span></label><select id="agendaCategory" class="form-input" required><option value="">Pilih</option><option value="Akademik">Akademik</option><option value="Non-Akademik">Non-Akademik</option><option value="Workshop">Workshop</option><option value="Lainnya">Lainnya</option></select></div>
                <button type="submit" class="btn-primary"><i class="fas fa-save"></i> Simpan Agenda</button>
            </form>
        </div>
        <div class="data-table" style="margin-top:30px;"><h3 style="padding:20px;">Daftar Agenda</h3><div id="agendaList"></div></div>
    `;
    document.getElementById('agendaForm').addEventListener('submit', saveAgenda);
    loadAgendaList();
}

async function saveAgenda(e) {
    e.preventDefault();
    const title = document.getElementById('agendaTitle').value.trim();
    const date = document.getElementById('agendaDate').value;
    const time = document.getElementById('agendaTime').value.trim();
    const location = document.getElementById('agendaLocation').value.trim();
    const category = document.getElementById('agendaCategory').value;
    
    if (!title || !date || !time || !location || !category) { showToast('Semua field wajib diisi', 'error'); return; }
    
    try {
        await db.collection('agenda').add({
            title, date: firebase.firestore.Timestamp.fromDate(new Date(date)), time, location, category
        });
        showToast('Agenda berhasil disimpan!', 'success');
        document.getElementById('agendaForm').reset();
        loadAgendaList();
    } catch (error) { showToast('Gagal menyimpan agenda', 'error'); }
}

async function loadAgendaList() {
    const container = document.getElementById('agendaList');
    try {
        const snapshot = await db.collection('agenda').orderBy('date', 'asc').get();
        if (snapshot.empty) { container.innerHTML = '<div class="empty-state"><p>Belum ada agenda</p></div>'; return; }
        let html = '<table><thead><tr><th>Judul</th><th>Tanggal</th><th>Waktu</th><th>Kategori</th><th>Aksi</th></tr></thead><tbody>';
        snapshot.forEach(doc => {
            const data = doc.data();
            const date = data.date ? new Date(data.date.toDate()).toLocaleDateString('id-ID') : '';
            html += `<tr><td>${data.title}</td><td>${date}</td><td>${data.time}</td><td>${data.category}</td><td><button class="btn-secondary" onclick="deleteItem('agenda','${doc.id}')"><i class="fas fa-trash"></i></button></td></tr>`;
        });
        html += '</tbody></table>';
        container.innerHTML = html;
    } catch (error) { console.error(error); }
}

// ============================================
// GALLERY PAGE
// ============================================
function loadGalleryPage() {
    pageContainer.innerHTML = `
        <div class="form-container">
            <h3>Tambah Foto Galeri</h3>
            <form id="galleryForm">
                <div class="form-group"><label>URL Gambar <span style="color:red;">*</span></label><input type="url" id="galleryImageUrl" class="form-input" placeholder="https://..." required></div>
                <div class="form-group"><label>Keterangan <span style="color:red;">*</span></label><input type="text" id="galleryCaption" class="form-input" placeholder="Contoh: Ruang Kelas Modern" required></div>
                <button type="submit" class="btn-primary"><i class="fas fa-save"></i> Simpan Foto</button>
            </form>
        </div>
        <div class="data-table" style="margin-top:30px;"><h3 style="padding:20px;">Daftar Galeri</h3><div id="galleryList"></div></div>
    `;
    document.getElementById('galleryForm').addEventListener('submit', saveGallery);
    loadGalleryList();
}

async function saveGallery(e) {
    e.preventDefault();
    const imageUrl = document.getElementById('galleryImageUrl').value.trim();
    const caption = document.getElementById('galleryCaption').value.trim();
    
    if (!imageUrl || !caption) { showToast('Semua field wajib diisi', 'error'); return; }
    
    try {
        await db.collection('gallery').add({ imageUrl, caption });
        showToast('Foto berhasil disimpan!', 'success');
        document.getElementById('galleryForm').reset();
        loadGalleryList();
    } catch (error) { showToast('Gagal menyimpan foto', 'error'); }
}

async function loadGalleryList() {
    const container = document.getElementById('galleryList');
    try {
        const snapshot = await db.collection('gallery').get();
        if (snapshot.empty) { container.innerHTML = '<div class="empty-state"><p>Belum ada foto</p></div>'; return; }
        let html = '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:20px;padding:20px;">';
        snapshot.forEach(doc => {
            const data = doc.data();
            html += `<div style="background:white;border-radius:12px;padding:15px;text-align:center;box-shadow:0 2px 10px rgba(0,0,0,0.1);"><img src="${data.imageUrl}" alt="${data.caption}" style="width:100%;height:120px;object-fit:cover;border-radius:8px;margin-bottom:10px;" onerror="this.src='https://via.placeholder.com/150/006633/ffffff?text=Error'"><p style="font-size:0.85rem;">${data.caption}</p><button class="btn-secondary" onclick="deleteItem('gallery','${doc.id}')" style="margin-top:10px;"><i class="fas fa-trash"></i> Hapus</button></div>`;
        });
        html += '</div>';
        container.innerHTML = html;
    } catch (error) { console.error(error); }
}

// ============================================
// FACILITIES PAGE
// ============================================
function loadFacilitiesPage() {
    pageContainer.innerHTML = `
        <div class="form-container">
            <h3>Tambah Fasilitas</h3>
            <form id="facilityForm">
                <div class="form-group"><label>Nama Fasilitas <span style="color:red;">*</span></label><input type="text" id="facilityName" class="form-input" required></div>
                <div class="form-group"><label>Deskripsi <span style="color:red;">*</span></label><textarea id="facilityDesc" class="form-input" rows="3" required></textarea></div>
                <div class="form-group"><label>URL Gambar <span style="color:red;">*</span></label><input type="url" id="facilityImage" class="form-input" placeholder="https://..." required></div>
                <button type="submit" class="btn-primary"><i class="fas fa-save"></i> Simpan Fasilitas</button>
            </form>
        </div>
        <div class="data-table" style="margin-top:30px;"><h3 style="padding:20px;">Daftar Fasilitas</h3><div id="facilityList"></div></div>
    `;
    document.getElementById('facilityForm').addEventListener('submit', saveFacility);
    loadFacilityList();
}

async function saveFacility(e) {
    e.preventDefault();
    const name = document.getElementById('facilityName').value.trim();
    const description = document.getElementById('facilityDesc').value.trim();
    const imageUrl = document.getElementById('facilityImage').value.trim();
    
    if (!name || !description || !imageUrl) { showToast('Semua field wajib diisi', 'error'); return; }
    
    try {
        await db.collection('facilities').add({ name, description, imageUrl });
        showToast('Fasilitas berhasil disimpan!', 'success');
        document.getElementById('facilityForm').reset();
        loadFacilityList();
    } catch (error) { showToast('Gagal menyimpan fasilitas', 'error'); }
}

async function loadFacilityList() {
    const container = document.getElementById('facilityList');
    try {
        const snapshot = await db.collection('facilities').get();
        if (snapshot.empty) { container.innerHTML = '<div class="empty-state"><p>Belum ada fasilitas</p></div>'; return; }
        let html = '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:20px;padding:20px;">';
        snapshot.forEach(doc => {
            const data = doc.data();
            html += `<div style="background:white;border-radius:12px;overflow:hidden;box-shadow:0 2px 10px rgba(0,0,0,0.1);"><img src="${data.imageUrl}" alt="${data.name}" style="width:100%;height:150px;object-fit:cover;" onerror="this.src='https://via.placeholder.com/250/0088cc/ffffff?text=Error'"><div style="padding:15px;"><h4 style="margin-bottom:5px;">${data.name}</h4><p style="font-size:0.85rem;color:#666;">${data.description}</p><button class="btn-secondary" onclick="deleteItem('facilities','${doc.id}')" style="margin-top:10px;"><i class="fas fa-trash"></i> Hapus</button></div></div>`;
        });
        html += '</div>';
        container.innerHTML = html;
    } catch (error) { console.error(error); }
}

// ============================================
// TESTIMONIALS PAGE
// ============================================
function loadTestimonialsPage() {
    pageContainer.innerHTML = `
        <div class="form-container">
            <h3>Tambah Testimoni</h3>
            <form id="testimonialForm">
                <div class="form-group"><label>Nama <span style="color:red;">*</span></label><input type="text" id="testiName" class="form-input" required></div>
                <div class="form-group"><label>Sebagai <span style="color:red;">*</span></label><input type="text" id="testiRole" class="form-input" placeholder="Contoh: Alumni 2023" required></div>
                <div class="form-group"><label>Rating (1-5) <span style="color:red;">*</span></label><select id="testiStars" class="form-input" required><option value="5">★★★★★ (5)</option><option value="4">★★★★☆ (4)</option><option value="3">★★★☆☆ (3)</option></select></div>
                <div class="form-group"><label>Testimoni <span style="color:red;">*</span></label><textarea id="testiText" class="form-input" rows="4" required></textarea></div>
                <button type="submit" class="btn-primary"><i class="fas fa-save"></i> Simpan Testimoni</button>
            </form>
        </div>
        <div class="data-table" style="margin-top:30px;"><h3 style="padding:20px;">Daftar Testimoni</h3><div id="testimonialList"></div></div>
    `;
    document.getElementById('testimonialForm').addEventListener('submit', saveTestimonial);
    loadTestimonialList();
}

async function saveTestimonial(e) {
    e.preventDefault();
    const author = document.getElementById('testiName').value.trim();
    const role = document.getElementById('testiRole').value.trim();
    const stars = parseInt(document.getElementById('testiStars').value);
    const text = document.getElementById('testiText').value.trim();
    
    if (!author || !role || !text) { showToast('Semua field wajib diisi', 'error'); return; }
    
    try {
        await db.collection('testimonials').add({ author, role, stars, text });
        showToast('Testimoni berhasil disimpan!', 'success');
        document.getElementById('testimonialForm').reset();
        loadTestimonialList();
    } catch (error) { showToast('Gagal menyimpan testimoni', 'error'); }
}

async function loadTestimonialList() {
    const container = document.getElementById('testimonialList');
    try {
        const snapshot = await db.collection('testimonials').get();
        if (snapshot.empty) { container.innerHTML = '<div class="empty-state"><p>Belum ada testimoni</p></div>'; return; }
        let html = '<table><thead><tr><th>Nama</th><th>Sebagai</th><th>Rating</th><th>Testimoni</th><th>Aksi</th></tr></thead><tbody>';
        snapshot.forEach(doc => {
            const data = doc.data();
            html += `<tr><td>${data.author}</td><td>${data.role}</td><td>${'★'.repeat(data.stars)}</td><td>${data.text.substring(0, 50)}...</td><td><button class="btn-secondary" onclick="deleteItem('testimonials','${doc.id}')"><i class="fas fa-trash"></i></button></td></tr>`;
        });
        html += '</tbody></table>';
        container.innerHTML = html;
    } catch (error) { console.error(error); }
}

// ============================================
// ALUMNI PTN PAGE
// ============================================
function loadAlumniPage() {
    let ptnOptions = ptnList.map(ptn => `<option value="${ptn.name}">${ptn.fullName}</option>`).join('');
    const currentYear = new Date().getFullYear();
    let yearOptions = '';
    for (let y = 2011; y <= currentYear; y++) yearOptions += `<option value="${y}">${y}</option>`;
    
    pageContainer.innerHTML = `
        <div class="form-container">
            <h3>Tambah Data Alumni PTN</h3>
            <form id="alumniForm">
                <div class="form-row">
                    <div class="form-group"><label>PTN <span style="color:red;">*</span></label><select id="alumniPTN" class="form-input" required><option value="">Pilih PTN</option>${ptnOptions}</select></div>
                    <div class="form-group"><label>Tahun <span style="color:red;">*</span></label><select id="alumniYear" class="form-input" required><option value="">Pilih Tahun</option>${yearOptions}</select></div>
                </div>
                <div class="form-group"><label>Jumlah Siswa <span style="color:red;">*</span></label><input type="number" id="alumniCount" class="form-input" min="1" required></div>
                <button type="submit" class="btn-primary"><i class="fas fa-save"></i> Simpan Data</button>
            </form>
            <p style="margin-top:15px;font-size:0.85rem;color:#666;"><i class="fas fa-info-circle"></i> Data akan ditambahkan per individu. Masukkan jumlah siswa yang diterima di PTN tersebut pada tahun yang dipilih.</p>
        </div>
        <div class="data-table" style="margin-top:30px;"><h3 style="padding:20px;">Data Alumni PTN</h3><div id="alumniList"></div></div>
    `;
    document.getElementById('alumniForm').addEventListener('submit', saveAlumni);
    loadAlumniList();
}

async function saveAlumni(e) {
    e.preventDefault();
    const ptn = document.getElementById('alumniPTN').value;
    const year = parseInt(document.getElementById('alumniYear').value);
    const count = parseInt(document.getElementById('alumniCount').value);
    
    if (!ptn || !year || !count) { showToast('Semua field wajib diisi', 'error'); return; }
    
    try {
        const batch = db.batch();
        for (let i = 0; i < count; i++) {
            const ref = db.collection('alumni').doc();
            batch.set(ref, { ptn, year });
        }
        await batch.commit();
        showToast(`${count} data siswa berhasil ditambahkan!`, 'success');
        document.getElementById('alumniForm').reset();
        loadAlumniList();
    } catch (error) { showToast('Gagal menyimpan data', 'error'); }
}

async function loadAlumniList() {
    const container = document.getElementById('alumniList');
    try {
        const snapshot = await db.collection('alumni').get();
        if (snapshot.empty) { container.innerHTML = '<div class="empty-state"><p>Belum ada data alumni</p></div>'; return; }
        
        const summary = {};
        snapshot.forEach(doc => {
            const data = doc.data();
            const key = `${data.ptn}-${data.year}`;
            if (!summary[key]) summary[key] = { ptn: data.ptn, year: data.year, count: 0 };
            summary[key].count++;
        });
        
        let html = '<table><thead><tr><th>PTN</th><th>Tahun</th><th>Jumlah</th><th>Aksi</th></tr></thead><tbody>';
        Object.values(summary).sort((a, b) => b.year - a.year || a.ptn.localeCompare(b.ptn)).forEach(item => {
            html += `<tr><td>${ptnList.find(p => p.name === item.ptn)?.fullName || item.ptn}</td><td>${item.year}</td><td>${item.count} siswa</td><td><button class="btn-secondary" onclick="deleteAlumniByYear('${item.ptn}',${item.year})"><i class="fas fa-trash"></i></button></td></tr>`;
        });
        html += '</tbody></table>';
        container.innerHTML = html;
    } catch (error) { console.error(error); }
}

async function deleteAlumniByYear(ptn, year) {
    if (!confirm(`Hapus semua data ${ptn} tahun ${year}?`)) return;
    try {
        const snapshot = await db.collection('alumni').where('ptn', '==', ptn).where('year', '==', year).get();
        const batch = db.batch();
        snapshot.forEach(doc => batch.delete(doc.ref));
        await batch.commit();
        showToast('Data berhasil dihapus', 'success');
        loadAlumniList();
    } catch (error) { showToast('Gagal menghapus data', 'error'); }
}

// ============================================
// FEEDBACKS PAGE
// ============================================
function loadFeedbacksPage() {
    pageContainer.innerHTML = `<div class="data-table"><h3 style="padding:20px;">Kritik & Saran</h3><div id="feedbacksList"><div class="loading-spinner"><i class="fas fa-spinner fa-spin"></i></div></div></div>`;
    loadFeedbacksList();
}

async function loadFeedbacksList() {
    const container = document.getElementById('feedbacksList');
    try {
        const snapshot = await db.collection('feedbacks').orderBy('createdAt', 'desc').get();
        if (snapshot.empty) { container.innerHTML = '<div class="empty-state"><p>Belum ada kritik & saran</p></div>'; return; }
        
        let html = '';
        snapshot.forEach(doc => {
            const data = doc.data();
            const date = data.createdAt ? new Date(data.createdAt.toDate()).toLocaleString('id-ID') : '';
            const statusBadge = data.status === 'replied' ? '<span style="background:#d1fae5;color:#059669;padding:3px 10px;border-radius:20px;font-size:0.75rem;">Sudah Dibalas</span>' : '<span style="background:#fef3c7;color:#d97706;padding:3px 10px;border-radius:20px;font-size:0.75rem;">Menunggu</span>';
            
            let repliesHtml = '';
            if (data.replies && data.replies.length > 0) {
                repliesHtml = data.replies.map(r => `<div style="margin-left:20px;padding:15px;background:#e8f5e9;border-radius:10px;margin-top:15px;"><strong><i class="fas fa-reply"></i> Balasan:</strong><br>${r.message}<br><small>${r.timestamp ? new Date(r.timestamp).toLocaleString('id-ID') : ''}</small></div>`).join('');
            }
            
            html += `<div style="padding:20px;border-bottom:1px solid #eee;">
                <div style="display:flex;justify-content:space-between;margin-bottom:10px;"><div><strong>${data.name}</strong> (${data.email}) ${statusBadge}</div><small>${date}</small></div>
                <p style="margin:5px 0;"><strong>Kategori:</strong> ${data.category}</p>
                <p style="background:#f5f5f5;padding:15px;border-radius:10px;margin:10px 0;">${data.message}</p>
                ${repliesHtml}
                ${data.status === 'pending' ? `<button class="btn-primary" onclick="showReplyModal('${doc.id}')" style="margin-top:15px;"><i class="fas fa-reply"></i> Balas</button>` : ''}
            </div>`;
        });
        container.innerHTML = html;
    } catch (error) { container.innerHTML = '<div class="empty-state"><p>Gagal memuat data</p></div>'; }
}

function showReplyModal(feedbackId) {
    modalContainer.innerHTML = `
        <div class="modal-header"><h3>Balas Kritik & Saran</h3><button class="modal-close" onclick="closeModal()">&times;</button></div>
        <div class="modal-body"><div class="form-group"><label>Pesan Balasan</label><textarea id="replyMessage" class="form-input" rows="5" placeholder="Tulis balasan..."></textarea></div></div>
        <div class="modal-footer"><button class="btn-secondary" onclick="closeModal()">Batal</button><button class="btn-primary" onclick="submitReply('${feedbackId}')">Kirim Balasan</button></div>
    `;
    modalOverlay.style.display = 'flex';
}

async function submitReply(feedbackId) {
    const message = document.getElementById('replyMessage').value.trim();
    if (!message) { showToast('Pesan balasan tidak boleh kosong', 'error'); return; }
    
    try {
        const docRef = db.collection('feedbacks').doc(feedbackId);
        const doc = await docRef.get();
        const replies = doc.data().replies || [];
        replies.push({ message: message, timestamp: new Date().toISOString() });
        await docRef.update({ replies: replies, status: 'replied' });
        closeModal();
        showToast('Balasan berhasil dikirim', 'success');
        loadFeedbacksList();
    } catch (error) { showToast('Gagal mengirim balasan', 'error'); }
}

function closeModal() {
    modalOverlay.style.display = 'none';
    modalContainer.innerHTML = '';
}

// ============================================
// SETTINGS PAGE
// ============================================
function loadSettingsPage() {
    pageContainer.innerHTML = `
        <div class="form-container" style="margin-bottom:30px;">
            <h3><i class="fas fa-cog"></i> Jam Operasional</h3>
            <form id="hoursForm">
                ${['senin','selasa','rabu','kamis','jumat','sabtu','minggu'].map(day => `<div class="form-group"><label>${day.charAt(0).toUpperCase()+day.slice(1)}</label><input type="text" id="${day}" class="form-input" placeholder="07.00 - 16.00 WIB"></div>`).join('')}
                <button type="submit" class="btn-primary"><i class="fas fa-save"></i> Simpan</button>
            </form>
        </div>
        
        <div class="form-container" style="margin-bottom:30px;">
            <h3><i class="fas fa-comments"></i> Status Live Chat</h3>
            <div style="display:flex;align-items:center;gap:15px;padding:15px;background:#f8fafc;border-radius:12px;">
                <button id="settingsChatToggle" class="status-toggle"></button>
                <span id="settingsChatLabel" class="status-label">Loading...</span>
            </div>
        </div>
        
        <div class="form-container">
            <h3><i class="fas fa-tools"></i> Maintenance Mode</h3>
            <div id="maintenanceStatus" style="margin-bottom:20px;"></div>
            <form id="maintenanceForm">
                <div class="form-group"><label><i class="fas fa-toggle-on"></i> Status</label><select id="maintenanceActive" class="form-input"><option value="false">Nonaktif</option><option value="true">Aktif</option></select></div>
                <div class="form-group"><label><i class="fas fa-heading"></i> Judul</label><input type="text" id="maintenanceTitle" class="form-input" placeholder="Website Sedang Pemeliharaan"></div>
                <div class="form-group"><label><i class="fas fa-align-left"></i> Pesan</label><textarea id="maintenanceMessage" class="form-input" rows="3" placeholder="Pesan pemberitahuan..."></textarea></div>
                <div class="form-row">
                    <div class="form-group"><label><i class="fas fa-calendar"></i> Mulai</label><input type="datetime-local" id="maintenanceStart" class="form-input"></div>
                    <div class="form-group"><label><i class="fas fa-calendar-check"></i> Selesai (Auto Nonaktif)</label><input type="datetime-local" id="maintenanceEnd" class="form-input"></div>
                </div>
                <button type="submit" class="btn-primary"><i class="fas fa-save"></i> Simpan Maintenance</button>
                <button type="button" id="deactivateMaintenanceBtn" class="btn-danger" style="width:100%;margin-top:10px;"><i class="fas fa-power-off"></i> Nonaktifkan Sekarang</button>
            </form>
        </div>
    `;
    
    loadCurrentHours();
    loadChatStatusSetting();
    loadMaintenanceSettings();
    
    document.getElementById('hoursForm').addEventListener('submit', saveHours);
    document.getElementById('maintenanceForm').addEventListener('submit', saveMaintenance);
    document.getElementById('deactivateMaintenanceBtn').addEventListener('click', deactivateMaintenance);
    document.getElementById('settingsChatToggle').addEventListener('click', toggleChatStatusSetting);
}

async function loadChatStatusSetting() {
    try {
        const doc = await db.collection('settings').doc('chatStatus').get();
        const isOnline = doc.exists ? (doc.data().isOnline !== false) : true;
        updateChatStatusSettingUI(isOnline);
    } catch (error) { updateChatStatusSettingUI(true); }
}

function updateChatStatusSettingUI(isOnline) {
    const toggle = document.getElementById('settingsChatToggle');
    const label = document.getElementById('settingsChatLabel');
    if (toggle) {
        toggle.className = `status-toggle ${isOnline ? 'online' : ''}`;
    }
    if (label) {
        label.textContent = isOnline ? '🟢 Live Chat Aktif' : '🔴 Live Chat Nonaktif';
        label.className = `status-label ${isOnline ? 'online' : 'offline'}`;
    }
}

async function toggleChatStatusSetting() {
    try {
        const doc = await db.collection('settings').doc('chatStatus').get();
        const currentStatus = doc.exists ? (doc.data().isOnline !== false) : true;
        const newStatus = !currentStatus;
        await db.collection('settings').doc('chatStatus').set({
            isOnline: newStatus,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        updateChatStatusSettingUI(newStatus);
        showToast('Berhasil', `Live Chat ${newStatus ? 'diaktifkan' : 'dinonaktifkan'}`, 'success');
    } catch (error) { showToast('Gagal', 'Gagal mengubah status', 'error'); }
}

async function loadMaintenanceSettings() {
    try {
        const doc = await db.collection('settings').doc('maintenance').get();
        if (doc.exists) {
            const data = doc.data();
            document.getElementById('maintenanceActive').value = data.active ? 'true' : 'false';
            document.getElementById('maintenanceTitle').value = data.title || '';
            document.getElementById('maintenanceMessage').value = data.message || '';
            if (data.startTime) document.getElementById('maintenanceStart').value = data.startTime.toDate().toISOString().slice(0, 16);
            if (data.endTime) document.getElementById('maintenanceEnd').value = data.endTime.toDate().toISOString().slice(0, 16);
            updateMaintenanceStatusUI(data);
        }
    } catch (error) { console.log('Default maintenance settings'); }
}

function updateMaintenanceStatusUI(data) {
    const container = document.getElementById('maintenanceStatus');
    if (!container) return;
    const isActive = data?.active || false;
    container.innerHTML = `<div style="display:inline-flex;align-items:center;gap:8px;padding:8px 16px;border-radius:50px;font-weight:600;font-size:0.9rem;${isActive ? 'background:#fee2e2;color:#dc2626;' : 'background:#d1fae5;color:#059669;'}"><i class="fas fa-${isActive ? 'tools' : 'check-circle'}"></i> Maintenance: <strong>${isActive ? 'AKTIF' : 'NONAKTIF'}</strong></div>`;
}

async function saveMaintenance(e) {
    e.preventDefault();
    const active = document.getElementById('maintenanceActive').value === 'true';
    const title = document.getElementById('maintenanceTitle').value.trim();
    const message = document.getElementById('maintenanceMessage').value.trim();
    const startTime = document.getElementById('maintenanceStart').value;
    const endTime = document.getElementById('maintenanceEnd').value;
    
    if (active && !title) { showToast('Judul wajib diisi jika aktif', 'error'); return; }
    
    try {
        const maintenanceData = {
            active,
            title: title || 'Website Sedang Dalam Pemeliharaan',
            message: message || 'Mohon maaf, website sedang dalam pemeliharaan.',
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        };
        if (startTime) maintenanceData.startTime = firebase.firestore.Timestamp.fromDate(new Date(startTime));
        if (endTime) maintenanceData.endTime = firebase.firestore.Timestamp.fromDate(new Date(endTime));
        
        await db.collection('settings').doc('maintenance').set(maintenanceData);
        
        if (endTime) {
            const delay = new Date(endTime).getTime() - new Date().getTime();
            if (delay > 0) {
                setTimeout(async () => {
                    await db.collection('settings').doc('maintenance').update({
                        active: false,
                        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                    });
                }, delay);
            }
        }
        
        updateMaintenanceStatusUI({ active });
        showToast('Berhasil', 'Pengaturan maintenance disimpan', 'success');
    } catch (error) { showToast('Gagal menyimpan', 'error'); }
}

async function deactivateMaintenance() {
    if (!confirm('Nonaktifkan maintenance sekarang?')) return;
    try {
        await db.collection('settings').doc('maintenance').update({
            active: false,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        document.getElementById('maintenanceActive').value = 'false';
        updateMaintenanceStatusUI({ active: false });
        showToast('Maintenance dinonaktifkan', 'success');
    } catch (error) { showToast('Gagal', 'error'); }
}

async function loadCurrentHours() {
    try {
        const doc = await db.collection('settings').doc('operationalHours').get();
        if (doc.exists) {
            const data = doc.data();
            ['senin','selasa','rabu','kamis','jumat','sabtu','minggu'].forEach(day => {
                const input = document.getElementById(day);
                if (input) input.value = data[day] || '';
            });
        }
    } catch (error) { console.error(error); }
}

async function saveHours(e) {
    e.preventDefault();
    const hours = {};
    ['senin','selasa','rabu','kamis','jumat','sabtu','minggu'].forEach(day => { hours[day] = document.getElementById(day).value.trim(); });
    try {
        await db.collection('settings').doc('operationalHours').set(hours);
        showToast('Jam operasional disimpan!', 'success');
    } catch (error) { showToast('Gagal menyimpan', 'error'); }
}

// ============================================
// DELETE ITEM (GENERIC)
// ============================================
async function deleteItem(collection, id) {
    if (!confirm('Hapus item ini?')) return;
    try {
        await db.collection(collection).doc(id).delete();
        showToast('Item berhasil dihapus', 'success');
        loadPage(currentPage);
    } catch (error) { showToast('Gagal menghapus item', 'error'); }
}

// ============================================
// NOTIFICATIONS
// ============================================
function addNotification(type, message, link) {
    notifications.unshift({ type, message, link, timestamp: new Date(), read: false });
    updateNotificationUI();
}

function updateNotificationUI() {
    const unread = notifications.filter(n => !n.read).length;
    if (notificationCountEl) {
        notificationCountEl.textContent = unread;
        notificationCountEl.style.display = unread > 0 ? 'block' : 'none';
    }
    if (notificationList) {
        if (notifications.length === 0) {
            notificationList.innerHTML = '<p class="no-notifications">Tidak ada notifikasi</p>';
            return;
        }
        notificationList.innerHTML = notifications.slice(0, 10).map((n, i) => `
            <div class="notification-item ${n.read ? '' : 'unread'}" onclick="markNotificationRead(${i})">
                <p><i class="fas fa-${n.type === 'chat' ? 'comments' : 'envelope'}"></i> ${n.message}</p>
                <small>${n.timestamp.toLocaleTimeString('id-ID')}</small>
            </div>
        `).join('');
    }
}

function setupNotifications() {
    notificationBell?.addEventListener('click', e => { e.stopPropagation(); notificationBell.classList.toggle('active'); });
    document.addEventListener('click', () => notificationBell?.classList.remove('active'));
    clearNotificationsBtn?.addEventListener('click', () => { notifications = []; updateNotificationUI(); });
}

function markNotificationRead(index) {
    if (notifications[index]) { notifications[index].read = true; updateNotificationUI(); }
}

// ============================================
// REALTIME LISTENERS
// ============================================
function setupRealtimeListeners() {
    db.collection('feedbacks').where('status', '==', 'pending').onSnapshot(snapshot => {
        const badge = document.getElementById('feedbackBadge');
        if (badge) { badge.textContent = snapshot.size; badge.style.display = snapshot.size > 0 ? 'inline-block' : 'none'; }
    });
}

// ============================================
// TOAST & UTILITIES
// ============================================
function showToast(message, type = 'success') {
    if (!toastEl) return;
    toastEl.textContent = message;
    toastEl.className = `toast-notification ${type} show`;
    setTimeout(() => toastEl.classList.remove('show'), 4000);
}

// ============================================
// GLOBAL FUNCTIONS
// ============================================
window.deleteItem = deleteItem;
window.deleteAlumniByYear = deleteAlumniByYear;
window.showReplyModal = showReplyModal;
window.closeModal = closeModal;
window.submitReply = submitReply;
window.markNotificationRead = markNotificationRead;

console.log('✅ Admin Panel SMAN 68 Jakarta - ALL FEATURES LOADED');
