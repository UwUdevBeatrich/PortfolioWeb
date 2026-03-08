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
