// portfolio main js

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

// init on page load (will be moved to intro trigger later)
triggerHeroEntrance();
initScrollReveal();
initStatCounters();
