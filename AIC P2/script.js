import showCards from './editable_js/template_cards.js';
import showCategories from './editable_js/template_category.js';
import showStats from './editable_js/template_stats.js';
import showTable from './editable_js/template_table.js';

import loadData from './editable_js/load_data.js';

// ============================================
// DISPLAY MANAGEMENT - PROVIDED
// ============================================

function updateDisplay(content) {
  document.getElementById("data-display").innerHTML = content;
}

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


    updateDisplay(showCards(data));
    updateButtonStates("cards");

    console.log("Application ready!");
  } catch (error) {
    console.error("Application failed to start:", error);
    showError(error.message);
  }
});
