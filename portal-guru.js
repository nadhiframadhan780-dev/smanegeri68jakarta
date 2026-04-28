// Firebase Configuration
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

// Global
let currentGuru = null;
let selectedStatus = '';
let jadwalChecked = {};

// Toast
function showToast(type, title, message, duration = 4000) {
    const container = document.getElementById('toastContainer');
    const icons = { success: 'check-circle', error: 'exclamation-circle', warning: 'exclamation-triangle' };
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `<i class="fas fa-${icons[type]}"></i><div class="toast-content"><div class="toast-title">${title}</div><div class="toast-message">${message}</div></div>`;
    container.appendChild(toast);
    setTimeout(() => { toast.style.transform = 'translateX(120%)'; setTimeout(() => toast.remove(), 300); }, duration);
}

// Preloader
setTimeout(() => document.getElementById('preloader')?.classList.add('hide'), 500);

// Password Toggle
document.getElementById('loginPassToggle').addEventListener('click', function() {
    const input = document.getElementById('loginPassword');
    input.type = input.type === 'password' ? 'text' : 'password';
    this.classList.toggle('fa-eye'); this.classList.toggle('fa-eye-slash');
});

// NUPTK only numbers
document.getElementById('loginNuptk').addEventListener('input', function() {
    this.value = this.value.replace(/[^0-9]/g, '').slice(0, 16);
});

// Login
document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const nuptk = document.getElementById('loginNuptk').value.trim();
    const password = document.getElementById('loginPassword').value;
    
    if (!nuptk || !password) { showToast('error', 'Gagal', 'NUPTK dan Password wajib diisi!'); return; }
    if (nuptk.length < 16) { showToast('error', 'Gagal', 'NUPTK harus 16 digit!'); return; }
    
    try {
        const snapshot = await db.collection('guru').where('nuptk', '==', nuptk).where('password', '==', password).get();
        if (snapshot.empty) { showToast('error', 'Gagal', 'NUPTK atau Password salah!'); return; }
        
        const doc = snapshot.docs[0];
        currentGuru = { id: doc.id, ...doc.data() };
        
        if (currentGuru.status !== 'approved') { showToast('warning', 'Pending', 'Akun Anda belum disetujui operator.'); return; }
        
        document.getElementById('loginOverlay').style.display = 'none';
        document.getElementById('mainPortal').style.display = 'block';
        document.getElementById('userBadge').textContent = currentGuru.nama;
        
        initPortal();
    } catch (error) { showToast('error', 'Error', 'Terjadi kesalahan.'); }
});

// Logout
document.getElementById('logoutBtn').addEventListener('click', () => {
    currentGuru = null;
    document.getElementById('loginOverlay').style.display = 'flex';
    document.getElementById('mainPortal').style.display = 'none';
});

// Init Portal
function initPortal() {
    updateDateTime();
    setInterval(updateDateTime, 1000);
    document.getElementById('todayDate').textContent = new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    document.getElementById('jadwalDate').textContent = document.getElementById('todayDate').textContent;
    
    setupTabs();
    setupStatusCards();
    setupAbsensi();
    loadHistory();
    loadKalender();
    loadJadwal();
}

function updateDateTime() {
    const now = new Date();
    document.getElementById('datetime').textContent = now.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

// Tabs
function setupTabs() {
    document.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            tab.classList.add('active');
            document.getElementById(tab.dataset.tab + 'Tab').classList.add('active');
        });
    });
}

// Status Cards
function setupStatusCards() {
    document.querySelectorAll('.status-card').forEach(card => {
        card.addEventListener('click', () => {
            document.querySelectorAll('.status-card').forEach(c => c.classList.remove('active'));
            card.classList.add('active');
            selectedStatus = card.dataset.status;
            
            const keteranganGroup = document.getElementById('keteranganGroup');
            if (selectedStatus === 'hadir') {
                keteranganGroup.style.display = 'none';
            } else {
                keteranganGroup.style.display = 'block';
            }
        });
    });
}

// Absensi
function setupAbsensi() {
    document.getElementById('absensiForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!selectedStatus) { showToast('error', 'Pilih Status', 'Silakan pilih status kehadiran!'); return; }
        
        const buktiUrl = document.getElementById('buktiUrl').value.trim();
        const keterangan = document.getElementById('keterangan').value.trim();
        
        if (!buktiUrl) { showToast('error', 'Link Diperlukan', 'Link Google Drive wajib diisi!'); return; }
        if (selectedStatus !== 'hadir' && !keterangan) { showToast('error', 'Keterangan', 'Keterangan wajib diisi!'); return; }
        
        const btn = document.getElementById('absenBtn');
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Mengirim...';
        
        try {
            const now = new Date();
            const todayStr = now.toISOString().split('T')[0];
            
            // Cek sudah absen hari ini
            const existing = await db.collection('absensiGuru').where('guruId', '==', currentGuru.id).where('tanggal', '==', todayStr).get();
            if (!existing.empty) { showToast('warning', 'Sudah Absen', 'Anda sudah absen hari ini!'); btn.disabled = false; btn.innerHTML = '<i class="fas fa-paper-plane"></i> Absen Sekarang'; return; }
            
            const jamAbsen = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
            const jamBatas = new Date(); jamBatas.setHours(6, 30, 0, 0);
            
            let statusMessage = '';
            if (selectedStatus === 'hadir') {
                statusMessage = now < jamBatas ? `Hadir tepat waktu (${jamAbsen}) ✅` : `Anda terlambat hadir (${jamAbsen}) ⚠️`;
            }
            
            await db.collection('absensiGuru').add({
                guruId: currentGuru.id,
                nama: currentGuru.nama,
                nuptk: currentGuru.nuptk,
                mapel: currentGuru.mapel,
                status: selectedStatus,
                keterangan: keterangan || '-',
                buktiUrl: buktiUrl,
                tanggal: todayStr,
                timestamp: firebase.firestore.FieldValue.serverTimestamp()
            });
            
            showToast('success', 'Absen Berhasil!', statusMessage || `Absen dikirim pada ${jamAbsen}`, 5000);
            
            document.querySelectorAll('.status-card').forEach(c => c.classList.remove('active'));
            selectedStatus = '';
            document.getElementById('absensiForm').reset();
            document.getElementById('keteranganGroup').style.display = 'none';
            loadHistory();
        } catch (error) { showToast('error', 'Gagal', 'Terjadi kesalahan.'); }
        finally { btn.disabled = false; btn.innerHTML = '<i class="fas fa-paper-plane"></i> Absen Sekarang'; }
    });
}

// Load History
async function loadHistory() {
    const container = document.getElementById('historyList');
    try {
        const snapshot = await db.collection('absensiGuru').where('guruId', '==', currentGuru.id).orderBy('timestamp', 'desc').limit(20).get();
        if (snapshot.empty) { container.innerHTML = '<p class="empty-state">Belum ada riwayat absensi</p>'; return; }
        container.innerHTML = '';
        snapshot.forEach(doc => {
            const d = doc.data();
            const tgl = d.timestamp?.toDate();
            const dateStr = tgl?.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' });
            const timeStr = tgl?.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
            const statusLabels = { hadir: 'Hadir', sakit: 'Sakit', izin: 'Izin', dispensasi_dinas: 'Dispensasi Dinas', dispensasi_sekolah: 'Dispensasi Sekolah' };
            
            const item = document.createElement('div');
            item.className = 'history-item';
            item.innerHTML = `
                <div class="history-icon ${d.status}"><i class="fas fa-${d.status === 'hadir' ? 'check' : d.status === 'sakit' ? 'notes-medical' : d.status === 'izin' ? 'envelope' : 'building'}"></i></div>
                <div class="history-info">
                    <div class="date">${dateStr}</div>
                    <div class="time">${timeStr} • <span class="status-text">${statusLabels[d.status]}</span></div>
                    ${d.keterangan !== '-' ? `<div style="font-size:0.8rem;color:var(--dark-gray);">${d.keterangan}</div>` : ''}
                </div>
                <a href="${d.buktiUrl}" target="_blank" class="history-link"><i class="fab fa-google-drive"></i> Bukti</a>
            `;
            container.appendChild(item);
        });
    } catch (e) { container.innerHTML = '<p class="empty-state">Gagal memuat riwayat</p>'; }
}

// Load Kalender
function loadKalender() {
    const container = document.getElementById('kalenderGrid');
    const now = new Date();
    const month = now.getMonth();
    const year = now.getFullYear();
    const today = now.getDate();
    
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 0).getDate();
    const startDay = new Date(year, month, 1).getDay();
    
    const dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
    let html = dayNames.map(d => `<div class="kalender-day-header">${d}</div>`).join('');
    
    // Hari kosong sebelum tanggal 1
    for (let i = 0; i < startDay; i++) html += '<div class="kalender-day empty"></div>';
    
    // Tanggal penting
    const events = {
        1: { class: 'merah', text: 'Libur' },
        17: { class: 'merah', text: 'Libur' },
        10: { class: 'kuning', text: 'UTS' },
        11: { class: 'kuning', text: 'UTS' },
        12: { class: 'kuning', text: 'UTS' },
        13: { class: 'kuning', text: 'UTS' },
        14: { class: 'kuning', text: 'UTS' },
        20: { class: 'hijau', text: 'Libur' },
        21: { class: 'hijau', text: 'Libur' },
        22: { class: 'hijau', text: 'Libur' },
        23: { class: 'hijau', text: 'Libur' },
        24: { class: 'hijau', text: 'Libur' },
        25: { class: 'hijau', text: 'Libur' },
        26: { class: 'hijau', text: 'Libur' },
        5: { class: 'biru', text: 'Upacara' },
    };
    
    for (let day = 1; day <= daysInMonth; day++) {
        const event = events[day];
        const isToday = day === today ? ' today' : '';
        const eventClass = event ? event.class : '';
        const eventText = event ? `<span class="kalender-event">${event.text}</span>` : '';
        html += `<div class="kalender-day ${eventClass}${isToday}">${day}${eventText}</div>`;
    }
    
    container.innerHTML = html;
}

// Load Jadwal
function loadJadwal() {
    const container = document.getElementById('jadwalList');
    const jadwal = [
        { time: '06:30 - 07:00', kelas: 'XII.1', mapel: 'Upacara / Apel Pagi' },
        { time: '07:00 - 08:30', kelas: 'XII.3', mapel: currentGuru?.mapel || 'Mata Pelajaran' },
        { time: '08:30 - 10:00', kelas: 'XII.5', mapel: currentGuru?.mapel || 'Mata Pelajaran' },
        { time: '10:15 - 11:45', kelas: 'XI.2', mapel: currentGuru?.mapel || 'Mata Pelajaran' },
        { time: '12:00 - 13:30', kelas: 'XI.4', mapel: currentGuru?.mapel || 'Mata Pelajaran' },
        { time: '13:30 - 15:00', kelas: 'X.1', mapel: currentGuru?.mapel || 'Mata Pelajaran' },
    ];
    
    container.innerHTML = jadwal.map((j, i) => {
        const checked = jadwalChecked[i] || false;
        return `
            <div class="jadwal-item ${checked ? 'done' : ''}">
                <div class="jadwal-time">${j.time}</div>
                <div class="jadwal-info">
                    <div class="jadwal-kelas">${j.kelas}</div>
                    <div class="jadwal-mapel">${j.mapel}</div>
                </div>
                <div class="jadwal-check ${checked ? 'checked' : ''}" data-index="${i}">
                    ${checked ? '<i class="fas fa-check"></i>' : '<i class="far fa-circle"></i>'}
                </div>
            </div>
        `;
    }).join('');
    
    // Check listeners
    document.querySelectorAll('.jadwal-check').forEach(check => {
        check.addEventListener('click', () => {
            const index = check.dataset.index;
            jadwalChecked[index] = !jadwalChecked[index];
            loadJadwal();
        });
    });
}

// Check session
const savedSession = localStorage.getItem('portalGuruSession');
if (savedSession) {
    try {
        const session = JSON.parse(savedSession);
        if (session.loginAt && (new Date() - new Date(session.loginAt)) < 24 * 60 * 60 * 1000) {
            document.getElementById('loginOverlay').style.display = 'none';
            document.getElementById('mainPortal').style.display = 'block';
            currentGuru = session;
            document.getElementById('userBadge').textContent = currentGuru.nama;
            initPortal();
        }
    } catch (e) { localStorage.removeItem('portalGuruSession'); }
}

console.log('✅ Portal Guru SMAN 68 Jakarta - Loaded');
