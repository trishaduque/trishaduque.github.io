// config
const API_BASE = "https://api.artic.edu/api/v1";
const IIIF_BASE = "https://www.artic.edu/iiif/2/";
const LIVE_LIMIT = 100;
const DEFAULT_MODE = "highlights"; // "highlights" | "live"
const ID_CACHE_KEY = "AIC_HIGHLIGHT_IDS_V1";

// curated highlight list based on the "What to See in an Hour" guide (i started with a smaller record/data base so it was easier to build around at first)

const HIGHLIGHT_TARGETS = [
  { title: "Hartwell Memorial Window", artist: "Tiffany" },
  { title: "Buddha Shakyamuni Seated in Meditation", artist: "" },
  { title: "Saint George and the Dragon", artist: "Bernat Martorell" },
  { title: "A Sunday on La Grande Jatte — 1884", artist: "Georges Seurat" },
  { title: "Self-Portrait", artist: "Vincent van Gogh" },
  { title: "Sky Above Clouds IV", artist: "Georgia O’Keeffe" },
  { title: "American Gothic", artist: "Grant Wood" },
  { title: "Nighthawks", artist: "Edward Hopper" },
  { title: "The Old Guitarist", artist: "Pablo Picasso" },
  { title: "Still Life Reviving", artist: "Remedios Varo" },
  { title: "Untitled #", artist: "Cindy Sherman" }
];

// state
const appState = {
  mode: DEFAULT_MODE,
  view: "cards",   // "cards" | "table" | "categories" | "stats"
  raw: [],
  search: ""
};
const debounce = (fn, ms = 250) => {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), ms);
  };
};

const normalize = (item) => ({
  id: item.id,
  title: item.title || "Untitled",
  artist: item.artist_title || "Unknown artist",
  artist_display: item.artist_display || "",
  date: item.date_display || "Unknown date",
  medium: item.medium_display || "Unknown medium",
  department: item.department_title || "Other",
  classification: item.classification_title || "Unclassified",
  style: item.style_title || "—",
  origin: item.place_of_origin || "—",
  dimensions: item.dimensions || "—",
  imageUrl: item.image_id
    ? `${IIIF_BASE}${item.image_id}/full/400,/0/default.jpg`
    : null
});

function updateDisplay(html) {
  const el = document.getElementById("data-display");
  if (el) el.innerHTML = html;
}

function setActiveButton(viewName) {
  document
    .querySelectorAll(".view-button")
    .forEach((btn) => btn.classList.remove("active"));
  const active = document.querySelector(`#btn-${viewName}`);
  if (active) active.classList.add("active");
}

function showLoading(msg = "Loading artworks from AIC…") {
  updateDisplay(`<div class="loading">${msg}</div>`);
}

function showError(msg) {
  updateDisplay(`
    <div class="error">
      <h3>Could not load data</h3>
      <p>${msg}</p>
      <button onclick="location.reload()">Try again</button>
    </div>
  `);
}

// data load
async function loadLivePage(limit = LIVE_LIMIT) {
  const url = new URL(`${API_BASE}/artworks`);
  url.searchParams.set("page", "1");
  url.searchParams.set("limit", String(limit));
  url.searchParams.set(
    "fields",
    [
      "id",
      "title",
      "artist_title",
      "artist_display",
      "date_display",
      "medium_display",
      "department_title",
      "classification_title",
      "style_title",
      "place_of_origin",
      "dimensions",
      "image_id"
    ].join(",")
  );

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = await res.json();
  return (json.data || []).map(normalize);
}

async function loadByIds(ids) {
  const requests = ids.map((id) =>
    fetch(`${API_BASE}/artworks/${id}`)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status} for ID ${id}`);
        return r.json();
      })
      .then((json) => normalize(json.data))
      .catch(() => null)
  );

  const results = await Promise.all(requests);
  return results.filter(Boolean);
}

async function resolveHighlightIDs() {
  const cached = localStorage.getItem(ID_CACHE_KEY);
  if (cached) {
    try {
      const list = JSON.parse(cached);
      if (Array.isArray(list) && list.length) return list;
    } catch {}
  }

  const ids = [];
  for (const item of HIGHLIGHT_TARGETS) {
    const q = [item.title, item.artist].filter(Boolean).join(" ");
    const url = new URL(`${API_BASE}/artworks/search`);
    url.searchParams.set("q", q);
    url.searchParams.set("limit", "1");
    url.searchParams.set("fields", "id,title,artist_title");

    try {
      const res = await fetch(url.toString());
      if (!res.ok) continue;
      const js = await res.json();
      const hit = js.data && js.data[0];
      if (hit?.id) ids.push(hit.id);
    } catch {}
  }

  const unique = [...new Set(ids)];
  if (unique.length) {
    localStorage.setItem(ID_CACHE_KEY, JSON.stringify(unique));
  }
  return unique;
}

async function loadHighlights() {
  const ids = await resolveHighlightIDs();
  if (!ids.length) throw new Error("Could not resolve highlight IDs.");
  const items = await loadByIds(ids);
  if (!items.length) throw new Error("Highlight items failed to load.");
  return items;
}

// views
function viewCards(data, mode = "highlights") {
  if (!data.length) {
    return `<p class="muted">No results match your search.</p>`;
  }

  const title =
    mode === "live"
      ? "Live View: Current Art Institute Collection"
      : "Highlights: What to See in an Hour";

  const description =
    mode === "live"
      ? "A dynamic selection of artworks pulled from the AIC API explore what’s new each time you load."
      : "A curated tour of iconic pieces you can see in an hour, featuring Seurat, Van Gogh, O’Keeffe, Hopper, and more.";

  const cards = data
    .map(
      (art) => `
      <div class="art-card">
        <div class="art-image ${art.imageUrl ? "" : "placeholder"}">
          ${
            art.imageUrl
              ? `<img src="${art.imageUrl}" alt="${art.title} by ${art.artist}" loading="lazy">`
              : `<span class="no-image">No image</span>`
          }
        </div>
        <div class="art-meta">
          <h3 class="art-title">${art.title}</h3>
          <p class="art-artist"><strong>${art.artist}</strong></p>
          <p class="art-sub">${art.date} • ${art.department}</p>
          <p class="art-medium">${art.medium}</p>
        </div>
      </div>
    `
    )
    .join("");

  return `
    <h2 class="view-title">${title}</h2>
    <p class="view-description">${description}</p>
    <div class="card-grid">
      ${cards}
    </div>
  `;
}

function viewTable(data) {
  if (!data.length) {
    return `<p class="muted">No results match your search.</p>`;
  }

  const cols = [
    { key: "title", label: "Title" },
    { key: "artist", label: "Artist" },
    { key: "date", label: "Date" },
    { key: "department", label: "Department" },
    { key: "classification", label: "Classification" },
    { key: "medium", label: "Medium" }
  ];

  const header = cols
    .map(
      (c) =>
        `<th data-key="${c.key}" class="sortable">${c.label}<span class="sort-indicator"></span></th>`
    )
    .join("");

  const body = data
    .map(
      (art) => `
      <tr>
        <td>${art.title}</td>
        <td>${art.artist}</td>
        <td>${art.date}</td>
        <td>${art.department}</td>
        <td>${art.classification}</td>
        <td>${art.medium}</td>
      </tr>
    `
    )
    .join("");

  return `
    <h2 class="view-title">Tabular view</h2>
    <p class="view-description">Scan the collection, sort by artist, department, or title.</p>
    <div class="table-wrap">
      <table class="data-table" id="artworks-table">
        <thead><tr>${header}</tr></thead>
        <tbody>${body}</tbody>
      </table>
    </div>
  `;
}

function attachTableSorting() {
  const table = document.getElementById("artworks-table");
  if (!table) return;

  const headers = table.querySelectorAll("th[data-key]");
  let sortKey = null;
  let sortDir = 1;

  headers.forEach((th, idx) => {
    th.addEventListener("click", () => {
      const tbody = table.tBodies[0];
      const rows = Array.from(tbody.rows);

      if (sortKey === th.dataset.key) {
        sortDir = -sortDir;
      } else {
        sortKey = th.dataset.key;
        sortDir = 1;
      }

      rows.sort((a, b) => {
        const A = a.cells[idx].textContent.trim().toLowerCase();
        const B = b.cells[idx].textContent.trim().toLowerCase();
        return A.localeCompare(B) * sortDir;
      });

      tbody.innerHTML = "";
      rows.forEach((r) => tbody.appendChild(r));

      headers.forEach((h) => {
        h.querySelector(".sort-indicator").textContent = "";
      });
      th.querySelector(".sort-indicator").textContent =
        sortDir === 1 ? "↑" : "↓";
    });
  });
}

function viewCategories(data) {
  if (!data.length) {
    return `<p class="muted">No results match your search.</p>`;
  }

  const groups = data.reduce((acc, item) => {
    const key = item.department || "Other";
    (acc[key] ||= []).push(item);
    return acc;
  }, {});

  const ordered = Object.entries(groups).sort(
    (a, b) => b[1].length - a[1].length
  );

  const html = ordered
    .map(([dept, items]) => {
      const sample = items
        .slice(0, 6)
        .map(
          (a) =>
            `<li><span class="title">${a.title}</span><span class="by">by ${a.artist}</span></li>`
        )
        .join("");

      return `
        <section class="category">
          <header class="category-header">
            <h3>${dept}</h3>
            <div class="pill">${items.length} works</div>
          </header>
          <ul class="category-list">${sample}</ul>
        </section>
      `;
    })
    .join("");

  return `
    <h2 class="view-title">Collection Rooms</h2>
    <p class="view-description">Grouped by museum department just like walking into different galleries.</p>
    <div class="category-grid">
      ${html}
    </div>
  `;
}

function viewStats(data) {
  const total = data.length;
  if (!total) {
    return `
      <h2 class="view-title">Collection stats</h2>
      <p class="muted">No results match your search.</p>
    `;
  }

  const uniq = (arr) => [...new Set(arr)];
  const uniqueArtists = uniq(data.map((d) => d.artist)).length;
  const departments = uniq(data.map((d) => d.department));
  const classifications = uniq(data.map((d) => d.classification));
  const withImages = data.filter((d) => d.imageUrl).length;
  const withImagesPct = total ? Math.round((withImages / total) * 100) : 0;

  const counts = data.reduce((acc, d) => {
    acc[d.department] = (acc[d.department] || 0) + 1;
    return acc;
  }, {});

  const top = Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const max = Math.max(...Object.values(counts));

  const bars = top
    .map(
      ([dept, count]) => `
      <div class="bar-row">
        <div class="bar-label">${dept}</div>
        <div class="bar" style="--w:${(count / max) * 100}%"></div>
        <div class="bar-value">${count}</div>
      </div>
    `
    )
    .join("");

  return `
    <h2 class="view-title">Collection stats</h2>
    <p class="view-description">Insights for this selection from the Art Institute of Chicago API.</p>
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-number">${total}</div>
        <div class="stat-label">Artworks loaded</div>
      </div>
      <div class="stat-card">
        <div class="stat-number">${uniqueArtists}</div>
        <div class="stat-label">Unique artists</div>
      </div>
      <div class="stat-card">
        <div class="stat-number">${departments.length}</div>
        <div class="stat-label">Museum departments</div>
      </div>
      <div class="stat-card">
        <div class="stat-number">${classifications.length}</div>
        <div class="stat-label">Classifications</div>
      </div>
      <div class="stat-card">
        <div class="stat-number">${withImagesPct}%</div>
        <div class="stat-label">With images</div>
      </div>
    </div>
    <h3 class="subhead">Departments with most works</h3>
    <div class="bar-chart">
      ${bars}
    </div>
  `;
}

// GSAP animations
function handleAnimationError(error) {
  console.error("gsap animation error:", error);
}

function animateCardsView() {
  if (typeof gsap === "undefined") return;
  try {
    gsap.fromTo(
      ".art-card",
      { opacity: 0, y: 30, scale: 0.9 },
      { opacity: 1, y: 0, scale: 1, duration: 0.8, stagger: 0.15, ease: "power2.out" }
    );
  } catch (error) {
    handleAnimationError(error);
  }
}

function animateStatsView() {
  if (typeof gsap === "undefined") return;
  try {
    gsap.from(".stat-card", {
      opacity: 0,
      y: 10,
      duration: 0.35,
      stagger: 0.10,
      ease: "power2.out"
    });
    gsap.from(".bar-row", {
      opacity: 0,
      x: -20,
      duration: 0.35,
      stagger: 0.05,
      delay: 0.1,
      ease: "power1.out"
    });
  } catch (error) {
    handleAnimationError(error);
  }
}

function animateViewContainer() {
  if (typeof gsap === "undefined") return;
  try {
    gsap.from("#data-display", {
      opacity: 0,
      y: 6,
      duration: 0.2,
      ease: "power1.out"
    });
  } catch (error) {
    handleAnimationError(error);
  }
}

// GSAP hover animations for cards
document.addEventListener("mouseover", (e) => {
    const card = e.target.closest(".art-card");
    if (!card) return;

    gsap.to(card, {
        scale: 1.03,
        y: -4,
        duration: 0.25,
        ease: "power2.out"
    });
});

document.addEventListener("mouseout", (e) => {
    const card = e.target.closest(".art-card");
    if (!card) return;

    gsap.to(card, {
        scale: 1,
        y: 0,
        duration: 0.25,
        ease: "power2.inOut"
    });
});

// header reveal animation
gsap.from(".title-block", {
    opacity: 0,
    scale: 0.88,
    duration: 2.0,     
    ease: "power3.out",
});

// filtering + render
function filterData() {
  const q = appState.search.trim().toLowerCase();
  if (!q) return appState.raw;

  return appState.raw.filter((d) => {
    const hay = [
      d.title,
      d.artist,
      d.department,
      d.classification,
      d.medium
    ]
      .join(" • ")
      .toLowerCase();
    return hay.includes(q);
  });
}

function renderCurrent() {
  const data = filterData();

  if (appState.view === "cards") {
    updateDisplay(viewCards(data, appState.mode));
    animateViewContainer();
    animateCardsView();
  } else if (appState.view === "table") {
    updateDisplay(viewTable(data));
    attachTableSorting();
    animateViewContainer();
  } else if (appState.view === "categories") {
    updateDisplay(viewCategories(data));
    animateViewContainer();
  } else if (appState.view === "stats") {
    updateDisplay(viewStats(data));
    animateViewContainer();
    animateStatsView();
  }

  setActiveButton(appState.view);
}

// init
document.addEventListener("DOMContentLoaded", async () => {
  showLoading();

  const modeToggle = document.getElementById("mode-toggle");
  const searchInput = document.getElementById("search-input");

  try {
    appState.mode = DEFAULT_MODE;
    if (modeToggle) modeToggle.checked = appState.mode === "live";
    appState.raw = await loadHighlights();
    appState.view = "cards";
    renderCurrent();
  } catch (err) {
    showError(err.message);
  }

  document.getElementById("btn-cards").onclick = () => {
    appState.view = "cards";
    renderCurrent();
  };

  document.getElementById("btn-table").onclick = () => {
    appState.view = "table";
    renderCurrent();
  };

  document.getElementById("btn-categories").onclick = () => {
    appState.view = "categories";
    renderCurrent();
  };

  document.getElementById("btn-stats").onclick = () => {
    appState.view = "stats";
    renderCurrent();
  };

  if (searchInput) {
    const onSearch = debounce((e) => {
      appState.search = e.target.value || "";
      renderCurrent();
    }, 200);
    searchInput.addEventListener("input", onSearch);
  }

  if (modeToggle) {
    const labelEl = document.querySelector(".switch .label");
    const setLabel = () => {
      if (labelEl) {
        labelEl.textContent = modeToggle.checked
          ? "Live Mode"
          : "Highlights Mode";
      }
    };
    setLabel();

    modeToggle.addEventListener("change", async () => {
      showLoading(
        modeToggle.checked
          ? "Loading live collection…"
          : "Loading highlights…"
      );

      try {
        appState.mode = modeToggle.checked ? "live" : "highlights";
        appState.search = "";
        if (searchInput) searchInput.value = "";

        appState.raw = modeToggle.checked
          ? await loadLivePage(LIVE_LIMIT)
          : await loadHighlights();

        appState.view = "cards";
        setLabel();
        renderCurrent();
      } catch (err) {
        showError(err.message);
      }
    });
  }
});
