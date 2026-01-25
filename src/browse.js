import glossaryData from "./data/glossary.json";
import browseSamples from "./data/browse-samples.json";

function renderBrowseNav(sections) {
    const navContainer = document.getElementById('browse-nav');
    if (!navContainer) {
        return;
    }

    navContainer.innerHTML = sections.map((section, sectionIndex) => {
        const sectionTitle = escapeHtml(section.section);
        const itemCount = section.items.length;
        const sectionId = `browse-section-${sectionIndex}`;

        return `
            <div class="browse-nav-section">
                <button type="button" class="browse-nav-toggle" aria-expanded="false" aria-controls="${sectionId}">
                    <span>${sectionTitle} <span class="browse-nav-count">(${itemCount})</span></span>
                    <i class="ph-bold ph-caret-right"></i>
                </button>
                <div class="browse-nav-children" id="${sectionId}">
                    ${section.items.map((item, itemIndex) => renderBrowseItem(item, sectionIndex, [itemIndex + 1])).join('')}
                </div>
            </div>
        `;
    }).join('');

    initBrowseNavInteractions(navContainer);
}

function renderBrowseItem(item, sectionIndex, numberPath) {
    const numberString = formatNumber(numberPath);
    const hasChildren = Array.isArray(item.subitems) && item.subitems.length > 0;
    const itemId = `browse-${sectionIndex}-${numberPath.join('-')}`;
    const label = `${numberString}. ${escapeHtml(item.title)}`;

    const buttonClass = hasChildren ? 'browse-nav-toggle browse-nav-item-toggle' : 'browse-nav-leaf';
    const iconHtml = hasChildren ? '<i class="ph-bold ph-caret-right"></i>' : '';
    const ariaAttrs = hasChildren ? ` aria-expanded="false" aria-controls="${itemId}"` : '';

    const childrenHtml = hasChildren
        ? `<div class="browse-nav-children" id="${itemId}">
                ${item.subitems.map((subitem, index) => renderBrowseItem(subitem, sectionIndex, [...numberPath, index + 1])).join('')}
           </div>`
        : '';

    return `
        <div class="browse-nav-item">
            <button type="button" class="${buttonClass}"${ariaAttrs}>
                <span class="browse-nav-label">${label}</span>
                ${iconHtml}
            </button>
            ${childrenHtml}
        </div>
    `;
}

function initBrowseNavInteractions(navContainer) {
    const toggles = Array.from(navContainer.querySelectorAll('.browse-nav-toggle'));
    toggles.forEach(toggle => {
        toggle.addEventListener('click', () => {
            const targetId = toggle.getAttribute('aria-controls');
            if (!targetId) return;
            const panel = navContainer.querySelector(`#${targetId}`);
            const isExpanded = toggle.getAttribute('aria-expanded') === 'true';

            toggle.setAttribute('aria-expanded', String(!isExpanded));
            toggle.classList.toggle('is-open', !isExpanded);

            if (panel) {
                panel.classList.toggle('is-open', !isExpanded);
            }

            const icon = toggle.querySelector('.ph-bold');
            if (icon) {
                icon.classList.toggle('is-rotated', !isExpanded);
            }
        });
    });
}

function formatNumber(numberPath) {
    return numberPath.join('.');
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

document.addEventListener('DOMContentLoaded', () => {
    renderBrowseNav(glossaryData);
    renderBrowseEntries(browseSamples);
});

function renderBrowseEntries(entries) {
    const container = document.querySelector('.database-entries');
    if (!container) {
        return;
    }

    container.innerHTML = entries.map((entry) => renderBrowseEntry(entry)).join('');
    initTagExpanders(container);
}

function renderBrowseEntry(entry) {
    const titleHtml = entry.url
        ? `<a href="${escapeHtml(entry.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(entry.title)}</a>`
        : `<span>${escapeHtml(entry.title)}</span>`;

    const journalHtml = entry.journal
        ? `<h4 class="entry-journal">Journal: ${escapeHtml(entry.journal)}</h4>`
        : '';

    const authorHtml = entry.author
        ? `<p class="entry-authors">${escapeHtml(entry.author)}</p>`
        : '';

    const tagHtml = renderEntryTags(entry);

    return `
        <div class="database-entry">
            <button class="btn-bookmark" type="button" aria-label="Bookmark article">
                <i class="ph-bold ph-bookmark-simple"></i>
            </button>
            <div class="database-entry-text">
                <h3><a href="https://journals.sagepub.com/doi/10.1177/10778012241270223" target="_blank">${titleHtml}</a></h3>
                ${journalHtml}
                ${authorHtml}
                <p class="entry-description">${escapeHtml(entry.brief || '')}</p>
                <hr>
                ${tagHtml}
            </div>
        </div>
    `;
}

function renderEntryTags(entry) {
    const tags = Array.isArray(entry.tag) ? entry.tag : [];
    const tagItems = [];

    if (entry.open_access === true) {
        tagItems.push(`
            <div class="entry-tag tag-open-access">
                Open access <i class="ph ph-folder-open"></i>
            </div>
        `);
    } else if (entry.open_access === false) {
        tagItems.push(`
            <div class="entry-tag">
                Closed access <i class="ph ph-lock"></i>
            </div>
        `);
    }

    tags.forEach((tag) => {
        tagItems.push(`<div class="entry-tag">${escapeHtml(tag)}</div>`);
    });

    if (tagItems.length === 0) {
        return '';
    }

    return `
        <div class="entry-tags is-collapsed">
            <div class="entry-tags-list">
                ${tagItems.join('')}
            </div>
            <button class="btn-expand-tag" type="button">
                <p>Expand</p>
                <i class="ph-bold ph-caret-down"></i>
            </button>
        </div>
    `;
}

function initTagExpanders(container) {
    const buttons = Array.from(container.querySelectorAll('.btn-expand-tag'));
    buttons.forEach((button) => {
        button.addEventListener('click', () => {
            const entryTags = button.closest('.entry-tags');
            if (!entryTags) return;
            const entry = button.closest('.database-entry');

            const isExpanded = entryTags.classList.contains('is-expanded');
            entryTags.classList.toggle('is-expanded', !isExpanded);
            entryTags.classList.toggle('is-collapsed', isExpanded);

            if (entry) {
                entry.classList.toggle('is-expanded', !isExpanded);
            }

            const label = button.querySelector('p');
            if (label) {
                label.textContent = isExpanded ? 'Expand' : 'Collapse';
            }
        });
    });
}
