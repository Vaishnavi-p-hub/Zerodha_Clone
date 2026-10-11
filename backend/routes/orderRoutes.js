const express = require("express");

const {
  buyStock,
  sellStock
} = require("../controllers/orderController");

const protect = require("../middleware/authMiddleWare");

const router = express.Router();

// ==========================================
// BUY STOCK
// POST /api/orders/buy
// ==========================================

router.post("/buy", protect, buyStock);

// ==========================================
// SELL STOCK
// POST /api/orders/sell
// ==========================================

router.post("/sell", protect, sellStock);

module.exports = router;