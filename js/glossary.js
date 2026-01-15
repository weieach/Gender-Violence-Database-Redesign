/**
 * Glossary Renderer
 * Renders glossary data from JSON into HTML
 */

// Fetch and render glossary data
async function loadGlossary() {
    try {
        const response = await fetch('data/glossary.json');
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

    container.innerHTML = sections.map(section => renderSection(section)).join('');
    
    // Render sidebar navigation
    renderSidebarNav(sections);
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
            const itemId = `item-${itemIndex + 1}-1`;
            return `<li class="glossary-nav-item"><a href="#${itemId}">${itemIndex + 1}. ${itemTitle}</a></li>`;
        }).join('');
        
        return `
            <div class="glossary-nav-section">
                <button class="glossary-nav-section-header" data-section="${sectionIndex}">
                    <span>${sectionTitle} (${itemCount})</span>
                    <i class="ph ph-chevron-right"></i>
                </button>
                <ul class="glossary-nav-items">${itemsList}</ul>
            </div>
        `;
    }).join('');
    
    // Add click handlers for expand/collapse
    navContainer.querySelectorAll('.glossary-nav-section-header').forEach(header => {
        header.addEventListener('click', () => {
            const section = header.closest('.glossary-nav-section');
            const icon = header.querySelector('.ph');
            
            section.classList.toggle('expanded');
            if (section.classList.contains('expanded')) {
                icon.classList.remove('ph-chevron-right');
                icon.classList.add('ph-chevron-down');
            } else {
                icon.classList.remove('ph-chevron-down');
                icon.classList.add('ph-chevron-right');
            }
        });
    });
    
    // Expand first section by default
    const firstSection = navContainer.querySelector('.glossary-nav-section');
    if (firstSection) {
        firstSection.classList.add('expanded');
        const firstIcon = firstSection.querySelector('.ph');
        if (firstIcon) {
            firstIcon.classList.remove('ph-chevron-right');
            firstIcon.classList.add('ph-chevron-down');
        }
    }
}

// Format number array as hierarchical string (e.g., [1, 2, 3] -> "1.2.3")
function formatNumber(numberPath) {
    return numberPath.join('.');
}

// Render a single section
function renderSection(section) {
    return `
        <section class="glossary-section">
            <h2 class="glossary-section-title">${escapeHtml(section.section)}</h2>
            <div class="glossary-items">
                ${section.items.map((item, index) => renderItem(item, [index + 1], 1)).join('')}
            </div>
        </section>
    `;
}

// Recursively render items and subitems
function renderItem(item, numberPath, level) {
    const itemClass = `glossary-item glossary-item-level-${level}`;
    const numberString = formatNumber(numberPath);
    const itemId = `item-${numberString.replace(/\./g, '-')}-${level}`;
    
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
            return renderItem(subitem, newNumberPath, level + 1);
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
});
