import showCards from './editable_js/template_cards.js';
import showCategories from './editable_js/template_category.js';
import showStats from './editable_js/template_stats.js';
import showTable from './editable_js/template_table.js';

import loadData from './editable_js/load_data.js';

window.toggleCategoryGroup = function(sectionId, btn){
  try {
    const section = document.getElementById(sectionId);
    if (!section) return;
    const extras = section.querySelectorAll('.is-extra');
    const isExpanded = btn.getAttribute('data-state') === 'expanded';
    extras.forEach(el => el.classList.toggle('hidden', isExpanded)); // hide if currently expanded
    // Flip state
    const nextExpanded = !isExpanded;
    btn.setAttribute('data-state', nextExpanded ? 'expanded' : 'collapsed');
    btn.textContent = nextExpanded ? 'Show less' : 'Show all (' + extras.length + ' more)';
    // when expanding, show items; when collapsing, hide items
    extras.forEach(el => el.classList.toggle('hidden', !nextExpanded));
  } catch (e) {
    console.error('toggleCategoryGroup error', e);
  }
};


// ============================================
// DISPLAY MANAGEMENT - PROVIDED
// ============================================

/**
 * Update the display with new content
 */
function updateDisplay(content) {
  document.getElementById("data-display").innerHTML = content;
}

/**
 * Update button states
 */
function updateButtonStates(activeView) {
  document.querySelectorAll(".view-button").forEach((button) => {
    button.classList.remove("active");
  });
  document.getElementById(`btn-${activeView}`).classList.add("active");
}

/**
 * Show loading state
 */
function showLoading() {
  updateDisplay('<div class="loading">Loading data from API...</div>');
}

/**
 * Show error state
 */
 /*html*/ 
function showError(message) {
  updateDisplay(`
                <div class="error">
                    <h3>Error Loading Data</h3>
                    <p>${message}</p>
                    <button onclick="location.reload()">Try Again</button>
                </div>
            `);
}

// ============================================
// APPLICATION INITIALIZATION - PROVIDED
// ============================================


document.addEventListener("DOMContentLoaded", async () => {
  console.log("Starting application...");

  try {
    // Load data once
    showLoading();
    const data = await loadData();
    console.log(`Loaded ${data.length} items from API`);

    document.getElementById("btn-cards").onclick = () => {
      updateDisplay(showCards(data));
      updateButtonStates("cards");
    };

    document.getElementById("btn-table").onclick = () => {
      updateDisplay(showTable(data));
      updateButtonStates("table");
    };

    document.getElementById("btn-categories").onclick = () => {
      updateDisplay(showCategories(data));
      updateButtonStates("categories");
    };

    document.getElementById("btn-stats").onclick = () => {
      updateDisplay(showStats(data));
      updateButtonStates("stats");
    };

    // Show initial view
    updateDisplay(showCards(data));
    updateButtonStates("cards");

    console.log("Application ready!");
  } catch (error) {
    console.error("Application failed to start:", error);
    showError(error.message);
  }
});

window._AIC_CURRENT_VIEW = 'cards';
window._AIC_FILTER_TERM = '';

const filterArt = (arr, term) => {
  const q = (term || '').toLowerCase().trim();
  if (!q) return arr;
  const fields = ['title','artist_title','department_title','place_of_origin','medium_display','artwork_type_title'];
  return arr.filter(d => fields.some(k => String(d[k] || '').toLowerCase().includes(q)));
};

const renderCurrent = () => {
  const mount = document.getElementById('data-display');
  const data = filterArt((window._AIC_FULL_DATA || []), window._AIC_FILTER_TERM);

  switch (window._AIC_CURRENT_VIEW) {
    case 'table':
      mount.innerHTML = showTable(data);
      break;
    case 'category':
      mount.innerHTML = showCategories(data, { groupField: 'department_title' });
      break;
    case 'stats':
      mount.innerHTML = showStats(data);
      break;
    default:
      mount.innerHTML = showCards(data);
  }
};

document.addEventListener('DOMContentLoaded', () => {
  // Hook up search
  const input = document.getElementById('search-input');
  if (input) {
    input.addEventListener('input', (e) => {
      window._AIC_FILTER_TERM = e.target.value || '';
      renderCurrent();
    });
  }
  const btns = {
    cards: document.getElementById('btn-cards'),
    table: document.getElementById('btn-table'),
    category: document.getElementById('btn-category'),
    stats: document.getElementById('btn-stats'),
  };
  if (btns.cards) btns.cards.onclick = () => { window._AIC_CURRENT_VIEW='cards'; renderCurrent(); };
  if (btns.table) btns.table.onclick = () => { window._AIC_CURRENT_VIEW='table'; renderCurrent(); };
  if (btns.category) btns.category.onclick = () => { window._AIC_CURRENT_VIEW='category'; renderCurrent(); };
  if (btns.stats) btns.stats.onclick = () => { window._AIC_CURRENT_VIEW='stats'; renderCurrent(); };

  // If data has already loaded, render now; otherwise a later script will render initially.
  if (window._AIC_FULL_DATA && Array.isArray(window._AIC_FULL_DATA)) {
    renderCurrent();
  }
});
