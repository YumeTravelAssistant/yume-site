(function () {
  "use strict";

  const root = document.getElementById("journal-article-root");
  const status = document.getElementById("journal-article-status");

  function getSlug() {
    const query = new URLSearchParams(window.location.search).get("slug");
    if (query) return query.trim();
    const parts = window.location.pathname.split("/").filter(Boolean);
    const blogIndex = parts.indexOf("blog");
    return blogIndex >= 0 ? decodeURIComponent(parts[blogIndex + 1] || "") : "";
  }

  function setMeta(selector, attribute, value) {
    const element = document.querySelector(selector);
    if (element && value) element.setAttribute(attribute, value);
  }

  function updateMetadata(article, author, category) {
    const title = article.seo_title || article.title || "YUME Journal";
    const description = article.seo_description || article.excerpt || "Approfondimenti, cultura e viaggio in Giappone con YUME.";
    const canonical = `${window.YUME_JOURNAL_CONFIG.siteUrl}/blog/${article.slug}`;
    document.title = `${title} | YUME Journal`;
    setMeta('meta[name="description"]', "content", description);
    setMeta('link[rel="canonical"]', "href", canonical);
    setMeta('meta[property="og:title"]', "content", title);
    setMeta('meta[property="og:description"]', "content", description);
    setMeta('meta[property="og:url"]', "content", canonical);
    setMeta('meta[name="twitter:title"]', "content", title);
    setMeta('meta[name="twitter:description"]', "content", description);

    const ld = {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: article.title,
      description,
      datePublished: article.published_at || undefined,
      dateModified: article.published_at || undefined,
      mainEntityOfPage: canonical,
      author: { "@type": "Person", name: author?.display_name || "YUME Editorial Team" },
      publisher: { "@type": "Organization", name: "Yume Travel Tech S.r.l." },
      articleSection: category?.name || "YUME Journal",
    };
    const script = document.getElementById("journal-structured-data");
    if (script) script.textContent = JSON.stringify(ld);
  }

  async function load() {
    const slug = getSlug();
    if (!slug) {
      window.location.replace("/blog/");
      return;
    }

    try {
      status.textContent = "Caricamento articolo…";
      const payload = await window.YumeJournalApi.getArticle(slug);
      if (!payload?.article) throw new Error("Articolo non trovato o non pubblicato.");
      updateMetadata(payload.article, payload.author, payload.category);
      root.innerHTML = window.YumeJournalRenderer.renderArticle(payload);
      status.remove();
    } catch (error) {
      console.error(error);
      status.textContent = error.message || "Articolo non disponibile.";
      root.innerHTML = `<div class="journal-not-found"><h1>Articolo non disponibile</h1><p>Potrebbe essere stato ritirato oppure l’indirizzo non è corretto.</p><a href="/blog/">Torna al Journal</a></div>`;
    }
  }

  load();
})();
