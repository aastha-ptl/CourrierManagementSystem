const generateReceipt = require("./utils/generateReceipt");

const dummyCourier = {
  trackingId: "C123456789",
  status: "Pending",
  weight: 2,
  distanceInKm: 45.6,
  price: 320,
  createdAt: new Date(),
  deliveryDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days later
  sender: {
    name: "Aastha Patel",
    phone: "9876543210",
    address: "12, Triveni Vishvam, Bakrol",
    pincode: "388120",
  },
  receiver: {
    name: "Ravi Sharma",
    phone: "9012345678",
    email: "ravi@example.com",
    address: "Shri Hari Park, Maninagar",
    pincode: "380008",
  },
};

generateReceipt(dummyCourier);
