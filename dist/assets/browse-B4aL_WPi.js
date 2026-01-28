import"./script-YnJ9GOSE.js";import"./gsap-Dv6COrL5.js";import"./glossary-CUDEyueV.js";const I="/src/data/glossary.json",j="/src/data/browse-samples.json",C="/src/data/schema key name translation.csv";function x(t){const n=document.getElementById("browse-nav");n&&(n.innerHTML=t.map((e,s)=>{const a=u(e.section),r=e.items.length,o=`browse-section-${s}`;return`
            <div class="browse-nav-section">
                <button type="button" class="browse-nav-toggle" aria-expanded="false" aria-controls="${o}">
                    <span>${a} <span class="browse-nav-count">(${r})</span></span>
                    <i class="ph-bold ph-caret-right"></i>
                </button>
                <div class="browse-nav-children" id="${o}">
                    ${e.items.map((i,c)=>w(i,s,[c+1])).join("")}
                </div>
            </div>
        `}).join(""),O(n))}function w(t,n,e){const s=_(e),a=Array.isArray(t.subitems)&&t.subitems.length>0,r=`browse-${n}-${e.join("-")}`,o=`${s}. ${u(t.title)}`,i=a?"browse-nav-toggle browse-nav-item-toggle":"browse-nav-leaf",c=a?'<i class="ph-bold ph-caret-right"></i>':"",b=a?` aria-expanded="false" aria-controls="${r}"`:"",h=a?`<div class="browse-nav-children" id="${r}">
                ${t.subitems.map((d,L)=>w(d,n,[...e,L+1])).join("")}
           </div>`:"";return`
        <div class="browse-nav-item">
            <button type="button" class="${i}"${b}>
                <span class="browse-nav-label">${o}</span>
                ${c}
            </button>
            ${h}
        </div>
    `}function O(t){Array.from(t.querySelectorAll(".browse-nav-toggle")).forEach(e=>{e.addEventListener("click",()=>{const s=e.getAttribute("aria-controls");if(!s)return;const a=t.querySelector(`#${s}`),r=e.getAttribute("aria-expanded")==="true";e.setAttribute("aria-expanded",String(!r)),e.classList.toggle("is-open",!r),a&&a.classList.toggle("is-open",!r);const o=e.querySelector(".ph-bold");o&&o.classList.toggle("is-rotated",!r)})})}function _(t){return t.join(".")}function u(t){const n=document.createElement("div");return n.textContent=t,n.innerHTML}const M="15370931",$="EP8Dfm0nzHmIoDd1xYF8FIxj",E=`https://api.zotero.org/users/${M}`,k=`${E}/items?format=json`,S=`${E}/collections?format=json`,p=100;let m=new Map;const f=10;let g=[],l=1;document.addEventListener("DOMContentLoaded",()=>{P()});async function P(){try{const t=await Y(C);m=W(t)}catch(t){console.error("Tag schema fetch failed:",t),m=new Map}try{const t=await T(I);x(t)}catch(t){console.error("Glossary fetch failed:",t)}await B()}async function B(){try{const[t,n]=await Promise.all([Z(),N()]),e=H(t),s=t.filter(i=>!(i&&i.data&&i.data.parentCollection));console.info("[Zotero] collections:",t.length,"top-level:",s.length);const r=n.filter(z).map(i=>D(i,e)),o=new Set(r.map(i=>i.journal).filter(Boolean));console.info("[Zotero] items:",n.length,"rendered:",r.length),console.info("[Zotero] unique journals:",o.size),v(r)}catch(t){console.error("Zotero fetch failed, using samples:",t);const n=await T(j);v(n)}}async function N(){const t=[];let n=0;for(;;){const e=`${k}&limit=${p}&start=${n}`,s=await fetch(e,{headers:{"Zotero-API-Key":$}});if(!s.ok)throw new Error(`Zotero API error: ${s.status}`);const a=await s.json();if(t.push(...a),a.length<p)break;n+=p}return t}async function Z(){const t=[];let n=0;for(;;){const e=`${S}&limit=${p}&start=${n}`,s=await fetch(e,{headers:{"Zotero-API-Key":$}});if(!s.ok)throw new Error(`Zotero collections error: ${s.status}`);const a=await s.json();if(t.push(...a),a.length<p)break;n+=p}return t}function H(t){const n=new Map;return Array.isArray(t)&&t.forEach(e=>{const s=e&&(e.key||e.data&&e.data.key),a=e&&e.data&&e.data.name,r=e&&e.data&&e.data.parentCollection;s&&a&&n.set(s,{name:a,parent:r})}),n}function D(t,n){const e=t&&t.data?t.data:{},s=Array.isArray(e.creators)?e.creators:[],a=Array.isArray(e.tags)?e.tags:[],r=Array.isArray(e.collections)?e.collections:[],o=R(r,n),i=s.map(d=>F(d)).filter(Boolean).join("; "),c=e.url||(e.DOI?`https://doi.org/${e.DOI}`:""),b=e.publicationTitle||e.journalAbbreviation||o[0]||"",h=q(e,a);return{title:e.title||"Untitled",journal:b,author:i,tag:[...a.map(d=>typeof d=="string"?d:d.tag).filter(Boolean),...o],brief:e.abstractNote||"",open_access:h,url:c}}function R(t,n){const e=new Set,s=new Set;return t.forEach(a=>{let r=a;for(;r&&!s.has(r);){s.add(r);const o=n.get(r);if(!o)break;if(!o.parent){e.add(o.name);break}r=o.parent}}),Array.from(e)}function q(t,n){const e=(t.accessRights||t.rights||"").toLowerCase();if(e.includes("open"))return!0;if(e.includes("closed")||e.includes("restricted"))return!1;const s=n.map(a=>typeof a=="string"?a:a.tag).filter(Boolean).map(a=>a.toLowerCase());if(s.includes("open access")||s.includes("open-access"))return!0;if(s.includes("closed access")||s.includes("restricted access"))return!1}function z(t){const n=t&&t.data?t.data:{},e=n.itemType||"";if(e==="attachment"||e==="note")return!1;const s=(n.title||"").trim(),a=Array.isArray(n.creators)?n.creators:[],r=Array.isArray(n.tags)?n.tags:[],o=(n.publicationTitle||n.journalAbbreviation||"").trim(),i=(n.abstractNote||"").trim(),c=a.length>0||r.length>0||o||i;return!(s.toLowerCase()==="pdf"&&!c)}function F(t){if(!t)return"";if(t.name)return t.name;const n=[];return t.firstName&&n.push(t.firstName),t.lastName&&n.push(t.lastName),n.join(" ").trim()}function v(t){g=Array.isArray(t)?t:[],l=1,A()}function G(t){const n=t.url?`<a href="${u(t.url)}" target="_blank" rel="noopener noreferrer">${u(t.title)}</a>`:`<span>${u(t.title)}</span>`,e=t.journal?`<h4 class="entry-journal">Journal: ${u(t.journal)}</h4>`:"",s=t.author?`<p class="entry-authors">${u(t.author)}</p>`:"",a=J(t);return`
        <div class="database-entry">
            <button class="btn-bookmark" type="button" aria-label="Bookmark article">
                <i class="ph-bold ph-bookmark-simple"></i>
            </button>
            <div class="database-entry-text">
                <h3>${n}</h3>
                ${e}
                ${s}
                <p class="entry-description">${u(t.brief||"")}</p>
                <hr>
                ${a}
            </div>
        </div>
    `}function A(){const t=document.querySelector(".database-entries");if(!t)return;const n=(l-1)*f,e=n+f,s=g.slice(n,e);t.innerHTML=s.map(a=>G(a)).join(""),U(t),K()}function K(){const t=document.getElementById("browse-pagination");if(!t)return;const n=Math.ceil(g.length/f);if(n<=1){t.innerHTML="";return}const e=l===1?"is-disabled":"",s=l===n?"is-disabled":"",a=Array.from({length:n},(r,o)=>{const i=o+1;return`<button type="button" class="page-btn ${i===l?"is-active":""}" data-page="${i}">${i}</button>`}).join("");t.innerHTML=`
        <button type="button" class="page-btn page-btn-nav ${e}" data-page="first" aria-label="First page">«</button>
        <button type="button" class="page-btn page-btn-nav ${e}" data-page="prev" aria-label="Previous page">‹</button>
        ${a}
        <button type="button" class="page-btn page-btn-nav ${s}" data-page="next" aria-label="Next page">›</button>
        <button type="button" class="page-btn page-btn-nav ${s}" data-page="last" aria-label="Last page">»</button>
    `,t.querySelectorAll("[data-page]").forEach(r=>{r.addEventListener("click",()=>{const o=r.getAttribute("data-page"),i=Math.ceil(g.length/f);o==="first"?l=1:o==="prev"?l=Math.max(1,l-1):o==="next"?l=Math.min(i,l+1):o==="last"?l=i:l=Number(o)||1,A()})})}function J(t){const n=Array.isArray(t.tag)?t.tag:[],e=[];return t.open_access===!0?e.push(`
            <div class="entry-tag tag-open-access">
                Open access <i class="ph ph-folder-open"></i>
            </div>
        `):t.open_access===!1&&e.push(`
            <div class="entry-tag">
                Closed access <i class="ph ph-lock"></i>
            </div>
        `),n.forEach(s=>{const a=Q(s);e.push(`<div class="entry-tag">${u(a)}</div>`)}),e.length===0?"":`
        <div class="entry-tags is-collapsed">
            <div class="entry-tags-list">
                ${e.join("")}
            </div>
            <button class="btn-expand-tag" type="button">
                <p>Expand</p>
                <i class="ph-bold ph-caret-down"></i>
            </button>
        </div>
    `}function U(t){Array.from(t.querySelectorAll(".btn-expand-tag")).forEach(e=>{e.addEventListener("click",()=>{const s=e.closest(".entry-tags");if(!s)return;const a=e.closest(".database-entry"),r=s.classList.contains("is-expanded");s.classList.toggle("is-expanded",!r),s.classList.toggle("is-collapsed",r),a&&a.classList.toggle("is-expanded",!r);const o=e.querySelector("p");o&&(o.textContent=r?"Expand":"Collapse")})})}async function T(t){const n=await fetch(t);if(!n.ok)throw new Error(`Failed to load ${t}: ${n.status}`);return n.json()}async function Y(t){const n=await fetch(t);if(!n.ok)throw new Error(`Failed to load ${t}: ${n.status}`);return n.text()}function Q(t){if(!t)return"";const n=typeof t=="string"?t:t.tag;if(!n)return"";const e=y(n);return m.get(e)||n}function y(t){return t.trim().toLowerCase().replace(/\s+/g,"")}function W(t){const n=V(t);if(!n.length)return new Map;const e=n[0].map(o=>o.trim().toLowerCase()),s=e.indexOf("tag name"),a=e.indexOf("label"),r=new Map;return s===-1||a===-1||n.slice(1).forEach(o=>{const i=o[s]?o[s].trim():"",c=o[a]?o[a].trim():"";c&&(i&&r.set(y(i),c),r.set(y(c),c))}),r}function V(t){const n=[];let e=[],s="",a=!1;for(let r=0;r<t.length;r+=1){const o=t[r],i=t[r+1];if(o==='"'&&i==='"'){s+='"',r+=1;continue}if(o==='"'){a=!a;continue}if(o===","&&!a){e.push(s),s="";continue}if((o===`
`||o==="\r")&&!a){o==="\r"&&i===`
`&&(r+=1),e.push(s),e.some(c=>c.length>0)&&n.push(e),e=[],s="";continue}s+=o}return e.push(s),e.some(r=>r.length>0)&&n.push(e),n}
