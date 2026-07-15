(function () {
  "use strict";

  const TEMPLATE_KICKERS = Object.freeze({
    guide: "Guida",
    comparison: "Confronto",
    culture: "Cultura",
    story: "Storie",
    news: "News",
  });

  function escapeHtml(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function cleanText(value) {
    return typeof value === "string" ? value.trim() : "";
  }

  function safeUrl(value, fallback = "/contatti.html") {
    const url = cleanText(value);
    if (!url) return fallback;
    if (url.startsWith("/") || url.startsWith("#")) return url;
    try {
      const parsed = new URL(url, window.location.origin);
      if (["http:", "https:", "mailto:", "tel:"].includes(parsed.protocol)) return parsed.href;
    } catch (_) {}
    return fallback;
  }

  function headingAnchor(blockId) {
    return `journal-heading-${String(blockId).replace(/[^a-zA-Z0-9_-]/g, "")}`;
  }

  function calloutTitle(variant) {
    switch (variant) {
      case "suitable_for": return "Per chi è adatto";
      case "not_suitable_for": return "Potrebbe non essere adatto se";
      case "common_mistake": return "Errore comune";
      case "beyond_image": return "Oltre l’immagine";
      case "real_value": return "Il valore reale";
      default: return "YUME consiglia";
    }
  }

  function collectWords(value, output) {
    if (typeof value === "string") output.push(value);
    else if (Array.isArray(value)) value.forEach((item) => collectWords(item, output));
    else if (value && typeof value === "object") Object.values(value).forEach((item) => collectWords(item, output));
  }

  function readingTime(article, blocks) {
    const values = [article.title, article.subtitle, article.excerpt];
    (blocks || []).forEach((block) => collectWords(block.payload, values));
    const words = values.join(" ").trim().split(/\s+/).filter(Boolean).length;
    return Math.max(1, Math.ceil(words / 220));
  }

  function formatDate(value) {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    return new Intl.DateTimeFormat("it-IT", {
      day: "numeric",
      month: "long",
      year: "numeric",
      timeZone: "Europe/Rome",
    }).format(date);
  }

  function renderBlock(block) {
    const payload = block?.payload || {};
    switch (block?.block_type) {
      case "paragraph":
        return `<p class="journal-preview-paragraph">${escapeHtml(payload.text || "")}</p>`;

      case "heading": {
        const level = Number(payload.level) === 3 ? 3 : 2;
        const anchor = headingAnchor(block.id);
        const text = escapeHtml(payload.text || "Nuova sezione");
        return `<h${level} id="${anchor}"><a class="journal-preview-heading-anchor" href="#${anchor}">${text}</a></h${level}>`;
      }

      case "quote":
        return `<blockquote class="journal-preview-quote">${escapeHtml(payload.text || "")}${payload.source ? `<small>— ${escapeHtml(payload.source)}</small>` : ""}</blockquote>`;

      case "list": {
        const items = Array.isArray(payload.items) ? payload.items.filter((item) => cleanText(item)) : [];
        const numbered = payload.style === "number";
        const tag = numbered ? "ol" : "ul";
        return `<${tag} class="journal-preview-list ${numbered ? "is-numbered" : "is-bulleted"}">${items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</${tag}>`;
      }

      case "yume_callout": {
        const variant = cleanText(payload.variant) || "recommendation";
        return `<aside class="journal-preview-callout is-${escapeHtml(variant)}"><strong>${escapeHtml(payload.title || calloutTitle(variant))}</strong><p>${escapeHtml(payload.text || "")}</p></aside>`;
      }

      case "comparison": {
        const rows = Array.isArray(payload.rows) ? payload.rows : [];
        return `<div class="journal-preview-comparison"><div class="journal-preview-comparison-head"><div>Confronto</div><div>${escapeHtml(payload.leftTitle || "Opzione A")}</div><div>${escapeHtml(payload.rightTitle || "Opzione B")}</div></div>${rows.map((row) => `<div class="journal-preview-comparison-row"><div><strong>${escapeHtml(row?.label || "—")}</strong></div><div>${escapeHtml(row?.left || "—")}</div><div>${escapeHtml(row?.right || "—")}</div></div>`).join("")}</div>`;
      }

      case "faq": {
        const items = Array.isArray(payload.items) ? payload.items : [];
        return `<section>${items.map((item) => `<div class="journal-preview-faq"><strong>${escapeHtml(item?.question || "Domanda")}</strong><p>${escapeHtml(item?.answer || "")}</p></div>`).join("")}</section>`;
      }

      case "cta":
        return `<aside class="journal-preview-cta"><div class="journal-preview-cta-eyebrow">${escapeHtml(payload.eyebrow || "YUME")}</div><h3>${escapeHtml(payload.title || "Scopri YUME")}</h3><p>${escapeHtml(payload.text || "")}</p><a href="${escapeHtml(safeUrl(payload.buttonUrl))}">${escapeHtml(payload.buttonLabel || "Scopri di più")}</a></aside>`;

      case "divider":
        return `<div class="journal-preview-divider" aria-hidden="true"></div>`;

      case "image": {
        const url = safeUrl(payload.url || payload.publicUrl || "", "");
        if (!url) return "";
        return `<figure class="journal-public-figure"><img src="${escapeHtml(url)}" alt="${escapeHtml(payload.alt || "")}" loading="lazy">${payload.caption ? `<figcaption>${escapeHtml(payload.caption)}</figcaption>` : ""}</figure>`;
      }

      case "gallery": {
        const images = Array.isArray(payload.images) ? payload.images : [];
        const valid = images.map((image) => ({ ...image, url: safeUrl(image?.url || image?.publicUrl || "", "") })).filter((image) => image.url);
        if (!valid.length) return "";
        return `<div class="journal-public-gallery">${valid.map((image) => `<figure><img src="${escapeHtml(image.url)}" alt="${escapeHtml(image.alt || "")}" loading="lazy">${image.caption ? `<figcaption>${escapeHtml(image.caption)}</figcaption>` : ""}</figure>`).join("")}</div>`;
      }

      default:
        return "";
    }
  }

  function renderArticle(payload) {
    const article = payload?.article;
    const author = payload?.author;
    const category = payload?.category;
    const blocks = Array.isArray(payload?.blocks) ? payload.blocks : [];
    if (!article) throw new Error("Articolo pubblico non disponibile.");

    let h2Counter = 0;
    const headings = blocks.filter((block) => block.block_type === "heading").map((block) => {
      const level = Number(block.payload?.level) === 3 ? 3 : 2;
      if (level === 2) h2Counter += 1;
      return {
        anchor: headingAnchor(block.id),
        level,
        text: cleanText(block.payload?.text) || "Nuova sezione",
        number: level === 2 ? `${h2Counter}.` : "—",
      };
    });

    const metadata = article.metadata || {};
    const showToc = metadata.show_toc !== false && headings.length >= 2;
    const tocTitle = cleanText(metadata.toc_title) || "In questo articolo";
    const template = cleanText(article.template_type) || "guide";
    const kicker = TEMPLATE_KICKERS[template] || "Journal";
    const date = formatDate(article.published_at);

    return `<article class="journal-preview journal-preview-desktop journal-template-${escapeHtml(template)}">
      <header class="journal-preview-hero">
        <div class="journal-preview-kicker">YUME JOURNAL · ${escapeHtml(kicker)}${category?.name ? ` · ${escapeHtml(category.name)}` : ""}</div>
        <h1 class="journal-preview-title">${escapeHtml(article.title || "Articolo YUME")}</h1>
        ${article.subtitle ? `<p class="journal-preview-subtitle">${escapeHtml(article.subtitle)}</p>` : ""}
      </header>
      <div class="journal-preview-body">
        <div class="journal-preview-meta">
          <span>Di ${escapeHtml(author?.display_name || "YUME Editorial Team")}</span>
          <span>${readingTime(article, blocks)} min di lettura</span>
          ${date ? `<span>Pubblicato il ${escapeHtml(date)}</span>` : ""}
        </div>
        ${article.excerpt ? `<p class="journal-preview-excerpt">${escapeHtml(article.excerpt)}</p>` : ""}
        ${showToc ? `<nav class="journal-preview-toc" aria-label="Indice articolo"><div class="journal-preview-toc-label">${escapeHtml(tocTitle)}</div><ol class="journal-preview-toc-list">${headings.map((heading) => `<li class="${heading.level === 3 ? "is-level-3" : ""}"><a href="#${heading.anchor}"><span class="journal-preview-toc-number">${heading.number}</span><span>${escapeHtml(heading.text)}</span></a></li>`).join("")}</ol></nav>` : ""}
        ${blocks.map(renderBlock).join("")}
      </div>
    </article>`;
  }

  window.YumeJournalRenderer = Object.freeze({
    escapeHtml,
    formatDate,
    renderArticle,
  });
})();
