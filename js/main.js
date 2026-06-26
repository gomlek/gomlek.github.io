const DEVELOPER_URL =
  "https://apps.apple.com/tr/developer/tamer-bayramogullari/id963571955";
const FEATURED_IDS = new Set([
  "1672743993",
  "1502904706",
  "6478599818",
  "1504857982",
  "6447378210",
  "6499426904",
]);

let apps = [];
let lang = localStorage.getItem("gomlek-lang") || "tr";
let activeGenre = "all";
let searchQuery = "";

function t(key) {
  const parts = key.split(".");
  let val = I18N[lang];
  for (const p of parts) val = val?.[p];
  return val ?? key;
}

function genreLabel(genre) {
  return t(`genres.${genre}`) || genre;
}

function setLang(next) {
  lang = next;
  localStorage.setItem("gomlek-lang", lang);
  document.documentElement.lang = lang;
  document.querySelectorAll("[data-lang-btn]").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.langBtn === lang);
  });
  applyTranslations();
  render();
}

function applyTranslations() {
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    el.textContent = t(el.dataset.i18n);
  });
  document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
    el.placeholder = t(el.dataset.i18nPlaceholder);
  });
}

function filteredApps() {
  return apps.filter((app) => {
    const matchesGenre = activeGenre === "all" || app.genre === activeGenre;
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      app.name.toLowerCase().includes(q) ||
      app.shortName.toLowerCase().includes(q) ||
      app.genre.toLowerCase().includes(q);
    return matchesGenre && matchesSearch;
  });
}

function featuredApps() {
  return apps.filter((app) => FEATURED_IDS.has(app.id));
}

function priceLabel(price) {
  if (!price || price === "Free" || price === "0" || price === "Ücretsiz") {
    return t("free");
  }
  return price;
}

function appCard(app, featured = false) {
  const desc = app.description[lang] || app.description.en;
  const privacyHref =
    app.privacy || (lang === "tr" ? "privacy-tr.html" : "privacy.html");
  const screenshots = app.screenshots?.slice(0, 3) || [];

  const shotsHtml = screenshots.length
    ? `<div class="card__shots">${screenshots
        .map(
          (src) =>
            `<img src="${src}" alt="" loading="lazy" width="120" height="260">`
        )
        .join("")}</div>`
    : "";

  return `
    <article class="card${featured ? " card--featured" : ""}" data-genre="${app.genre}">
      <div class="card__top">
        <img class="card__icon" src="${app.icon}" alt="${app.shortName}" width="72" height="72" loading="lazy">
        <div class="card__meta">
          <span class="card__genre">${genreLabel(app.genre)}</span>
          <h3 class="card__name">${app.shortName}</h3>
          <p class="card__full-name">${app.name}</p>
        </div>
        <span class="card__price">${priceLabel(app.price)}</span>
      </div>
      <p class="card__desc">${desc}</p>
      ${shotsHtml}
      <div class="card__actions">
        <a class="btn btn--primary" href="${app.url}" target="_blank" rel="noopener">${t("viewAppStore")}</a>
        <a class="btn btn--ghost" href="${privacyHref}">${t("viewPrivacy")}</a>
      </div>
    </article>
  `;
}

function renderFilters() {
  const genres = ["all", ...new Set(apps.map((a) => a.genre))];
  const el = document.getElementById("genre-filters");
  el.innerHTML = genres
    .map((g) => {
      const label = g === "all" ? t("filterAll") : genreLabel(g);
      const active = g === activeGenre ? " active" : "";
      return `<button class="filter-btn${active}" data-genre="${g}">${label}</button>`;
    })
    .join("");

  el.querySelectorAll(".filter-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      activeGenre = btn.dataset.genre;
      render();
    });
  });
}

function render() {
  const featured = featuredApps();
  document.getElementById("featured-grid").innerHTML = featured
    .map((app) => appCard(app, true))
    .join("");

  const list = filteredApps();
  document.getElementById("apps-grid").innerHTML = list.length
    ? list.map((app) => appCard(app)).join("")
    : `<p class="empty">${t("noResults")}</p>`;

  document.getElementById("apps-count").textContent = `${apps.length} ${t("appsCount")}`;

  renderFilters();
  applyTranslations();
}

async function init() {
  const res = await fetch("./js/apps.json");
  apps = await res.json();

  document.querySelectorAll("[data-lang-btn]").forEach((btn) => {
    btn.addEventListener("click", () => setLang(btn.dataset.langBtn));
  });

  document.getElementById("search").addEventListener("input", (e) => {
    searchQuery = e.target.value.trim();
    render();
  });

  document.documentElement.lang = lang;
  document.querySelectorAll("[data-lang-btn]").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.langBtn === lang);
  });

  render();
}

init();
