const mongoose = require("mongoose");

const courierSchema = new mongoose.Schema({
  trackingId: {
    type: String,
    required: true,
    unique: true,
  },

  sender: {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    pincode: { type: String, required: true },
  },

  receiver: {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true },
    address: { type: String, required: true },
    pincode: { type: String, required: true },
  },

  originBranch: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Branch",
    required: true,
  },

  destinationBranch: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Branch",
    required: true,
  },

  weight: {
    type: Number,
    required: true,
  },

  distanceInKm: {
    type: Number,
    required: true,
  },

  price: {
    type: Number,
    required: true,
  },

  assignedStaff: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null,
  },

  status: {
    type: String,
    enum: [
      "Booked",
      "In Transit",
      "Received at Destination Branch",
      "Out for Delivery",
      "Delivered",
      "Unable to Deliver",
      "Delivered at Branch",
      "Returned to Sender",
      "Cancelled"
    ],
    default: "Booked",
  },

  unableToDeliverReason: {
    type: String,
    default: null,
  },

  returnedToBranchAt: {
    type: Date,
    default: null,
  },

  deliveredAtBranchBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null,
  },

  // 📌 Delivery OTP
  deliveryOtp: {
    code: { type: String, default: null },
    expiresAt: { type: Date, default: null },
    verified: { type: Boolean, default: false }
  },

  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },

  deliveryDate: {
    type: Date,
  }
});

module.exports = mongoose.model("Courier", courierSchema);
