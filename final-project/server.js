import express from "express";
import cors from "cors";
import Razorpay from "razorpay";
import crypto from "crypto";
import QRCode from "qrcode";

const app = express();
app.use(express.json());

app.use(
  cors({
    origin: [
      "http://127.0.0.1:5500",
      "http://localhost:5500",
      "https://teamflex.netlify.app",
    ],
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
  })
);

// Razorpay keys
const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || "rzp_test_RGbTLZ2nqVrbMS";
const RAZORPAY_KEY_SECRET =
  process.env.RAZORPAY_KEY_SECRET || "J5WcxqXJM7Z7WIKG4vk73NWo";

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
    console.error("Order error:", err);
    res.status(500).json({ error: "Order creation failed" });
  }
});

// --- Verify Payment ---
app.post("/verify-payment", (req, res) => {
  try {
    const { order_id, payment_id, signature } = req.body;

    const expectedSign = crypto
      .createHmac("sha256", RAZORPAY_KEY_SECRET)
      .update(order_id + "|" + payment_id)
      .digest("hex");

    if (expectedSign === signature) {
      return res.json({ status: "success" });
    }
    res.json({ status: "failure" });
  } catch (err) {
    res.status(500).json({ status: "failure" });
  }
});

app.post("/generate-qr", async (req, res) => {
  try {
    const { userId, sessionId } = req.body;
    console.log("Generate QR request:", req.body);

    if (!userId || !sessionId) {
      return res.status(400).json({ status: "failure", message: "Missing userId or sessionId" });
    }

    const qrData = JSON.stringify({ userId, sessionId, timestamp: Date.now() });
    const qrImage = await QRCode.toDataURL(qrData);

    res.json({ status: "success", qrImage });
  } catch (err) {
    console.error("QR generation error:", err);
    res.status(500).json({ status: "failure", message: err.message });
  }
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));
