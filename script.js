const takePhotoBtn = document.getElementById('takePhotoBtn');
const choosePhotoBtn = document.getElementById('choosePhotoBtn');

const takePhotoInput = document.getElementById('takePhotoInput');
const choosePhotoInput = document.getElementById('choosePhotoInput');

const resultDiv = document.getElementById('result');

let html5QrCode;

takePhotoBtn.addEventListener('click', () => {
  takePhotoInput.value = null; // reset input
  takePhotoInput.click();
});

choosePhotoBtn.addEventListener('click', () => {
  choosePhotoInput.value = null; // reset input
  choosePhotoInput.click();
});

takePhotoInput.addEventListener('change', async (e) => {
  if (e.target.files.length === 0) return;
  const file = e.target.files[0];
  console.log("Photo prise :", file);
  await scanFile(file);
});

choosePhotoInput.addEventListener('change', async (e) => {
  if (e.target.files.length === 0) return;
  const file = e.target.files[0];
  console.log("Photo choisie :", file);
  await scanFile(file);
});

async function scanFile(file) {
  resetResult();

  if (!html5QrCode) {
    html5QrCode = new Html5Qrcode();
  }

  try {
    console.log("Début du scan...");
    const qrCodeMessage = await html5QrCode.scanFile(file, true);
    console.log("QR Code détecté :", qrCodeMessage);

    const codeUnique = extractCodeUnique(qrCodeMessage);
    console.log("Code unique extrait :", codeUnique);

    if (!codeUnique) {
      showError("❌ QR code détecté mais code unique non extrait.");
      return;
    }

    const medaillon = await getMedallionByCode(codeUnique);

    if (!medaillon) {
      showError("❌ Médaillon inconnu pour ce code unique.");
      return;
    }

    displayMedallion(medaillon);

  } catch (error) {
    console.error("Erreur de scan :", error);
    showError("❌ Aucun QR code détecté dans l'image.");
  }
}

function resetResult() {
  resultDiv.innerHTML = '';
}

function showError(msg) {
  resultDiv.innerHTML = `<p style="color:red;">${msg}</p>`;
}

function displayMedallion(medaillon) {
  const html = `
    <h2>Infos Médaillon</h2>
    <p><strong>Code unique :</strong> ${medaillon.code_unique}</p>
    <p><strong>Type :</strong> ${medaillon.type_medaillon}</p>
    <p><strong>Yokai :</strong> ${medaillon.nom_yokai}</p>
    <p><strong>Tribu :</strong> ${medaillon.tribu_yokai}</p>
    <p><strong>Rang :</strong> ${medaillon.rang_yokai}</p>
    <p><strong>Élément :</strong> ${medaillon.élément_yokai}</p>
    <p><strong>Rôle :</strong> ${medaillon.rôle_yokai}</p>
    <p><strong>Première apparition :</strong> ${medaillon.première_apparition_yokai}</p>
    <p><strong>Nourriture préférée :</strong> ${medaillon.nourriture_préférée_yokai}</p>
    <img src="${medaillon.image_medaillon}" alt="Image Médaillon" />
    <img src="${medaillon.image_yokai}" alt="Image Yokai" />
  `;
  resultDiv.innerHTML = html;
}

function extractCodeUnique(qrCodeMessage) {
  if (!qrCodeMessage) return null;
  // Exemple attendu : "http://YW.B-BOYS.JP/04P75B6AFJOPJH52H3UC6911MOTSFE55B"
  const parts = qrCodeMessage.trim().split('/');
  return parts[parts.length - 1];
}

async function getMedallionByCode(code) {
  try {
    const response = await fetch("https://api.sheety.co/d7cbcb1c41ac163fbaff577fe727b2bd/collectionYoKaiWatch%20%5Bjp%5DM%C3%A9daillons/medaillons");
    const data = await response.json();
    const medaillons = data.medaillons;
    return medaillons.find(m => m.code_unique === code);
  } catch (error) {
    console.error("Erreur API :", error);
    return null;
  }
}
