const mongoose = require("mongoose");

const branchSchema = new mongoose.Schema({
  branchName: {
    type: String,
    required: true,
    trim: true,
  },
  city: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  state: {
    type: String,
    required: true,
  },
  pincode: {
    type: String,
    required: true,
    match: /^[0-9]{6}$/, 
  },
}, { timestamps: true });

module.exports = mongoose.model("Branch", branchSchema);
