import"./script-YnJ9GOSE.js";import"./gsap-Dv6COrL5.js";import"./glossary-CUDEyueV.js";const U="/src/data/browse-samples.json",J="/src/data/schema key name translation.csv";function G(t){Array.from(t.querySelectorAll(".browse-nav-toggle")).forEach(e=>{e.addEventListener("click",()=>{const a=e.getAttribute("aria-controls");if(!a)return;const s=t.querySelector(`#${a}`),r=e.getAttribute("aria-expanded")==="true";e.setAttribute("aria-expanded",String(!r)),e.classList.toggle("is-open",!r),s&&s.classList.toggle("is-open",!r);const o=e.querySelector(".ph-bold");o&&o.classList.toggle("is-rotated",!r)})})}function _(t){const n=document.getElementById("browse-nav");n&&(n.innerHTML=t.map((e,a)=>{const s=`schema-section-${a}`,r=e.children.length>0,o=e.count,c=!!e.key,u=c?v(e.allKeys||[]):"",l=c&&y.has(u);return`
            <div class="browse-nav-section">
                ${r?`
                <button type="button" class="browse-nav-toggle" aria-expanded="false" aria-controls="${s}">
                    <span class="browse-nav-toggle-content">
                        ${c?`<input type="checkbox" class="browse-nav-checkbox-input" data-tag-keys="${i(u)}" ${l?"checked":""}>`:""}
                        <span class="browse-nav-label">${i(e.label)} <span class="browse-nav-count">(${o})</span></span>
                    </span>
                    <i class="ph-bold ph-caret-right"></i>
                </button>
            `:`
                <div class="browse-nav-leaf">
                    ${c?`
                        <label class="browse-nav-checkbox">
                            <input type="checkbox" class="browse-nav-checkbox-input" data-tag-keys="${i(u)}" ${l?"checked":""}>
                            <span class="browse-nav-label">${i(e.label)} <span class="browse-nav-count">(${o})</span></span>
                        </label>
                    `:`
                        <span class="browse-nav-label">${i(e.label)} <span class="browse-nav-count">(${o})</span></span>
                    `}
                </div>
            `}
                ${r?`<div class="browse-nav-children" id="${s}">${P(e.children)}</div>`:""}
            </div>
        `}).join(""),G(n),q(n))}function P(t){return t.map((n,e)=>{const a=`schema-node-${n.key||"label"}-${e}`,s=n.children.length>0,r=i(n.label),o=n.count,c=!!n.key,u=c?v(n.allKeys||[]):"",l=c&&y.has(u);return`
            <div class="browse-nav-item">
                ${s?`
                    <button type="button" class="browse-nav-toggle browse-nav-item-toggle" aria-expanded="false" aria-controls="${a}">
                        <span class="browse-nav-toggle-content">
                            ${c?`<input type="checkbox" class="browse-nav-checkbox-input" data-tag-keys="${i(u)}" ${l?"checked":""}>`:""}
                            <span class="browse-nav-label">${r} <span class="browse-nav-count">(${o})</span></span>
                        </span>
                        <i class="ph-bold ph-caret-right"></i>
                    </button>
                    <div class="browse-nav-children" id="${a}">
                        ${P(n.children)}
                    </div>
                `:`
                    <div class="browse-nav-leaf">
                        ${c?`
                            <label class="browse-nav-checkbox">
                                <input type="checkbox" class="browse-nav-checkbox-input" data-tag-keys="${i(u)}" ${l?"checked":""}>
                                <span class="browse-nav-label">${r}</span>
                            </label>
                        `:`
                            <span class="browse-nav-label">${r}</span>
                        `}
                    </div>
                `}
            </div>
        `}).join("")}function q(t){Array.from(t.querySelectorAll(".browse-nav-checkbox-input")).forEach(e=>{e.addEventListener("click",a=>{a.stopPropagation()}),e.addEventListener("change",()=>{L()})})}function i(t){const n=document.createElement("div");return n.textContent=t,n.innerHTML}const V="15370931",R="EP8Dfm0nzHmIoDd1xYF8FIxj",Z=`https://api.zotero.org/users/${V}`,Y=`${Z}/items?format=json`,Q=`${Z}/collections?format=json`,k=100;let j=new Map;const T=10;let h=[],d=1,w=[],E=[],$=[],y=new Set,A=[],K=new Map;const m=new Map;document.addEventListener("DOMContentLoaded",()=>{W()});async function W(){try{const t=await $t(J);j=Lt(t),w=Tt(t),_(w),kt(),I()}catch(t){console.error("Tag schema fetch failed:",t),j=new Map}mt(),pt(),await X()}async function X(){try{S(!0);const[t,n]=await Promise.all([et(),tt()]),e=nt(t),a=t.filter(c=>!(c&&c.data&&c.data.parentCollection));console.info("[Zotero] collections:",t.length,"top-level:",a.length);const r=n.filter(ot).map(c=>at(c,e)),o=new Set(r.map(c=>c.journal).filter(Boolean));console.info("[Zotero] items:",n.length,"rendered:",r.length),console.info("[Zotero] unique journals:",o.size),N(r),S(!1)}catch(t){console.error("Zotero fetch failed, using samples:",t);const n=await Et(U);N(n),S(!1)}}async function tt(){const t=[];let n=0;for(;;){const e=`${Y}&limit=${k}&start=${n}`,a=await fetch(e,{headers:{"Zotero-API-Key":R}});if(!a.ok)throw new Error(`Zotero API error: ${a.status}`);const s=await a.json();if(t.push(...s),s.length<k)break;n+=k}return t}async function et(){const t=[];let n=0;for(;;){const e=`${Q}&limit=${k}&start=${n}`,a=await fetch(e,{headers:{"Zotero-API-Key":R}});if(!a.ok)throw new Error(`Zotero collections error: ${a.status}`);const s=await a.json();if(t.push(...s),s.length<k)break;n+=k}return t}function nt(t){const n=new Map;return Array.isArray(t)&&t.forEach(e=>{const a=e&&(e.key||e.data&&e.data.key),s=e&&e.data&&e.data.name,r=e&&e.data&&e.data.parentCollection;a&&s&&n.set(a,{name:s,parent:r})}),n}function at(t,n){const e=t&&t.data?t.data:{},a=Array.isArray(e.creators)?e.creators:[],s=Array.isArray(e.tags)?e.tags:[],r=Array.isArray(e.collections)?e.collections:[],o=st(r,n),c=a.map(f=>ct(f)).filter(Boolean).join("; "),u=e.url||(e.DOI?`https://doi.org/${e.DOI}`:""),l=e.publicationTitle||e.journalAbbreviation||o[0]||"",b=rt(e,s),g=[...s.map(f=>typeof f=="string"?f:f.tag).filter(Boolean),...o,l].filter(Boolean),C=Array.from(new Set(g));return{title:e.title||"Untitled",journal:l,author:c,tag:C,brief:e.abstractNote||"",open_access:b,url:u}}function st(t,n){const e=new Set,a=new Set;return t.forEach(s=>{let r=s;for(;r&&!a.has(r);){a.add(r);const o=n.get(r);if(!o)break;if(!o.parent){e.add(o.name);break}r=o.parent}}),Array.from(e)}function rt(t,n){const e=(t.accessRights||t.rights||"").toLowerCase();if(e.includes("open"))return!0;if(e.includes("closed")||e.includes("restricted"))return!1;const a=n.map(s=>typeof s=="string"?s:s.tag).filter(Boolean).map(s=>s.toLowerCase());if(a.includes("open access")||a.includes("open-access"))return!0;if(a.includes("closed access")||a.includes("restricted access"))return!1}function ot(t){const n=t&&t.data?t.data:{},e=n.itemType||"";if(e==="attachment"||e==="note")return!1;const a=(n.title||"").trim(),s=Array.isArray(n.creators)?n.creators:[],r=Array.isArray(n.tags)?n.tags:[],o=(n.publicationTitle||n.journalAbbreviation||"").trim(),c=(n.abstractNote||"").trim(),u=s.length>0||r.length>0||o||c;return!(a.toLowerCase()==="pdf"&&!u)}function ct(t){if(!t)return"";if(t.name)return t.name;const n=[];return t.firstName&&n.push(t.firstName),t.lastName&&n.push(t.lastName),n.join(" ").trim()}function N(t){if(h=Array.isArray(t)?t:[],K=new Map(h.map(n=>[M(n),n])),d=1,w.length){const n=It(h);xt(w,n),_(w)}wt(h),O(),z()}function it(t){const n=M(t),e=m.has(n),a=t.url?`<a href="${i(t.url)}" target="_blank" rel="noopener noreferrer">${i(t.title)}</a>`:`<span>${i(t.title)}</span>`,s=t.journal?`<h4 class="entry-journal">Journal: <button type="button" class="entry-journal-btn" data-journal-signature="${i(v([t.journal]))}">${i(t.journal)}</button></h4>`:"",r=t.author?`<p class="entry-authors">${i(t.author)}</p>`:"",o=ut(t);return`
        <div class="database-entry" data-entry-id="${i(encodeURIComponent(n))}">
            <button class="btn-bookmark ${e?"is-active":""}" type="button" aria-label="Bookmark article">
                <i class="${e?"ph-fill":"ph-bold"} ph-bookmark-simple"></i>
            </button>
            <div class="database-entry-text">
                <h3>${a}</h3>
                ${s}
                ${r}
                <p class="entry-description">${i(t.brief||"")}</p>
                <hr>
                ${o}
            </div>
        </div>
    `}function x(){const t=document.querySelector(".database-entries");if(!t)return;const n=(d-1)*T,e=n+T,a=E.slice(n,e);t.innerHTML=a.map(s=>it(s)).join(""),dt(t),bt(t),gt(t),ht(t),lt()}function S(t){const n=document.getElementById("browse-loading");n&&n.classList.toggle("is-hidden",!t)}function lt(){const t=document.getElementById("browse-pagination");if(!t)return;const n=Math.ceil(E.length/T);if(n<=1){t.innerHTML="";return}const e=d===1?"is-disabled":"",a=d===n?"is-disabled":"",s=Array.from({length:n},(r,o)=>{const c=o+1;return`<button type="button" class="page-btn ${c===d?"is-active":""}" data-page="${c}">${c}</button>`}).join("");t.innerHTML=`
        <button type="button" class="page-btn page-btn-nav ${e}" data-page="first" aria-label="First page">«</button>
        <button type="button" class="page-btn page-btn-nav ${e}" data-page="prev" aria-label="Previous page">‹</button>
        ${s}
        <button type="button" class="page-btn page-btn-nav ${a}" data-page="next" aria-label="Next page">›</button>
        <button type="button" class="page-btn page-btn-nav ${a}" data-page="last" aria-label="Last page">»</button>
    `,t.querySelectorAll("[data-page]").forEach(r=>{r.addEventListener("click",()=>{const o=r.getAttribute("data-page"),c=Math.ceil(E.length/T);o==="first"?d=1:o==="prev"?d=Math.max(1,d-1):o==="next"?d=Math.min(c,d+1):o==="last"?d=c:d=Number(o)||1,x()})})}function ut(t){const n=Array.isArray(t.tag)?t.tag:[],e=[];return t.open_access===!0?e.push(`
            <div class="entry-tag tag-open-access">
                Open access <i class="ph ph-folder-open"></i>
            </div>
        `):t.open_access===!1&&e.push(`
            <div class="entry-tag">
                Closed access <i class="ph ph-lock"></i>
            </div>
        `),n.forEach(a=>{const s=At(a),r=v([s]);e.push(`<button type="button" class="entry-tag entry-tag-btn" data-tag-signature="${i(r)}">${i(s)}</button>`)}),e.length===0?"":`
        <div class="entry-tags is-collapsed">
            <div class="entry-tags-list">
                ${e.join("")}
            </div>
            <button class="btn-expand-tag" type="button">
                <p>Expand</p>
                <i class="ph-bold ph-caret-down"></i>
            </button>
        </div>
    `}function dt(t){Array.from(t.querySelectorAll(".btn-expand-tag")).forEach(e=>{e.addEventListener("click",()=>{const a=e.closest(".entry-tags");if(!a)return;const s=e.closest(".database-entry"),r=a.classList.contains("is-expanded");a.classList.toggle("is-expanded",!r),a.classList.toggle("is-collapsed",r),s&&s.classList.toggle("is-expanded",!r);const o=e.querySelector("p");o&&(o.textContent=r?"Expand":"Collapse")})})}function pt(){const t=document.getElementById("browse-search-input"),n=document.getElementById("browse-search-results");!t||!n||(t.addEventListener("input",()=>{z()}),document.addEventListener("click",e=>{e.target instanceof Node&&!n.contains(e.target)&&e.target!==t&&n.classList.add("is-hidden")}))}function z(){const t=document.getElementById("browse-search-input"),n=document.getElementById("browse-search-results");if(!t||!n)return;const e=t.value.trim().toLowerCase();if(!e){n.classList.add("is-hidden"),n.innerHTML="";return}const a=h.map(s=>({entry:s,score:ft(s,e)})).filter(s=>s.score>0).sort((s,r)=>r.score-s.score).slice(0,6).map(s=>s.entry);if(!a.length){n.innerHTML='<div class="browse-search-result">No results found.</div>',n.classList.remove("is-hidden");return}n.innerHTML=a.map(s=>{const r=s.journal?i(s.journal):"Journal",o=i(s.title);return`
            <div class="browse-search-result" data-entry-url="${s.url?i(s.url):""}">
                <div class="browse-search-result-title">${o}</div>
                <div class="browse-search-result-meta">${r}</div>
            </div>
        `}).join(""),n.classList.remove("is-hidden"),n.querySelectorAll(".browse-search-result").forEach(s=>{s.addEventListener("click",()=>{const r=s.getAttribute("data-entry-url");if(r){window.open(r,"_blank","noopener");return}n.classList.add("is-hidden")})})}function ft(t,n){let e=0;if(!t)return e;const a=(t.title||"").toLowerCase(),s=(t.journal||"").toLowerCase(),r=(t.author||"").toLowerCase(),o=Array.isArray(t.tag)?t.tag.join(" ").toLowerCase():"";return a.includes(n)&&(e+=3),s.includes(n)&&(e+=2),r.includes(n)&&(e+=1),o.includes(n)&&(e+=1),e}function bt(t){Array.from(t.querySelectorAll(".btn-bookmark")).forEach(e=>{e.addEventListener("click",()=>{const a=e.closest(".database-entry");if(!a)return;const s=decodeURIComponent(a.getAttribute("data-entry-id")||"");if(s){if(m.has(s))m.delete(s);else{const r=K.get(s);r&&m.set(s,r)}B(),x()}})})}function gt(t){Array.from(t.querySelectorAll(".entry-journal-btn")).forEach(e=>{e.addEventListener("click",()=>{const a=e.getAttribute("data-journal-signature");if(!a)return;const s=document.querySelector(`.browse-nav-checkbox-input[data-tag-keys="${a}"]`);s&&(s.checked=!0,L())})})}function ht(t){Array.from(t.querySelectorAll(".entry-tag-btn")).forEach(e=>{e.addEventListener("click",()=>{const a=e.getAttribute("data-tag-signature");if(!a)return;const s=document.querySelector(`.browse-nav-checkbox-input[data-tag-keys="${a}"]`);if(s){s.checked=!0,L();return}document.getElementById("browse-active-tags")&&(y.has(a)||(y.add(a),$.push(a.split("|").filter(Boolean)),A.push({label:e.textContent.trim(),signature:a}),I(),O()))})})}function mt(){const t=document.getElementById("bookmark-toggle"),n=document.getElementById("bookmark-panel"),e=document.getElementById("bookmark-close");!t||!n||(t.addEventListener("click",()=>{n.classList.toggle("is-hidden"),B()}),e&&e.addEventListener("click",()=>{n.classList.add("is-hidden")}))}function B(){const t=document.getElementById("bookmark-list");if(!t)return;if(m.size===0){t.innerHTML='<p class="bookmark-empty">No bookmarks yet.</p>';return}const n=Array.from(m.values());t.innerHTML=n.map(e=>{const a=e.url?`<a href="${i(e.url)}" target="_blank" rel="noopener noreferrer">${i(e.title)}</a>`:`<span>${i(e.title)}</span>`,s=e.journal?`Journal: ${i(e.journal)}`:"",r=M(e);return`
            <div class="bookmark-item">
                <button type="button" class="bookmark-remove" data-entry-id="${i(encodeURIComponent(r))}" aria-label="Remove bookmark">
                    <i class="ph-fill ph-bookmark-simple"></i>
                </button>
                <div class="bookmark-item-content">
                    ${a}
                    ${s?`<p>${s}</p>`:""}
                </div>
            </div>
        `}).join(""),t.querySelectorAll(".bookmark-remove").forEach(e=>{e.addEventListener("click",()=>{const a=decodeURIComponent(e.getAttribute("data-entry-id")||"");a&&(m.delete(a),B(),x())})})}function M(t){return[t.title||"",t.author||"",t.journal||"",t.url||""].join("||").toLowerCase()}function L(){const t=Array.from(document.querySelectorAll(".browse-nav-checkbox-input"));$=[],y=new Set,A=[],t.forEach(n=>{if(!n.checked)return;const a=(n.getAttribute("data-tag-keys")||"").split("|").map(o=>o.trim()).filter(Boolean);if(!a.length)return;$.push(a),y.add(v(a));const s=n.closest(".browse-nav-toggle-content")?.querySelector(".browse-nav-label")||n.closest(".browse-nav-checkbox")?.querySelector(".browse-nav-label"),r=s?s.textContent.replace(/\(\d+\)\s*$/,"").trim():"";r&&A.push({label:r,signature:v(a)})}),I(),I(),O()}function O(){$.length?E=h.filter(t=>yt(t)):E=h,d=1,x()}function yt(t){const n=new Set(vt(t));return $.every(e=>e.some(a=>n.has(a)))}function vt(t){return(Array.isArray(t.tag)?t.tag:[]).map(e=>p(e)).filter(Boolean)}function v(t){return Array.from(new Set(t.map(e=>p(e)).filter(Boolean))).sort().join("|")}function kt(){const t=document.getElementById("browse-active-tags");t&&t.addEventListener("click",n=>{const e=n.target;if(!(e instanceof HTMLElement))return;if(e.closest(".active-tag-clear")){document.querySelectorAll(".browse-nav-checkbox-input").forEach(u=>{u.checked=!1}),L();return}const s=e.closest(".active-tag-remove");if(!s)return;const r=s.getAttribute("data-tag-signature");if(!r)return;document.querySelectorAll(`.browse-nav-checkbox-input[data-tag-keys="${r}"]`).forEach(c=>{c.checked=!1}),L()})}function I(){const t=document.getElementById("browse-active-tags");if(!t)return;if(!A.length){t.innerHTML='<span class="active-tag-empty">No tag yet</span>';return}const n=A.map(e=>`
            <span class="active-tag-chip">
                ${i(e.label)}
                <button type="button" class="active-tag-remove" data-tag-signature="${i(e.signature)}" aria-label="Remove ${i(e.label)}">
                    <i class="ph ph-x"></i>
                </button>
            </span>
        `).join("");t.innerHTML=`
        ${n}
        <button type="button" class="active-tag-clear" id="active-tag-clear">Clear</button>
    `}function wt(t){const n=document.getElementById("browse-journal-tags");if(!n)return;const e=Array.from(new Set(t.map(a=>a.journal).filter(Boolean))).sort((a,s)=>a.localeCompare(s));if(!e.length){n.innerHTML="";return}n.innerHTML=e.map(a=>{const s=v([a]),r=y.has(s);return`
            <label class="browse-nav-checkbox browse-journal-checkbox">
                <input type="checkbox" class="browse-nav-checkbox-input" data-tag-keys="${i(s)}" ${r?"checked":""}>
                <span class="browse-nav-label">${i(a)}</span>
            </label>
        `}).join(""),q(n)}async function Et(t){const n=await fetch(t);if(!n.ok)throw new Error(`Failed to load ${t}: ${n.status}`);return n.json()}async function $t(t){const n=await fetch(t);if(!n.ok)throw new Error(`Failed to load ${t}: ${n.status}`);return n.text()}function At(t){if(!t)return"";const n=typeof t=="string"?t:t.tag;if(!n)return"";const e=p(n);return j.get(e)||n}function p(t){return t.trim().toLowerCase().replace(/\s+/g,"")}function Lt(t){const n=F(t);if(!n.length)return new Map;const e=n[0].map(o=>o.trim().toLowerCase()),a=e.indexOf("tag name"),s=e.indexOf("label"),r=new Map;return a===-1||s===-1||n.slice(1).forEach(o=>{const c=o[a]?o[a].trim():"",u=o[s]?o[s].trim():"";u&&(c&&r.set(p(c),u),r.set(p(u),u))}),r}function F(t){const n=[];let e=[],a="",s=!1;for(let r=0;r<t.length;r+=1){const o=t[r],c=t[r+1];if(o==='"'&&c==='"'){a+='"',r+=1;continue}if(o==='"'){s=!s;continue}if(o===","&&!s){e.push(a),a="";continue}if((o===`
`||o==="\r")&&!s){o==="\r"&&c===`
`&&(r+=1),e.push(a),e.some(u=>u.length>0)&&n.push(e),e=[],a="";continue}a+=o}return e.push(a),e.some(r=>r.length>0)&&n.push(e),n}function Tt(t){const n=F(t);if(n.length<=1)return[];const e=n[0].map(l=>l.trim().toLowerCase()),a=e.indexOf("level"),s=e.indexOf("tag name"),r=e.indexOf("label");if(a===-1||r===-1)return[];const o={level:-1,children:[]},c=[o];n.slice(1).forEach(l=>{const b=l[a]?l[a].trim():"";if(!b)return;const g=Number(b);if(Number.isNaN(g))return;const C=l[s]?l[s].trim():"",f=l[r]?l[r].trim():"";if(!f)return;const H={level:g,key:C,label:f,children:[],count:0};for(;c.length&&c[c.length-1].level>=g;)c.pop();(c[c.length-1]||o).children.push(H),c.push(H)});const u=l=>l.children.length?(l.count=l.children.reduce((b,g)=>b+u(g)+1,0),l.count):(l.count=0,l.count);return o.children.forEach(l=>u(l)),o.children.forEach(l=>D(l)),o.children}function D(t){const n=new Set;return t.key&&n.add(p(t.key)),t.label&&n.add(p(t.label)),t.children.forEach(e=>{D(e).forEach(s=>n.add(s))}),t.allKeys=Array.from(n).filter(Boolean),t.allKeys}function It(t){const n=new Map;return t.forEach(e=>{(Array.isArray(e.tag)?e.tag:[]).forEach(s=>{const r=p(s);r&&n.set(r,(n.get(r)||0)+1)})}),n}function xt(t,n){const e=a=>{let s=0;a.key?s=n.get(p(a.key))||0:s=n.get(p(a.label))||0;let r=0;return a.children.forEach(o=>{r+=e(o)}),a.count=s+r,a.count};t.forEach(a=>e(a))}
