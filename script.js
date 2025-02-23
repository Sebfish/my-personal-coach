console.log("Script chargé !");

function getPageName() {
    return document.title.split(" - ")[0].trim(); // Récupère "Page 1", "Page 2", etc.
}

function addRow() {
    let container = document.getElementById("input-container");
    let newRow = document.createElement("div");
    newRow.classList.add("row");
    newRow.innerHTML = `
        <input class="big-input" type="text" placeholder="Titre ou description">
        <input type="text" placeholder="Bloc 1">
        <input type="text" placeholder="Bloc 2">
        <input type="text" placeholder="Bloc 3">
    `;
    container.appendChild(newRow);
}

function saveData() {
    const pageName = getPageName();

    const rows = document.querySelectorAll('.row');
    const data = [];
    rows.forEach(row => {
        const inputs = row.querySelectorAll('input');
        // On stocke toutes les values des inputs de cette ligne dans un tableau
        const rowValues = Array.from(inputs).map(input => input.value);
        data.push(rowValues);
    });

    let comment = "";
    const commentElement = document.getElementById('comment');
    if (commentElement) {
      comment = commentElement.value; 
    }
    const date = new Date().toLocaleDateString('fr-FR');
    
    // Récupération ou initialisation du compteur
    let savedCount = localStorage.getItem(pageName + '-count') || 0;
    savedCount++;
    
    // Clé qui identifiera cette sauvegarde
    let saveKey = `${pageName} (${savedCount}) - ${date}`;
    
    // Sauvegarde dans localStorage
    localStorage.setItem(saveKey, JSON.stringify({ data, comment }));
    localStorage.setItem(pageName + '-count', savedCount);
    
    console.log("Données enregistrées :", saveKey, JSON.stringify({ data, comment }));
    
    // Afficher immédiatement le bloc nouvellement créé
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

    // --- Créer l'élément contenant le bloc ---
    const savedItem = document.createElement('div');
    savedItem.className = 'saved-item';
    savedItem.innerHTML = `
        <strong>${key}</strong><br>
        ${data.map(row => row.join(' | ')).join('<br>')}<br>
        <em>${comment}</em>
    `;

    // --- Bouton "X" pour la suppression ---
    const deleteButton = document.createElement('button');
    deleteButton.textContent = "X"; // ou "✕"
    deleteButton.className = 'delete-btn'; 
    deleteButton.title = "Supprimer ce bloc";

    // Au clic, on supprime le bloc du DOM et du localStorage
    deleteButton.addEventListener('click', (event) => {
        event.stopPropagation(); // Empêche de déclencher l'événement de clic sur savedItem
        localStorage.removeItem(key);
        savedItem.remove();
        console.log(`Bloc "${key}" supprimé du localStorage et de la page.`);
    });

    // --- Ajouter le bouton X dans le bloc ---
    savedItem.appendChild(deleteButton);

    // --- Au clic sur le bloc, remplir les champs du formulaire ---
    savedItem.addEventListener('click', () => {
        console.log(`Remplissage du formulaire avec le bloc "${key}"`);
        fillFormWithData(data, comment);
    });

    // --- Insérer dans la page (en haut pour la plus récente) ---
    savedContainer.prepend(savedItem);
}

/**
 * Remplit le formulaire principal (rows) avec les données données (data, comment).
 */
function fillFormWithData(data, comment) {
    // Sélectionne toutes les lignes (row) du formulaire
    const rows = document.querySelectorAll('.row');
    
    // Pour chacune des lignes de données...
    data.forEach((rowData, rowIndex) => {
        if (rowIndex < rows.length) {
            const inputs = rows[rowIndex].querySelectorAll('input');
            // Pour chaque valeur
            rowData.forEach((value, inputIndex) => {
                if (inputs[inputIndex]) {
                    // On remplit la valeur (pas seulement le placeholder)
                    inputs[inputIndex].value = value;
                }
            });
        }
    });

    // Éventuellement, on met à jour le champ commentaire
    const commentField = document.getElementById('comment');
    if (commentField) {
        commentField.value = comment || '';
    }
}

// Charge tous les blocs sauvegardés et les affiche
function loadSavedData() {
    console.log("🔄 Chargement des données sauvegardées pour cette page...");
    const savedContainer = document.getElementById('saved-container');
    savedContainer.innerHTML = "";

    const pageName = getPageName();
    // Filtre pour exclure la clé "PageX-count" (le compteur) 
    let keys = Object.keys(localStorage)
        .filter(key => key.startsWith(pageName) && !key.endsWith('-count'))
        .sort()
        .reverse();

    console.log(`📌 ${keys.length} entrées trouvées dans localStorage pour ${pageName}`);

    if (keys.length === 0) {
        console.log("❌ Aucune donnée trouvée.");
        return;
    }

    // Affiche toutes les sauvegardes existantes
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

// Remplit le placeholder des champs avec la dernière sauvegarde,
// si on veut afficher la dernière saisie "en grisé" quand c'est vide
function loadLastSavedDataAsPlaceholder() {
    console.log("🔄 Chargement des dernières données en placeholder...");

    const pageName = getPageName();
    let keys = Object.keys(localStorage)
        .filter(key => key.startsWith(pageName) && !key.endsWith('-count'))
        .sort()
        .reverse(); // la clé la plus récente en premier

    if (keys.length === 0) {
        console.log("❌ Aucune donnée trouvée pour remplir les placeholders.");
        return;
    }

    // On prend la première clé (la plus récente)
    const lastSavedKey = keys[0];
    const lastSavedData = JSON.parse(localStorage.getItem(lastSavedKey));

    if (!lastSavedData || !Array.isArray(lastSavedData.data)) {
        console.error("⚠️ Données invalides ou corrompues :", lastSavedData);
        return;
    }

    console.log(`📌 Dernière sauvegarde trouvée : ${lastSavedKey}`, lastSavedData);

    // Sélectionne tous tes "rows" (lignes de saisie)
    const rows = document.querySelectorAll('.row');

    // Pour chaque ligne de la dernière sauvegarde
    lastSavedData.data.forEach((rowData, index) => {
        if (index < rows.length) {
            let inputs = rows[index].querySelectorAll('input');
            // On ne fait que modifier le placeholder
            rowData.forEach((value, i) => {
                if (inputs[i]) {
                    // Ne remplace le placeholder que s'il est vide
                    if (!inputs[i].placeholder) {
                        inputs[i].placeholder = value;
                    }
                }
            });
        }
    });
}

// Au chargement de la page, on affiche tous les blocs et on met les placeholders
window.addEventListener("load", () => {
    loadSavedData();
    loadLastSavedDataAsPlaceholder();
    console.log("✅ Page entièrement chargée, données affichées.");
});
