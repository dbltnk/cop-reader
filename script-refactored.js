// Navigation functionality
document.addEventListener('DOMContentLoaded', () => {
    // Initialize Lucide icons
    lucide.createIcons();

    const nav = document.querySelector('.side-nav');
    const toggle = document.querySelector('.nav-toggle');
    const navContent = document.getElementById('nav-content');
    const mainContent = document.querySelector('.main-content');

    // Function to toggle menu
    function toggleMenu(force = null) {
        const isExpanded = force !== null ? force : toggle.getAttribute('aria-expanded') === 'true';
        const newState = force !== null ? force : !isExpanded;

        toggle.setAttribute('aria-expanded', newState);
        nav.classList.toggle('is-open', newState);

        // Announce to screen readers
        announceToScreenReader(`Navigation menu ${newState ? 'opened' : 'closed'}`);

        // Prevent body scroll when nav is open on mobile
        if (window.matchMedia('(max-width: 767px)').matches) {
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
        setTimeout(() => announcement.remove(), 1000);
    }

    // Build navigation from content
    function buildNavigation() {
        const navList = document.createElement('ul');
        navList.setAttribute('role', 'navigation');
        navList.setAttribute('aria-label', 'Document sections');

        // Get all headlines, excluding those in special boxes
        const headlines = Array.from(mainContent.querySelectorAll('h2, h3, h4'))
            .filter(heading => !heading.closest('.kpi-box, .explanatory-box, .legal-box, .disclaimer-box, .recital'));

        // Process each headline
        headlines.forEach(heading => {
            // Get heading level (2 for h2, 3 for h3, etc.)
            const level = parseInt(heading.tagName[1]) - 1;

            // Create unique ID if needed
            if (!heading.id) {
                heading.id = heading.textContent.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-');
            }

            // Create list item and link
            const li = document.createElement('li');
            const link = document.createElement('a');
            link.href = `#${heading.id}`;
            link.textContent = heading.textContent;
            link.style.paddingLeft = `${(level - 1) * 1}rem`;

            li.appendChild(link);
            navList.appendChild(li);
        });

        // Add special sections
        ['glossary', 'recitals-full'].forEach(id => {
            const section = document.getElementById(id);
            if (section) {
                const li = document.createElement('li');
                const link = document.createElement('a');
                link.href = `#${id}`;
                link.textContent = id === 'glossary' ? 'Glossary' : 'Recitals';
                li.appendChild(link);
                navList.appendChild(li);
            }
        });

        // Clear and update navigation
        navContent.innerHTML = '';
        navContent.appendChild(navList);
    }

    // Update active navigation item
    function updateActiveNavItem() {
        const scrollPosition = window.scrollY + window.innerHeight / 3;

        // Find all headlines and their positions
        const headlines = Array.from(mainContent.querySelectorAll('h2, h3, h4'))
            .filter(heading => !heading.closest('.kpi-box, .explanatory-box, .legal-box, .disclaimer-box, .recital'))
            .map(heading => ({
                element: heading,
                position: heading.getBoundingClientRect().top + window.scrollY
            }))
            .filter(item => item.position <= scrollPosition);

        // Get the last (most recent) headline
        const activeHeadline = headlines[headlines.length - 1];

        // Update active states
        navContent.querySelectorAll('a').forEach(link => {
            link.classList.remove('active');
            if (activeHeadline && link.getAttribute('href') === `#${activeHeadline.element.id}`) {
                link.classList.add('active');
            }
        });
    }

    // Event Listeners
    toggle.addEventListener('click', () => toggleMenu());

    document.addEventListener('click', (e) => {
        if (!nav.contains(e.target) && !toggle.contains(e.target)) {
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
    navContent.addEventListener('click', (e) => {
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

    // Handle scroll with debounce
    let scrollTimeout;
    window.addEventListener('scroll', () => {
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(updateActiveNavItem, 100);
    });

    // Initialize
    buildNavigation();
    updateActiveNavItem();

    // Handle initial state based on screen size
    const mediaQuery = window.matchMedia('(min-width: 768px)');

    // Set initial state
    if (mediaQuery.matches) {
        // On tablet and up, always show nav
        toggleMenu(true);
    } else {
        // On mobile, start with nav closed
        toggleMenu(false);
    }

    // Handle resize
    mediaQuery.addEventListener('change', (e) => {
        if (e.matches) {
            // Switching to tablet/desktop
            toggleMenu(true);
            document.body.style.overflow = ''; // Ensure scroll is enabled
        } else {
            // Switching to mobile
            toggleMenu(false);
        }
    });
});
