const express = require("express");

const {
  createStock,
  getAllStocks,
  getStockBySymbol,
  updateStockPrice,
  deleteStock
} = require("../controllers/stockcontroller");
const router = express.Router();


// ==========================================
// CREATE STOCK
// POST /api/stocks
// ==========================================

router.post("/", createStock);


// ==========================================
// GET ALL STOCKS
// GET /api/stocks
// ==========================================

router.get("/", getAllStocks);


// ==========================================
// GET STOCK BY SYMBOL
// GET /api/stocks/:symbol
// ==========================================

router.get("/:symbol", getStockBySymbol);


// ==========================================
// UPDATE STOCK PRICE
// PUT /api/stocks/:symbol
// ==========================================

router.put("/:symbol", updateStockPrice);


// ==========================================
// DELETE STOCK
// DELETE /api/stocks/:symbol
// ==========================================

router.delete("/:symbol", deleteStock);


module.exports = router;