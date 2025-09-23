// UI and scroll functionality only - order management moved to order.js

// Header scroll behavior
function initHeaderScroll() {
    let lastScroll = 0;
    const header = document.querySelector('.header');
    const headerHeight = header.offsetHeight;
    
    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;
        
        // Don't do anything on mobile
        if (window.innerWidth <= 768) return;
        
        // Scrolling down
        if (currentScroll > lastScroll && currentScroll > headerHeight) {
            header.style.transform = `translateY(-${headerHeight}px)`;
        }
        // Scrolling up
        else {
            header.style.transform = 'translateY(0)';
        }
        
        lastScroll = currentScroll;
    });
}

// Initialize UI functionality when the page loads
document.addEventListener('DOMContentLoaded', () => {
    // Back to Top Button functionality
    const backToTopButton = document.getElementById('backToTop');
    
    // Show button after scrolling down 300px
    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 300) {
            backToTopButton.classList.add('visible');
        } else {
            backToTopButton.classList.remove('visible');
        }
    });
    
    // Enhanced smooth scroll to top when clicked
    backToTopButton.addEventListener('click', () => {
        // Check if browser supports smooth scrolling
        if ('scrollBehavior' in document.documentElement.style) {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        } else {
            // Fallback for older browsers
            smoothScrollTo(document.body, 600);
        }
    });
    initHeaderScroll();
    
    // Visual feedback is handled by CSS hover effects
});

// Enhanced smooth scrolling for all devices and browsers
function smoothScrollTo(target, duration = 800) {
    const targetElement = typeof target === 'string' ? document.querySelector(target) : target;
    if (!targetElement) return;

    const startPosition = window.pageYOffset;
    // Check if we're on a device with fixed header (desktop only)
    const isDesktop = window.innerWidth > 1366;
    const targetPosition = isDesktop ? targetElement.offsetTop - 160 : targetElement.offsetTop;
    const distance = targetPosition - startPosition;
    let startTime = null;

    function animation(currentTime) {
        if (startTime === null) startTime = currentTime;
        const timeElapsed = currentTime - startTime;
        const run = easeInOutQuad(timeElapsed, startPosition, distance, duration);
        window.scrollTo(0, run);
        if (timeElapsed < duration) requestAnimationFrame(animation);
    }

    // Easing function for smooth animation
    function easeInOutQuad(t, b, c, d) {
        t /= d / 2;
        if (t < 1) return c / 2 * t * t + b;
        t--;
        return -c / 2 * (t * (t - 2) - 1) + b;
    }

    requestAnimationFrame(animation);
}

// Generic smooth scrolling for all anchor links
document.addEventListener('DOMContentLoaded', function() {
    // Handle all anchor links with performance optimization
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                // Check if browser supports smooth scrolling
                if ('scrollBehavior' in document.documentElement.style) {
                    targetElement.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                } else {
                    // Fallback for older browsers
                    smoothScrollTo(targetElement);
                }
            }
        }, { passive: false }); // Allow preventDefault
    });

    // Enhanced smooth scrolling for programmatic calls
    window.smoothScrollTo = smoothScrollTo;
    
    // Performance optimization: Use passive listeners for scroll events
    let ticking = false;
    
    function updateScrollPosition() {
        // Any scroll-based updates can go here
        ticking = false;
    }
    
    function requestTick() {
        if (!ticking) {
            requestAnimationFrame(updateScrollPosition);
            ticking = true;
        }
    }
    
    // Add passive scroll listener for better performance
    window.addEventListener('scroll', requestTick, { passive: true });
});

// Add keyboard navigation support
document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && e.target.classList.contains('quantity')) {
        e.target.blur();
    }
});

// Add mobile-friendly touch events
if ('ontouchstart' in window) {
    document.querySelectorAll('.food-item, .platter-option').forEach(item => {
        let touchStartY = 0;
        let touchStartX = 0;
        let isScrolling = false;
        
        item.addEventListener('touchstart', (e) => {
            touchStartY = e.touches[0].clientY;
            touchStartX = e.touches[0].clientX;
            isScrolling = false;
        });
        
        item.addEventListener('touchmove', (e) => {
            const touchY = e.touches[0].clientY;
            const touchX = e.touches[0].clientX;
            const deltaY = Math.abs(touchY - touchStartY);
            const deltaX = Math.abs(touchX - touchStartX);
            
            // If vertical movement is greater than horizontal, it's likely a scroll
            if (deltaY > deltaX && deltaY > 10) {
                isScrolling = true;
            }
        });
        
        item.addEventListener('touchend', (e) => {
            if (!isScrolling) {
                item.style.transform = 'scale(1)';
                item.style.transition = 'transform 0.2s ease';
            }
        });
        
        item.addEventListener('touchcancel', (e) => {
            if (!isScrolling) {
                item.style.transform = 'scale(1)';
                item.style.transition = 'transform 0.2s ease';
            }
        });
    });
    
    // Improve touch scrolling
    document.body.style.webkitOverflowScrolling = 'touch';
    
    // Improve touch interaction for selects on mobile
    document.querySelectorAll('select.quantity').forEach(element => {
        element.addEventListener('touchstart', (e) => {
            // Only prevent default for actual taps, not scrolls
            const touch = e.touches[0];
            const startY = touch.clientY;
            const startX = touch.clientX;
            
            // Allow scrolling by not preventing default
            // Just focus the element for better UX
            element.focus();
        });
    });
}

// Add mobile-specific improvements
function isMobile() {
    return window.innerWidth <= 768;
}

// Improve mobile form interactions
document.addEventListener('DOMContentLoaded', () => {
    // Add mobile-specific classes
    if (isMobile()) {
        document.body.classList.add('mobile-device');
    }
    
    // Handle orientation changes
    window.addEventListener('orientationchange', () => {
        setTimeout(() => {
            if (isMobile()) {
                document.body.classList.add('mobile-device');
            } else {
                document.body.classList.remove('mobile-device');
            }
        }, 100);
    });
    
    // Mobile-specific header adjustments
    if (isMobile()) {
        const header = document.querySelector('.header');
        header.classList.add('mobile-header');
    }
    
    // Mobile touch-friendly spacing
    if (isMobile()) {
        // Add touch-friendly spacing
        document.querySelectorAll('.quantity-selector').forEach(selector => {
            selector.style.minHeight = '44px'; // iOS minimum touch target
        });
        
        // Improve button touch targets
        document.querySelectorAll('button, .place-order-btn').forEach(button => {
            button.style.minHeight = '44px';
            button.style.minWidth = '44px';
        });
    }
});

// Add mobile-specific CSS classes
const mobileCSS = `
/* Mobile-specific quantity selector improvements */
.mobile-device .quantity {
    min-height: 44px;
    font-size: 16px; /* Prevents zoom on iOS */
    width: 100%;
    max-width: none;
    margin: 0;
    border-radius: 8px;
    background-color: #ffffff;
    touch-action: manipulation;
    -webkit-tap-highlight-color: transparent;
}

/* Compact quantity selector on mobile */
.mobile-device .quantity-selector {
    padding: 4px 0;
    margin: 4px 0;
}

/* Improve touch feedback */
.mobile-device .quantity:active {
    background-color: #f9fafb;
}
.mobile-device .food-item {
    margin-bottom: 15px;
}

.mobile-device .quantity-selector {
    margin-top: 8px;
}

.mobile-device .quantity {
    min-height: 44px;
    font-size: 16px; /* Prevents zoom on iOS */
}

.mobile-device .form-group input {
    min-height: 44px;
    font-size: 16px; /* Prevents zoom on iOS */
}

.mobile-device .place-order-btn {
    min-height: 50px;
    font-size: 18px;
}

.mobile-device .order-item {
    padding: 15px 0;
    border-bottom: 2px solid #e5e7eb;
}

.mobile-device .total-line {
    padding: 12px 0;
    font-size: 1.1rem;
}

.mobile-device .total-line.final-total {
    font-size: 1.4rem;
    padding: 15px 0;
    border-top: 3px solid #dc2626;
}

/* Mobile header styles */
@media (max-width: 768px) {
    .mobile-device .header {
        position: relative;
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    
    .mobile-device .main-content {
        padding-top: 0;
    }
}

/* Mobile-specific animations */
@media (max-width: 768px) {
    .mobile-device .food-item:active {
        transform: scale(0.95);
        transition: transform 0.1s ease;
    }
    
    .mobile-device .place-order-btn:active {
        transform: scale(0.98);
        transition: transform 0.1s ease;
    }
}
`;

// Inject mobile-specific CSS
const style = document.createElement('style');
style.textContent = mobileCSS;
document.head.appendChild(style);
