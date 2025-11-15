document.addEventListener("DOMContentLoaded", async () => {
  const qrImage = document.getElementById("qr-image");
  const qrError = document.getElementById("qr-error");

  // Get session and user ID from localStorage
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
      body: JSON.stringify({ sessionId, userId })
    });

    const data = await res.json();

    if (data.status === "success" && data.qrImage) {
      qrImage.src = data.qrImage;
    } else {
      qrError.textContent = "❌ QR generation failed. Try again.";
      console.error("QR error response:", data);
    }
  } catch (err) {
    qrError.textContent = "❌ Something went wrong while generating QR.";
    console.error("QR fetch error:", err);
  }
});
