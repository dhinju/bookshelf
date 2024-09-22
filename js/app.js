if ("serviceWorker" in navigator) {
  window.addEventListener("load", function () {
    navigator.serviceWorker
      .register("/serviceWorker.js")
      .then(res => console.log("service worker registered"))
      .catch(err => console.log("service worker not registered", err));
  });
}

// Initialize the HTML5-QRCode reader
const html5QrCode = new Html5Qrcode("barcode-reader");
let isFlashOn = false;

// Function to start scanning
function startScanning() {
  // Start the scanner with only barcode detection
  html5QrCode.start(
    { facingMode: "environment" }, // Use back camera
    {
      fps: 10,
      qrbox: { width: 250, height: 250 },
      formatsToSupport: [Html5QrcodeSupportedFormats.EAN_13], // Restrict to EAN-13 format
      videoConstraints: {
        width: { ideal: 1280 }, // Set ideal width
        height: { ideal: 720 }, // Set ideal height
        focusMode: "continuous" // Attempt continuous focus mode (not widely supported)
      }
    },
    (decodedText, decodedResult) => {
      if (!/^\d{13}$/.test(decodedText)) {
        console.error("Invalid ISBN code detected:", decodedText);
        return;
      }
      $.ajax({
        url: 'https://bookshelf-server-2jcp.onrender.com/fetch-isbn?isbn=' + decodedText,
        type: 'GET',
        dataType: "json",
        success: function (json) {
          const output = `
              <div class="card">
                <img class="card--avatar" src=${json.data.image} />
                <h1 class="card--title">${json.data.name}</h1>
                <a class="card--link" href="#">View</a>
              </div>`;
          $('#scan-again-btn').show(); // Show "Scan Again" button
          $('.container').html(output);
          html5QrCode.stop().catch(err => console.error("Failed to stop scanning.", err)); // Stop scanning after detection
          if (isFlashOn === true) {
            isFlashOn = false;
          }
          console.log(json);
        },
        error: function (xhr, status, error) {
          console.error('Error fetching the HTML:', error);
        }
      });

    },
    (errorMessage) => {
      // Optional: handle errors
    }
  ).catch(err => {
    console.error("Error starting QR Code scanning:", err);
  });
}

// Function to toggle flash
function toggleFlash() {
  isFlashOn = !isFlashOn;
  const constraints = {
    advanced: [{ torch: isFlashOn }]
  };
  html5QrCode.applyVideoConstraints(constraints)
    .then(() => {
      document.getElementById('flash-toggle').textContent = isFlashOn ? 'Turn Off Flash' : 'Turn On Flash';
    })
    .catch(err => {
      console.error("Error applying video constraints:", err);
    });
}


function scanAgain() {
  $('.container').html('');
  $('#scan-again-btn').hide();// Hide "Scan Again" button
  startScanning(); // Start scanning again
}

window.onload = startScanning;