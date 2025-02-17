// Navigation functionality
document.addEventListener('DOMContentLoaded', () => {
    const nav = document.querySelector('.side-nav');
    const toggle = document.querySelector('.nav-toggle');
    const navContent = document.getElementById('nav-content');
    const mainContent = document.querySelector('.main-content');
    const mediaQuery = window.matchMedia('(min-width: 1024px)');

    // Navigation text mapping
    const navTextMap = {
        'Opening statement by the Chairs and Vice-Chairs': 'Opening statement',
        'Key features of the development process of the Code include:': 'CoP development process',
        'Drafting plan, principles, and assumptions': 'Drafting plan',
        'Below are some high-level principles we follow when drafting the Code:': 'Drafting principles',
        'The Objectives of the Code are as follows:': 'Objectives'
    };

    // Highlight current section in navigation
    const observerCallback = (entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.id;
                const navLink = navContent.querySelector(`a[href="#${id}"]`);
                if (navLink) {
                    navContent.querySelectorAll('a').forEach(a => a.classList.remove('active'));
                    navLink.classList.add('active');
                }
            }
        });
    };

    const observer = new IntersectionObserver(observerCallback, {
        rootMargin: '-20% 0px -70% 0px'
    });

    // Build navigation from content
    function buildNavigation() {
        const navList = document.createElement('ul');
        const mainContent = document.querySelector('.main-content');

        // Get all main headlines (h2) and create navigation items for them
        const mainHeadings = mainContent.querySelectorAll('h2');
        mainHeadings.forEach(heading => {
            // Skip if heading is inside a box
            if (heading.closest('.info-box, .kpi-box, .explanatory-box, .legal-text, .disclaimer-box')) {
                return;
            }

            const headingId = heading.textContent.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-');
            heading.id = headingId;

            const li = document.createElement('li');
            const link = document.createElement('a');
            link.href = `#${headingId}`;
            // Use mapped text if available, otherwise use original text
            link.textContent = navTextMap[heading.textContent.trim()] || heading.textContent.trim();
            li.appendChild(link);

            // Create a sublist for this section
            const subList = document.createElement('ul');
            li.appendChild(subList);

            navList.appendChild(li);
            observer.observe(heading);

            // Process all h3 and h4 headings that come after this h2 until the next h2
            let currentNode = heading.nextElementSibling;
            while (currentNode && currentNode.tagName !== 'H2') {
                if ((currentNode.tagName === 'H3' || currentNode.tagName === 'H4') &&
                    !currentNode.closest('.info-box, .kpi-box, .explanatory-box, .legal-text, .disclaimer-box')) {

                    const subHeadingText = currentNode.textContent.trim();

                    // Skip unwanted headers and measures (they'll be handled within commitments)
                    if (!subHeadingText.toLowerCase().includes('kpi') &&
                        !subHeadingText.toLowerCase().includes('performance indicator') &&
                        !subHeadingText.toLowerCase().includes('whereas') &&
                        !subHeadingText.startsWith('Measure')) {

                        const subHeadingId = subHeadingText.toLowerCase().replace(/[^a-z0-9]+/g, '-');
                        currentNode.id = subHeadingId;

                        const subLi = document.createElement('li');
                        const subLink = document.createElement('a');
                        subLink.href = `#${subHeadingId}`;
                        // Use mapped text if available, otherwise use original text
                        subLink.textContent = navTextMap[subHeadingText] || subHeadingText;
                        subLi.appendChild(subLink);

                        // For Commitments, create a nested sublist
                        if (subHeadingText.startsWith('Commitment')) {
                            const measuresList = document.createElement('ul');
                            subLi.appendChild(measuresList);

                            // Abbreviate commitment text for navigation
                            const commitmentNumber = subHeadingText.match(/Commitment (\d+)/);
                            if (commitmentNumber) {
                                const restOfText = subHeadingText.replace(/Commitment \d+[:.]\s*/, '');
                                subLink.textContent = `C${commitmentNumber[1]} - ${restOfText}`;
                            }

                            // Look ahead for measures
                            let measureNode = currentNode.nextElementSibling;
                            while (measureNode && !measureNode.tagName.match(/^H[1-3]$/)) {
                                if (measureNode.tagName === 'H4' &&
                                    !measureNode.closest('.info-box, .kpi-box, .explanatory-box, .legal-text, .disclaimer-box')) {
                                    const measureText = measureNode.textContent.trim();
                                    if (measureText.startsWith('Measure')) {
                                        const measureId = measureText.toLowerCase().replace(/[^a-z0-9]+/g, '-');
                                        measureNode.id = measureId;

                                        const measureLi = document.createElement('li');
                                        const measureLink = document.createElement('a');
                                        measureLink.href = `#${measureId}`;

                                        // Abbreviate measure text for navigation
                                        const measureNumber = measureText.match(/Measure (\d+\.\d+)/);
                                        if (measureNumber) {
                                            const restOfText = measureText.replace(/Measure \d+\.\d+[:.]\s*/, '');
                                            measureLink.textContent = `M${measureNumber[1]} - ${restOfText}`;
                                        } else {
                                            measureLink.textContent = measureText;
                                        }

                                        measureLi.appendChild(measureLink);
                                        measuresList.appendChild(measureLi);

                                        observer.observe(measureNode);
                                    }
                                }
                                measureNode = measureNode.nextElementSibling;
                            }
                        }

                        subList.appendChild(subLi);
                        observer.observe(currentNode);
                    }
                }
                currentNode = currentNode.nextElementSibling;
            }
        });

        // Add Glossary link if it exists
        const glossarySection = document.querySelector('.glossary');
        if (glossarySection) {
            const glossaryLink = document.createElement('a');
            glossaryLink.href = '#glossary';
            glossaryLink.textContent = 'Glossary';
            const glossaryLi = document.createElement('li');
            glossaryLi.appendChild(glossaryLink);
            navList.appendChild(glossaryLi);
            observer.observe(glossarySection);
        }

        // Add Recitals link if it exists
        const recitalsSection = document.querySelector('.recitals-full');
        if (recitalsSection) {
            const recitalsLink = document.createElement('a');
            recitalsLink.href = '#recitals';
            recitalsLink.textContent = 'Recitals';
            const recitalsLi = document.createElement('li');
            recitalsLi.appendChild(recitalsLink);
            navList.appendChild(recitalsLi);
            observer.observe(recitalsSection);
        }

        // Clear and update navigation
        while (navContent.children.length > 1) { // Keep the h3 "Contents"
            navContent.removeChild(navContent.lastChild);
        }
        navContent.appendChild(navList);
    }

    // Build initial navigation
    buildNavigation();

    // Add anchor links to headlines
    function addAnchorLinks() {
        const headlines = mainContent.querySelectorAll('h2, h3, h4, h5');
        const feedback = document.createElement('div');
        feedback.className = 'copy-feedback';
        document.body.appendChild(feedback);

        headlines.forEach(headline => {
            // Create a unique ID if none exists
            if (!headline.id) {
                headline.id = headline.textContent.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-');
            }

            // Create anchor link
            const anchor = document.createElement('a');
            anchor.className = 'anchor-link';
            anchor.setAttribute('aria-label', 'Copy link to this section');
            anchor.href = `#${headline.id}`;

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

            headline.appendChild(anchor);
        });
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

        const recitalClone = recital.cloneNode(true);
        const recitalId = `in-text-recital-${number}`;
        recital.id = recitalId;

        // Update the header with just the number in the data attribute
        originalHeader.textContent = '';
        originalHeader.dataset.recitalNumber = number;

        // Modify the clone for the summary section
        recitalClone.classList.add('full-section-recital');
        const header = recitalClone.querySelector('h4');
        header.textContent = '';
        header.dataset.recitalNumber = number;

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

    // First pass: create the map of terms
    glossaryList.querySelectorAll('dt').forEach(term => {
        const id = term.id.replace('term-', '');
        termMap.set(id.toLowerCase(), {
            id: id,
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

        const walker = document.createTreeWalker(
            element,
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
            const sortedTerms = Array.from(termMap.keys()).sort((a, b) => b.length - a.length);

            // Create a regex that matches whole words only
            sortedTerms.forEach(term => {
                const regex = new RegExp(`\\b${term}\\b`, 'gi');
                const termInfo = termMap.get(term);

                newHtml = newHtml.replace(regex, (match) => {
                    return `<a href="#term-${termInfo.id}" class="glossary-term">${match}<span class="glossary-ref">${termInfo.number}</span></a>`;
                });
            });

            if (newHtml !== text) {
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = newHtml;
                const fragment = document.createDocumentFragment();
                while (tempDiv.firstChild) {
                    fragment.appendChild(tempDiv.firstChild);
                }
                textNode.parentNode.replaceChild(fragment, textNode);
            }
        });
    }

    // Apply auto-tagging to main content
    const mainContent = document.querySelector('.main-content');
    autoTagGlossaryTerms(mainContent);

    // Function to detect if the device is a mobile device
    function isMobileDevice() {
        // Primary check: User Agent for mobile devices
        const userAgentCheck = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

        // Secondary check: Touch capability
        const touchCheck = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);

        // Tertiary check: Screen size (as a fallback)
        const screenCheck = window.matchMedia('(max-width: 760px)').matches;

        // Additional check: pointer type (if supported)
        const pointerCheck = window.matchMedia?.('(pointer: coarse)').matches;

        // Consider a device mobile if:
        // 1. It's identified as a mobile device by user agent OR
        // 2. It has touch capabilities AND either has a coarse pointer or small screen
        return userAgentCheck || (touchCheck && (pointerCheck || screenCheck));
    }

    // Function to add event listeners to glossary terms
    function addGlossaryTermListeners() {
        const allGlossaryTerms = document.querySelectorAll('.glossary-term');
        const isDeviceMobile = isMobileDevice();

        allGlossaryTerms.forEach(term => {
            if (isDeviceMobile) {
                // Mobile-only tap handler
                term.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (currentTerm === term) {
                        hideTooltip();
                    } else {
                        showTooltip(term);
                    }
                });
            } else {
                // Desktop-only click and hover handlers
                term.addEventListener('click', (e) => {
                    e.preventDefault();
                    if (currentTerm === term) {
                        hideTooltip();
                    } else {
                        showTooltip(term);
                    }
                });

                term.addEventListener('mouseenter', () => showTooltip(term));
                term.addEventListener('mouseleave', (e) => {
                    // Only hide if we're not moving to the tooltip
                    if (!e.relatedTarget || !e.relatedTarget.closest('.glossary-tooltip')) {
                        hideTooltip();
                    }
                });
            }
        });

        // Desktop-only tooltip hover handling
        if (!isDeviceMobile) {
            tooltip.addEventListener('mouseleave', (e) => {
                // Only hide if we're not moving to a term
                if (!e.relatedTarget || !e.relatedTarget.closest('.glossary-term')) {
                    hideTooltip();
                }
            });
        }

        // Global click handler to close tooltip when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.glossary-term') && !e.target.closest('.glossary-tooltip')) {
                hideTooltip();
            }
        });

        // Handle device orientation change for mobile devices
        if (isDeviceMobile) {
            window.addEventListener('orientationchange', () => {
                if (currentTerm) {
                    // Reposition tooltip after orientation change
                    setTimeout(() => positionTooltip(currentTerm), 100);
                }
            });
        }
    }

    // Add event listeners after creating the terms
    addGlossaryTermListeners();

    let currentTerm = null;

    function showTooltip(term) {
        // Hide any existing tooltip first
        hideTooltip();

        const termId = term.getAttribute('href').substring(6);
        const termInfo = termMap.get(termId.toLowerCase());
        if (termInfo) {
            currentTerm = term;
            tooltip.innerHTML = `
                <div class="glossary-tooltip-header">
                    <span class="glossary-tooltip-term">${termInfo.id} [${termInfo.number}]</span>
                </div>
                <div class="glossary-tooltip-content">
                    ${termInfo.definition}
                </div>
            `;
            tooltip.classList.add('active');
            positionTooltip(term);
        }
    }

    function positionTooltip(term) {
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

        tooltip.style.position = 'absolute';
        tooltip.style.top = `${top}px`;
        tooltip.style.left = `${left}px`;
        tooltip.style.right = 'auto';
        tooltip.style.marginRight = '0';
    }

    function hideTooltip() {
        tooltip.classList.remove('active');
        currentTerm = null;
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

function setTheme(theme) {
    if (theme === 'system') {
        document.body.classList.remove('light-mode', 'dark-mode');
        setDarkMode(prefersDark.matches);
    } else {
        document.body.classList.remove('light-mode', 'dark-mode');
        document.body.classList.add(`${theme}-mode`);
    }
}

// Initialize theme
setTheme(savedTheme);

// Handle theme changes
themeSelect.addEventListener('change', (e) => {
    const theme = e.target.value;
    setTheme(theme);
    localStorage.setItem('theme', theme);
});

// Handle system theme changes
prefersDark.addEventListener('change', (e) => {
    if (themeSelect.value === 'system') {
        setDarkMode(e.matches);
    }
});

// Keyboard Navigation
document.addEventListener('DOMContentLoaded', () => {
    const mainContent = document.querySelector('.main-content');
    const nav = document.querySelector('.side-nav');
    const toggle = document.querySelector('.nav-toggle');

    // Store previous positions for jump-back functionality
    let previousPosition = null;
    let lastJumpKey = null;

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

    // Helper function to scroll element into view
    function scrollToElement(element, savePrevious = true) {
        if (!element) return;

        if (savePrevious) {
            previousPosition = window.scrollY;
        }

        const offset = 100; // Offset from the top of the viewport
        const elementRect = element.getBoundingClientRect();
        const absoluteElementTop = elementRect.top + window.pageYOffset;
        const middle = absoluteElementTop - (window.innerHeight / 2);

        window.scrollTo({
            top: middle,
            behavior: 'smooth'
        });

        // Announce to screen readers
        const announcement = document.createElement('div');
        announcement.setAttribute('aria-live', 'polite');
        announcement.setAttribute('class', 'sr-only');
        announcement.textContent = element.textContent;
        document.body.appendChild(announcement);
        setTimeout(() => announcement.remove(), 1000);

        // Visual feedback
        element.setAttribute('tabindex', '-1');
        element.focus();
        element.classList.add('keyboard-highlight');
        setTimeout(() => element.classList.remove('keyboard-highlight'), 1000);
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
                const nextHeading = findNextPrevElement('h2, h3, h4, .recital h4, .kpi-box h5', key === 'arrowdown', activeElement);
                scrollToElement(nextHeading);
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
                const recitalToggle = document.querySelector('.recital-toggle');
                if (recitalToggle) {
                    recitalToggle.click();
                }
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

// Load saved state
const isExpanded = localStorage.getItem('keyboardShortcutsExpanded') !== 'false';
collapseToggle.setAttribute('aria-expanded', isExpanded);
shortcutsContent.classList.toggle('collapsed', !isExpanded);

collapseToggle.addEventListener('click', () => {
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
}); 