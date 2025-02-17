// Navigation functionality
document.addEventListener('DOMContentLoaded', () => {
    const nav = document.querySelector('.side-nav');
    const toggle = document.querySelector('.nav-toggle');
    const navContent = document.getElementById('nav-content');

    // Toggle navigation
    toggle.addEventListener('click', () => {
        const isExpanded = toggle.getAttribute('aria-expanded') === 'true';
        toggle.setAttribute('aria-expanded', !isExpanded);
        nav.classList.toggle('active');
    });

    // Close navigation when clicking outside
    document.addEventListener('click', (e) => {
        if (!nav.contains(e.target) && !toggle.contains(e.target)) {
            nav.classList.remove('active');
            toggle.setAttribute('aria-expanded', 'false');
        }
    });

    // Close navigation when pressing Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            nav.classList.remove('active');
            toggle.setAttribute('aria-expanded', 'false');
        }
    });

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

    // Observe all sections
    document.querySelectorAll('section[id], h2[id], h3[id]').forEach(section => {
        observer.observe(section);
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
    const recitalToggle = document.querySelector('.recital-toggle');
    let recitalsExpanded = true;

    recitalToggle.setAttribute('aria-pressed', recitalsExpanded);

    // Clear any existing recitals in the full section
    while (recitalsFullSection.children.length > 1) { // Keep the h2
        recitalsFullSection.removeChild(recitalsFullSection.lastChild);
    }

    // Clone each recital to the full section
    recitals.forEach((recital, index) => {
        const recitalClone = recital.cloneNode(true);
        const number = index + 1;
        recitalClone.classList.add('full-section-recital');
        const header = recitalClone.querySelector('h4');
        header.dataset.recitalNumber = number;
        recital.querySelector('h4').dataset.recitalNumber = number;
        recitalsFullSection.appendChild(recitalClone);
    });

    // Add click handlers to main content recitals only
    document.querySelectorAll('.recital:not(.full-section-recital)').forEach(recital => {
        const header = recital.querySelector('h4');
        header.addEventListener('click', () => {
            recital.classList.toggle('collapsed');
        });
    });

    // Add recital toggle functionality
    recitalToggle.addEventListener('click', () => {
        recitalsExpanded = !recitalsExpanded;
        recitalToggle.setAttribute('aria-pressed', recitalsExpanded);

        document.querySelectorAll('.recital:not(.full-section-recital)').forEach(recital => {
            if (recitalsExpanded) {
                recital.classList.remove('collapsed');
                recital.setAttribute('aria-expanded', 'true');
            } else {
                recital.classList.add('collapsed');
                recital.setAttribute('aria-expanded', 'false');
            }
        });
    });
});

// Glossary functionality
document.addEventListener('DOMContentLoaded', () => {
    const glossaryTerms = document.querySelectorAll('.glossary-term');
    const glossaryList = document.querySelector('.glossary-list');
    const tooltip = document.createElement('div');
    tooltip.className = 'glossary-tooltip';
    document.body.appendChild(tooltip);

    // Add reference numbers to terms
    let termCounter = 1;
    const termMap = new Map();

    // First pass: create the map of terms
    glossaryList.querySelectorAll('dt').forEach(term => {
        const id = term.id.replace('term-', '');
        termMap.set(id, {
            number: termCounter++,
            definition: term.nextElementSibling.textContent
        });
    });

    // Second pass: add numbers to inline terms
    glossaryTerms.forEach(term => {
        const termId = term.getAttribute('href').substring(6); // Remove #term-
        const termInfo = termMap.get(termId);
        if (termInfo) {
            const ref = document.createElement('span');
            ref.className = 'glossary-ref';
            ref.textContent = termInfo.number;
            term.appendChild(ref);
        }
    });

    let currentTerm = null;

    function showTooltip(term) {
        const termId = term.getAttribute('href').substring(6);
        const termInfo = termMap.get(termId);
        if (termInfo) {
            currentTerm = term;
            tooltip.innerHTML = `
                <div class="glossary-tooltip-header">
                    <span class="glossary-tooltip-term">${termId} [${termInfo.number}]</span>
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

    // Event listeners for desktop
    if (window.matchMedia('(min-width: 1024px)').matches) {
        glossaryTerms.forEach(term => {
            term.addEventListener('mouseenter', () => showTooltip(term));
            term.addEventListener('mouseleave', (e) => {
                // Only hide if we're not moving to the tooltip
                if (!e.relatedTarget || !e.relatedTarget.closest('.glossary-tooltip')) {
                    hideTooltip();
                }
            });
            term.addEventListener('click', (e) => {
                e.preventDefault();
                if (currentTerm === term) {
                    hideTooltip();
                } else {
                    showTooltip(term);
                }
            });
        });

        // Add tooltip hover handling
        tooltip.addEventListener('mouseleave', (e) => {
            // Only hide if we're not moving to a term
            if (!e.relatedTarget || !e.relatedTarget.closest('.glossary-term')) {
                hideTooltip();
            }
        });
    } else {
        // Event listeners for mobile
        glossaryTerms.forEach(term => {
            term.addEventListener('click', (e) => {
                e.preventDefault();
                if (currentTerm === term) {
                    hideTooltip();
                } else {
                    showTooltip(term);
                }
            });
        });

        // Hide tooltip when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.glossary-term') && !e.target.closest('.glossary-tooltip')) {
                hideTooltip();
            }
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