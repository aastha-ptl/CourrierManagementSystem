// migrateAddIsActive.js
const mongoose = require('mongoose');
const Courier = require('./DB/CourierSchema'); // Adjust path
const connectDB = require("./Connection");



(async () => {
  await connectDB();
  await Courier.updateMany(
    {},
    { $rename: { "sender.user": "sender.originBranchAdmin" } }
  );
  console.log("Field renamed for all couriers");
  process.exit();
})();
