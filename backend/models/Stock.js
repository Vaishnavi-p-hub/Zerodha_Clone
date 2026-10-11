const mongoose = require("mongoose");

const stockSchema = new mongoose.Schema(
  {
    symbol: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true
    },

    companyName: {
      type: String,
      required: true,
      trim: true
    },

    currentPrice: {
      type: Number,
      required: true,
      min: 0
    },

    previousClose: {
      type: Number,
      required: true,
      min: 0
    },

    sector: {
      type: String,
      required: true,
      trim: true
    },

    quantityAvailable: {
      type: Number,
      required: true,
      min: 0,
      default: 100000
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Stock", stockSchema);