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
  // --- Pricing Calculator logic ---
  const hoursInput = document.getElementById("hours");
  const totalCostSpan = document.getElementById("total-cost");
  const COST_PER_HOUR = 20;
  const DEPOSIT = 60;

  hoursInput.addEventListener("input", () => {
    const hours = parseInt(hoursInput.value) || 1;
    totalCostSpan.textContent = hours * COST_PER_HOUR + DEPOSIT;
  });

  document.getElementById("pay-now-btn").addEventListener("click", async () => {
    const amount = parseInt(totalCostSpan.textContent);

    try {
      // 1️⃣ Create order
      const response = await fetch(
        "https://finalyearproject-52g2.onrender.com/create-order",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ amount }),
        }
      );

      const order = await response.json();

      // 2️⃣ Razorpay options (UPI only)
      const options = {
        key: "rzp_test_RGbTLZ2nqVrbMS",
        amount: order.amount,
        currency: order.currency,
        order_id: order.id,

        name: "QRGate Robot Rental",
        description: "UPI Payment for Robot Subscription",

        // Enable UPI only
        method: {
          upi: true,
          card: false,
          netbanking: false,
          wallet: false,
          emi: false,
        },

        handler: async function (paymentResult) {
          // 3️⃣ Verify payment
          const verifyRes = await fetch(
            "https://finalyearproject-52g2.onrender.com/verify-payment",
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                order_id: paymentResult.razorpay_order_id,
                payment_id: paymentResult.razorpay_payment_id,
                signature: paymentResult.razorpay_signature,
              }),
            }
          );

          const result = await verifyRes.json();

          if (result.status === "success") {
            //alert("✅ UPI Payment Successful!");
            localStorage.setItem("orderId", order.id);
            window.location.href = "qr.html";
            // 4️⃣ Generate QR
            const qrRes = await fetch(
              "https://finalyearproject-52g2.onrender.com/generate-qr",
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  userId: "USER_12345",
                  sessionId: order.id,
                }),
              }
            );

            const qrData = await qrRes.json();

            if (qrData.status === "success" && qrData.qrImage) {
            // Show QR image
            const qrImg = document.getElementById("qr-image");
            qrImg.src = qrData.qrImage;
            document.getElementById("qr-container").style.display = "block";
          } else {
            alert("❌ QR generation failed!");
          }
          }
        },

        theme: { color: "#464e52ff" },
      };

      const rzp = new Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error("Payment error:", err);
      alert("❌ Something went wrong while processing payment.");
    }
  });
});
