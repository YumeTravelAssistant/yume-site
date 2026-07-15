(function () {
  "use strict";

  function getConfig() {
    const value = window.YUME_JOURNAL_CONFIG;
    if (!value?.supabaseUrl || !value?.supabasePublishableKey) {
      throw new Error("Configurazione Journal mancante.");
    }
    return value;
  }

  async function rpc(functionName, payload) {
    const { supabaseUrl, supabasePublishableKey } = getConfig();
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/${functionName}`, {
      method: "POST",
      cache: "no-store",
      headers: {
        apikey: supabasePublishableKey,
        Authorization: `Bearer ${supabasePublishableKey}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload || {}),
    });

    if (!response.ok) {
      let message = `Errore Journal (${response.status})`;
      try {
        const data = await response.json();
        message = data?.message || data?.hint || message;
      } catch (_) {}
      throw new Error(message);
    }

    return response.json();
  }

  window.YumeJournalApi = Object.freeze({
    listArticles({ limit = 24, offset = 0, categorySlug = null } = {}) {
      return rpc("journal_public_list", {
        p_limit: limit,
        p_offset: offset,
        p_category_slug: categorySlug,
      });
    },

    getArticle(slug) {
      return rpc("journal_public_get", { p_slug: String(slug || "").trim() });
    },
  });
})();
