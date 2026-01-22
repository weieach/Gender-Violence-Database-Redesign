/**
 * Glossary Renderer
 * Renders glossary data from JSON into HTML
 */




// Fetch and render glossary data
async function loadGlossary() {
    try {
        const response = await fetch('../data/glossary.json');
        if (!response.ok) {
            throw new Error('Failed to load glossary data');
        }
        const data = await response.json();
        renderGlossary(data);
    } catch (error) {
        console.error('Error loading glossary:', error);
        const container = document.getElementById('glossary-content');
        if (container) {
            container.innerHTML = '<p>Error loading glossary. Please refresh the page.</p>';
        }
    }
}

// Render glossary sections
function renderGlossary(sections) {
    const container = document.getElementById('glossary-content');
    if (!container) {
        console.error('Glossary content container not found');
        return;
    }

    container.innerHTML = sections.map((section, sectionIndex) => renderSection(section, sectionIndex)).join('');
    
    // Render sidebar navigation
    renderSidebarNav(sections);

    // Initialize search after content renders
    initGlossarySearch();
}

// Render sidebar navigation
function renderSidebarNav(sections) {
    const navContainer = document.getElementById('glossary-nav');
    if (!navContainer) {
        console.error('Glossary nav container not found');
        return;
    }

    navContainer.innerHTML = sections.map((section, sectionIndex) => {
        const itemCount = section.items.length;
        const sectionTitle = escapeHtml(section.section);
        
        const itemsList = section.items.map((item, itemIndex) => {
            const itemTitle = escapeHtml(item.title);
            // Create the same ID format as used in renderItem
            const itemId = `section-${sectionIndex}-item-${itemIndex + 1}-1`;
            return `<li class="glossary-nav-item"><a href="#${itemId}">${itemIndex + 1}. ${itemTitle}</a></li>`;
        }).join('');
        
        return `
            <div class="glossary-nav-section">
                <button class="glossary-nav-section-header" data-section="${sectionIndex}">
                    <span>${sectionTitle} <span class="glossary-nav-section-count">(${itemCount})</span></span>
                    <i class="ph-bold ph-caret-right"></i>
                </button>
                <ul class="glossary-nav-items">${itemsList}</ul>
            </div>
        `;
    }).join('');
    
    const sectionElements = Array.from(navContainer.querySelectorAll('.glossary-nav-section'));

    const setExpandedSection = (targetSection) => {
        sectionElements.forEach(section => {
            const icon = section.querySelector('.ph-bold');
            const isTarget = section === targetSection;
            section.classList.toggle('expanded', isTarget);
            if (icon) {
                icon.classList.toggle('is-rotated', isTarget);
            }
        });
    };

    const collapseAllSections = () => {
        sectionElements.forEach(section => {
            section.classList.remove('expanded');
            const icon = section.querySelector('.ph-bold');
            if (icon) {
                icon.classList.remove('is-rotated');
            }
        });
    };

    // Add click handlers for expand/collapse
    sectionElements.forEach(section => {
        const header = section.querySelector('.glossary-nav-section-header');
        if (!header) return;
        header.addEventListener('click', () => {
            if (section.classList.contains('expanded')) {
                collapseAllSections();
            } else {
                setExpandedSection(section);
            }
        });
    });
    
    // No section expanded by default
}

// Initialize glossary search
function initGlossarySearch() {
    const searchInput = document.getElementById('glossary-search');
    const searchIcon = document.querySelector('.glossary-search-icon');
    const controls = document.getElementById('glossary-search-controls');
    const countEl = document.getElementById('glossary-search-count');
    const prevBtn = document.getElementById('glossary-search-prev');
    const nextBtn = document.getElementById('glossary-search-next');
    const clearBtn = document.getElementById('glossary-search-clear');

    if (!searchInput || !controls || !countEl || !prevBtn || !nextBtn || !clearBtn) {
        return;
    }

    const items = Array.from(document.querySelectorAll('.glossary-item'));
    let matchSpans = [];
    let currentIndex = -1;

    const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    const getTitleParts = (titleEl) => {
        if (!titleEl.dataset.numberText || !titleEl.dataset.titleText) {
            const numberSpan = titleEl.querySelector('.glossary-item-number');
            const numberText = numberSpan ? numberSpan.textContent : '';
            const fullText = titleEl.textContent || '';
            const titleText = fullText.replace(numberText, '').trim();
            titleEl.dataset.numberText = numberText;
            titleEl.dataset.titleText = titleText;
        }

        return {
            numberText: titleEl.dataset.numberText || '',
            titleText: titleEl.dataset.titleText || ''
        };
    };

    const resetHighlights = () => {
        items.forEach(item => {
            const titleEl = item.querySelector('.glossary-item-title');
            const descEl = item.querySelector('.glossary-item-description');

            if (titleEl) {
                const { numberText, titleText } = getTitleParts(titleEl);
                titleEl.innerHTML = `<span class="glossary-item-number">${escapeHtml(numberText)}</span> ${escapeHtml(titleText)}`;
            }

            if (descEl) {
                if (!descEl.dataset.originalText) {
                    descEl.dataset.originalText = descEl.textContent || '';
                }
                descEl.textContent = descEl.dataset.originalText;
            }
        });
    };

    const updateCount = () => {
        if (matchSpans.length === 0) {
            countEl.textContent = '0 of 0';
            prevBtn.disabled = true;
            nextBtn.disabled = true;
            return;
        }
        countEl.textContent = `${currentIndex + 1} of ${matchSpans.length}`;
        prevBtn.disabled = false;
        nextBtn.disabled = false;
    };

    const highlightActive = () => {
        document.querySelectorAll('.glossary-search-highlight.is-active').forEach(el => {
            el.classList.remove('is-active');
        });

        if (currentIndex >= 0 && matchSpans[currentIndex]) {
            matchSpans[currentIndex].classList.add('is-active');
        }
    };

    const goToMatch = (index) => {
        if (matchSpans.length === 0) return;
        const safeIndex = (index + matchSpans.length) % matchSpans.length;
        currentIndex = safeIndex;
        highlightActive();
        matchSpans[currentIndex].scrollIntoView({ behavior: 'smooth', block: 'center' });
        updateCount();
    };

    const runSearch = (query) => {
        const trimmed = query.trim().toLowerCase();
        resetHighlights();
        matchSpans = [];
        currentIndex = -1;

        if (trimmed.length === 0) {
            if (searchIcon) {
                searchIcon.classList.remove('is-hidden');
            }
            controls.classList.add('is-hidden');
            updateCount();
            return;
        }

        if (searchIcon) {
            searchIcon.classList.add('is-hidden');
        }
        const regex = new RegExp(`(${escapeRegExp(trimmed)})`, 'gi');

        const matchedItems = items.filter(item => {
            const titleEl = item.querySelector('.glossary-item-title');
            const descEl = item.querySelector('.glossary-item-description');
            const titleText = titleEl ? getTitleParts(titleEl).titleText : '';
            const descText = descEl ? (descEl.dataset.originalText || descEl.textContent || '') : '';
            return `${titleText} ${descText}`.toLowerCase().includes(trimmed);
        });

        matchedItems.forEach(item => {
            const titleEl = item.querySelector('.glossary-item-title');
            const descEl = item.querySelector('.glossary-item-description');

            if (titleEl) {
                const { numberText, titleText } = getTitleParts(titleEl);
                const highlightedTitle = escapeHtml(titleText).replace(regex, '<span class="glossary-search-highlight">$1</span>');
                titleEl.innerHTML = `<span class="glossary-item-number">${escapeHtml(numberText)}</span> ${highlightedTitle}`;
            }

            if (descEl) {
                if (!descEl.dataset.originalText) {
                    descEl.dataset.originalText = descEl.textContent || '';
                }
                const highlightedDesc = escapeHtml(descEl.dataset.originalText).replace(regex, '<span class="glossary-search-highlight">$1</span>');
                descEl.innerHTML = highlightedDesc;
            }
        });

        matchSpans = Array.from(document.querySelectorAll('.glossary-search-highlight'));
        controls.classList.remove('is-hidden');

        if (matchSpans.length > 0) {
            currentIndex = 0;
            highlightActive();
            updateCount();
            matchSpans[currentIndex].scrollIntoView({ behavior: 'smooth', block: 'center' });
        } else {
            updateCount();
        }
    };

    searchInput.addEventListener('input', (event) => {
        runSearch(event.target.value);
    });

    prevBtn.addEventListener('click', () => goToMatch(currentIndex - 1));
    nextBtn.addEventListener('click', () => goToMatch(currentIndex + 1));
    clearBtn.addEventListener('click', () => {
        searchInput.value = '';
        runSearch('');
        searchInput.focus();
    });
}

// Format number array as hierarchical string (e.g., [1, 2, 3] -> "1.2.3")
function formatNumber(numberPath) {
    return numberPath.join('.');
}

// Render a single section
function renderSection(section, sectionIndex) {
    return `
        <section class="glossary-section">
            <h2 class="glossary-section-title">${escapeHtml(section.section)}</h2>
            <div class="glossary-items">
                ${section.items.map((item, index) => renderItem(item, [index + 1], 1, sectionIndex)).join('')}
            </div>
        </section>
    `;
}

// Recursively render items and subitems
function renderItem(item, numberPath, level, sectionIndex) {
    const itemClass = `glossary-item glossary-item-level-${level}`;
    const numberString = formatNumber(numberPath);
    const itemId = `section-${sectionIndex}-item-${numberString.replace(/\./g, '-')}-${level}`;
    
    let html = `
        <div class="${itemClass}" id="${itemId}">
            <h${Math.min(level + 2, 6)} class="glossary-item-title"><span class="glossary-item-number">${numberString}.</span> ${escapeHtml(item.title)}</h${Math.min(level + 2, 6)}>
    `;
    
    if (item.description) {
        html += `<p class="glossary-item-description">${escapeHtml(item.description)}</p>`;
    }
    
    if (item.subitems && item.subitems.length > 0) {
        html += '<div class="glossary-subitems">';
        html += item.subitems.map((subitem, index) => {
            // Create new number path by appending the subitem index
            const newNumberPath = [...numberPath, index + 1];
            return renderItem(subitem, newNumberPath, level + 1, sectionIndex);
        }).join('');
        html += '</div>';
    }
    
    html += '</div>';
    return html;
}

// Simple HTML escaping to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    loadGlossary();
    initGlossaryInfoModal();
});

function initGlossaryInfoModal() {
    const infoBtn = document.querySelector('.glossary-info-btn');
    const modal = document.getElementById('glossary-info-modal');
    const closeBtn = modal ? modal.querySelector('.glossary-modal-close') : null;
    const doneBtn = modal ? modal.querySelector('.glossary-modal-done') : null;

    if (!infoBtn || !modal || !closeBtn || !doneBtn) {
        return;
    }

    const openModal = () => {
        modal.classList.remove('is-hidden');
    };

    const closeModal = () => {
        modal.classList.add('is-hidden');
    };

    infoBtn.addEventListener('click', openModal);
    closeBtn.addEventListener('click', closeModal);
    doneBtn.addEventListener('click', closeModal);

    modal.addEventListener('click', (event) => {
        if (event.target === modal) {
            closeModal();
        }
    });

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && !modal.classList.contains('is-hidden')) {
            closeModal();
        }
    });
}
