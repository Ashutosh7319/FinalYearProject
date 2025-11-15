const express = require("express");
const Razorpay = require("razorpay");
const crypto = require("crypto");
const cors = require("cors");

const app = express();
app.use(cors()); // allow requests from anywhere
app.use(express.json());

// Use environment variables for keys (recommended for Render)
const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || "rzp_test_RGbTLZ2nqVrbMS";
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || "J5WcxqXJM7Z7WIKG4vk73NWo";

const razorpay = new Razorpay({
  key_id: RAZORPAY_KEY_ID,
  key_secret: RAZORPAY_KEY_SECRET,
});

// --- Create Order ---
app.post("/create-order", async (req, res) => {
  try {
    const { amount } = req.body;
    const order = await razorpay.orders.create({
      amount: amount * 100, // convert to paise
      currency: "INR",
      receipt: "receipt_" + Date.now(),
    });
    res.json(order);
  } catch (err) {
    console.error("Error creating order:", err);
    res.status(500).json({ error: "Something went wrong while creating order" });
  }
});

// --- Verify Payment ---
app.post("/verify-payment", (req, res) => {
  try {
    const { order_id, payment_id, signature } = req.body;

    const expectedSignature = crypto
      .createHmac("sha256", RAZORPAY_KEY_SECRET)
      .update(order_id + "|" + payment_id)
      .digest("hex");

    if (expectedSignature === signature) {
      res.json({ status: "success" });
    } else {
      res.json({ status: "failure" });
    }
  } catch (err) {
    console.error("Error verifying payment:", err);
    res.status(500).json({ status: "failure" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));


const QRCode = require("qrcode");

// --- Generate QR After Payment Success ---
app.post("/generate-qr", async (req, res) => {
  try {
    const { userId, sessionId } = req.body;

    // Data to embed in QR
    const qrData = JSON.stringify({
      userId,
      sessionId,
      timestamp: Date.now(),
    });

    // Generate QR (Base64)
    const qrImage = await QRCode.toDataURL(qrData);

    res.json({
      status: "success",
      qrImage: qrImage, // This is a base64 PNG string
    });

  } catch (error) {
    console.error("QR generation error:", error);
    res.status(500).json({ status: "failure" });
  }
});

