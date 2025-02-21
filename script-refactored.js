// Configuration constants
const CONFIG = {
    MOBILE_BREAKPOINT: '768px',
    SCROLL_DEBOUNCE_MS: 100,
    SCREEN_READER_CLEANUP_MS: 1000,
    INDENT_PER_LEVEL: 1,
    SCROLL_TRIGGER_POSITION: 3, // Divider for window.innerHeight
    SPECIAL_SECTIONS: ['glossary', 'recitals-full'],
    EXCLUDED_CONTAINERS: '.kpi-box, .explanatory-box, .legal-box, .disclaimer-box, .recital-box'
};

// Navigation functionality
document.addEventListener('DOMContentLoaded', () => {
    // Initialize Lucide icons
    lucide.createIcons();

    // Cache DOM elements
    const elements = {
        nav: document.querySelector('.side-nav'),
        toggle: document.querySelector('.nav-toggle'),
        navContent: document.getElementById('nav-content'),
        mainContent: document.querySelector('.main-content')
    };

    // Debounce utility
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Function to toggle menu
    function toggleMenu(force = null) {
        const isExpanded = force !== null ? force : elements.toggle.getAttribute('aria-expanded') === 'true';
        const newState = force !== null ? force : !isExpanded;

        elements.toggle.setAttribute('aria-expanded', newState);
        elements.nav.classList.toggle('is-open', newState);

        // Announce to screen readers
        announceToScreenReader(`Navigation menu ${newState ? 'opened' : 'closed'}`);

        // Prevent body scroll when nav is open on mobile
        if (window.matchMedia(`(max-width: ${CONFIG.MOBILE_BREAKPOINT})`).matches) {
            document.body.style.overflow = newState ? 'hidden' : '';
        }
    }

    // Helper function for screen reader announcements
    function announceToScreenReader(message) {
        const announcement = document.createElement('div');
        announcement.setAttribute('aria-live', 'polite');
        announcement.setAttribute('class', 'sr-only');
        announcement.textContent = message;
        document.body.appendChild(announcement);
        setTimeout(() => announcement.remove(), CONFIG.SCREEN_READER_CLEANUP_MS);
    }

    // Build navigation from content
    function buildNavigation() {
        const navList = document.createElement('ul');
        navList.setAttribute('role', 'navigation');
        navList.setAttribute('aria-label', 'Document sections');

        // Get all headlines, excluding those in special boxes
        const headlines = Array.from(elements.mainContent.querySelectorAll('h2, h3, h4'))
            .filter(heading => !heading.closest(CONFIG.EXCLUDED_CONTAINERS));

        // Process each headline
        headlines.forEach(heading => {
            const level = parseInt(heading.tagName[1]) - 1;

            // Create unique ID if needed
            if (!heading.id) {
                heading.id = heading.textContent.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-');
            }

            const li = document.createElement('li');
            const link = document.createElement('a');
            link.href = `#${heading.id}`;
            link.textContent = heading.textContent;
            link.style.paddingLeft = `${(level - 1) * CONFIG.INDENT_PER_LEVEL}rem`;

            li.appendChild(link);
            navList.appendChild(li);
        });

        // Add special sections
        CONFIG.SPECIAL_SECTIONS.forEach(id => {
            const section = document.getElementById(id);
            if (section) {
                const li = document.createElement('li');
                const link = document.createElement('a');
                link.href = `#${id}`;
                link.textContent = id === 'glossary' ? 'Glossary' :
                    id === 'recitals-full' ? 'Recitals' : id;
                li.appendChild(link);
                navList.appendChild(li);
            }
        });

        elements.navContent.innerHTML = '';
        elements.navContent.appendChild(navList);
    }

    // Update active navigation item
    function updateActiveNavItem() {
        const scrollPosition = window.scrollY + window.innerHeight / CONFIG.SCROLL_TRIGGER_POSITION;

        const headlines = Array.from(elements.mainContent.querySelectorAll('h2, h3, h4'))
            .filter(heading => !heading.closest(CONFIG.EXCLUDED_CONTAINERS))
            .map(heading => ({
                element: heading,
                position: heading.getBoundingClientRect().top + window.scrollY
            }))
            .filter(item => item.position <= scrollPosition);

        const activeHeadline = headlines[headlines.length - 1];

        elements.navContent.querySelectorAll('a').forEach(link => {
            link.classList.remove('active');
            if (activeHeadline && link.getAttribute('href') === `#${activeHeadline.element.id}`) {
                link.classList.add('active');
            }
        });
    }

    // Event Listeners
    elements.toggle.addEventListener('click', () => toggleMenu());

    document.addEventListener('click', (e) => {
        if (!elements.nav.contains(e.target) && !elements.toggle.contains(e.target)) {
            toggleMenu(false);
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            toggleMenu(false);
        } else if (e.key === '0') {
            toggleMenu();
        }
    });

    // Handle navigation link clicks
    elements.navContent.addEventListener('click', (e) => {
        const link = e.target.closest('a');
        if (link) {
            e.preventDefault();
            const targetId = link.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            if (targetElement) {
                window.location.hash = targetId;
                toggleMenu(false);
            }
        }
    });

    // Handle scroll with proper debounce
    const debouncedUpdateActiveNavItem = debounce(updateActiveNavItem, CONFIG.SCROLL_DEBOUNCE_MS);
    window.addEventListener('scroll', debouncedUpdateActiveNavItem);

    // Initialize
    buildNavigation();
    updateActiveNavItem();

    // Handle responsive behavior
    const mediaQuery = window.matchMedia(`(min-width: ${CONFIG.MOBILE_BREAKPOINT})`);

    // Set initial state
    toggleMenu(mediaQuery.matches);

    // Handle resize
    mediaQuery.addEventListener('change', (e) => {
        toggleMenu(e.matches);
        if (e.matches) {
            document.body.style.overflow = ''; // Ensure scroll is enabled
        }
    });
});

// Theme handling
const themeSelect = document.getElementById('theme-select');
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');

// Load saved theme preference
const savedTheme = localStorage.getItem('theme') || 'system';
themeSelect.value = savedTheme;

function setTheme(theme) {
    // Remove any existing theme
    document.documentElement.removeAttribute('data-theme');

    if (theme === 'system') {
        // For system theme, apply theme based on system preference
        document.documentElement.setAttribute('data-theme', prefersDark.matches ? 'dark' : 'light');
    } else {
        // For explicit theme choice, apply the selected theme
        document.documentElement.setAttribute('data-theme', theme);
    }

    // Store the theme preference
    localStorage.setItem('theme', theme);

    // Update select value attribute for icon display
    themeSelect.setAttribute('value', theme);

    // Announce to screen readers
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('class', 'sr-only');
    announcement.textContent = `Theme changed to ${theme === 'system' ? 'system default' : theme} mode`;
    document.body.appendChild(announcement);
    setTimeout(() => announcement.remove(), 1000);
}

// Initialize theme
setTheme(savedTheme);

// Handle theme changes
themeSelect.addEventListener('change', (e) => {
    setTheme(e.target.value);
});

// Handle system theme changes
prefersDark.addEventListener('change', (e) => {
    if (themeSelect.value === 'system') {
        setTheme('system');
    }
});
