/**
 * Configurazione PUBBLICA del Journal.
 * Questa publishable key può stare nel browser.
 * Non inserire mai una chiave sb_secret_ o service_role.
 */
window.YUME_JOURNAL_CONFIG = Object.freeze({
  supabaseUrl: "https://hlikhyemzophandqkjdy.supabase.co",
  supabasePublishableKey: "sb_publishable_Z5S66pZ85I3WlGuJDArJhA_QuXhKP51",
  siteUrl: "https://yume-travel.com",
  pageSize: 24,

  /**
   * Incolla qui il link pubblico reale del canale YUME ON BOARD.
   * Esempio: https://whatsapp.com/channel/XXXXXXXXXXXXXXXX
   * Se resta vuoto, il box viene nascosto automaticamente.
   */
  whatsappChannelUrl: "",

  shareCampaign: "yume_journal",
});
