// Firebase
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
let currentSiswa = null;
let currentPage = 'dashboard';
let jadwalData = {};
let agendaData = [];

// Toast
function showToast(type, title, message) {
    const container = document.getElementById('toastContainer');
    const icons = { success: 'check-circle', error: 'exclamation-circle', warning: 'exclamation-triangle' };
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `<i class="fas fa-${icons[type]}"></i><div class="toast-content"><div class="toast-title">${title}</div><div class="toast-message">${message}</div></div>`;
    container.appendChild(toast);
    setTimeout(() => { toast.style.transform = 'translateX(120%)'; setTimeout(() => toast.remove(), 300); }, 5000);
}

// Preloader
setTimeout(() => document.getElementById('preloader')?.classList.add('hide'), 500);

// Password Toggle
document.getElementById('loginPassToggle').addEventListener('click', function() {
    const input = document.getElementById('loginPassword');
    input.type = input.type === 'password' ? 'text' : 'password';
    this.classList.toggle('fa-eye'); this.classList.toggle('fa-eye-slash');
});

// Login
document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const nis = document.getElementById('loginNIS').value.trim();
    const password = document.getElementById('loginPassword').value;
    
    if (!nis || !password) { showToast('error', 'Gagal', 'NIS dan Password wajib diisi!'); return; }
    
    try {
        const snapshot = await db.collection('siswa').where('nis', '==', nis).where('password', '==', password).get();
        if (snapshot.empty) { showToast('error', 'Gagal', 'NIS atau Password salah!'); return; }
        
        const doc = snapshot.docs[0];
        const data = doc.data();
        
        if (data.status === 'pending' || data.status === 'proses') {
            showToast('warning', 'Pending', 'Akun masih dalam proses/pending operator. Tunggu 1x24 jam.');
            return;
        }
        if (data.status === 'rejected') {
            showToast('error', 'Ditolak', 'Pendaftaran akun Anda ditolak operator. Silakan hubungi operator untuk lebih lanjut.');
            return;
        }
        if (data.status === 'approved') {
            currentSiswa = { id: doc.id, ...data };
            document.getElementById('loginOverlay').style.display = 'none';
            document.getElementById('mainPortal').style.display = 'block';
            document.getElementById('siswaNama').textContent = data.nama;
            initPortal();
            showToast('success', 'Berhasil', `Selamat datang, ${data.nama}!`);
        }
    } catch (e) { showToast('error', 'Error', 'Terjadi kesalahan.'); }
});

// Logout
document.getElementById('logoutBtn').addEventListener('click', () => {
    currentSiswa = null;
    document.getElementById('loginOverlay').style.display = 'flex';
    document.getElementById('mainPortal').style.display = 'none';
});

// Menu Toggle
document.getElementById('menuToggle').addEventListener('click', () => {
    document.getElementById('sidebar').classList.toggle('active');
});

// Init Portal
function initPortal() {
    updateDateTime();
    setInterval(updateDateTime, 1000);
    setupSidebar();
    loadPage('dashboard');
}

function updateDateTime() {
    const now = new Date();
    document.getElementById('datetime').textContent = now.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

// Sidebar
function setupSidebar() {
    document.querySelectorAll('.sidebar-item[data-page]').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            document.querySelectorAll('.sidebar-item').forEach(i => i.classList.remove('active'));
            item.classList.add('active');
            loadPage(item.dataset.page);
        });
    });
}

function loadPage(page) {
    currentPage = page;
    const container = document.getElementById('pageContainer');
    switch(page) {
        case 'dashboard': loadDashboard(container); break;
        case 'jadwal': loadJadwal(container); break;
        case 'absensi': loadAbsensi(container); break;
        case 'agenda': loadAgenda(container); break;
        case 'riwayat': loadRiwayat(container); break;
        case 'profil': loadProfil(container); break;
    }
}

// Dashboard
function loadDashboard(container) {
    const initials = currentSiswa.nama.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    container.innerHTML = `
        <div class="card">
            <div class="card-header"><i class="fas fa-user"></i><h3>Selamat Datang, ${currentSiswa.nama}!</h3></div>
            <div style="display:flex;align-items:center;gap:20px;">
                <div style="width:60px;height:60px;border-radius:50%;background:var(--gradient);color:white;display:flex;align-items:center;justify-content:center;font-size:1.5rem;font-weight:700;">${initials}</div>
                <div>
                    <p><strong>NIS:</strong> ${currentSiswa.nis}</p>
                    <p><strong>Kelas:</strong> ${currentSiswa.kelas}</p>
                    <p><strong>Jurusan:</strong> ${currentSiswa.jurusan}</p>
                </div>
            </div>
        </div>
        <div class="card"><div class="card-header"><i class="fas fa-calendar-alt"></i><h3>Jadwal Hari Ini</h3></div><p style="text-align:center;padding:20px;">Buka menu <strong>Jadwal Pelajaran</strong> untuk melihat dan mengelola jadwal.</p></div>
    `;
}

// Jadwal
function loadJadwal(container) {
    const hari = ['Senin','Selasa','Rabu','Kamis','Jumat'];
    const today = new Date().getDay();
    const todayIdx = today === 0 || today === 6 ? 0 : today - 1;
    
    let tabsHtml = hari.map((h, i) => `<button class="chip ${i === todayIdx ? 'active' : ''}" data-hari="${h}" onclick="switchJadwalHari('${h}')">${h}</button>`).join('');
    
    container.innerHTML = `
        <div class="card">
            <div class="card-header"><i class="fas fa-calendar-alt"></i><h3>Jadwal Pelajaran</h3></div>
            <div class="filter-chip" style="margin-bottom:20px;">${tabsHtml}</div>
            <div id="jadwalList"></div>
            <button class="btn-save" onclick="addJadwal()" style="margin-top:15px;"><i class="fas fa-plus"></i> Tambah Mata Pelajaran</button>
        </div>
        <div id="jadwalForm" style="display:none;"></div>
    `;
    loadJadwalHari(hari[todayIdx]);
}

function switchJadwalHari(hari) {
    document.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
    document.querySelector(`[data-hari="${hari}"]`)?.classList.add('active');
    loadJadwalHari(hari);
}

function loadJadwalHari(hari) {
    const key = `${currentSiswa.id}_${hari}`;
    const list = document.getElementById('jadwalList');
    
    // Load from localStorage
    const saved = localStorage.getItem(key);
    jadwalData = saved ? JSON.parse(saved) : [];
    
    if (jadwalData.length === 0) {
        list.innerHTML = '<div class="empty-state"><i class="fas fa-calendar-alt"></i><p>Belum ada jadwal</p></div>';
        return;
    }
    
    list.innerHTML = jadwalData.map((j, idx) => {
        const now = new Date();
        const [endHour, endMin] = (j.jamSelesai || '').split(':').map(Number);
        const isDone = now.getHours() > endHour || (now.getHours() === endHour && now.getMinutes() >= (endMin || 0));
        
        return `
            <div class="jadwal-item ${isDone ? 'done' : ''}" id="jadwal-${idx}">
                <div class="jadwal-time">${j.jamMulai || '-'} - ${j.jamSelesai || '-'}</div>
                <div class="jadwal-info">
                    <div class="jadwal-mapel">${j.mapel}</div>
                    <div class="jadwal-guru">${j.guru || '-'}</div>
                    ${isDone ? '<div class="jadwal-done-text">✅ Mata Pelajaran Telah Selesai</div>' : ''}
                </div>
                <div class="jadwal-check ${isDone ? 'checked' : ''}" onclick="toggleJadwalDone(${idx})">
                    ${isDone ? '<i class="fas fa-check"></i>' : '<i class="far fa-circle"></i>'}
                </div>
                <button class="btn-edit" onclick="editJadwal(${idx})"><i class="fas fa-edit"></i></button>
            </div>`;
    }).join('');
}

function addJadwal() {
    const form = document.getElementById('jadwalForm');
    form.style.display = 'block';
    form.innerHTML = `
        <div class="card"><div class="card-header"><i class="fas fa-plus"></i><h3>Tambah Jadwal</h3></div>
            <div class="form-row">
                <div class="form-group"><label>Mata Pelajaran</label><input type="text" id="newMapel" class="form-input" placeholder="Contoh: Matematika"></div>
                <div class="form-group"><label>Guru Pengajar</label><input type="text" id="newGuru" class="form-input" placeholder="Nama guru"></div>
            </div>
            <div class="form-row">
                <div class="form-group"><label>Jam Mulai</label><input type="time" id="newJamMulai" class="form-input"></div>
                <div class="form-group"><label>Jam Selesai</label><input type="time" id="newJamSelesai" class="form-input"></div>
            </div>
            <button class="btn-save" onclick="saveJadwal()"><i class="fas fa-save"></i> Simpan</button>
        </div>`;
}

function saveJadwal() {
    const mapel = document.getElementById('newMapel').value.trim();
    const guru = document.getElementById('newGuru').value.trim();
    const jamMulai = document.getElementById('newJamMulai').value;
    const jamSelesai = document.getElementById('newJamSelesai').value;
    if (!mapel) { showToast('error', 'Gagal', 'Mata pelajaran wajib diisi!'); return; }
    
    const hari = document.querySelector('.chip.active')?.dataset.hari || 'Senin';
    const key = `${currentSiswa.id}_${hari}`;
    
    jadwalData.push({ mapel, guru, jamMulai, jamSelesai });
    localStorage.setItem(key, JSON.stringify(jadwalData));
    
    document.getElementById('jadwalForm').style.display = 'none';
    loadJadwalHari(hari);
    showToast('success', 'Berhasil', 'Jadwal disimpan!');
}

function editJadwal(idx) { /* Implementasi edit sederhana */ showToast('info', 'Info', 'Fitur edit akan segera hadir.'); }
function toggleJadwalDone(idx) { /* Auto check by time */ }

// Absensi (sama seperti sebelumnya)
function loadAbsensi(container) {
    container.innerHTML = `
        <div class="card"><div class="card-header"><i class="fas fa-clipboard-check"></i><h3>Absensi Hari Ini</h3></div>
            <div class="status-options" style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:20px;">
                <div class="status-card hadir" data-status="hadir" onclick="selectStatus(this)"><div class="status-icon"><i class="fas fa-check-circle"></i></div><h4>Hadir</h4></div>
                <div class="status-card sakit" data-status="sakit" onclick="selectStatus(this)"><div class="status-icon"><i class="fas fa-notes-medical"></i></div><h4>Sakit</h4></div>
                <div class="status-card izin" data-status="izin" onclick="selectStatus(this)"><div class="status-icon"><i class="fas fa-envelope"></i></div><h4>Izin</h4></div>
                <div class="status-card dispensasi" data-status="dispensasi" onclick="selectStatus(this)"><div class="status-icon"><i class="fas fa-school"></i></div><h4>Dispensasi</h4></div>
            </div>
            <div class="form-group"><label>Link Google Drive (Bukti)</label><input type="url" id="absensiUrl" class="form-input" placeholder="https://drive.google.com/..."></div>
            <div class="absensi-preview" id="absensiPreview" style="display:none;"></div>
            <div class="form-group" id="keteranganGroup" style="display:none;"><label>Keterangan</label><textarea id="absensiKeterangan" class="form-input" rows="2"></textarea></div>
            <button class="btn-save" id="submitAbsensiBtn" onclick="submitAbsensi()"><i class="fas fa-paper-plane"></i> Kirim Absensi</button>
        </div>`;
    let selectedStatus = '';
    window.selectStatus = function(el) {
        document.querySelectorAll('.status-card').forEach(c => c.classList.remove('active'));
        el.classList.add('active');
        selectedStatus = el.dataset.status;
        document.getElementById('keteranganGroup').style.display = selectedStatus === 'hadir' ? 'none' : 'block';
    };
    document.getElementById('absensiUrl').addEventListener('input', function() {
        const preview = document.getElementById('absensiPreview');
        if (this.value) { preview.style.display = 'block'; preview.innerHTML = `<p>Link: <a href="${this.value}" target="_blank">${this.value}</a></p>`; }
        else preview.style.display = 'none';
    });
    window.submitAbsensi = async function() {
        if (!selectedStatus) { showToast('error', 'Gagal', 'Pilih status kehadiran!'); return; }
        const url = document.getElementById('absensiUrl').value.trim();
        if (!url) { showToast('error', 'Gagal', 'Link Google Drive wajib diisi!'); return; }
        const ket = document.getElementById('absensiKeterangan').value.trim();
        if (selectedStatus !== 'hadir' && !ket) { showToast('error', 'Gagal', 'Keterangan wajib diisi!'); return; }
        
        const now = new Date();
        try {
            await db.collection('absensiSiswa').add({
                siswaId: currentSiswa.id, nama: currentSiswa.nama, nisn: currentSiswa.nis, kelas: currentSiswa.kelas,
                jurusan: currentSiswa.jurusan, status: selectedStatus, keterangan: ket || '-', buktiUrl: url,
                tanggal: now.toISOString().split('T')[0], timestamp: firebase.firestore.FieldValue.serverTimestamp()
            });
            const jam = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
            const tepatWaktu = now.getHours() < 6 || (now.getHours() === 6 && now.getMinutes() <= 30);
            showToast('success', 'Absensi Berhasil!', tepatWaktu ? `✅ Anda masuk tepat waktu (${jam})` : `⚠️ Anda datang terlambat (${jam})`);
        } catch (e) { showToast('error', 'Gagal', 'Terjadi kesalahan.'); }
    };
}

// Agenda
function loadAgenda(container) {
    const now = new Date();
    const bulan = now.getMonth();
    const tahun = now.getFullYear();
    const hariIni = now.getDate();
    const hariPertama = new Date(tahun, bulan, 1).getDay();
    const totalHari = new Date(tahun, bulan + 1, 0).getDate();
    const namaHari = ['Min','Sen','Sel','Rab','Kam','Jum','Sab'];
    
    let kalenderHtml = namaHari.map(h => `<div class="kalender-day-name">${h}</div>`).join('');
    for (let i = 0; i < hariPertama; i++) kalenderHtml += '<div class="kalender-day empty"></div>';
    for (let d = 1; d <= totalHari; d++) {
        const isToday = d === hariIni ? ' today' : '';
        kalenderHtml += `<div class="kalender-day${isToday}" onclick="showAgendaForm('${tahun}-${String(bulan+1).padStart(2,'0')}-${String(d).padStart(2,'0')}')">${d}</div>`;
    }
    
    container.innerHTML = `
        <div class="card"><div class="card-header"><i class="fas fa-calendar-plus"></i><h3>Agenda Pribadi</h3></div>
            <div class="kalender-grid">${kalenderHtml}</div>
            <div id="agendaDetail" style="margin-top:20px;"></div>
        </div>`;
    
    window.showAgendaForm = function(tanggal) {
        const detail = document.getElementById('agendaDetail');
        detail.innerHTML = `
            <div class="card"><div class="card-header"><i class="fas fa-plus"></i><h3>Tambah Agenda - ${tanggal}</h3></div>
                <div class="form-row">
                    <div class="form-group"><label>Judul Agenda</label><input type="text" id="agendaJudul" class="form-input" placeholder="Judul agenda"></div>
                    <div class="form-group"><label>Jam</label><input type="time" id="agendaJam" class="form-input"></div>
                </div>
                <button class="btn-save" onclick="saveAgenda('${tanggal}')"><i class="fas fa-save"></i> Simpan</button>
            </div>`;
    };
    
    window.saveAgenda = function(tanggal) {
        const judul = document.getElementById('agendaJudul').value.trim();
        const jam = document.getElementById('agendaJam').value;
        if (!judul) { showToast('error', 'Gagal', 'Judul wajib diisi!'); return; }
        const key = `agenda_${currentSiswa.id}`;
        const saved = JSON.parse(localStorage.getItem(key) || '[]');
        saved.push({ tanggal, judul, jam });
        localStorage.setItem(key, JSON.stringify(saved));
        showToast('success', 'Berhasil', 'Agenda disimpan!');
        loadAgenda(container);
    };
}

// Riwayat Absensi
async function loadRiwayat(container) {
    container.innerHTML = '<div class="empty-state"><i class="fas fa-spinner fa-spin"></i><p>Memuat...</p></div>';
    try {
        const snapshot = await db.collection('absensiSiswa').where('siswaId', '==', currentSiswa.id).orderBy('timestamp', 'desc').get();
        const stats = { hadir: 0, sakit: 0, izin: 0, dispensasi: 0, alpa: 0, terlambat: 0 };
        let rows = '';
        snapshot.forEach(doc => {
            const d = doc.data();
            stats[d.status] = (stats[d.status] || 0) + 1;
            const tgl = d.timestamp?.toDate().toLocaleDateString('id-ID') || '-';
            const waktu = d.timestamp?.toDate().toLocaleTimeString('id-ID', { hour:'2-digit', minute:'2-digit' }) || '-';
            rows += `<tr><td>${tgl}</td><td>${waktu}</td><td><span class="badge-status ${d.status}">${d.status}</span></td><td>${d.keterangan || '-'}</td></tr>`;
        });
        container.innerHTML = `
            <div class="stats-grid">
                <div class="stat-card"><h3 style="color:#059669;">${stats.hadir}</h3><p>Hadir</p></div>
                <div class="stat-card"><h3 style="color:#dc2626;">${stats.sakit}</h3><p>Sakit</p></div>
                <div class="stat-card"><h3 style="color:#d97706;">${stats.izin}</h3><p>Izin</p></div>
                <div class="stat-card"><h3 style="color:#2563eb;">${stats.dispensasi}</h3><p>Dispensasi</p></div>
                <div class="stat-card"><h3 style="color:#ea580c;">${stats.terlambat}</h3><p>Terlambat</p></div>
                <div class="stat-card"><h3 style="color:#be185d;">${stats.alpa}</h3><p>Alpa</p></div>
            </div>
            <div class="card"><div class="card-header"><i class="fas fa-history"></i><h3>Riwayat Absensi</h3></div>
                <div class="table-wrapper"><table><thead><tr><th>Tanggal</th><th>Waktu</th><th>Status</th><th>Keterangan</th></tr></thead><tbody>${rows || '<tr><td colspan="4" class="empty-state">Belum ada data</td></tr>'}</tbody></table></div>
            </div>`;
    } catch (e) { container.innerHTML = '<div class="empty-state"><p>Gagal memuat</p></div>'; }
}

// Profil
function loadProfil(container) {
    const d = currentSiswa;
    const initials = d.nama.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    container.innerHTML = `
        <div class="profile-card">
            <div class="profile-header">
                <div class="profile-avatar">${initials}</div>
                <div class="profile-info"><h2>${d.nama}</h2><p>Kelas ${d.kelas} • ${d.jurusan}</p></div>
            </div>
            <div class="profile-detail">
                <div class="detail-item"><h4>NIS</h4><p>${d.nis || '-'}</p></div>
                <div class="detail-item"><h4>NISN</h4><p>${d.nisn || '-'}</p></div>
                <div class="detail-item"><h4>Tanggal Lahir</h4><p>${d.tanggalLahir || '-'}</p></div>
                <div class="detail-item"><h4>Jenis Kelamin</h4><p>${d.jenisKelamin === 'L' ? 'Laki-laki' : 'Perempuan'}</p></div>
                <div class="detail-item"><h4>Status</h4><p><span class="badge-status ${d.status === 'approved' ? 'hadir' : 'sakit'}">${d.status === 'approved' ? 'Aktif' : 'Tidak Aktif'}</span></p></div>
                <div class="detail-item"><h4>Tanggal Masuk</h4><p>${d.tanggalMasuk || 'Juli 2024'}</p></div>
                <div class="detail-item"><h4>Tanggal Lulus</h4><p>${d.tanggalLulus || 'Mei 2027'}</p></div>
                <div class="detail-item"><h4>Kelas</h4><p>${d.kelas}</p></div>
            </div>
        </div>
        <p class="version">Portal Siswa SMAN 68 Jakarta V 3.0.0</p>`;
}

console.log('✅ Portal Siswa SMAN 68 Jakarta V 3.0.0 - Loaded');