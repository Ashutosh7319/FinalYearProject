document.addEventListener("DOMContentLoaded", () => {
  const hamburgerBtn = document.querySelector(".hamburger-btn");
  const navMenu = document.querySelector("#nav-menu");

  if (!hamburgerBtn || !navMenu) {
    console.error("Hamburger button or nav menu not found.");
    return;
  }

  hamburgerBtn.addEventListener("click", () => {
    const expanded = hamburgerBtn.getAttribute("aria-expanded") === "true";

    // Toggle aria state
    hamburgerBtn.setAttribute("aria-expanded", !expanded);

    // Toggle menu visibility
    navMenu.classList.toggle("active");

    // Toggle hamburger animation
    hamburgerBtn.classList.toggle("open");
  });
});

document.addEventListener("DOMContentLoaded", () => {
  // --- QR Code scanning logic ---
  const scanBtn = document.getElementById("scan-btn");
  const qrReader = document.getElementById("qr-reader");
  const resultContainer = document.getElementById("result");

  let html5QrCode;
  let isScanning = false;

  scanBtn.addEventListener("click", () => {
    if (!isScanning) {
      qrReader.style.display = "block";
      startScanner();
      scanBtn.textContent = "Stop Scanning";
      isScanning = true;
    } else {
      stopScanner();
      scanBtn.textContent = "Scan To Unlock Your Robo";
      qrReader.style.display = "none";
      resultContainer.textContent = "";
      isScanning = false;
    }
  });

  function startScanner() {
    html5QrCode = new Html5Qrcode("qr-reader");
    html5QrCode
      .start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => {
          resultContainer.textContent = `Scanned QR Code: ${decodedText}`;
          stopScanner();
          scanBtn.textContent = "Scan To Unlock Your Robo";
          qrReader.style.display = "none";
          isScanning = false;
          alert(`QR Code detected: ${decodedText}`);
        }
      )
      .catch((err) => console.error("Unable to start scanning.", err));
  }

  function stopScanner() {
    if (html5QrCode) {
      html5QrCode.stop().then(() => html5QrCode.clear());
    }
  }

  // --- Pricing Calculator logic ---
  const hoursInput = document.getElementById("hours");
  const totalCostSpan = document.getElementById("total-cost");
  const COST_PER_HOUR = 20;
  const DEPOSIT = 60;

  hoursInput.addEventListener("input", () => {
    const hours = parseInt(hoursInput.value) || 1;
    totalCostSpan.textContent = (hours * COST_PER_HOUR) + DEPOSIT;
  });

  document.getElementById("pay-now-btn").addEventListener("click", async () => {
    const amount = parseInt(totalCostSpan.textContent); // dynamic amount

    try {
      // 1️⃣ Request order from Render backend
      const response = await fetch("https://finalyearproject-52g2.onrender.com/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount })
      });

      const order = await response.json();

      // 2️⃣ Open Razorpay Checkout
      const options = {
        key: "rzp_test_RGbTLZ2nqVrbMS", // Your Test Key ID
        amount: order.amount,
        currency: order.currency,
        order_id: order.id,
        name: "QRGate Robot Rental",
        description: "Hourly Subscription Payment",
        handler: async function (paymentResult) {
          // 3️⃣ Verify payment with Render backend
          const verifyRes = await fetch("https://finalyearproject-52g2.onrender.com/verify-payment", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(paymentResult)
          });

          const result = await verifyRes.json();
          if (result.status === "success") {
            alert("✅ Payment Successful!");
          } else {
            alert("❌ Payment Failed. Try Again.");
          }
        },
        theme: { color: "#F37254" }
      };

      const rzp = new Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error("Payment error:", err);
      alert("❌ Something went wrong while processing payment.");
    }
  });
});

const qrResponse = await fetch("https://finalyearproject-52g2.onrender.com/generate-qr", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    userId: "12345",
    sessionId: order_id,
  }),
});

const data = await qrResponse.json();
document.getElementById("qr-image").src = data.qrImage;
