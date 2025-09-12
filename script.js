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
  const COST_PER_HOUR = 2000;
  const DEPOSIT = 6000;

  hoursInput.addEventListener("input", () => {
    const hours = parseInt(hoursInput.value) || 1;
    totalCostSpan.textContent = (hours * COST_PER_HOUR) + DEPOSIT;
  });

  // --- Razorpay Payment ---
  const payBtn = document.getElementById("pay-now-btn");

  payBtn.addEventListener("click", async () => {
    const amount = parseInt(totalCostSpan.textContent);

    // 1️⃣ Request order from backend
    const response = await fetch("http://localhost:3000/create-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount })
    });
    const order = await response.json();

    // 2️⃣ Open Razorpay Checkout
    const options = {
      key: "YOUR_KEY_ID", // Replace with Razorpay Test Key
      amount: order.amount,
      currency: order.currency,
      order_id: order.id,
      name: "QRGate Robot Rental",
      description: "Hourly Subscription Payment",
      handler: async function (paymentResult) {
        // 3️⃣ Verify payment with backend
        const verifyRes = await fetch("http://localhost:3000/verify-payment", {
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
      }
    };

    const rzp = new Razorpay(options);
    rzp.open();
  });
});
