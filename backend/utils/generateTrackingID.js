
const Courier = require("../DB/CourierSchema");

const generateTrackingId = async () => {
  const id = "TRK" + Math.floor(100000 + Math.random() * 900000).toString();
  const exists = await Courier.findOne({ trackingId: id });
  return exists ? generateTrackingId() : id;
};

module.exports = generateTrackingId;
