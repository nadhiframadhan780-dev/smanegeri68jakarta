/* ═══════════════════════════════════════════════════════════════════════ */
/* SPLASH SCREEN SMAN 68 JAKARTA - PREMIUM JS v2.0                       */
/* ═══════════════════════════════════════════════════════════════════════ */

'use strict';

// ============================================================
// CONFIGURATION
// ============================================================
const CONFIG = {
    countdownDuration: 3, // detik
    redirectUrl: './sman68.html',
    particleCount: 50,
    bubbleCount: 15,
    progressInterval: 30, // ms per update
};

// ============================================================
// STATE
// ============================================================
const state = {
    progress: 0,
    countdown: CONFIG.countdownDuration,
    isRedirecting: false,
    intervalId: null,
};

// ============================================================
// PARTICLES GENERATOR
// ============================================================
function createParticles() {
    const container = document.getElementById('particlesContainer');
    if (!container) return;

    const types = ['dot', 'glow', 'gold'];
    const fragment = document.createDocumentFragment();

    for (let i = 0; i < CONFIG.particleCount; i++) {
        const particle = document.createElement('div');
        const type = types[Math.floor(Math.random() * types.length)];
        
        particle.className = `particle ${type}`;
        particle.style.left = `${Math.random() * 100}%`;
        particle.style.animationDuration = `${8 + Math.random() * 15}s`;
        particle.style.animationDelay = `${Math.random() * 10}s`;
        particle.style.width = type === 'dot' ? `${2 + Math.random() * 3}px` : `${1 + Math.random() * 2}px`;
        particle.style.height = particle.style.width;

        fragment.appendChild(particle);
    }

    container.appendChild(fragment);
}

// ============================================================
// BUBBLES GENERATOR
// ============================================================
function createBubbles() {
    const container = document.getElementById('bubblesContainer');
    if (!container) return;

    const fragment = document.createDocumentFragment();

    for (let i = 0; i < CONFIG.bubbleCount; i++) {
        const bubble = document.createElement('div');
        const size = 20 + Math.random() * 80;
        
        bubble.className = 'bubble';
        bubble.style.width = `${size}px`;
        bubble.style.height = `${size}px`;
        bubble.style.left = `${Math.random() * 100}%`;
        bubble.style.animationDuration = `${12 + Math.random() * 20}s`;
        bubble.style.animationDelay = `${Math.random() * 15}s`;

        fragment.appendChild(bubble);
    }

    container.appendChild(fragment);
}

// ============================================================
// PROGRESS BAR
// ============================================================
function startProgressBar() {
    const progressFill = document.getElementById('progressBarFill');
    const progressText = document.getElementById('progressText');
    if (!progressFill || !progressText) return;

    const totalSteps = (CONFIG.countdownDuration * 1000) / CONFIG.progressInterval;
    let currentStep = 0;

    state.intervalId = setInterval(() => {
        currentStep++;
        state.progress = Math.min((currentStep / totalSteps) * 100, 100);
        
        progressFill.style.width = `${state.progress}%`;

        // Update progress text
        if (state.progress < 30) {
            progressText.textContent = 'Mempersiapkan portal...';
        } else if (state.progress < 60) {
            progressText.textContent = 'Memuat konten...';
        } else if (state.progress < 90) {
            progressText.textContent = 'Hampir siap...';
        } else {
            progressText.textContent = 'Portal siap! ✨';
        }

        if (state.progress >= 100) {
            clearInterval(state.intervalId);
        }
    }, CONFIG.progressInterval);
}

// ============================================================
// COUNTDOWN & REDIRECT
// ============================================================
function startCountdown() {
    let secondsLeft = CONFIG.countdownDuration;

    const countdownInterval = setInterval(() => {
        secondsLeft--;
        state.countdown = secondsLeft;

        if (secondsLeft <= 0) {
            clearInterval(countdownInterval);
            redirectToMain();
        }
    }, 1000);
}

// ============================================================
// REDIRECT WITH TRANSITION
// ============================================================
function redirectToMain() {
    if (state.isRedirecting) return;
    state.isRedirecting = true;

    const overlay = document.getElementById('transitionOverlay');
    const mainContent = document.getElementById('mainContent');

    // Fade out main content
    if (mainContent) {
        mainContent.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        mainContent.style.opacity = '0';
        mainContent.style.transform = 'scale(0.95)';
    }

    // Fade in overlay
    if (overlay) {
        overlay.classList.add('active');
    }

    // Redirect after transition
    setTimeout(() => {
        window.location.href = CONFIG.redirectUrl;
    }, 600);
}

// ============================================================
// BUTTON HANDLER
// ============================================================
function initButton() {
    const btnEnter = document.getElementById('btnEnter');
    if (!btnEnter) return;

    btnEnter.addEventListener('click', (e) => {
        e.preventDefault();
        
        // Add click effect
        btnEnter.style.transform = 'scale(0.95)';
        setTimeout(() => {
            btnEnter.style.transform = '';
        }, 150);

        // Clear auto-redirect
        if (state.intervalId) {
            clearInterval(state.intervalId);
        }

        redirectToMain();
    });

    // Keyboard shortcut
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            btnEnter.click();
        }
    });
}

// ============================================================
// GLASS CARD ANIMATION
// ============================================================
function animateGlassCard() {
    const card = document.getElementById('glassCard');
    if (!card) return;

    // Add border light animation after delay
    setTimeout(() => {
        card.classList.add('card-visible');
    }, 1500);
}

// ============================================================
// PERFORMANCE OPTIMIZATION
// ============================================================
function optimizePerformance() {
    // Reduce particles on mobile
    const isMobile = window.innerWidth < 768;
    
    if (isMobile) {
        const particles = document.querySelectorAll('.particle');
        const bubbles = document.querySelectorAll('.bubble');
        
        // Hide some particles for better performance
        particles.forEach((p, i) => {
            if (i % 2 === 0) p.style.display = 'none';
        });
        
        bubbles.forEach((b, i) => {
            if (i % 3 === 0) b.style.display = 'none';
        });
    }
}

// ============================================================
// INITIALIZATION
// ============================================================
function init() {
    console.log('✨ Splash Screen SMAN 68 Jakarta - Initializing...');

    // Create visual elements
    createParticles();
    createBubbles();

    // Start animations
    startProgressBar();
    startCountdown();
    animateGlassCard();
    initButton();

    // Performance optimization
    optimizePerformance();

    // Handle resize
    window.addEventListener('resize', () => {
        optimizePerformance();
    });

    // Prevent accidental back navigation
    window.history.pushState(null, '', window.location.href);
    window.addEventListener('popstate', () => {
        window.history.pushState(null, '', window.location.href);
    });

    console.log('✅ Splash Screen Ready');
    console.log(`⏳ Auto-redirect in ${CONFIG.countdownDuration} seconds`);
}

// ============================================================
// START WHEN DOM IS READY
// ============================================================
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
