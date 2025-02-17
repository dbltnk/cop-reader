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