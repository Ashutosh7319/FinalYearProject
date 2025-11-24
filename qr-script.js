document.addEventListener("DOMContentLoaded", async () => {
  const qrImage = document.getElementById("qr-image");
  const qrError = document.getElementById("qr-error");

  const sessionId = localStorage.getItem("sessionId");
  const userId = localStorage.getItem("userId");

  if (!sessionId || !userId) {
    qrError.textContent = "❌ Cannot generate QR: missing session or user info.";
    return;
  }

  try {
    const res = await fetch("https://finalyearproject-52g2.onrender.com/generate-qr", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId,
        sessionId,
        url: "http://192.168.4.1",
      })
    });

    const data = await res.json();

    if (data.status === "success" && data.qrImage) {
      qrImage.src = data.qrImage;
      qrImage.style.display = "block";
    } else {
      qrError.textContent = "❌ QR generation failed. Try again.";
    }
  } catch (err) {
    qrError.textContent = "❌ Something went wrong while generating QR.";
  }
});



document
  .getElementById("download-link")
  .addEventListener("click", function (e) {
    e.preventDefault();

    const qrImg = document.getElementById("qr-image");

    // If QR is not loaded
    if (!qrImg || !qrImg.src || qrImg.src.trim() === "") {
      alert("QR Code not loaded yet!");
      return;
    }

    // Create a hidden anchor for downloading
    const a = document.createElement("a");
    a.href = qrImg.src; // The QR image source
    a.download = "robot-qr.png"; // File name for download
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  });
