/* ===================================================
   BIRTHDAY GIFT WEBSITE — Main Script
   Motion Graphics • Particles • Animations • Confetti
   =================================================== */

const ease = {
    out: (t) => 1 - Math.pow(1 - t, 3),
    inOut: (t) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2,
};

// ===== 0. UTILITIES / HELPERS =====
const lerp = (a, b, n) => (1 - n) * a + n * b;

// Synthetic Sound System
class SoundFX {
    constructor() {
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    }

    playPop() {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(400, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(10, this.ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.1);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.1);
    }

    playSparkle() {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(880, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1200, this.ctx.currentTime + 0.2);
        gain.gain.setValueAtTime(0.05, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.2);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.2);
    }
}
const sfx = new SoundFX();

// ===== 1. THREE.JS 3D BACKGROUND ENGINE =====
class BackgroundScene3D {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        if (!this.container) return;
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.container.appendChild(this.renderer.domElement);

        this.objects = [];
        this.mouse = { x: 0, y: 0 };
        this.scrollPos = 0;

        this.init();
        this.bindEvents();
        this.animate();
    }

    init() {
        const count = 60;
        const geometries = [
            new THREE.IcosahedronGeometry(1.5, 0),
            new THREE.OctahedronGeometry(1, 0),
            new THREE.TorusGeometry(1, 0.3, 16, 100),
            new THREE.TetrahedronGeometry(1.2, 0)
        ];

        for (let i = 0; i < count; i++) {
            const geo = geometries[Math.floor(Math.random() * geometries.length)];
            const color = [0xff6b9d, 0xc06cf3, 0xffd700][Math.floor(Math.random() * 3)];
            const mat = new THREE.MeshPhongMaterial({
                color: color,
                transparent: true,
                opacity: 0.15,
                shininess: 100,
                flatShading: true
            });

            const mesh = new THREE.Mesh(geo, mat);
            mesh.position.set(
                (Math.random() - 0.5) * 60,
                (Math.random() - 0.5) * 100,
                (Math.random() - 0.5) * 30
            );
            mesh.rotation.set(Math.random() * 20, Math.random() * 20, Math.random() * 20);
            const scale = Math.random() * 0.5 + 0.5;
            mesh.scale.set(scale, scale, scale);

            this.scene.add(mesh);
            this.objects.push({
                mesh: mesh,
                rotX: (Math.random() - 0.5) * 0.01,
                rotY: (Math.random() - 0.5) * 0.01,
                rotZ: (Math.random() - 0.5) * 0.01,
                initialY: mesh.position.y
            });
        }

        const light1 = new THREE.PointLight(0xff6b9d, 1.5, 100);
        light1.position.set(10, 10, 10);
        this.scene.add(light1);

        const light2 = new THREE.PointLight(0xc06cf3, 1.5, 100);
        light2.position.set(-10, -10, 10);
        this.scene.add(light2);

        this.scene.add(new THREE.AmbientLight(0xffffff, 0.4));
        this.camera.position.z = 30;
    }

    bindEvents() {
        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });

        window.addEventListener('mousemove', (e) => {
            this.mouse.x = (e.clientX / window.innerWidth) - 0.5;
            this.mouse.y = (e.clientY / window.innerHeight) - 0.5;
        });

        window.addEventListener('scroll', () => {
            this.scrollPos = window.scrollY;
        });
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        this.objects.forEach(obj => {
            obj.mesh.rotation.x += obj.rotX;
            obj.mesh.rotation.y += obj.rotY;
            obj.mesh.position.y = obj.initialY + (this.scrollPos * 0.02);

            // Subtle mouse react
            obj.mesh.position.x += (this.mouse.x * 2 - obj.mesh.position.x) * 0.005;
        });

        this.camera.rotation.y += (this.mouse.x * 0.1 - this.camera.rotation.y) * 0.02;
        this.camera.rotation.x += (-this.mouse.y * 0.1 - this.camera.rotation.x) * 0.02;

        this.renderer.render(this.scene, this.camera);
    }
}

// ===== 2. FLOATING HEARTS =====
class FloatingHearts {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.hearts = ['💕', '❤️', '💖', '💗', '💝', '🩷', '✨', '🌸', '🦋', '💐'];
        this.spawn();
    }

    createHeart() {
        const el = document.createElement('span');
        el.className = 'floating-heart';
        el.textContent = this.hearts[Math.floor(Math.random() * this.hearts.length)];
        el.style.left = Math.random() * 100 + '%';
        el.style.fontSize = (Math.random() * 1.2 + 0.6) + 'rem';
        el.style.animationDuration = (Math.random() * 6 + 8) + 's';
        el.style.animationDelay = Math.random() * 2 + 's';
        this.container.appendChild(el);

        // Pop interaction
        el.addEventListener('mouseenter', () => {
            sfx.playPop();
            el.style.transform = 'scale(2.5)';
            el.style.transition = 'transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
            setTimeout(() => el.remove(), 300);
        });

        setTimeout(() => { if (el.parentNode) el.remove(); }, 16000);
    }

    spawn() {
        for (let i = 0; i < 8; i++) setTimeout(() => this.createHeart(), i * 400);
        setInterval(() => this.createHeart(), 2000);
    }
}

// ===== 3. MEMORY GALLERY =====
class MemoryGallery {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        if (!this.container) return;
        this.images = [
            'IMG20260128152800.jpg',
            'IMG20260130130105.jpg',
            'IMG20260130130109.jpg',
            'IMG20260130130111 (1).jpg',
            'IMG20260130130111.jpg',
            'IMG20260130130114 (1).jpg',
            'IMG20260130130114.jpg',
            'IMG20260130130237 (1).jpg',
            'IMG20260130130237.jpg',
            'IMG20260130130243 (1).jpg',
            'IMG20260130130243.jpg',
            'Screenshot_2026-01-30-13-01-58-88_92460851df6f172a4592fca41cc2d2e6 (1).jpg',
            'Screenshot_2026-01-30-13-01-58-88_92460851df6f172a4592fca41cc2d2e6.jpg',
            'WhatsApp Image 2026-02-24 at 5.13.45 PM (1).jpeg',
            'WhatsApp Image 2026-02-24 at 5.13.46 PM (1).jpeg',
            'WhatsApp Image 2026-02-24 at 5.14.38 PM (1).jpeg',
            'WhatsApp Image 2026-02-28 at 21.18.39.jpeg',
            'WhatsApp Image 2026-02-28 at 21.18.40.jpeg',
            'WhatsApp Image 2026-02-28 at 21.18.41a.jpeg',
            'WhatsApp Image 2026-s02-28 at 21.18.40.jpeg',
            'WhatsAspp Image 2026-02-28 at 21.18.40.jpeg',
            's.jpeg'
        ];
        this.captions = [
            "Your beautiful smile", "Adventures together", "Pure happiness", "Those eyes ❤️",
            "Special moments", "Forever yours", "My favorite person", "Making memories",
            "Living the dream", "You and Me", "Love in every frame", "Thinking of you",
            "Sunshine in human form", "My everything", "Heart of gold", "Beautiful soul",
            "Best days of my life", "Truly magical", "Sweetest laugh", "Always by your side"
        ];
        this.init();
    }

    init() {
        this.images.forEach((img, i) => {
            const card = document.createElement('div');
            card.className = 'memory-card reveal-card';
            card.dataset.delay = (i % 4) * 100;

            const caption = this.captions[i % this.captions.length];
            const date = new Date(2025, 0 + (i % 12), 1 + i).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

            card.innerHTML = `
                <div class="memory-image-wrapper">
                    <img src="assets/images/${img}" alt="${caption}" 
                         loading="lazy" decoding="async" onload="this.classList.add('loaded')">
                    <div class="image-shimmer"></div>
                </div>
                <div class="memory-content">
                    <span class="memory-date">✨ ${date}</span>
                    <h3>${caption}</h3>
                    <p>A beautiful moment captured forever. You look absolutely stunning here, my love.</p>
                </div>
            `;
            this.container.appendChild(card);
        });
    }
}

// ===== 4. VIDEO GALLERY =====
class VideoGallery {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        if (!this.container) return;
        this.videos = [
            'VID-20260128-WA0021.mp4',
            'VID-20260130-WA0005.mp4',
            'VID20260121174743.mp4',
            'VID20260121174934.mp4',
            'VID_20260130_001652_002.mp4',
            'WhatsApp Video 2026-02-28 at 21.17.29.mp4',
            'WhatsApp Video 2026-02-28 at 21.17.31.mp4'
        ];
        this.init();
    }

    init() {
        this.videos.forEach((vid, i) => {
            const card = document.createElement('div');
            card.className = 'video-card reveal-card';
            card.dataset.delay = (i % 4) * 100;

            card.innerHTML = `
                <div class="video-wrapper">
                    <video controls preload="metadata" onplay="this.classList.add('loaded')">
                        <source src="assets/videos/${vid}" type="video/mp4">
                        Your browser does not support the video tag.
                    </video>
                    <div class="video-shimmer"></div>
                </div>
                <div class="memory-content">
                    <span class="memory-date">📹 Video Memory ${i + 1}</span>
                    <p>A special moment caught on camera.</p>
                </div>
            `;
            this.container.appendChild(card);
        });
    }
}

// ===== 3. SCROLL PROGRESS & REVEAL =====
class ScrollManager {
    constructor() {
        this.bar = document.getElementById('scroll-progress-bar');
        this.revealElements = document.querySelectorAll('.reveal-text, .reveal-card');
        this.initReveal();
        window.addEventListener('scroll', () => this.updateProgress());
    }

    updateProgress() {
        const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
        const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = (winScroll / height) * 100;
        this.bar.style.width = scrolled + "%";
    }

    initReveal() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const delay = parseInt(entry.target.dataset.delay) || 0;
                    setTimeout(() => entry.target.classList.add('visible'), delay);
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });
        this.revealElements.forEach(el => observer.observe(el));
    }
}

// ===== 4. SMART INTERACTIONS (Spotlight, Magnetic) =====
class InteractionManager {
    constructor() {
        this.spotlight = document.getElementById('mouse-spotlight');
        this.magnetics = document.querySelectorAll('.audio-btn, .cake, .memory-card, .video-card');
        this.initSpotlight();
        this.initMagnetic();
        this.initLetterReveal();
    }

    initSpotlight() {
        window.addEventListener('mousemove', (e) => {
            document.documentElement.style.setProperty('--mouse-x', e.clientX + 'px');
            document.documentElement.style.setProperty('--mouse-y', e.clientY + 'px');
        });
    }

    initMagnetic() {
        this.magnetics.forEach(el => {
            el.addEventListener('mouseenter', () => sfx.playSparkle());
            el.addEventListener('mousemove', (e) => {
                const rect = el.getBoundingClientRect();
                const x = e.clientX - rect.left - rect.width / 2;
                const y = e.clientY - rect.top - rect.height / 2;
                el.style.transform = `translate(${x * 0.3}px, ${y * 0.3}px)`;
            });
            el.addEventListener('mouseleave', () => {
                el.style.transform = `translate(0px, 0px)`;
            });
        });
    }

    initLetterReveal() {
        const titles = ['hero-happy', 'hero-birthday', 'hero-love'];
        titles.forEach(id => {
            const el = document.getElementById(id);
            if (!el) return;
            const text = el.innerText;
            el.innerHTML = '';
            [...text].forEach((char, i) => {
                const span = document.createElement('span');
                span.innerText = char === ' ' ? '\u00A0' : char;
                span.className = 'char';
                span.style.transitionDelay = `${i * 50}ms`;
                el.appendChild(span);
            });
        });
    }
}

// ===== 5. BIRTHDAY LOGIC =====
class BirthdayCore {
    constructor() {
        this.targetDate = new Date('2026-03-01T00:00:00+05:30');
        this.updateCountdown();
        setInterval(() => this.updateCountdown(), 1000);
        this.initCake();
        this.initAudio();
    }

    updateCountdown() {
        const diff = this.targetDate - new Date();
        const els = {
            d: document.getElementById('cd-days'),
            h: document.getElementById('cd-hours'),
            m: document.getElementById('cd-minutes'),
            s: document.getElementById('cd-seconds')
        };
        if (!els.d) return;

        if (diff <= 0) {
            Object.values(els).forEach(el => el.innerText = '🎂');
            document.getElementById('countdown-msg').innerText = "HAPPY BIRTHDAY MY LOVE! ❤️";
            return;
        }

        const d = Math.floor(diff / (1000 * 60 * 60 * 24));
        const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const m = Math.floor((diff / 1000 / 60) % 60);
        const s = Math.floor((diff / 1000) % 60);

        els.d.innerText = String(d).padStart(2, '0');
        els.h.innerText = String(h).padStart(2, '0');
        els.m.innerText = String(m).padStart(2, '0');
        els.s.innerText = String(s).padStart(2, '0');
    }

    initCake() {
        const cake = document.getElementById('birthday-cake');
        cake.addEventListener('click', () => {
            sfx.playSparkle();
            document.querySelectorAll('.flame').forEach((f, i) => {
                setTimeout(() => f.classList.add('blown-out'), i * 200);
            });
            setTimeout(() => {
                this.launchConfetti();
                const wish = document.getElementById('final-wish');
                wish.style.display = 'block';
                setTimeout(() => wish.classList.add('visible'), 50);
            }, 800);
        });
    }

    launchConfetti() {
        const container = document.getElementById('confetti-container');
        for (let i = 0; i < 150; i++) {
            const c = document.createElement('div');
            c.className = 'confetti-piece';
            c.style.left = Math.random() * 100 + '%';
            c.style.backgroundColor = `hsl(${Math.random() * 360}, 100%, 70%)`;
            c.style.animationDuration = (Math.random() * 3 + 2) + 's';
            container.appendChild(c);
            setTimeout(() => c.remove(), 5000);
        }
    }

    initAudio() {
        const btn = document.getElementById('audio-toggle');
        this.audio = new Audio('song.webm');
        this.audio.loop = true;
        this.playing = false;

        const toggle = () => {
            if (this.playing) {
                this.audio.pause();
            } else {
                this.audio.play().catch(e => console.log('Wait for user interaction'));
            }
            this.playing = !this.playing;
            btn.classList.toggle('playing', this.playing);
            btn.querySelector('.audio-icon').innerText = this.playing ? '🔊' : '🎵';
        };

        btn.addEventListener('click', toggle);

        // Handle Welcome Overlay
        const overlay = document.getElementById('welcome-overlay');
        const enterBtn = document.getElementById('enter-btn');

        if (enterBtn && overlay) {
            enterBtn.addEventListener('click', () => {
                overlay.classList.add('fade-out');
                if (!this.playing) toggle();
            });
        }
    }
}

// ===== 6. TYPEWRITER EFFECT =====
class Typewriter {
    constructor(elementId) {
        this.el = document.getElementById(elementId);
        if (!this.el) return;
        this.paragraphs = [...this.el.querySelectorAll('p')];
        const observer = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting) { this.start(); observer.unobserve(this.el); }
        }, { threshold: 0.5 });
        observer.observe(this.el);
    }

    start() {
        this.paragraphs.forEach((p, pi) => {
            const text = p.innerText;
            p.innerText = '';
            p.style.opacity = '1';
            setTimeout(() => {
                [...text].forEach((char, i) => {
                    setTimeout(() => p.innerText += char, i * 20);
                });
            }, pi * 1000);
        });
    }
}

// ===== 7. CURSOR TRAIL =====
class CursorTrail {
    constructor() {
        window.addEventListener('mousemove', e => {
            if (Math.random() > 0.8) this.create(e.clientX, e.clientY);
        });
    }
    create(x, y) {
        const s = document.createElement('div');
        s.innerText = ['✨', '💖', '🌸', '✦'][Math.floor(Math.random() * 4)];
        s.style.cssText = `position:fixed;left:${x}px;top:${y}px;pointer-events:none;z-index:9999;font-size:12px;transition:all 1s ease`;
        document.body.appendChild(s);
        requestAnimationFrame(() => {
            s.style.transform = `translate(${(Math.random() - 0.5) * 100}px, -100px) scale(0)`;
            s.style.opacity = '0';
        });
        setTimeout(() => s.remove(), 1000);
    }
}

// ===== INITIALIZE =====
document.addEventListener('DOMContentLoaded', () => {
    new BackgroundScene3D('three-container');
    new FloatingHearts('floating-hearts');
    new MemoryGallery('memories-grid');
    new VideoGallery('videos-grid');
    new ScrollManager();
    new InteractionManager();
    new BirthdayCore();
    new Typewriter('typewriter-text');
    new CursorTrail();
    document.body.classList.add('ready');
});
