const express = require("express");
const Razorpay = require("razorpay");
const crypto = require("crypto");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// Replace with your real keys from Razorpay Dashboard
const razorpay = new Razorpay({
  key_id: "YOUR_KEY_ID",
  key_secret: "YOUR_KEY_SECRET"
});

// Create order
app.post("/create-order", async (req, res) => {
  try {
    const order = await razorpay.orders.create({
      amount: req.body.amount * 100, // amount in paise
      currency: "INR",
      receipt: "receipt_" + Date.now()
    });
    res.json(order);
  } catch (err) {
    res.status(500).send(err);
  }
});

// Verify payment
app.post("/verify-payment", (req, res) => {
  const { order_id, payment_id, signature } = req.body;

  const expectedSignature = crypto
    .createHmac("sha256", "YOUR_KEY_SECRET")
    .update(order_id + "|" + payment_id)
    .digest("hex");

  if (expectedSignature === signature) {
    res.json({ status: "success" });
  } else {
    res.json({ status: "failure" });
  }
});

app.listen(3000, () => console.log("✅ Server running at http://localhost:3000"));
