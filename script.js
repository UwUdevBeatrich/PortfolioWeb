// portfolio main js

// mouse tracking
let mouseX = 0;
let mouseY = 0;
document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
});

// scroll progress
(() => {
    const bar = document.querySelector('.scroll-progress');
    if (bar) {
        window.addEventListener('scroll', () => {
            const scrollTop = window.scrollY;
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
            bar.style.width = progress + '%';
        }, { passive: true });
    }
})();

// nav - hamburger toggle + mobile menu
(() => {
    const hamburger = document.getElementById('hamburger');
    const mobileMenu = document.getElementById('mobile-menu');
    if (!hamburger || !mobileMenu) return;

    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        mobileMenu.classList.toggle('open');
    });

    mobileMenu.querySelectorAll('a').forEach((link) => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('active');
            mobileMenu.classList.remove('open');
        });
    });
})();

// nav glass effect on scroll
(() => {
    const nav = document.querySelector('.hero-nav');
    const hero = document.getElementById('hero');
    if (!nav || !hero) return;

    const onScroll = () => {
        const heroBottom = hero.offsetTop + hero.offsetHeight;
        if (window.scrollY > heroBottom - 60) {
            nav.classList.add('nav-scrolled');
        } else {
            nav.classList.remove('nav-scrolled');
        }
    };

    let ticking = false;
    window.addEventListener('scroll', () => {
        if (!ticking) {
            requestAnimationFrame(() => {
                onScroll();
                ticking = false;
            });
            ticking = true;
        }
    }, { passive: true });
})();

// active section tracking
(() => {
    const sections = document.querySelectorAll('section[id]');
    if (!sections.length) return;

    let currentSection = '';

    const onScroll = () => {
        const scrollY = window.scrollY + 120;

        sections.forEach((section) => {
            const top = section.offsetTop;
            const height = section.offsetHeight;

            if (scrollY >= top && scrollY < top + height) {
                const id = section.getAttribute('id');
                if (id !== currentSection) {
                    currentSection = id;
                    document.querySelectorAll('.hero-nav a, .mobile-menu a').forEach((link) => {
                        link.classList.remove('active');
                        if (link.getAttribute('href') === `#${id}`) {
                            link.classList.add('active');
                        }
                    });
                }
            }
        });
    };

    let ticking = false;
    window.addEventListener('scroll', () => {
        if (!ticking) {
            requestAnimationFrame(() => {
                onScroll();
                ticking = false;
            });
            ticking = true;
        }
    }, { passive: true });
})();

// smooth scroll
const easeOutQuint = (t) => 1 - Math.pow(1 - t, 5);

document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
        const href = anchor.getAttribute('href');
        if (href === '#') return;

        const target = document.querySelector(href);
        if (!target) return;

        e.preventDefault();

        const offset = 80;
        const targetY = target.getBoundingClientRect().top + window.scrollY - offset;
        const startY = window.scrollY;
        const distance = targetY - startY;
        const duration = 1000;
        let start = null;

        const scrollStep = (timestamp) => {
            if (!start) start = timestamp;
            const elapsed = timestamp - start;
            const raw = Math.min(elapsed / duration, 1);
            const eased = easeOutQuint(raw);

            window.scrollTo(0, startY + distance * eased);

            if (raw < 1) {
                requestAnimationFrame(scrollStep);
            }
        };

        requestAnimationFrame(scrollStep);
    });
});


// scroll reveal
function initScrollReveal() {
    const revealElements = document.querySelectorAll('.reveal');
    if (!revealElements.length) return;

    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) return;

            const el = entry.target;
            const parent = el.parentElement;

            const siblings = parent ? Array.from(parent.querySelectorAll(':scope > .reveal')) : [];
            const index = siblings.indexOf(el);
            const delay = index >= 0 ? index * 100 : 0;

            setTimeout(() => {
                el.classList.add('revealed');
            }, delay);

            obs.unobserve(el);
        });
    }, {
        threshold: 0.1,
        rootMargin: '-60px 0px',
    });

    revealElements.forEach((el) => observer.observe(el));
}

// stat counters
const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

function initStatCounters() {
    const statNumbers = document.querySelectorAll('.stat-number');
    if (!statNumbers.length) return;

    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) return;

            const el = entry.target;
            const target = parseInt(el.getAttribute('data-target'), 10) || 0;
            animateStatValue(el, target, 2000);

            obs.unobserve(el);
        });
    }, {
        threshold: 0.5,
    });

    statNumbers.forEach((el) => observer.observe(el));
}

function animateStatValue(el, target, duration) {
    let start = null;

    const step = (timestamp) => {
        if (!start) start = timestamp;
        const elapsed = timestamp - start;
        const raw = Math.min(elapsed / duration, 1);
        const eased = easeOutCubic(raw);
        const current = Math.floor(eased * target);

        el.textContent = current;

        if (raw < 1) {
            requestAnimationFrame(step);
        } else {
            el.textContent = target;
        }
    };

    requestAnimationFrame(step);
}

// hero entrance
function triggerHeroEntrance() {
    const hero = document.getElementById('hero');
    if (!hero) return;

    const staggerMap = [
        { selector: '.hero-name',    delay: 0.2  },
        { selector: '.hero-role',    delay: 0.35 },
        { selector: '.hero-tagline', delay: 0.5  },
        { selector: '.scroll-hint',  delay: 0.65 },
    ];

    staggerMap.forEach(({ selector, delay }) => {
        const el = hero.querySelector(selector);
        if (!el) return;
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.filter = 'blur(4px)';
        el.style.transition = `opacity 0.6s ease ${delay}s, transform 0.6s ease ${delay}s, filter 0.6s ease ${delay}s`;
    });

    void hero.offsetWidth;

    staggerMap.forEach(({ selector }) => {
        const el = hero.querySelector(selector);
        if (!el) return;
        el.style.opacity = '1';
        el.style.transform = 'translateY(0)';
        el.style.filter = 'blur(0px)';
    });

    const nav = document.querySelector('.hero-nav');
    if (nav) {
        nav.style.opacity = '0';
        nav.style.transition = 'opacity 0.6s ease 0.1s, background 0.4s var(--ease-smooth), backdrop-filter 0.4s var(--ease-smooth)';
        void nav.offsetWidth;
        nav.style.opacity = '1';
    }
}

// hero parallax
(() => {
    const hero = document.getElementById('hero');
    const heroName = hero ? hero.querySelector('.hero-name') : null;
    if (!hero || !heroName) return;

    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;

    const maxMovement = 10;

    hero.addEventListener('mousemove', (e) => {
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;
        targetX = ((e.clientX - centerX) / centerX) * maxMovement;
        targetY = ((e.clientY - centerY) / centerY) * maxMovement;
    });

    hero.addEventListener('mouseleave', () => {
        targetX = 0;
        targetY = 0;
    });

    const updateParallax = () => {
        const lerp = 0.08;
        currentX += (targetX - currentX) * lerp;
        currentY += (targetY - currentY) * lerp;
        heroName.style.transform = `translate(${currentX.toFixed(2)}px, ${currentY.toFixed(2)}px)`;
        requestAnimationFrame(updateParallax);
    };

    requestAnimationFrame(updateParallax);
})();



// cherry blossom petals
const petalsCanvas = document.getElementById('petals-canvas');
let petalsCtx = null;

if (petalsCanvas) {
    petalsCtx = petalsCanvas.getContext('2d');

    function resizePetalsCanvas() {
        petalsCanvas.width = window.innerWidth;
        petalsCanvas.height = window.innerHeight;
    }
    resizePetalsCanvas();
    window.addEventListener('resize', resizePetalsCanvas);
}

class Petal {
    constructor() {
        this.reset();
    }

    reset() {
        if (!petalsCanvas) return;
        this.x = Math.random() * petalsCanvas.width;
        this.y = -15;
        this.size = Math.random() * 6 + 3;
        this.speedY = Math.random() * 0.8 + 0.3;
        this.speedX = Math.random() * 0.6 - 0.3;
        this.rotation = Math.random() * Math.PI * 2;
        this.rotationSpeed = (Math.random() - 0.5) * 0.02;
        this.opacity = Math.random() * 0.35 + 0.1;
        this.wobble = Math.random() * Math.PI * 2;
        this.wobbleSpeed = Math.random() * 0.015 + 0.005;
    }

    update() {
        if (!petalsCanvas) return;
        const dx = this.x - mouseX;
        const dy = this.y - mouseY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const repelRadius = 100;
        if (dist < repelRadius && dist > 0) {
            const force = (repelRadius - dist) / repelRadius;
            const angle = Math.atan2(dy, dx);
            this.x += Math.cos(angle) * force * 5;
            this.y += Math.sin(angle) * force * 5;
            this.rotation += force * 0.12;
        }

        this.y += this.speedY;
        this.wobble += this.wobbleSpeed;
        this.x += this.speedX + Math.sin(this.wobble) * 0.3;
        this.rotation += this.rotationSpeed;
        if (this.y > petalsCanvas.height + 15) this.reset();
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        ctx.globalAlpha = this.opacity;
        ctx.fillStyle = '#f5a0b8';
        ctx.beginPath();
        ctx.ellipse(0, 0, this.size, this.size * 0.55, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

const mainPetals = [];
for (let i = 0; i < 25; i++) {
    const p = new Petal();
    if (petalsCanvas) {
        p.y = Math.random() * petalsCanvas.height;
    }
    p._targetOpacity = p.opacity;
    p.opacity = 0;
    p._fadeDelay = i * 120;
    mainPetals.push(p);
}

function startMainPetals() {
    if (!petalsCanvas || !petalsCtx) return;
    const fadeStart = performance.now();

    function animate(now) {
        petalsCtx.clearRect(0, 0, petalsCanvas.width, petalsCanvas.height);
        mainPetals.forEach(p => {
            const elapsed = now - fadeStart - p._fadeDelay;
            if (elapsed > 0 && p.opacity < p._targetOpacity) {
                p.opacity = Math.min(p._targetOpacity, elapsed / 800 * p._targetOpacity);
            }
            p.update();
            p.draw(petalsCtx);
        });
        requestAnimationFrame(animate);
    }
    requestAnimationFrame(animate);
}

// intro overlay
const introOverlay = document.getElementById('intro-overlay');
let introAnimating = true;
let introCtx = null;
let introPetals = [];

const introPetalsCanvas = document.getElementById('intro-petals');

if (introPetalsCanvas) {
    introCtx = introPetalsCanvas.getContext('2d');

    function resizeIntroCanvas() {
        introPetalsCanvas.width = window.innerWidth;
        introPetalsCanvas.height = window.innerHeight;
    }
    resizeIntroCanvas();
    window.addEventListener('resize', resizeIntroCanvas);

    class IntroPetal {
        constructor(canvas) {
            this.canvas = canvas;
            this.reset();
        }

        reset() {
            this.x = Math.random() * this.canvas.width;
            this.y = -20;
            this.size = Math.random() * 8 + 4;
            this.speedY = Math.random() * 1.5 + 0.5;
            this.speedX = Math.random() * 1 - 0.5;
            this.rotation = Math.random() * Math.PI * 2;
            this.rotationSpeed = (Math.random() - 0.5) * 0.03;
            this.opacity = Math.random() * 0.35 + 0.15;
            this.wobble = Math.random() * Math.PI * 2;
            this.wobbleSpeed = Math.random() * 0.02 + 0.01;
        }

        update() {
            const dx = this.x - mouseX;
            const dy = this.y - mouseY;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const repelRadius = 120;
            if (dist < repelRadius && dist > 0) {
                const force = (repelRadius - dist) / repelRadius;
                const angle = Math.atan2(dy, dx);
                this.x += Math.cos(angle) * force * 6;
                this.y += Math.sin(angle) * force * 6;
                this.rotation += force * 0.15;
            }

            this.y += this.speedY;
            this.wobble += this.wobbleSpeed;
            this.x += this.speedX + Math.sin(this.wobble) * 0.5;
            this.rotation += this.rotationSpeed;

            if (this.y > this.canvas.height + 20) {
                this.reset();
            }
        }

        draw(ctx) {
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate(this.rotation);
            ctx.globalAlpha = this.opacity;
            ctx.fillStyle = '#f5a0b8';
            ctx.beginPath();
            ctx.ellipse(0, 0, this.size, this.size * 0.6, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = 'rgba(255,255,255,0.2)';
            ctx.beginPath();
            ctx.ellipse(-this.size * 0.2, -this.size * 0.1, this.size * 0.4, this.size * 0.2, -0.3, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
    }

    introPetals = [];
    for (let i = 0; i < 50; i++) {
        const petal = new IntroPetal(introPetalsCanvas);
        petal.y = Math.random() * introPetalsCanvas.height;
        introPetals.push(petal);
    }

    function animateIntroPetals() {
        if (!introAnimating) return;
        introCtx.clearRect(0, 0, introPetalsCanvas.width, introPetalsCanvas.height);
        introPetals.forEach(p => {
            p.update();
            p.draw(introCtx);
        });
        requestAnimationFrame(animateIntroPetals);
    }
    animateIntroPetals();
}

// enter button
const introEnter = document.getElementById('intro-enter');

if (introEnter && introOverlay) {
    introEnter.addEventListener('click', () => {
        const cx = window.innerWidth / 2;
        const cy = window.innerHeight / 2;
        let warpStart = null;
        const warpDuration = 1600;

        const introInner = introOverlay.querySelector('.intro-content');
        if (introInner) {
            introInner.style.transition = 'opacity 0.3s ease';
            introInner.style.opacity = '0';
        }

        function warpPetals(timestamp) {
            if (!warpStart) warpStart = timestamp;
            const elapsed = timestamp - warpStart;
            const progress = Math.min(elapsed / warpDuration, 1);
            const ease = progress * progress * progress;

            if (introPetalsCanvas && introCtx) {
                introCtx.clearRect(0, 0, introPetalsCanvas.width, introPetalsCanvas.height);
                introPetals.forEach(p => {
                    const dx = p.x - cx;
                    const dy = p.y - cy;
                    const angle = Math.atan2(dy, dx);
                    const speed = ease * 28;
                    p.x += Math.cos(angle) * speed;
                    p.y += Math.sin(angle) * speed;
                    p.size += ease * 1.8;
                    p.opacity = Math.max(0, p.opacity + (progress > 0.7 ? -0.03 : 0.005));
                    p.rotation += 0.08 + ease * 0.15;
                    p.draw(introCtx);
                });
            }

            if (progress < 1) {
                requestAnimationFrame(warpPetals);
            } else {
                introOverlay.classList.add('fade-out');
                setTimeout(() => {
                    introOverlay.style.display = 'none';
                    introAnimating = false;

                    triggerHeroEntrance();
                    initScrollReveal();
                    initStatCounters();
                    startMainPetals();
                }, 400);
            }
        }

        introAnimating = false;
        requestAnimationFrame(warpPetals);
    });
}
