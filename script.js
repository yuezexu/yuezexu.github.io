document.addEventListener('DOMContentLoaded', () => {
    const bgEffect = document.getElementById('bgEffect');
    let isMouseMoved = false;

    window.addEventListener('mousemove', (e) => {
        if (!isMouseMoved) {
            isMouseMoved = true;
            bgEffect.style.transition = 'none'; // remove transition for smooth follow
        }

        requestAnimationFrame(() => {
            // Adjust calculation for arbitrary scroll position
            const xPercent = (e.clientX / window.innerWidth) * 100;
            // Need to account for scrolling in the Y calculation for the background effect position
            const yPercent = ((e.clientY) / window.innerHeight) * 100;

            // Note: Since bgEffect is fixed/absolute to body, it doesn't move with scroll
            // So we simply use viewport coordinates
            bgEffect.style.background = `radial-gradient(circle 800px at ${xPercent}% ${yPercent}%, rgba(26, 115, 232, 0.05) 0%, rgba(255, 255, 255, 0) 100%)`;
        });
    });

    // Touch support for mobile
    window.addEventListener('touchmove', (e) => {
        if (e.touches.length > 0) {
            requestAnimationFrame(() => {
                const xPercent = (e.touches[0].clientX / window.innerWidth) * 100;
                const yPercent = ((e.touches[0].clientY) / window.innerHeight) * 100;
                bgEffect.style.background = `radial-gradient(circle 600px at ${xPercent}% ${yPercent}%, rgba(26, 115, 232, 0.05) 0%, rgba(255, 255, 255, 0) 100%)`;
            });
        }
    });

    // Initialize Language Setting based on localStorage or browser language
    let savedLang = localStorage.getItem('site-lang');
    if (!savedLang) {
        // Auto-detect browser language if no preference is saved
        const browserLang = navigator.language || navigator.userLanguage;
        if (browserLang.toLowerCase().includes('zh')) {
            savedLang = 'lang-zh';
        } else {
            savedLang = 'lang-en';
        }
    }
    document.body.classList.add(savedLang);

    // Handle scroll animations
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.15 // trigger when 15% of the element is visible
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                // Optional: stop observing once it has become visible
                // observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    const fadeElements = document.querySelectorAll('.fade-in-section');
    fadeElements.forEach(el => observer.observe(el));
});

// Language Toggle Function
function toggleLanguage() {
    const isZh = document.body.classList.contains('lang-zh');
    if (isZh) {
        document.body.classList.remove('lang-zh');
        document.body.classList.add('lang-en');
        localStorage.setItem('site-lang', 'lang-en');
    } else {
        document.body.classList.remove('lang-en');
        document.body.classList.add('lang-zh');
        localStorage.setItem('site-lang', 'lang-zh');
    }
}
