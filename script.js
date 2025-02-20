// Shared state for navigation
let previousPosition = null;
let lastJumpKey = null;

// Function to update active navigation item
function updateActiveNavItem(target) {
    const navContent = document.getElementById('nav-content');
    const allNavLinks = navContent.querySelectorAll('a');

    // Get all headlines
    const headlines = Array.from(document.querySelectorAll('h2, h3, h4'))
        .filter(heading => !heading.closest('.kpi-box, .explanatory-box, .legal-box, .disclaimer-box'));

    // Get the middle of the viewport
    const viewportMiddle = window.scrollY + (window.innerHeight / 3);

    // Find all headlines above viewport middle
    const activeHeadlines = headlines.filter(headline => {
        const headlinePosition = headline.getBoundingClientRect().top + window.scrollY;
        return headlinePosition <= viewportMiddle;
    });

    // Get the last headline (most recent one above viewport middle)
    let activeHeadline = activeHeadlines[activeHeadlines.length - 1];

    // If we're at the very top of the page, use the first headline
    if (!activeHeadline && headlines.length > 0) {
        activeHeadline = headlines[0];
    }

    // Remove all active classes
    allNavLinks.forEach(link => {
        link.classList.remove('active', 'active-deepest');
    });

    if (activeHeadline) {
        const targetId = activeHeadline.id;
        const targetLink = navContent.querySelector(`a[href="#${targetId}"]`);

        if (targetLink) {
            // Find all currently active links
            const activeLinks = [];

            // Add active class to the target and collect parent links
            activeLinks.push(targetLink);

            let parent = targetLink.closest('li').parentElement.closest('li');
            while (parent) {
                const parentLink = parent.querySelector('a');
                if (parentLink) {
                    parentLink.classList.add('active'); // Only add active class to parents
                    activeLinks.push(parentLink);
                }
                parent = parent.parentElement.closest('li');
            }

            // Find the deepest visible active link
            const visibleActiveLinks = activeLinks.filter(link => {
                const rect = link.getBoundingClientRect();
                const navRect = navContent.getBoundingClientRect();
                return rect.top >= navRect.top && rect.bottom <= navRect.bottom;
            });

            // Add active-deepest class only to the deepest visible link
            if (visibleActiveLinks.length > 0) {
                const deepestLink = visibleActiveLinks[0];
                deepestLink.classList.add('active', 'active-deepest');
            } else {
                // If no visible links, add to the target link
                targetLink.classList.add('active', 'active-deepest');
            }
        }
    }
}

// Function to scroll element into view
function scrollToElement(element, savePrevious = true, updateNav = true) {
    if (!element) return;

    if (savePrevious) {
        previousPosition = window.scrollY;
    }

    // Simple offset for headlines
    const offset = 20;

    // Get the element's position relative to the viewport and add current scroll position
    const elementRect = element.getBoundingClientRect();
    const absoluteTop = window.pageYOffset + elementRect.top;
    const position = absoluteTop - offset;

    // Prevent focus from causing scroll
    element.style.scrollMarginTop = offset + 'px';

    window.scrollTo({
        top: position,
        behavior: 'smooth'
    });

    // Update navigation after scrolling if requested
    if (updateNav) {
        setTimeout(() => updateActiveNavItem(element), 100);
    }

    // Announce to screen readers
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('class', 'sr-only');
    announcement.textContent = element.textContent;
    document.body.appendChild(announcement);
    setTimeout(() => announcement.remove(), 300);

    // Only apply focus and visual feedback for interactive elements
    if (element.tagName === 'BUTTON' || element.tagName === 'A' ||
        element.getAttribute('role') === 'button' ||
        element.getAttribute('tabindex') === '0') {
        requestAnimationFrame(() => {
            element.setAttribute('tabindex', '-1');
            element.focus({ preventScroll: true });
            element.classList.add('keyboard-highlight');
            setTimeout(() => element.classList.remove('keyboard-highlight'), 300);
        });
    }
}

// Function to detect if the device is a mobile device
function isMobileDevice() {
    // Prioritize pointer type check as it's most reliable for touch interfaces, but also ensure small screen
    if (window.matchMedia('(pointer: coarse)').matches && window.matchMedia('(max-width: 760px)').matches) {
        return true;
    }

    // Secondary check: Touch capability, plus small screen
    if (('ontouchstart' in window || navigator.maxTouchPoints > 0) && window.matchMedia('(max-width: 760px)').matches) {
        return true;
    }

    // Tertiary check: User Agent
    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
        return true;
    }

    // Final check: Screen size
    return window.matchMedia('(max-width: 760px)').matches;
}

// Add box icons
function addBoxIcons() {
    // Icon configuration for each box type
    const boxIcons = {
        'legal-box': { icon: 'scale', label: 'Legal text', collapsible: true },
        'explanatory-box': { icon: 'lightbulb', label: 'Explanation', collapsible: true },
        'recital': { icon: 'info', label: 'Recital', collapsible: true },
        'kpi-box': { icon: 'goal', label: 'Key Performance Indicator', collapsible: true },
        'disclaimer-box': { icon: 'triangle-alert', label: 'Important disclaimer', collapsible: true }
    };

    // Process each box type
    Object.entries(boxIcons).forEach(([boxClass, { icon, label, collapsible }]) => {
        document.querySelectorAll(`.${boxClass}`).forEach(box => {
            const heading = box.querySelector('h4, h5');
            if (heading) {
                // Create header content wrapper if it doesn't exist
                let headerContent = heading.querySelector('.header-content');
                if (!headerContent) {
                    headerContent = document.createElement('div');
                    headerContent.className = 'header-content';

                    // Move existing content into the wrapper
                    while (heading.firstChild) {
                        headerContent.appendChild(heading.firstChild);
                    }
                }

                // Create icon element
                const iconWrapper = document.createElement('span');
                iconWrapper.className = 'box-icon';
                iconWrapper.setAttribute('aria-hidden', 'true');

                const iconElement = document.createElement('i');
                iconElement.setAttribute('data-lucide', icon);

                iconWrapper.appendChild(iconElement);

                // Add arrow for collapsible boxes
                if (collapsible) {
                    const arrowSpan = document.createElement('span');
                    arrowSpan.className = 'toggle-arrow';
                    arrowSpan.textContent = '▼';
                    headerContent.appendChild(arrowSpan);
                }

                // Insert icon at the start of the header content
                headerContent.insertBefore(iconWrapper, headerContent.firstChild);
                heading.appendChild(headerContent);

                // Update ARIA label to include the box type
                const existingLabel = heading.getAttribute('aria-label') || heading.textContent;
                heading.setAttribute('aria-label', `${label}: ${existingLabel}`);

                // Wrap content for explanatory boxes
                if (boxClass === 'explanatory-box') {
                    const content = document.createElement('div');
                    content.className = 'explanatory-content';
                    while (box.lastChild !== heading) {
                        content.appendChild(box.lastChild);
                    }
                    box.appendChild(content);
                }
            }
        });
    });

    // Recreate Lucide icons
    lucide.createIcons();
}

// Function to toggle a collapsible box
function toggleBox(box, force = null) {
    const isExpanded = force !== null ? force : box.getAttribute('aria-expanded') === 'true';
    const newState = force !== null ? force : !isExpanded;

    box.setAttribute('aria-expanded', newState);
    box.classList.toggle('collapsed', !newState);
}

// Function to toggle all boxes
function toggleAllBoxes(force = null) {
    const boxes = document.querySelectorAll('.kpi-box, .explanatory-box, .disclaimer-box, .legal-box');
    boxes.forEach(box => {
        toggleBox(box, force);
    });
}

// Navigation functionality
document.addEventListener('DOMContentLoaded', () => {
    // Add box icons
    addBoxIcons();

    const nav = document.querySelector('.side-nav');
    const toggle = document.querySelector('.nav-toggle');
    const navContent = document.getElementById('nav-content');
    const mainContent = document.querySelector('.main-content');
    const mediaQuery = window.matchMedia('(min-width: 1024px)');

    // Navigation text mapping
    const navTextMap = {
        'Opening statement by the Chairs and Vice-Chairs': 'Introduction',
        'Key features of the development process of the Code include:': 'Introduction',
        'Drafting plan, principles, and assumptions': 'Introduction',
        'Below are some high-level principles we follow when drafting the Code:': 'Introduction',
        'The Objectives of the Code are as follows:': null // Setting to null will exclude this item
    };

    // Enhanced observer callback for navigation highlighting
    const observerCallback = (entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                updateActiveNavItem(entry.target);
            }
        });
    };

    // Create a more precise observer for navigation
    const observer = new IntersectionObserver(observerCallback, {
        rootMargin: '-20% 0px -70% 0px',
        threshold: [0, 0.1, 0.5, 1]  // Observe at multiple thresholds for better accuracy
    });

    // Build navigation from content
    function buildNavigation() {
        const navList = document.createElement('ul');
        navList.setAttribute('role', 'navigation');
        navList.setAttribute('aria-label', 'Document sections');

        // Get all headlines, excluding those in special boxes
        const headlines = Array.from(mainContent.querySelectorAll('h2, h3, h4'))
            .filter(heading => !heading.closest('.kpi-box, .explanatory-box, .legal-box, .disclaimer-box, .recital'));

        // Create a stack to keep track of parent lists at each level
        const listStack = {
            1: navList, // h2 level
            2: null,    // h3 level
            3: null     // h4 level
        };

        // Process each headline
        headlines.forEach(heading => {
            // Get heading level (2 for h2, 3 for h3, etc.)
            const level = parseInt(heading.tagName[1]) - 1;

            // Create unique ID for the heading if it doesn't have one
            if (!heading.id) {
                heading.id = heading.textContent.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-');
            }

            // Create list item and link
            const li = document.createElement('li');
            li.setAttribute('role', 'none');
            const link = document.createElement('a');
            link.href = `#${heading.id}`;
            link.setAttribute('role', 'menuitem');
            link.textContent = heading.textContent.trim();
            li.appendChild(link);

            // Create a new sublist if this heading might have children
            if (level < 3) {
                const subList = document.createElement('ul');
                subList.setAttribute('role', 'menu');
                subList.setAttribute('aria-label', `Subsections of ${link.textContent}`);
                li.appendChild(subList);
                listStack[level + 1] = subList;
            }

            // Add the list item to the appropriate parent list
            listStack[level].appendChild(li);

            // Observe this heading for intersection
            observer.observe(heading);
        });

        // Add special sections (Glossary and Recitals) at the end
        const specialSections = [
            { selector: '.glossary', text: 'Glossary', id: 'glossary' },
            { selector: '.recitals-full', text: 'Recitals', id: 'recitals-full' }
        ];

        specialSections.forEach(({ selector, text, id }) => {
            const section = document.querySelector(selector);
            if (section) {
                // Ensure the section has the correct ID
                section.id = id;

                const li = document.createElement('li');
                li.setAttribute('role', 'none');
                const link = document.createElement('a');
                link.href = `#${id}`;
                link.setAttribute('role', 'menuitem');
                link.textContent = text;
                li.appendChild(link);
                navList.appendChild(li);
                observer.observe(section);
            }
        });

        // Clear and update navigation
        while (navContent.children.length > 1) { // Keep the nav header
            navContent.removeChild(navContent.lastChild);
        }
        navContent.appendChild(navList);
    }

    // Build initial navigation
    buildNavigation();

    // Add anchor links to headlines
    function addAnchorLinks() {
        // Only select headlines that are not inside boxes
        const headlines = mainContent.querySelectorAll('h2:not(.kpi-box *, .explanatory-box *, .legal-box *, .disclaimer-box *, .recital *), h3:not(.kpi-box *, .explanatory-box *, .legal-box *, .disclaimer-box *, .recital *), h4:not(.kpi-box *, .explanatory-box *, .legal-box *, .disclaimer-box *, .recital *), h5:not(.kpi-box *, .explanatory-box *, .legal-box *, .disclaimer-box *, .recital *)');
        const feedback = document.createElement('div');
        feedback.className = 'copy-feedback';
        document.body.appendChild(feedback);

        // Keep track of used IDs to ensure uniqueness
        const usedIds = new Set();

        headlines.forEach(headline => {
            // Skip if headline is inside a box
            if (headline.closest('.kpi-box, .explanatory-box, .legal-box, .disclaimer-box, .recital')) {
                return;
            }

            // Create base ID from text content
            let baseId = headline.textContent.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-');

            // If no ID exists, create a unique one
            if (!headline.id) {
                let uniqueId = baseId;
                let counter = 1;

                // If this ID is already used, append a number until we find a unique one
                while (usedIds.has(uniqueId)) {
                    uniqueId = `${baseId}-${counter}`;
                    counter++;
                }

                headline.id = uniqueId;
                usedIds.add(uniqueId);
            } else {
                // If headline already has an ID, still track it to ensure uniqueness
                usedIds.add(headline.id);
            }

            // Create anchor link
            const anchor = document.createElement('a');
            anchor.className = 'anchor-link';
            anchor.setAttribute('aria-label', 'Copy link to this section');
            anchor.href = `#${headline.id}`;

            // Add Lucide icon
            const icon = document.createElement('i');
            icon.setAttribute('data-lucide', 'anchor');
            anchor.appendChild(icon);

            // Function to handle copying
            const copyLink = (e) => {
                e.preventDefault();
                const url = new URL(window.location.href);
                url.hash = headline.id;
                navigator.clipboard.writeText(url.toString()).then(() => {
                    feedback.textContent = 'Link copied to clipboard!';
                    feedback.classList.add('active');
                    setTimeout(() => feedback.classList.remove('active'), 2000);
                }).catch(() => {
                    feedback.textContent = 'Failed to copy link. Please try again.';
                    feedback.classList.add('active');
                    setTimeout(() => feedback.classList.remove('active'), 2000);
                });
            };

            // Add click handler to both headline and anchor
            headline.addEventListener('click', copyLink);
            anchor.addEventListener('click', copyLink);

            // Insert anchor at the start of the headline
            headline.insertBefore(anchor, headline.firstChild);
        });

        // Create Lucide icons
        lucide.createIcons();
    }

    // Add anchor links after building navigation
    addAnchorLinks();

    // Function to toggle menu
    function toggleMenu(force = null) {
        const isExpanded = force !== null ? force : toggle.getAttribute('aria-expanded') === 'true';
        const newState = force !== null ? force : !isExpanded;

        toggle.setAttribute('aria-expanded', newState);
        nav.classList.toggle('active', newState);

        // Announce to screen readers
        const announcement = document.createElement('div');
        announcement.setAttribute('aria-live', 'polite');
        announcement.setAttribute('class', 'sr-only');
        announcement.textContent = `Navigation menu ${newState ? 'opened' : 'closed'}`;
        document.body.appendChild(announcement);
        setTimeout(() => announcement.remove(), 1000);
    }

    // Close menu
    function closeMenu() {
        toggleMenu(false);
    }

    // Open menu
    function openMenu() {
        toggleMenu(true);
    }

    // Toggle navigation
    toggle.addEventListener('click', () => toggleMenu());

    // Close navigation when clicking outside
    document.addEventListener('click', (e) => {
        if (!nav.contains(e.target) && !toggle.contains(e.target)) {
            closeMenu();
        }
    });

    // Handle keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeMenu();
        }
    });

    // Set initial state based on screen size
    if (mediaQuery.matches) {
        openMenu(); // Start open on desktop
    }

    // Handle resize events - only set initial state when changing between mobile/desktop
    let wasDesktop = mediaQuery.matches;
    mediaQuery.addEventListener('change', (e) => {
        if (e.matches !== wasDesktop) {
            toggleMenu(e.matches); // Open on desktop, close on mobile
            wasDesktop = e.matches;
        }
    });

    // Hide headline and commitment shortcuts on mobile
    if (isMobileDevice()) {
        const keyboardShortcuts = document.querySelector('.keyboard-shortcuts');
        const shortcutsList = keyboardShortcuts.querySelector('ul');
        if (shortcutsList) {
            // Hide headline and commitment rows
            Array.from(shortcutsList.children).forEach(item => {
                if (item.textContent.toLowerCase().includes('headline') ||
                    item.textContent.toLowerCase().includes('commitment')) {
                    item.style.display = 'none';
                }
            });
        }
    }

    // Add click handler to navigation links
    navContent.addEventListener('click', (e) => {
        const link = e.target.closest('a');
        if (link) {
            e.preventDefault();
            const targetId = link.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            if (targetElement) {
                // Prevent any default scrolling
                e.preventDefault();
                scrollToElement(targetElement);
            }
        }
    });

    // Handle initial state and URL hash
    function handleInitialState() {
        if (window.location.hash) {
            const escapedHash = window.location.hash.replace(/\./g, '\\.');
            const targetElement = document.querySelector(escapedHash);
            if (targetElement) {
                setTimeout(() => {
                    scrollToElement(targetElement, false);
                }, 100);
            }
        } else {
            updateActiveNavItem(document.querySelector('h1, h2, h3, h4'));
        }
    }

    // Call initial state handler after building navigation
    handleInitialState();

    // Add scroll handler with debounce
    let scrollTimeout;
    window.addEventListener('scroll', () => {
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
            updateActiveNavItem();
        }, 100);
    });

    // Add click handlers to collapsible boxes
    document.querySelectorAll('.kpi-box, .explanatory-box, .disclaimer-box, .legal-box').forEach(box => {
        const header = box.querySelector('h4, h5');
        if (header) {
            // Initialize aria-expanded attribute
            box.setAttribute('aria-expanded', 'true');
            header.addEventListener('click', () => {
                toggleBox(box);
            });
        }
    });
});

// Dark mode functionality
function setDarkMode(isDark) {
    document.body.classList.toggle('dark-mode', isDark);
}

// Check system preference
if (window.matchMedia) {
    const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setDarkMode(darkModeMediaQuery.matches);
    darkModeMediaQuery.addEventListener('change', e => setDarkMode(e.matches));
}

// Recitals functionality
document.addEventListener('DOMContentLoaded', () => {
    const recitals = document.querySelectorAll('.main-content .recital');
    const recitalsFullSection = document.querySelector('.recitals-full');
    let recitalsExpanded = true;

    // Clear any existing recitals in the full section
    while (recitalsFullSection.children.length > 1) { // Keep the h2
        recitalsFullSection.removeChild(recitalsFullSection.lastChild);
    }

    // Clone each recital to the full section
    recitals.forEach((recital, index) => {
        const number = index + 1;

        // Add header if it doesn't exist in original recital
        let originalHeader = recital.querySelector('h4');
        if (!originalHeader) {
            originalHeader = document.createElement('h4');
            recital.insertBefore(originalHeader, recital.firstChild);
        }

        // Create header content wrapper
        const headerContent = document.createElement('div');
        headerContent.className = 'header-content';

        // Create icon element
        const iconWrapper = document.createElement('span');
        iconWrapper.className = 'box-icon';
        iconWrapper.setAttribute('aria-hidden', 'true');

        const iconElement = document.createElement('i');
        iconElement.setAttribute('data-lucide', 'quote');

        iconWrapper.appendChild(iconElement);
        headerContent.appendChild(iconWrapper);

        // Create text node for recital number
        const textNode = document.createTextNode(`Recital ${number}`);
        headerContent.appendChild(textNode);

        // Create arrow span
        const arrowSpan = document.createElement('span');
        arrowSpan.className = 'toggle-arrow';
        arrowSpan.textContent = '▼';
        headerContent.appendChild(arrowSpan);

        // Clear header and add new content
        originalHeader.textContent = '';
        originalHeader.appendChild(headerContent);
        originalHeader.dataset.recitalNumber = number;

        const recitalClone = recital.cloneNode(true);
        const recitalId = `in-text-recital-${number}`;
        recital.id = recitalId;

        // Modify the clone for the summary section
        recitalClone.classList.add('full-section-recital');
        const header = recitalClone.querySelector('h4');
        header.textContent = '';
        header.dataset.recitalNumber = number;

        // Create header content for the summary section
        const summaryHeaderContent = document.createElement('div');
        summaryHeaderContent.className = 'header-content';

        // Create icon element for summary
        const summaryIconWrapper = document.createElement('span');
        summaryIconWrapper.className = 'box-icon';
        summaryIconWrapper.setAttribute('aria-hidden', 'true');

        const summaryIconElement = document.createElement('i');
        summaryIconElement.setAttribute('data-lucide', 'quote');

        summaryIconWrapper.appendChild(summaryIconElement);
        summaryHeaderContent.appendChild(summaryIconWrapper);

        // Create text node for recital number in summary
        const summaryTextNode = document.createTextNode(`Recital ${number}`);
        summaryHeaderContent.appendChild(summaryTextNode);

        // Add the header content to the summary header
        header.appendChild(summaryHeaderContent);

        // Create a link wrapper
        const linkWrapper = document.createElement('a');
        linkWrapper.href = `#${recitalId}`;
        linkWrapper.classList.add('recital-link');

        // Move recital content inside the link
        while (recitalClone.firstChild) {
            linkWrapper.appendChild(recitalClone.firstChild);
        }
        recitalClone.appendChild(linkWrapper);

        recitalsFullSection.appendChild(recitalClone);
    });

    // Create Lucide icons
    lucide.createIcons();

    // Function to toggle a single recital
    function toggleRecital(recital, force = null) {
        const isExpanded = force !== null ? force : recital.getAttribute('aria-expanded') === 'true';
        const newState = force !== null ? force : !isExpanded;

        recital.setAttribute('aria-expanded', newState);
        recital.classList.toggle('collapsed', !newState);

        const content = recital.querySelector('[id^="recital-"]');
        if (content) {
            content.style.display = newState ? 'block' : 'none';
        }
    }

    // Add click handlers to main content recitals only
    document.querySelectorAll('.recital:not(.full-section-recital)').forEach(recital => {
        const header = recital.querySelector('h4');
        header.addEventListener('click', () => {
            toggleRecital(recital);
        });
    });

    // Handle clicks on recital links in summary section
    document.querySelectorAll('.recital-link').forEach(link => {
        link.addEventListener('click', (e) => {
            const targetId = link.getAttribute('href').substring(1);
            const targetRecital = document.getElementById(targetId);
            if (targetRecital) {
                // Ensure the target recital is expanded
                toggleRecital(targetRecital, true);
                // Smooth scroll with offset
                e.preventDefault();
                const offset = 100;
                const targetPosition = targetRecital.getBoundingClientRect().top + window.pageYOffset - offset;
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
                // Visual feedback
                targetRecital.classList.add('highlight');
                setTimeout(() => targetRecital.classList.remove('highlight'), 2000);
            }
        });
    });

    // Global recital toggle (keyboard shortcut '4')
    document.addEventListener('keydown', (e) => {
        if (e.key === '4') {
            e.preventDefault();
            recitalsExpanded = !recitalsExpanded;
            document.querySelectorAll('.recital:not(.full-section-recital)').forEach(recital => {
                toggleRecital(recital, recitalsExpanded);
            });
        }
    });
});

// Glossary functionality
document.addEventListener('DOMContentLoaded', () => {
    // Extract all glossary terms
    const glossaryList = document.querySelector('.glossary-list');
    const glossaryTerms = document.querySelectorAll('.glossary-term');
    const tooltip = document.createElement('div');
    tooltip.className = 'glossary-tooltip';
    document.body.appendChild(tooltip);

    // Create map of terms and their IDs
    const termMap = new Map();
    let termCounter = 1;

    // Helper function to escape special regex characters
    function escapeRegExp(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    // Helper function to create a valid ID from a term
    function createValidId(term) {
        return term.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    }

    // First pass: create the map of terms
    glossaryList.querySelectorAll('dt').forEach(term => {
        const originalTerm = term.textContent.trim();
        const id = term.id.replace('term-', '');
        termMap.set(originalTerm.toLowerCase(), {
            id: id,
            originalTerm: originalTerm,
            number: termCounter++,
            definition: term.nextElementSibling.textContent
        });
    });

    // Function to automatically tag glossary terms in text
    function autoTagGlossaryTerms(element) {
        // Skip if element is in excluded areas
        if (element.closest('.glossary, .side-nav, .nav-content, a, code, pre')) {
            return;
        }

        // Process each text-containing element separately
        const textElements = element.querySelectorAll('p, li');  // Removed h1, h2, h3, h4, h5, h6 from selection
        textElements.forEach(textElement => {
            // Track which terms have been tagged in this specific element
            const taggedTerms = new Set();

            const walker = document.createTreeWalker(
                textElement,
                NodeFilter.SHOW_TEXT,
                {
                    acceptNode: function (node) {
                        // Skip if parent is in excluded elements
                        if (node.parentElement.closest('.glossary, .side-nav, .nav-content, a, code, pre')) {
                            return NodeFilter.FILTER_REJECT;
                        }
                        return NodeFilter.FILTER_ACCEPT;
                    }
                }
            );

            const nodesToReplace = [];
            while (walker.nextNode()) {
                nodesToReplace.push(walker.currentNode);
            }

            nodesToReplace.forEach(textNode => {
                let text = textNode.nodeValue;
                let newHtml = text;

                // Sort terms by length (longest first) to handle overlapping terms
                const sortedTerms = Array.from(termMap.keys())
                    .sort((a, b) => b.length - a.length)
                    .map(term => ({
                        term: term,
                        info: termMap.get(term)
                    }));

                // Create a temporary div to hold the HTML while we process it
                const tempDiv = document.createElement('div');
                tempDiv.textContent = text;
                let currentHtml = tempDiv.innerHTML;

                // Process each term
                sortedTerms.forEach(({ term, info }) => {
                    // Skip if this term has already been tagged in this element
                    if (taggedTerms.has(term)) {
                        return;
                    }

                    const escapedTerm = escapeRegExp(term);
                    // Match whole words only, accounting for word boundaries and spaces
                    const regex = new RegExp(`(?<=^|[^a-zA-Z0-9-])${escapedTerm}(?=$|[^a-zA-Z0-9-])`, 'gi');

                    // Only replace the first occurrence
                    let hasReplaced = false;
                    currentHtml = currentHtml.replace(regex, (match) => {
                        if (hasReplaced) {
                            return match; // Return unchanged for subsequent matches
                        }
                        hasReplaced = true;
                        taggedTerms.add(term); // Mark this term as tagged
                        return `<a href="#term-${info.id}" class="glossary-term">${match}<span class="glossary-ref">${info.number}</span></a>`;
                    });
                });

                if (currentHtml !== tempDiv.innerHTML) {
                    const fragment = document.createRange().createContextualFragment(currentHtml);
                    textNode.parentNode.replaceChild(fragment, textNode);
                }
            });
        });
    }

    // Apply auto-tagging to main content
    const mainContent = document.querySelector('.main-content');
    autoTagGlossaryTerms(mainContent);

    // Function to add event listeners to glossary terms
    function addGlossaryTermListeners() {
        const allGlossaryTerms = document.querySelectorAll('.glossary-term');
        const isDeviceMobile = isMobileDevice();
        let touchStartTime = 0;
        let touchStartTarget = null;

        allGlossaryTerms.forEach(term => {
            if (isDeviceMobile) {
                // Mobile-only handlers
                term.addEventListener('touchstart', (e) => {
                    touchStartTime = Date.now();
                    touchStartTarget = e.target;
                }, { passive: true });

                term.addEventListener('touchend', (e) => {
                    const touchDuration = Date.now() - touchStartTime;
                    // Only handle quick taps (less than 300ms) and ensure it's the same target
                    if (touchDuration < 300 && e.target === touchStartTarget) {
                        e.preventDefault();
                        e.stopPropagation();

                        // Toggle tooltip
                        if (currentTerm === term) {
                            hideTooltip();
                        } else {
                            showTooltip(term);
                        }
                    }
                    touchStartTarget = null;
                });

                // Prevent any click events on mobile
                term.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                }, { capture: true });
            } else {
                // Desktop-only hover handler
                term.addEventListener('mouseenter', () => {
                    showTooltip(term);
                });

                term.addEventListener('mouseleave', () => {
                    hideTooltip();
                });

                // Prevent default click behavior on desktop
                term.addEventListener('click', (e) => {
                    e.preventDefault();
                });
            }
        });

        // Document click handler only for mobile
        if (isDeviceMobile) {
            document.addEventListener('click', (e) => {
                // Only hide if clicking outside tooltip and term
                if (currentTerm && !e.target.closest('.glossary-term, .glossary-tooltip')) {
                    hideTooltip();
                }
            }, { capture: true });

            // Prevent scroll-triggered touches from activating tooltips
            let isScrolling;
            document.addEventListener('scroll', () => {
                window.clearTimeout(isScrolling);
                isScrolling = setTimeout(() => {
                    touchStartTarget = null;
                }, 100);
            }, { passive: true });
        }
    }

    // Add event listeners after creating the terms
    addGlossaryTermListeners();

    let currentTerm = null;

    function showTooltip(term) {
        const termId = term.getAttribute('href').substring(6);
        // Don't do anything if this term is already showing
        if (currentTerm === term) {
            return;
        }

        // Only hide existing tooltip if we're showing a different one
        if (currentTerm) {
            hideTooltip();
        }

        // Find the term info by ID
        const termInfo = Array.from(termMap.values()).find(info => info.id === termId);

        if (termInfo) {
            currentTerm = term;

            // Set up ARIA relationships
            const tooltipId = `tooltip-${termId}`;
            tooltip.id = tooltipId;
            term.setAttribute('aria-describedby', tooltipId);

            tooltip.innerHTML = `
                    <div class="glossary-tooltip-header" role="tooltip">
                        <span class="glossary-tooltip-term" id="tooltip-term-${termId}">${termInfo.originalTerm} [${termInfo.number}]</span>
                    </div>
                    <div class="glossary-tooltip-content" role="definition" aria-labelledby="tooltip-term-${termId}">
                        ${termInfo.definition}
                    </div>
                `;

            tooltip.setAttribute('role', 'tooltip');
            tooltip.classList.add('active');
            positionTooltip(term);

            // Announce to screen readers
            const announcement = document.createElement('div');
            announcement.setAttribute('aria-live', 'polite');
            announcement.setAttribute('class', 'sr-only');
            announcement.textContent = `Glossary definition for ${termInfo.originalTerm}: ${termInfo.definition}`;
            document.body.appendChild(announcement);
            setTimeout(() => announcement.remove(), 1000);
        }
    }

    function hideTooltip() {
        if (currentTerm) {
            currentTerm.removeAttribute('aria-describedby');
        }
        tooltip.classList.remove('active');
        currentTerm = null;
    }

    function positionTooltip(term) {
        // On mobile, we don't need to calculate position since it's fixed at bottom
        if (isMobileDevice()) {
            return;
        }

        // Only calculate position for desktop
        const rect = term.getBoundingClientRect();
        const tooltipWidth = 300; // Fixed width for calculation
        const windowWidth = window.innerWidth;

        // Calculate the best position
        let left = rect.right + 10; // Default: 10px to the right of the term

        // If tooltip would overflow right edge, try left side of term
        if (left + tooltipWidth > windowWidth - 20) {
            left = rect.left - tooltipWidth - 10;
        }

        // If both right and left overflow, center on screen
        if (left < 20) {
            left = Math.max(20, (windowWidth - tooltipWidth) / 2);
        }

        const top = rect.top + window.scrollY - 10;

        // Batch the style updates
        requestAnimationFrame(() => {
            tooltip.style.position = 'absolute';
            tooltip.style.top = `${top}px`;
            tooltip.style.left = `${left}px`;
            tooltip.style.right = 'auto';
            tooltip.style.marginRight = '0';
        });
    }

    // Update tooltip position on scroll and resize
    window.addEventListener('scroll', () => {
        if (currentTerm) {
            positionTooltip(currentTerm);
        }
    });

    window.addEventListener('resize', () => {
        if (currentTerm) {
            positionTooltip(currentTerm);
        }
    });
});

// Theme handling
const themeSelect = document.getElementById('theme-select');
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');

// Load saved theme preference
const savedTheme = localStorage.getItem('theme') || 'system';
themeSelect.value = savedTheme;
themeSelect.setAttribute('value', savedTheme);

function setTheme(theme) {
    // First remove any existing theme classes
    document.body.classList.remove('light-mode', 'dark-mode');

    if (theme === 'system') {
        // For system theme, apply dark mode based on system preference
        if (prefersDark.matches) {
            document.body.classList.add('dark-mode');
        } else {
            document.body.classList.add('light-mode');
        }
    } else {
        // For explicit theme choice, apply the selected theme
        document.body.classList.add(`${theme}-mode`);
    }

    // Announce theme change to screen readers
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
    const theme = e.target.value;
    themeSelect.setAttribute('value', theme); // Update value attribute
    themeSelect.setAttribute('aria-label', `Current theme: ${theme}`);
    setTheme(theme);
    localStorage.setItem('theme', theme);
});

// Handle system theme changes
prefersDark.addEventListener('change', (e) => {
    if (themeSelect.value === 'system') {
        setTheme('system');
    }
});

// Keyboard Navigation
document.addEventListener('DOMContentLoaded', () => {
    const mainContent = document.querySelector('.main-content');
    const nav = document.querySelector('.side-nav');
    const toggle = document.querySelector('.nav-toggle');

    // Add click handlers for shortcut buttons
    document.querySelectorAll('.shortcut-btn').forEach(button => {
        // Add descriptive ARIA labels
        const key = button.dataset.key;
        const action = button.textContent.replace(/[↑↓←→]|\d/g, '').trim();
        button.setAttribute('aria-label', `Press ${key} to ${action}`);

        button.addEventListener('click', (e) => {
            e.preventDefault();
            // Create a synthetic keyboard event
            const keyEvent = new KeyboardEvent('keydown', {
                key: button.dataset.key,
                bubbles: true,
                cancelable: true
            });
            // Dispatch the event to trigger the existing keyboard handler
            document.dispatchEvent(keyEvent);

            // Announce action to screen readers
            const announcement = document.createElement('div');
            announcement.setAttribute('aria-live', 'polite');
            announcement.setAttribute('class', 'sr-only');
            announcement.textContent = `Executing keyboard shortcut: ${action}`;
            document.body.appendChild(announcement);
            setTimeout(() => announcement.remove(), 1000);
        });
    });

    // Store previous positions for jump-back functionality
    let navigationDepthLevel = 3; // Track navigation depth level (3 = all, 2 = commitments+sections, 1 = commitments only)

    // Helper function to find next/previous element
    function findNextPrevElement(selector, forward = true, startElement = null) {
        const elements = Array.from(mainContent.querySelectorAll(selector));
        if (!elements.length) return null;

        if (!startElement) {
            return forward ? elements[0] : elements[elements.length - 1];
        }

        const currentIndex = elements.indexOf(startElement);
        if (currentIndex === -1) {
            const currentY = startElement.getBoundingClientRect().top;
            const nextElement = forward
                ? elements.find(el => el.getBoundingClientRect().top > currentY)
                : elements.reverse().find(el => el.getBoundingClientRect().top < currentY);
            return nextElement || (forward ? elements[0] : elements[elements.length - 1]);
        }

        const nextIndex = forward ? currentIndex + 1 : currentIndex - 1;
        return elements[nextIndex] || (forward ? elements[0] : elements[elements.length - 1]);
    }

    // Helper function to toggle navigation depth
    function toggleNavigationDepth() {
        // Cycle through levels: 3 -> 2 -> 1 -> 3
        navigationDepthLevel = navigationDepthLevel > 1 ? navigationDepthLevel - 1 : 3;

        // Get all navigation sublists
        const navLists = document.querySelectorAll('#nav-content ul ul');

        navLists.forEach(list => {
            const depth = getListDepth(list);
            list.style.display = depth <= navigationDepthLevel ? 'block' : 'none';
        });

        // Announce to screen readers
        const announcement = document.createElement('div');
        announcement.setAttribute('aria-live', 'polite');
        announcement.setAttribute('class', 'sr-only');
        announcement.textContent = `Navigation depth level ${navigationDepthLevel}`;
        document.body.appendChild(announcement);
        setTimeout(() => announcement.remove(), 1000);
    }

    // Helper function to get the depth of a list in the navigation
    function getListDepth(list) {
        let depth = 0;
        let parent = list;
        while (parent && parent.tagName === 'UL') {
            depth++;
            parent = parent.parentElement.closest('ul');
        }
        return depth;
    }

    // Keyboard event handler
    document.addEventListener('keydown', (e) => {
        // Ignore if user is typing in an input
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

        const activeElement = document.activeElement;
        const key = e.key.toLowerCase();

        // Handle return to previous position for number keys
        if (['1', '2', '3'].includes(key) && key === lastJumpKey && previousPosition !== null) {
            e.preventDefault();
            window.scrollTo({
                top: previousPosition,
                behavior: 'smooth'
            });
            previousPosition = null;
            lastJumpKey = null;
            return;
        }

        switch (key) {
            case 'arrowup':
            case 'arrowdown':
                e.preventDefault();
                // Include all headlines, including those in boxes
                const nextHeading = findNextPrevElement('h1, h2, h3, h4, h5, .kpi-box h5, .legal-box h4, .explanatory-box h4, .disclaimer-box h4', key === 'arrowdown', activeElement);
                if (nextHeading) {
                    scrollToElement(nextHeading);
                }
                break;

            case 'arrowleft':
            case 'arrowright':
                e.preventDefault();
                const commitmentSelector = 'h2[id^="commitment"], h3[id^="commitment"]';
                const nextCommitment = findNextPrevElement(commitmentSelector, key === 'arrowright', activeElement);
                scrollToElement(nextCommitment);
                break;

            case '1':
                e.preventDefault();
                previousPosition = window.scrollY;
                window.scrollTo({ top: 0, behavior: 'smooth' });
                lastJumpKey = '1';
                break;

            case '2':
                e.preventDefault();
                const glossary = document.querySelector('.glossary');
                scrollToElement(glossary);
                lastJumpKey = '2';
                break;

            case '3':
                e.preventDefault();
                const recitalsSection = document.querySelector('.recitals-full');
                scrollToElement(recitalsSection);
                lastJumpKey = '3';
                break;

            case '4':
                e.preventDefault();
                toggleAllBoxes();
                break;

            case '5':
                e.preventDefault();
                toggleNavigationDepth();
                break;

            case '0':
                e.preventDefault();
                if (nav.classList.contains('active')) {
                    nav.classList.remove('active');
                    toggle.setAttribute('aria-expanded', 'false');
                } else {
                    nav.classList.add('active');
                    toggle.setAttribute('aria-expanded', 'true');
                }
                break;

            case 'escape':
                if (nav.classList.contains('active')) {
                    nav.classList.remove('active');
                    toggle.setAttribute('aria-expanded', 'false');
                }
                // Close any open tooltips
                document.querySelectorAll('.glossary-tooltip.active').forEach(tooltip => {
                    tooltip.classList.remove('active');
                });
                break;
        }
    });

    // Add styles for keyboard navigation
    const style = document.createElement('style');
    style.textContent = `
            .keyboard-highlight {
                outline: 3px solid #1971c2;
                outline-offset: 4px;
                border-radius: 2px;
            }
            .sr-only {
                position: absolute;
                width: 1px;
                height: 1px;
                padding: 0;
                margin: -1px;
                overflow: hidden;
                clip: rect(0, 0, 0, 0);
                border: 0;
            }
            @media (prefers-color-scheme: dark) {
                .keyboard-highlight {
                    outline-color: #4fc3f7;
                }
            }
        `;
    document.head.appendChild(style);
});

// Keyboard shortcuts collapse functionality
const collapseToggle = document.querySelector('.collapse-toggle');
const shortcutsContent = document.getElementById('keyboard-shortcuts-content');
const shortcutsHeader = document.querySelector('.keyboard-shortcuts-header');

// Load saved state
const isExpanded = localStorage.getItem('keyboardShortcutsExpanded') !== 'false';
collapseToggle.setAttribute('aria-expanded', isExpanded);
shortcutsContent.classList.toggle('collapsed', !isExpanded);

collapseToggle.setAttribute('aria-label', 'Toggle keyboard shortcuts visibility');
shortcutsContent.setAttribute('role', 'region');
shortcutsContent.setAttribute('aria-label', 'Keyboard shortcuts list');

// Function to toggle shortcuts
function toggleShortcuts() {
    const isCurrentlyExpanded = collapseToggle.getAttribute('aria-expanded') === 'true';
    const newExpandedState = !isCurrentlyExpanded;

    collapseToggle.setAttribute('aria-expanded', newExpandedState);
    shortcutsContent.classList.toggle('collapsed', !newExpandedState);

    // Save state
    localStorage.setItem('keyboardShortcutsExpanded', newExpandedState);

    // Announce to screen readers
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('class', 'sr-only');
    announcement.textContent = `Keyboard shortcuts ${newExpandedState ? 'expanded' : 'collapsed'}`;
    document.body.appendChild(announcement);
    setTimeout(() => announcement.remove(), 1000);
}

// Add click handlers to both the toggle button and the header
collapseToggle.addEventListener('click', (e) => {
    e.stopPropagation(); // Prevent double-triggering from header click
    toggleShortcuts();
});

shortcutsHeader.addEventListener('click', toggleShortcuts); 