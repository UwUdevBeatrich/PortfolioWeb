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

// github api helpers
async function fetchGitHubCommits() {
    const CACHE_KEY = 'gh_commits';
    const CACHE_TTL = 3600000;
    const USERNAME = 'UwUdevBeatrich';

    try {
        const cached = JSON.parse(localStorage.getItem(CACHE_KEY));
        if (cached && Date.now() - cached.ts < CACHE_TTL) {
            return cached.count;
        }
    } catch (e) {}

    try {
        const reposRes = await fetch(`https://api.github.com/users/${USERNAME}/repos?per_page=100`);
        if (!reposRes.ok) return 0;
        const repos = await reposRes.json();

        let total = 0;
        const promises = repos.filter(r => !r.fork).map(async (repo) => {
            try {
                const res = await fetch(`https://api.github.com/repos/${USERNAME}/${repo.name}/contributors?per_page=10`);
                if (!res.ok) return 0;
                const contribs = await res.json();
                if (!Array.isArray(contribs)) return 0;
                const me = contribs.find(c => c.login.toLowerCase() === USERNAME.toLowerCase());
                return me ? me.contributions : 0;
            } catch (e) { return 0; }
        });

        const counts = await Promise.all(promises);
        total = counts.reduce((a, b) => a + b, 0);

        if (total > 0) {
            localStorage.setItem(CACHE_KEY, JSON.stringify({ count: total, ts: Date.now() }));
        }
        return total;
    } catch (e) { return 0; }
}

async function fetchProjectCount() {
    const CACHE_KEY = 'gh_project_count';
    const CACHE_TTL = 3600000;
    const USERNAME = 'UwUdevBeatrich';
    const PRIVATE_PROJECTS = 7;

    try {
        const cached = JSON.parse(localStorage.getItem(CACHE_KEY));
        if (cached && Date.now() - cached.ts < CACHE_TTL) return cached.count;
    } catch (e) {}

    try {
        const res = await fetch(`https://api.github.com/users/${USERNAME}`);
        if (!res.ok) return PRIVATE_PROJECTS;
        const user = await res.json();
        const total = (user.public_repos || 0) + PRIVATE_PROJECTS;
        localStorage.setItem(CACHE_KEY, JSON.stringify({ count: total, ts: Date.now() }));
        return total;
    } catch (e) { return PRIVATE_PROJECTS; }
}

// stat counters
const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

async function initStatCounters() {
    const [commitCount, projectCount] = await Promise.all([
        fetchGitHubCommits(),
        fetchProjectCount(),
    ]);

    const commitsStat = document.getElementById('commits-stat');
    if (commitsStat && commitCount > 0) {
        commitsStat.setAttribute('data-target', commitCount);
    }

    const projectsStat = document.getElementById('projects-stat');
    if (projectsStat && projectCount > 0) {
        projectsStat.setAttribute('data-target', projectCount);
    }

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

// auto-populate projects from github
const KNOWN_PROJECTS = {
    'AstroDegen_Web': {
        title: 'AstroDegen Web',
        category: 'Frontend',
        description: 'Numerology & Chinese Zodiac web app. Enter your birth date, get your zodiac sign, life number, and personality reading.',
        tags: ['HTML', 'CSS', 'JavaScript'],
        image: 'assets/astrodegenweb.png',
    },
    'AstroDegen_TelegramBot': {
        title: 'AstroDegen Bot',
        category: 'Telegram Bot',
        description: 'Telegram bot that reads your Chinese Zodiac and Numerology from your birth date. No sugarcoating — just raw personality breakdowns.',
        tags: ['Python', 'python-telegram-bot', 'ephem'],
        icon: '&#128302;',
    },
    'PortfolioWeb': {
        hidden: true,
    },
};

const MANUAL_PROJECTS = [
    {
        title: 'Crypto Price Alert',
        category: 'Telegram Bot',
        description: 'Telegram bot that tracks BTC, ETH and SOL price changes in real-time. Sends alerts on big moves, current prices on command, and generates candlestick charts.',
        tags: ['Python', 'Binance API', 'mplfinance'],
        icon: '&#128200;',
        url: null,
        pushed_at: '2025-01-01T00:00:00Z',
    },
];

function detectLanguageTags(repo) {
    const lang = repo.language;
    if (!lang) return ['Code'];
    const tags = [lang];
    const name = repo.name.toLowerCase();
    const desc = (repo.description || '').toLowerCase();
    if (name.includes('bot') || name.includes('telegram') || desc.includes('bot') || desc.includes('telegram')) {
        tags.push('Bot');
    }
    return tags;
}

function detectCategory(repo) {
    const name = repo.name.toLowerCase();
    const desc = (repo.description || '').toLowerCase();
    if (name.includes('bot') || name.includes('telegram') || desc.includes('bot') || desc.includes('telegram')) return 'Telegram Bot';
    if (repo.language === 'HTML' || name.includes('web') || name.includes('portfolio')) return 'Frontend';
    if (repo.language === 'Python') return 'Python';
    return 'Project';
}

function buildCardHTML(project) {
    let imageHTML;
    if (project.image) {
        imageHTML = `<img src="${project.image}" alt="${project.title}">`;
    } else if (project.icon) {
        imageHTML = `<span class="card-icon">${project.icon}</span>`;
    } else {
        imageHTML = `<span class="card-icon">&#128187;</span>`;
    }

    const tagsHTML = project.tags.map(t => `<span class="tag">${t}</span>`).join('');
    const linkHTML = project.url
        ? `<div class="card-links"><a href="${project.url}" target="_blank" rel="noopener" class="card-link">Code</a></div>`
        : '';

    return `
        <article class="project-card reveal">
            <div class="card-image">${imageHTML}</div>
            <div class="card-body">
                <div class="card-header">
                    <h3 class="card-title">${project.title}</h3>
                    <span class="card-category">${project.category}</span>
                </div>
                <p class="card-description">${project.description}</p>
                <div class="card-tags">${tagsHTML}</div>
                ${linkHTML}
            </div>
        </article>`;
}

async function populateProjects() {
    const grid = document.getElementById('projects-grid');
    if (!grid) return;

    const CACHE_KEY = 'gh_projects';
    const CACHE_TTL = 3600000;
    const USERNAME = 'UwUdevBeatrich';

    let repos = [];

    try {
        const cached = JSON.parse(localStorage.getItem(CACHE_KEY));
        if (cached && Date.now() - cached.ts < CACHE_TTL) {
            repos = cached.repos;
        }
    } catch (e) {}

    if (!repos.length) {
        try {
            const res = await fetch(`https://api.github.com/users/${USERNAME}/repos?per_page=100&sort=pushed`);
            if (res.ok) {
                repos = await res.json();
                localStorage.setItem(CACHE_KEY, JSON.stringify({ repos, ts: Date.now() }));
            }
        } catch (e) {}
    }

    const allProjects = [];

    for (const repo of repos) {
        if (repo.fork) continue;
        const known = KNOWN_PROJECTS[repo.name];
        if (known && known.hidden) continue;

        if (known) {
            allProjects.push({
                title: known.title,
                category: known.category,
                description: known.description,
                tags: known.tags,
                image: known.image || null,
                icon: known.icon || null,
                url: repo.html_url,
                pushed_at: repo.pushed_at,
            });
        } else {
            allProjects.push({
                title: repo.name.replace(/[_-]/g, ' '),
                category: detectCategory(repo),
                description: repo.description || 'In progress...',
                tags: detectLanguageTags(repo),
                image: null,
                icon: null,
                url: repo.html_url,
                pushed_at: repo.pushed_at,
            });
        }
    }

    allProjects.push(...MANUAL_PROJECTS);
    allProjects.sort((a, b) => new Date(b.pushed_at) - new Date(a.pushed_at));

    grid.innerHTML = allProjects.map(buildCardHTML).join('');

    if (allProjects.length > 4) {
        const btn = document.createElement('button');
        btn.className = 'projects-see-more';
        btn.textContent = 'See more';
        grid.after(btn);

        const cards = grid.querySelectorAll('.project-card');
        cards.forEach((card, i) => {
            if (i >= 4) card.classList.add('hidden-card');
        });

        btn.addEventListener('click', () => {
            cards.forEach(card => card.classList.remove('hidden-card'));
            btn.remove();
        });
    }
}

// mobile card highlight
function initMobileCardHighlight() {
    if (window.matchMedia('(hover: hover)').matches) return;

    const cards = document.querySelectorAll('.project-card, .about-terminal');
    if (!cards.length) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('mobile-active');
            } else {
                entry.target.classList.remove('mobile-active');
            }
        });
    }, {
        rootMargin: '-35% 0px -35% 0px',
        threshold: 0.5
    });

    cards.forEach(card => observer.observe(card));
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
                    populateProjects().then(() => {
                        initScrollReveal();
                        initMobileCardHighlight();
                    });
                    initStatCounters();
                    startMainPetals();
                }, 400);
            }
        }

        introAnimating = false;
        requestAnimationFrame(warpPetals);
    });
}
