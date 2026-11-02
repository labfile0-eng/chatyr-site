/* Add only a known landing-page label to the visitor-controlled email draft. No network requests, cookies or storage. */
(() => {
  const scenarios = {
    "chat-na-sayt": "Чат на сайт",
    "ii-otvety-klientam": "Ответы ИИ",
    "dlya-internet-magazinov": "Интернет-магазин",
    "dlya-optovyh-prodazh": "Оптовые заявки",
    "hranenie-perepiski-v-kazahstane": "Хранение в Казахстане"
  };
  const source = new URLSearchParams(location.search).get("source");
  if (!Object.prototype.hasOwnProperty.call(scenarios, source)) return;
  const link = document.querySelector('a[href^="mailto:hello@chatyr.kz?"]');
  if (!link) return;
  const mail = new URL(link.href);
  mail.searchParams.set("subject", "Chatyr — " + scenarios[source]);
  mail.searchParams.set("body", mail.searchParams.get("body") + "\n\nСценарий: " + scenarios[source] + "\nСтраница: https://chatyr.kz/" + source + ".html");
  link.href = mail.href;
})();
