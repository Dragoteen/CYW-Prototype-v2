const apiUrl = 'https://api.sheety.co/d7cbcb1c41ac163fbaff577fe7272bd/collectionYoKaiWatch%20[jp]M%C3%A9daillons/medaillons';

const resultDiv = document.getElementById('result');

const takePhotoBtn = document.getElementById('takePhotoBtn');
const choosePhotoBtn = document.getElementById('choosePhotoBtn');
const takePhotoInput = document.getElementById('takePhotoInput');
const choosePhotoInput = document.getElementById('choosePhotoInput');

let html5QrCode = null;

function resetResult() {
  resultDiv.innerHTML = '';
}

// Extraire code unique dans l’URL ou texte du QR
function extractCodeUnique(text) {
  try {
    const url = new URL(text);
    const path = url.pathname;
    const code = path.split('/').filter(Boolean).pop();
    return code || text.trim();
  } catch {
    return text.trim();
  }
}

async function getMedallionByCode(codeUnique) {
  try {
    const response = await fetch(apiUrl);
    const data = await response.json();
    const medaillon = data.medaillons.find(m => m.code_unique === codeUnique);
    return medaillon || null;
  } catch (error) {
    console.error("Erreur API:", error);
    return null;
  }
}

function displayMedallion(medaillon) {
  if (!medaillon) {
    resultDiv.innerHTML = `<p style="color:red;">❌ Médaillon non trouvé</p>`;
    return;
  }

  resultDiv.innerHTML = `
    <h2>${medaillon.nom_yokai} (${medaillon.type_médaillon})</h2>
    <p><strong>Tribu :</strong> ${medaillon.tribu_yokai}</p>
    <p><strong>Rang :</strong> ${medaillon.rang_yokai}</p>
    <p><strong>Élément :</strong> ${medaillon.élément_yokai}</p>
    <p><strong>Rôle :</strong> ${medaillon.rôle_yokai}</p>
    <p><strong>Première apparition :</strong> ${medaillon.première_apparition_yokai}</p>
    <p><strong>Nourriture préférée :</strong> ${medaillon.nourriture_préférée_yokai}</p>
    <img src="${medaillon.image_médaillon}" alt="Image Médaillon" />
    <img src="${medaillon.image_yokai}" alt="Image Yokai" />
  `;
}

// Analyse QR code depuis fichier image
async function scanFile(file) {
  resetResult();

  if (!html5QrCode) {
    html5QrCode = new Html5Qrcode(/* element id not needed for scanFile */);
  }

  try {
    const qrCodeMessage = await html5QrCode.scanFile(file, true);
    const codeUnique = extractCodeUnique(qrCodeMessage);
    const medaillon = await getMedallionByCode(codeUnique);
    displayMedallion(medaillon);
  } catch (err) {
    resultDiv.innerHTML = `<p style="color:red;">❌ Aucun QR code détecté dans l'image</p>`;
  }
}

// Event listeners pour les inputs file cachés
takePhotoInput.addEventListener('change', async (e) => {
  if (e.target.files.length > 0) {
    await scanFile(e.target.files[0]);
  }
});

choosePhotoInput.addEventListener('change', async (e) => {
  if (e.target.files.length > 0) {
    await scanFile(e.target.files[0]);
  }
});

// Ouverture du dialogue caméra ou galerie au clic sur bouton
takePhotoBtn.addEventListener('click', () => {
  takePhotoInput.click();
});
choosePhotoBtn.addEventListener('click', () => {
  choosePhotoInput.click();
});
