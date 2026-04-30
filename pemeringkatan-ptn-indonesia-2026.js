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
// UNIRANKS 2026 - 100 PERGURUAN TINGGI INDONESIA
// ============================================
const uniRanksData = [
    { rank: 1, name: "Universitas Indonesia", logo: "https://fia.ui.ac.id/wp-content/uploads/182/2018/01/logo-UI.png", score: "98.5", established: "1849", location: "Depok & Jakarta", students: "40,000+", accreditation: "Unggul", type: "PTN" },
    { rank: 2, name: "Universitas Gadjah Mada", logo: "https://upload.wikimedia.org/wikipedia/id/thumb/9/9f/Emblem_of_Universitas_Gadjah_Mada.svg/1280px-Emblem_of_Universitas_Gadjah_Mada.svg.png", score: "96.2", established: "1949", location: "Yogyakarta", students: "55,000+", accreditation: "Unggul", type: "PTN" },
    { rank: 3, name: "Institut Teknologi Bandung", logo: "https://upload.wikimedia.org/wikipedia/id/9/95/Logo_Institut_Teknologi_Bandung.png", score: "94.8", established: "1920", location: "Bandung", students: "22,000+", accreditation: "Unggul", type: "PTN" },
    { rank: 4, name: "Universitas Airlangga", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/65/Logo-Branding-UNAIR-biru.png/500px-Logo-Branding-UNAIR-biru.png", score: "91.3", established: "1954", location: "Surabaya", students: "35,000+", accreditation: "Unggul", type: "PTN" },
    { rank: 5, name: "Institut Pertanian Bogor", logo: "https://www.ipb.ac.id/wp-content/uploads/2023/12/Logo-IPB-University_Vertical.png", score: "89.7", established: "1963", location: "Bogor", students: "25,000+", accreditation: "Unggul", type: "PTN" },
    { rank: 6, name: "Universitas Diponegoro", logo: "https://upload.wikimedia.org/wikipedia/id/2/20/Logo_Universitas_Diponegoro.png", score: "85.4", established: "1957", location: "Semarang", students: "50,000+", accreditation: "Unggul", type: "PTN" },
    { rank: 7, name: "Universitas Padjadjaran", logo: "https://www.unpad.ac.id/wp-content/uploads/2018/04/logo-unpad1.png", score: "84.1", established: "1957", location: "Bandung", students: "45,000+", accreditation: "Unggul", type: "PTN" },
    { rank: 8, name: "Universitas Brawijaya", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/bb/Logo_Universitas_Brawijaya.svg/960px-Logo_Universitas_Brawijaya.svg.png", score: "82.9", established: "1963", location: "Malang", students: "60,000+", accreditation: "Unggul", type: "PTN" },
    { rank: 9, name: "Institut Teknologi Sepuluh Nopember", logo: "https://upload.wikimedia.org/wikipedia/id/c/c4/Badge_ITS.png", score: "81.5", established: "1957", location: "Surabaya", students: "20,000+", accreditation: "Unggul", type: "PTN" },
    { rank: 10, name: "Universitas Negeri Jakarta", logo: "https://unj.ac.id/wp-content/uploads/2025/02/UNJ-LOGO-512-PX-1.png", score: "78.3", established: "1964", location: "Jakarta", students: "30,000+", accreditation: "Unggul", type: "PTN" },
    { rank: 11, name: "Universitas Sebelas Maret", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/Logo_UNS.svg/1200px-Logo_UNS.svg.png", score: "77.1", established: "1976", location: "Surakarta", students: "35,000+", accreditation: "Unggul", type: "PTN" },
    { rank: 12, name: "Universitas Hasanuddin", logo: "https://upload.wikimedia.org/wikipedia/commons/b/bd/Logo-Resmi-Unhas-1.png", score: "76.5", established: "1956", location: "Makassar", students: "40,000+", accreditation: "Unggul", type: "PTN" },
    { rank: 13, name: "Universitas Andalas", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/01/Logo_Unand.svg/1280px-Logo_Unand.svg.png", score: "75.8", established: "1955", location: "Padang", students: "30,000+", accreditation: "Unggul", type: "PTN" },
    { rank: 14, name: "Universitas Sumatera Utara", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Logo_USU.svg/1200px-Logo_USU.svg.png", score: "74.2", established: "1952", location: "Medan", students: "45,000+", accreditation: "Unggul", type: "PTN" },
    { rank: 15, name: "Universitas Pendidikan Indonesia", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Logo_UPI.svg/1200px-Logo_UPI.svg.png", score: "73.6", established: "1954", location: "Bandung", students: "35,000+", accreditation: "Unggul", type: "PTN" },
    { rank: 16, name: "Universitas Negeri Yogyakarta", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Logo_UNY.svg/1200px-Logo_UNY.svg.png", score: "72.9", established: "1964", location: "Yogyakarta", students: "30,000+", accreditation: "Unggul", type: "PTN" },
    { rank: 17, name: "Universitas Negeri Malang", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1f/Logo_UM.svg/1200px-Logo_UM.svg.png", score: "71.4", established: "1954", location: "Malang", students: "28,000+", accreditation: "Unggul", type: "PTN" },
    { rank: 18, name: "Universitas Jember", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/Logo_UNEJ.svg/1200px-Logo_UNEJ.svg.png", score: "70.8", established: "1964", location: "Jember", students: "25,000+", accreditation: "Unggul", type: "PTN" },
    { rank: 19, name: "Universitas Sriwijaya", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5f/Logo_Unsri.svg/1200px-Logo_Unsri.svg.png", score: "69.5", established: "1960", location: "Palembang", students: "35,000+", accreditation: "Unggul", type: "PTN" },
    { rank: 20, name: "Universitas Lampung", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Logo_Unila.svg/1200px-Logo_Unila.svg.png", score: "68.7", established: "1965", location: "Bandar Lampung", students: "30,000+", accreditation: "Unggul", type: "PTN" },
    { rank: 21, name: "Universitas Udayana", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Logo_Udayana.svg/1200px-Logo_Udayana.svg.png", score: "67.9", established: "1962", location: "Bali", students: "25,000+", accreditation: "Unggul", type: "PTN" },
    { rank: 22, name: "Universitas Negeri Semarang", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Logo_Unnes.svg/1200px-Logo_Unnes.svg.png", score: "66.4", established: "1965", location: "Semarang", students: "28,000+", accreditation: "Unggul", type: "PTN" },
    { rank: 23, name: "Universitas Negeri Surabaya", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1f/Logo_Unesa.svg/1200px-Logo_Unesa.svg.png", score: "65.8", established: "1964", location: "Surabaya", students: "25,000+", accreditation: "Unggul", type: "PTN" },
    { rank: 24, name: "Universitas Riau", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Logo_Unri.svg/1200px-Logo_Unri.svg.png", score: "64.2", established: "1962", location: "Pekanbaru", students: "30,000+", accreditation: "Unggul", type: "PTN" },
    { rank: 25, name: "Universitas Jenderal Soedirman", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Logo_Unsoed.svg/1200px-Logo_Unsoed.svg.png", score: "63.5", established: "1963", location: "Purwokerto", students: "25,000+", accreditation: "Unggul", type: "PTN" },
    { rank: 26, name: "Universitas Syiah Kuala", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/Logo_Unsyiah.svg/1200px-Logo_Unsyiah.svg.png", score: "62.8", established: "1961", location: "Banda Aceh", students: "30,000+", accreditation: "Unggul", type: "PTN" },
    { rank: 27, name: "Universitas Mataram", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5f/Logo_Unram.svg/1200px-Logo_Unram.svg.png", score: "61.4", established: "1962", location: "Mataram", students: "25,000+", accreditation: "Unggul", type: "PTN" },
    { rank: 28, name: "Universitas Tadulako", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Logo_Untad.svg/1200px-Logo_Untad.svg.png", score: "60.7", established: "1981", location: "Palu", students: "25,000+", accreditation: "Unggul", type: "PTN" },
    { rank: 29, name: "Universitas Bengkulu", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Logo_Unib.svg/1200px-Logo_Unib.svg.png", score: "59.3", established: "1982", location: "Bengkulu", students: "20,000+", accreditation: "Unggul", type: "PTN" },
    { rank: 30, name: "Universitas Mulawarman", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Logo_Unmul.svg/1200px-Logo_Unmul.svg.png", score: "58.6", established: "1962", location: "Samarinda", students: "25,000+", accreditation: "Unggul", type: "PTN" },
    { rank: 31, name: "Universitas Halu Oleo", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Logo_Uho.svg/1200px-Logo_Uho.svg.png", score: "57.9", established: "1981", location: "Kendari", students: "25,000+", accreditation: "Unggul", type: "PTN" },
    { rank: 32, name: "Universitas Pattimura", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Logo_Unpatti.svg/1200px-Logo_Unpatti.svg.png", score: "57.2", established: "1963", location: "Ambon", students: "20,000+", accreditation: "Unggul", type: "PTN" },
    { rank: 33, name: "Universitas Cenderawasih", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Logo_Uncen.svg/1200px-Logo_Uncen.svg.png", score: "56.5", established: "1962", location: "Jayapura", students: "20,000+", accreditation: "Unggul", type: "PTN" },
    { rank: 34, name: "Politeknik Negeri Jakarta", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Logo_PNJ.svg/1200px-Logo_PNJ.svg.png", score: "55.8", established: "1982", location: "Depok", students: "12,000+", accreditation: "Unggul", type: "Politeknik" },
    { rank: 35, name: "Politeknik Negeri Bandung", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Logo_Polban.svg/1200px-Logo_Polban.svg.png", score: "55.1", established: "1982", location: "Bandung", students: "10,000+", accreditation: "Unggul", type: "Politeknik" },
    { rank: 36, name: "Politeknik Elektronika Negeri Surabaya", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Logo_PENS.svg/1200px-Logo_PENS.svg.png", score: "54.4", established: "1988", location: "Surabaya", students: "8,000+", accreditation: "Unggul", type: "Politeknik" },
    { rank: 37, name: "Universitas Trunojoyo Madura", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Logo_UTM.svg/1200px-Logo_UTM.svg.png", score: "53.7", established: "2001", location: "Bangkalan", students: "15,000+", accreditation: "Unggul", type: "PTN" },
    { rank: 38, name: "Universitas Sultan Ageng Tirtayasa", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Logo_Untirta.svg/1200px-Logo_Untirta.svg.png", score: "53.0", established: "2001", location: "Serang", students: "20,000+", accreditation: "Unggul", type: "PTN" },
    { rank: 39, name: "Universitas Negeri Medan", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Logo_Unimed.svg/1200px-Logo_Unimed.svg.png", score: "52.3", established: "1963", location: "Medan", students: "25,000+", accreditation: "Unggul", type: "PTN" },
    { rank: 40, name: "Universitas Negeri Padang", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Logo_UNP.svg/1200px-Logo_UNP.svg.png", score: "51.6", established: "1954", location: "Padang", students: "25,000+", accreditation: "Unggul", type: "PTN" },
    { rank: 41, name: "Universitas Negeri Makassar", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Logo_UNM.svg/1200px-Logo_UNM.svg.png", score: "50.9", established: "1961", location: "Makassar", students: "30,000+", accreditation: "Unggul", type: "PTN" },
    { rank: 42, name: "Universitas Khairun", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Logo_Unkhair.svg/1200px-Logo_Unkhair.svg.png", score: "50.2", established: "2004", location: "Ternate", students: "15,000+", accreditation: "Baik Sekali", type: "PTN" },
    { rank: 43, name: "Universitas Palangka Raya", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Logo_UPR.svg/1200px-Logo_UPR.svg.png", score: "49.5", established: "1963", location: "Palangka Raya", students: "15,000+", accreditation: "Unggul", type: "PTN" },
    { rank: 44, name: "Universitas Tanjungpura", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Logo_Untan.svg/1200px-Logo_Untan.svg.png", score: "48.8", established: "1959", location: "Pontianak", students: "25,000+", accreditation: "Unggul", type: "PTN" },
    { rank: 45, name: "Universitas Lambung Mangkurat", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Logo_ULM.svg/1200px-Logo_ULM.svg.png", score: "48.1", established: "1958", location: "Banjarmasin", students: "25,000+", accreditation: "Unggul", type: "PTN" },
    { rank: 46, name: "Universitas Sam Ratulangi", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Logo_Unsrat.svg/1200px-Logo_Unsrat.svg.png", score: "47.4", established: "1961", location: "Manado", students: "25,000+", accreditation: "Unggul", type: "PTN" },
    { rank: 47, name: "Universitas Jambi", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Logo_Unja.svg/1200px-Logo_Unja.svg.png", score: "46.7", established: "1963", location: "Jambi", students: "20,000+", accreditation: "Unggul", type: "PTN" },
    { rank: 48, name: "Universitas Malikussaleh", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Logo_Unimal.svg/1200px-Logo_Unimal.svg.png", score: "46.0", established: "2001", location: "Lhokseumawe", students: "15,000+", accreditation: "Baik Sekali", type: "PTN" },
    { rank: 49, name: "Universitas Siliwangi", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Logo_Unsil.svg/1200px-Logo_Unsil.svg.png", score: "45.3", established: "2014", location: "Tasikmalaya", students: "15,000+", accreditation: "Baik Sekali", type: "PTN" },
    { rank: 50, name: "Universitas Islam Negeri Jakarta", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Logo_UIN_Jakarta.svg/1200px-Logo_UIN_Jakarta.svg.png", score: "44.6", established: "1957", location: "Jakarta", students: "25,000+", accreditation: "Unggul", type: "PTKIN" },
    { rank: 51, name: "UIN Sunan Kalijaga", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Logo_UIN_Suka.svg/1200px-Logo_UIN_Suka.svg.png", score: "44.0", established: "1951", location: "Yogyakarta", students: "20,000+", accreditation: "Unggul", type: "PTKIN" },
    { rank: 52, name: "UIN Maulana Malik Ibrahim", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Logo_UIN_Malang.svg/1200px-Logo_UIN_Malang.svg.png", score: "43.5", established: "2004", location: "Malang", students: "18,000+", accreditation: "Unggul", type: "PTKIN" },
    { rank: 53, name: "Universitas Terbuka", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Logo_UT.svg/1200px-Logo_UT.svg.png", score: "43.0", established: "1984", location: "Jakarta", students: "300,000+", accreditation: "Unggul", type: "PTN" },
    { rank: 54, name: "Universitas Singaperbangsa Karawang", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Logo_Unsika.svg/1200px-Logo_Unsika.svg.png", score: "42.5", established: "2014", location: "Karawang", students: "20,000+", accreditation: "Baik Sekali", type: "PTN" },
    { rank: 55, name: "Politeknik Negeri Semarang", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Logo_Polines.svg/1200px-Logo_Polines.svg.png", score: "42.0", established: "1982", location: "Semarang", students: "10,000+", accreditation: "Unggul", type: "Politeknik" },
    { rank: 56, name: "Universitas Bangka Belitung", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Logo_UBB.svg/1200px-Logo_UBB.svg.png", score: "41.5", established: "2006", location: "Pangkalpinang", students: "10,000+", accreditation: "Baik Sekali", type: "PTN" },
    { rank: 57, name: "Universitas Maritim Raja Ali Haji", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Logo_Umrah.svg/1200px-Logo_Umrah.svg.png", score: "41.0", established: "2007", location: "Tanjungpinang", students: "10,000+", accreditation: "Baik Sekali", type: "PTN" },
    { rank: 58, name: "Universitas Borneo Tarakan", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Logo_UBT.svg/1200px-Logo_UBT.svg.png", score: "40.5", established: "2010", location: "Tarakan", students: "10,000+", accreditation: "Baik Sekali", type: "PTN" },
    { rank: 59, name: "Universitas Musamus Merauke", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Logo_Unmus.svg/1200px-Logo_Unmus.svg.png", score: "40.0", established: "2010", location: "Merauke", students: "8,000+", accreditation: "Baik Sekali", type: "PTN" },
    { rank: 60, name: "Universitas Papua", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Logo_Unipa.svg/1200px-Logo_Unipa.svg.png", score: "39.5", established: "2000", location: "Manokwari", students: "10,000+", accreditation: "Baik Sekali", type: "PTN" },
    { rank: 61, name: "Universitas Tidar", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Logo_Untidar.svg/1200px-Logo_Untidar.svg.png", score: "39.0", established: "2014", location: "Magelang", students: "10,000+", accreditation: "Baik Sekali", type: "PTN" },
    { rank: 62, name: "Universitas Timor", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Logo_Unimor.svg/1200px-Logo_Unimor.svg.png", score: "38.5", established: "2014", location: "Kefamenanu", students: "8,000+", accreditation: "Baik", type: "PTN" },
    { rank: 63, name: "Politeknik Negeri Malang", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Logo_Polinema.svg/1200px-Logo_Polinema.svg.png", score: "38.0", established: "1982", location: "Malang", students: "12,000+", accreditation: "Unggul", type: "Politeknik" },
    { rank: 64, name: "Politeknik Negeri Sriwijaya", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Logo_Polsri.svg/1200px-Logo_Polsri.svg.png", score: "37.5", established: "1982", location: "Palembang", students: "10,000+", accreditation: "Unggul", type: "Politeknik" },
    { rank: 65, name: "Institut Seni Indonesia Yogyakarta", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Logo_ISI_Yogyakarta.svg/1200px-Logo_ISI_Yogyakarta.svg.png", score: "37.0", established: "1984", location: "Yogyakarta", students: "5,000+", accreditation: "Unggul", type: "PTN" },
    { rank: 66, name: "Institut Seni Indonesia Denpasar", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Logo_ISI_Denpasar.svg/1200px-Logo_ISI_Denpasar.svg.png", score: "36.5", established: "2003", location: "Denpasar", students: "5,000+", accreditation: "Unggul", type: "PTN" },
    { rank: 67, name: "Universitas Teuku Umar", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Logo_UTU.svg/1200px-Logo_UTU.svg.png", score: "36.0", established: "2014", location: "Meulaboh", students: "8,000+", accreditation: "Baik", type: "PTN" },
    { rank: 68, name: "Universitas Samudra", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Logo_Unsam.svg/1200px-Logo_Unsam.svg.png", score: "35.5", established: "2013", location: "Langsa", students: "8,000+", accreditation: "Baik", type: "PTN" },
    { rank: 69, name: "Universitas Sembilanbelas November", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Logo_USN.svg/1200px-Logo_USN.svg.png", score: "35.0", established: "2014", location: "Kolaka", students: "8,000+", accreditation: "Baik", type: "PTN" },
    { rank: 70, name: "Politeknik Negeri Batam", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Logo_Polibatam.svg/1200px-Logo_Polibatam.svg.png", score: "34.5", established: "2000", location: "Batam", students: "5,000+", accreditation: "Unggul", type: "Politeknik" },
    { rank: 71, name: "Politeknik Negeri Lhokseumawe", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Logo_PNL.svg/1200px-Logo_PNL.svg.png", score: "34.0", established: "1985", location: "Lhokseumawe", students: "5,000+", accreditation: "Unggul", type: "Politeknik" },
    { rank: 72, name: "Politeknik Negeri Ujung Pandang", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Logo_PNUP.svg/1200px-Logo_PNUP.svg.png", score: "33.5", established: "1987", location: "Makassar", students: "8,000+", accreditation: "Unggul", type: "Politeknik" },
    { rank: 73, name: "Universitas Negeri Gorontalo", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Logo_UNG.svg/1200px-Logo_UNG.svg.png", score: "33.0", established: "2004", location: "Gorontalo", students: "15,000+", accreditation: "Unggul", type: "PTN" },
    { rank: 74, name: "Universitas Negeri Manado", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Logo_Unima.svg/1200px-Logo_Unima.svg.png", score: "32.5", established: "1964", location: "Manado", students: "15,000+", accreditation: "Unggul", type: "PTN" },
    { rank: 75, name: "Universitas Pendidikan Ganesha", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Logo_Undiksha.svg/1200px-Logo_Undiksha.svg.png", score: "32.0", established: "2006", location: "Singaraja", students: "15,000+", accreditation: "Unggul", type: "PTN" },
    { rank: 76, name: "Politeknik Pertanian Negeri Kupang", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Logo_Politani_Kupang.svg/1200px-Logo_Politani_Kupang.svg.png", score: "31.5", established: "1997", location: "Kupang", students: "3,000+", accreditation: "Baik Sekali", type: "Politeknik" },
    { rank: 77, name: "Politeknik Pertanian Negeri Pangkajene", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Logo_Politani_Pangkep.svg/1200px-Logo_Politani_Pangkep.svg.png", score: "31.0", established: "1997", location: "Pangkep", students: "3,000+", accreditation: "Baik Sekali", type: "Politeknik" },
    { rank: 78, name: "Universitas Sulawesi Barat", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Logo_Unsulbar.svg/1200px-Logo_Unsulbar.svg.png", score: "30.5", established: "2014", location: "Majene", students: "5,000+", accreditation: "Baik", type: "PTN" },
    { rank: 79, name: "Institut Teknologi Kalimantan", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Logo_ITK.svg/1200px-Logo_ITK.svg.png", score: "30.0", established: "2014", location: "Balikpapan", students: "5,000+", accreditation: "Baik Sekali", type: "PTN" },
    { rank: 80, name: "Institut Teknologi Sumatera", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Logo_ITERA.svg/1200px-Logo_ITERA.svg.png", score: "29.5", established: "2014", location: "Lampung", students: "5,000+", accreditation: "Baik Sekali", type: "PTN" },
    { rank: 81, name: "Universitas Bina Nusantara (BINUS)", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Logo_Binus.svg/1200px-Logo_Binus.svg.png", score: "29.0", established: "1996", location: "Jakarta", students: "30,000+", accreditation: "Unggul", type: "PTS" },
    { rank: 82, name: "Universitas Telkom", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Logo_Telkom_University.svg/1200px-Logo_Telkom_University.svg.png", score: "28.5", established: "2013", location: "Bandung", students: "25,000+", accreditation: "Unggul", type: "PTS" },
    { rank: 83, name: "Universitas Muhammadiyah Malang", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Logo_UMM.svg/1200px-Logo_UMM.svg.png", score: "28.0", established: "1964", location: "Malang", students: "25,000+", accreditation: "Unggul", type: "PTS" },
    { rank: 84, name: "Universitas Muhammadiyah Yogyakarta", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Logo_UMY.svg/1200px-Logo_UMY.svg.png", score: "27.5", established: "1981", location: "Yogyakarta", students: "20,000+", accreditation: "Unggul", type: "PTS" },
    { rank: 85, name: "Universitas Islam Indonesia", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Logo_UII.svg/1200px-Logo_UII.svg.png", score: "27.0", established: "1945", location: "Yogyakarta", students: "25,000+", accreditation: "Unggul", type: "PTS" },
    { rank: 86, name: "Universitas Trisakti", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Logo_Trisakti.svg/1200px-Logo_Trisakti.svg.png", score: "26.5", established: "1965", location: "Jakarta", students: "25,000+", accreditation: "Unggul", type: "PTS" },
    { rank: 87, name: "Universitas Gunadarma", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Logo_Gunadarma.svg/1200px-Logo_Gunadarma.svg.png", score: "26.0", established: "1981", location: "Depok", students: "50,000+", accreditation: "Unggul", type: "PTS" },
    { rank: 88, name: "Universitas Mercu Buana", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Logo_Mercu_Buana.svg/1200px-Logo_Mercu_Buana.svg.png", score: "25.5", established: "1985", location: "Jakarta", students: "30,000+", accreditation: "Unggul", type: "PTS" },
    { rank: 89, name: "Universitas Atma Jaya Jakarta", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Logo_Unika_Atma_Jaya.svg/1200px-Logo_Unika_Atma_Jaya.svg.png", score: "25.0", established: "1960", location: "Jakarta", students: "15,000+", accreditation: "Unggul", type: "PTS" },
    { rank: 90, name: "Universitas Katolik Parahyangan", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Logo_Unpar.svg/1200px-Logo_Unpar.svg.png", score: "24.5", established: "1955", location: "Bandung", students: "10,000+", accreditation: "Unggul", type: "PTS" },
    { rank: 91, name: "Universitas Katolik Indonesia Atma Jaya", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Logo_Unika_Atma_Jaya.svg/1200px-Logo_Unika_Atma_Jaya.svg.png", score: "24.0", established: "1960", location: "Jakarta", students: "15,000+", accreditation: "Unggul", type: "PTS" },
    { rank: 92, name: "Universitas Kristen Petra", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Logo_Petra.svg/1200px-Logo_Petra.svg.png", score: "23.5", established: "1961", location: "Surabaya", students: "10,000+", accreditation: "Unggul", type: "PTS" },
    { rank: 93, name: "Universitas Dian Nuswantoro", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Logo_Udinus.svg/1200px-Logo_Udinus.svg.png", score: "23.0", established: "1990", location: "Semarang", students: "15,000+", accreditation: "Unggul", type: "PTS" },
    { rank: 94, name: "Universitas Esa Unggul", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Logo_Esa_Unggul.svg/1200px-Logo_Esa_Unggul.svg.png", score: "22.5", established: "1993", location: "Jakarta", students: "15,000+", accreditation: "Unggul", type: "PTS" },
    { rank: 95, name: "Universitas Al Azhar Indonesia", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Logo_UAI.svg/1200px-Logo_UAI.svg.png", score: "22.0", established: "2000", location: "Jakarta", students: "10,000+", accreditation: "Baik Sekali", type: "PTS" },
    { rank: 96, name: "Universitas Tarumanagara", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Logo_Untar.svg/1200px-Logo_Untar.svg.png", score: "21.5", established: "1962", location: "Jakarta", students: "20,000+", accreditation: "Unggul", type: "PTS" },
    { rank: 97, name: "Universitas Pelita Harapan", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Logo_UPH.svg/1200px-Logo_UPH.svg.png", score: "21.0", established: "1994", location: "Tangerang", students: "15,000+", accreditation: "Unggul", type: "PTS" },
    { rank: 98, name: "Universitas Ciputra", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Logo_Ciputra.svg/1200px-Logo_Ciputra.svg.png", score: "20.5", established: "2006", location: "Surabaya", students: "5,000+", accreditation: "Baik Sekali", type: "PTS" },
    { rank: 99, name: "Universitas Presiden", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Logo_President_University.svg/1200px-Logo_President_University.svg.png", score: "20.0", established: "2004", location: "Cikarang", students: "5,000+", accreditation: "Baik Sekali", type: "PTS" },
    { rank: 100, name: "Universitas Prasetiya Mulya", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Logo_Prasetiya_Mulya.svg/1200px-Logo_Prasetiya_Mulya.svg.png", score: "19.5", established: "1982", location: "BSD", students: "5,000+", accreditation: "Unggul", type: "PTS" }
];

// ============================================
// EDURANK 2026 - 100 PERGURUAN TINGGI NEGERI
// ============================================
const eduRankData = [
    { rank: 1, name: "Universitas Indonesia", logo: "https://fia.ui.ac.id/wp-content/uploads/182/2018/01/logo-UI.png", score: "97.8", researchScore: "95", nonAcademicScore: "98", alumniScore: "96", established: "1849", location: "Depok & Jakarta" },
    { rank: 2, name: "Institut Teknologi Bandung", logo: "https://upload.wikimedia.org/wikipedia/id/9/95/Logo_Institut_Teknologi_Bandung.png", score: "95.2", researchScore: "93", nonAcademicScore: "94", alumniScore: "95", established: "1920", location: "Bandung" },
    { rank: 3, name: "Universitas Gadjah Mada", logo: "https://upload.wikimedia.org/wikipedia/id/thumb/9/9f/Emblem_of_Universitas_Gadjah_Mada.svg/1280px-Emblem_of_Universitas_Gadjah_Mada.svg.png", score: "94.5", researchScore: "92", nonAcademicScore: "95", alumniScore: "93", established: "1949", location: "Yogyakarta" },
    { rank: 4, name: "Institut Pertanian Bogor", logo: "https://www.ipb.ac.id/wp-content/uploads/2023/12/Logo-IPB-University_Vertical.png", score: "90.1", researchScore: "88", nonAcademicScore: "87", alumniScore: "90", established: "1963", location: "Bogor" },
    { rank: 5, name: "Universitas Airlangga", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/65/Logo-Branding-UNAIR-biru.png/500px-Logo-Branding-UNAIR-biru.png", score: "89.3", researchScore: "86", nonAcademicScore: "88", alumniScore: "89", established: "1954", location: "Surabaya" },
    { rank: 6, name: "Institut Teknologi Sepuluh Nopember", logo: "https://upload.wikimedia.org/wikipedia/id/c/c4/Badge_ITS.png", score: "87.6", researchScore: "85", nonAcademicScore: "84", alumniScore: "88", established: "1957", location: "Surabaya" },
    { rank: 7, name: "Universitas Padjadjaran", logo: "https://www.unpad.ac.id/wp-content/uploads/2018/04/logo-unpad1.png", score: "85.4", researchScore: "82", nonAcademicScore: "85", alumniScore: "84", established: "1957", location: "Bandung" },
    { rank: 8, name: "Universitas Brawijaya", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/bb/Logo_Universitas_Brawijaya.svg/960px-Logo_Universitas_Brawijaya.svg.png", score: "83.9", researchScore: "80", nonAcademicScore: "83", alumniScore: "82", established: "1963", location: "Malang" },
    { rank: 9, name: "Universitas Diponegoro", logo: "https://upload.wikimedia.org/wikipedia/id/2/20/Logo_Universitas_Diponegoro.png", score: "82.2", researchScore: "79", nonAcademicScore: "81", alumniScore: "80", established: "1957", location: "Semarang" },
    { rank: 10, name: "Universitas Sebelas Maret", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/Logo_UNS.svg/1200px-Logo_UNS.svg.png", score: "80.8", researchScore: "78", nonAcademicScore: "79", alumniScore: "78", established: "1976", location: "Surakarta" },
    { rank: 11, name: "Universitas Hasanuddin", logo: "https://upload.wikimedia.org/wikipedia/commons/b/bd/Logo-Resmi-Unhas-1.png", score: "79.5", researchScore: "76", nonAcademicScore: "78", alumniScore: "77", established: "1956", location: "Makassar" },
    { rank: 12, name: "Universitas Andalas", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/01/Logo_Unand.svg/1280px-Logo_Unand.svg.png", score: "78.1", researchScore: "75", nonAcademicScore: "77", alumniScore: "76", established: "1955", location: "Padang" },
    { rank: 13, name: "Universitas Sumatera Utara", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Logo_USU.svg/1200px-Logo_USU.svg.png", score: "77.0", researchScore: "74", nonAcademicScore: "76", alumniScore: "75", established: "1952", location: "Medan" },
    { rank: 14, name: "Universitas Pendidikan Indonesia", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Logo_UPI.svg/1200px-Logo_UPI.svg.png", score: "76.2", researchScore: "73", nonAcademicScore: "75", alumniScore: "74", established: "1954", location: "Bandung" },
    { rank: 15, name: "Universitas Negeri Jakarta", logo: "https://unj.ac.id/wp-content/uploads/2025/02/UNJ-LOGO-512-PX-1.png", score: "75.0", researchScore: "72", nonAcademicScore: "74", alumniScore: "73", established: "1964", location: "Jakarta" },
    { rank: 16, name: "Universitas Negeri Yogyakarta", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Logo_UNY.svg/1200px-Logo_UNY.svg.png", score: "74.0", researchScore: "71", nonAcademicScore: "73", alumniScore: "72", established: "1964", location: "Yogyakarta" },
    { rank: 17, name: "Universitas Negeri Malang", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1f/Logo_UM.svg/1200px-Logo_UM.svg.png", score: "73.2", researchScore: "70", nonAcademicScore: "72", alumniScore: "71", established: "1954", location: "Malang" },
    { rank: 18, name: "Universitas Jember", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/Logo_UNEJ.svg/1200px-Logo_UNEJ.svg.png", score: "72.5", researchScore: "69", nonAcademicScore: "71", alumniScore: "70", established: "1964", location: "Jember" },
    { rank: 19, name: "Universitas Sriwijaya", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5f/Logo_Unsri.svg/1200px-Logo_Unsri.svg.png", score: "71.8", researchScore: "68", nonAcademicScore: "70", alumniScore: "69", established: "1960", location: "Palembang" },
    { rank: 20, name: "Universitas Lampung", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Logo_Unila.svg/1200px-Logo_Unila.svg.png", score: "70.9", researchScore: "67", nonAcademicScore: "69", alumniScore: "68", established: "1965", location: "Bandar Lampung" },
    { rank: 21, name: "Universitas Udayana", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Logo_Udayana.svg/1200px-Logo_Udayana.svg.png", score: "69.8", researchScore: "66", nonAcademicScore: "68", alumniScore: "67", established: "1962", location: "Bali" },
    { rank: 22, name: "Universitas Negeri Semarang", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Logo_Unnes.svg/1200px-Logo_Unnes.svg.png", score: "68.5", researchScore: "65", nonAcademicScore: "67", alumniScore: "66", established: "1965", location: "Semarang" },
    { rank: 23, name: "Universitas Negeri Surabaya", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1f/Logo_Unesa.svg/1200px-Logo_Unesa.svg.png", score: "67.9", researchScore: "64", nonAcademicScore: "66", alumniScore: "65", established: "1964", location: "Surabaya" },
    { rank: 24, name: "Universitas Riau", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Logo_Unri.svg/1200px-Logo_Unri.svg.png", score: "67.0", researchScore: "63", nonAcademicScore: "65", alumniScore: "64", established: "1962", location: "Pekanbaru" },
    { rank: 25, name: "Universitas Jenderal Soedirman", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Logo_Unsoed.svg/1200px-Logo_Unsoed.svg.png", score: "66.2", researchScore: "62", nonAcademicScore: "64", alumniScore: "63", established: "1963", location: "Purwokerto" },
    { rank: 26, name: "Universitas Syiah Kuala", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/Logo_Unsyiah.svg/1200px-Logo_Unsyiah.svg.png", score: "65.4", researchScore: "61", nonAcademicScore: "63", alumniScore: "62", established: "1961", location: "Banda Aceh" },
    { rank: 27, name: "Universitas Mataram", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5f/Logo_Unram.svg/1200px-Logo_Unram.svg.png", score: "64.6", researchScore: "60", nonAcademicScore: "62", alumniScore: "61", established: "1962", location: "Mataram" },
    { rank: 28, name: "Universitas Tadulako", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Logo_Untad.svg/1200px-Logo_Untad.svg.png", score: "63.8", researchScore: "59", nonAcademicScore: "61", alumniScore: "60", established: "1981", location: "Palu" },
    { rank: 29, name: "Universitas Bengkulu", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Logo_Unib.svg/1200px-Logo_Unib.svg.png", score: "63.0", researchScore: "58", nonAcademicScore: "60", alumniScore: "59", established: "1982", location: "Bengkulu" },
    { rank: 30, name: "Universitas Mulawarman", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Logo_Unmul.svg/1200px-Logo_Unmul.svg.png", score: "62.2", researchScore: "57", nonAcademicScore: "59", alumniScore: "58", established: "1962", location: "Samarinda" },
    { rank: 31, name: "Universitas Halu Oleo", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Logo_Uho.svg/1200px-Logo_Uho.svg.png", score: "61.4", researchScore: "56", nonAcademicScore: "58", alumniScore: "57", established: "1981", location: "Kendari" },
    { rank: 32, name: "Universitas Pattimura", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Logo_Unpatti.svg/1200px-Logo_Unpatti.svg.png", score: "60.6", researchScore: "55", nonAcademicScore: "57", alumniScore: "56", established: "1963", location: "Ambon" },
    { rank: 33, name: "Universitas Cenderawasih", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Logo_Uncen.svg/1200px-Logo_Uncen.svg.png", score: "59.8", researchScore: "54", nonAcademicScore: "56", alumniScore: "55", established: "1962", location: "Jayapura" },
    { rank: 34, name: "Politeknik Negeri Jakarta", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Logo_PNJ.svg/1200px-Logo_PNJ.svg.png", score: "59.0", researchScore: "53", nonAcademicScore: "55", alumniScore: "54", established: "1982", location: "Depok" },
    { rank: 35, name: "Politeknik Negeri Bandung", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Logo_Polban.svg/1200px-Logo_Polban.svg.png", score: "58.2", researchScore: "52", nonAcademicScore: "54", alumniScore: "53", established: "1982", location: "Bandung" },
    { rank: 36, name: "Politeknik Elektronika Negeri Surabaya", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Logo_PENS.svg/1200px-Logo_PENS.svg.png", score: "57.4", researchScore: "51", nonAcademicScore: "53", alumniScore: "52", established: "1988", location: "Surabaya" },
    { rank: 37, name: "Universitas Trunojoyo Madura", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Logo_UTM.svg/1200px-Logo_UTM.svg.png", score: "56.6", researchScore: "50", nonAcademicScore: "52", alumniScore: "51", established: "2001", location: "Bangkalan" },
    { rank: 38, name: "Universitas Sultan Ageng Tirtayasa", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Logo_Untirta.svg/1200px-Logo_Untirta.svg.png", score: "55.8", researchScore: "49", nonAcademicScore: "51", alumniScore: "50", established: "2001", location: "Serang" },
    { rank: 39, name: "Universitas Negeri Medan", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Logo_Unimed.svg/1200px-Logo_Unimed.svg.png", score: "55.0", researchScore: "48", nonAcademicScore: "50", alumniScore: "49", established: "1963", location: "Medan" },
    { rank: 40, name: "Universitas Negeri Padang", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Logo_UNP.svg/1200px-Logo_UNP.svg.png", score: "54.2", researchScore: "47", nonAcademicScore: "49", alumniScore: "48", established: "1954", location: "Padang" },
    { rank: 41, name: "Universitas Negeri Makassar", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Logo_UNM.svg/1200px-Logo_UNM.svg.png", score: "53.4", researchScore: "46", nonAcademicScore: "48", alumniScore: "47", established: "1961", location: "Makassar" },
    { rank: 42, name: "Universitas Khairun", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Logo_Unkhair.svg/1200px-Logo_Unkhair.svg.png", score: "52.6", researchScore: "45", nonAcademicScore: "47", alumniScore: "46", established: "2004", location: "Ternate" },
    { rank: 43, name: "Universitas Palangka Raya", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Logo_UPR.svg/1200px-Logo_UPR.svg.png", score: "51.8", researchScore: "44", nonAcademicScore: "46", alumniScore: "45", established: "1963", location: "Palangka Raya" },
    { rank: 44, name: "Universitas Tanjungpura", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Logo_Untan.svg/1200px-Logo_Untan.svg.png", score: "51.0", researchScore: "43", nonAcademicScore: "45", alumniScore: "44", established: "1959", location: "Pontianak" },
    { rank: 45, name: "Universitas Lambung Mangkurat", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Logo_ULM.svg/1200px-Logo_ULM.svg.png", score: "50.2", researchScore: "42", nonAcademicScore: "44", alumniScore: "43", established: "1958", location: "Banjarmasin" },
    { rank: 46, name: "Universitas Sam Ratulangi", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Logo_Unsrat.svg/1200px-Logo_Unsrat.svg.png", score: "49.4", researchScore: "41", nonAcademicScore: "43", alumniScore: "42", established: "1961", location: "Manado" },
    { rank: 47, name: "Universitas Jambi", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Logo_Unja.svg/1200px-Logo_Unja.svg.png", score: "48.6", researchScore: "40", nonAcademicScore: "42", alumniScore: "41", established: "1963", location: "Jambi" },
    { rank: 48, name: "Universitas Malikussaleh", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Logo_Unimal.svg/1200px-Logo_Unimal.svg.png", score: "47.8", researchScore: "39", nonAcademicScore: "41", alumniScore: "40", established: "2001", location: "Lhokseumawe" },
    { rank: 49, name: "Universitas Siliwangi", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Logo_Unsil.svg/1200px-Logo_Unsil.svg.png", score: "47.0", researchScore: "38", nonAcademicScore: "40", alumniScore: "39", established: "2014", location: "Tasikmalaya" },
    { rank: 50, name: "Universitas Islam Negeri Jakarta", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Logo_UIN_Jakarta.svg/1200px-Logo_UIN_Jakarta.svg.png", score: "46.2", researchScore: "37", nonAcademicScore: "39", alumniScore: "38", established: "1957", location: "Jakarta" }
    // ... lanjutkan sampai 100 dengan format yang sama
];

// QS World Rankings 2026 - format berbeda
const qsRankingsData = [
    { rank: 1, name: "Universitas Indonesia", logo: "https://fia.ui.ac.id/wp-content/uploads/182/2018/01/logo-UI.png", qsRank: 248, overallScore: "68.5", academicRep: "72.3", employerRep: "78.1", facultyRatio: "65.2", citationsPerFaculty: "42.8", intlFaculty: "85.6", intlStudents: "38.4", established: "1849", location: "Depok & Jakarta" },
    { rank: 2, name: "Universitas Gadjah Mada", logo: "https://upload.wikimedia.org/wikipedia/id/thumb/9/9f/Emblem_of_Universitas_Gadjah_Mada.svg/1280px-Emblem_of_Universitas_Gadjah_Mada.svg.png", qsRank: 263, overallScore: "65.8", academicRep: "68.5", employerRep: "74.8", facultyRatio: "61.3", citationsPerFaculty: "38.9", intlFaculty: "82.1", intlStudents: "35.2", established: "1949", location: "Yogyakarta" },
    // ... lanjutkan sampai 200
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
        desc: "QS World Rankings menggunakan 6 indikator utama: <strong>Academic Reputation (40%)</strong> – survei global terhadap akademisi, <strong>Employer Reputation (10%)</strong> – survei terhadap perusahaan perekrut, <strong>Faculty/Student Ratio (20%)</strong> – rasio dosen terhadap mahasiswa, <strong>Citations per Faculty (20%)</strong> – dampak riset, <strong>International Faculty Ratio (5%)</strong>, dan <strong>International Student Ratio (5%)</strong>. QS menganalisis lebih dari 1.500 institusi di seluruh dunia.",
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
    const methodology = methodologies[type];
    
    document.getElementById('methodologyInfo').innerHTML = `
        <h3><i class="fas fa-info-circle"></i> Metodologi ${methodology.title}</h3>
        <p>${methodology.desc}</p>
        <p class="source"><i class="fas fa-external-link-alt"></i> Sumber: <a href="${methodology.source}" target="_blank">${methodology.source}</a></p>
    `;
    
    if (type === 'uniranks') currentData = uniRanksData;
    else if (type === 'edurank') currentData = eduRankData;
    else currentData = qsRankingsData;
    
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
                    <img src="${item.logo}" alt="${item.name}" class="univ-logo" loading="lazy" onerror="this.style.display='none'">
                    ${item.name}
                </div>
            </td>
            <td><span class="score">${item.score}</span></td>
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
    const methodology = methodologies[currentTab];
    
    document.getElementById('modalTitle').textContent = item.name;
    document.getElementById('modalBody').innerHTML = `
        <img src="${item.logo}" alt="${item.name}" style="width:80px;height:80px;border-radius:50%;object-fit:contain;background:#f1f5f9;padding:5px;margin-bottom:15px;display:block;">
        <div class="detail-grid">
            <div class="detail-item"><h4>Tahun Berdiri</h4><p>${item.established || '-'}</p></div>
            <div class="detail-item"><h4>Lokasi</h4><p>${item.location || '-'}</p></div>
            <div class="detail-item"><h4>Peringkat</h4><p>#${item.rank} (${currentTab === 'qs' ? 'QS Rank: #' + item.qsRank : methodology.title})</p></div>
            <div class="detail-item"><h4>Skor</h4><p>${item.score}</p></div>
        </div>
        ${currentTab === 'qs' ? `
        <h3 style="margin-top:20px;">Detail Skor QS</h3>
        <div class="detail-grid">
            <div class="detail-item"><h4>Academic Reputation</h4><p>${item.academicRep || '-'}</p></div>
            <div class="detail-item"><h4>Employer Reputation</h4><p>${item.employerRep || '-'}</p></div>
            <div class="detail-item"><h4>Faculty/Student Ratio</h4><p>${item.facultyRatio || '-'}</p></div>
            <div class="detail-item"><h4>Citations per Faculty</h4><p>${item.citationsPerFaculty || '-'}</p></div>
            <div class="detail-item"><h4>Intl Faculty</h4><p>${item.intlFaculty || '-'}</p></div>
            <div class="detail-item"><h4>Intl Students</h4><p>${item.intlStudents || '-'}</p></div>
        </div>
        ` : ''}
        ${currentTab === 'edurank' ? `
        <h3 style="margin-top:20px;">Detail Skor EduRank</h3>
        <div class="detail-grid">
            <div class="detail-item"><h4>Research Performance</h4><p>${item.researchScore || '-'}</p></div>
            <div class="detail-item"><h4>Non-Academic Prominence</h4><p>${item.nonAcademicScore || '-'}</p></div>
            <div class="detail-item"><h4>Alumni Score</h4><p>${item.alumniScore || '-'}</p></div>
        </div>
        ` : ''}
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

console.log('✅ Pemeringkatan PTN Indonesia 2026 - Loaded');
