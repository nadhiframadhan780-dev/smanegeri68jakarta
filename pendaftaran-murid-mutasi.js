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

// ============================================
// TOAST
// ============================================
function showToast(type, message) {
    const container = document.getElementById('toastContainer');
    const icons = { success: 'fa-check-circle', error: 'fa-exclamation-circle', warning: 'fa-exclamation-triangle' };
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `<i class="fas ${icons[type]}"></i><span class="toast-message">${message}</span>`;
    container.appendChild(toast);
    setTimeout(() => { toast.style.transform = 'translateX(120%)'; setTimeout(() => toast.remove(), 300); }, 5000);
}

// ============================================
// TABS
// ============================================
document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
        document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        tab.classList.add('active');
        document.getElementById(tab.dataset.tab + 'Tab').classList.add('active');
    });
});

// ============================================
// DOCUMENT LIST
// ============================================
const documentList = [
    { id: 'nilaiRapor', icon: 'fa-file-alt', title: 'Nilai Rapor', desc: 'Fotokopi rapor semester terakhir (dilegalisir)' },
    { id: 'pasFoto', icon: 'fa-camera', title: 'Pas Foto 3x4', desc: 'Background merah, format JPG/PNG' },
    { id: 'aktaLahir', icon: 'fa-certificate', title: 'Akta Kelahiran', desc: 'Scan/foto akta kelahiran' },
    { id: 'kartuKeluarga', icon: 'fa-users', title: 'Kartu Keluarga', desc: 'Scan/foto KK' },
    { id: 'ktpOrKia', icon: 'fa-id-card', title: 'KTP/KIA/Kartu Pelajar', desc: 'KTP orang tua atau KIA/kartu pelajar' },
    { id: 'suratBaik', icon: 'fa-check-circle', title: 'Surat Keterangan Baik', desc: 'Dari sekolah sebelumnya' },
    { id: 'suratSehat', icon: 'fa-notes-medical', title: 'Surat Kesehatan', desc: 'Dari dokter' },
    { id: 'suratPindahOrtu', icon: 'fa-file-signature', title: 'Surat Permohonan Pindah', desc: 'Dari orang tua/wali murid' },
    { id: 'suratPindahSekolah', icon: 'fa-file-export', title: 'Surat Keterangan Pindah', desc: 'Dari sekolah asal' }
];

const docContainer = document.getElementById('docList');
documentList.forEach(doc => {
    const div = document.createElement('div');
    div.className = 'doc-item';
    div.innerHTML = `
        <div class="doc-icon"><i class="fas ${doc.icon}"></i></div>
        <div class="doc-info"><h4>${doc.title}</h4><p>${doc.desc}</p></div>
        <div class="doc-input">
            <input type="url" id="${doc.id}" placeholder="Link Google Drive..." class="form-input">
        </div>
    `;
    docContainer.appendChild(div);
});

// ============================================
// DOWNLOAD SURAT PERNYATAAN
// ============================================
document.getElementById('downloadSurat').addEventListener('click', (e) => {
    e.preventDefault();
    // Ganti dengan link file surat pernyataan
    const suratUrl = 'Surat_Pernyataan_Pindah_SMAN68.pdf'; // GANTI INI
    window.open(suratUrl, '_blank');
    showToast('info', 'Download surat pernyataan, cetak, isi, tanda tangani, lalu upload ke Google Drive dan tempel linknya.');
});

// ============================================
// GENERATE NOMOR PENDAFTARAN
// ============================================
function generateNoDaftar() {
    const random = Math.floor(10000000 + Math.random() * 90000000);
    return '198168' + random;
}

// ============================================
// SUBMIT FORM
// ============================================
document.getElementById('registerForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Validasi checkbox
    if (!document.getElementById('agreeRules').checked) {
        showToast('error', 'Anda harus menyetujui peraturan yang berlaku!');
        return;
    }
    
    const nama = document.getElementById('nama').value.trim();
    const tglLahir = document.getElementById('tglLahir').value;
    const jk = document.getElementById('jk').value;
    const agama = document.getElementById('agama').value;
    const sekolahAsal = document.getElementById('sekolahAsal').value.trim();
    const alasanPindah = document.getElementById('alasanPindah').value.trim();
    const email = document.getElementById('email').value.trim();
    const telpMurid = document.getElementById('telpMurid').value.trim();
    const telpOrtu = document.getElementById('telpOrtu').value.trim();
    const linkSuratPernyataan = document.getElementById('linkSuratPernyataan').value.trim();
    
    if (!nama || !tglLahir || !jk || !agama || !sekolahAsal || !alasanPindah || !email || !telpMurid || !telpOrtu || !linkSuratPernyataan) {
        showToast('error', 'Mohon isi semua field yang wajib!');
        return;
    }
    
    // Validasi dokumen
    let allDocsFilled = true;
    const docs = {};
    documentList.forEach(doc => {
        const val = document.getElementById(doc.id).value.trim();
        if (!val) allDocsFilled = false;
        docs[doc.id] = val || '-';
    });
    
    if (!allDocsFilled) {
        showToast('error', 'Mohon isi semua link Google Drive dokumen!');
        return;
    }
    
    const btn = document.getElementById('submitBtn');
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Memproses...';
    
    try {
        const noDaftar = generateNoDaftar();
        
        await db.collection('pendaftaranMutasi').add({
            noDaftar,
            nama, tglLahir, jk, agama, sekolahAsal, alasanPindah,
            email, telpMurid, telpOrtu,
            linkSuratPernyataan,
            dokumen: docs,
            status: 'pending',
            catatanOperator: '',
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        document.getElementById('nomorPendaftaran').textContent = noDaftar;
        document.getElementById('successModal').style.display = 'flex';
        document.getElementById('registerForm').reset();
        
    } catch (error) {
        console.error('Error:', error);
        showToast('error', 'Terjadi kesalahan. Silakan coba lagi.');
    } finally {
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-paper-plane"></i> Proses Pendaftaran';
    }
});

// ============================================
// CEK STATUS
// ============================================
document.getElementById('cekStatusBtn').addEventListener('click', async () => {
    const noDaftar = document.getElementById('cekNoDaftar').value.trim();
    const resultDiv = document.getElementById('statusResult');
    
    if (!noDaftar) {
        showToast('error', 'Masukkan nomor pendaftaran!');
        return;
    }
    
    if (!noDaftar.startsWith('198168') || noDaftar.length !== 14) {
        showToast('error', 'Format nomor pendaftaran tidak valid!');
        return;
    }
    
    try {
        const snapshot = await db.collection('pendaftaranMutasi').where('noDaftar', '==', noDaftar).get();
        
        if (snapshot.empty) {
            resultDiv.style.display = 'block';
            resultDiv.innerHTML = '<div class="status-card ditolak"><i class="fas fa-times-circle"></i><h3>Nomor Tidak Ditemukan</h3><p>Nomor pendaftaran tidak terdaftar di sistem.</p></div>';
            return;
        }
        
        const data = snapshot.docs[0].data();
        resultDiv.style.display = 'block';
        
        if (data.status === 'pending') {
            resultDiv.innerHTML = `
                <div class="status-card pending">
                    <i class="fas fa-clock"></i>
                    <h3>Berkas Belum Diverifikasi</h3>
                    <p>Berkas Anda masih dalam antrian untuk diverifikasi oleh operator. Silakan tunggu 1x24 jam.</p>
                    <p style="margin-top:10px;"><strong>Nama:</strong> ${data.nama}<br><strong>No. Pendaftaran:</strong> ${data.noDaftar}</p>
                </div>`;
        } else if (data.status === 'proses') {
            resultDiv.innerHTML = `
                <div class="status-card proses">
                    <i class="fas fa-spinner"></i>
                    <h3>Berkas Sedang Diproses</h3>
                    <p>Berkas Anda sedang dalam proses verifikasi oleh operator.</p>
                    <p style="margin-top:10px;"><strong>Nama:</strong> ${data.nama}<br><strong>No. Pendaftaran:</strong> ${data.noDaftar}</p>
                </div>`;
        } else if (data.status === 'diterima') {
            resultDiv.innerHTML = `
                <div class="status-card diterima">
                    <i class="fas fa-check-circle"></i>
                    <h3>Selamat! Berkas Diterima</h3>
                    <p>Berkas Anda telah lolos verifikasi. Silakan menunggu jadwal tes penempatan dan wawancara.</p>
                    <p style="margin-top:10px;"><strong>Nama:</strong> ${data.nama}<br><strong>No. Pendaftaran:</strong> ${data.noDaftar}</p>
                </div>`;
        } else if (data.status === 'ditolak') {
            resultDiv.innerHTML = `
                <div class="status-card ditolak">
                    <i class="fas fa-times-circle"></i>
                    <h3>Berkas Tidak Lolos Verifikasi</h3>
                    <p>Berkas Anda tidak lolos verifikasi dengan alasan:</p>
                    <div class="alasan-operator"><strong>Catatan Operator:</strong><br>${data.catatanOperator || 'Tidak ada catatan'}</div>
                    <p style="margin-top:10px;"><strong>Nama:</strong> ${data.nama}<br><strong>No. Pendaftaran:</strong> ${data.noDaftar}</p>
                    <button class="btn-daftar-ulang" onclick="document.querySelector('[data-tab=register]').click(); document.getElementById('cekNoDaftar').value='';">Daftar Ulang</button>
                </div>`;
        }
    } catch (error) {
        console.error('Error:', error);
        showToast('error', 'Terjadi kesalahan saat mengecek status.');
    }
});

// Close modal
document.getElementById('successModal').addEventListener('click', (e) => {
    if (e.target === document.getElementById('successModal')) {
        document.getElementById('successModal').style.display = 'none';
    }
});

console.log('✅ Pendaftaran Murid Mutasi SMAN 68 Jakarta - Loaded');
