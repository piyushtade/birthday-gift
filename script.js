/* ===================================================
   BIRTHDAY GIFT WEBSITE — Main Script
   Motion Graphics • Particles • Animations • Confetti
   =================================================== */

// ===== GSAP-like animation helpers (vanilla) =====
const ease = {
    out: (t) => 1 - Math.pow(1 - t, 3),
    inOut: (t) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2,
};

// ===== 1. PARTICLE SYSTEM =====
class ParticleSystem {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.mouse = { x: 0, y: 0 };
        this.resize();
        this.init();
        this.bindEvents();
        this.animate();
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    init() {
        const count = Math.min(Math.floor(window.innerWidth / 12), 120);
        this.particles = [];
        for (let i = 0; i < count; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                radius: Math.random() * 2 + 0.5,
                vx: (Math.random() - 0.5) * 0.3,
                vy: (Math.random() - 0.5) * 0.3,
                alpha: Math.random() * 0.5 + 0.1,
                color: this.getColor(),
                pulse: Math.random() * Math.PI * 2,
                pulseSpeed: Math.random() * 0.02 + 0.01,
            });
        }
    }

    getColor() {
        const colors = [
            'rgba(255, 107, 157,',  // pink
            'rgba(192, 108, 243,',  // purple
            'rgba(255, 215, 0,',    // gold
            'rgba(255, 143, 184,',  // soft pink
            'rgba(102, 126, 234,',  // blue
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    bindEvents() {
        window.addEventListener('resize', () => {
            this.resize();
            this.init();
        });
        window.addEventListener('mousemove', (e) => {
            this.mouse.x = e.clientX;
            this.mouse.y = e.clientY;
        });
    }

    drawConnections() {
        for (let i = 0; i < this.particles.length; i++) {
            for (let j = i + 1; j < this.particles.length; j++) {
                const dx = this.particles[i].x - this.particles[j].x;
                const dy = this.particles[i].y - this.particles[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 120) {
                    const alpha = (1 - dist / 120) * 0.15;
                    this.ctx.beginPath();
                    this.ctx.strokeStyle = `rgba(255, 107, 157, ${alpha})`;
                    this.ctx.lineWidth = 0.5;
                    this.ctx.moveTo(this.particles[i].x, this.particles[i].y);
                    this.ctx.lineTo(this.particles[j].x, this.particles[j].y);
                    this.ctx.stroke();
                }
            }
        }
    }

    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.particles.forEach((p) => {
            // Mouse interaction
            const dx = this.mouse.x - p.x;
            const dy = this.mouse.y - p.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 150) {
                const force = (150 - dist) / 150;
                p.vx -= (dx / dist) * force * 0.02;
                p.vy -= (dy / dist) * force * 0.02;
            }

            p.x += p.vx;
            p.y += p.vy;
            p.pulse += p.pulseSpeed;

            // Boundaries
            if (p.x < 0) p.x = this.canvas.width;
            if (p.x > this.canvas.width) p.x = 0;
            if (p.y < 0) p.y = this.canvas.height;
            if (p.y > this.canvas.height) p.y = 0;

            // Draw
            const pulsingAlpha = p.alpha + Math.sin(p.pulse) * 0.15;
            const pulsingRadius = p.radius + Math.sin(p.pulse) * 0.3;
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, pulsingRadius, 0, Math.PI * 2);
            this.ctx.fillStyle = `${p.color}${Math.max(0.05, pulsingAlpha)})`;
            this.ctx.fill();

            // Glow
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, pulsingRadius * 3, 0, Math.PI * 2);
            this.ctx.fillStyle = `${p.color}${Math.max(0.01, pulsingAlpha * 0.1)})`;
            this.ctx.fill();
        });

        this.drawConnections();
        requestAnimationFrame(() => this.animate());
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

        setTimeout(() => el.remove(), 16000);
    }

    spawn() {
        // Initial batch
        for (let i = 0; i < 8; i++) {
            setTimeout(() => this.createHeart(), i * 400);
        }
        // Continuous
        setInterval(() => this.createHeart(), 2500);
    }
}

// ===== 3. SCROLL REVEAL =====
class ScrollReveal {
    constructor() {
        this.elements = document.querySelectorAll('.reveal-text, .reveal-card');
        this.observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        const delay = parseInt(entry.target.dataset.delay) || 0;
                        setTimeout(() => {
                            entry.target.classList.add('visible');
                        }, delay);
                        this.observer.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
        );

        this.elements.forEach((el) => this.observer.observe(el));
    }
}

// ===== 4. COUNTDOWN =====
class BirthdayCountdown {
    constructor() {
        this.targetDate = new Date('2026-03-01T00:00:00+05:30');
        this.daysEl = document.getElementById('cd-days');
        this.hoursEl = document.getElementById('cd-hours');
        this.minutesEl = document.getElementById('cd-minutes');
        this.secondsEl = document.getElementById('cd-seconds');
        this.msgEl = document.getElementById('countdown-msg');
        this.update();
        setInterval(() => this.update(), 1000);
    }

    update() {
        const now = new Date();
        const diff = this.targetDate - now;

        if (diff <= 0) {
            this.daysEl.textContent = '🎉';
            this.hoursEl.textContent = '🎂';
            this.minutesEl.textContent = '🥳';
            this.secondsEl.textContent = '💖';
            this.msgEl.textContent = "🎊 It's Your Birthday! Happy Birthday, My Love! 🎊";
            this.msgEl.style.fontSize = '1.6rem';
            this.msgEl.style.color = '#ff6b9d';
            return;
        }

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        this.animateValue(this.daysEl, days);
        this.animateValue(this.hoursEl, hours);
        this.animateValue(this.minutesEl, minutes);
        this.animateValue(this.secondsEl, seconds);
    }

    animateValue(el, value) {
        const str = String(value).padStart(2, '0');
        if (el.textContent !== str) {
            el.style.transform = 'translateY(-4px)';
            el.style.opacity = '0.5';
            setTimeout(() => {
                el.textContent = str;
                el.style.transform = 'translateY(0)';
                el.style.opacity = '1';
            }, 150);
        }
    }
}

// ===== 5. BIRTHDAY CAKE INTERACTION =====
class BirthdayCake {
    constructor() {
        this.cake = document.getElementById('birthday-cake');
        this.flames = document.querySelectorAll('.flame');
        this.confettiContainer = document.getElementById('confetti-container');
        this.finalWish = document.getElementById('final-wish');
        this.blown = false;

        this.cake.addEventListener('click', () => this.blowCandles());
    }

    blowCandles() {
        if (this.blown) return;
        this.blown = true;

        // Blow out each flame with stagger
        this.flames.forEach((flame, i) => {
            setTimeout(() => {
                flame.classList.add('blown-out');
            }, i * 200);
        });

        // Trigger confetti and wish
        setTimeout(() => {
            this.launchConfetti();
            this.finalWish.style.display = 'block';
            this.finalWish.classList.add('visible');
            document.querySelector('.cake-instruction').style.display = 'none';
        }, 800);
    }

    launchConfetti() {
        const colors = ['#ff6b9d', '#c06cf3', '#ffd700', '#ff8fb8', '#667eea', '#00f2fe', '#f093fb', '#ff4d6d'];
        const shapes = ['●', '■', '▲', '★', '♥', '✦'];

        for (let i = 0; i < 150; i++) {
            setTimeout(() => {
                const confetti = document.createElement('div');
                confetti.className = 'confetti-piece';
                confetti.style.left = Math.random() * 100 + '%';
                confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
                confetti.style.width = (Math.random() * 8 + 4) + 'px';
                confetti.style.height = (Math.random() * 8 + 4) + 'px';
                confetti.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
                confetti.style.animationDuration = (Math.random() * 2 + 2) + 's';
                confetti.style.animationDelay = Math.random() * 0.3 + 's';
                confetti.textContent = shapes[Math.floor(Math.random() * shapes.length)];
                confetti.style.color = colors[Math.floor(Math.random() * colors.length)];
                confetti.style.fontSize = (Math.random() * 12 + 8) + 'px';
                confetti.style.display = 'flex';
                confetti.style.alignItems = 'center';
                confetti.style.justifyContent = 'center';

                this.confettiContainer.appendChild(confetti);
                setTimeout(() => confetti.remove(), 4000);
            }, i * 20);
        }
    }
}

// ===== 6. TYPEWRITER EFFECT =====
class TypewriterEffect {
    constructor(elementId) {
        this.wrapper = document.getElementById(elementId);
        this.paragraphs = Array.from(this.wrapper.querySelectorAll('p'));
        this.started = false;

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting && !this.started) {
                        this.started = true;
                        this.start();
                        observer.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.3 }
        );

        observer.observe(this.wrapper);
    }

    start() {
        this.paragraphs.forEach((p, i) => {
            const text = p.textContent;
            p.textContent = '';
            p.style.opacity = '1';

            let charIndex = 0;
            const delay = i * 1200;

            setTimeout(() => {
                const interval = setInterval(() => {
                    p.textContent += text[charIndex];
                    charIndex++;
                    if (charIndex >= text.length) {
                        clearInterval(interval);
                    }
                }, 18);
            }, delay);
        });
    }
}

// ===== 7. PARALLAX ON MOUSE =====
class MouseParallax {
    constructor() {
        this.orbs = document.querySelectorAll('.hero-gradient-orb');
        window.addEventListener('mousemove', (e) => this.onMove(e));
    }

    onMove(e) {
        const x = (e.clientX / window.innerWidth - 0.5) * 2;
        const y = (e.clientY / window.innerHeight - 0.5) * 2;

        this.orbs.forEach((orb, i) => {
            const factor = (i + 1) * 15;
            orb.style.transform = `translate(${x * factor}px, ${y * factor}px)`;
        });
    }
}

// ===== 8. SMOOTH SECTION TRANSITIONS =====
class SmoothSections {
    constructor() {
        const sections = document.querySelectorAll('.section');
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.style.opacity = '1';
                        entry.target.style.transform = 'translateY(0)';
                    }
                });
            },
            { threshold: 0.1 }
        );

        sections.forEach((section, i) => {
            if (i > 0) {
                section.style.opacity = '0';
                section.style.transform = 'translateY(20px)';
                section.style.transition = 'opacity 1s ease, transform 1s ease';
            }
            observer.observe(section);
        });
    }
}

// ===== 9. TILT EFFECT ON CARDS =====
function initTiltCards() {
    const cards = document.querySelectorAll('.memory-card, .reason-card');
    cards.forEach((card) => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const rotateX = ((y - centerY) / centerY) * -5;
            const rotateY = ((x - centerX) / centerX) * 5;

            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateY(0)';
        });
    });
}

// ===== 10. CURSOR SPARKLE TRAIL =====
class CursorSparkle {
    constructor() {
        this.sparkles = [];
        window.addEventListener('mousemove', (e) => this.create(e));
    }

    create(e) {
        if (Math.random() > 0.7) return; // Throttle

        const sparkle = document.createElement('div');
        sparkle.style.cssText = `
            position: fixed;
            pointer-events: none;
            z-index: 9999;
            left: ${e.clientX}px;
            top: ${e.clientY}px;
            font-size: ${Math.random() * 10 + 6}px;
            transition: all 1s ease;
            opacity: 1;
        `;
        const symbols = ['✦', '✧', '⋆', '˚', '✩'];
        sparkle.textContent = symbols[Math.floor(Math.random() * symbols.length)];
        sparkle.style.color = `hsl(${Math.random() * 60 + 320}, 80%, 70%)`;

        document.body.appendChild(sparkle);

        requestAnimationFrame(() => {
            sparkle.style.transform = `translate(${(Math.random() - 0.5) * 60}px, ${-40 - Math.random() * 30}px) scale(0)`;
            sparkle.style.opacity = '0';
        });

        setTimeout(() => sparkle.remove(), 1000);
    }
}

// ===== INITIALIZE EVERYTHING =====
document.addEventListener('DOMContentLoaded', () => {
    // Motion Graphics
    new ParticleSystem('particles-canvas');
    new FloatingHearts('floating-hearts');
    new MouseParallax();
    new CursorSparkle();

    // Scroll Animations
    new ScrollReveal();
    new SmoothSections();

    // Interactive Elements
    new BirthdayCountdown();
    new BirthdayCake();
    new TypewriterEffect('typewriter-text');

    // Card Effects
    initTiltCards();

    // Audio Toggle (placeholder — add your own audio file)
    const audioBtn = document.getElementById('audio-toggle');
    let audioPlaying = false;
    let audio = null;

    audioBtn.addEventListener('click', () => {
        if (!audio) {
            audio = new Audio();
            // To add music, place a .mp3 file in the same folder and update the src:
            // audio.src = 'your-song.mp3';
            audio.loop = true;
        }

        if (audioPlaying) {
            audio.pause();
            audioBtn.classList.remove('playing');
            audioBtn.querySelector('.audio-icon').textContent = '🎵';
        } else {
            audio.play().catch(() => { });
            audioBtn.classList.add('playing');
            audioBtn.querySelector('.audio-icon').textContent = '🔊';
        }
        audioPlaying = !audioPlaying;
    });

    // Initial hero animation
    setTimeout(() => {
        document.querySelectorAll('.hero-content .reveal-text').forEach((el) => {
            const delay = parseInt(el.dataset.delay) || 0;
            setTimeout(() => el.classList.add('visible'), delay);
        });
    }, 300);

    console.log('💕 Happy Birthday Website Loaded! Made with love. 💕');
});
