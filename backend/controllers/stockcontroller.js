const Stock = require("../models/Stock");

// ==========================================
// CREATE STOCK
// POST /api/stocks
// ==========================================

const createStock = async (req, res) => {
  try {
    const {
      symbol,
      companyName,
      currentPrice,
      previousClose,
      sector,
      quantityAvailable
    } = req.body;

    // Validate required fields
    if (
      !symbol ||
      !companyName ||
      currentPrice === undefined ||
      previousClose === undefined ||
      !sector
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required stock fields"
      });
    }

    const normalizedSymbol = symbol.trim().toUpperCase();

    // Check duplicate stock
    const existingStock = await Stock.findOne({
      symbol: normalizedSymbol
    });

    if (existingStock) {
      return res.status(409).json({
        success: false,
        message: "Stock with this symbol already exists"
      });
    }

    // Validate prices
    if (
      Number.isNaN(Number(currentPrice)) ||
      Number.isNaN(Number(previousClose)) ||
      Number(currentPrice) < 0 ||
      Number(previousClose) < 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Stock prices must be valid non-negative numbers"
      });
    }

    // Validate quantity
    const finalQuantity =
      quantityAvailable === undefined
        ? 100000
        : Number(quantityAvailable);

    if (
      !Number.isInteger(finalQuantity) ||
      finalQuantity < 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Quantity available must be a non-negative whole number"
      });
    }

    // Create stock
    const stock = await Stock.create({
      symbol: normalizedSymbol,
      companyName: companyName.trim(),
      currentPrice: Number(currentPrice),
      previousClose: Number(previousClose),
      sector: sector.trim(),
      quantityAvailable: finalQuantity
    });

    return res.status(201).json({
      success: true,
      message: "Stock created successfully",
      stock
    });

  } catch (error) {
    console.error("Create Stock Error:", error.message);

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Stock with this symbol already exists"
      });
    }

    return res.status(500).json({
      success: false,
      message: "Server error while creating stock"
    });
  }
};


// ==========================================
// GET ALL STOCKS
// GET /api/stocks
// ==========================================

const getAllStocks = async (req, res) => {
  try {
    const stocks = await Stock.find()
      .sort({ symbol: 1 });

    return res.status(200).json({
      success: true,
      count: stocks.length,
      stocks
    });

  } catch (error) {
    console.error("Get All Stocks Error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Server error while fetching stocks"
    });
  }
};


// ==========================================
// GET STOCK BY SYMBOL
// GET /api/stocks/:symbol
// ==========================================

const getStockBySymbol = async (req, res) => {
  try {
    const symbol = req.params.symbol
      .trim()
      .toUpperCase();

    const stock = await Stock.findOne({
      symbol
    });

    if (!stock) {
      return res.status(404).json({
        success: false,
        message: "Stock not found"
      });
    }

    return res.status(200).json({
      success: true,
      stock
    });

  } catch (error) {
    console.error("Get Stock Error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Server error while fetching stock"
    });
  }
};


// ==========================================
// UPDATE STOCK PRICE
// PUT /api/stocks/:symbol
// ==========================================

const updateStockPrice = async (req, res) => {
  try {
    const symbol = req.params.symbol
      .trim()
      .toUpperCase();

    const { currentPrice } = req.body;

    // Validate price
    if (
      currentPrice === undefined ||
      Number.isNaN(Number(currentPrice)) ||
      Number(currentPrice) < 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid current price"
      });
    }

    // Find stock
    const stock = await Stock.findOne({
      symbol
    });

    if (!stock) {
      return res.status(404).json({
        success: false,
        message: "Stock not found"
      });
    }

    // Move current price to previous close
    stock.previousClose = stock.currentPrice;

    // Set new price
    stock.currentPrice = Number(currentPrice);

    await stock.save();

    return res.status(200).json({
      success: true,
      message: "Stock price updated successfully",
      stock
    });

  } catch (error) {
    console.error("Update Stock Price Error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Server error while updating stock price"
    });
  }
};


// ==========================================
// DELETE STOCK
// DELETE /api/stocks/:symbol
// ==========================================

const deleteStock = async (req, res) => {
  try {
    const symbol = req.params.symbol
      .trim()
      .toUpperCase();

    const stock = await Stock.findOneAndDelete({
      symbol
    });

    if (!stock) {
      return res.status(404).json({
        success: false,
        message: "Stock not found"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Stock deleted successfully",
      stock
    });

  } catch (error) {
    console.error("Delete Stock Error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Server error while deleting stock"
    });
  }
};


// ==========================================
// EXPORT CONTROLLERS
// ==========================================

module.exports = {
  createStock,
  getAllStocks,
  getStockBySymbol,
  updateStockPrice,
  deleteStock
};