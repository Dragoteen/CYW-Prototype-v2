const apiUrl = 'https://api.sheety.co/d7cbcb1c41ac163fbaff577fe727b2bd/collectionYoKaiWatch%20[jp]M%C3%A9daillons/medaillons';

const resultDiv = document.getElementById('result');
const video = document.getElementById('video');
const startScanBtn = document.getElementById('startScan');
const stopScanBtn = document.getElementById('stopScan');
const uploadFile = document.getElementById('uploadFile');

let stream = null;
let html5QrCode = null;

function resetResult() {
  resultDiv.innerHTML = '';
}

// Fonction pour extraire le code unique à la fin de l’URL scannée
function extractCodeUnique(text) {
  try {
    const url = new URL(text);
    const path = url.pathname; // ex: /04P75B6AFJOPJH52H3UC6911MOTSFE55B
    const code = path.split('/').filter(Boolean).pop();
    return code || null;
  } catch {
    // Si ce n’est pas une URL valide, on essaye autre chose simple
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

// *** Scanner via caméra ***

async function startCameraScan() {
  resetResult();
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    alert("Votre navigateur ne supporte pas la caméra.");
    return;
  }

  try {
    stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
    video.srcObject = stream;

    // Utilisation de html5-qrcode pour scanner depuis le flux vidéo
    if (!html5QrCode) {
      html5QrCode = new Html5Qrcode("video");
    }

    await html5QrCode.start(
      { facingMode: "environment" },
      {
        fps: 10,
        qrbox: 250
      },
      async (decodedText) => {
        const codeUnique = extractCodeUnique(decodedText);
        const medaillon = await getMedallionByCode(codeUnique);
        displayMedallion(medaillon);
        stopCameraScan();
      },
      (errorMessage) => {
        // Optionnel : console.log("Scan erreur", errorMessage);
      }
    );

    startScanBtn.disabled = true;
    stopScanBtn.disabled = false;

  } catch (e) {
    alert("Erreur d'accès caméra : " + e.message);
  }
}

async function stopCameraScan() {
  if (html5QrCode) {
    await html5QrCode.stop();
    html5QrCode.clear();
    html5QrCode = null;
  }
  if (stream) {
    stream.getTracks().forEach(track => track.stop());
    stream = null;
  }
  video.srcObject = null;
  startScanBtn.disabled = false;
  stopScanBtn.disabled = true;
}

// *** Scanner via upload image ***

uploadFile.addEventListener('change', async (event) => {
  resetResult();
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = async (e) => {
    const imgDataUrl = e.target.result;
    // On crée un élément image caché pour analyser
    const img = document.createElement("img");
    img.src = imgDataUrl;

    img.onload = async () => {
      if (!html5QrCode) {
        html5QrCode = new Html5Qrcode(/* unused element id because we use scanFile method */);
      }
      try {
        const qrCodeMessage = await html5QrCode.scanFile(file, true);
        const codeUnique = extractCodeUnique(qrCodeMessage);
        const medaillon = await getMedallionByCode(codeUnique);
        displayMedallion(medaillon);
      } catch (err) {
        resultDiv.innerHTML = `<p style="color:red;">❌ Aucun QR code détecté dans l'image</p>`;
      }
    };
  };
  reader.readAsDataURL(file);
});

// *** Boutons ***

startScanBtn.addEventListener('click', startCameraScan);
stopScanBtn.addEventListener('click', stopCameraScan);

