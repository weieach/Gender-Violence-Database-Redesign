const DATA_BASE_PATH = "src/data/";
const PUBLIC_DATA_BASE_PATH = "data/";
const BROWSE_SAMPLES_PATH = `${DATA_BASE_PATH}browse-samples.json`;
const TAG_SCHEMA_FILE = "schema%20key%20name%20translation.csv";
const TAG_SCHEMA_PATHS = [
    `${PUBLIC_DATA_BASE_PATH}${TAG_SCHEMA_FILE}`,
    `${DATA_BASE_PATH}${TAG_SCHEMA_FILE}`
];

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

function renderBrowseNavFromSchema(nodes) {
    const navContainer = document.getElementById('browse-nav');
    if (!navContainer) {
        return;
    }

    navContainer.innerHTML = nodes.map((node, index) => {
        const sectionId = `schema-section-${index}`;
        const hasChildren = node.children.length > 0;
        const count = node.count;
        const hasTagKey = Boolean(node.key);
        const keySignature = hasTagKey ? makeKeySignature(node.allKeys || []) : '';
        const isChecked = hasTagKey && activeTagSignatures.has(keySignature);
        const headerHtml = hasChildren
            ? `
                <button type="button" class="browse-nav-toggle" aria-expanded="false" aria-controls="${sectionId}">
                    <span class="browse-nav-toggle-content">
                        ${hasTagKey ? `<input type="checkbox" class="browse-nav-checkbox-input" data-tag-keys="${escapeHtml(keySignature)}" ${isChecked ? 'checked' : ''}>` : ''}
                        <span class="browse-nav-label">${escapeHtml(node.label)} <span class="browse-nav-count">(${count})</span></span>
                    </span>
                    <i class="ph-bold ph-caret-right"></i>
                </button>
            `
            : `
                <div class="browse-nav-leaf">
                    ${hasTagKey ? `
                        <label class="browse-nav-checkbox">
                            <input type="checkbox" class="browse-nav-checkbox-input" data-tag-keys="${escapeHtml(keySignature)}" ${isChecked ? 'checked' : ''}>
                            <span class="browse-nav-label">${escapeHtml(node.label)} <span class="browse-nav-count">(${count})</span></span>
                        </label>
                    ` : `
                        <span class="browse-nav-label">${escapeHtml(node.label)} <span class="browse-nav-count">(${count})</span></span>
                    `}
                </div>
            `;

        return `
            <div class="browse-nav-section">
                ${headerHtml}
                ${hasChildren ? `<div class="browse-nav-children" id="${sectionId}">${renderSchemaChildren(node.children)}</div>` : ''}
            </div>
        `;
    }).join('');

    initBrowseNavInteractions(navContainer);
    initTagFilterInputs(navContainer);
}

function renderSchemaChildren(children) {
    return children.map((child, index) => {
        const childId = `schema-node-${child.key || 'label'}-${index}`;
        const hasChildren = child.children.length > 0;
        const label = escapeHtml(child.label);
        const count = child.count;
        const hasTagKey = Boolean(child.key);
        const keySignature = hasTagKey ? makeKeySignature(child.allKeys || []) : '';
        const isChecked = hasTagKey && activeTagSignatures.has(keySignature);

        return `
            <div class="browse-nav-item">
                ${hasChildren ? `
                    <button type="button" class="browse-nav-toggle browse-nav-item-toggle" aria-expanded="false" aria-controls="${childId}">
                        <span class="browse-nav-toggle-content">
                            ${hasTagKey ? `<input type="checkbox" class="browse-nav-checkbox-input" data-tag-keys="${escapeHtml(keySignature)}" ${isChecked ? 'checked' : ''}>` : ''}
                            <span class="browse-nav-label">${label} <span class="browse-nav-count">(${count})</span></span>
                        </span>
                        <i class="ph-bold ph-caret-right"></i>
                    </button>
                    <div class="browse-nav-children" id="${childId}">
                        ${renderSchemaChildren(child.children)}
                    </div>
                ` : `
                    <div class="browse-nav-leaf">
                        ${hasTagKey ? `
                            <label class="browse-nav-checkbox">
                                <input type="checkbox" class="browse-nav-checkbox-input" data-tag-keys="${escapeHtml(keySignature)}" ${isChecked ? 'checked' : ''}>
                                <span class="browse-nav-label">${label}</span>
                            </label>
                        ` : `
                            <span class="browse-nav-label">${label}</span>
                        `}
                    </div>
                `}
            </div>
        `;
    }).join('');
}

function initTagFilterInputs(navContainer) {
    const inputs = Array.from(navContainer.querySelectorAll('.browse-nav-checkbox-input'));
    inputs.forEach((input) => {
        input.addEventListener('click', (event) => {
            event.stopPropagation();
        });
        input.addEventListener('change', () => {
            updateActiveTagFilters();
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
let schemaTree = [];
let filteredEntries = [];
let activeTagFilters = [];
let activeTagSignatures = new Set();
let activeTagSelections = [];
let entryLookup = new Map();
const bookmarkedEntries = new Map();
let bookmarkToastTimer = null;
let hasShownBookmarkToast = false;

document.addEventListener('DOMContentLoaded', () => {
    initBrowsePage();
});

async function initBrowsePage() {
    try {
        const schemaCsv = await fetchFirstText(TAG_SCHEMA_PATHS);
        tagLabelMap = buildTagLabelMap(schemaCsv);
        schemaTree = buildSchemaTree(schemaCsv);
        renderBrowseNavFromSchema(schemaTree);
        initActiveTagPills();
        renderActiveTagPills();
    } catch (error) {
        console.error("Tag schema fetch failed:", error);
        tagLabelMap = new Map();
    }

    initBookmarkUI();
    updateBookmarkCounts();
    initSearchResults();
    await loadBrowseEntries();
}

async function loadBrowseEntries() {
    try {
        setBrowseLoading(true);
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
        setBrowseLoading(false);
    } catch (error) {
        console.error("Zotero fetch failed, using samples:", error);
        const sampleEntries = await fetchJson(BROWSE_SAMPLES_PATH);
        renderBrowseEntries(sampleEntries);
        setBrowseLoading(false);
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

    const tagValues = [
        ...tags.map((tag) => (typeof tag === "string" ? tag : tag.tag)).filter(Boolean),
        ...collectionNames,
        journal
    ].filter(Boolean);

    const uniqueTags = Array.from(new Set(tagValues));

    return {
        title: data.title || "Untitled",
        journal: journal,
        author: authors,
        tag: uniqueTags,
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
    entryLookup = new Map(allEntries.map((entry) => [makeEntryId(entry), entry]));
    currentPage = 1;
    if (schemaTree.length) {
        const tagCounts = buildTagCounts(allEntries);
        applyTagCounts(schemaTree, tagCounts);
        renderBrowseNavFromSchema(schemaTree);
    }
    renderJournalFilters(allEntries);
    updateFilteredEntries();
    updateSearchResults();
}

function renderBrowseEntry(entry) {
    const entryId = makeEntryId(entry);
    const isBookmarked = bookmarkedEntries.has(entryId);
    const titleHtml = entry.url
        ? `<a href="${escapeHtml(entry.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(entry.title)}</a>`
        : `<span>${escapeHtml(entry.title)}</span>`;

    const journalHtml = entry.journal
        ? `<h4 class="entry-journal">Journal: <button type="button" class="entry-journal-btn" data-journal-signature="${escapeHtml(makeKeySignature([entry.journal]))}">${escapeHtml(entry.journal)}</button></h4>`
        : '';

    const authorHtml = entry.author
        ? `<p class="entry-authors">${escapeHtml(entry.author)}</p>`
        : '';

    const tagHtml = renderEntryTags(entry);

    return `
        <div class="database-entry" data-entry-id="${escapeHtml(encodeURIComponent(entryId))}">
            <button class="btn-bookmark ${isBookmarked ? 'is-active' : ''}" type="button" aria-label="Bookmark article">
                <i class="${isBookmarked ? 'ph-fill' : 'ph-bold'} ph-bookmark-simple"></i>
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
    const pageEntries = filteredEntries.slice(start, end);

    container.innerHTML = pageEntries.map((entry) => renderBrowseEntry(entry)).join('');
    initTagExpanders(container);
    initEntryBookmarks(container);
    initJournalButtons(container);
    initEntryTagClicks(container);
    renderPagination();
}

function setBrowseLoading(isLoading) {
    const loading = document.getElementById('browse-loading');
    if (!loading) return;
    loading.classList.toggle('is-hidden', !isLoading);
}

function renderPagination() {
    const pagination = document.getElementById('browse-pagination');
    if (!pagination) return;

    const totalPages = Math.ceil(filteredEntries.length / ITEMS_PER_PAGE);
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
            const total = Math.ceil(filteredEntries.length / ITEMS_PER_PAGE);

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
        const signature = makeKeySignature([label]);
        tagItems.push(`<button type="button" class="entry-tag entry-tag-btn" data-tag-signature="${escapeHtml(signature)}">${escapeHtml(label)}</button>`);
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

function initSearchResults() {
    const input = document.getElementById('browse-search-input');
    const results = document.getElementById('browse-search-results');
    if (!input || !results) return;

    input.addEventListener('input', () => {
        updateSearchResults();
    });

    document.addEventListener('click', (event) => {
        if (!(event.target instanceof Node)) return;
        if (!results.contains(event.target) && event.target !== input) {
            results.classList.add('is-hidden');
        }
    });
}

function updateSearchResults() {
    const input = document.getElementById('browse-search-input');
    const results = document.getElementById('browse-search-results');
    if (!input || !results) return;

    const query = input.value.trim().toLowerCase();
    if (!query) {
        results.classList.add('is-hidden');
        results.innerHTML = '';
        return;
    }

    const matches = allEntries
        .map((entry) => ({ entry, score: scoreEntryMatch(entry, query) }))
        .filter((item) => item.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 6)
        .map((item) => item.entry);

    if (!matches.length) {
        results.innerHTML = '<div class="browse-search-result">No results found.</div>';
        results.classList.remove('is-hidden');
        return;
    }

    results.innerHTML = matches.map((entry) => {
        const journal = entry.journal ? escapeHtml(entry.journal) : 'Journal';
        const title = escapeHtml(entry.title);
        const url = entry.url ? escapeHtml(entry.url) : '';
        return `
            <div class="browse-search-result" data-entry-url="${url}">
                <div class="browse-search-result-title">${title}</div>
                <div class="browse-search-result-meta">${journal}</div>
            </div>
        `;
    }).join('');

    results.classList.remove('is-hidden');

    results.querySelectorAll('.browse-search-result').forEach((result) => {
        result.addEventListener('click', () => {
            const url = result.getAttribute('data-entry-url');
            if (url) {
                window.open(url, '_blank', 'noopener');
                return;
            }
            results.classList.add('is-hidden');
        });
    });
}

function scoreEntryMatch(entry, query) {
    let score = 0;
    if (!entry) return score;
    const title = (entry.title || '').toLowerCase();
    const journal = (entry.journal || '').toLowerCase();
    const author = (entry.author || '').toLowerCase();
    const tags = Array.isArray(entry.tag) ? entry.tag.join(' ').toLowerCase() : '';

    if (title.includes(query)) score += 3;
    if (journal.includes(query)) score += 2;
    if (author.includes(query)) score += 1;
    if (tags.includes(query)) score += 1;
    return score;
}

function initEntryBookmarks(container) {
    const buttons = Array.from(container.querySelectorAll('.btn-bookmark'));
    buttons.forEach((button) => {
        button.addEventListener('click', () => {
            const entryEl = button.closest('.database-entry');
            if (!entryEl) return;
            const entryId = decodeURIComponent(entryEl.getAttribute('data-entry-id') || '');
            if (!entryId) return;

            if (bookmarkedEntries.has(entryId)) {
                bookmarkedEntries.delete(entryId);
            } else {
                const entry = entryLookup.get(entryId);
                if (entry) {
                    bookmarkedEntries.set(entryId, entry);
                    if (!hasShownBookmarkToast) {
                        showBookmarkToast();
                        hasShownBookmarkToast = true;
                    }
                }
            }

            renderBookmarks();
            renderBrowsePage();
        });
    });
}

function initJournalButtons(container) {
    const buttons = Array.from(container.querySelectorAll('.entry-journal-btn'));
    buttons.forEach((button) => {
        button.addEventListener('click', () => {
            const signature = button.getAttribute('data-journal-signature');
            if (!signature) return;
            const input = document.querySelector(`.browse-nav-checkbox-input[data-tag-keys="${signature}"]`);
            if (input) {
                input.checked = true;
                updateActiveTagFilters();
            }
        });
    });
}

function initEntryTagClicks(container) {
    const buttons = Array.from(container.querySelectorAll('.entry-tag-btn'));
    buttons.forEach((button) => {
        button.addEventListener('click', () => {
            const signature = button.getAttribute('data-tag-signature');
            if (!signature) return;
            const input = document.querySelector(`.browse-nav-checkbox-input[data-tag-keys="${signature}"]`);
            if (input) {
                input.checked = true;
                updateActiveTagFilters();
                return;
            }

            const activeContainer = document.getElementById('browse-active-tags');
            if (!activeContainer) return;
            if (activeTagSignatures.has(signature)) return;
            activeTagSignatures.add(signature);
            activeTagFilters.push(signature.split('|').filter(Boolean));
            activeTagSelections.push({ label: button.textContent.trim(), signature });
            renderActiveTagPills();
            updateFilteredEntries();
        });
    });
}

function initBookmarkUI() {
    const toggle = document.getElementById('bookmark-toggle');
    const panel = document.getElementById('bookmark-panel');
    const closeBtn = document.getElementById('bookmark-close');

    if (!toggle || !panel) return;

    toggle.addEventListener('click', () => {
        panel.classList.toggle('is-hidden');
        renderBookmarks();
    });

    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            panel.classList.add('is-hidden');
        });
    }
}

function renderBookmarks() {
    const list = document.getElementById('bookmark-list');
    if (!list) return;

    updateBookmarkCounts();

    if (bookmarkedEntries.size === 0) {
        list.innerHTML = '<p class="bookmark-empty">No bookmarks yet.</p>';
        return;
    }

    const items = Array.from(bookmarkedEntries.values());
    list.innerHTML = items.map((entry) => {
        const title = entry.url
            ? `<a href="${escapeHtml(entry.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(entry.title)}</a>`
            : `<span>${escapeHtml(entry.title)}</span>`;
        const journal = entry.journal ? `Journal: ${escapeHtml(entry.journal)}` : '';
        const entryId = makeEntryId(entry);
        return `
            <div class="bookmark-item">
                <button type="button" class="bookmark-remove" data-entry-id="${escapeHtml(encodeURIComponent(entryId))}" aria-label="Remove bookmark">
                    <i class="ph-fill ph-bookmark-simple"></i>
                </button>
                <div class="bookmark-item-content">
                    ${title}
                    ${journal ? `<p>${journal}</p>` : ''}
                </div>
            </div>
        `;
    }).join('');

    list.querySelectorAll('.bookmark-remove').forEach((button) => {
        button.addEventListener('click', () => {
            const entryId = decodeURIComponent(button.getAttribute('data-entry-id') || '');
            if (!entryId) return;
            bookmarkedEntries.delete(entryId);
            renderBookmarks();
            renderBrowsePage();
        });
    });
}

function updateBookmarkCounts() {
    const countText = `(${bookmarkedEntries.size})`;
    const headerCount = document.getElementById('bookmark-count-panel');
    const buttonCount = document.getElementById('bookmark-count');
    if (headerCount) headerCount.textContent = countText;
    if (buttonCount) buttonCount.textContent = countText;
}

function showBookmarkToast() {
    const toast = document.getElementById('bookmark-toast');
    if (!toast) return;

    toast.classList.remove('is-hidden');
    toast.classList.remove('is-active');
    void toast.offsetWidth;
    toast.classList.add('is-active');

    if (bookmarkToastTimer) {
        clearTimeout(bookmarkToastTimer);
    }

    bookmarkToastTimer = setTimeout(() => {
        toast.classList.add('is-hidden');
        toast.classList.remove('is-active');
    }, 5000);
}

function makeEntryId(entry) {
    const parts = [
        entry.title || '',
        entry.author || '',
        entry.journal || '',
        entry.url || ''
    ];
    return parts.join('||').toLowerCase();
}

function updateActiveTagFilters() {
    const inputs = Array.from(document.querySelectorAll('.browse-nav-checkbox-input'));
    activeTagFilters = [];
    activeTagSignatures = new Set();
    activeTagSelections = [];

    inputs.forEach((input) => {
        if (!input.checked) return;
        const keySignature = input.getAttribute('data-tag-keys') || '';
        const keys = keySignature.split('|').map((key) => key.trim()).filter(Boolean);
        if (!keys.length) return;
        activeTagFilters.push(keys);
        activeTagSignatures.add(makeKeySignature(keys));

        const labelEl = input.closest('.browse-nav-toggle-content')?.querySelector('.browse-nav-label')
            || input.closest('.browse-nav-checkbox')?.querySelector('.browse-nav-label');
        const labelText = labelEl ? labelEl.textContent.replace(/\(\d+\)\s*$/, '').trim() : '';
        if (labelText) {
            activeTagSelections.push({ label: labelText, signature: makeKeySignature(keys) });
        }
    });

    renderActiveTagPills();
    renderActiveTagPills();
    updateFilteredEntries();
}

function updateFilteredEntries() {
    if (!activeTagFilters.length) {
        filteredEntries = allEntries;
    } else {
        filteredEntries = allEntries.filter((entry) => entryMatchesFilters(entry));
    }
    currentPage = 1;
    renderBrowsePage();
}

function entryMatchesFilters(entry) {
    const entryTags = new Set(getNormalizedEntryTags(entry));
    return activeTagFilters.every((filterKeys) => {
        return filterKeys.some((key) => entryTags.has(key));
    });
}

function getNormalizedEntryTags(entry) {
    const tags = Array.isArray(entry.tag) ? entry.tag : [];
    return tags.map((tag) => normalizeTag(tag)).filter(Boolean);
}

function makeKeySignature(keys) {
    const normalized = Array.from(new Set(keys.map((key) => normalizeTag(key)).filter(Boolean))).sort();
    return normalized.join('|');
}

function initActiveTagPills() {
    const container = document.getElementById('browse-active-tags');
    if (!container) return;

    container.addEventListener('click', (event) => {
        const target = event.target;
        if (!(target instanceof HTMLElement)) return;
        const clearButton = target.closest('.active-tag-clear');
        if (clearButton) {
            const inputs = document.querySelectorAll('.browse-nav-checkbox-input');
            inputs.forEach((input) => {
                input.checked = false;
            });
            updateActiveTagFilters();
            return;
        }
        const button = target.closest('.active-tag-remove');
        if (!button) return;
        const signature = button.getAttribute('data-tag-signature');
        if (!signature) return;

        const inputs = document.querySelectorAll(`.browse-nav-checkbox-input[data-tag-keys="${signature}"]`);
        inputs.forEach((input) => {
            input.checked = false;
        });
        updateActiveTagFilters();
    });
}

function renderActiveTagPills() {
    const container = document.getElementById('browse-active-tags');
    if (!container) return;

    if (!activeTagSelections.length) {
        container.innerHTML = '<span class="active-tag-empty">No tag yet</span>';
        return;
    }

    const chips = activeTagSelections.map((selection) => {
        return `
            <span class="active-tag-chip">
                ${escapeHtml(selection.label)}
                <button type="button" class="active-tag-remove" data-tag-signature="${escapeHtml(selection.signature)}" aria-label="Remove ${escapeHtml(selection.label)}">
                    <i class="ph ph-x"></i>
                </button>
            </span>
        `;
    }).join('');

    container.innerHTML = `
        ${chips}
        <button type="button" class="active-tag-clear" id="active-tag-clear">Clear</button>
    `;
}

function renderJournalFilters(entries) {
    const container = document.getElementById('browse-journal-tags');
    if (!container) return;

    const journals = Array.from(
        new Set(entries.map((entry) => entry.journal).filter(Boolean))
    ).sort((a, b) => a.localeCompare(b));

    if (!journals.length) {
        container.innerHTML = '';
        return;
    }

    container.innerHTML = journals.map((journal) => {
        const signature = makeKeySignature([journal]);
        const isChecked = activeTagSignatures.has(signature);
        return `
            <label class="browse-nav-checkbox browse-journal-checkbox">
                <input type="checkbox" class="browse-nav-checkbox-input" data-tag-keys="${escapeHtml(signature)}" ${isChecked ? 'checked' : ''}>
                <span class="browse-nav-label">${escapeHtml(journal)}</span>
            </label>
        `;
    }).join('');

    initTagFilterInputs(container);
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

async function fetchFirstText(paths) {
    let lastError = null;
    for (const path of paths) {
        try {
            return await fetchText(path);
        } catch (error) {
            lastError = error;
        }
    }
    throw lastError;
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

function buildSchemaTree(csvText) {
    const rows = parseCsv(csvText);
    if (rows.length <= 1) return [];

    const header = rows[0].map((cell) => cell.trim().toLowerCase());
    const levelIndex = header.indexOf('level');
    const tagIndex = header.indexOf('tag name');
    const labelIndex = header.indexOf('label');

    if (levelIndex === -1 || labelIndex === -1) return [];

    const root = { level: -1, children: [] };
    const stack = [root];

    rows.slice(1).forEach((row) => {
        const levelValue = row[levelIndex] ? row[levelIndex].trim() : '';
        if (!levelValue) return;
        const level = Number(levelValue);
        if (Number.isNaN(level)) return;

        const key = row[tagIndex] ? row[tagIndex].trim() : '';
        const label = row[labelIndex] ? row[labelIndex].trim() : '';
        if (!label) return;

        const node = {
            level,
            key,
            label,
            children: [],
            count: 0
        };

        while (stack.length && stack[stack.length - 1].level >= level) {
            stack.pop();
        }

        const parent = stack[stack.length - 1] || root;
        parent.children.push(node);
        stack.push(node);
    });

    const updateCounts = (node) => {
        if (!node.children.length) {
            node.count = 0;
            return node.count;
        }
        node.count = node.children.reduce((sum, child) => sum + updateCounts(child) + 1, 0);
        return node.count;
    };

    root.children.forEach((node) => updateCounts(node));
    root.children.forEach((node) => assignAllKeys(node));

    return root.children;
}

function assignAllKeys(node) {
    const keys = new Set();
    if (node.key) {
        keys.add(normalizeTag(node.key));
    }
    if (node.label) {
        keys.add(normalizeTag(node.label));
    }
    node.children.forEach((child) => {
        const childKeys = assignAllKeys(child);
        childKeys.forEach((key) => keys.add(key));
    });
    node.allKeys = Array.from(keys).filter(Boolean);
    return node.allKeys;
}

function buildTagCounts(entries) {
    const counts = new Map();
    entries.forEach((entry) => {
        const tags = Array.isArray(entry.tag) ? entry.tag : [];
        tags.forEach((tag) => {
            const normalized = normalizeTag(tag);
            if (!normalized) return;
            counts.set(normalized, (counts.get(normalized) || 0) + 1);
        });
    });
    return counts;
}

function applyTagCounts(nodes, tagCounts) {
    const compute = (node) => {
        let ownCount = 0;
        if (node.key) {
            ownCount = tagCounts.get(normalizeTag(node.key)) || 0;
        } else {
            ownCount = tagCounts.get(normalizeTag(node.label)) || 0;
        }

        let childrenCount = 0;
        node.children.forEach((child) => {
            childrenCount += compute(child);
        });

        node.count = ownCount + childrenCount;
        return node.count;
    };

    nodes.forEach((node) => compute(node));
}
