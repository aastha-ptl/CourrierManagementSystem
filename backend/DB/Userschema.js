const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },

  email: {
    type: String,
    required: true,
    unique: true,
  },

  password: {
    type: String,
    required: true,
  },

  phone: { 
    type: String, 
    default: "" 
  },

  role: {
    type: String,
    enum: ["admin", "branchadmin", "staff", "user"],
    default: "user",
  },

  branch: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Branch",
    default: null,
  },

  isActive: {
    type: Boolean,
    default: true, // all existing users stay active
  }
}, {
  timestamps: true
});

const User = mongoose.model("User", userSchema);
module.exports = User;
