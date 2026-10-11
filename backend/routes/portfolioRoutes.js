const express = require("express");

const {
  getPortfolio
} = require("../controllers/portfolioController");

const protect = require("../middleware/authMiddleWare");

const router = express.Router();

// ==========================================
// GET USER PORTFOLIO
// ==========================================

router.get("/", protect, getPortfolio);

module.exports = router;