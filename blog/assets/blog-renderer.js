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
      if (["http:", "https:", "mailto:", "tel:"].includes(parsed.protocol)) {
        return parsed.href;
      }
    } catch (_) {}

    return fallback;
  }

  function assetPublicUrl(asset) {
    if (!asset?.storage_bucket || !asset?.storage_path) return "";

    const config = window.YUME_JOURNAL_CONFIG || {};
    const base = String(config.supabaseUrl || "").replace(/\/$/, "");
    if (!base) return "";

    const bucket = encodeURIComponent(String(asset.storage_bucket));
    const path = String(asset.storage_path)
      .split("/")
      .map(encodeURIComponent)
      .join("/");

    return `${base}/storage/v1/object/public/${bucket}/${path}`;
  }

  function assetMapFromPayload(payload) {
    return new Map(
      (Array.isArray(payload?.assets) ? payload.assets : []).map((asset) => [
        String(asset.id),
        { ...asset, publicUrl: assetPublicUrl(asset) },
      ])
    );
  }

  function aspectClass(value) {
    return ["auto", "landscape", "square", "portrait"].includes(value)
      ? value
      : "landscape";
  }

  function headingAnchor(blockId) {
    return `journal-heading-${String(blockId).replace(/[^a-zA-Z0-9_-]/g, "")}`;
  }

  function calloutTitle(variant) {
    switch (variant) {
      case "suitable_for":
        return "Per chi è adatto";
      case "not_suitable_for":
        return "Potrebbe non essere adatto se";
      case "common_mistake":
        return "Errore comune";
      case "beyond_image":
        return "Oltre l’immagine";
      case "real_value":
        return "Il valore reale";
      default:
        return "YUME consiglia";
    }
  }

  function collectWords(value, output) {
    if (typeof value === "string") output.push(value);
    else if (Array.isArray(value)) {
      value.forEach((item) => collectWords(item, output));
    } else if (value && typeof value === "object") {
      Object.values(value).forEach((item) => collectWords(item, output));
    }
  }

  function readingTime(article, blocks) {
    const values = [article.title, article.subtitle, article.excerpt];
    (blocks || []).forEach((block) => collectWords(block.payload, values));

    const words = values
      .join(" ")
      .trim()
      .split(/\s+/)
      .filter(Boolean).length;

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

  function renderBlock(block, assetMap) {
    const payload = block?.payload || {};

    switch (block?.block_type) {
      case "paragraph":
        return `<p class="journal-preview-paragraph">${escapeHtml(
          payload.text || ""
        )}</p>`;

      case "heading": {
        const level = Number(payload.level) === 3 ? 3 : 2;
        const anchor = headingAnchor(block.id);
        const text = escapeHtml(payload.text || "Nuova sezione");

        return `<h${level} id="${anchor}"><a class="journal-preview-heading-anchor" href="#${anchor}">${text}</a></h${level}>`;
      }

      case "quote":
        return `<blockquote class="journal-preview-quote">${escapeHtml(
          payload.text || ""
        )}${
          payload.source
            ? `<small>— ${escapeHtml(payload.source)}</small>`
            : ""
        }</blockquote>`;

      case "list": {
        const items = Array.isArray(payload.items)
          ? payload.items.filter((item) => cleanText(item))
          : [];
        const numbered = payload.style === "number";
        const tag = numbered ? "ol" : "ul";

        return `<${tag} class="journal-preview-list ${
          numbered ? "is-numbered" : "is-bulleted"
        }">${items
          .map((item) => `<li>${escapeHtml(item)}</li>`)
          .join("")}</${tag}>`;
      }

      case "yume_callout": {
        const variant = cleanText(payload.variant) || "recommendation";

        return `<aside class="journal-preview-callout is-${escapeHtml(
          variant
        )}"><strong>${escapeHtml(
          payload.title || calloutTitle(variant)
        )}</strong><p>${escapeHtml(payload.text || "")}</p></aside>`;
      }

      case "comparison": {
        const rows = Array.isArray(payload.rows) ? payload.rows : [];

        return `<div class="journal-preview-comparison">
          <div class="journal-preview-comparison-head">
            <div>Confronto</div>
            <div>${escapeHtml(payload.leftTitle || "Opzione A")}</div>
            <div>${escapeHtml(payload.rightTitle || "Opzione B")}</div>
          </div>
          ${rows
            .map(
              (row) => `<div class="journal-preview-comparison-row">
                <div><strong>${escapeHtml(row?.label || "—")}</strong></div>
                <div>${escapeHtml(row?.left || "—")}</div>
                <div>${escapeHtml(row?.right || "—")}</div>
              </div>`
            )
            .join("")}
        </div>`;
      }

      case "faq": {
        const items = Array.isArray(payload.items) ? payload.items : [];

        return `<section>${items
          .map(
            (item) => `<div class="journal-preview-faq">
              <strong>${escapeHtml(item?.question || "Domanda")}</strong>
              <p>${escapeHtml(item?.answer || "")}</p>
            </div>`
          )
          .join("")}</section>`;
      }

      case "cta":
        return `<aside class="journal-preview-cta">
          <div class="journal-preview-cta-eyebrow">${escapeHtml(
            payload.eyebrow || "YUME"
          )}</div>
          <h3>${escapeHtml(payload.title || "Scopri YUME")}</h3>
          <p>${escapeHtml(payload.text || "")}</p>
          <a href="${escapeHtml(safeUrl(payload.buttonUrl))}">${escapeHtml(
          payload.buttonLabel || "Scopri di più"
        )}</a>
        </aside>`;

      case "divider":
        return `<div class="journal-preview-divider" aria-hidden="true"></div>`;

      case "image": {
        const asset = assetMap.get(String(payload.asset_id || ""));
        if (!asset?.publicUrl) return "";

        const layout = ["reading", "wide", "full"].includes(payload.layout)
          ? payload.layout
          : "wide";
        const fit = payload.fit === "contain" ? "contain" : "cover";
        const focalX = Number.isFinite(Number(payload.focal_x))
          ? Number(payload.focal_x)
          : 50;
        const focalY = Number.isFinite(Number(payload.focal_y))
          ? Number(payload.focal_y)
          : 50;
        const aspect = aspectClass(payload.aspect_ratio);

        return `<figure class="journal-public-figure is-${layout} is-${aspect}">
          <div class="journal-public-media-frame">
            <img
              src="${escapeHtml(asset.publicUrl)}"
              alt="${escapeHtml(asset.alt_text || "")}"
              loading="lazy"
              style="object-fit:${fit};object-position:${focalX}% ${focalY}%"
            >
          </div>
          ${
            asset.caption || asset.credit
              ? `<figcaption>${escapeHtml(asset.caption || "")}${
                  asset.credit
                    ? `<small>Foto: ${escapeHtml(asset.credit)}</small>`
                    : ""
                }</figcaption>`
              : ""
          }
        </figure>`;
      }

      case "gallery": {
        const ids = Array.isArray(payload.asset_ids) ? payload.asset_ids : [];
        const images = ids
          .map((id) => assetMap.get(String(id)))
          .filter((asset) => asset?.publicUrl);

        if (!images.length) return "";

        const columns = Number(payload.columns) === 3 ? 3 : 2;
        const fit = payload.fit === "contain" ? "contain" : "cover";
        const focalX = Number.isFinite(Number(payload.focal_x))
          ? Number(payload.focal_x)
          : 50;
        const focalY = Number.isFinite(Number(payload.focal_y))
          ? Number(payload.focal_y)
          : 50;
        const aspect = aspectClass(payload.aspect_ratio);

        return `<div class="journal-public-gallery columns-${columns} is-${aspect}">
          ${images
            .map(
              (asset) => `<figure>
                <img
                  src="${escapeHtml(asset.publicUrl)}"
                  alt="${escapeHtml(asset.alt_text || "")}"
                  loading="lazy"
                  style="object-fit:${fit};object-position:${focalX}% ${focalY}%"
                >
                ${
                  asset.caption || asset.credit
                    ? `<figcaption>${escapeHtml(asset.caption || "")}${
                        asset.credit
                          ? `<small>Foto: ${escapeHtml(asset.credit)}</small>`
                          : ""
                      }</figcaption>`
                    : ""
                }
              </figure>`
            )
            .join("")}
        </div>`;
      }

      default:
        return "";
    }
  }

  function renderArticleEngagement() {
    return `
      <section class="journal-engagement" aria-label="Condividi e interagisci con l’articolo">
        <div class="journal-reactions">
          <p class="journal-engagement-eyebrow">IL TUO PUNTO DI VISTA</p>
          <h2>Questo articolo ti è stato utile?</h2>
          <p class="journal-engagement-intro">
            Scegli la reazione che descrive meglio ciò che ti ha lasciato.
          </p>

          <div class="journal-reaction-actions">
            <button type="button" data-journal-reaction="useful" aria-pressed="false">
              <span class="journal-reaction-icon" aria-hidden="true">✓</span>
              <span>Mi è stato utile</span>
              <span class="journal-reaction-count" data-reaction-count="useful">0</span>
            </button>

            <button type="button" data-journal-reaction="thoughtful" aria-pressed="false">
              <span class="journal-reaction-icon" aria-hidden="true">✦</span>
              <span>Mi ha fatto riflettere</span>
              <span class="journal-reaction-count" data-reaction-count="thoughtful">0</span>
            </button>

            <button type="button" data-journal-reaction="deepen" aria-pressed="false">
              <span class="journal-reaction-icon" aria-hidden="true">＋</span>
              <span>Vorrei approfondire</span>
              <span class="journal-reaction-count" data-reaction-count="deepen">0</span>
            </button>
          </div>

          <p class="journal-reaction-feedback" aria-live="polite"></p>
        </div>

        <div class="journal-share" data-journal-share>
          <p class="journal-engagement-eyebrow">CONDIVIDI</p>
          <h2>Conosci qualcuno a cui potrebbe essere utile?</h2>

          <div class="journal-share-actions">
            <button type="button" data-share-native>
              <i class="fa fa-share-alt" aria-hidden="true"></i>
              <span>Condividi</span>
            </button>

            <a href="#" data-share-whatsapp target="_blank" rel="noopener">
              <i class="fa fa-whatsapp" aria-hidden="true"></i>
              <span>WhatsApp</span>
            </a>

            <a href="#" data-share-facebook target="_blank" rel="noopener">
              <i class="fa fa-facebook" aria-hidden="true"></i>
              <span>Facebook</span>
            </a>

            <a href="#" data-share-linkedin target="_blank" rel="noopener">
              <i class="fa fa-linkedin" aria-hidden="true"></i>
              <span>LinkedIn</span>
            </a>

            <button type="button" data-share-copy>
              <i class="fa fa-link" aria-hidden="true"></i>
              <span>Copia link</span>
            </button>
          </div>

          <p class="journal-share-feedback" aria-live="polite"></p>
        </div>

        <aside class="journal-on-board" data-whatsapp-channel-box>
          <div>
            <p class="journal-engagement-eyebrow">YUME ON BOARD</p>
            <h2>Il Giappone continua su WhatsApp.</h2>
            <p>
              Partenze, posti disponibili, anteprime e momenti reali
              dai viaggi YUME, direttamente nel nostro canale.
            </p>
          </div>

          <a href="#" data-whatsapp-channel target="_blank" rel="noopener">
            Segui il canale
          </a>
        </aside>

        <div class="journal-article-question">
          <div>
            <strong>Hai una domanda su questo tema?</strong>
            <p>Apri una conversazione diretta con il team YUME.</p>
          </div>

          <button type="button" data-article-question>
            Parlane con YUME su WhatsApp →
          </button>
        </div>
      </section>
    `;
  }

  function renderArticle(payload) {
    const article = payload?.article;
    const author = payload?.author;
    const category = payload?.category;
    const blocks = Array.isArray(payload?.blocks) ? payload.blocks : [];
    const assetMap = assetMapFromPayload(payload);

    if (!article) throw new Error("Articolo pubblico non disponibile.");

    let h2Counter = 0;
    const headings = blocks
      .filter((block) => block.block_type === "heading")
      .map((block) => {
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
    const heroAsset = assetMap.get(String(article.hero_asset_id || ""));
    const heroFit =
      article.metadata?.hero_fit === "contain" ? "contain" : "cover";
    const heroFocalX = Number.isFinite(Number(article.metadata?.hero_focal_x))
      ? Number(article.metadata.hero_focal_x)
      : 50;
    const heroFocalY = Number.isFinite(Number(article.metadata?.hero_focal_y))
      ? Number(article.metadata.hero_focal_y)
      : 50;
    const heroOverlay = ["none", "light", "dark"].includes(
      article.metadata?.hero_overlay
    )
      ? article.metadata.hero_overlay
      : "dark";

    return `<article class="journal-preview journal-preview-desktop journal-template-${escapeHtml(
      template
    )}">
      <header
        class="journal-preview-hero ${
          heroAsset?.publicUrl ? `has-image overlay-${heroOverlay}` : ""
        }"
        ${
          heroAsset?.publicUrl
            ? `style="background-image:url('${escapeHtml(
                heroAsset.publicUrl
              )}');background-size:${heroFit};background-position:${heroFocalX}% ${heroFocalY}%;background-repeat:no-repeat"`
            : ""
        }
      >
        ${
          heroAsset?.publicUrl && heroOverlay !== "none"
            ? `<div class="journal-preview-hero-overlay"></div>`
            : ""
        }
        <div class="journal-preview-kicker">
          YUME JOURNAL · ${escapeHtml(kicker)}
          ${category?.name ? ` · ${escapeHtml(category.name)}` : ""}
        </div>
        <h1 class="journal-preview-title">${escapeHtml(
          article.title || "Articolo YUME"
        )}</h1>
        ${
          article.subtitle
            ? `<p class="journal-preview-subtitle">${escapeHtml(
                article.subtitle
              )}</p>`
            : ""
        }
      </header>

      <div class="journal-preview-body">
        <div class="journal-preview-meta">
          <span>Di ${escapeHtml(
            author?.display_name || "YUME Editorial Team"
          )}</span>
          <span>${readingTime(article, blocks)} min di lettura</span>
          ${date ? `<span>Pubblicato il ${escapeHtml(date)}</span>` : ""}
        </div>

        ${
          article.excerpt
            ? `<p class="journal-preview-excerpt">${escapeHtml(
                article.excerpt
              )}</p>`
            : ""
        }

        ${
          showToc
            ? `<nav class="journal-preview-toc" aria-label="Indice articolo">
                <div class="journal-preview-toc-label">${escapeHtml(
                  tocTitle
                )}</div>
                <ol class="journal-preview-toc-list">
                  ${headings
                    .map(
                      (heading) => `<li class="${
                        heading.level === 3 ? "is-level-3" : ""
                      }">
                        <a href="#${heading.anchor}">
                          <span class="journal-preview-toc-number">${heading.number}</span>
                          <span>${escapeHtml(heading.text)}</span>
                        </a>
                      </li>`
                    )
                    .join("")}
                </ol>
              </nav>`
            : ""
        }

        ${blocks.map((block) => renderBlock(block, assetMap)).join("")}
        ${renderArticleEngagement()}
      </div>
    </article>`;
  }

  window.YumeJournalRenderer = Object.freeze({
    escapeHtml,
    formatDate,
    renderArticle,
  });
})();
