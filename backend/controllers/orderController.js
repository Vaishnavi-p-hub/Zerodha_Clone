const mongoose = require("mongoose");

const Order = require("../models/Order");
const User = require("../models/User");
const Stock = require("../models/Stock");

// ==========================================
// BUY STOCK
// POST /api/orders/buy
// ==========================================

const buyStock = async (req, res) => {
  const session = await mongoose.startSession();

  try {
    const { symbol, quantity } = req.body;

    if (!symbol || quantity === undefined) {
      return res.status(400).json({
        success: false,
        message: "Stock symbol and quantity are required"
      });
    }

    const normalizedSymbol = symbol.trim().toUpperCase();
    const requestedQuantity = Number(quantity);

    if (
      !Number.isInteger(requestedQuantity) ||
      requestedQuantity <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be a positive whole number"
      });
    }

    session.startTransaction();

    const user = await User.findById(req.userId).session(session);

    if (!user) {
      await session.abortTransaction();

      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    const stock = await Stock.findOne({
      symbol: normalizedSymbol
    }).session(session);

    if (!stock) {
      await session.abortTransaction();

      return res.status(404).json({
        success: false,
        message: "Stock not found"
      });
    }

    if (stock.quantityAvailable < requestedQuantity) {
      await session.abortTransaction();

      return res.status(400).json({
        success: false,
        message: "Insufficient stock quantity",
        availableQuantity: stock.quantityAvailable
      });
    }

    const price = stock.currentPrice;
    const totalAmount = price * requestedQuantity;

    if (user.balance < totalAmount) {
      await session.abortTransaction();

      return res.status(400).json({
        success: false,
        message: "Insufficient account balance",
        balance: user.balance,
        requiredAmount: totalAmount
      });
    }

    user.balance -= totalAmount;

    stock.quantityAvailable -= requestedQuantity;

    const order = new Order({
      user: user._id,
      stock: stock._id,
      symbol: stock.symbol,
      orderType: "BUY",
      quantity: requestedQuantity,
      price,
      totalAmount,
      status: "COMPLETED"
    });

    await user.save({ session });
    await stock.save({ session });
    await order.save({ session });

    await session.commitTransaction();

    return res.status(201).json({
      success: true,
      message: "Stock purchased successfully",

      order: {
        id: order._id,
        symbol: order.symbol,
        orderType: order.orderType,
        quantity: order.quantity,
        price: order.price,
        totalAmount: order.totalAmount,
        status: order.status,
        createdAt: order.createdAt
      },

      balance: user.balance,

      remainingStockQuantity: stock.quantityAvailable
    });

  } catch (error) {
    await session.abortTransaction();

    console.error("Buy Stock Error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Transaction failed",
      error: error.message
    });

  } finally {
    await session.endSession();
  }
};


// ==========================================
// SELL STOCK
// POST /api/orders/sell
// ==========================================

const sellStock = async (req, res) => {
  const session = await mongoose.startSession();

  try {
    const { symbol, quantity } = req.body;

    if (!symbol || quantity === undefined) {
      return res.status(400).json({
        success: false,
        message: "Stock symbol and quantity are required"
      });
    }

    const normalizedSymbol = symbol.trim().toUpperCase();
    const requestedQuantity = Number(quantity);

    if (
      !Number.isInteger(requestedQuantity) ||
      requestedQuantity <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be a positive whole number"
      });
    }

    session.startTransaction();

    const user = await User.findById(req.userId).session(session);

    if (!user) {
      await session.abortTransaction();

      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    const stock = await Stock.findOne({
      symbol: normalizedSymbol
    }).session(session);

    if (!stock) {
      await session.abortTransaction();

      return res.status(404).json({
        success: false,
        message: "Stock not found"
      });
    }

    const userOrders = await Order.find({
      user: user._id,
      symbol: normalizedSymbol,
      status: "COMPLETED"
    }).session(session);

    let ownedQuantity = 0;

    for (const existingOrder of userOrders) {
      if (existingOrder.orderType === "BUY") {
        ownedQuantity += existingOrder.quantity;
      }

      if (existingOrder.orderType === "SELL") {
        ownedQuantity -= existingOrder.quantity;
      }
    }

    if (ownedQuantity < requestedQuantity) {
      await session.abortTransaction();

      return res.status(400).json({
        success: false,
        message: "Insufficient holdings",
        ownedQuantity,
        requestedQuantity
      });
    }

    const price = stock.currentPrice;
    const totalAmount = price * requestedQuantity;

    user.balance += totalAmount;

    stock.quantityAvailable += requestedQuantity;

    const order = new Order({
      user: user._id,
      stock: stock._id,
      symbol: stock.symbol,
      orderType: "SELL",
      quantity: requestedQuantity,
      price,
      totalAmount,
      status: "COMPLETED"
    });

    await user.save({ session });
    await stock.save({ session });
    await order.save({ session });

    await session.commitTransaction();

    return res.status(201).json({
      success: true,
      message: "Stock sold successfully",

      order: {
        id: order._id,
        symbol: order.symbol,
        orderType: order.orderType,
        quantity: order.quantity,
        price: order.price,
        totalAmount: order.totalAmount,
        status: order.status,
        createdAt: order.createdAt
      },

      balance: user.balance,

      remainingHoldingQuantity:
        ownedQuantity - requestedQuantity,

      availableStockQuantity:
        stock.quantityAvailable
    });

  } catch (error) {
    await session.abortTransaction();

    console.error("Sell Stock Error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Sell transaction failed",
      error: error.message
    });

  } finally {
    await session.endSession();
  }
};


// ==========================================
// GET ORDER HISTORY
// GET /api/orders
// ==========================================

const getOrders = async (req, res) => {
  try {
    const orders = await Order.find({
      user: req.userId
    })
      .populate("stock")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      message: "Order history fetched successfully",
      count: orders.length,
      orders: orders.map((order) => ({
        id: order._id,
        symbol: order.symbol,
        orderType: order.orderType,
        quantity: order.quantity,
        price: order.price,
        totalAmount: order.totalAmount,
        status: order.status,
        createdAt: order.createdAt
      }))
    });

  } catch (error) {
    console.error("Get Orders Error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch order history",
      error: error.message
    });
  }
};


// ==========================================
// EXPORT CONTROLLERS
// ==========================================

module.exports = {
  buyStock,
  sellStock,
  getOrders
};