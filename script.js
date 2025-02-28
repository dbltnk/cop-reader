// Configuration constants
const CONFIG = {
    MOBILE_BREAKPOINT: '768px',
    SCROLL_DEBOUNCE_MS: 100,
    SCREEN_READER_CLEANUP_MS: 1000,
    INDENT_PER_LEVEL: 1,
    SCROLL_TRIGGER_POSITION: 3, // Divider for window.innerHeight
    SPECIAL_SECTIONS: ['glossary', 'recitals-full'],
    EXCLUDED_CONTAINERS: '.kpi-box, .explanatory-box, .legal-box, .disclaimer-box, .recital-box, .faq-box',
    BOX_SELECTORS: '.kpi-box, .explanatory-box, .legal-box, .disclaimer-box, .recital-box, .faq-box',
    TOAST_DURATION: 2000, // Duration in ms for toast notifications
    NAV_MANUAL_SCROLL_TIMEOUT: 2000, // Time to wait after manual nav scroll before auto-scrolling
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
        icon.setAttribute('data-lucide', 'link');
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
    let lastNavScrollTime = 0;
    let isUpdatingNav = false;

    function updateActiveNavItem() {
        if (isUpdatingNav) return;
        isUpdatingNav = true;

        requestAnimationFrame(() => {
            // Use a smaller offset from the top of the viewport
            const scrollPosition = window.scrollY + 100; // 100px offset from top

            const headlines = Array.from(elements.mainContent.querySelectorAll('h2, h3, h4'))
                .filter(heading => !heading.closest(CONFIG.EXCLUDED_CONTAINERS))
                .map(heading => ({
                    element: heading,
                    position: heading.getBoundingClientRect().top + window.scrollY
                }))
                .filter(item => item.position <= scrollPosition);

            const activeHeadline = headlines[headlines.length - 1];
            let activeLink = null;

            elements.navContent.querySelectorAll('a').forEach(link => {
                link.classList.remove('active');
                if (activeHeadline && link.getAttribute('href') === `#${activeHeadline.element.id}`) {
                    link.classList.add('active');
                    activeLink = link;
                }
            });

            // Auto-scroll nav if user hasn't manually scrolled recently
            if (activeLink && Date.now() - lastNavScrollTime > CONFIG.NAV_MANUAL_SCROLL_TIMEOUT) {
                const navContainer = elements.navContent;
                const linkRect = activeLink.getBoundingClientRect();
                const containerRect = navContainer.getBoundingClientRect();

                if (linkRect.top < containerRect.top || linkRect.bottom > containerRect.bottom) {
                    activeLink.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }

            isUpdatingNav = false;
        });
    }

    // Track manual nav scrolling
    elements.navContent.addEventListener('scroll', () => {
        lastNavScrollTime = Date.now();
    });

    // Handle scroll without debounce
    window.addEventListener('scroll', updateActiveNavItem, { passive: true });

    // Update keyboard navigation to ensure nav highlighting
    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
            requestAnimationFrame(updateActiveNavItem);
        } else if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
            e.preventDefault();

            // Get all headlines in order
            const headlines = Array.from(elements.mainContent.querySelectorAll('h2, h3, h4'))
                .filter(heading => !heading.closest(CONFIG.EXCLUDED_CONTAINERS));

            // Find current headline
            const scrollPosition = window.scrollY + window.innerHeight / CONFIG.SCROLL_TRIGGER_POSITION;
            const currentIndex = headlines.findIndex(heading =>
                heading.getBoundingClientRect().top + window.scrollY > scrollPosition
            ) - 1;

            // Calculate target index
            const targetIndex = e.key === 'ArrowRight'
                ? Math.min(currentIndex + 1, headlines.length - 1)
                : Math.max(currentIndex - 1, 0);

            // Scroll to target
            if (targetIndex !== currentIndex && headlines[targetIndex]) {
                headlines[targetIndex].scrollIntoView({ behavior: 'smooth', block: 'start' });
                history.pushState(null, '', `#${headlines[targetIndex].id}`);
                requestAnimationFrame(updateActiveNavItem);
            }
        }
    });

    // Update scroll to top to ensure nav highlighting
    function scrollToTop() {
        // Reset nav scroll first
        elements.navContent.scrollTo({
            top: 0,
            behavior: 'smooth'
        });

        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
        requestAnimationFrame(updateActiveNavItem);
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
                targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
                // Update URL without scrolling
                history.pushState(null, '', `#${targetId}`);
                toggleMenu(false);
            }
        }
    });

    // Initialize
    initializeHeadingAnchors();
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

        // Initialize aria-expanded attribute to false (collapsed)
        box.setAttribute('aria-expanded', 'false');
        box.classList.add('collapsed');

        // Hide content initially
        const content = Array.from(box.children).filter(child => {
            if (isRecital) return true;
            return child !== header;
        });
        content.forEach(el => el.style.display = 'none');

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
        } else if (e.key === '3') {
            scrollToTop();
        } else if (e.key === '1') {
            themeToggle.click();
        }
    });

    // Add click handler for "To top" button
    document.querySelector('.shortcut-btn[data-key="3"]').addEventListener('click', scrollToTop);

    // Add click handler for "Toggle boxes" button
    document.querySelector('.shortcut-btn[data-key="2"]').addEventListener('click', (e) => {
        e.preventDefault();
        toggleAllBoxes();
    });
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

// Glossary term marking
document.addEventListener('DOMContentLoaded', () => {
    // Helper function to escape special regex characters
    function escapeRegExp(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    // Helper function to create plural variations
    function getTermVariations(term) {
        const variations = [term];
        // Simple plural rules - can be expanded
        if (term.endsWith('y')) {
            variations.push(term.slice(0, -1) + 'ies');
        } else if (term.endsWith('s')) {
            variations.push(term + 'es');
        } else {
            variations.push(term + 's');
        }
        return variations;
    }

    // Build glossary index
    const glossaryTerms = new Map();
    let termCounter = 1;

    document.querySelectorAll('.glossary-list dt').forEach(term => {
        const termText = term.textContent.trim();
        const variations = getTermVariations(termText);

        variations.forEach(variant => {
            glossaryTerms.set(variant.toLowerCase(), {
                number: termCounter,
                originalTerm: termText
            });
        });
        termCounter++;
    });

    // Function to mark terms in a text node
    function markTermsInNode(textNode) {
        if (!textNode.nodeValue.trim()) return;

        // Skip if we're in a headline or already processed node
        const parent = textNode.parentElement;
        if (parent.closest('h1, h2, h3, h4, h5, h6, .glossary-marked, .glossary')) {
            return;
        }

        let text = textNode.nodeValue;
        let html = text;
        let hasChanges = false;

        // Sort terms by length (longest first) to handle overlapping terms
        const sortedTerms = Array.from(glossaryTerms.keys())
            .sort((a, b) => b.length - a.length);

        // Track which terms we've marked in this text node
        const markedTerms = new Set();

        sortedTerms.forEach(term => {
            if (markedTerms.has(term)) return;

            const escapedTerm = escapeRegExp(term);
            const regex = new RegExp(`(?<=^|[^a-zA-Z0-9-])${escapedTerm}(?=$|[^a-zA-Z0-9-])`, 'gi');

            // Only replace first occurrence
            html = html.replace(regex, (match) => {
                if (markedTerms.has(term)) return match;

                const info = glossaryTerms.get(term.toLowerCase());
                markedTerms.add(term);
                hasChanges = true;

                return `<span class="glossary-marked" data-glossary-number="${info.number}">${match}</span>`;
            });
        });

        if (hasChanges) {
            const fragment = document.createRange().createContextualFragment(html);
            textNode.parentNode.replaceChild(fragment, textNode);
        }
    }

    // Process all text nodes in the main content
    function processContent(root) {
        const walker = document.createTreeWalker(
            root,
            NodeFilter.SHOW_TEXT,
            {
                acceptNode: (node) => {
                    // Skip if parent is already processed or in excluded elements
                    if (node.parentElement.closest('.glossary-marked, script, style, .glossary')) {
                        return NodeFilter.FILTER_REJECT;
                    }
                    return NodeFilter.FILTER_ACCEPT;
                }
            }
        );

        const nodes = [];
        while (walker.nextNode()) nodes.push(walker.currentNode);
        nodes.forEach(markTermsInNode);
    }

    // Initial processing
    const mainContent = document.querySelector('.main-content');
    if (mainContent) {
        processContent(mainContent);
    }

    // Create popup element
    const popup = document.createElement('div');
    popup.className = 'glossary-popup';
    popup.innerHTML = `
        <div class="glossary-popup-header">
            <span class="glossary-popup-term"></span>
        </div>
        <div class="glossary-popup-definition"></div>
    `;
    document.body.appendChild(popup);

    // Track current popup state
    let currentTerm = null;
    let isHovering = false;
    let isClickShown = false;

    // Helper to get term definition
    function getTermDefinition(number) {
        const dt = document.querySelector(`.glossary-list dt:nth-child(${2 * number - 1})`);
        const dd = document.querySelector(`.glossary-list dt:nth-child(${2 * number - 1}) + dd`);
        return {
            term: dt?.textContent.trim(),
            definition: dd?.textContent.trim()
        };
    }

    // Helper to position popup
    function positionPopup(target) {
        const rect = target.getBoundingClientRect();
        const isMobile = window.matchMedia('(max-width: 768px)').matches;

        if (isMobile) {
            // Mobile positioning is handled by CSS
            return;
        }

        // Calculate available space
        const spaceRight = window.innerWidth - rect.right - 16; // 16px buffer
        const spaceLeft = rect.left - 16;

        // Default to right positioning
        let left = rect.right + 8;

        // If not enough space on right, try left
        if (spaceRight < 300 && spaceLeft > 300) {
            left = rect.left - 308; // 300px + 8px gap
        }
        // If neither side has space, center above/below
        else if (spaceRight < 300 && spaceLeft < 300) {
            left = Math.max(16, Math.min(
                window.innerWidth - 316,
                rect.left + (rect.width - 300) / 2
            ));
        }

        // Position relative to viewport and adjust for scroll
        popup.style.position = 'absolute';
        popup.style.left = `${left}px`;
        popup.style.top = `${rect.top + window.scrollY}px`; // Add scrollY since we're using absolute positioning
    }

    // Helper to hide popup
    function hidePopup(force = false) {
        if (force || (!isHovering && !isClickShown)) {
            popup.classList.remove('show');
            currentTerm = null;
            isClickShown = false;
        }
    }

    // Helper to show popup
    function showPopup(target, fromClick = false) {
        const number = parseInt(target.dataset.glossaryNumber);
        if (!number) return;

        const { term, definition } = getTermDefinition(number);
        if (!term || !definition) return;

        popup.querySelector('.glossary-popup-term').textContent = term;
        popup.querySelector('.glossary-popup-definition').textContent = definition;

        positionPopup(target);
        popup.classList.add('show');
        currentTerm = target;
        if (fromClick) {
            isClickShown = true;
        }
    }

    // Check if device has hover capability
    const hasHover = window.matchMedia('(hover: hover)').matches;

    // Click handlers for all devices
    document.addEventListener('click', (e) => {
        const term = e.target.closest('.glossary-marked');

        if (term) {
            if (currentTerm === term) {
                isHovering = false; // Reset hover state on click
                hidePopup(true); // Force hide on direct term click
            } else {
                isHovering = false; // Reset hover state on click
                isClickShown = true; // Set click state before showing
                showPopup(term, true);
            }
            e.stopPropagation();
        } else {
            isHovering = false; // Reset hover state on outside click
            hidePopup(true); // Force hide on outside click
        }
    });

    // Event handlers for hover
    if (hasHover) {
        document.addEventListener('mouseover', (e) => {
            const term = e.target.closest('.glossary-marked');
            if (term && !isClickShown) { // Don't show on hover if shown by click
                isHovering = true;
                showPopup(term, false);
            }
        });

        document.addEventListener('mouseout', (e) => {
            const term = e.target.closest('.glossary-marked');
            if (term) {
                isHovering = false;
                if (!isClickShown) { // Only hide if not shown by click
                    setTimeout(hidePopup, 100);
                }
            }
        });
    }

    // Handle scroll and resize
    let scrollTimeout;
    window.addEventListener('scroll', () => {
        if (currentTerm) {
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => {
                if (currentTerm) {
                    positionPopup(currentTerm);
                }
            }, 100);
        }
    }, { passive: true });

    window.addEventListener('resize', () => {
        if (currentTerm) {
            positionPopup(currentTerm);
        }
    });

    // Optional: Handle dynamically added content
    const observer = new MutationObserver(mutations => {
        mutations.forEach(mutation => {
            mutation.addedNodes.forEach(node => {
                if (node.nodeType === Node.ELEMENT_NODE) {
                    processContent(node);
                }
            });
        });
    });

    if (mainContent) {
        observer.observe(mainContent, {
            childList: true,
            subtree: true
        });
    }
});

// Article linking functionality
document.addEventListener('DOMContentLoaded', () => {
    // Helper function to escape special regex characters
    function escapeRegExp(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    // Function to mark articles in a text node
    function markArticlesInNode(textNode) {
        if (!textNode.nodeValue.trim()) return;

        // Skip if we're in a headline or already processed node
        const parent = textNode.parentElement;
        if (parent.closest('h1, h2, h3, h4, h5, h6, .ai-act-link, .glossary')) {
            return;
        }

        let text = textNode.nodeValue;
        // Matches article references from the AI Act, handling:
        // ✓ Single articles: "Article 78 AI Act"
        // ✓ Multiple articles: "Articles 53 and 55 AI Act"
        // ✓ Articles with paragraphs: "Article 51(1) AI Act"
        // ✓ Articles with multiple levels: "Article 56(1)(3) AI Act"
        // ✓ Articles with points: "Article 53(1), point (a) AI Act"
        // ✓ Complex combinations: "Articles 51(1), 52 and 53(4) AI Act"
        // ✓ Line breaks: "Articles 53 and 55 AI\n    Act"
        // ✓ Recitals: "Recital 116 AI Act"
        // ✓ Mixed references: "Article 56(1)(3), Recital 1, and Recital 116 AI Act"
        // ✓ Annexes: "Annex XI AI Act"
        // ✓ Annex sections: "Annex XI, Section 2 AI Act"
        // ✓ Annex points: "Annex XI, Section 2, point 1 AI Act"
        // ✓ Mixed references with Annexes: "Article 56(1)(3), Recital 1, and Annex XI AI Act"
        // ✓ Handles any whitespace: Line feeds, tabs, multiple spaces anywhere
        // Does NOT match:
        // ✗ Other directives: "Article 4(3) of Directive (EU) 2019/790"
        // ✗ Standalone references: "Article 78" (without "AI Act")
        const regex = /(?:Articles?\s+(\d+(?:\s*\(\s*\d+\s*\))*(?:\s*,\s*(?:point\s*\([a-z]\))?|\s+and\s+)\d+(?:\s*\(\s*\d+\s*\))*(?:\s*,\s*(?:point\s*\([a-z]\))?)*|\d+(?:\s*\(\s*\d+\s*\))*(?:\s*,\s*(?:point\s*\([a-z]\))?)*)|Recitals?\s+(\d+)|Annex\s+([IVX]+)(?:\s*,\s*Section\s+(\d+)(?:\s*,\s*point\s+(\d+\.?))?)?)\s*(?=\s+(?:(?!\bDirective\s*\(EU\)).)*?\bAI[\s\n\r]+Act\b)/gi;
        let match;
        let lastIndex = 0;
        let fragments = [];

        while ((match = regex.exec(text)) !== null) {
            // Add text before the match
            if (match.index > lastIndex) {
                fragments.push(document.createTextNode(text.slice(lastIndex, match.index)));
            }

            // Create the link element
            const link = document.createElement('a');
            link.className = 'ai-act-link';

            // Determine the type of reference and create appropriate link
            if (match[0].toLowerCase().startsWith('recital')) {
                // Get the recital number
                const recitalNumber = match[2];
                link.href = `https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32024R1689&qid=1740494199959#rct_${recitalNumber}`;
            } else if (match[0].toLowerCase().startsWith('annex')) {
                // Get the annex number in roman numerals
                const annexNumber = match[3];
                link.href = `https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32024R1689&qid=1740494199959#anx_${annexNumber}`;
            } else {
                // Get the first article number for the link
                const firstArticleNumber = match[1].split(/[\s,]+/)[0].split('(')[0];
                link.href = `https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32024R1689&qid=1740494199959#art_${firstArticleNumber}`;
            }

            link.target = '_blank';
            link.rel = 'noopener noreferrer';
            link.textContent = match[0];
            fragments.push(link);

            lastIndex = regex.lastIndex;
        }

        // Add remaining text
        if (lastIndex < text.length) {
            fragments.push(document.createTextNode(text.slice(lastIndex)));
        }

        // Only replace if we found matches
        if (fragments.length > 0) {
            const container = document.createDocumentFragment();
            fragments.forEach(fragment => container.appendChild(fragment));
            textNode.parentNode.replaceChild(container, textNode);
        }
    }

    // Process all text nodes in the main content
    function processContent(root) {
        const walker = document.createTreeWalker(
            root,
            NodeFilter.SHOW_TEXT,
            {
                acceptNode: (node) => {
                    // Skip if parent is already processed or in excluded elements
                    if (node.parentElement.closest('.ai-act-link, script, style, .glossary')) {
                        return NodeFilter.FILTER_REJECT;
                    }
                    return NodeFilter.FILTER_ACCEPT;
                }
            }
        );

        const nodes = [];
        while (walker.nextNode()) nodes.push(walker.currentNode);
        nodes.forEach(markArticlesInNode);
    }

    // Initial processing
    const mainContent = document.querySelector('.main-content');
    if (mainContent) {
        processContent(mainContent);
    }

    // Optional: Handle dynamically added content
    const observer = new MutationObserver(mutations => {
        mutations.forEach(mutation => {
            mutation.addedNodes.forEach(node => {
                if (node.nodeType === Node.ELEMENT_NODE) {
                    processContent(node);
                }
            });
        });
    });

    if (mainContent) {
        observer.observe(mainContent, {
            childList: true,
            subtree: true
        });
    }
});
