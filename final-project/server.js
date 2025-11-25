import express from "express";
import cors from "cors";
import Razorpay from "razorpay";
import crypto from "crypto";
import QRCode from "qrcode";

const app = express();
app.use(express.json());

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "https://theutlron.onrender.com");
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});


app.use(
  cors({
    origin: [
      "https://theutlron.onrender.com",
    ],
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
  })
);

// Razorpay keys
const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || "rzp_test_RjpvwpRXszRvNZ";
const RAZORPAY_KEY_SECRET =
  process.env.RAZORPAY_KEY_SECRET || "w768Q16UwPVK05HTVPljHfdZ";

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
    const { userId, sessionId, url } = req.body;
    console.log("Generate QR request:", req.body);

    if (!url) {
      return res.status(400).json({
        status: "failure",
        message: "Missing URL for QR code"
      });
    }

    // 🔥 QR WILL CONTAIN ONLY THE URL
    const qrImage = await QRCode.toDataURL(url);

    res.json({ status: "success", qrImage });

  } catch (err) {
    console.error("QR generation error:", err);
    res.status(500).json({ status: "failure", message: err.message });
  }
});



const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));

app.use((req, res, next) => {
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
  next();
});

app.use("/api", (req, res, next) => {
  res.setHeader("Cache-Control", "no-store");
  next();
});
