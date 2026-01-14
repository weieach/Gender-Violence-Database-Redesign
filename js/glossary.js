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
}

// Render a single section
function renderSection(section) {
    return `
        <section class="glossary-section">
            <h2 class="glossary-section-title">${escapeHtml(section.section)}</h2>
            <div class="glossary-items">
                ${section.items.map((item, index) => renderItem(item, index + 1, 1)).join('')}
            </div>
        </section>
    `;
}

// Recursively render items and subitems
function renderItem(item, number, level) {
    const itemClass = `glossary-item glossary-item-level-${level}`;
    const itemId = `item-${number}-${level}`;
    
    let html = `
        <div class="${itemClass}" id="${itemId}">
            <div class="glossary-item-header">
                <span class="glossary-item-number">${number}.</span>
                <h${Math.min(level + 2, 6)} class="glossary-item-title">${escapeHtml(item.title)}</h${Math.min(level + 2, 6)}>
            </div>
    `;
    
    if (item.description) {
        html += `<p class="glossary-item-description">${escapeHtml(item.description)}</p>`;
    }
    
    if (item.subitems && item.subitems.length > 0) {
        html += '<div class="glossary-subitems">';
        html += item.subitems.map((subitem, index) => 
            renderItem(subitem, index + 1, level + 1)
        ).join('');
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
