import express from "express";
import cors from "cors";

const Razorpay = require("razorpay");
const crypto = require("crypto");
const QRCode = require("qrcode");

const app = express(); // MUST be first

app.use(cors({
  origin: [
    "http://127.0.0.1:5500",
    "http://localhost:5500",
    "https://teamflex.netlify.app"
  ],
  methods: "GET,POST",
  allowedHeaders: "Content-Type"
}));

app.use(express.json());

// Razorpay Keys
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
      amount: amount * 100,
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

// --- Generate QR ---
app.post("/generate-qr", async (req, res) => {
  try {
    const { userId, sessionId } = req.body;

    const qrData = JSON.stringify({ userId, sessionId, timestamp: Date.now() });

    const qrImage = await QRCode.toDataURL(qrData);

    res.json({
      status: "success",
      qrImage
    });

  } catch (error) {
    console.error("QR generation error:", error);
    res.status(500).json({ status: "failure" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
