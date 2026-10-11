const Order = require("../models/Order");
const Stock = require("../models/Stock");

// ==========================================
// GET PORTFOLIO
// GET /api/portfolio
// ==========================================

const getPortfolio = async (req, res) => {
  try {
    // Get all completed orders of logged-in user
    const orders = await Order.find({
      user: req.userId,
      status: "COMPLETED"
    }).sort({ createdAt: 1 });

    // If no orders
    if (orders.length === 0) {
      return res.status(200).json({
        success: true,
        message: "Portfolio fetched successfully",
        portfolio: {
          holdings: [],
          totalInvested: 0,
          totalCurrentValue: 0,
          totalProfitLoss: 0,
          totalProfitLossPercentage: 0
        }
      });
    }

    // Group orders by stock symbol
    const holdingsMap = {};

    for (const order of orders) {
      const symbol = order.symbol;

      if (!holdingsMap[symbol]) {
        holdingsMap[symbol] = {
          symbol,
          quantity: 0,
          totalBuyAmount: 0,
          totalBuyQuantity: 0
        };
      }

      // BUY
      if (order.orderType === "BUY") {
        holdingsMap[symbol].quantity += order.quantity;

        holdingsMap[symbol].totalBuyAmount += order.totalAmount;

        holdingsMap[symbol].totalBuyQuantity += order.quantity;
      }

      // SELL
      if (order.orderType === "SELL") {
        holdingsMap[symbol].quantity -= order.quantity;
      }
    }

    const holdings = [];

    for (const symbol of Object.keys(holdingsMap)) {
      const holding = holdingsMap[symbol];

      // Don't show stocks whose quantity is zero
      if (holding.quantity <= 0) {
        continue;
      }

      // Find current stock price
      const stock = await Stock.findOne({ symbol });

      if (!stock) {
        continue;
      }

      const averageBuyPrice =
        holding.totalBuyQuantity > 0
          ? holding.totalBuyAmount / holding.totalBuyQuantity
          : 0;

      const investedAmount =
        averageBuyPrice * holding.quantity;

      const currentPrice = stock.currentPrice;

      const currentValue =
        currentPrice * holding.quantity;

      const profitLoss =
        currentValue - investedAmount;

      const profitLossPercentage =
        investedAmount > 0
          ? (profitLoss / investedAmount) * 100
          : 0;

      holdings.push({
        symbol,
        quantity: holding.quantity,
        averageBuyPrice: Number(averageBuyPrice.toFixed(2)),
        currentPrice,
        investedAmount: Number(investedAmount.toFixed(2)),
        currentValue: Number(currentValue.toFixed(2)),
        profitLoss: Number(profitLoss.toFixed(2)),
        profitLossPercentage: Number(
          profitLossPercentage.toFixed(2)
        )
      });
    }

    // Calculate portfolio totals
    const totalInvested = holdings.reduce(
      (total, holding) => total + holding.investedAmount,
      0
    );

    const totalCurrentValue = holdings.reduce(
      (total, holding) => total + holding.currentValue,
      0
    );

    const totalProfitLoss =
      totalCurrentValue - totalInvested;

    const totalProfitLossPercentage =
      totalInvested > 0
        ? (totalProfitLoss / totalInvested) * 100
        : 0;

    return res.status(200).json({
      success: true,
      message: "Portfolio fetched successfully",

      portfolio: {
        holdings,

        totalInvested: Number(
          totalInvested.toFixed(2)
        ),

        totalCurrentValue: Number(
          totalCurrentValue.toFixed(2)
        ),

        totalProfitLoss: Number(
          totalProfitLoss.toFixed(2)
        ),

        totalProfitLossPercentage: Number(
          totalProfitLossPercentage.toFixed(2)
        )
      }
    });
  } catch (error) {
    console.error(
      "Get Portfolio Error:",
      error.message
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch portfolio",
      error: error.message
    });
  }
};

module.exports = {
  getPortfolio
};