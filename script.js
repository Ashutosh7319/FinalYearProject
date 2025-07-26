// QR Code scanning logic
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
        scanBtn.textContent = "Scan To Unlock Your Robo ";
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
            {
                fps: 10,
                qrbox: { width: 250, height: 250 },
            },
            (decodedText, decodedResult) => {
                resultContainer.textContent = `Scanned QR Code: ${decodedText}`;
                // Stop scanning once QR code is detected
                stopScanner();
                scanBtn.textContent = "Scan To Unlock Your Robo ";
                qrReader.style.display = "none";
                isScanning = false;

                // You can add robot unlock logic here
                alert(`QR Code detected: ${decodedText}`);
            }
        )
        .catch((err) => {
            console.error("Unable to start scanning.", err);
        });
}

function stopScanner() {
    if (html5QrCode) {
        html5QrCode.stop().then(() => {
            html5QrCode.clear();
        });
    }
}

// Pricing calculator logic
const hoursInput = document.getElementById("hours");
const totalCostEl = document.getElementById("total-cost");
const payNowBtn = document.getElementById("pay-now-btn");

const costPerHour = 2000;
const safetyDeposit = 6000;

function updateTotalCost() {
    const hours = parseInt(hoursInput.value) || 1;
    const total = hours * costPerHour + safetyDeposit;
    totalCostEl.textContent = total;
}

hoursInput.addEventListener("input", updateTotalCost);
updateTotalCost(); // initialize on load

// Modal handling
const authModal = document.getElementById("auth-modal");
const authClose = document.getElementById("auth-close");
const upiModal = document.getElementById("upi-modal");
const upiClose = document.getElementById("upi-close");

// Show auth modal on page load for demo (remove if not needed)
// authModal.style.display = "block";

// Close modals on close button click
authClose.onclick = () => (authModal.style.display = "none");
upiClose.onclick = () => (upiModal.style.display = "none");

// Auth tabs toggle
const tabSignIn = document.getElementById("tab-signin");
const tabRegister = document.getElementById("tab-register");
const signinForm = document.getElementById("signin-form");
const registerForm = document.getElementById("register-form");

tabSignIn.addEventListener("click", () => {
    tabSignIn.classList.add("active");
    tabRegister.classList.remove("active");
    signinForm.classList.add("active");
    registerForm.classList.remove("active");
});

tabRegister.addEventListener("click", () => {
    tabRegister.classList.add("active");
    tabSignIn.classList.remove("active");
    registerForm.classList.add("active");
    signinForm.classList.remove("active");
});

// Simulated sign-in/register submit handlers
signinForm.addEventListener("submit", (e) => {
    e.preventDefault();
    alert("Sign In successful (simulation)");
    authModal.style.display = "none";
});

registerForm.addEventListener("submit", (e) => {
    e.preventDefault();
    alert("Registration successful (simulation)");
    authModal.style.display = "none";
});

// Pay Now button opens UPI modal
payNowBtn.addEventListener("click", () => {
    const amount = parseInt(hoursInput.value) * costPerHour + safetyDeposit;
    document.getElementById("upi-amount").textContent = amount;
    upiModal.style.display = "block";
});

// UPI payment confirm
const confirmPaymentBtn = document.getElementById("confirm-payment-btn");
confirmPaymentBtn.addEventListener("click", () => {
    alert("Payment confirmed (simulation). Thank you!");
    upiModal.style.display = "none";
    // You can add further payment handling logic here
});

// Close modals if clicked outside modal content
window.onclick = function (event) {
    if (event.target == authModal) authModal.style.display = "none";
    if (event.target == upiModal) upiModal.style.display = "none";
};

// Smooth scroll for anchor links
document.querySelectorAll('.nav-links a').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const section = document.querySelector(this.getAttribute('href'));
        if (section) {
            section.scrollIntoView({ behavior: 'smooth' });
        }
    });
});

document.addEventListener("DOMContentLoaded", () => {
    const hamburgerBtn = document.querySelector('.hamburger-btn');
    const navMenu = document.getElementById('nav-menu');

    hamburgerBtn.addEventListener('click', () => {
        const isOpen = hamburgerBtn.classList.toggle('open');
        hamburgerBtn.setAttribute('aria-expanded', String(isOpen));
        navMenu.classList.toggle('show', isOpen);
    });
});

function openChatbotPopup() {
    const popupWidth = 420;
    const popupHeight = 600;
    const left = (screen.width / 2) - (popupWidth / 2);
    const top = (screen.height / 2) - (popupHeight / 2);
    
    window.open(
      'https://ai-chatbot-gemini-tau.vercel.app/',
      'ChatbotPopup',
      `width=${popupWidth},height=${popupHeight},top=${top},left=${left},resizable=no,scrollbars=no`
    );
  }