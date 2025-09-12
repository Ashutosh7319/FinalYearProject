const express = require("express");
const Razorpay = require("razorpay");
const crypto = require("crypto");
const path = require("path");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// Serve your frontend files (index.html, style.css, script.js)
app.use(express.static(path.join(__dirname, ".."))); // Go up one folder to FinalYearProject

// Replace with your Razorpay Test Key ID and Secret
const razorpay = new Razorpay({
  key_id: "rzp_test_RGbTLZ2nqVrbMS",
  key_secret: "J5WcxqXJM7Z7WIKG4vk73NWo"
});

// Create order route
app.post("/create-order", async (req, res) => {
  try {
    const { amount } = req.body;
    const order = await razorpay.orders.create({
      amount: amount * 100, // amount in paise
      currency: "INR",
      receipt: "receipt_" + Date.now()
    });
    res.json(order);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong while creating order" });
  }
});

// Verify payment route
app.post("/verify-payment", (req, res) => {
  const { order_id, payment_id, signature } = req.body;

  const expectedSignature = crypto
    .createHmac("sha256", razorpay.key_secret)
    .update(order_id + "|" + payment_id)
    .digest("hex");

  if (expectedSignature === signature) {
    res.json({ status: "success" });
  } else {
    res.json({ status: "failure" });
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
