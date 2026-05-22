/**
 * Vercel Serverless Function
 * Route : POST /api/cek-hasil
 * Target: https://pengumuman-snbp.snpmb.id/
 *
 * Input  : { nomor_pendaftaran: "9-10 digit", tanggal_lahir: "YYYY-MM-DD" }
 * Output : { status, nama, prodi, universitas, pilihan } | { error }
 */

const axios   = require('axios');
const cheerio = require('cheerio');

const SNBP_URL = 'https://pengumuman-snbp.snpmb.id/';
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

// ─── Validasi ─────────────────────────────────────────────────────────────────
function validate(nomor, tgl) {
  if (!nomor || !/^\d{9,12}$/.test(nomor))
    return 'Nomor pendaftaran tidak valid (9–12 digit angka).';
  if (!tgl || !/^\d{4}-\d{2}-\d{2}$/.test(tgl))
    return 'Format tanggal lahir tidak valid (YYYY-MM-DD).';
  return null;
}

// ─── Parser HTML SNBP ─────────────────────────────────────────────────────────
/**
 * Berdasarkan info publik, tampilan SNBP 2026:
 *   - Header BIRU  → LULUS  → teks "Selamat! Anda Dinyatakan Lulus Seleksi SNBP"
 *   - Header MERAH → TIDAK LULUS → teks "Anda dinyatakan tidak lulus"
 *
 * Sesuaikan selector di bawah setelah melihat HTML asli portal SNBP.
 * Cara debug: F12 → Elements saat cek manual di browser.
 */
function parseHasil(html) {
  const $ = cheerio.load(html);
  const up = html.toUpperCase();

  // Deteksi status dari teks konten
  const lulus = up.includes('DINYATAKAN LULUS') && !up.includes('TIDAK LULUS');

  // Selector umum — sesuaikan dengan struktur HTML asli SNBP
  const nama       = $('.nama-peserta, #nama, .student-name, h2.nama').first().text().trim()
                  || $('td:contains("Nama")').next('td').text().trim();
  const prodi      = $('.program-studi, .prodi, #prodi, .study-program').first().text().trim()
                  || $('td:contains("Program Studi")').next('td').text().trim();
  const universitas = $('.universitas, .ptn, #ptn, .university-name').first().text().trim()
                  || $('td:contains("Perguruan Tinggi")').next('td').text().trim();
  const pilihan    = $('.pilihan, #pilihan').first().text().trim()
                  || $('td:contains("Pilihan")').next('td').text().trim();

  return {
    status     : lulus ? 'LULUS' : 'TIDAK_LULUS',
    nama       : nama        || null,
    prodi      : prodi       || null,
    universitas: universitas || null,
    pilihan    : pilihan     || null,
  };
}

// ─── Rate limit in-memory ─────────────────────────────────────────────────────
const ipLog = {};
function isRateLimited(ip) {
  const now  = Date.now();
  const hits = (ipLog[ip] || []).filter(t => now - t < 60000);
  ipLog[ip]  = [...hits, now];
  return hits.length >= 10;
}

// ─── Handler ──────────────────────────────────────────────────────────────────
module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', process.env.ALLOWED_ORIGIN || '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST')   return res.status(405).json({ error: 'Method not allowed.' });

  const ip = req.headers['x-forwarded-for'] || 'unknown';
  if (isRateLimited(ip))
    return res.status(429).json({ error: 'Terlalu banyak permintaan. Tunggu 1 menit lalu coba lagi.' });

  const { nomor_pendaftaran, tanggal_lahir } = req.body;
  const validErr = validate(nomor_pendaftaran, tanggal_lahir);
  if (validErr) return res.status(400).json({ error: validErr });

  // Format tanggal YYYY-MM-DD → DD/MM/YYYY
  const [tahun, bulan, hari] = tanggal_lahir.split('-');
  const tglFormatted = `${hari}/${bulan}/${tahun}`;

  try {
    // Step 1: ambil halaman awal → cookies + CSRF token
    const init = await axios.get(SNBP_URL, {
      headers: { 'User-Agent': UA, 'Accept': 'text/html' },
      timeout: 15000,
    });

    const cookies   = (init.headers['set-cookie'] || []).map(c => c.split(';')[0]).join('; ');
    const $init     = cheerio.load(init.data);
    const csrfToken = $init('input[name="_token"], input[name="csrf_token"]').val() || '';

    // Step 2: submit form cek hasil
    const form = new URLSearchParams();
    form.append('nomor_pendaftaran', nomor_pendaftaran); // sesuaikan nama field jika perlu
    form.append('tanggal_lahir', tglFormatted);
    if (csrfToken) form.append('_token', csrfToken);

    const hasil = await axios.post(SNBP_URL, form.toString(), {
      headers: {
        'User-Agent'  : UA,
        'Content-Type': 'application/x-www-form-urlencoded',
        'Referer'     : SNBP_URL,
        'Cookie'      : cookies,
        'Origin'      : 'https://pengumuman-snbp.snpmb.id',
      },
      timeout     : 20000,
      maxRedirects: 5,
    });

    return res.status(200).json(parseHasil(hasil.data));

  } catch (err) {
    console.error('[SNBP proxy error]', err.message);
    if (err.response?.status === 429)
      return res.status(429).json({ error: 'Server SNPMB sedang padat. Coba lagi dalam beberapa menit.' });
    if (err.code === 'ECONNABORTED')
      return res.status(504).json({ error: 'Koneksi ke server SNPMB timeout.' });
    return res.status(502).json({ error: 'Gagal menghubungi server SNPMB. Pastikan portal pengumuman sudah aktif.' });
  }
};
