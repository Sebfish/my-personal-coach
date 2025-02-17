console.log("Script chargé !");

let rowCount = 5;

function getPageName() {
    return document.title.split(" - ")[0].trim(); // Récupère "Page 1", "Page 2", etc.
}

function addRow() {
    if (rowCount >= 10) return;
    const container = document.getElementById('input-container');
    const row = document.createElement('div');
    row.className = 'row';
    row.innerHTML = `
        <input type="text" placeholder="Bloc 1">
        <input type="text" placeholder="Bloc 2">
        <input type="text" placeholder="Bloc 3">
    `;
    container.appendChild(row);
    rowCount++;
}

function saveData() {
    const pageName = getPageName(); // Utilise maintenant "Page 1", "Page 2"...

    const rows = document.querySelectorAll('.row');
    const data = [];
    rows.forEach(row => {
        const inputs = row.querySelectorAll('input');
        data.push([inputs[0].value, inputs[1].value, inputs[2].value]);
    });

    const comment = document.getElementById('comment').value;
    const date = new Date().toLocaleDateString('fr-FR');
    let savedCount = localStorage.getItem(pageName + '-count') || 0;
    savedCount++;
    let saveKey = `${pageName} (${savedCount}) - ${date}`;
    localStorage.setItem(saveKey, JSON.stringify({ data, comment }));
    localStorage.setItem(pageName + '-count', savedCount);
    
    console.log("Données enregistrées :", saveKey, JSON.stringify({ data, comment }));
    displaySavedData(saveKey, data, comment);
}

function displaySavedData(key, data, comment) {
    console.log("🔎 Données récupérées :", key, data, comment);

    if (!data || !Array.isArray(data)) {
        console.error("⚠️ Erreur : Les données sont invalides ou non définies :", data);
        return;
    }

    const savedContainer = document.getElementById('saved-container');
    if (!savedContainer) {
        console.error("⚠️ Erreur : Élément #saved-container non trouvé !");
        return;
    }

    const savedItem = document.createElement('div');
    savedItem.className = 'saved-item';
    savedItem.innerHTML = `<strong>${key}</strong><br>${data.map(row => row.join(' | ')).join('<br>')}<br><em>${comment}</em>`;
    
    savedContainer.prepend(savedItem);
}


function loadSavedData() {
    console.log("🔄 Chargement des données sauvegardées pour cette page...");
    const savedContainer = document.getElementById('saved-container');
    savedContainer.innerHTML = "";

    const pageName = getPageName(); // Utilise maintenant "Page 1", "Page 2"...
    let keys = Object.keys(localStorage).filter(key => key.startsWith(pageName)); // Filtrer par page
    keys.sort().reverse(); // Trier du plus récent au plus ancien

    console.log(`📌 ${keys.length} entrées trouvées dans localStorage pour ${pageName}`);

    if (keys.length === 0) {
        console.log("❌ Aucune donnée trouvée.");
        return;
    }

    keys.forEach(key => {
        const savedString = localStorage.getItem(key);
        console.log("📂 Donnée brute récupérée :", savedString);

        try {
            const savedData = JSON.parse(savedString);
            console.log("✅ Donnée après parsing :", savedData);

            if (!savedData || typeof savedData !== "object" || !savedData.data) {
                console.error("⚠️ Problème avec les données récupérées :", savedData);
                return;
            }

            displaySavedData(key, savedData.data, savedData.comment);
        } catch (error) {
            console.error("🚨 Erreur JSON.parse() sur", key, error);
        }
    });
}

window.onload = loadSavedData;
