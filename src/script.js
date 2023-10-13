
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

function addLanguageFields() {
    const container = document.getElementById('languages-container');
    const index = container.children.length;
    container.innerHTML += `
            <div id="language-${index}">
                <label for="language-${index}-name">Sprache:</label>
                <input type="text" id="language-${index}-name" name="languages[${index}][language]">
                <label for="language-${index}-sub">Untertitel:</label>
                <input type="checkbox" id="language-${index}-sub" name="languages[${index}][sub]">
                <label for="language-${index}-dub">Dub:</label>
                <input type="checkbox" id="language-${index}-dub" name="languages[${index}][dub]">
                <button type="button" onclick="removeField('language-${index}')">Entfernen</button>
            </div>
        `;
}

function addCharacterFields() {
    const container = document.getElementById('characters-container');
    const index = container.children.length;
    container.innerHTML += `
            <div id="character-${index}">
                <label for="character-${index}-name">Name:</label>
                <input type="text" id="character-${index}-name" name="characters[${index}][name]">
                <label for="character-${index}-role">Rolle:</label>
                <input type="text" id="character-${index}-role" name="characters[${index}][role]">
                <label for="character-${index}-description">Beschreibung:</label>
                <textarea id="character-${index}-description" name="characters[${index}][description]" rows="2" cols="20"></textarea>
                <button type="button" onclick="removeField('character-${index}')">Entfernen</button>
            </div>
        `;
}

function removeField(id) {
    const field = document.getElementById(id);
    field.remove();
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


document.getElementById('anime-form').addEventListener('submit', function(e) {
    e.preventDefault();  // Verhindert das standardmäßige Verhalten des Formulars, das die Seite neuladen würde

    const formData = new FormData(e.target);  // Erstellt ein FormData-Objekt aus dem Formular

    const protagonist = {
        gender: formData.get('protagonistGender'),
        age: parseInt(formData.get('protagonistAge'), 10),
        opLevel: formData.get('protagonistOpLevel')
    };

    const tags = {
        genre: formData.get('tagsGenre').split(','),
        mood: formData.get('tagsMood').split(','),
        era: formData.get('tagsEra')
    };

    const licenseStatus = {
        isLicensed: formData.get('isLicensed') === 'on',
        regions: formData.get('regions').split(',')
    };

    const languages = [];
    const languageFields = document.getElementById('languages-container').children;
    for (let i = 0; i < languageFields.length; i++) {
        const language = languageFields[i].querySelector(`input[name="languages[${i}][language]"]`).value;
        const sub = languageFields[i].querySelector(`input[name="languages[${i}][sub]"]`).checked;
        const dub = languageFields[i].querySelector(`input[name="languages[${i}][dub]"]`).checked;
        languages.push({ language, sub, dub });
    }

    const characters = [];
    const characterFields = document.getElementById('characters-container').children;
    for (let i = 0; i < characterFields.length; i++) {
        const name = characterFields[i].querySelector(`input[name="characters[${i}][name]"]`).value;
        const role = characterFields[i].querySelector(`input[name="characters[${i}][role]"]`).value;
        const description = characterFields[i].querySelector(`textarea[name="characters[${i}][description]"]`).value;
        characters.push({ name, role, description });
    }

    const dateString = formData.get('releaseDate');
    const dateObject = new Date(dateString);
    const releaseDate = Math.floor(dateObject.getTime() / 1000);

    const data = {
        title: formData.get('title'),
        description: formData.get('description'),
        seasons: parseInt(formData.get('seasons'), 10),
        episodes: parseInt(formData.get('episodes'), 10),
        streamLink: formData.get('streamLink'),
        protagonist,
        tags,
        originCountry: formData.get('originCountry'),
        releaseDate,
        studio: formData.get('studio'),
        rating: parseFloat(formData.get('rating')),
        licenseStatus,
        languages,
        characters
    };

    const postToken = formData.get('token');
    
    const json = JSON.stringify(data);  // Konvertiert das Datenobjekt in eine JSON-Zeichenfolge

    fetch('https://isekaibackend.coasterfreak.de', {  // Sendet die JSON-Daten an das Backend
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + postToken,
        },
        body: json
    })
        .then(response => response.json())  // Konvertiert die Antwort des Backends in ein JSON-Objekt
        .then(data => {
            console.log('Success:', data);  // Zeigt die Antwort des Backends in der Konsole an
        })
        .catch((error) => {
            console.error('Error:', error);  // Zeigt einen Fehler in der Konsole an, falls etwas schief geht
        });
});


// Load the data when the page loads and when any filter value changes
// Load the filter data when the page loads
window.addEventListener('load', loadFilters);
window.addEventListener('load', loadData);
document.getElementById('filter').addEventListener('change', loadData);
document.getElementById('sort').addEventListener('change', loadData);
document.getElementById('search').addEventListener('input', loadData);