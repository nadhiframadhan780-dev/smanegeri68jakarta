// ============================================
// SMAN 68 JAKARTA - MAIN WEBSITE JAVASCRIPT
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
const db = firebase.firestore();

// ============================================
// GLOBAL VARIABLES
// ============================================
let player;
let isMuted = true;
let chatSession = null;
let currentUser = null;
let chatEnded = false;
let isChatOnline = true;

// PTN Data (NO PLACEHOLDER)
const ptnList = [
    { name: 'UI', fullName: 'Universitas Indonesia', logo: 'https://fia.ui.ac.id/wp-content/uploads/182/2018/01/logo-UI.png' },
    { name: 'UGM', fullName: 'Universitas Gadjah Mada', logo: 'https://upload.wikimedia.org/wikipedia/id/thumb/9/9f/Emblem_of_Universitas_Gadjah_Mada.svg/1280px-Emblem_of_Universitas_Gadjah_Mada.svg.png' },
    { name: 'ITB', fullName: 'Institut Teknologi Bandung', logo: 'https://upload.wikimedia.org/wikipedia/id/9/95/Logo_Institut_Teknologi_Bandung.png' },
    { name: 'UNAIR', fullName: 'Universitas Airlangga', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/65/Logo-Branding-UNAIR-biru.png/500px-Logo-Branding-UNAIR-biru.png' },
    { name: 'IPB', fullName: 'Institut Pertanian Bogor', logo: 'https://www.ipb.ac.id/wp-content/uploads/2023/12/Logo-IPB-University_Vertical.png' },
    { name: 'UNDIP', fullName: 'Universitas Diponegoro', logo: 'https://upload.wikimedia.org/wikipedia/id/2/20/Logo_Universitas_Diponegoro.png' },
    { name: 'UNPAD', fullName: 'Universitas Padjadjaran', logo: 'https://www.unpad.ac.id/wp-content/uploads/2018/04/logo-unpad1.png' },
    { name: 'UB', fullName: 'Universitas Brawijaya', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/bb/Logo_Universitas_Brawijaya.svg/960px-Logo_Universitas_Brawijaya.svg.png' },
    { name: 'ITS', fullName: 'Institut Teknologi Sepuluh Nopember', logo: 'https://upload.wikimedia.org/wikipedia/id/c/c4/Badge_ITS.png' },
    { name: 'UNJ', fullName: 'Universitas Negeri Jakarta', logo: 'https://unj.ac.id/wp-content/uploads/2025/02/UNJ-LOGO-512-PX-1.png' },
    { name: 'UPNVJ', fullName: 'UPN Veteran Jakarta', logo: 'https://www.upnvj.ac.id/id/files/large/89f8a80e388ced3704b091e21f510755' }
];

const defaultAlumniData = {
    'UI': 2450, 'UGM': 1850, 'ITB': 1650, 'UNAIR': 1420, 'IPB': 1350,
    'UNDIP': 1280, 'UNPAD': 1150, 'UB': 980, 'ITS': 890, 'UNJ': 750, 'UPNVJ': 520
};

const linkUrls = {
    loginSiswa: './login-siswa-sman-68-jakarta.html',
    loginGuru: './login-guru-sman-68-jakarta.html',
    ppdb: './countdown-SPMB-2026-2027.html',
    virsch: './virsch-68.html'
};

// ============================================
// DOM ELEMENTS
// ============================================
const DOM = {
    preloader: document.getElementById('preloader'),
    navToggle: document.getElementById('navToggle'),
    navMenu: document.getElementById('navMenu'),
    navLinks: document.querySelectorAll('.nav-link'),
    yearSelect: document.getElementById('yearSelect'),
    ptnGrid: document.getElementById('ptnGrid'),
    newsGrid: document.getElementById('newsGrid'),
    agendaGrid: document.getElementById('agendaGrid'),
    galleryGrid: document.getElementById('galleryGrid'),
    testimonialGrid: document.getElementById('testimonialGrid'),
    facilityGrid: document.getElementById('facilityGrid'),
    operationalHours: document.getElementById('operationalHours'),
    newsModal: document.getElementById('newsModal'),
    newsModalBody: document.getElementById('newsModalBody'),
    historyModal: document.getElementById('historyModal'),
    historyList: document.getElementById('historyList'),
    tutorialModal: document.getElementById('tutorialModal'),
    privacyModal: document.getElementById('privacyModal'),
    toastContainer: document.getElementById('toastContainer'),
    floatingMenu: document.querySelector('.floating-menu'),
    floatingToggle: document.getElementById('floatingToggle'),
    floatingItems: document.getElementById('floatingItems')
};

// ============================================
// YOUTUBE PLAYER - PUTAR BERURUTAN
// ============================================
const videoList = [
    'hDZ3-jZ4Rnw',  // ID Video 1
    'cBbahZk3mMc'    // ID Video 2 (GANTI dengan ID video kedua)
];

let currentVideoIndex = 0;

function onYouTubeIframeAPIReady() {
    player = new YT.Player('youtubePlayer', {
        videoId: videoList[currentVideoIndex],
        playerVars: {
            autoplay: 1,
            mute: 1,
            controls: 0,
            loop: 1,
            playlist: videoList.join(','), // Playlist kedua video
            modestbranding: 1,
            rel: 0,
            showinfo: 0,
            iv_load_policy: 3
        },
        events: {
            onReady: () => player.playVideo(),
            onStateChange: (event) => {
                // Saat video selesai, putar video berikutnya
                if (event.data === 0) {
                    currentVideoIndex = (currentVideoIndex + 1) % videoList.length;
                    player.loadVideoById(videoList[currentVideoIndex]);
                }
            }
        }
    });
}

const tag = document.createElement('script');
tag.src = "https://www.youtube.com/iframe_api";
document.head.appendChild(tag);

// ============================================
// INITIALIZATION
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => DOM.preloader?.classList.add('hide'), 500);
    AOS.init({ duration: 800, once: true, offset: 100 });
    initializeApp();
});

function initializeApp() {
    setupNavigation();
    setupSmoothScroll();
    setupFloatingMenu();
    setupVideoSound();
    setupLinks();
    setupNavbarScroll();
    setupActiveNavOnScroll();
    
    initializePTNGrid();
    initializeLiveChat();
    initializeTutorial();
    initializePrivacy();
    initializeFeedback();
    initializeNewsModal();
    initializeHistoryModal();
    
    loadAllData();
    setupRealtimeListeners();
    populateYearSelect();
    checkChatStatus();
}

// ============================================
// SETUP FUNCTIONS
// ============================================
function setupNavigation() {
    DOM.navToggle?.addEventListener('click', () => {
        DOM.navToggle.classList.toggle('active');
        DOM.navMenu?.classList.toggle('active');
    });
    DOM.navLinks.forEach(link => {
        link.addEventListener('click', () => {
            DOM.navToggle.classList.remove('active');
            DOM.navMenu?.classList.remove('active');
            DOM.navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
        });
    });
}

function setupSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', e => {
            const href = anchor.getAttribute('href');
            if (href === '#') return;
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                window.scrollTo({ top: target.offsetTop - 80, behavior: 'smooth' });
            }
        });
    });
}

function setupFloatingMenu() {
    DOM.floatingToggle?.addEventListener('click', e => {
        e.stopPropagation();
        DOM.floatingMenu?.classList.toggle('active');
    });
    document.addEventListener('click', () => DOM.floatingMenu?.classList.remove('active'));
}

function setupVideoSound() {
    document.getElementById('soundToggle')?.addEventListener('click', () => {
        if (!player) return;
        if (isMuted) { player.unMute(); document.querySelector('#soundToggle i').className = 'fas fa-volume-up'; }
        else { player.mute(); document.querySelector('#soundToggle i').className = 'fas fa-volume-mute'; }
        isMuted = !isMuted;
    });
}

function setupLinks() {
    const linkIds = [
        'topLoginSiswa','topLoginGuru','topPPDB','topVirsch',
        'floatLoginSiswa','floatLoginGuru','floatPPDB','floatVirsch',
        'footerLoginSiswa','footerLoginGuru','footerPPDB','footerVirsch'
    ];
    linkIds.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener('click', e => {
                e.preventDefault();
                if (id.includes('Siswa') || id.includes('LoginSiswa')) window.open(linkUrls.loginSiswa, '_blank');
                else if (id.includes('Guru') || id.includes('LoginGuru')) window.open(linkUrls.loginGuru, '_blank');
                else if (id.includes('PPDB') || id.includes('ppdb')) window.open(linkUrls.ppdb, '_blank');
                else if (id.includes('Virsch') || id.includes('virsch')) window.open(linkUrls.virsch, '_blank');
            });
        }
    });
}

function setupNavbarScroll() {
    window.addEventListener('scroll', () => {
        const navbar = document.getElementById('navbar');
        if (window.scrollY > 100) navbar?.classList.add('scrolled');
        else navbar?.classList.remove('scrolled');
    });
}

function setupActiveNavOnScroll() {
    const sections = document.querySelectorAll('section[id]');
    window.addEventListener('scroll', () => {
        let current = '';
        const scrollY = window.scrollY + 100;
        sections.forEach(section => {
            if (scrollY >= section.offsetTop && scrollY < section.offsetTop + section.offsetHeight) {
                current = section.getAttribute('id');
            }
        });
        DOM.navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) link.classList.add('active');
        });
    });
}

// ============================================
// PTN GRID
// ============================================
function initializePTNGrid() {
    if (!DOM.ptnGrid) return;
    DOM.ptnGrid.innerHTML = '';
    ptnList.forEach(ptn => {
        const card = document.createElement('div');
        card.className = 'ptn-card';
        card.innerHTML = `
            <img src="${ptn.logo}" alt="${ptn.name}" loading="lazy">
            <h4>${ptn.fullName}</h4>
            <div class="ptn-count" id="count-${ptn.name}">0</div>
        `;
        DOM.ptnGrid.appendChild(card);
    });
}

function populateYearSelect() {
    if (!DOM.yearSelect) return;
    const currentYear = new Date().getFullYear();
    for (let y = 2011; y <= currentYear; y++) {
        const opt = document.createElement('option');
        opt.value = y; opt.textContent = y;
        DOM.yearSelect.appendChild(opt);
    }
    DOM.yearSelect.addEventListener('change', loadPTNData);
}

async function loadPTNData() {
    const selectedYear = DOM.yearSelect?.value || 'all';
    try {
        let query = db.collection('alumni');
        if (selectedYear !== 'all') query = query.where('year', '==', parseInt(selectedYear));
        const snapshot = await query.get();
        const counts = {};
        if (!snapshot.empty) snapshot.forEach(doc => { const d = doc.data(); counts[d.ptn] = (counts[d.ptn] || 0) + 1; });
        ptnList.forEach(ptn => {
            const el = document.getElementById(`count-${ptn.name}`);
            if (el) el.textContent = counts[ptn.name] || defaultAlumniData[ptn.name] || '0';
        });
    } catch (e) {
        ptnList.forEach(ptn => {
            const el = document.getElementById(`count-${ptn.name}`);
            if (el) el.textContent = defaultAlumniData[ptn.name] || '0';
        });
    }
}

// ============================================
// LOAD ALL DATA
// ============================================
function loadAllData() {
    loadPTNData();
    loadNewsData();
    loadAgendaData();
    loadGalleryData();
    loadTestimonialData();
    loadFacilityData();
    loadOperationalHours();
}

// ============================================
// NEWS
// ============================================
function initializeNewsModal() {
    DOM.newsModal?.querySelector('.modal-close-btn')?.addEventListener('click', () => DOM.newsModal.classList.remove('active'));
    DOM.newsModal?.addEventListener('click', e => { if (e.target === DOM.newsModal) DOM.newsModal.classList.remove('active'); });
}

async function loadNewsData() {
    if (!DOM.newsGrid) return;
    try {
        const snapshot = await db.collection('news').orderBy('date', 'desc').limit(6).get();
        DOM.newsGrid.innerHTML = '';
        if (snapshot.empty) { DOM.newsGrid.innerHTML = '<div class="empty-state"><p>Belum ada berita</p></div>'; return; }
        snapshot.forEach(doc => DOM.newsGrid.appendChild(createNewsCard(doc.id, doc.data())));
    } catch (e) { DOM.newsGrid.innerHTML = '<div class="empty-state"><p>Gagal memuat berita</p></div>'; }
}

function createNewsCard(id, data) {
    const card = document.createElement('div');
    card.className = 'news-card';
    const date = data.date?.toDate ? new Date(data.date.toDate()).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '';
    card.innerHTML = `
        <img src="${data.image || ''}" alt="${data.title}" class="news-image" loading="lazy">
        <div class="news-content">
            <div class="news-date"><i class="far fa-calendar-alt"></i> ${date}</div>
            <h3 class="news-title">${data.title}</h3>
            <p class="news-excerpt">${data.excerpt || data.content?.substring(0, 100) || ''}...</p>
            <button class="btn-readmore">Baca Selengkapnya →</button>
        </div>
    `;
    card.querySelector('.btn-readmore').addEventListener('click', () => showNewsDetail(data, date));
    return card;
}

function showNewsDetail(data, date) {
    if (!DOM.newsModal || !DOM.newsModalBody) return;
    DOM.newsModalBody.innerHTML = `
        <h2>${data.title}</h2>
        <p style="color:var(--primary-blue);margin-bottom:20px;"><i class="far fa-calendar-alt"></i> ${date}</p>
        ${data.image ? `<img src="${data.image}" style="width:100%;border-radius:12px;margin-bottom:20px;">` : ''}
        <div style="line-height:1.8;">${data.content || 'Konten lengkap akan segera tersedia.'}</div>
    `;
    DOM.newsModal.classList.add('active');
}

// ============================================
// AGENDA
// ============================================
async function loadAgendaData() {
    if (!DOM.agendaGrid) return;
    try {
        const today = new Date(); today.setHours(0,0,0,0);
        const snapshot = await db.collection('agenda').where('date', '>=', today).orderBy('date', 'asc').limit(6).get();
        DOM.agendaGrid.innerHTML = '';
        if (snapshot.empty) { DOM.agendaGrid.innerHTML = '<div class="empty-state"><p>Belum ada agenda</p></div>'; return; }
        snapshot.forEach(doc => DOM.agendaGrid.appendChild(createAgendaCard(doc.data())));
    } catch (e) { DOM.agendaGrid.innerHTML = '<div class="empty-state"><p>Gagal memuat agenda</p></div>'; }
}

function createAgendaCard(data) {
    const card = document.createElement('div');
    card.className = 'agenda-card';
    const date = data.date?.toDate ? new Date(data.date.toDate()).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) : '';
    card.innerHTML = `
        <span class="agenda-category">${data.category || 'Akademik'}</span>
        <h4 class="agenda-title">${data.title}</h4>
        <div class="agenda-detail"><i class="fas fa-map-marker-alt"></i> ${data.location}</div>
        <div class="agenda-detail"><i class="far fa-clock"></i> ${data.time}</div>
        <div class="agenda-date"><i class="far fa-calendar-alt"></i> ${date}</div>
    `;
    return card;
}

// ============================================
// GALLERY
// ============================================
async function loadGalleryData() {
    if (!DOM.galleryGrid) return;
    try {
        const snapshot = await db.collection('gallery').limit(8).get();
        DOM.galleryGrid.innerHTML = '';
        if (snapshot.empty) { DOM.galleryGrid.innerHTML = '<div class="empty-state"><p>Belum ada foto</p></div>'; return; }
        snapshot.forEach(doc => DOM.galleryGrid.appendChild(createGalleryItem(doc.data())));
    } catch (e) { DOM.galleryGrid.innerHTML = '<div class="empty-state"><p>Gagal memuat galeri</p></div>'; }
}

function createGalleryItem(data) {
    const item = document.createElement('div');
    item.className = 'gallery-item';
    item.innerHTML = `
        <img src="${data.imageUrl}" alt="${data.caption}" loading="lazy">
        <div class="gallery-overlay"><i class="fas fa-search-plus"></i><p>${data.caption}</p></div>
    `;
    item.addEventListener('click', () => showLightbox(data.imageUrl, data.caption));
    return item;
}

function showLightbox(url, caption) {
    const lb = document.createElement('div');
    lb.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.95);z-index:9999;display:flex;align-items:center;justify-content:center;cursor:pointer';
    lb.innerHTML = `<div style="max-width:90%;max-height:90%;text-align:center"><img src="${url}" style="max-width:100%;max-height:85vh;border-radius:16px"><p style="color:#fff;margin-top:15px">${caption}</p><button style="position:absolute;top:20px;right:30px;background:none;border:none;color:#fff;font-size:40px;cursor:pointer">&times;</button></div>`;
    document.body.appendChild(lb);
    lb.addEventListener('click', e => { if (e.target === lb || e.target.tagName === 'BUTTON') document.body.removeChild(lb); });
}

// ============================================
// TESTIMONIALS
// ============================================
async function loadTestimonialData() {
    if (!DOM.testimonialGrid) return;
    try {
        const snapshot = await db.collection('testimonials').limit(6).get();
        DOM.testimonialGrid.innerHTML = '';
        if (snapshot.empty) { DOM.testimonialGrid.innerHTML = '<div class="empty-state"><p>Belum ada testimoni</p></div>'; return; }
        snapshot.forEach(doc => DOM.testimonialGrid.appendChild(createTestimonialCard(doc.data())));
    } catch (e) { DOM.testimonialGrid.innerHTML = '<div class="empty-state"><p>Gagal memuat testimoni</p></div>'; }
}

function createTestimonialCard(data) {
    const card = document.createElement('div');
    card.className = 'testimonial-card';
    const stars = '★'.repeat(data.stars || 5) + '☆'.repeat(5 - (data.stars || 5));
    const initials = (data.author || 'A').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    card.innerHTML = `
        <div class="testimonial-stars">${stars}</div>
        <p class="testimonial-text">"${data.text}"</p>
        <div class="testimonial-author"><div class="author-avatar">${initials}</div><div class="author-info"><h4>${data.author}</h4><p>${data.role}</p></div></div>
    `;
    return card;
}

// ============================================
// FACILITIES
// ============================================
async function loadFacilityData() {
    if (!DOM.facilityGrid) return;
    try {
        const snapshot = await db.collection('facilities').get();
        DOM.facilityGrid.innerHTML = '';
        if (snapshot.empty) { DOM.facilityGrid.innerHTML = '<div class="empty-state"><p>Belum ada fasilitas</p></div>'; return; }
        snapshot.forEach(doc => DOM.facilityGrid.appendChild(createFacilityCard(doc.data())));
    } catch (e) { DOM.facilityGrid.innerHTML = '<div class="empty-state"><p>Gagal memuat fasilitas</p></div>'; }
}

function createFacilityCard(data) {
    const card = document.createElement('div');
    card.className = 'facility-card';
    card.innerHTML = `<img src="${data.imageUrl}" alt="${data.name}" loading="lazy"><div class="facility-info"><h4>${data.name}</h4><p>${data.description}</p></div>`;
    return card;
}

// ============================================
// OPERATIONAL HOURS
// ============================================
async function loadOperationalHours() {
    if (!DOM.operationalHours) return;
    try {
        const doc = await db.collection('settings').doc('operationalHours').get();
        const days = ['Senin','Selasa','Rabu','Kamis','Jumat','Sabtu','Minggu'];
        if (doc.exists) {
            DOM.operationalHours.innerHTML = days.map(d => doc.data()[d.toLowerCase()] ? `<div><strong>${d}:</strong> ${doc.data()[d.toLowerCase()]}</div>` : '').join('');
        } else {
            DOM.operationalHours.innerHTML = '<div><strong>Senin-Kamis:</strong> 07.00-16.00 WIB</div><div><strong>Jumat:</strong> 07.00-16.30 WIB</div><div><strong>Sabtu:</strong> 07.00-13.00 WIB</div><div><strong>Minggu:</strong> Tutup</div>';
        }
    } catch (e) { DOM.operationalHours.innerHTML = '<div>Gagal memuat jam operasional</div>'; }
}

// ============================================
// CHECK CHAT STATUS (ONLINE/OFFLINE)
// ============================================
async function checkChatStatus() {
    try {
        const doc = await db.collection('settings').doc('chatStatus').get();
        isChatOnline = doc.exists ? (doc.data().isOnline !== false) : true;
        updateChatUI();
    } catch (e) { isChatOnline = true; updateChatUI(); }
    
    // Real-time listener
    db.collection('settings').doc('chatStatus').onSnapshot(doc => {
        if (doc.exists) {
            isChatOnline = doc.data().isOnline !== false;
            updateChatUI();
            if (!isChatOnline && chatSession) {
                showToast('Helpdesk telah offline. Chat akan diakhiri.', 'error');
                endChatSession();
            }
        }
    });
}

function updateChatUI() {
    const statusText = document.getElementById('chatStatusText');
    const offlineEl = document.getElementById('chatOffline');
    const registration = document.getElementById('chatRegistration');
    
    if (statusText) {
        statusText.innerHTML = isChatOnline ? '<span class="online-dot"></span> Online' : '<span style="color:#ef4444;">●</span> Offline';
    }
    if (offlineEl && registration) {
        if (isChatOnline) {
            offlineEl.style.display = 'none';
            registration.style.display = 'block';
        } else {
            offlineEl.style.display = 'block';
            registration.style.display = 'none';
        }
    }
}

// ============================================
// LIVE CHAT (UPDATED)
// ============================================
function initializeLiveChat() {
    const toggle = document.getElementById('livechatToggle');
    const window = document.getElementById('livechatWindow');
    const close = document.getElementById('livechatClose');
    const form = document.getElementById('chatRegForm');
    const registration = document.getElementById('chatRegistration');
    const messages = document.getElementById('chatMessages');
    const footer = document.getElementById('chatFooter');
    const messageList = document.getElementById('chatMessageList');
    const input = document.getElementById('chatInput');
    const sendBtn = document.getElementById('sendMessageBtn');
    const endBtn = document.getElementById('endChatBtn');
    const endedNotification = document.getElementById('chatEndedNotification');
    const btnNewChat = document.getElementById('btnNewChat');
    
    toggle?.addEventListener('click', () => window?.classList.toggle('active'));
    close?.addEventListener('click', () => window?.classList.remove('active'));
    
    form?.addEventListener('submit', async e => {
        e.preventDefault();
        
        if (!isChatOnline) {
            showToast('Helpdesk sedang offline. Silakan coba lagi nanti.', 'error');
            return;
        }
        
        const name = document.getElementById('chatName').value.trim();
        const phone = document.getElementById('chatPhone').value.trim();
        const status = document.getElementById('chatStatusSelect').value;
        
        if (!name || !phone || !status) { showToast('Mohon isi semua field', 'error'); return; }
        
        currentUser = { name, phone, status };
        
        try {
            const sessionRef = await db.collection('chatSessions').add({
                userName: name, userPhone: phone, userStatus: status,
                startedAt: firebase.firestore.FieldValue.serverTimestamp(), status: 'active'
            });
            
            chatSession = sessionRef.id;
            chatEnded = false;
            
            subscribeToMessages(chatSession);
            
            registration.style.display = 'none';
            messages.style.display = 'block';
            footer.style.display = 'flex';
            endedNotification.style.display = 'none';
            messageList.innerHTML = '';
            
            addBotMessage('Terima kasih telah menghubungi helpdesk SMAN 68 JAKARTA, operator segera membalas pertanyaan atau keluhan anda, silahkan kirimkan pesan pertanyaan atau keluhan.');
            showToast('Chat dimulai!', 'success');
        } catch (error) { showToast('Gagal memulai chat', 'error'); }
    });
    
    sendBtn?.addEventListener('click', sendChatMessage);
    input?.addEventListener('keypress', e => { if (e.key === 'Enter') sendChatMessage(); });
    
    endBtn?.addEventListener('click', async () => {
        if (!chatSession || chatEnded) return;
        
        try {
            await db.collection('chatSessions').doc(chatSession).update({
                status: 'ended', endedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            
            chatEnded = true;
            input.disabled = true;
            sendBtn.disabled = true;
            endBtn.disabled = true;
            
            // Tampilkan notifikasi chat berakhir
            messages.style.display = 'none';
            footer.style.display = 'none';
            endedNotification.style.display = 'block';
            
            showToast('Chat telah diakhiri.', 'success');
        } catch (error) { showToast('Gagal mengakhiri chat', 'error'); }
    });
    
    // Tombol Mulai Obrolan Baru
    btnNewChat?.addEventListener('click', () => {
        resetChat();
    });
    
    function sendChatMessage() {
        const message = input.value.trim();
        if (!message || !chatSession || chatEnded) return;
        
        db.collection('chatSessions').doc(chatSession).collection('messages').add({
            sender: 'user', senderName: currentUser.name, message,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        }).catch(() => showToast('Gagal mengirim pesan', 'error'));
        
        addUserMessage(message);
        input.value = '';
    }
    
    function subscribeToMessages(sessionId) {
        db.collection('chatSessions').doc(sessionId).collection('messages')
            .orderBy('timestamp', 'asc')
            .onSnapshot(snapshot => {
                snapshot.docChanges().forEach(change => {
                    if (change.type === 'added' && change.doc.data().sender === 'operator') {
                        addOperatorMessage(change.doc.data().message);
                    }
                });
            });
        
        db.collection('chatSessions').doc(sessionId).onSnapshot(doc => {
            if (doc.exists && doc.data().status === 'ended' && !chatEnded) {
                chatEnded = true;
                input.disabled = true;
                sendBtn.disabled = true;
                endBtn.disabled = true;
                messages.style.display = 'none';
                footer.style.display = 'none';
                endedNotification.style.display = 'block';
            }
        });
    }
    
    function addUserMessage(msg) {
        const div = document.createElement('div');
        div.className = 'message-user';
        div.innerHTML = `<div>${msg}</div>`;
        messageList.appendChild(div);
        messageList.scrollTop = messageList.scrollHeight;
    }
    
    function addOperatorMessage(msg) {
        const div = document.createElement('div');
        div.className = 'message-operator';
        div.innerHTML = `<div>${msg}</div>`;
        messageList.appendChild(div);
        messageList.scrollTop = messageList.scrollHeight;
    }
    
    function addBotMessage(msg) {
        const div = document.createElement('div');
        div.className = 'message-bot';
        div.textContent = msg;
        messageList.appendChild(div);
    }
    
    function resetChat() {
        registration.style.display = 'block';
        messages.style.display = 'none';
        footer.style.display = 'none';
        endedNotification.style.display = 'none';
        messageList.innerHTML = '';
        document.getElementById('chatRegForm').reset();
        chatSession = null;
        currentUser = null;
        chatEnded = false;
        input.disabled = false;
        sendBtn.disabled = false;
        endBtn.disabled = false;
    }
}

function endChatSession() {
    // Client-side reset
    chatEnded = true;
    document.getElementById('chatInput').disabled = true;
    document.getElementById('sendMessageBtn').disabled = true;
    document.getElementById('endChatBtn').disabled = true;
    document.getElementById('chatMessages').style.display = 'none';
    document.getElementById('chatFooter').style.display = 'none';
    document.getElementById('chatEndedNotification').style.display = 'block';
}

// ============================================
// FEEDBACK
// ============================================
function initializeFeedback() {
    const form = document.getElementById('feedbackForm');
    const historyBtn = document.getElementById('showHistoryBtn');
    
    form?.addEventListener('submit', async e => {
        e.preventDefault();
        const name = document.getElementById('feedbackName').value.trim() || 'Anonymous';
        const email = document.getElementById('feedbackEmail').value.trim();
        const category = document.getElementById('feedbackCategory').value;
        const message = document.getElementById('feedbackMessage').value.trim();
        
        if (!email || !category || !message) { showToast('Mohon isi semua field wajib', 'error'); return; }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { showToast('Format email tidak valid', 'error'); return; }
        
        try {
            await db.collection('feedbacks').add({
                name, email, category, message, status: 'pending',
                createdAt: firebase.firestore.FieldValue.serverTimestamp(), replies: []
            });
            showToast('✅ Pesan akan direspon dalam 1x24 jam. Terima kasih!', 'success');
            form.reset();
        } catch (error) { showToast('❌ Terjadi kesalahan', 'error'); }
    });
    
    historyBtn?.addEventListener('click', () => DOM.historyModal?.classList.add('active'));
}

function initializeHistoryModal() {
    const closeBtn = DOM.historyModal?.querySelector('.history-close');
    const loadBtn = document.getElementById('loadHistoryBtn');
    
    closeBtn?.addEventListener('click', () => DOM.historyModal?.classList.remove('active'));
    DOM.historyModal?.addEventListener('click', e => { if (e.target === DOM.historyModal) DOM.historyModal.classList.remove('active'); });
    
    loadBtn?.addEventListener('click', async () => {
        const email = document.getElementById('historyEmail').value.trim();
        if (!email) { showToast('Masukkan email Anda', 'error'); return; }
        
        try {
            const snapshot = await db.collection('feedbacks').where('email', '==', email).orderBy('createdAt', 'desc').get();
            if (!DOM.historyList) return;
            DOM.historyList.innerHTML = '';
            
            if (snapshot.empty) { DOM.historyList.innerHTML = '<p style="text-align:center;padding:20px;">Tidak ada riwayat</p>'; return; }
            
            snapshot.forEach(doc => {
                const data = doc.data();
                const date = data.createdAt ? new Date(data.createdAt.toDate()).toLocaleString('id-ID') : '';
                const repliesHtml = data.replies?.map(r => `<div style="background:#e8f5e9;padding:10px;border-radius:8px;margin-top:8px;"><strong>Balasan:</strong><br>${r.message}</div>`).join('') || '';
                
                const item = document.createElement('div');
                item.className = 'history-item';
                item.innerHTML = `
                    <div style="display:flex;justify-content:space-between;margin-bottom:8px;"><strong>${data.category}</strong><small>${date}</small></div>
                    <p>${data.message}</p>${repliesHtml}
                `;
                DOM.historyList.appendChild(item);
            });
        } catch (error) { showToast('Gagal memuat riwayat', 'error'); }
    });
}

// ============================================
// TUTORIAL & PRIVACY
// ============================================
function initializeTutorial() {
    document.getElementById('tutorialTrigger')?.addEventListener('click', () => DOM.tutorialModal?.classList.add('active'));
    document.getElementById('tutorialClose')?.addEventListener('click', () => DOM.tutorialModal?.classList.remove('active'));
    DOM.tutorialModal?.addEventListener('click', e => { if (e.target === DOM.tutorialModal) DOM.tutorialModal.classList.remove('active'); });
}

function initializePrivacy() {
    document.getElementById('privacyLink')?.addEventListener('click', e => { e.preventDefault(); DOM.privacyModal?.classList.add('active'); });
    DOM.privacyModal?.querySelector('.privacy-close')?.addEventListener('click', () => DOM.privacyModal?.classList.remove('active'));
    DOM.privacyModal?.addEventListener('click', e => { if (e.target === DOM.privacyModal) DOM.privacyModal.classList.remove('active'); });
}

// ============================================
// TOAST
// ============================================
function showToast(message, type = 'success') {
    if (!DOM.toastContainer) return;
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `<i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i><span>${message}</span>`;
    DOM.toastContainer.appendChild(toast);
    setTimeout(() => toast.remove(), 4000);
}

// ============================================
// REALTIME LISTENERS
// ============================================
function setupRealtimeListeners() {
    db.collection('news').onSnapshot(() => loadNewsData());
    db.collection('agenda').onSnapshot(() => loadAgendaData());
    db.collection('gallery').onSnapshot(() => loadGalleryData());
    db.collection('facilities').onSnapshot(() => loadFacilityData());
    db.collection('testimonials').onSnapshot(() => loadTestimonialData());
    db.collection('alumni').onSnapshot(() => loadPTNData());
    db.collection('settings').doc('operationalHours').onSnapshot(() => loadOperationalHours());
}

console.log('✅ SMAN 68 Jakarta - Website Updated Successfully');
