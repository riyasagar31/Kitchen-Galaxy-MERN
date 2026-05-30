import express from "express";
import crypto from "crypto";
import Razorpay from "razorpay"; // Import the SDK

const router = express.Router();

// Initialize Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

/* ==========================================
   ROUTE: CREATE ORDER
   This is called BEFORE the Razorpay modal opens
   ========================================== */
router.post("/create-order", async (req, res) => {
  try {
    const { amount } = req.body;

    const options = {
      amount: Math.round(amount * 100), // Razorpay expects amount in paise (₹1 = 100 paise)
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);

    if (!order) return res.status(500).send("Some error occurred");

    res.json(order);
  } catch (error) {
    console.error("Razorpay Order Error:", error);
    res.status(500).json({ message: "Failed to create Razorpay order" });
  }
});

/* ==========================================
   ROUTE: VERIFY PAYMENT
   This is called AFTER the user pays
   ========================================== */
router.post("/verify-payment", async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  try {
    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    if (expectedSignature === razorpay_signature) {
      return res.json({
        success: true,
        message: "Payment verified successfully"
      });
    }

    return res.status(400).json({
      success: false,
      message: "Invalid signature"
    });

  } catch (error) {
    res.status(500).json({ message: "Verification failed" });
  }
});

export default router;