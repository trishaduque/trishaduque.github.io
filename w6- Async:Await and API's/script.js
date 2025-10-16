// ============================================
// TUTORIAL 6: LOAD REAL DATA
// From static data to async data loading
// ============================================

// Global variable to store loaded restaurant data
let restaurants = [];

// Wait for the page to load
document.addEventListener('DOMContentLoaded', function() {
    console.log('Tutorial 6: Async data loading ready!');
    
    // Get UI elements
    const loadButton = document.querySelector('#load-data-button');
    const statusDisplay = document.querySelector('#loading-status');
    const statusMessage = statusDisplay.querySelector('.status-message');
    
    // Get the method buttons (start disabled)
    const displayButton = document.querySelector('#display-button');
    const filterButton = document.querySelector('#filter-button');
    const mapButton = document.querySelector('#map-button');
    const errorButton = document.querySelector('#error-button');
    
    // ============================================
    // MAIN DATA LOADING FUNCTION
    // ============================================
    
    // This is the key new skill - loading data asynchronously
    loadButton.addEventListener('click', async function() {
        
        // Step 1: Show loading state
        // Hint: Change statusDisplay classes and statusMessage text
        // Hint: Disable the load button while loading
        
        // YOUR CODE HERE:
        statusDisplay.classList.remove('success', 'error');
        statusDisplay.classList.add('loading');
        statusMessage.textContent = 'Loading restaurant data...';
        loadButton.disabled = true;
        
        
        try {
            // Step 2: Use fetch() to load data
            // Hint: const response = await fetch('restaurants.json');
            // Hint: Check if response.ok before continuing
            
            // Step 3: Convert response to JSON
            // Hint: const data = await response.json();
            
            // Step 4: Store data in global variable
            // Hint: restaurants = data;
            
            // YOUR CODE HERE:
            const response = await fetch('restaurants.json');
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            restaurants = data;
            
            
            // Step 5: Show success state and enable buttons
            // Hint: Update statusDisplay classes and message
            // Hint: Enable all the method buttons
            
            // YOUR CODE HERE:
            statusDisplay.classList.remove('loading');
            statusDisplay.classList.add('success');
            statusMessage.textContent = `Successfully loaded ${restaurants.length} restaurants!!!`;
            
            displayButton.disabled = false;
            filterButton.disabled = false;
            mapButton.disabled = false;
            loadButton.disabled = false;
            
            
        } catch (error) {
            // Step 6: Handle errors gracefully
            // Hint: Show error state with user-friendly message
            // Hint: Log the actual error for debugging
            
            // YOUR CODE HERE:
            statusDisplay.classList.remove('loading');
            statusDisplay.classList.add('error');
            statusMessage.textContent = 'Failed to load restaurant data. Please try again.';
            console.error('Error loading data:', error);
            loadButton.disabled = false;
            
            
        }
    });
    
    // ============================================
    // ARRAY METHOD FUNCTIONS - Same as Tutorial 5
    // ============================================
    
    // Display all restaurants (same as Tutorial 5, but using loaded data)
    displayButton.addEventListener('click', function() {
        const restaurantList = document.querySelector('#restaurant-list');
        
        // Check if we have data first
        if (restaurants.length === 0) {
            restaurantList.innerHTML = '<p class="placeholder">No data loaded yet</p>';
            return;
        }
        
        // Step 7: Use the same forEach logic from Tutorial 5
        // Hint: restaurants.forEach(function(restaurant) { })
        
        // YOUR CODE HERE:
        restaurantList.innerHTML = '<h3>All Restaurants:</h3>';
        
        restaurants.forEach(function(restaurant) {
            const restaurantDiv = document.createElement('div');
            restaurantDiv.className = 'restaurant-item';
            restaurantDiv.innerHTML = `
                <div class="restaurant-name">${restaurant.name}</div>
                <div class="restaurant-cuisine">${restaurant.cuisine} • ${restaurant.neighborhood}</div>
                <div class="restaurant-rating">Rating: ${restaurant.rating} ⭐</div>
                <span class="restaurant-price">${restaurant.priceRange}</span>
                <div style="color: #666; font-size: 0.85rem; margin-top: 0.25rem;">
                    ${restaurant.hours} • ${restaurant.phoneNumber}
                </div>
            `;
            restaurantList.appendChild(restaurantDiv);
        });
        
        
    });
    
    // Filter cheap restaurants (same logic, loaded data)
    filterButton.addEventListener('click', function() {
        const filteredList = document.querySelector('#filtered-list');
        
        if (restaurants.length === 0) {
            filteredList.innerHTML = '<p class="placeholder">No data loaded yet</p>';
            return;
        }
        
        // Step 8: Use the same filter logic from Tutorial 5
        // Hint: const cheapRestaurants = restaurants.filter(function(restaurant) { })
        
        // YOUR CODE HERE:
        const cheapRestaurants = restaurants.filter(function(restaurant) {
            return restaurant.priceRange === '$' || restaurant.priceRange === '$$';
        });
        
        filteredList.innerHTML = `<h3>Affordable Restaurants (${cheapRestaurants.length} found):</h3>`;
        
        cheapRestaurants.forEach(function(restaurant) {
            const restaurantDiv = document.createElement('div');
            restaurantDiv.className = 'restaurant-item';
            restaurantDiv.innerHTML = `
                <div class="restaurant-name">${restaurant.name}</div>
                <div class="restaurant-cuisine">${restaurant.cuisine} • ${restaurant.neighborhood}</div>
                <div class="restaurant-rating">Rating: ${restaurant.rating} ⭐</div>
                <span class="restaurant-price">${restaurant.priceRange}</span>
            `;
            filteredList.appendChild(restaurantDiv);
        });
        
        
    });
    
    // Show restaurant names (same logic, loaded data)
    mapButton.addEventListener('click', function() {
        const mappedList = document.querySelector('#mapped-list');
        
        if (restaurants.length === 0) {
            mappedList.innerHTML = '<p class="placeholder">No data loaded yet</p>';
            return;
        }
        
        // Step 9: Use the same map logic from Tutorial 5
        // Hint: const names = restaurants.map(function(restaurant) { })
        
        // YOUR CODE HERE:
        const names = restaurants.map(function(restaurant) {
            return restaurant.name;
        });
        
        mappedList.innerHTML = '<h3>Restaurant Names:</h3>';
        
        const namesList = document.createElement('ul');
        namesList.className = 'name-list';
        
        names.forEach(function(name) {
            const listItem = document.createElement('li');
            listItem.textContent = name;
            namesList.appendChild(listItem);
        });
        
        mappedList.appendChild(namesList);
        
        
    });
    
    // ============================================
    // ERROR HANDLING DEMO
    // ============================================
    
    // This demonstrates what happens when fetch() fails
    errorButton.addEventListener('click', async function() {
        const errorDisplay = document.querySelector('#error-display');
        
        errorDisplay.innerHTML = '<div class="status-display loading"><p class="status-message">Trying to load from bad URL...</p></div>';
        
        try {
            // This will fail because the URL doesn't exist
            const response = await fetch('nonexistent-file.json');
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            errorDisplay.innerHTML = '<p class="placeholder">This should not appear</p>';
            
        } catch (error) {
            // Step 10: Show user-friendly error message
            // Hint: Create error message div with helpful text
            
            // YOUR CODE HERE:
            const errorMessage = document.createElement('div');
            errorMessage.className = 'error-message';
            errorMessage.innerHTML = `
                <strong> Error Loading Data</strong>
                <p>Could not load data from the server. This could be because:</p>
                <ul style="text-align: left; margin: 0.5rem 0;">
                    <li>The file doesn't exist</li>
                    <li>Network connection issues</li>
                    <li>Server is unavailable</li>
                </ul>
                <p style="margin-top: 0.5rem;"><em>Technical error: ${error.message}</em></p>
            `;
            
            errorDisplay.innerHTML = '';
            errorDisplay.appendChild(errorMessage);
            
            
            console.error('Demonstrated error:', error);
        }
    });
    
});

// ============================================
// UTILITY FUNCTIONS
// ============================================

// Helper function to enable/disable method buttons
function toggleMethodButtons(enabled) {
    const buttons = [
        document.querySelector('#display-button'),
        document.querySelector('#filter-button'),
        document.querySelector('#map-button')
    ];
    
    buttons.forEach(button => {
        button.disabled = !enabled;
    });
}

// Helper function to update status display
function updateStatus(state, message) {
    const statusDisplay = document.querySelector('#loading-status');
    const statusMessage = statusDisplay.querySelector('.status-message');
    
    // Remove all state classes
    statusDisplay.classList.remove('loading', 'success', 'error');
    
    // Add new state class
    if (state !== 'ready') {
        statusDisplay.classList.add(state);
    }
    
    statusMessage.textContent = message;
}

// ============================================
// DEBUGGING FUNCTIONS
// ============================================

// Check if data is loaded
function checkDataStatus() {
    console.log('=== Data Status ===');
    console.log('Restaurants loaded:', restaurants.length);
    if (restaurants.length > 0) {
        console.log('First restaurant:', restaurants[0].name);
        console.log('All restaurant names:', restaurants.map(r => r.name));
    }
    console.log('==================');
}

// Manually load data (for testing)
async function manualLoadData() {
    try {
        const response = await fetch('restaurants.json');
        if (!response.ok) throw new Error('Load failed');
        const data = await response.json();
        restaurants = data;
        console.log(`Manually loaded ${restaurants.length} restaurants`);
        toggleMethodButtons(true);
        updateStatus('success', `Successfully loaded ${restaurants.length} restaurants`);
    } catch (error) {
        console.error('Manual load failed:', error);
        updateStatus('error', 'Failed to load data');
    }
}

// Reset everything
function resetTutorial() {
    restaurants = [];
    toggleMethodButtons(false);
    updateStatus('ready', 'Ready to load data');
    
    // Clear all displays
    document.querySelector('#restaurant-list').innerHTML = '<p class="placeholder">Load data first, then click to display all restaurants</p>';
    document.querySelector('#filtered-list').innerHTML = '<p class="placeholder">Load data first, then click to show only affordable restaurants</p>';
    document.querySelector('#mapped-list').innerHTML = '<p class="placeholder">Load data first, then click to show just the restaurant names</p>';
    document.querySelector('#error-display').innerHTML = '<p class="placeholder">Click to see error handling in action</p>';
    
    console.log('Tutorial reset');
}

// Call these functions in the browser console:
// checkDataStatus() - see if data is loaded
// manualLoadData() - load data without clicking button
// resetTutorial() - reset everything for testing