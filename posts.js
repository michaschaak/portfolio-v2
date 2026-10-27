let lang = localStorage.getItem("lang") || "nl";
let postsData = [];

function formatDate(iso) {
    const [y, m, d] = iso.split("-");
    const months = lang === "en"
        ? ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
        : ["januari", "februari", "maart", "april", "mei", "juni", "juli", "augustus", "september", "oktober", "november", "december"];
    const month = m ? months[parseInt(m, 10) - 1] : "";
    return [d && parseInt(d, 10), month, y].filter(Boolean).join(" ");
}

function creditList(arr, cls, label) {
    const rows = (arr || [])
        .filter(c => c.firstname || c.lastname)
        .map(c => `<li><span class="role">${lang === "en" && c.credit_en ? c.credit_en : c.credit} - </span><span class="name">${c.firstname} ${c.lastname}</span></li>`)
        .join("");
    return rows
        ? `<details class="post-credits">
         <summary>${label}</summary>
         <ul class="${cls}">${rows}</ul>
       </details>`
        : "";
}

function renderPosts() {
    document.getElementById("posts").innerHTML = postsData
        .filter(raw => raw.id)
        .sort((a, b) => b.date.localeCompare(a.date))
        .map(raw => {
            // English overlay: translated fields replace Dutch, the rest falls back
            const p = lang === "en" && raw.en ? { ...raw, ...raw.en } : raw;

            const props = [formatDate(p.date), p.genre, p.tag]
                .flat()
                .filter(Boolean)
                .map(v => `<span><p>${v}</p></span>`)
                .join("");

            const langtag = [p.taal]
                .flat()
                .filter(Boolean)
                .map(v => `<span><p>${v}</p></span>`)
                .join("");

            // Only render the globe icon (and its wrapper) when a language is set
            const langBlock = langtag
                ? `<div class="post-language">
              <div class="language-icon">
                <svg width="1.4rem" height="1.4rem" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path fill="none" stroke-width="0.07rem" d="M12,23 C18.0751322,23 23,18.0751322 23,12 C23,5.92486775 18.0751322,1 12,1 C5.92486775,1 1,5.92486775 1,12 C1,18.0751322 5.92486775,23 12,23 Z M12,23 C15,23 16,18 16,12 C16,6 15,1 12,1 C9,1 8,6 8,12 C8,18 9,23 12,23 Z M2,16 L22,16 M2,8 L22,8"/>
                </svg>
              </div>
              ${langtag}
            </div>`
                : "";

            const info = [].concat(p.info || [])
                .map(t => `<p>${t}</p>`)
                .join("");

            const links = (p.links || [])
                .filter(l => l.url)
                .map(l => `<a href="${l.url}" target="_blank"><p>${l.label || l.url}</p></a>`)
                .join("");

            const images = (p.images || [])
                .filter(i => i.file)
                .map(i => `<img src="images/${i.file}" alt="${i.alt || ""}">`)
                .join("");

            return `
          <div class="post-container">
            <div class="post-toptext">
              <h1 class="post-title">${p.title}</h1>
              <div class="post-properties">${props}</div>
              <div class="post-more-info">
${info}
${langBlock}
              <div class="post-cred-link-container">
${creditList(p.cast, "post-cast", "cast")}
${creditList(p.crew, "post-crew", "crew")}
${links ? `<div class="post-links">${links}</div>` : ""}
              </div>
              </div>
            </div>
${images}
          </div>`;
        })
        .join("");
}

function updateStatic() {
    document.documentElement.lang = lang;
    document.getElementById("bio-nl").hidden = lang !== "nl";
    document.getElementById("bio-en").hidden = lang !== "en";
    document.querySelectorAll("[data-en]").forEach(el => {
        el.textContent = lang === "en" ? el.dataset.en : el.dataset.nl;
    });
}

function setPostsLang(l) {
    lang = l;
    localStorage.setItem("lang", l);
    renderPosts();
    updateStatic();
}

function toggleLang() {
    setPostsLang(lang === "nl" ? "en" : "nl");
}

fetch("workposts.json")
    .then(res => res.json())
    .then(posts => {
        postsData = posts;
        renderPosts();
    })
    .catch(err => console.error("Could not load workposts.json:", err));

updateStatic();