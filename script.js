document.addEventListener('DOMContentLoaded', () => {
    initializeTyped();
    setupMenuToggle();
    setupDynamicHeader();
    smoothScroll();
    detectDevice();
});




document.addEventListener("DOMContentLoaded", () => {
    const typedElement = document.querySelector('#im-a');
    if (!typedElement) return;

    new Typed('#im-a', {
        strings:[
            "I write full-stack code that actually delivers.",
            "I explore security loopholes (the ethical kind).",
            "I make enterprise apps faster, smarter, and cleaner.",
            "I turn business needs into working software.",
            "I debug .NET APIs faster than you can say 'null reference exception'.",
            "I automate builds, tests, and even my excuses.",
            "I build, break, and fix—usually in that order.",
            "I clean up legacy code like it's personal.",
            "I predict problems and patch them before they exist.",
            "I write code that won’t make future me rage quit (hopefully).",
            "I turn caffeine and edge cases into robust apps.",
            "I optimize backend performance... but not my sleep schedule."
            ],
        typeSpeed: window.matchMedia("(max-width: 768px)").matches ? 75 : 100,
        backSpeed: window.matchMedia("(max-width: 768px)").matches ? 40 : 50,
        loop: true,
        showCursor: true,
        cursorChar: '', // Visible cursor
        smartBackspace: true,
        contentType: 'html'
    });
});

// Ensure it runs only when the DOM is fully loaded
document.addEventListener("DOMContentLoaded", initializeTyped);


function setupMenuToggle() {
    const menuToggle = document.querySelector('.menu-toggle');
    const nav = document.querySelector('nav');

    if (!menuToggle || !nav) return;

    menuToggle.addEventListener('click', () => nav.classList.toggle('active'));

    // Optimize: Use event delegation instead of adding multiple listeners
    nav.addEventListener('click', (e) => {
        if (e.target.tagName === 'A' && window.innerWidth < 768) {
            nav.classList.remove('active');
        }
    });
}

function setupDynamicHeader() {
    const header = document.querySelector('header');
    const compactHeader = document.querySelector('#compact-header');
    if (!header || !compactHeader || window.innerWidth < 768) return;  // Optimize: Return early

    let lastScrollTop = 0;
    let ticking = false;
    const scrollThreshold = 200;

    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                const scrollTop = window.scrollY || document.documentElement.scrollTop;

                if (scrollTop > lastScrollTop && scrollTop > scrollThreshold) {
                    header.style.transform = 'translateY(-100%)';
                    compactHeader.style.transform = 'translateY(0)';
                } else {
                    header.style.transform = 'translateY(0)';
                    compactHeader.style.transform = 'translateY(-100%)';
                }

                lastScrollTop = scrollTop;
                ticking = false;
            });
            ticking = true;
        }
    }, { passive: true });  // Optimize: Use passive to improve performance
}

function smoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
}

function detectDevice() {
    document.body.classList.add(('ontouchstart' in window || navigator.maxTouchPoints) ? 'touch-device' : 'non-touch-device');
}
