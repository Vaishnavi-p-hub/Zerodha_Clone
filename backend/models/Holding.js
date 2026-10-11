const mongoose = require("mongoose");

const holdingSchema = new mongoose.Schema(
  {
    // User who owns this holding
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    // Stock reference
    stock: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Stock",
      required: true
    },

    // Stock symbol
    symbol: {
      type: String,
      required: true,
      uppercase: true,
      trim: true
    },

    // Number of shares owned
    quantity: {
      type: Number,
      required: true,
      min: 0
    },

    // Average price at which shares were purchased
    averageBuyPrice: {
      type: Number,
      required: true,
      min: 0
    }
  },
  {
    timestamps: true
  }
);


// Prevent duplicate holding records for
// the same user and same stock
holdingSchema.index(
  {
    user: 1,
    stock: 1
  },
  {
    unique: true
  }
);


module.exports = mongoose.model("Holding", holdingSchema);