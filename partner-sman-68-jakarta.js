/* ============================================
   PARTNER SMAN 68 JAKARTA — MAIN SCRIPT
   ============================================ */

(function () {
    'use strict';

    // ─── Firebase Init ──────────────────────
    let db;
    try {
        if (!window.__FIREBASE_CONFIG__) {
            throw new Error('Firebase config tidak ditemukan. Pastikan firebase-config.js tersedia.');
        }
        if (!firebase.apps.length) {
            firebase.initializeApp(window.__FIREBASE_CONFIG__);
        }
        db = firebase.firestore();
    } catch (e) {
        console.warn('[SMAN68] Firebase init error:', e.message);
        showError('Gagal menghubungkan ke database. Periksa koneksi internet Anda.');
    }

    // ─── State ──────────────────────────────
    const state = {
        partners: [],
        filtered: [],
        activeCategory: 'all',
        searchQuery: '',
    };

    // ─── DOM Refs ───────────────────────────
    const $ = id => document.getElementById(id);
    const el = {
        grid:         $('partnersGrid'),
        loading:      $('loadingState'),
        empty:        $('emptyState'),
        filterPills:  $('filterPills'),
        searchInput:  $('searchInput'),
        totalPartners:$('totalPartners'),
        totalCats:    $('totalCategories'),
        footerYear:   $('footerYear'),
        navbar:       $('navbar'),
        modalOverlay: $('modalOverlay'),
        modalCard:    $('modalCard'),
        modalClose:   $('modalClose'),
        modalLogo:    $('modalLogo'),
        modalName:    $('modalName'),
        modalDesc:    $('modalDesc'),
        modalLink:    $('modalLink'),
        modalCategory:$('modalCategory'),
        cursorDot:    $('cursorDot'),
        cursorRing:   $('cursorRing'),
    };

    // ─── Footer Year ────────────────────────
    if (el.footerYear) el.footerYear.textContent = new Date().getFullYear();

    // ─── Navbar scroll ──────────────────────
    window.addEventListener('scroll', () => {
        el.navbar.classList.toggle('scrolled', window.scrollY > 40);
    }, { passive: true });

    // ─── Custom Cursor ───────────────────────
    let cursorX = 0, cursorY = 0, ringX = 0, ringY = 0;
    const isMobile = () => window.innerWidth <= 768;

    if (!isMobile()) {
        document.addEventListener('mousemove', e => {
            cursorX = e.clientX;
            cursorY = e.clientY;
            el.cursorDot.style.left = cursorX + 'px';
            el.cursorDot.style.top  = cursorY + 'px';
        });

        (function animRing() {
            ringX += (cursorX - ringX) * 0.12;
            ringY += (cursorY - ringY) * 0.12;
            el.cursorRing.style.left = ringX + 'px';
            el.cursorRing.style.top  = ringY + 'px';
            requestAnimationFrame(animRing);
        })();

        document.addEventListener('mouseover', e => {
            if (e.target.closest('a, button, .partner-card, .pill, .nav-btn, .card-detail-btn')) {
                el.cursorRing.classList.add('hovering');
            }
        });
        document.addEventListener('mouseout', e => {
            if (e.target.closest('a, button, .partner-card, .pill, .nav-btn, .card-detail-btn')) {
                el.cursorRing.classList.remove('hovering');
            }
        });
    }

    // ─── Scroll Reveal ──────────────────────
    const revealObs = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                revealObs.unobserve(entry.target);
            }
        });
    }, { threshold: 0.12 });

    function observeReveal() {
        document.querySelectorAll('.reveal').forEach(el => revealObs.observe(el));
    }

    // ─── Counter Animation ──────────────────
    function animateCount(el, target, duration = 1200) {
        let start = 0;
        const step = timestamp => {
            if (!start) start = timestamp;
            const progress = Math.min((timestamp - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            el.textContent = Math.floor(eased * target);
            if (progress < 1) requestAnimationFrame(step);
            else el.textContent = target;
        };
        requestAnimationFrame(step);
    }

    // ─── Firebase — Load Partners ────────────
    async function loadPartners() {
        if (!db) {
            hideLoading();
            showEmptyState();
            return;
        }
        try {
            const snap = await db
                .collection('partners_sman68')
                .orderBy('createdAt', 'desc')
                .get();

            state.partners = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            hideLoading();
            buildUI();
        } catch (err) {
            console.error('[SMAN68] Firestore error:', err);
            hideLoading();
            showError('Gagal memuat data mitra.');
        }
    }

    // ─── Build UI ────────────────────────────
    function buildUI() {
        if (!state.partners.length) {
            showEmptyState();
            return;
        }

        // Stats
        const categories = [...new Set(state.partners.map(p => p.category).filter(Boolean))];
        animateCount(el.totalPartners, state.partners.length);
        animateCount(el.totalCats, categories.length);

        // Filter Pills
        buildFilterPills(categories);

        // Render cards
        applyFilter();
    }

    function buildFilterPills(categories) {
        // Clear existing dynamic pills
        const existing = el.filterPills.querySelectorAll('.pill:not([data-filter="all"])');
        existing.forEach(p => p.remove());

        categories.forEach(cat => {
            const btn = document.createElement('button');
            btn.className = 'pill';
            btn.dataset.filter = cat;
            btn.textContent = cat;
            btn.addEventListener('click', () => setFilter(cat));
            el.filterPills.appendChild(btn);
        });
    }

    function setFilter(category) {
        state.activeCategory = category;
        el.filterPills.querySelectorAll('.pill').forEach(p => {
            p.classList.toggle('pill-active', p.dataset.filter === category);
        });
        applyFilter();
    }

    function applyFilter() {
        const q = state.searchQuery.toLowerCase().trim();
        const cat = state.activeCategory;

        state.filtered = state.partners.filter(p => {
            const matchCat = cat === 'all' || p.category === cat;
            const matchQ   = !q ||
                (p.name || '').toLowerCase().includes(q) ||
                (p.description || '').toLowerCase().includes(q) ||
                (p.category || '').toLowerCase().includes(q);
            return matchCat && matchQ;
        });

        renderCards();
    }

    function renderCards() {
        el.grid.innerHTML = '';

        if (!state.filtered.length) {
            el.grid.innerHTML = `
                <div style="grid-column:1/-1; text-align:center; padding:80px 24px; color:rgba(255,255,255,0.35);">
                    <p style="font-size:15px;">Tidak ada mitra yang cocok dengan pencarian Anda.</p>
                </div>`;
            return;
        }

        state.filtered.forEach((partner, i) => {
            const card = createCard(partner, i);
            el.grid.appendChild(card);
        });

        observeReveal();
    }

    function createCard(partner, index) {
        const card = document.createElement('div');
        card.className = 'partner-card reveal';
        card.style.animationDelay = `${index * 0.07}s`;

        const logoHtml = partner.logoUrl
            ? `<img class="card-logo" src="${escHtml(partner.logoUrl)}" alt="${escHtml(partner.name)}" loading="lazy" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">
               <div class="card-logo-fallback" style="display:none;">${escHtml((partner.name || '?')[0].toUpperCase())}</div>`
            : `<div class="card-logo-fallback">${escHtml((partner.name || '?')[0].toUpperCase())}</div>`;

        const hasLink = partner.website && partner.website.trim();

        card.innerHTML = `
            <div class="card-header">
                <div class="card-logo-wrap">${logoHtml}</div>
                <div class="card-meta">
                    ${partner.category ? `<div class="card-category">${escHtml(partner.category)}</div>` : ''}
                    <div class="card-name">${escHtml(partner.name || 'Nama Mitra')}</div>
                </div>
                <div class="card-arrow">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M7 17L17 7M17 7H7M17 7v10"/>
                    </svg>
                </div>
            </div>
            <div class="card-body">
                <p class="card-desc">${escHtml(partner.description || 'Tidak ada deskripsi tersedia.')}</p>
                <div class="card-footer">
                    ${hasLink
                        ? `<a class="card-link" href="${escHtml(partner.website)}" target="_blank" rel="noopener">
                               Kunjungi
                               <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                                   <path d="M7 17L17 7M17 7H7M17 7v10"/>
                               </svg>
                           </a>`
                        : '<span></span>'}
                    <button class="card-detail-btn">Detail</button>
                </div>
            </div>`;

        card.querySelector('.card-detail-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            openModal(partner);
        });
        card.addEventListener('click', () => openModal(partner));

        return card;
    }

    // ─── Modal ───────────────────────────────
    function openModal(partner) {
        el.modalLogo.src      = partner.logoUrl || '';
        el.modalLogo.alt      = partner.name    || '';
        el.modalName.textContent     = partner.name        || 'Nama Mitra';
        el.modalDesc.textContent     = partner.description || 'Tidak ada deskripsi.';
        el.modalCategory.textContent = partner.category    || '';

        if (partner.website && partner.website.trim()) {
            el.modalLink.href = partner.website;
            el.modalLink.classList.remove('hidden');
        } else {
            el.modalLink.classList.add('hidden');
        }

        el.modalOverlay.classList.add('open');
        document.body.style.overflow = 'hidden';
    }

    function closeModal() {
        el.modalOverlay.classList.remove('open');
        document.body.style.overflow = '';
    }

    el.modalClose.addEventListener('click', closeModal);
    el.modalOverlay.addEventListener('click', e => {
        if (e.target === el.modalOverlay) closeModal();
    });
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape') closeModal();
    });

    // ─── Search ──────────────────────────────
    el.searchInput.addEventListener('input', () => {
        state.searchQuery = el.searchInput.value;
        applyFilter();
    });

    // ─── Filter Pills (all button) ───────────
    el.filterPills.querySelector('[data-filter="all"]').addEventListener('click', () => setFilter('all'));

    // ─── Helpers ─────────────────────────────
    function hideLoading() {
        el.loading.style.display = 'none';
    }

    function showEmptyState() {
        el.empty.style.display = 'block';
    }

    function showError(msg) {
        el.loading.innerHTML = `
            <div style="color:rgba(255,80,80,0.8); font-size:15px; padding: 80px 24px; text-align:center;">
                <p style="margin-bottom:8px;">⚠️ ${msg}</p>
                <button onclick="location.reload()" style="margin-top:16px;padding:10px 24px;border-radius:100px;border:1px solid rgba(255,80,80,0.3);background:transparent;color:rgba(255,80,80,0.7);font-size:13px;cursor:pointer;">
                    Coba Lagi
                </button>
            </div>`;
        el.loading.style.display = 'block';
    }

    function escHtml(str) {
        if (!str) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    // ─── Boot ────────────────────────────────
    loadPartners();

})();
