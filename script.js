const menuIcon = document.querySelector("#menu-icon");
const navbar = document.querySelector(".navbar");

menuIcon.onclick = () => {
  menuIcon.classList.toggle("bx-x");
  navbar.classList.toggle("active");
};

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
    // 🔒 1) Block payment if user not signed in
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    const userId = localStorage.getItem("userId");

    if (!isLoggedIn || !userId) {
      alert("Please sign in before making a payment.");
      return;
    }
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
            // Save order/session ID to localStorage
            localStorage.setItem("sessionId", order.id);
            localStorage.setItem("userId", "USER_12345"); // replace with real user info

            // Redirect to QR page
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
                  url: "http://192.168.4.1",
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

      // Redirect to QR page no matter what happens
      setTimeout(() => {
        window.location.href = "qr.html";
      }, 2000);
    } catch (err) {
      console.error("Payment error:", err);
      alert("❌ Something went wrong while processing payment.");
    }
  });
});

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js")
      .then((reg) => console.log("Service Worker registered:", reg))
      .catch((err) =>
        console.error("Service Worker registration failed:", err)
      );
  });
}

let deferredPrompt;

// Detect install event
window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  deferredPrompt = e;
  document.getElementById("but").style.display = "block"; // show install button
});

// When user clicks Download App
document.getElementById("but").addEventListener("click", async () => {
  if (!deferredPrompt) {
    alert("App is already installed or not installable right now.");
    return;
  }

  deferredPrompt.prompt();

  const choice = await deferredPrompt.userChoice;

  if (choice.outcome === "accepted") {
    console.log("User installed the app");
  } else {
    console.log("User dismissed install prompt");
  }

  deferredPrompt = null;
});

// Responsive download button.
document.getElementById("bn").addEventListener("click", async () => {
  if (!deferredPrompt) {
    alert("App is already installed or not installable right now.");
    return;
  }

  deferredPrompt.prompt();

  const choice = await deferredPrompt.userChoice;

  if (choice.outcome === "accepted") {
    console.log("User installed the app");
  } else {
    console.log("User dismissed install prompt");
  }

  deferredPrompt = null;
});

window.addEventListener("load", () => {
  const isLoggedIn = localStorage.getItem("isLoggedIn");
  const signinBtn = document.getElementById("signin");
  const signoutBtn = document.getElementById("signout-btn");
  const onemore = document.getElementById("sin");

  if (isLoggedIn === "true") {
    if (signinBtn) signinBtn.style.display = "none";
    if (signinBtn) onemore.style.display = "none";
    if (signoutBtn) signoutBtn.style.display = "inline-block";
  } else {
    if (signinBtn) signinBtn.style.display = "inline-block";
    if (signinBtn) more.style.display = "inline-block";
    if (signoutBtn) signoutBtn.style.display = "none";
  }
});

document.getElementById("signout-btn")?.addEventListener("click", () => {
  localStorage.removeItem("isLoggedIn");
  localStorage.removeItem("userId");
  localStorage.removeItem("sessionId");
  sessionStorage.clear();

  alert("Signed Out Successfully!");
  window.location.reload();
});

window.addEventListener("pageshow", function (e) {
  if (e.persisted) {
    window.location.reload();
  }
});

document.getElementById("pay-now-btn").addEventListener("click", () => {
  const isLoggedIn = localStorage.getItem("isLoggedIn");
  const userId = localStorage.getItem("userId");

  if (!isLoggedIn || !userId) {
    alert("Please sign in before making a payment.");
    return;
  }

  // redirect immediately
  window.location.href = "qr.html";
});
