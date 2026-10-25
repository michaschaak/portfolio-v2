function formatDate(iso) {
    const [y, m, d] = iso.split("-");
    return [d, m, y].filter(Boolean).join("/");
}

function creditList(arr, cls, label) {
    const rows = (arr || [])
        .filter(c => c.firstname || c.lastname)
        .map(c => `<li><span class="role">${c.credit} - </span><span class="name">${c.firstname} ${c.lastname}</span></li>`).join("");
    return rows
        ? `<details class="post-credits">
         <summary>${label}</summary>
         <ul class="${cls}">${rows}</ul>
       </details>`
        : "";
}

fetch("workposts.json")
    .then(res => res.json())
    .then(posts => {
        document.getElementById("posts").innerHTML = posts
            .filter(p => p.id)
            .sort((a, b) => b.date.localeCompare(a.date))
            .map(p => {
                const props = [formatDate(p.date), p.genre, p.tag]
                    .filter(Boolean)
                    .map(v => `<span><p>${v}</p></span>`)
                    .join("");

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
    })
    .catch(err => console.error("Could not load workposts.json:", err));