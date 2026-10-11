const express = require("express");
const cors = require("cors");

require("dotenv").config();

const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const stockRoutes = require("./routes/stockRoutes");
const orderRoutes = require("./routes/orderRoutes");
const portfolioRoutes = require("./routes/portfolioRoutes");

const app = express();

// ==========================================
// CONNECT DATABASE
// ==========================================

connectDB();

// ==========================================
// MIDDLEWARE
// ==========================================

app.use(cors());
app.use(express.json());

// ==========================================
// HOME ROUTE
// ==========================================

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Zerodha Trading App Backend is running"
  });
});

// ==========================================
// TEST ORDER ROUTE
// ==========================================

app.get("/api/orders/test", (req, res) => {
  res.json({
    success: true,
    message: "Order route is working"
  });
});

// ==========================================
// AUTH ROUTES
// ==========================================

app.use("/api/auth", authRoutes);

// ==========================================
// STOCK ROUTES
// ==========================================

app.use("/api/stocks", stockRoutes);

// ==========================================
// ORDER ROUTES
// ==========================================

app.use("/api/orders", orderRoutes);

// ==========================================
// PORTFOLIO ROUTES
// ==========================================

app.use("/api/portfolio", portfolioRoutes);

// ==========================================
// SERVER
// ==========================================

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log("Auth routes: /api/auth");
  console.log("Stock routes: /api/stocks");
  console.log("Order routes: /api/orders");
  console.log("Portfolio route: GET /api/portfolio");
});