(function () {
  "use strict";

  const root = document.getElementById("journal-list");
  const status = document.getElementById("journal-status");
  const filter = document.getElementById("journal-category-filter");
  let articles = [];

  function card(article) {
    const escape = window.YumeJournalRenderer.escapeHtml;
    const date = window.YumeJournalRenderer.formatDate(article.published_at);
    const category = article.category?.name || "Journal";
    return `<article class="journal-card ${article.featured ? "is-featured" : ""}">
      <a class="journal-card-link" href="/blog/${encodeURIComponent(article.slug)}" aria-label="Apri ${escape(article.title)}">
        <div class="journal-card-topline">
          <span>${escape(category)}</span>
          ${article.featured ? "<strong>In evidenza</strong>" : ""}
        </div>
        <h2>${escape(article.title)}</h2>
        ${article.subtitle ? `<p class="journal-card-subtitle">${escape(article.subtitle)}</p>` : ""}
        ${article.excerpt ? `<p>${escape(article.excerpt)}</p>` : ""}
        <div class="journal-card-meta">
          <span>${escape(article.author?.display_name || "YUME Editorial Team")}</span>
          ${date ? `<span>${escape(date)}</span>` : ""}
        </div>
        <span class="journal-card-cta">Leggi l’articolo →</span>
      </a>
    </article>`;
  }

  function render() {
    const selected = filter?.value || "";
    const visible = selected ? articles.filter((item) => item.category?.slug === selected) : articles;
    root.innerHTML = visible.length ? visible.map(card).join("") : `<div class="journal-empty">Nessun articolo pubblicato in questa categoria.</div>`;
  }

  function setupCategories() {
    if (!filter) return;
    const map = new Map();
    articles.forEach((item) => {
      if (item.category?.slug && item.category?.name) map.set(item.category.slug, item.category.name);
    });
    [...map.entries()].sort((a, b) => a[1].localeCompare(b[1], "it")).forEach(([slug, name]) => {
      const option = document.createElement("option");
      option.value = slug;
      option.textContent = name;
      filter.appendChild(option);
    });
    filter.addEventListener("change", render);
  }

  async function load() {
    try {
      status.textContent = "Caricamento articoli…";
      const config = window.YUME_JOURNAL_CONFIG;
      articles = await window.YumeJournalApi.listArticles({ limit: config.pageSize || 24 });
      setupCategories();
      render();
      status.textContent = articles.length ? `${articles.length} articoli pubblicati` : "Il Journal sta per iniziare.";
    } catch (error) {
      console.error(error);
      status.textContent = error.message || "Errore nel caricamento del Journal.";
      root.innerHTML = `<div class="journal-empty">Il Journal non è disponibile in questo momento.</div>`;
    }
  }

  load();
})();
