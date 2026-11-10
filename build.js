// Generates /werk/<id>/index.html for every post in workposts.json
// and rebuilds sitemap.xml. Usage: node build.js  (no dependencies)

const fs = require("fs");
const path = require("path");

const SITE = "https://www.sebastiaandistelmans.be";
const posts = JSON.parse(fs.readFileSync("workposts.json", "utf8")).filter(p => p.id);

const MONTHS = {
  nl: ["januari", "februari", "maart", "april", "mei", "juni", "juli", "augustus", "september", "oktober", "november", "december"],
  en: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
};

const esc = s => String(s ?? "").replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const stripTags = s => String(s ?? "").replace(/<[^>]+>/g, "");

function formatDate(iso, lang) {
  const [y, m, d] = iso.split("-");
  const month = m ? MONTHS[lang][parseInt(m, 10) - 1] : "";
  return [d && parseInt(d, 10), month, y].filter(Boolean).join(" ");
}

function creditList(arr, cls, label, lang) {
  const rows = (arr || [])
    .filter(c => c.firstname || c.lastname)
    .map(c => `<li><span class="role">${lang === "en" && c.credit_en ? c.credit_en : c.credit}</span><span class="dash">-</span><span class="name">${c.firstname} ${c.lastname}</span></li>`)
    .join("");
  return rows
    ? `<details class="post-credits"><summary><p>${label}</p></summary><ul class="${cls}">${rows}</ul></details>`
    : "";
}

// Same markup as posts.js so styles.css applies unchanged
function renderPost(raw, lang) {
  const p = lang === "en" && raw.en ? { ...raw, ...raw.en } : raw;

  const spans = v => [v].flat().filter(Boolean).map(x => `<span><p>${x}</p></span>`).join("");
  const props = [formatDate(p.date, lang), p.genre, p.tag].flat().filter(Boolean).map(v => `<span><p>${v}</p></span>`).join("");
  const langtag = spans(p.taal);

  const langBlock = langtag
    ? `<div class="post-language"><div class="language-icon"><svg width="1.1rem" height="1.1rem" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path fill="none" stroke-width="0.07rem" d="M12,23 C18.0751322,23 23,18.0751322 23,12 C23,5.92486775 18.0751322,1 12,1 C5.92486775,1 1,5.92486775 1,12 C1,18.0751322 5.92486775,23 12,23 Z M12,23 C15,23 16,18 16,12 C16,6 15,1 12,1 C9,1 8,6 8,12 C8,18 9,23 12,23 Z M2,16 L22,16 M2,8 L22,8"/></svg></div><i>${langtag}</i></div>`
    : "";

  const info = [].concat(p.info || []).map(t => `<p>${t}</p>`).join("");
  const links = (p.links || []).filter(l => l.url)
    .map(l => `<a href="${esc(l.url)}" target="_blank" rel="noopener"><p>${l.label || l.url}</p></a>`).join("");
  const images = (p.images || []).filter(i => i.file)
    .map(i => `<img src="/images/${esc(i.file)}" alt="${esc(i.alt)}">`).join("");

  return `<div class="post-container">
  <div class="post-toptext">
    <h1 class="post-title">${p.title}</h1>
    <div class="props-and-lang">
      <span class="post-properties">${props}</span>
      <span class="lang-placed">${langBlock}</span>
    </div>
    <div class="post-more-info">
      ${info}
      <div class="post-cred-link-container">
        ${creditList(p.cast, "post-cast", "cast", lang)}
        ${creditList(p.crew, "post-crew", "crew", lang)}
        ${links ? `<div class="post-links">${links}</div>` : ""}
      </div>
    </div>
  </div>
  ${images}
</div>`;
}

function renderPage(raw) {
  const url = `${SITE}/werk/${raw.id}/`;
  const titleNl = stripTags(raw.title);
  const titleEn = stripTags(raw.en?.title || raw.title);
  const descRaw = [].concat(raw.info || [])[0] || "";
  const desc = stripTags(descRaw).slice(0, 200);
  const firstImage = (raw.images || []).find(i => i.file);
  const ogImage = firstImage ? `${SITE}/images/${firstImage.file}` : `${SITE}/images/og-image.jpg`;

  return `<!DOCTYPE html>
<html lang="nl">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${esc(titleNl)} – Sebastiaan Distelmans</title>
  <meta name="description" content="${esc(desc)}">
  <link rel="canonical" href="${url}">
  <meta property="og:type" content="article">
  <meta property="og:locale" content="nl_BE">
  <meta property="og:site_name" content="Sebastiaan Distelmans">
  <meta property="og:title" content="${esc(titleNl)}">
  <meta property="og:description" content="${esc(desc)}">
  <meta property="og:url" content="${url}">
  <meta property="og:image" content="${ogImage}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="theme-color" content="#fff7ba">
  <link rel="stylesheet" href="/styles.css">
  <link rel="apple-touch-icon" sizes="180x180" href="/images/favicon/apple-touch-icon.png">
  <link rel="icon" type="image/png" sizes="32x32" href="/images/favicon/favicon-32x32.png">
  <link rel="icon" type="image/png" sizes="16x16" href="/images/favicon/favicon-16x16.png">
  <link rel="manifest" href="/site.webmanifest">
</head>
<body>
  <div class="content">
    <nav class="navigation-container">
      <button class="nav-button" data-tab="home"><img src="/images/hond-verylowreso.png" class="nav-icon"></button>
      <button class="nav-button active" data-tab="werk">
        <p class="p" data-nl="werk" data-en="work">werk</p>
      </button>
      <button class="nav-button" data-tab="info">
        <p>info</p>
      </button>
      <button class="language-button" onclick="toggleLang()">
        <p class="p" data-nl="EN" data-en="NL">english</p>
      </button>
    </nav>
    <div class="page-container">
      <div data-lang="nl">${renderPost(raw, "nl")}</div>
      <div data-lang="en" hidden>${renderPost(raw, "en")}</div>
    </div>
    <div class="footer"><p>Sebastiaan Distelmans, 2026</p></div>
  </div>
  <script>
    const titles = { nl: ${JSON.stringify(titleNl)}, en: ${JSON.stringify(titleEn)} };
    let lang = "nl";
    try { lang = localStorage.getItem("lang") || "nl"; } catch (e) {}
    function apply() {
      document.documentElement.lang = lang;
      document.title = titles[lang] + " – Sebastiaan Distelmans";
      document.querySelectorAll("[data-lang]").forEach(el => { el.hidden = el.dataset.lang !== lang; });
      document.querySelectorAll("[data-en]").forEach(el => { el.textContent = lang === "en" ? el.dataset.en : el.dataset.nl; });
    }
    function toggleLang() {
      lang = lang === "nl" ? "en" : "nl";
      try { localStorage.setItem("lang", lang); } catch (e) {}
      apply();
    }
    apply();
    document.querySelectorAll("[data-tab]").forEach(btn => {
      btn.addEventListener("click", () => { location.href = "/#" + btn.dataset.tab; });
    });
  </script>
</body>
</html>
`;
}

// Pages
for (const p of posts) {
  const dir = path.join("werk", p.id);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, "index.html"), renderPage(p));
  console.log("built", dir);
}

// Sitemap
const today = new Date().toISOString().slice(0, 10);
const urls = [
  { loc: `${SITE}/`, lastmod: today },
  ...posts.map(p => ({ loc: `${SITE}/werk/${p.id}/`, lastmod: p.date })),
];
fs.writeFileSync(
  "sitemap.xml",
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    urls.map(u => `  <url>\n    <loc>${u.loc}</loc>\n    <lastmod>${u.lastmod}</lastmod>\n  </url>`).join("\n") +
    `\n</urlset>\n`
);
console.log("sitemap.xml written");