(function () {
  "use strict";

  const root = document.getElementById("journal-article-root");
  const status = document.getElementById("journal-article-status");
  const REACTION_STORAGE_KEY = "yume_journal_reaction_token";

  function getSlug() {
    const query = new URLSearchParams(window.location.search).get("slug");
    if (query) return query.trim();

    const parts = window.location.pathname.split("/").filter(Boolean);
    const blogIndex = parts.indexOf("blog");

    return blogIndex >= 0
      ? decodeURIComponent(parts[blogIndex + 1] || "")
      : "";
  }

  
  function setMeta(selector, attribute, value) {
    const element = document.querySelector(selector);
    if (element && value) element.setAttribute(attribute, value);
  }

  function updateMetadata(article, author, category) {
    const title = article.seo_title || article.title || "YUME Journal";
    const description =
      article.seo_description ||
      article.excerpt ||
      "Approfondimenti, cultura e viaggio in Giappone con YUME.";

    const canonical =
      `${window.YUME_JOURNAL_CONFIG.siteUrl}/blog/${article.slug}`;

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
      dateModified: article.updated_at || article.published_at || undefined,
      mainEntityOfPage: canonical,
      author: {
        "@type": "Person",
        name: author?.display_name || "YUME Editorial Team",
      },
      publisher: {
        "@type": "Organization",
        name: "Yume Travel Tech S.r.l.",
      },
      articleSection: category?.name || "YUME Journal",
    };

    const script = document.getElementById("journal-structured-data");
    if (script) script.textContent = JSON.stringify(ld);
  }

  function fallbackUuid() {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
      /[xy]/g,
      (character) => {
        const random = (Math.random() * 16) | 0;
        const value = character === "x" ? random : (random & 0x3) | 0x8;
        return value.toString(16);
      }
    );
  }

  function getReactionToken() {
    try {
      const existing = localStorage.getItem(REACTION_STORAGE_KEY);
      if (existing) return existing;

      const token =
        typeof crypto?.randomUUID === "function"
          ? crypto.randomUUID()
          : fallbackUuid();

      localStorage.setItem(REACTION_STORAGE_KEY, token);
      return token;
    } catch (_) {
      return fallbackUuid();
    }
  }

  function canonicalArticleUrl(article) {
    const config = window.YUME_JOURNAL_CONFIG || {};
    const siteUrl = String(
      config.siteUrl || window.location.origin
    ).replace(/\/$/, "");

    return `${siteUrl}/blog/${encodeURIComponent(article.slug)}`;
  }

  function trackedArticleUrl(article, source) {
    const url = new URL(canonicalArticleUrl(article));
    const config = window.YUME_JOURNAL_CONFIG || {};

    url.searchParams.set("utm_source", source);
    url.searchParams.set("utm_medium", "share");
    url.searchParams.set(
      "utm_campaign",
      String(config.shareCampaign || "yume_journal")
    );
    url.searchParams.set("utm_content", article.slug);

    return url.toString();
  }

  function setReactionBusy(busy) {
    document
      .querySelectorAll("[data-journal-reaction]")
      .forEach((button) => {
        button.disabled = busy;
      });
  }

  function renderReactionSummary(summary) {
    const counts = summary?.counts || {};
    const selected = summary?.selected || "";

    ["useful", "thoughtful", "deepen"].forEach((reaction) => {
      const button = document.querySelector(
        `[data-journal-reaction="${reaction}"]`
      );
      const count = document.querySelector(
        `[data-reaction-count="${reaction}"]`
      );
      const active = selected === reaction;

      button?.classList.toggle("is-selected", active);
      button?.setAttribute("aria-pressed", active ? "true" : "false");

      if (count) {
        count.textContent = String(Number(counts[reaction] || 0));
      }
    });
  }

  async function initialiseReactions(article) {
    const feedback = document.querySelector(
      ".journal-reaction-feedback"
    );
    const buttons = Array.from(
      document.querySelectorAll("[data-journal-reaction]")
    );

    if (!buttons.length) return;

    const voterToken = getReactionToken();

    try {
      const summary =
        await window.YumeJournalApi.getReactionSummary(
          article.slug,
          voterToken
        );

      renderReactionSummary(summary);
    } catch (error) {
      console.error(error);

      if (feedback) {
        feedback.textContent =
          "Le reazioni non sono disponibili in questo momento.";
      }
    }

    buttons.forEach((button) => {
      button.addEventListener("click", async () => {
        const reaction = button.getAttribute(
          "data-journal-reaction"
        );

        if (!reaction) return;

        try {
          setReactionBusy(true);

          if (feedback) {
            feedback.textContent = "Salvataggio della reazione…";
          }

          const summary = await window.YumeJournalApi.react(
            article.slug,
            reaction,
            voterToken
          );

          renderReactionSummary(summary);

          if (feedback) {
            feedback.textContent =
              "Grazie: la tua reazione è stata registrata.";
          }
        } catch (error) {
          console.error(error);

          if (feedback) {
            feedback.textContent =
              error?.message ||
              "Non è stato possibile registrare la reazione.";
          }
        } finally {
          setReactionBusy(false);
        }
      });
    });
  }

  async function copyText(value) {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(value);
      return;
    }

    const textarea = document.createElement("textarea");
    textarea.value = value;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";

    document.body.appendChild(textarea);
    textarea.select();

    const copied = document.execCommand("copy");
    textarea.remove();

    if (!copied) {
      throw new Error("Copia non disponibile.");
    }
  }

  function initialiseSharing(article) {
    const title = article.title || "YUME Journal";
    const shareText =
      `Ti consiglio questo articolo di YUME Journal: ${title}`;

    const nativeButton = document.querySelector(
      "[data-share-native]"
    );
    const whatsapp = document.querySelector(
      "[data-share-whatsapp]"
    );
    const facebook = document.querySelector(
      "[data-share-facebook]"
    );
    const linkedin = document.querySelector(
      "[data-share-linkedin]"
    );
    const copyButton = document.querySelector(
      "[data-share-copy]"
    );
    const feedback = document.querySelector(
      ".journal-share-feedback"
    );

    if (nativeButton) {
      if (typeof navigator.share === "function") {
        nativeButton.addEventListener("click", async () => {
          try {
            await navigator.share({
              title,
              text: shareText,
              url: trackedArticleUrl(article, "native_share"),
            });
          } catch (error) {
            if (error?.name !== "AbortError" && feedback) {
              feedback.textContent =
                "Non è stato possibile aprire la condivisione.";
            }
          }
        });
      } else {
        nativeButton.hidden = true;
      }
    }

    if (whatsapp) {
      const message =
        `${shareText}\n\n${trackedArticleUrl(
          article,
          "whatsapp"
        )}`;

      whatsapp.href =
        `https://wa.me/?text=${encodeURIComponent(message)}`;
    }

    if (facebook) {
      facebook.href =
        `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
          trackedArticleUrl(article, "facebook")
        )}`;
    }

    if (linkedin) {
      linkedin.href =
        `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
          trackedArticleUrl(article, "linkedin")
        )}`;
    }

    copyButton?.addEventListener("click", async () => {
      try {
        await copyText(
          trackedArticleUrl(article, "copy_link")
        );

        if (feedback) {
          feedback.textContent = "Link copiato.";
        }
      } catch (error) {
        console.error(error);

        if (feedback) {
          feedback.textContent =
            "Copia il link direttamente dalla barra del browser.";
        }
      }
    });
  }

  function initialiseWhatsAppChannel() {
    const config = window.YUME_JOURNAL_CONFIG || {};
    const channelUrl = String(
      config.whatsappChannelUrl || ""
    ).trim();

    const box = document.querySelector(
      "[data-whatsapp-channel-box]"
    );
    const link = document.querySelector(
      "[data-whatsapp-channel]"
    );

    if (!channelUrl) {
      box?.remove();
      return;
    }

    try {
      const url = new URL(channelUrl);

      if (url.protocol !== "https:") {
        throw new Error("Link canale non valido.");
      }

      if (link) link.href = url.toString();
    } catch (error) {
      console.error(error);
      box?.remove();
    }
  }

  function initialiseArticleQuestion(article) {
    const button = document.querySelector(
      "[data-article-question]"
    );

    button?.addEventListener("click", () => {
      const message = document.getElementById("waMessage");
      const avatar = document.getElementById("wa-chat-avatar");

      if (message) {
        message.value =
          `Ciao YUME, ho letto l’articolo “${article.title}” ` +
          `e vorrei chiedervi:\n\n`;
      }

      avatar?.click();
    });
  }

  function initialiseArticleEngagement(article) {
    initialiseSharing(article);
    initialiseWhatsAppChannel();
    initialiseArticleQuestion(article);
    void initialiseReactions(article);
  }

  async function load() {
    const slug = getSlug();

    if (!slug) {
      window.location.replace("/blog/");
      return;
    }

    try {
      status.textContent = "Caricamento articolo…";

      const payload =
        await window.YumeJournalApi.getArticle(slug);

      if (!payload?.article) {
        throw new Error(
          "Articolo non trovato o non pubblicato."
        );
      }

      updateMetadata(
        payload.article,
        payload.author,
        payload.category
      );

      root.innerHTML =
        window.YumeJournalRenderer.renderArticle(payload);

      status.remove();

      initialiseArticleEngagement(payload.article);
    } catch (error) {
      console.error(error);

      status.textContent =
        error.message || "Articolo non disponibile.";

      root.innerHTML = `
        <div class="journal-not-found">
          <h1>Articolo non disponibile</h1>
          <p>
            Potrebbe essere stato ritirato oppure
            l’indirizzo non è corretto.
          </p>
          <a href="/blog/">Torna al Journal</a>
        </div>
      `;
    }
  }

  load();
})();
