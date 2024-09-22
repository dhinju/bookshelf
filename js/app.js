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

// Function to start scanning
function startScanning() {
  // Start the scanner with only barcode detection
  html5QrCode.start(
    { facingMode: "environment" }, // Use back camera
    {
      fps: 10,
      qrbox: { width: 250, height: 250 },
      formatsToSupport: [Html5QrcodeSupportedFormats.EAN_13] // Restrict to EAN-13 format
    },
    (decodedText, decodedResult) => {
      alert(`Detected barcode: ${decodedText}`);
      $.ajax({
        url: 'https://bookshelf-server-2jcp.onrender.com/fetch-isbn?isbn=' + decodedText,
        type: 'GET',
        dataType: "json",
        success: function (json) {
          console.log(json);
        },
        error: function (xhr, status, error) {
          console.error('Error fetching the HTML:', error);
        }
      });
      html5QrCode.stop().catch(err => console.error("Failed to stop scanning.", err)); // Stop scanning after detection
    },
    (errorMessage) => {
      // Optional: handle errors
    }
  ).catch(err => {
    console.error("Error starting QR Code scanning:", err);
  });
}

window.onload = startScanning;