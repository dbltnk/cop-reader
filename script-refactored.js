// Configuration constants
const CONFIG = {
    MOBILE_BREAKPOINT: '768px',
    SCROLL_DEBOUNCE_MS: 100,
    SCREEN_READER_CLEANUP_MS: 1000,
    INDENT_PER_LEVEL: 1,
    SCROLL_TRIGGER_POSITION: 3, // Divider for window.innerHeight
    SPECIAL_SECTIONS: ['glossary', 'recitals-full'],
    EXCLUDED_CONTAINERS: '.kpi-box, .explanatory-box, .legal-box, .disclaimer-box, .recital-box',
    BOX_SELECTORS: '.kpi-box, .explanatory-box, .legal-box, .disclaimer-box, .recital-box',
    TOAST_DURATION: 2000, // Duration in ms for toast notifications
};

// Toast notification system
function showToast(message) {
    let container = document.querySelector('.toast-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'toast-container';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    container.appendChild(toast);

    // Trigger reflow
    toast.offsetHeight;

    // Show the toast
    requestAnimationFrame(() => {
        toast.classList.add('show');
    });

    // Remove the toast after duration
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 200);
    }, CONFIG.TOAST_DURATION);
}

// Heading anchor system
function initializeHeadingAnchors() {
    // Get all headlines in main content, excluding those in special boxes
    const headlines = Array.from(document.querySelectorAll('.main-content h2, .main-content h3, .main-content h4, .main-content h5'))
        .filter(heading => !heading.closest(CONFIG.EXCLUDED_CONTAINERS));

    // Keep track of used IDs to ensure uniqueness
    const usedIds = new Set();

    headlines.forEach(heading => {
        // Generate base ID from text content
        let baseId = heading.textContent.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-');

        // Ensure unique ID
        let uniqueId = baseId;
        let counter = 1;
        while (usedIds.has(uniqueId)) {
            uniqueId = `${baseId}-${++counter}`;
        }
        usedIds.add(uniqueId);

        // Set the unique ID
        heading.id = uniqueId;

        // Create anchor wrapper
        const anchor = document.createElement('a');
        anchor.className = 'heading-anchor';
        anchor.href = `#${uniqueId}`;

        // Move the heading's content into the anchor
        const headingContent = heading.textContent;
        heading.textContent = '';

        // Add Lucide anchor icon
        const icon = document.createElement('i');
        icon.setAttribute('data-lucide', 'anchor');
        icon.className = 'anchor-icon';
        anchor.appendChild(icon);

        // Add text
        const text = document.createElement('span');
        text.textContent = headingContent;
        anchor.appendChild(text);

        // Add click handler
        anchor.addEventListener('click', (e) => {
            e.preventDefault();
            const url = new URL(window.location.href);
            url.hash = uniqueId;
            navigator.clipboard.writeText(url.toString())
                .then(() => {
                    showToast('Link copied to clipboard');
                    // Update URL without scrolling
                    history.pushState(null, '', url.toString());
                })
                .catch(() => showToast('Failed to copy link'));
        });

        // Replace heading content with anchor
        heading.appendChild(anchor);
    });

    // Initialize new Lucide icons
    lucide.createIcons();
}

// Navigation functionality
document.addEventListener('DOMContentLoaded', () => {
    // Initialize Lucide icons
    lucide.createIcons();

    // Cache DOM elements
    const elements = {
        nav: document.querySelector('.side-nav'),
        toggle: document.querySelector('.nav-toggle'),
        navContent: document.getElementById('nav-content'),
        mainContent: document.querySelector('.main-content'),
        boxes: document.querySelectorAll(CONFIG.BOX_SELECTORS)
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

            // Transform text for navigation
            let text = heading.textContent.trim();
            text = text.replace(/^Measure\s+(\d+\.\d+)/i, 'M$1');
            text = text.replace(/^Commitment\s+(\d+)/i, 'C$1');
            link.textContent = text;

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

    // Function to toggle a single box
    function toggleBox(box, force = null) {
        const isExpanded = force !== null ? force : box.getAttribute('aria-expanded') === 'true';
        const newState = force !== null ? force : !isExpanded;

        box.setAttribute('aria-expanded', newState);
        box.classList.toggle('collapsed', !newState);

        // Get the content element (everything after the header)
        const header = box.querySelector('h4, h5') || box.querySelector('::before');
        const content = Array.from(box.children).filter(child => {
            // For recital boxes, we want all elements except the pseudo-elements
            if (box.classList.contains('recital-box')) {
                return true;
            }
            // For other boxes, exclude the header
            return child !== header;
        });

        content.forEach(el => {
            el.style.display = newState ? 'block' : 'none';
        });

        // Announce to screen readers
        const boxType = box.classList.contains('recital-box') ?
            `Recital ${box.getAttribute('data-recital')}` :
            header?.textContent;
        announceToScreenReader(`${boxType} ${newState ? 'expanded' : 'collapsed'}`);
    }

    // Function to toggle all boxes
    function toggleAllBoxes(force = null) {
        elements.boxes.forEach(box => toggleBox(box, force));
    }

    // Initialize boxes
    elements.boxes.forEach(box => {
        const header = box.querySelector('h4, h5');
        const isRecital = box.classList.contains('recital-box');

        // Initialize aria-expanded attribute
        box.setAttribute('aria-expanded', 'true');

        if (isRecital) {
            // For recital boxes, make the entire box clickable
            box.addEventListener('click', () => toggleBox(box));
        } else if (header) {
            // For other boxes, make the header clickable
            header.style.cursor = 'pointer';
            header.addEventListener('click', () => toggleBox(box));
        }
    });

    // Add keyboard shortcut for toggling all boxes
    document.addEventListener('keydown', (e) => {
        if (e.key === '2') {
            e.preventDefault();
            toggleAllBoxes();
        }
    });

    // Initialize heading anchors
    initializeHeadingAnchors();
});

// Theme handling
const themeToggle = document.getElementById('theme-toggle');
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');

// Load saved theme preference or use system preference
const savedTheme = localStorage.getItem('theme');
const systemTheme = prefersDark.matches ? 'dark' : 'light';
const currentTheme = savedTheme || systemTheme;

function setTheme(theme) {
    // Set the theme
    document.documentElement.setAttribute('data-theme', theme);

    // Store the theme preference
    localStorage.setItem('theme', theme);

    // Announce to screen readers
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('class', 'sr-only');
    announcement.textContent = `Theme changed to ${theme} mode`;
    document.body.appendChild(announcement);
    setTimeout(() => announcement.remove(), 1000);
}

// Initialize theme
setTheme(currentTheme);

// Handle theme toggle
themeToggle.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
});

// Handle system theme changes when no saved preference
prefersDark.addEventListener('change', (e) => {
    if (!localStorage.getItem('theme')) {
        setTheme(e.matches ? 'dark' : 'light');
    }
});

// Handle keyboard shortcut for theme toggle
document.addEventListener('keydown', (e) => {
    if (e.key === '3') {
        themeToggle.click();
    } else if (e.key === '1') {
        scrollToTop();
    }
});

// Scroll to top functionality
function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

// Add click handler for "To top" button
document.querySelector('.shortcut-btn[data-key="1"]').addEventListener('click', scrollToTop);
