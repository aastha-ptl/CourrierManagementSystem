const express = require("express");
const router = express.Router();
const { previewCourier, createCourier ,getCourierReceiptDetails,getSentCouriersByBranch,getReceivedCourierByBranch, assignStaffToCourier,updateCourierStatus,getAllCouriersForSuperAdmin,getAssignedCouriers,sendDeliveryOtp,getCourierByTrackingId, getUserCouriers} = require("../controller/CourierController");
const { verifyToken, isAdmin} = require("../middleware/authmiddleware");

// POST /api/courier/preview
router.post("/preview", verifyToken, previewCourier);

// POST /api/courier/create
router.post("/create", verifyToken, createCourier);
// GET /api/courier/receipt/:id
router.get("/receipt/:id", verifyToken, getCourierReceiptDetails);
// GET /api/courier/sent
router.get("/sent", verifyToken, getSentCouriersByBranch);
// GET /api/courier/received
router.get("/received", verifyToken, getReceivedCourierByBranch);
// POST /api/courier/assign-staff
router.put("/assign-staff/:id", verifyToken, assignStaffToCourier);

// POST /api/courier/send-delivery-otp
router.post("/:id/send-otp", verifyToken, sendDeliveryOtp);

// PUT /api/couriers/update-status/:id
router.put("/update-status/:id", verifyToken, updateCourierStatus);
// GET /api/couriers/all
router.get("/all-couriers", verifyToken,isAdmin, getAllCouriersForSuperAdmin);
// GET /api/couriers/assigned
router.get("/assigned", verifyToken, getAssignedCouriers);

// GET /api/couriers/tracking/:trackingId
router.get("/tracking/:trackingId",getCourierByTrackingId);

// GET /api/couriers/user
router.get("/user-courier", verifyToken, getUserCouriers);

module.exports = router;

