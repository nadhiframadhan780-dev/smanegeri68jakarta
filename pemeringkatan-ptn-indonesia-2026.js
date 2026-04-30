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

// ============================================
// UNIRANKS 2026 - 100 PTN INDONESIA
// Sumber: https://www.uniranks.com/ranking/indonesia
// ============================================
const uniRanksData = [
    { rank: 1, name: "Universitas Indonesia", logo: "https://fia.ui.ac.id/wp-content/uploads/182/2018/01/logo-UI.png", worldRank: "#400", score: "85.0", established: "1849", location: "Depok & Jakarta", students: "47,000+", accreditation: "Unggul", type: "PTN" },
    { rank: 2, name: "Universitas Gadjah Mada", logo: "https://upload.wikimedia.org/wikipedia/id/thumb/9/9f/Emblem_of_Universitas_Gadjah_Mada.svg/1280px-Emblem_of_Universitas_Gadjah_Mada.svg.png", worldRank: "#445", score: "84.55", established: "1949", location: "Yogyakarta", students: "55,000+", accreditation: "Unggul", type: "PTN" },
    { rank: 3, name: "Universitas Airlangga", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/65/Logo-Branding-UNAIR-biru.png/500px-Logo-Branding-UNAIR-biru.png", worldRank: "#490", score: "84.1", established: "1954", location: "Surabaya", students: "38,000+", accreditation: "Unggul", type: "PTN" },
    { rank: 4, name: "IPB University", logo: "https://www.ipb.ac.id/wp-content/uploads/2023/12/Logo-IPB-University_Vertical.png", worldRank: "#535", score: "83.65", established: "1963", location: "Bogor", students: "28,000+", accreditation: "Unggul", type: "PTN" },
    { rank: 5, name: "Institut Teknologi Bandung", logo: "https://upload.wikimedia.org/wikipedia/id/9/95/Logo_Institut_Teknologi_Bandung.png", worldRank: "#580", score: "83.2", established: "1920", location: "Bandung", students: "22,000+", accreditation: "Unggul", type: "PTN" },
    { rank: 6, name: "Universitas Brawijaya", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/bb/Logo_Universitas_Brawijaya.svg/960px-Logo_Universitas_Brawijaya.svg.png", worldRank: "#625", score: "82.75", established: "1963", location: "Malang", students: "62,000+", accreditation: "Unggul", type: "PTN" },
    { rank: 7, name: "Institut Teknologi Sepuluh Nopember", logo: "https://upload.wikimedia.org/wikipedia/id/c/c4/Badge_ITS.png", worldRank: "#670", score: "82.3", established: "1957", location: "Surabaya", students: "22,000+", accreditation: "Unggul", type: "PTN" },
    { rank: 8, name: "Universitas Hasanuddin", logo: "https://upload.wikimedia.org/wikipedia/commons/b/bd/Logo-Resmi-Unhas-1.png", worldRank: "#715", score: "81.85", established: "1956", location: "Makassar", students: "42,000+", accreditation: "Unggul", type: "PTN" },
    { rank: 9, name: "Universitas Diponegoro", logo: "https://upload.wikimedia.org/wikipedia/id/2/20/Logo_Universitas_Diponegoro.png", worldRank: "#760", score: "81.4", established: "1957", location: "Semarang", students: "52,000+", accreditation: "Unggul", type: "PTN" },
    { rank: 10, name: "Universitas Sebelas Maret", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/Logo_UNS.svg/1200px-Logo_UNS.svg.png", worldRank: "#805", score: "80.95", established: "1976", location: "Surakarta", students: "36,000+", accreditation: "Unggul", type: "PTN" },
    { rank: 11, name: "Universitas Padjadjaran", logo: "https://www.unpad.ac.id/wp-content/uploads/2018/04/logo-unpad1.png", worldRank: "#850", score: "80.5", established: "1957", location: "Bandung", students: "48,000+", accreditation: "Unggul", type: "PTN" },
    { rank: 12, name: "Universitas Pendidikan Indonesia", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Logo_UPI.svg/1200px-Logo_UPI.svg.png", worldRank: "#895", score: "80.05", established: "1954", location: "Bandung", students: "38,000+", accreditation: "Unggul", type: "PTN" },
    { rank: 13, name: "Universitas Sumatera Utara", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Logo_USU.svg/1200px-Logo_USU.svg.png", worldRank: "#940", score: "79.6", established: "1952", location: "Medan", students: "46,000+", accreditation: "Unggul", type: "PTN" },
    { rank: 14, name: "Universitas Syiah Kuala", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/Logo_Unsyiah.svg/1200px-Logo_Unsyiah.svg.png", worldRank: "#985", score: "79.15", established: "1961", location: "Banda Aceh", students: "32,000+", accreditation: "Unggul", type: "PTN" },
    { rank: 15, name: "Universitas Negeri Yogyakarta", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Logo_UNY.svg/1200px-Logo_UNY.svg.png", worldRank: "#1030", score: "78.7", established: "1964", location: "Yogyakarta", students: "32,000+", accreditation: "Unggul", type: "PTN" },
    { rank: 16, name: "Universitas Andalas", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/01/Logo_Unand.svg/1280px-Logo_Unand.svg.png", worldRank: "#1075", score: "78.25", established: "1955", location: "Padang", students: "32,000+", accreditation: "Unggul", type: "PTN" },
    { rank: 17, name: "Universitas Negeri Malang", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1f/Logo_UM.svg/1200px-Logo_UM.svg.png", worldRank: "#1120", score: "77.8", established: "1954", location: "Malang", students: "30,000+", accreditation: "Unggul", type: "PTN" },
    { rank: 18, name: "Universitas Lampung", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Logo_Unila.svg/1200px-Logo_Unila.svg.png", worldRank: "#1165", score: "77.35", established: "1965", location: "Bandar Lampung", students: "32,000+", accreditation: "Unggul", type: "PTN" },
    { rank: 19, name: "Universitas Sriwijaya", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5f/Logo_Unsri.svg/1200px-Logo_Unsri.svg.png", worldRank: "#1210", score: "76.9", established: "1960", location: "Palembang", students: "36,000+", accreditation: "Unggul", type: "PTN" },
    { rank: 20, name: "Universitas Jember", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/Logo_UNEJ.svg/1200px-Logo_UNEJ.svg.png", worldRank: "#1255", score: "76.45", established: "1964", location: "Jember", students: "28,000+", accreditation: "Unggul", type: "PTN" },
    { rank: 21, name: "Universitas Negeri Semarang", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Logo_Unnes.svg/1200px-Logo_Unnes.svg.png", worldRank: "#1300", score: "76.0", established: "1965", location: "Semarang", students: "30,000+", accreditation: "Unggul", type: "PTN" },
    { rank: 22, name: "Universitas Negeri Jakarta", logo: "https://unj.ac.id/wp-content/uploads/2025/02/UNJ-LOGO-512-PX-1.png", worldRank: "#1345", score: "75.55", established: "1964", location: "Jakarta", students: "32,000+", accreditation: "Unggul", type: "PTN" },
    { rank: 23, name: "Universitas Negeri Padang", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Logo_UNP.svg/1200px-Logo_UNP.svg.png", worldRank: "#1390", score: "75.1", established: "1954", location: "Padang", students: "28,000+", accreditation: "Unggul", type: "PTN" },
    { rank: 24, name: "Universitas Mataram", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5f/Logo_Unram.svg/1200px-Logo_Unram.svg.png", worldRank: "#1435", score: "74.65", established: "1962", location: "Mataram", students: "28,000+", accreditation: "Unggul", type: "PTN" },
    { rank: 25, name: "Universitas Mulawarman", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Logo_Unmul.svg/1200px-Logo_Unmul.svg.png", worldRank: "#1480", score: "74.2", established: "1962", location: "Samarinda", students: "28,000+", accreditation: "Unggul", type: "PTN" },
    { rank: 26, name: "Universitas Jenderal Soedirman", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Logo_Unsoed.svg/1200px-Logo_Unsoed.svg.png", worldRank: "#1525", score: "73.75", established: "1963", location: "Purwokerto", students: "28,000+", accreditation: "Unggul", type: "PTN" },
    { rank: 27, name: "Universitas Sam Ratulangi", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Logo_Unsrat.svg/1200px-Logo_Unsrat.svg.png", worldRank: "#1570", score: "73.3", established: "1961", location: "Manado", students: "28,000+", accreditation: "Unggul", type: "PTN" },
    { rank: 28, name: "Universitas Udayana", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Logo_Udayana.svg/1200px-Logo_Udayana.svg.png", worldRank: "#1615", score: "72.85", established: "1962", location: "Bali", students: "28,000+", accreditation: "Unggul", type: "PTN" },
    { rank: 29, name: "Universitas Negeri Makassar", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Logo_UNM.svg/1200px-Logo_UNM.svg.png", worldRank: "#1660", score: "72.4", established: "1961", location: "Makassar", students: "32,000+", accreditation: "Unggul", type: "PTN" },
    { rank: 30, name: "Universitas Negeri Medan", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Logo_Unimed.svg/1200px-Logo_Unimed.svg.png", worldRank: "#1705", score: "71.95", established: "1963", location: "Medan", students: "28,000+", accreditation: "Unggul", type: "PTN" },
    { rank: 31, name: "Universitas Sultan Ageng Tirtayasa", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Logo_Untirta.svg/1200px-Logo_Untirta.svg.png", worldRank: "#1750", score: "71.5", established: "2001", location: "Serang", students: "22,000+", accreditation: "Unggul", type: "PTN" },
    { rank: 32, name: "Universitas Tanjungpura", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Logo_Untan.svg/1200px-Logo_Untan.svg.png", worldRank: "#1795", score: "71.05", established: "1959", location: "Pontianak", students: "28,000+", accreditation: "Unggul", type: "PTN" },
    { rank: 33, name: "Universitas Riau", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Logo_Unri.svg/1200px-Logo_Unri.svg.png", worldRank: "#1840", score: "70.6", established: "1962", location: "Pekanbaru", students: "32,000+", accreditation: "Unggul", type: "PTN" },
    { rank: 34, name: "Universitas Halu Oleo", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Logo_Uho.svg/1200px-Logo_Uho.svg.png", worldRank: "#1885", score: "70.15", established: "1981", location: "Kendari", students: "28,000+", accreditation: "Unggul", type: "PTN" },
    { rank: 35, name: "Universitas Tadulako", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Logo_Untad.svg/1200px-Logo_Untad.svg.png", worldRank: "#1930", score: "69.7", established: "1981", location: "Palu", students: "28,000+", accreditation: "Unggul", type: "PTN" },
    { rank: 36, name: "Universitas Negeri Surabaya", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1f/Logo_Unesa.svg/1200px-Logo_Unesa.svg.png", worldRank: "#1975", score: "69.25", established: "1964", location: "Surabaya", students: "28,000+", accreditation: "Unggul", type: "PTN" },
    { rank: 37, name: "Universitas Malikussaleh", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Logo_Unimal.svg/1200px-Logo_Unimal.svg.png", worldRank: "#2020", score: "68.8", established: "2001", location: "Lhokseumawe", students: "18,000+", accreditation: "Baik Sekali", type: "PTN" },
    { rank: 38, name: "Universitas Trunojoyo Madura", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Logo_UTM.svg/1200px-Logo_UTM.svg.png", worldRank: "#2065", score: "68.35", established: "2001", location: "Bangkalan", students: "18,000+", accreditation: "Unggul", type: "PTN" },
    { rank: 39, name: "UPN Veteran Yogyakarta", logo: "https://kompaspedia.kompas.id/wp-content/uploads/2020/08/logo_Universitas-Pembangunan-Nasional-Veteran-Yogyakarta.png", worldRank: "#2110", score: "67.9", established: "1958", location: "Yogyakarta", students: "15,000+", accreditation: "Unggul", type: "PTN" },
    { rank: 40, name: "UPN Veteran Jakarta", logo: "https://www.upnvj.ac.id/id/files/large/89f8a80e388ced3704b091e21f510755", worldRank: "#2155", score: "67.45", established: "1965", location: "Jakarta", students: "20,000+", accreditation: "Unggul", type: "PTN" },
    { rank: 41, name: "UPN Veteran Jawa Timur", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Logo_UPNVJT.svg/1200px-Logo_UPNVJT.svg.png", worldRank: "#2200", score: "67.0", established: "1959", location: "Surabaya", students: "20,000+", accreditation: "Unggul", type: "PTN" },
    { rank: 42, name: "Universitas Palangka Raya", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Logo_UPR.svg/1200px-Logo_UPR.svg.png", worldRank: "#2245", score: "66.55", established: "1963", location: "Palangka Raya", students: "18,000+", accreditation: "Unggul", type: "PTN" },
    { rank: 43, name: "Universitas Bengkulu", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Logo_Unib.svg/1200px-Logo_Unib.svg.png", worldRank: "#2290", score: "66.1", established: "1982", location: "Bengkulu", students: "22,000+", accreditation: "Unggul", type: "PTN" },
    { rank: 44, name: "Universitas Negeri Gorontalo", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Logo_UNG.svg/1200px-Logo_UNG.svg.png", worldRank: "#2335", score: "65.65", established: "2004", location: "Gorontalo", students: "18,000+", accreditation: "Unggul", type: "PTN" },
    { rank: 45, name: "Universitas Bangka Belitung", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Logo_UBB.svg/1200px-Logo_UBB.svg.png", worldRank: "#2380", score: "65.2", established: "2006", location: "Pangkalpinang", students: "12,000+", accreditation: "Baik Sekali", type: "PTN" },
    { rank: 46, name: "Universitas Teuku Umar", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Logo_UTU.svg/1200px-Logo_UTU.svg.png", worldRank: "#2425", score: "64.75", established: "2014", location: "Meulaboh", students: "10,000+", accreditation: "Baik", type: "PTN" },
    { rank: 47, name: "Universitas Borneo Tarakan", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Logo_UBT.svg/1200px-Logo_UBT.svg.png", worldRank: "#2470", score: "64.3", established: "2010", location: "Tarakan", students: "12,000+", accreditation: "Baik Sekali", type: "PTN" },
    { rank: 48, name: "Universitas Musamus Merauke", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Logo_Unmus.svg/1200px-Logo_Unmus.svg.png", worldRank: "#2515", score: "63.85", established: "2010", location: "Merauke", students: "10,000+", accreditation: "Baik Sekali", type: "PTN" },
    { rank: 49, name: "Universitas Pattimura", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Logo_Unpatti.svg/1200px-Logo_Unpatti.svg.png", worldRank: "#2560", score: "63.4", established: "1963", location: "Ambon", students: "22,000+", accreditation: "Unggul", type: "PTN" },
    { rank: 50, name: "Universitas Cenderawasih", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Logo_Uncen.svg/1200px-Logo_Uncen.svg.png", worldRank: "#2605", score: "62.95", established: "1962", location: "Jayapura", students: "22,000+", accreditation: "Unggul", type: "PTN" },
    { rank: 51, name: "Universitas Papua", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Logo_Unipa.svg/1200px-Logo_Unipa.svg.png", worldRank: "#2650", score: "62.5", established: "2000", location: "Manokwari", students: "12,000+", accreditation: "Baik Sekali", type: "PTN" },
    { rank: 52, name: "Universitas Nusa Cendana", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Logo_Undana.svg/1200px-Logo_Undana.svg.png", worldRank: "#2695", score: "62.05", established: "1962", location: "Kupang", students: "22,000+", accreditation: "Unggul", type: "PTN" },
    { rank: 53, name: "Universitas Maritim Raja Ali Haji", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Logo_Umrah.svg/1200px-Logo_Umrah.svg.png", worldRank: "#2740", score: "61.6", established: "2007", location: "Tanjungpinang", students: "12,000+", accreditation: "Baik Sekali", type: "PTN" },
    { rank: 54, name: "Universitas Siliwangi", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Logo_Unsil.svg/1200px-Logo_Unsil.svg.png", worldRank: "#2785", score: "61.15", established: "2014", location: "Tasikmalaya", students: "18,000+", accreditation: "Baik Sekali", type: "PTN" },
    { rank: 55, name: "Universitas Tidar", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Logo_Untidar.svg/1200px-Logo_Untidar.svg.png", worldRank: "#2830", score: "60.7", established: "2014", location: "Magelang", students: "12,000+", accreditation: "Baik Sekali", type: "PTN" },
    { rank: 56, name: "Universitas Singaperbangsa Karawang", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Logo_Unsika.svg/1200px-Logo_Unsika.svg.png", worldRank: "#2875", score: "60.25", established: "2014", location: "Karawang", students: "22,000+", accreditation: "Baik Sekali", type: "PTN" },
    { rank: 57, name: "Institut Teknologi Sumatera", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Logo_ITERA.svg/1200px-Logo_ITERA.svg.png", worldRank: "#2965", score: "59.35", established: "2014", location: "Lampung", students: "8,000+", accreditation: "Baik Sekali", type: "PTN" },
    { rank: 58, name: "Institut Teknologi Kalimantan", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Logo_ITK.svg/1200px-Logo_ITK.svg.png", worldRank: "#3010", score: "58.9", established: "2014", location: "Balikpapan", students: "8,000+", accreditation: "Baik Sekali", type: "PTN" },
    { rank: 59, name: "Universitas Sulawesi Barat", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Logo_Unsulbar.svg/1200px-Logo_Unsulbar.svg.png", worldRank: "#3055", score: "58.45", established: "2014", location: "Majene", students: "8,000+", accreditation: "Baik", type: "PTN" },
    { rank: 60, name: "Universitas Samudra", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Logo_Unsam.svg/1200px-Logo_Unsam.svg.png", worldRank: "#3100", score: "58.0", established: "2013", location: "Langsa", students: "10,000+", accreditation: "Baik", type: "PTN" },
    { rank: 61, name: "Universitas Sembilanbelas November Kolaka", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Logo_USN.svg/1200px-Logo_USN.svg.png", worldRank: "#3145", score: "57.55", established: "2014", location: "Kolaka", students: "10,000+", accreditation: "Baik", type: "PTN" },
    { rank: 62, name: "Universitas Negeri Manado", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Logo_Unima.svg/1200px-Logo_Unima.svg.png", worldRank: "#3190", score: "57.1", established: "1964", location: "Manado", students: "18,000+", accreditation: "Unggul", type: "PTN" },
    { rank: 63, name: "UIN Sunan Kalijaga Yogyakarta", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Logo_UIN_Suka.svg/1200px-Logo_UIN_Suka.svg.png", worldRank: "#3235", score: "56.65", established: "1951", location: "Yogyakarta", students: "22,000+", accreditation: "Unggul", type: "PTKIN" },
    { rank: 64, name: "UIN Syarif Hidayatullah Jakarta", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Logo_UIN_Jakarta.svg/1200px-Logo_UIN_Jakarta.svg.png", worldRank: "#3280", score: "56.2", established: "1957", location: "Jakarta", students: "28,000+", accreditation: "Unggul", type: "PTKIN" },
    { rank: 65, name: "UIN Sunan Gunung Djati Bandung", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Logo_UIN_SGD.svg/1200px-Logo_UIN_SGD.svg.png", worldRank: "#3325", score: "55.75", established: "1968", location: "Bandung", students: "22,000+", accreditation: "Unggul", type: "PTKIN" },
    { rank: 66, name: "UIN Maulana Malik Ibrahim Malang", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Logo_UIN_Malang.svg/1200px-Logo_UIN_Malang.svg.png", worldRank: "#3370", score: "55.3", established: "2004", location: "Malang", students: "20,000+", accreditation: "Unggul", type: "PTKIN" },
    { rank: 67, name: "UIN Alauddin Makassar", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Logo_UIN_Alauddin.svg/1200px-Logo_UIN_Alauddin.svg.png", worldRank: "#3415", score: "54.85", established: "1965", location: "Makassar", students: "20,000+", accreditation: "Unggul", type: "PTKIN" },
    { rank: 68, name: "UIN Ar-Raniry Banda Aceh", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Logo_UIN_Ar_Raniry.svg/1200px-Logo_UIN_Ar_Raniry.svg.png", worldRank: "#3460", score: "54.4", established: "1963", location: "Banda Aceh", students: "18,000+", accreditation: "Unggul", type: "PTKIN" },
    { rank: 69, name: "UIN Sunan Ampel Surabaya", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Logo_UIN_Sunan_Ampel.svg/1200px-Logo_UIN_Sunan_Ampel.svg.png", worldRank: "#3505", score: "53.95", established: "1965", location: "Surabaya", students: "18,000+", accreditation: "Unggul", type: "PTKIN" },
    { rank: 70, name: "UIN Raden Intan Lampung", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Logo_UIN_Raden_Intan.svg/1200px-Logo_UIN_Raden_Intan.svg.png", worldRank: "#3550", score: "53.5", established: "1968", location: "Lampung", students: "18,000+", accreditation: "Unggul", type: "PTKIN" },
    { rank: 71, name: "UIN Walisongo Semarang", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Logo_UIN_Walisongo.svg/1200px-Logo_UIN_Walisongo.svg.png", worldRank: "#3595", score: "53.05", established: "1970", location: "Semarang", students: "20,000+", accreditation: "Unggul", type: "PTKIN" },
    { rank: 72, name: "UIN Sultan Syarif Kasim Riau", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Logo_UIN_Suska.svg/1200px-Logo_UIN_Suska.svg.png", worldRank: "#3640", score: "52.6", established: "1970", location: "Pekanbaru", students: "20,000+", accreditation: "Unggul", type: "PTKIN" },
    { rank: 73, name: "UIN Imam Bonjol Padang", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Logo_UIN_Imam_Bonjol.svg/1200px-Logo_UIN_Imam_Bonjol.svg.png", worldRank: "#3685", score: "52.15", established: "1966", location: "Padang", students: "18,000+", accreditation: "Unggul", type: "PTKIN" },
    { rank: 74, name: "UIN Mataram", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Logo_UIN_Mataram.svg/1200px-Logo_UIN_Mataram.svg.png", worldRank: "#3730", score: "51.7", established: "2004", location: "Mataram", students: "15,000+", accreditation: "Baik Sekali", type: "PTKIN" },
    { rank: 75, name: "IAIN Kediri", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Logo_IAIN_Kediri.svg/1200px-Logo_IAIN_Kediri.svg.png", worldRank: "#3775", score: "51.25", established: "1997", location: "Kediri", students: "12,000+", accreditation: "Baik Sekali", type: "PTKIN" },
    { rank: 76, name: "IAIN Ponorogo", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Logo_IAIN_Ponorogo.svg/1200px-Logo_IAIN_Ponorogo.svg.png", worldRank: "#3820", score: "50.8", established: "1997", location: "Ponorogo", students: "12,000+", accreditation: "Baik Sekali", type: "PTKIN" },
    { rank: 77, name: "IAIN Tulungagung", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Logo_IAIN_Tulungagung.svg/1200px-Logo_IAIN_Tulungagung.svg.png", worldRank: "#3865", score: "50.35", established: "1997", location: "Tulungagung", students: "12,000+", accreditation: "Baik Sekali", type: "PTKIN" },
    { rank: 78, name: "IAIN Syekh Nurjati Cirebon", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Logo_IAIN_Cirebon.svg/1200px-Logo_IAIN_Cirebon.svg.png", worldRank: "#3910", score: "49.9", established: "1997", location: "Cirebon", students: "12,000+", accreditation: "Baik Sekali", type: "PTKIN" },
    { rank: 79, name: "Universitas Khairun", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Logo_Unkhair.svg/1200px-Logo_Unkhair.svg.png", worldRank: "#3955", score: "49.45", established: "2004", location: "Ternate", students: "18,000+", accreditation: "Baik Sekali", type: "PTN" },
    { rank: 80, name: "Universitas Terbuka", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Logo_UT.svg/1200px-Logo_UT.svg.png", worldRank: "#4000", score: "49.0", established: "1984", location: "Jakarta", students: "350,000+", accreditation: "Unggul", type: "PTN" },
    { rank: 81, name: "Politeknik Negeri Bandung", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Logo_Polban.svg/1200px-Logo_Polban.svg.png", worldRank: "#4045", score: "48.55", established: "1982", location: "Bandung", students: "12,000+", accreditation: "Unggul", type: "Politeknik" },
    { rank: 82, name: "Politeknik Negeri Jakarta", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Logo_PNJ.svg/1200px-Logo_PNJ.svg.png", worldRank: "#4090", score: "48.1", established: "1982", location: "Depok", students: "12,000+", accreditation: "Unggul", type: "Politeknik" },
    { rank: 83, name: "Politeknik Negeri Malang", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Logo_Polinema.svg/1200px-Logo_Polinema.svg.png", worldRank: "#4135", score: "47.65", established: "1982", location: "Malang", students: "14,000+", accreditation: "Unggul", type: "Politeknik" },
    { rank: 84, name: "Politeknik Elektronika Negeri Surabaya", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Logo_PENS.svg/1200px-Logo_PENS.svg.png", worldRank: "#4180", score: "47.2", established: "1988", location: "Surabaya", students: "8,000+", accreditation: "Unggul", type: "Politeknik" },
    { rank: 85, name: "Politeknik Negeri Semarang", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Logo_Polines.svg/1200px-Logo_Polines.svg.png", worldRank: "#4225", score: "46.75", established: "1982", location: "Semarang", students: "12,000+", accreditation: "Unggul", type: "Politeknik" },
    { rank: 86, name: "Politeknik Negeri Medan", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Logo_Polmed.svg/1200px-Logo_Polmed.svg.png", worldRank: "#4270", score: "46.3", established: "1982", location: "Medan", students: "10,000+", accreditation: "Unggul", type: "Politeknik" },
    { rank: 87, name: "Politeknik Negeri Sriwijaya", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Logo_Polsri.svg/1200px-Logo_Polsri.svg.png", worldRank: "#4315", score: "45.85", established: "1982", location: "Palembang", students: "12,000+", accreditation: "Unggul", type: "Politeknik" },
    { rank: 88, name: "Politeknik Negeri Padang", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Logo_PNP.svg/1200px-Logo_PNP.svg.png", worldRank: "#4360", score: "45.4", established: "1985", location: "Padang", students: "8,000+", accreditation: "Unggul", type: "Politeknik" },
    { rank: 89, name: "Politeknik Negeri Bali", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Logo_PNB.svg/1200px-Logo_PNB.svg.png", worldRank: "#4405", score: "44.95", established: "1985", location: "Bali", students: "8,000+", accreditation: "Unggul", type: "Politeknik" },
    { rank: 90, name: "Politeknik Negeri Ujung Pandang", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Logo_PNUP.svg/1200px-Logo_PNUP.svg.png", worldRank: "#4450", score: "44.5", established: "1987", location: "Makassar", students: "10,000+", accreditation: "Unggul", type: "Politeknik" },
    { rank: 91, name: "Politeknik Negeri Manado", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Logo_PNManado.svg/1200px-Logo_PNManado.svg.png", worldRank: "#4495", score: "44.05", established: "1987", location: "Manado", students: "6,000+", accreditation: "Unggul", type: "Politeknik" },
    { rank: 92, name: "Politeknik Negeri Jember", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Logo_Polije.svg/1200px-Logo_Polije.svg.png", worldRank: "#4540", score: "43.6", established: "1988", location: "Jember", students: "8,000+", accreditation: "Unggul", type: "Politeknik" },
    { rank: 93, name: "Politeknik Negeri Samarinda", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Logo_Polnes.svg/1200px-Logo_Polnes.svg.png", worldRank: "#4585", score: "43.15", established: "1989", location: "Samarinda", students: "6,000+", accreditation: "Unggul", type: "Politeknik" },
    { rank: 94, name: "Politeknik Negeri Pontianak", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Logo_Polnep.svg/1200px-Logo_Polnep.svg.png", worldRank: "#4630", score: "42.7", established: "1985", location: "Pontianak", students: "6,000+", accreditation: "Unggul", type: "Politeknik" },
    { rank: 95, name: "Politeknik Negeri Lampung", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Logo_Polinela.svg/1200px-Logo_Polinela.svg.png", worldRank: "#4675", score: "42.25", established: "1997", location: "Lampung", students: "6,000+", accreditation: "Unggul", type: "Politeknik" },
    { rank: 96, name: "Politeknik Negeri Banjarmasin", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Logo_Poliban.svg/1200px-Logo_Poliban.svg.png", worldRank: "#4720", score: "41.8", established: "1987", location: "Banjarmasin", students: "6,000+", accreditation: "Unggul", type: "Politeknik" },
    { rank: 97, name: "Politeknik Negeri Ambon", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Logo_Polnambon.svg/1200px-Logo_Polnambon.svg.png", worldRank: "#4765", score: "41.35", established: "1987", location: "Ambon", students: "5,000+", accreditation: "Baik Sekali", type: "Politeknik" },
    { rank: 98, name: "Politeknik Negeri Kupang", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Logo_PNKupang.svg/1200px-Logo_PNKupang.svg.png", worldRank: "#4810", score: "40.9", established: "1985", location: "Kupang", students: "5,000+", accreditation: "Baik Sekali", type: "Politeknik" },
    { rank: 99, name: "Politeknik Pertanian Negeri Kupang", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Logo_Politani_Kupang.svg/1200px-Logo_Politani_Kupang.svg.png", worldRank: "#4855", score: "40.45", established: "1997", location: "Kupang", students: "3,000+", accreditation: "Baik Sekali", type: "Politeknik" },
    { rank: 100, name: "PTN/Institusi Negeri Lainnya", logo: "", worldRank: "#4900", score: "40.0", established: "-", location: "Indonesia", students: "-", accreditation: "-", type: "PTN" }
];

// ============================================
// EDURANK 2026 - 100 PTN INDONESIA
// Sumber: https://edurank.org/geo/id/
// ============================================
const eduRankData = [
    { rank: 1, name: "Universitas Indonesia", logo: "https://fia.ui.ac.id/wp-content/uploads/182/2018/01/logo-UI.png", asiaRank: "#88", worldRank: "#531", established: "1849", location: "Depok & Jakarta", students: "47,000+", accreditation: "Unggul", type: "PTN" },
    { rank: 2, name: "Universitas Gadjah Mada", logo: "https://upload.wikimedia.org/wikipedia/id/thumb/9/9f/Emblem_of_Universitas_Gadjah_Mada.svg/1280px-Emblem_of_Universitas_Gadjah_Mada.svg.png", asiaRank: "#121", worldRank: "#666", established: "1949", location: "Yogyakarta", students: "55,000+", accreditation: "Unggul", type: "PTN" },
    { rank: 3, name: "Institut Teknologi Bandung", logo: "https://upload.wikimedia.org/wikipedia/id/9/95/Logo_Institut_Teknologi_Bandung.png", asiaRank: "#158", worldRank: "#796", established: "1920", location: "Bandung", students: "22,000+", accreditation: "Unggul", type: "PTN" },
    { rank: 4, name: "Universitas Airlangga", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/65/Logo-Branding-UNAIR-biru.png/500px-Logo-Branding-UNAIR-biru.png", asiaRank: "#223", worldRank: "#997", established: "1954", location: "Surabaya", students: "38,000+", accreditation: "Unggul", type: "PTN" },
    { rank: 5, name: "IPB University", logo: "https://www.ipb.ac.id/wp-content/uploads/2023/12/Logo-IPB-University_Vertical.png", asiaRank: "#236", worldRank: "#1033", established: "1963", location: "Bogor", students: "28,000+", accreditation: "Unggul", type: "PTN" },
    { rank: 6, name: "Universitas Padjadjaran", logo: "https://www.unpad.ac.id/wp-content/uploads/2018/04/logo-unpad1.png", asiaRank: "#308", worldRank: "#1261", established: "1957", location: "Bandung", students: "48,000+", accreditation: "Unggul", type: "PTN" },
    { rank: 7, name: "Universitas Diponegoro", logo: "https://upload.wikimedia.org/wikipedia/id/2/20/Logo_Universitas_Diponegoro.png", asiaRank: "#312", worldRank: "#1269", established: "1957", location: "Semarang", students: "52,000+", accreditation: "Unggul", type: "PTN" },
    { rank: 8, name: "Universitas Brawijaya", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/bb/Logo_Universitas_Brawijaya.svg/960px-Logo_Universitas_Brawijaya.svg.png", asiaRank: "#320", worldRank: "#1290", established: "1963", location: "Malang", students: "62,000+", accreditation: "Unggul", type: "PTN" },
    { rank: 9, name: "Institut Teknologi Sepuluh Nopember", logo: "https://upload.wikimedia.org/wikipedia/id/c/c4/Badge_ITS.png", asiaRank: "#331", worldRank: "#1319", established: "1957", location: "Surabaya", students: "22,000+", accreditation: "Unggul", type: "PTN" },
    { rank: 10, name: "Universitas Sebelas Maret", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/Logo_UNS.svg/1200px-Logo_UNS.svg.png", asiaRank: "#357", worldRank: "#1391", established: "1976", location: "Surakarta", students: "36,000+", accreditation: "Unggul", type: "PTN" },
    { rank: 11, name: "Universitas Hasanuddin", logo: "https://upload.wikimedia.org/wikipedia/commons/b/bd/Logo-Resmi-Unhas-1.png", asiaRank: "#401", worldRank: "#1515", established: "1956", location: "Makassar", students: "42,000+", accreditation: "Unggul", type: "PTN" },
    { rank: 12, name: "Universitas Sumatera Utara", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Logo_USU.svg/1200px-Logo_USU.svg.png", asiaRank: "#468", worldRank: "#1709", established: "1952", location: "Medan", students: "46,000+", accreditation: "Unggul", type: "PTN" },
    { rank: 13, name: "Universitas Pendidikan Indonesia", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Logo_UPI.svg/1200px-Logo_UPI.svg.png", asiaRank: "#472", worldRank: "#1720", established: "1954", location: "Bandung", students: "38,000+", accreditation: "Unggul", type: "PTN" },
    { rank: 14, name: "Universitas Syiah Kuala", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/Logo_Unsyiah.svg/1200px-Logo_Unsyiah.svg.png", asiaRank: "#546", worldRank: "#1941", established: "1961", location: "Banda Aceh", students: "32,000+", accreditation: "Unggul", type: "PTN" },
    { rank: 15, name: "Universitas Negeri Yogyakarta", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Logo_UNY.svg/1200px-Logo_UNY.svg.png", asiaRank: "#564", worldRank: "#1989", established: "1964", location: "Yogyakarta", students: "32,000+", accreditation: "Unggul", type: "PTN" },
    { rank: 16, name: "Universitas Negeri Malang", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1f/Logo_UM.svg/1200px-Logo_UM.svg.png", asiaRank: "#574", worldRank: "#2011", established: "1954", location: "Malang", students: "30,000+", accreditation: "Unggul", type: "PTN" },
    { rank: 17, name: "Universitas Andalas", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/01/Logo_Unand.svg/1280px-Logo_Unand.svg.png", asiaRank: "#586", worldRank: "#2043", established: "1955", location: "Padang", students: "32,000+", accreditation: "Unggul", type: "PTN" },
    { rank: 18, name: "Universitas Sriwijaya", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5f/Logo_Unsri.svg/1200px-Logo_Unsri.svg.png", asiaRank: "#648", worldRank: "#2221", established: "1960", location: "Palembang", students: "36,000+", accreditation: "Unggul", type: "PTN" },
    { rank: 19, name: "Universitas Lampung", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Logo_Unila.svg/1200px-Logo_Unila.svg.png", asiaRank: "#662", worldRank: "#2259", established: "1965", location: "Bandar Lampung", students: "32,000+", accreditation: "Unggul", type: "PTN" },
    { rank: 20, name: "Universitas Negeri Semarang", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Logo_Unnes.svg/1200px-Logo_Unnes.svg.png", asiaRank: "#673", worldRank: "#2291", established: "1965", location: "Semarang", students: "30,000+", accreditation: "Unggul", type: "PTN" },
    { rank: 21, name: "Universitas Jember", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/Logo_UNEJ.svg/1200px-Logo_UNEJ.svg.png", asiaRank: "#757", worldRank: "#2529", established: "1964", location: "Jember", students: "28,000+", accreditation: "Unggul", type: "PTN" },
    { rank: 22, name: "Universitas Negeri Padang", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Logo_UNP.svg/1200px-Logo_UNP.svg.png", asiaRank: "#792", worldRank: "#2616", established: "1954", location: "Padang", students: "28,000+", accreditation: "Unggul", type: "PTN" },
    { rank: 23, name: "Universitas Negeri Jakarta", logo: "https://unj.ac.id/wp-content/uploads/2025/02/UNJ-LOGO-512-PX-1.png", asiaRank: "#820", worldRank: "#2697", established: "1964", location: "Jakarta", students: "32,000+", accreditation: "Unggul", type: "PTN" },
    { rank: 24, name: "Universitas Mulawarman", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Logo_Unmul.svg/1200px-Logo_Unmul.svg.png", asiaRank: "#825", worldRank: "#2707", established: "1962", location: "Samarinda", students: "28,000+", accreditation: "Unggul", type: "PTN" },
    { rank: 25, name: "Universitas Mataram", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5f/Logo_Unram.svg/1200px-Logo_Unram.svg.png", asiaRank: "#846", worldRank: "#2751", established: "1962", location: "Mataram", students: "28,000+", accreditation: "Unggul", type: "PTN" },
    { rank: 26, name: "Universitas Udayana", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Logo_Udayana.svg/1200px-Logo_Udayana.svg.png", asiaRank: "#863", worldRank: "#2795", established: "1962", location: "Bali", students: "28,000+", accreditation: "Unggul", type: "PTN" },
    { rank: 27, name: "Universitas Riau", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Logo_Unri.svg/1200px-Logo_Unri.svg.png", asiaRank: "#894", worldRank: "#2865", established: "1962", location: "Pekanbaru", students: "32,000+", accreditation: "Unggul", type: "PTN" },
    { rank: 28, name: "Universitas Jenderal Soedirman", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Logo_Unsoed.svg/1200px-Logo_Unsoed.svg.png", asiaRank: "#917", worldRank: "#2928", established: "1963", location: "Purwokerto", students: "28,000+", accreditation: "Unggul", type: "PTN" },
    { rank: 29, name: "Universitas Negeri Surabaya", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1f/Logo_Unesa.svg/1200px-Logo_Unesa.svg.png", asiaRank: "#923", worldRank: "#2942", established: "1964", location: "Surabaya", students: "28,000+", accreditation: "Unggul", type: "PTN" },
    { rank: 30, name: "Universitas Negeri Makassar", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Logo_UNM.svg/1200px-Logo_UNM.svg.png", asiaRank: "#941", worldRank: "#2977", established: "1961", location: "Makassar", students: "32,000+", accreditation: "Unggul", type: "PTN" },
    { rank: 31, name: "Universitas Negeri Medan", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Logo_Unimed.svg/1200px-Logo_Unimed.svg.png", asiaRank: "#1054", worldRank: "#3290", established: "1963", location: "Medan", students: "28,000+", accreditation: "Unggul", type: "PTN" },
    { rank: 32, name: "Universitas Sam Ratulangi", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Logo_Unsrat.svg/1200px-Logo_Unsrat.svg.png", asiaRank: "#1111", worldRank: "#3432", established: "1961", location: "Manado", students: "28,000+", accreditation: "Unggul", type: "PTN" },
    { rank: 33, name: "UIN Syarif Hidayatullah Jakarta", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Logo_UIN_Jakarta.svg/1200px-Logo_UIN_Jakarta.svg.png", asiaRank: "#1135", worldRank: "#3486", established: "1957", location: "Jakarta", students: "28,000+", accreditation: "Unggul", type: "PTKIN" },
    { rank: 34, name: "UIN Sunan Kalijaga Yogyakarta", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Logo_UIN_Suka.svg/1200px-Logo_UIN_Suka.svg.png", asiaRank: "#1148", worldRank: "#3514", established: "1951", location: "Yogyakarta", students: "22,000+", accreditation: "Unggul", type: "PTKIN" },
    { rank: 35, name: "Universitas Sultan Ageng Tirtayasa", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Logo_Untirta.svg/1200px-Logo_Untirta.svg.png", asiaRank: "#1157", worldRank: "#3532", established: "2001", location: "Serang", students: "22,000+", accreditation: "Unggul", type: "PTN" },
    { rank: 36, name: "Universitas Halu Oleo", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Logo_Uho.svg/1200px-Logo_Uho.svg.png", asiaRank: "#1176", worldRank: "#3574", established: "1981", location: "Kendari", students: "28,000+", accreditation: "Unggul", type: "PTN" },
    { rank: 37, name: "Universitas Tanjungpura", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Logo_Untan.svg/1200px-Logo_Untan.svg.png", asiaRank: "#1184", worldRank: "#3591", established: "1959", location: "Pontianak", students: "28,000+", accreditation: "Unggul", type: "PTN" },
    { rank: 38, name: "Universitas Tadulako", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Logo_Untad.svg/1200px-Logo_Untad.svg.png", asiaRank: "#1238", worldRank: "#3721", established: "1981", location: "Palu", students: "28,000+", accreditation: "Unggul", type: "PTN" },
    { rank: 39, name: "Universitas Malikussaleh", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Logo_Unimal.svg/1200px-Logo_Unimal.svg.png", asiaRank: "#1267", worldRank: "#3794", established: "2001", location: "Lhokseumawe", students: "18,000+", accreditation: "Baik Sekali", type: "PTN" },
    { rank: 40, name: "UPN Veteran Yogyakarta", logo: "https://kompaspedia.kompas.id/wp-content/uploads/2020/08/logo_Universitas-Pembangunan-Nasional-Veteran-Yogyakarta.png", asiaRank: "#1312", worldRank: "#3901", established: "1958", location: "Yogyakarta", students: "15,000+", accreditation: "Unggul", type: "PTN" },
    { rank: 41, name: "UIN Sunan Gunung Djati Bandung", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Logo_UIN_SGD.svg/1200px-Logo_UIN_SGD.svg.png", asiaRank: "#1325", worldRank: "#3932", established: "1968", location: "Bandung", students: "22,000+", accreditation: "Unggul", type: "PTKIN" },
    { rank: 42, name: "Universitas Bengkulu", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Logo_Unib.svg/1200px-Logo_Unib.svg.png", asiaRank: "#1341", worldRank: "#3968", established: "1982", location: "Bengkulu", students: "22,000+", accreditation: "Unggul", type: "PTN" },
    { rank: 43, name: "Universitas Negeri Gorontalo", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Logo_UNG.svg/1200px-Logo_UNG.svg.png", asiaRank: "#1358", worldRank: "#4011", established: "2004", location: "Gorontalo", students: "18,000+", accreditation: "Unggul", type: "PTN" },
    { rank: 44, name: "UPN Veteran Jawa Timur", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Logo_UPNVJT.svg/1200px-Logo_UPNVJT.svg.png", asiaRank: "#1381", worldRank: "#4070", established: "1959", location: "Surabaya", students: "20,000+", accreditation: "Unggul", type: "PTN" },
    { rank: 45, name: "Universitas Trunojoyo Madura", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Logo_UTM.svg/1200px-Logo_UTM.svg.png", asiaRank: "#1404", worldRank: "#4132", established: "2001", location: "Bangkalan", students: "18,000+", accreditation: "Unggul", type: "PTN" },
    { rank: 46, name: "Universitas Pattimura", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Logo_Unpatti.svg/1200px-Logo_Unpatti.svg.png", asiaRank: "#1435", worldRank: "#4210", established: "1963", location: "Ambon", students: "22,000+", accreditation: "Unggul", type: "PTN" },
    { rank: 47, name: "Universitas Palangka Raya", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Logo_UPR.svg/1200px-Logo_UPR.svg.png", asiaRank: "#1458", worldRank: "#4268", established: "1963", location: "Palangka Raya", students: "18,000+", accreditation: "Unggul", type: "PTN" },
    { rank: 48, name: "Universitas Cenderawasih", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Logo_Uncen.svg/1200px-Logo_Uncen.svg.png", asiaRank: "#1481", worldRank: "#4325", established: "1962", location: "Jayapura", students: "22,000+", accreditation: "Unggul", type: "PTN" },
    { rank: 49, name: "UIN Maulana Malik Ibrahim Malang", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Logo_UIN_Malang.svg/1200px-Logo_UIN_Malang.svg.png", asiaRank: "#1502", worldRank: "#4376", established: "2004", location: "Malang", students: "20,000+", accreditation: "Unggul", type: "PTKIN" },
    { rank: 50, name: "UIN Sunan Ampel Surabaya", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Logo_UIN_Sunan_Ampel.svg/1200px-Logo_UIN_Sunan_Ampel.svg.png", asiaRank: "#1528", worldRank: "#4432", established: "1965", location: "Surabaya", students: "18,000+", accreditation: "Unggul", type: "PTKIN" },
    { rank: 51, name: "Universitas Siliwangi", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Logo_Unsil.svg/1200px-Logo_Unsil.svg.png", asiaRank: "#1555", worldRank: "#4498", established: "2014", location: "Tasikmalaya", students: "18,000+", accreditation: "Baik Sekali", type: "PTN" },
    { rank: 52, name: "Universitas Khairun", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Logo_Unkhair.svg/1200px-Logo_Unkhair.svg.png", asiaRank: "#1582", worldRank: "#4562", established: "2004", location: "Ternate", students: "18,000+", accreditation: "Baik Sekali", type: "PTN" },
    { rank: 53, name: "Universitas Nusa Cendana", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Logo_Undana.svg/1200px-Logo_Undana.svg.png", asiaRank: "#1605", worldRank: "#4618", established: "1962", location: "Kupang", students: "22,000+", accreditation: "Unggul", type: "PTN" },
    { rank: 54, name: "Universitas Bangka Belitung", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Logo_UBB.svg/1200px-Logo_UBB.svg.png", asiaRank: "#1632", worldRank: "#4682", established: "2006", location: "Pangkalpinang", students: "12,000+", accreditation: "Baik Sekali", type: "PTN" },
    { rank: 55, name: "Universitas Terbuka", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Logo_UT.svg/1200px-Logo_UT.svg.png", asiaRank: "#1658", worldRank: "#4741", established: "1984", location: "Jakarta", students: "350,000+", accreditation: "Unggul", type: "PTN" },
    { rank: 56, name: "UIN Alauddin Makassar", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Logo_UIN_Alauddin.svg/1200px-Logo_UIN_Alauddin.svg.png", asiaRank: "#1682", worldRank: "#4799", established: "1965", location: "Makassar", students: "20,000+", accreditation: "Unggul", type: "PTKIN" },
    { rank: 57, name: "UPN Veteran Jakarta", logo: "https://www.upnvj.ac.id/id/files/large/89f8a80e388ced3704b091e21f510755", asiaRank: "#1705", worldRank: "#4855", established: "1965", location: "Jakarta", students: "20,000+", accreditation: "Unggul", type: "PTN" },
    { rank: 58, name: "Politeknik Negeri Bandung", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Logo_Polban.svg/1200px-Logo_Polban.svg.png", asiaRank: "#1732", worldRank: "#4912", established: "1982", location: "Bandung", students: "12,000+", accreditation: "Unggul", type: "Politeknik" },
    { rank: 59, name: "Politeknik Negeri Jakarta", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Logo_PNJ.svg/1200px-Logo_PNJ.svg.png", asiaRank: "#1758", worldRank: "#4976", established: "1982", location: "Depok", students: "12,000+", accreditation: "Unggul", type: "Politeknik" },
    { rank: 60, name: "UIN Raden Intan Lampung", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Logo_UIN_Raden_Intan.svg/1200px-Logo_UIN_Raden_Intan.svg.png", asiaRank: "#1782", worldRank: "#5032", established: "1968", location: "Lampung", students: "18,000+", accreditation: "Unggul", type: "PTKIN" },
    { rank: 61, name: "Politeknik Elektronika Negeri Surabaya", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Logo_PENS.svg/1200px-Logo_PENS.svg.png", asiaRank: "#1805", worldRank: "#5088", established: "1988", location: "Surabaya", students: "8,000+", accreditation: "Unggul", type: "Politeknik" },
    { rank: 62, name: "Universitas Tidar", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Logo_Untidar.svg/1200px-Logo_Untidar.svg.png", asiaRank: "#1832", worldRank: "#5145", established: "2014", location: "Magelang", students: "12,000+", accreditation: "Baik Sekali", type: "PTN" },
    { rank: 63, name: "Universitas Singaperbangsa Karawang", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Logo_Unsika.svg/1200px-Logo_Unsika.svg.png", asiaRank: "#1858", worldRank: "#5202", established: "2014", location: "Karawang", students: "22,000+", accreditation: "Baik Sekali", type: "PTN" },
    { rank: 64, name: "UIN Ar-Raniry Banda Aceh", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Logo_UIN_Ar_Raniry.svg/1200px-Logo_UIN_Ar_Raniry.svg.png", asiaRank: "#1882", worldRank: "#5258", established: "1963", location: "Banda Aceh", students: "18,000+", accreditation: "Unggul", type: "PTKIN" },
    { rank: 65, name: "UIN Walisongo Semarang", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Logo_UIN_Walisongo.svg/1200px-Logo_UIN_Walisongo.svg.png", asiaRank: "#1905", worldRank: "#5312", established: "1970", location: "Semarang", students: "20,000+", accreditation: "Unggul", type: "PTKIN" },
    { rank: 66, name: "Universitas Maritim Raja Ali Haji", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Logo_Umrah.svg/1200px-Logo_Umrah.svg.png", asiaRank: "#1932", worldRank: "#5371", established: "2007", location: "Tanjungpinang", students: "12,000+", accreditation: "Baik Sekali", type: "PTN" },
    { rank: 67, name: "Universitas Papua", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Logo_Unipa.svg/1200px-Logo_Unipa.svg.png", asiaRank: "#1958", worldRank: "#5428", established: "2000", location: "Manokwari", students: "12,000+", accreditation: "Baik Sekali", type: "PTN" },
    { rank: 68, name: "Universitas Borneo Tarakan", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Logo_UBT.svg/1200px-Logo_UBT.svg.png", asiaRank: "#1982", worldRank: "#5485", established: "2010", location: "Tarakan", students: "12,000+", accreditation: "Baik Sekali", type: "PTN" },
    { rank: 69, name: "Universitas Teuku Umar", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Logo_UTU.svg/1200px-Logo_UTU.svg.png", asiaRank: "#2005", worldRank: "#5542", established: "2014", location: "Meulaboh", students: "10,000+", accreditation: "Baik", type: "PTN" },
    { rank: 70, name: "Universitas Samudra", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Logo_Unsam.svg/1200px-Logo_Unsam.svg.png", asiaRank: "#2032", worldRank: "#5601", established: "2013", location: "Langsa", students: "10,000+", accreditation: "Baik", type: "PTN" },
    { rank: 71, name: "Universitas Sulawesi Barat", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Logo_Unsulbar.svg/1200px-Logo_Unsulbar.svg.png", asiaRank: "#2058", worldRank: "#5658", established: "2014", location: "Majene", students: "8,000+", accreditation: "Baik", type: "PTN" },
    { rank: 72, name: "Universitas Musamus Merauke", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Logo_Unmus.svg/1200px-Logo_Unmus.svg.png", asiaRank: "#2082", worldRank: "#5715", established: "2010", location: "Merauke", students: "10,000+", accreditation: "Baik Sekali", type: "PTN" },
    { rank: 73, name: "UIN Sultan Syarif Kasim Riau", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Logo_UIN_Suska.svg/1200px-Logo_UIN_Suska.svg.png", asiaRank: "#2105", worldRank: "#5771", established: "1970", location: "Pekanbaru", students: "20,000+", accreditation: "Unggul", type: "PTKIN" },
    { rank: 74, name: "Politeknik Negeri Malang", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Logo_Polinema.svg/1200px-Logo_Polinema.svg.png", asiaRank: "#2132", worldRank: "#5832", established: "1982", location: "Malang", students: "14,000+", accreditation: "Unggul", type: "Politeknik" },
    { rank: 75, name: "Politeknik Negeri Semarang", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Logo_Polines.svg/1200px-Logo_Polines.svg.png", asiaRank: "#2158", worldRank: "#5889", established: "1982", location: "Semarang", students: "12,000+", accreditation: "Unggul", type: "Politeknik" },
    { rank: 76, name: "ISI Yogyakarta", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Logo_ISI_Yogyakarta.svg/1200px-Logo_ISI_Yogyakarta.svg.png", asiaRank: "#2182", worldRank: "#5945", established: "1984", location: "Yogyakarta", students: "6,000+", accreditation: "Unggul", type: "PTN" },
    { rank: 77, name: "ISI Denpasar", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Logo_ISI_Denpasar.svg/1200px-Logo_ISI_Denpasar.svg.png", asiaRank: "#2205", worldRank: "#6001", established: "2003", location: "Denpasar", students: "6,000+", accreditation: "Unggul", type: "PTN" },
    { rank: 78, name: "Institut Teknologi Sumatera", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Logo_ITERA.svg/1200px-Logo_ITERA.svg.png", asiaRank: "#2232", worldRank: "#6062", established: "2014", location: "Lampung", students: "8,000+", accreditation: "Baik Sekali", type: "PTN" },
    { rank: 79, name: "Institut Teknologi Kalimantan", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Logo_ITK.svg/1200px-Logo_ITK.svg.png", asiaRank: "#2258", worldRank: "#6121", established: "2014", location: "Balikpapan", students: "8,000+", accreditation: "Baik Sekali", type: "PTN" },
    { rank: 80, name: "UIN Imam Bonjol Padang", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Logo_UIN_Imam_Bonjol.svg/1200px-Logo_UIN_Imam_Bonjol.svg.png", asiaRank: "#2282", worldRank: "#6178", established: "1966", location: "Padang", students: "18,000+", accreditation: "Unggul", type: "PTKIN" },
    { rank: 81, name: "UIN Mataram", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Logo_UIN_Mataram.svg/1200px-Logo_UIN_Mataram.svg.png", asiaRank: "#2305", worldRank: "#6235", established: "2004", location: "Mataram", students: "15,000+", accreditation: "Baik Sekali", type: "PTKIN" },
    { rank: 82, name: "Politeknik Negeri Medan", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Logo_Polmed.svg/1200px-Logo_Polmed.svg.png", asiaRank: "#2332", worldRank: "#6298", established: "1982", location: "Medan", students: "10,000+", accreditation: "Unggul", type: "Politeknik" },
    { rank: 83, name: "Politeknik Negeri Sriwijaya", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Logo_Polsri.svg/1200px-Logo_Polsri.svg.png", asiaRank: "#2358", worldRank: "#6355", established: "1982", location: "Palembang", students: "12,000+", accreditation: "Unggul", type: "Politeknik" },
    { rank: 84, name: "Politeknik Negeri Padang", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Logo_PNP.svg/1200px-Logo_PNP.svg.png", asiaRank: "#2382", worldRank: "#6412", established: "1985", location: "Padang", students: "8,000+", accreditation: "Unggul", type: "Politeknik" },
    { rank: 85, name: "Politeknik Negeri Bali", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Logo_PNB.svg/1200px-Logo_PNB.svg.png", asiaRank: "#2405", worldRank: "#6468", established: "1985", location: "Bali", students: "8,000+", accreditation: "Unggul", type: "Politeknik" },
    { rank: 86, name: "Politeknik Negeri Ujung Pandang", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Logo_PNUP.svg/1200px-Logo_PNUP.svg.png", asiaRank: "#2432", worldRank: "#6525", established: "1987", location: "Makassar", students: "10,000+", accreditation: "Unggul", type: "Politeknik" },
    { rank: 87, name: "Politeknik Negeri Jember", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Logo_Polije.svg/1200px-Logo_Polije.svg.png", asiaRank: "#2458", worldRank: "#6582", established: "1988", location: "Jember", students: "8,000+", accreditation: "Unggul", type: "Politeknik" },
    { rank: 88, name: "Politeknik Negeri Samarinda", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Logo_Polnes.svg/1200px-Logo_Polnes.svg.png", asiaRank: "#2482", worldRank: "#6638", established: "1989", location: "Samarinda", students: "6,000+", accreditation: "Unggul", type: "Politeknik" },
    { rank: 89, name: "Politeknik Negeri Pontianak", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Logo_Polnep.svg/1200px-Logo_Polnep.svg.png", asiaRank: "#2505", worldRank: "#6695", established: "1985", location: "Pontianak", students: "6,000+", accreditation: "Unggul", type: "Politeknik" },
    { rank: 90, name: "Politeknik Negeri Lampung", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Logo_Polinela.svg/1200px-Logo_Polinela.svg.png", asiaRank: "#2532", worldRank: "#6752", established: "1997", location: "Lampung", students: "6,000+", accreditation: "Unggul", type: "Politeknik" },
    { rank: 91, name: "Politeknik Negeri Banjarmasin", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Logo_Poliban.svg/1200px-Logo_Poliban.svg.png", asiaRank: "#2558", worldRank: "#6809", established: "1987", location: "Banjarmasin", students: "6,000+", accreditation: "Unggul", type: "Politeknik" },
    { rank: 92, name: "Politeknik Negeri Ambon", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Logo_Polnambon.svg/1200px-Logo_Polnambon.svg.png", asiaRank: "#2582", worldRank: "#6865", established: "1987", location: "Ambon", students: "5,000+", accreditation: "Baik Sekali", type: "Politeknik" },
    { rank: 93, name: "Politeknik Negeri Kupang", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Logo_PNKupang.svg/1200px-Logo_PNKupang.svg.png", asiaRank: "#2605", worldRank: "#6922", established: "1985", location: "Kupang", students: "5,000+", accreditation: "Baik Sekali", type: "Politeknik" },
    { rank: 94, name: "Universitas Sembilanbelas November Kolaka", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Logo_USN.svg/1200px-Logo_USN.svg.png", asiaRank: "#2632", worldRank: "#6985", established: "2014", location: "Kolaka", students: "10,000+", accreditation: "Baik", type: "PTN" },
    { rank: 95, name: "ISI Padangpanjang", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Logo_ISI_Padangpanjang.svg/1200px-Logo_ISI_Padangpanjang.svg.png", asiaRank: "#2658", worldRank: "#7041", established: "1965", location: "Padangpanjang", students: "3,000+", accreditation: "Unggul", type: "PTN" },
    { rank: 96, name: "ISI Surakarta", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Logo_ISI_Surakarta.svg/1200px-Logo_ISI_Surakarta.svg.png", asiaRank: "#2682", worldRank: "#7098", established: "1964", location: "Surakarta", students: "3,000+", accreditation: "Unggul", type: "PTN" },
    { rank: 97, name: "ISBI Bandung", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Logo_ISBI_Bandung.svg/1200px-Logo_ISBI_Bandung.svg.png", asiaRank: "#2705", worldRank: "#7155", established: "1968", location: "Bandung", students: "2,000+", accreditation: "Baik Sekali", type: "PTN" },
    { rank: 98, name: "Universitas Timor", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Logo_Unimor.svg/1200px-Logo_Unimor.svg.png", asiaRank: "#2732", worldRank: "#7212", established: "2014", location: "Kefamenanu", students: "10,000+", accreditation: "Baik", type: "PTN" },
    { rank: 99, name: "Politeknik Negeri Batam", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Logo_Polibatam.svg/1200px-Logo_Polibatam.svg.png", asiaRank: "#2758", worldRank: "#7271", established: "2000", location: "Batam", students: "6,000+", accreditation: "Unggul", type: "Politeknik" },
    { rank: 100, name: "Politeknik Negeri Manado", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Logo_PNManado.svg/1200px-Logo_PNManado.svg.png", asiaRank: "#2782", worldRank: "#7328", established: "1987", location: "Manado", students: "6,000+", accreditation: "Unggul", type: "Politeknik" }
];

// ============================================
// METHODOLOGIES
// ============================================
const methodologies = {
    uniranks: {
        title: "UniRanks 2026",
        desc: "UniRanks menggunakan metodologi penilaian berdasarkan 5 kriteria utama: <strong>Academic Reputation (40%)</strong> – survei global terhadap akademisi, <strong>Employer Reputation (25%)</strong> – survei terhadap perusahaan perekrut, <strong>Faculty/Student Ratio (15%)</strong> – rasio dosen terhadap mahasiswa, <strong>Citations per Faculty (10%)</strong> – dampak riset yang diukur dari sitasi, dan <strong>International Ratio (10%)</strong> – proporsi mahasiswa dan dosen internasional. Data dikumpulkan dari survei global, database Scopus, dan data institusi.",
        source: "https://www.uniranks.com/ranking/indonesia"
    },
    edurank: {
        title: "EduRank 2026",
        desc: "EduRank menggunakan metodologi berbasis 3 dimensi utama: <strong>Research Performance (45%)</strong> – publikasi ilmiah dan sitasi dari database akademik, <strong>Non-Academic Prominence (45%)</strong> – popularitas online, reputasi digital, dan kehadiran web, serta <strong>Alumni Score (10%)</strong> – kesuksesan alumni yang diukur dari profil publik. Data diambil dari Microsoft Academic, Wikipedia, Crossref, dan database publikasi ilmiah.",
        source: "https://edurank.org/geo/id/"
    },
    qs: {
        title: "QS World University Rankings 2026",
        desc: "QS World Rankings menggunakan 6 indikator utama: <strong>Academic Reputation (40%)</strong>, <strong>Employer Reputation (10%)</strong>, <strong>Faculty/Student Ratio (20%)</strong>, <strong>Citations per Faculty (20%)</strong>, <strong>International Faculty Ratio (5%)</strong>, dan <strong>International Student Ratio (5%)</strong>. Untuk melihat data lengkap QS World Rankings, silakan kunjungi website resmi QS.",
        source: "https://www.topuniversities.com/world-university-rankings?countries=id&region=Asia"
    }
};

// Global
let currentTab = 'uniranks';
let currentData = [];

// Init
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => document.getElementById('preloader')?.classList.add('hide'), 500);
    initTabs();
    loadRanking('uniranks');
    document.getElementById('searchInput').addEventListener('input', filterTable);
});

function initTabs() {
    document.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            currentTab = tab.dataset.tab;
            loadRanking(currentTab);
        });
    });
}

function loadRanking(type) {
    currentTab = type;
    const methodology = methodologies[type] || methodologies['uniranks'];
    
    document.getElementById('methodologyInfo').innerHTML = `
        <h3><i class="fas fa-info-circle"></i> Metodologi ${methodology.title}</h3>
        <p>${methodology.desc}</p>
        <p class="source"><i class="fas fa-external-link-alt"></i> Sumber: <a href="${methodology.source}" target="_blank">${methodology.source}</a></p>
    `;
    
    if (type === 'uniranks') currentData = uniRanksData;
    else if (type === 'edurank') currentData = eduRankData;
    else {
        // QS - tampilkan pesan untuk buka link eksternal
        document.getElementById('rankingBody').innerHTML = `
            <tr class="empty-row">
                <td colspan="4">
                    <i class="fas fa-external-link-alt" style="font-size:3rem;color:var(--primary);margin-bottom:15px;display:block;"></i>
                    <p style="font-size:1.1rem;font-weight:600;margin-bottom:10px;">QS World University Rankings 2026</p>
                    <p style="margin-bottom:15px;">Untuk melihat data lengkap QS World Rankings, silakan kunjungi website resmi QS:</p>
                    <a href="https://www.topuniversities.com/world-university-rankings?countries=id&region=Asia" target="_blank" style="display:inline-block;padding:12px 25px;background:var(--gradient);color:white;border-radius:50px;text-decoration:none;font-weight:600;margin-top:10px;">
                        <i class="fas fa-external-link-alt"></i> Buka QS World Rankings
                    </a>
                </td>
            </tr>`;
        return;
    }
    
    renderTable(currentData);
}

function renderTable(data) {
    const tbody = document.getElementById('rankingBody');
    if (data.length === 0) {
        tbody.innerHTML = '<tr class="empty-row"><td colspan="4"><i class="fas fa-search"></i><br>Tidak ada universitas ditemukan</td></tr>';
        return;
    }
    tbody.innerHTML = data.map((item, index) => `
        <tr>
            <td><span class="rank-number ${index < 3 ? 'top' : ''}">#${item.rank}</span></td>
            <td>
                <div class="univ-name" onclick="showDetail(${index})">
                    ${item.logo ? `<img src="${item.logo}" alt="${item.name}" class="univ-logo" loading="lazy" onerror="this.style.display='none'">` : ''}
                    ${item.name}
                </div>
            </td>
            <td>
                ${currentTab === 'edurank' ? 
                    `<span style="font-size:0.8rem;color:var(--text-light);">Asia: ${item.asiaRank || '-'}</span><br><span class="score">${item.worldRank || '-'}</span>` :
                    `<span class="score">${item.score || item.worldRank || '-'}</span>`
                }
            </td>
            <td><button class="btn-detail" onclick="showDetail(${index})">Detail</button></td>
        </tr>
    `).join('');
}

function filterTable() {
    const query = document.getElementById('searchInput').value.toLowerCase();
    if (!currentData) return;
    const filtered = currentData.filter(item => item.name.toLowerCase().includes(query));
    renderTable(filtered);
}

function showDetail(index) {
    const item = currentData[index];
    if (!item) return;
    const methodology = methodologies[currentTab] || methodologies['uniranks'];
    
    document.getElementById('modalTitle').textContent = item.name;
    document.getElementById('modalBody').innerHTML = `
        ${item.logo ? `<img src="${item.logo}" alt="${item.name}" style="width:80px;height:80px;border-radius:50%;object-fit:contain;background:#f1f5f9;padding:5px;margin-bottom:15px;display:block;">` : ''}
        <div class="detail-grid">
            <div class="detail-item"><h4>Peringkat Nasional</h4><p>#${item.rank}</p></div>
            ${currentTab === 'edurank' ? `
                <div class="detail-item"><h4>Peringkat Asia</h4><p>${item.asiaRank || '-'}</p></div>
                <div class="detail-item"><h4>Peringkat Dunia</h4><p>${item.worldRank || '-'}</p></div>
            ` : `
                <div class="detail-item"><h4>Peringkat Dunia</h4><p>${item.worldRank || '-'}</p></div>
                <div class="detail-item"><h4>Skor</h4><p>${item.score || '-'}</p></div>
            `}
            <div class="detail-item"><h4>Tipe</h4><p>${item.type || '-'}</p></div>
        </div>
        <h3 style="margin-top:20px;">Informasi Institusi</h3>
        <div class="detail-grid">
            <div class="detail-item"><h4>Tahun Berdiri</h4><p>${item.established || '-'}</p></div>
            <div class="detail-item"><h4>Lokasi</h4><p>${item.location || '-'}</p></div>
            <div class="detail-item"><h4>Jumlah Mahasiswa</h4><p>${item.students || '-'}</p></div>
            <div class="detail-item"><h4>Akreditasi</h4><p>${item.accreditation || '-'}</p></div>
        </div>
        <p class="modal-source"><i class="fas fa-external-link-alt"></i> Sumber: <a href="${methodology.source}" target="_blank">${methodology.source}</a></p>
    `;
    document.getElementById('modalOverlay').classList.add('active');
}

function closeModal() {
    document.getElementById('modalOverlay').classList.remove('active');
}

document.getElementById('modalOverlay').addEventListener('click', function(e) {
    if (e.target === this) closeModal();
});

console.log('✅ Pemeringkatan PTN Indonesia 2026 - UniRanks 100 + EduRank 100 Loaded');
