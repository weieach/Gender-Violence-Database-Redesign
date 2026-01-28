const GLOSSARY_DATA_PATH = "/src/data/glossary.json";
const BROWSE_SAMPLES_PATH = "/src/data/browse-samples.json";
const TAG_SCHEMA_PATH = "/src/data/schema key name translation.csv";

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

const ZOTERO_USER_ID = "15370931";
const ZOTERO_API_KEY = "EP8Dfm0nzHmIoDd1xYF8FIxj";

const ZOTERO_BASE_URL = `https://api.zotero.org/users/${ZOTERO_USER_ID}`;
const ZOTERO_ITEMS_ENDPOINT = `${ZOTERO_BASE_URL}/items?format=json`;
const ZOTERO_COLLECTIONS_ENDPOINT = `${ZOTERO_BASE_URL}/collections?format=json`;
const ZOTERO_PAGE_LIMIT = 100;

let tagLabelMap = new Map();
const ITEMS_PER_PAGE = 10;
let allEntries = [];
let currentPage = 1;

document.addEventListener('DOMContentLoaded', () => {
    initBrowsePage();
});

async function initBrowsePage() {
    try {
        const schemaCsv = await fetchText(TAG_SCHEMA_PATH);
        tagLabelMap = buildTagLabelMap(schemaCsv);
    } catch (error) {
        console.error("Tag schema fetch failed:", error);
        tagLabelMap = new Map();
    }

    try {
        const glossaryData = await fetchJson(GLOSSARY_DATA_PATH);
        renderBrowseNav(glossaryData);
    } catch (error) {
        console.error("Glossary fetch failed:", error);
    }

    await loadBrowseEntries();
}

async function loadBrowseEntries() {
    try {
        const [zoteroCollections, zoteroItems] = await Promise.all([
            fetchZoteroCollections(),
            fetchZoteroItems()
        ]);
        const collectionMap = buildCollectionMap(zoteroCollections);
        const topLevelCollections = zoteroCollections.filter((collection) => {
            const parent = collection && collection.data && collection.data.parentCollection;
            return !parent;
        });
        console.info(
            "[Zotero] collections:",
            zoteroCollections.length,
            "top-level:",
            topLevelCollections.length
        );
        const filteredItems = zoteroItems.filter(isDisplayableZoteroItem);
        const mappedEntries = filteredItems.map((item) => mapZoteroItem(item, collectionMap));
        const uniqueJournals = new Set(mappedEntries.map((entry) => entry.journal).filter(Boolean));
        console.info("[Zotero] items:", zoteroItems.length, "rendered:", mappedEntries.length);
        console.info("[Zotero] unique journals:", uniqueJournals.size);
        renderBrowseEntries(mappedEntries);
    } catch (error) {
        console.error("Zotero fetch failed, using samples:", error);
        const sampleEntries = await fetchJson(BROWSE_SAMPLES_PATH);
        renderBrowseEntries(sampleEntries);
    }
}

async function fetchZoteroItems() {
    const allItems = [];
    let start = 0;

    while (true) {
        const url = `${ZOTERO_ITEMS_ENDPOINT}&limit=${ZOTERO_PAGE_LIMIT}&start=${start}`;
        const response = await fetch(url, {
            headers: {
                "Zotero-API-Key": ZOTERO_API_KEY
            }
        });

        if (!response.ok) {
            throw new Error(`Zotero API error: ${response.status}`);
        }

        const batch = await response.json();
        allItems.push(...batch);

        if (batch.length < ZOTERO_PAGE_LIMIT) {
            break;
        }

        start += ZOTERO_PAGE_LIMIT;
    }

    return allItems;
}

async function fetchZoteroCollections() {
    const allCollections = [];
    let start = 0;

    while (true) {
        const url = `${ZOTERO_COLLECTIONS_ENDPOINT}&limit=${ZOTERO_PAGE_LIMIT}&start=${start}`;
        const response = await fetch(url, {
            headers: {
                "Zotero-API-Key": ZOTERO_API_KEY
            }
        });

        if (!response.ok) {
            throw new Error(`Zotero collections error: ${response.status}`);
        }

        const batch = await response.json();
        allCollections.push(...batch);

        if (batch.length < ZOTERO_PAGE_LIMIT) {
            break;
        }

        start += ZOTERO_PAGE_LIMIT;
    }

    return allCollections;
}

function buildCollectionMap(collections) {
    const map = new Map();
    if (!Array.isArray(collections)) return map;
    collections.forEach((collection) => {
        const key = collection && (collection.key || (collection.data && collection.data.key));
        const name = collection && collection.data && collection.data.name;
        const parent = collection && collection.data && collection.data.parentCollection;
        if (key && name) {
            map.set(key, { name, parent });
        }
    });
    return map;
}

function mapZoteroItem(item, collectionMap) {
    const data = item && item.data ? item.data : {};
    const creators = Array.isArray(data.creators) ? data.creators : [];
    const tags = Array.isArray(data.tags) ? data.tags : [];
    const collections = Array.isArray(data.collections) ? data.collections : [];
    const collectionNames = resolveTopLevelCollections(collections, collectionMap);

    const authors = creators
        .map((creator) => formatCreatorName(creator))
        .filter(Boolean)
        .join("; ");

    const url = data.url || (data.DOI ? `https://doi.org/${data.DOI}` : "");
    const journal = data.publicationTitle || data.journalAbbreviation || collectionNames[0] || "";

    const openAccess = resolveOpenAccess(data, tags);

    return {
        title: data.title || "Untitled",
        journal: journal,
        author: authors,
        tag: [
            ...tags.map((tag) => (typeof tag === "string" ? tag : tag.tag)).filter(Boolean),
            ...collectionNames
        ],
        brief: data.abstractNote || "",
        open_access: openAccess,
        url: url
    };
}

function resolveTopLevelCollections(collectionKeys, collectionMap) {
    const names = new Set();
    const visited = new Set();

    collectionKeys.forEach((key) => {
        let currentKey = key;
        while (currentKey && !visited.has(currentKey)) {
            visited.add(currentKey);
            const entry = collectionMap.get(currentKey);
            if (!entry) break;
            if (!entry.parent) {
                names.add(entry.name);
                break;
            }
            currentKey = entry.parent;
        }
    });

    return Array.from(names);
}

function resolveOpenAccess(data, tags) {
    const accessRights = (data.accessRights || data.rights || "").toLowerCase();
    if (accessRights.includes("open")) {
        return true;
    }
    if (accessRights.includes("closed") || accessRights.includes("restricted")) {
        return false;
    }

    const normalizedTags = tags
        .map((tag) => (typeof tag === "string" ? tag : tag.tag))
        .filter(Boolean)
        .map((tag) => tag.toLowerCase());

    if (normalizedTags.includes("open access") || normalizedTags.includes("open-access")) {
        return true;
    }
    if (normalizedTags.includes("closed access") || normalizedTags.includes("restricted access")) {
        return false;
    }

    return undefined;
}

function isDisplayableZoteroItem(item) {
    const data = item && item.data ? item.data : {};
    const itemType = data.itemType || "";
    if (itemType === "attachment" || itemType === "note") {
        return false;
    }

    const title = (data.title || "").trim();
    const creators = Array.isArray(data.creators) ? data.creators : [];
    const tags = Array.isArray(data.tags) ? data.tags : [];
    const journal = (data.publicationTitle || data.journalAbbreviation || "").trim();
    const brief = (data.abstractNote || "").trim();

    const hasOtherInfo = creators.length > 0 || tags.length > 0 || journal || brief;
    if (title.toLowerCase() === "pdf" && !hasOtherInfo) {
        return false;
    }

    return true;
}

function formatCreatorName(creator) {
    if (!creator) return "";
    if (creator.name) return creator.name;
    const parts = [];
    if (creator.firstName) parts.push(creator.firstName);
    if (creator.lastName) parts.push(creator.lastName);
    return parts.join(" ").trim();
}

function renderBrowseEntries(entries) {
    allEntries = Array.isArray(entries) ? entries : [];
    currentPage = 1;
    renderBrowsePage();
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
                <h3>${titleHtml}</h3>
                ${journalHtml}
                ${authorHtml}
                <p class="entry-description">${escapeHtml(entry.brief || '')}</p>
                <hr>
                ${tagHtml}
            </div>
        </div>
    `;
}

function renderBrowsePage() {
    const container = document.querySelector('.database-entries');
    if (!container) {
        return;
    }

    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    const pageEntries = allEntries.slice(start, end);

    container.innerHTML = pageEntries.map((entry) => renderBrowseEntry(entry)).join('');
    initTagExpanders(container);
    renderPagination();
}

function renderPagination() {
    const pagination = document.getElementById('browse-pagination');
    if (!pagination) return;

    const totalPages = Math.ceil(allEntries.length / ITEMS_PER_PAGE);
    if (totalPages <= 1) {
        pagination.innerHTML = '';
        return;
    }

    const firstDisabled = currentPage === 1 ? 'is-disabled' : '';
    const lastDisabled = currentPage === totalPages ? 'is-disabled' : '';

    const pageButtons = Array.from({ length: totalPages }, (_, index) => {
        const page = index + 1;
        const activeClass = page === currentPage ? 'is-active' : '';
        return `<button type="button" class="page-btn ${activeClass}" data-page="${page}">${page}</button>`;
    }).join('');

    pagination.innerHTML = `
        <button type="button" class="page-btn page-btn-nav ${firstDisabled}" data-page="first" aria-label="First page">«</button>
        <button type="button" class="page-btn page-btn-nav ${firstDisabled}" data-page="prev" aria-label="Previous page">‹</button>
        ${pageButtons}
        <button type="button" class="page-btn page-btn-nav ${lastDisabled}" data-page="next" aria-label="Next page">›</button>
        <button type="button" class="page-btn page-btn-nav ${lastDisabled}" data-page="last" aria-label="Last page">»</button>
    `;

    pagination.querySelectorAll('[data-page]').forEach((button) => {
        button.addEventListener('click', () => {
            const target = button.getAttribute('data-page');
            const total = Math.ceil(allEntries.length / ITEMS_PER_PAGE);

            if (target === 'first') currentPage = 1;
            else if (target === 'prev') currentPage = Math.max(1, currentPage - 1);
            else if (target === 'next') currentPage = Math.min(total, currentPage + 1);
            else if (target === 'last') currentPage = total;
            else currentPage = Number(target) || 1;

            renderBrowsePage();
        });
    });
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
        const label = mapTagLabel(tag);
        tagItems.push(`<div class="entry-tag">${escapeHtml(label)}</div>`);
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

async function fetchJson(path) {
    const response = await fetch(path);
    if (!response.ok) {
        throw new Error(`Failed to load ${path}: ${response.status}`);
    }
    return response.json();
}

async function fetchText(path) {
    const response = await fetch(path);
    if (!response.ok) {
        throw new Error(`Failed to load ${path}: ${response.status}`);
    }
    return response.text();
}

function mapTagLabel(tag) {
    if (!tag) return '';
    const raw = typeof tag === "string" ? tag : tag.tag;
    if (!raw) return '';
    const normalized = normalizeTag(raw);
    return tagLabelMap.get(normalized) || raw;
}

function normalizeTag(value) {
    return value.trim().toLowerCase().replace(/\s+/g, '');
}

function buildTagLabelMap(csvText) {
    const rows = parseCsv(csvText);
    if (!rows.length) return new Map();

    const header = rows[0].map((cell) => cell.trim().toLowerCase());
    const tagIndex = header.indexOf('tag name');
    const labelIndex = header.indexOf('label');

    const map = new Map();
    if (tagIndex === -1 || labelIndex === -1) {
        return map;
    }

    rows.slice(1).forEach((row) => {
        const tagKey = row[tagIndex] ? row[tagIndex].trim() : '';
        const label = row[labelIndex] ? row[labelIndex].trim() : '';
        if (!label) return;

        if (tagKey) {
            map.set(normalizeTag(tagKey), label);
        }
        map.set(normalizeTag(label), label);
    });

    return map;
}

function parseCsv(text) {
    const rows = [];
    let current = [];
    let value = '';
    let inQuotes = false;

    for (let i = 0; i < text.length; i += 1) {
        const char = text[i];
        const next = text[i + 1];

        if (char === '"' && next === '"') {
            value += '"';
            i += 1;
            continue;
        }

        if (char === '"') {
            inQuotes = !inQuotes;
            continue;
        }

        if (char === ',' && !inQuotes) {
            current.push(value);
            value = '';
            continue;
        }

        if ((char === '\n' || char === '\r') && !inQuotes) {
            if (char === '\r' && next === '\n') {
                i += 1;
            }
            current.push(value);
            if (current.some((cell) => cell.length > 0)) {
                rows.push(current);
            }
            current = [];
            value = '';
            continue;
        }

        value += char;
    }

    current.push(value);
    if (current.some((cell) => cell.length > 0)) {
        rows.push(current);
    }

    return rows;
}
