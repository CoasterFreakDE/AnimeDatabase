
/**
 * Retrieves the value of an HTML element by its ID.
 *
 * @param {string} id - The ID of the HTML element.
 * @returns {string} The value of the HTML element.
 */
const getElementValue = id => document.getElementById(id).value;
/**
 * Sets the text content of an element with the provided id.
 *
 * @param {string} id - The id of the element to set the text content of.
 * @param {string} value - The value to set as the text content.
 * @returns {void}
 */
const setTextContent = (id, value) => {
    document.getElementById(id).textContent = value;
};

/**
 * Updates the age values based on user input.
 *
 * @return {void} - This method does not return any value.
 */
function updateAgeValues() {
    const ageMinValue = document.getElementById('protagonist-age-min').value;
    const ageMaxValue = document.getElementById('protagonist-age-max').value;

    document.getElementById('age-min-value').textContent = ageMinValue;
    document.getElementById('age-max-value').textContent = ageMaxValue;
}

/**
 * Updates the rating value based on the input.
 *
 * @return {void}
 */
function updateRating() {
    setTextContent('rating-value', getElementValue('rating'));
}

/**
 * Load filters from the server.
 *
 * @returns {void}
 */
async function loadFilters() {
    try {
        const response = await fetch('https://isekaibackend.coasterfreak.de/filters');
        if (!response.ok) {
            throw new Error('Network response was not ok ' + response.statusText);
        }
        const data = await response.json();
        populateFilters(data);
    } catch (error) {
        console.error('There has been a problem with your fetch operation:', error);
    }
}

/**
 * Populates the filter elements with the provided data.
 *
 * @param {Object} data - The data object containing the filter options.
 * @param {Array} data.genres - The array of genre options.
 * @param {Array} data.moods - The array of mood options.
 * @param {Array} data.eras - The array of era options.
 * @param {Array} data.countries - The array of country options.
 * @param {Array} data.protagonistGenders - The array of protagonist gender options.
 * @param {Array} data.licenseStatuses - The array of license status options.
 * @param {Array} data.languages - The array of language options.
 */
function populateFilters(data) {
    // Funktion zum Befüllen eines einzelnen Filter-Elements
    function fillFilterElement(elementId, values) {
        const element = document.getElementById(elementId);
        element.innerHTML = '';  // Clear any existing options

        // Option "--All--" hinzufügen
        const allOption = document.createElement('option');
        allOption.value = '';
        allOption.textContent = '--All--';
        element.appendChild(allOption);

        values.forEach(value => {
            const option = document.createElement('option');
            option.value = value;
            option.textContent = value;
            element.appendChild(option);
        });
    }

    // Befüllen der Filter-Elemente mit den Daten
    fillFilterElement('genre', data.genres);
    fillFilterElement('mood', data.moods);
    fillFilterElement('era', data.eras);
    fillFilterElement('country', data.countries);
    fillFilterElement('protagonist-gender', data.protagonistGenders);
    fillFilterElement('license-status', data.licenseStatuses.map(status => status ? 'Licensed' : 'Not Licensed'));
    fillFilterElement('language', data.languages);
}



/**
 * Loads data based on specified filters and search criteria.
 * @async
 * @function loadData
 * @returns {void}
 * @throws {Error} If the network response is not ok.
 * @throws {Error} If there is a problem with the fetch operation.
 */
async function loadData() {
    // Filterwerte abrufen
    const genre = getElementValue('genre');
    const mood = getElementValue('mood');
    const era = getElementValue('era');
    const country = getElementValue('country');
    const rating = getElementValue('rating');
    const protagonistGender = getElementValue('protagonist-gender');
    const protagonistAgeMin = getElementValue('protagonist-age-min');
    const protagonistAgeMax = getElementValue('protagonist-age-max');
    const licenseStatus = getElementValue('license-status');
    const language = getElementValue('language');
    const sort = getElementValue('sort');
    const searchString = getElementValue('search');

    // URL mit Query-Parametern erstellen
    const url = new URL('https://isekaibackend.coasterfreak.de');
    const params = {
        genre,
        mood,
        era,
        country,
        rating,
        protagonistGender,
        protagonistAgeMin,
        protagonistAgeMax,
        licenseStatus,
        language,
        sort,
        searchString
    };
    Object.keys(params).forEach(key => params[key] && url.searchParams.append(key, params[key]));

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Network response was not ok ' + response.statusText);
        }
        const data = await response.json();
        populateTable(data);
    } catch (error) {
        console.error('There has been a problem with your fetch operation:', error);
    }
}

/**
 * Populates the table with provided data.
 *
 * @param {Array} data - The data to populate the table with.
 * @return {void}
 */
function populateTable(data) {
    const tableBody = document.getElementById('table-body');
    tableBody.innerHTML = '';  // Clear any existing data
    data.forEach(item => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><a href="${item.streamLink}" target="_blank">${item.title}</a></td>
            <td>${item.description}</td>
            <!-- weitere Felder -->
        `;
        tableBody.appendChild(row);
    });
}

// Load the data when the page loads and when any filter value changes
// Load the filter data when the page loads
window.addEventListener('load', loadFilters);
window.addEventListener('load', loadData);
document.getElementById('filter').addEventListener('change', loadData);
document.getElementById('sort').addEventListener('change', loadData);
document.getElementById('search').addEventListener('input', loadData);