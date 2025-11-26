const Courier = require("../DB/CourierSchema");
const Branch = require("../DB/Branchschema");
const User = require("../DB/Userschema");
const generateTrackingId = require("../utils/generateTrackingID");
const { getDistanceInKm } = require("../utils/orsservices");
const generateCourierReceipt = require("../utils/generateReceipt");
const sendEmailWithAttachment = require("../utils/emailService");
const bcrypt = require("bcryptjs");

// ===========================
// PREVIEW COURIER DETAILS
// ===========================
const previewCourier = async (req, res) => {
  try {
    const { destinationBranch, weight } = req.body;

    const fromBranch = await Branch.findById(req.user.branch);
    const toBranch = await Branch.findOne({ branchName: destinationBranch });

    if (!fromBranch || !toBranch) {
      return res.status(404).json({ message: "Branch not found" });
    }

    let price;
    let distance = 0;

    // ✅ If both branches are same, fixed price
    if (fromBranch._id.equals(toBranch._id)) {
      price = 50;
    } else {
      const fromAddress = `${fromBranch.address}, ${fromBranch.city}, ${fromBranch.pincode}, Gujarat, India`;
      const toAddress = `${toBranch.address}, ${toBranch.city}, ${toBranch.pincode}, Gujarat, India`;

      distance = await getDistanceInKm(fromAddress, toAddress);
      if (!distance) {
        return res.status(500).json({ message: "Distance calculation failed" });
      }

      price = weight * distance * 2;
    }

    res.status(200).json({
      distance: distance.toFixed(2),
      price: price.toFixed(2),
      estimatedDays: distance ? Math.ceil(distance / 250) + " days" : "1 day"
    });
  } catch (err) {
    console.error("Preview error:", err);
    res.status(500).json({ message: "Server Error" });
  }
};

// ==========================
// CREATE COURIER & SEND EMAILS
// ==========================
const createCourier = async (req, res) => {
  try {
    const { sender, receiver, destinationBranch, weight } = req.body;

    const fromBranch = await Branch.findById(req.user.branch);
    const toBranch = await Branch.findOne({ branchName: destinationBranch });

    if (!fromBranch || !toBranch) {
      return res.status(404).json({ message: "Branch not found" });
    }

    let distance = 0;
    let price;

    // Fixed price if same branch
    if (fromBranch._id.equals(toBranch._id)) {
      price = 50;
    } else {
      const fromAddress = `${fromBranch.address}, ${fromBranch.city}, ${fromBranch.pincode}, Gujarat, India`;
      const toAddress = `${toBranch.address}, ${toBranch.city}, ${toBranch.pincode}, Gujarat, India`;

      distance = await getDistanceInKm(fromAddress, toAddress);
      if (!distance) {
        return res.status(500).json({ message: "Distance calculation failed" });
      }

      price = weight * distance * 2;
    }

    const trackingId = await generateTrackingId();

    const courier = new Courier({
      trackingId,
      sender: {
        user: req.user.id,
        name: sender.name,
        email: sender.email,
        phone: sender.phone,
        address: sender.address,
        pincode: sender.pincode,
      },
      receiver: {
        name: receiver.name,
        phone: receiver.phone,
        email: receiver.email,
        address: receiver.address,
        pincode: receiver.pincode,
      },
      originBranch: fromBranch._id,
      destinationBranch: toBranch._id,
      weight,
      distanceInKm: distance.toFixed(2),
      price: price.toFixed(2),
      status: "Booked",
      createdBy: req.user.id,
    });

    await courier.save();

    const filePath = `./receipts/${courier.trackingId}.pdf`;

    await generateCourierReceipt({
      ...courier.toObject(),
      originBranchName: fromBranch.branchName,
      originBranchAddress: `${fromBranch.address}, ${fromBranch.city}, ${fromBranch.pincode}, Gujarat, India`,
      destinationBranchName: toBranch.branchName,
      destinationBranchAddress: `${toBranch.address}, ${toBranch.city}, ${toBranch.pincode}, Gujarat, India`,
    });

    // Sender Email
    await sendEmailWithAttachment({
      to: sender.email,
      subject: "DakiyaPro: Your Courier Has Been Booked!",
      text: `Hi ${sender.name},\n\nYour courier has been successfully created. Tracking ID: ${trackingId}.\n\nThanks for using DakiyaPro.`,
      attachmentPath: filePath,
    });

    // Receiver Email
    await sendEmailWithAttachment({
      to: receiver.email,
      subject: "DakiyaPro: A Courier is On Its Way!",
      text: `Hi ${receiver.name},\n\nYour package from ${sender.name} is now on its way.\nTracking ID: ${trackingId}\n\nYou can monitor the delivery status at any time via: www.dakiyapro.com\n\nKindly ensure that someone is available at the delivery address to receive the courier. If you need assistance or have any queries, our support team is happy to help.\n\nThank you for choosing DakiyaPro.\n\nWarm regards,\nDakiyaPro Logistics`,
      attachmentPath: filePath,
    });

    res.status(201).json({ message: "Courier created and emails sent!", courier });
  } catch (error) {
    console.error("Courier creation failed:", error);
    res.status(500).json({ message: "Server Error" });
  }
};
// ==========================
//  GET COURIER RECEIPT DETAILS
// ==========================
const getCourierReceiptDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const courier = await Courier.findById(id)
      .populate("originBranch")
      .populate("destinationBranch");

    if (!courier) {
      return res.status(404).json({ message: "Courier not found" });
    }

    const receiptData = {
      trackingId: courier.trackingId,
      date: courier.createdAt.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      }),
      status: courier.status,
      sender: {
        name: courier.sender.name,
        email: courier.sender.email,
        phone: courier.sender.phone,
        address: courier.sender.address,
      },
      receiver: {
        name: courier.receiver.name,
        email: courier.receiver.email,
        phone: courier.receiver.phone,
        address: courier.receiver.address,
      },
      fromBranch: courier.originBranch.branchName,
      toBranch: courier.destinationBranch.branchName,
      weight: `${courier.weight} kg`,
      distance: `${courier.distanceInKm} km`,
      price: `₹${courier.price}`,
      deliveryEstimate: courier.distanceInKm > 0
        ? Math.ceil(courier.distanceInKm / 250) + " Days"
        : "1 Day",
    };

    res.status(200).json(receiptData);
  } catch (error) {
    console.error("Receipt fetch error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};
// ==========================
//GET SENT COURIERS BY BRANCH
// ==========================
const getSentCouriersByBranch = async (req, res) => {
  try {
    const userBranch = req.user.branch;

    const { status, dateFrom, dateTo } = req.query;

    const query = {
      originBranch: userBranch,
    };

    if (status && status !== "All") {
      query.status = status;
    }

    if (dateFrom || dateTo) {
      query.createdAt = {};
      if (dateFrom) query.createdAt.$gte = new Date(dateFrom);
      if (dateTo) query.createdAt.$lte = new Date(dateTo);
    }

    const couriers = await Courier.find(query)
      .populate("sender", "name")
      .populate("receiver", "name")
      .populate("originBranch", "name")
      .populate("destinationBranch", "branchName")
      .populate("assignedStaff", "name")
      .populate("createdBy", "name")
      .sort({ createdAt: -1 });

    res.status(200).json(couriers);
  } catch (err) {
    console.error("Error fetching sent couriers by branch:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ==========================
//GET RECEIVED COURIER BY BRANCH
// ==========================
const getReceivedCourierByBranch = async (req, res) => {
  try {
    const userBranch = req.user.branch;

    const { status, dateFrom, dateTo } = req.query;

    const query = {
      destinationBranch: userBranch,
    };

    if (status && status !== "All") {
      query.status = status;
    }

    if (dateFrom || dateTo) {
      query.createdAt = {};
      if (dateFrom) query.createdAt.$gte = new Date(dateFrom);
      if (dateTo) query.createdAt.$lte = new Date(dateTo);
    }

    const couriers = await Courier.find(query)
      // sender and receiver are embedded objects — no populate
      .populate("originBranch", "branchName")
      .populate("destinationBranch", "branchName")
      .populate("assignedStaff", "name")
      .populate("createdBy", "name")
      .sort({ createdAt: -1 });

    res.status(200).json(couriers);
  } catch (err) {
    console.error("Error fetching received couriers by branch:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ==========================
//  ASSIGN STAFF TO COURIER
// ==========================
const assignStaffToCourier = async (req, res) => {
  try {
    const { id } = req.params; // courier ID
    const { staffId } = req.body; // selected staff ID from frontend

    // Fetch courier
    const courier = await Courier.findById(id);
    if (!courier) {
      return res.status(404).json({ message: "Courier not found" });
    }

    // Rule: Only assign staff if courier is at destination branch and not yet assigned
    if (courier.status !== "Received at Destination Branch") {
      return res.status(400).json({
        message: "Courier is not eligible for staff assignment",
      });
    }

    if (courier.assignedStaff) {
      return res.status(400).json({
        message: "Staff is already assigned to this courier",
      });
    }

    // Ensure the logged-in user's branch matches the courier's destination branch
    if (String(courier.destinationBranch) !== String(req.user.branch)) {
      return res.status(403).json({
        message: "You cannot assign staff for couriers outside your branch",
      });
    }

    // Find staff user
    const staff = await User.findById(staffId);
    if (!staff || staff.role !== "staff") {
      return res.status(404).json({ message: "Staff not found" });
    }

    // Assign staff
    courier.assignedStaff = staffId;
    await courier.save();

    // Calculate estimated delivery date
    const deliveryDays = Math.ceil(courier.distanceInKm / 500) + 1;
    const estimatedDate = new Date(courier.createdAt);
    estimatedDate.setDate(estimatedDate.getDate() + deliveryDays);

    // Send professional plain-text email to staff
    await sendEmailWithAttachment({
      to: staff.email,
      subject: `Courier Assigned - Tracking ID: ${courier.trackingId}`,
      text: `Dear ${staff.name},

You have been assigned a new courier for delivery.

Courier Details:
- Tracking ID: ${courier.trackingId}
- Sender: ${courier.sender.name} (${courier.sender.phone})
- Receiver: ${courier.receiver.name} (${courier.receiver.phone})
- Receiver Address: ${courier.receiver.address}
- Expected Delivery Date: ${estimatedDate.toDateString()}

Please collect the parcel from your branch as soon as possible to ensure timely delivery.

Best regards,
DakiyaPro Courier Service
      `,
    });

    res.json({
      message: "Staff assigned successfully and email sent",
      courier,
    });

  } catch (error) {
    console.error("Error assigning staff:", error);
    res.status(500).json({ message: "Server error" });
  }
};

//send delivery OTP
const sendDeliveryOtp = async (req, res) => {
  try {
    const { id } = req.params;

    const courier = await Courier.findById(id);
    if (!courier) {
      return res.status(404).json({ message: "Courier not found" });
    }

    // Check if OTP already exists and is still valid
    if (
      courier.deliveryOtp &&
      courier.deliveryOtp.expiresAt &&
      new Date(courier.deliveryOtp.expiresAt) > new Date() &&
      courier.deliveryOtp.verified === false
    ) {
      return res.status(400).json({
        message: "OTP already sent. Please wait until it expires."
      });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedOtp = await bcrypt.hash(otp, 10);

    courier.deliveryOtp = {
      code: hashedOtp,
      expiresAt: new Date(Date.now() + 3 * 60 * 1000), // 3 min expiry
      verified: false
    };

    await courier.save();

    // Send OTP via email
    await sendEmailWithAttachment({
      to: courier.receiver.email,
      subject: "DakiyaPro - Secure Delivery OTP",

      text: `Dear Customer,

Your One-Time Password (OTP) for receiving your package is:

${otp}

Tracking ID: ${courier.trackingId}

Please share this OTP only with our delivery personnel.  
It will remain valid for the next 3 minutes, after which a new OTP will be required.

Thank you for choosing DakiyaPro.  
We appreciate your trust in our services.

Best regards,  
DakiyaPro Delivery Team`


    });

    res.json({ message: "OTP sent to receiver's email" });
  } catch (err) {
    console.error("Error sending OTP:", err);
    res.status(500).json({ message: "Server error" });
  }
};


// update status

const updateCourierStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, otp, reason } = req.body;
    const userRole = req.user.role; // assuming token middleware sets req.user

    // Fetch courier with related sender and branch details
    const courier = await Courier.findById(id)
      .populate("sender.user")
      .populate("originBranch")
      .populate("destinationBranch")
      .populate("assignedStaff"); // ensure staff info is available

    if (!courier) {
      return res.status(404).json({ message: "Courier not found" });
    }

    const statusFlow = [
      "Booked",
      "In Transit",
      "Received at Destination Branch",
      "Out for Delivery",
      "Delivered"
    ];
    const specialStatuses = ["Cancelled", "Unable to Deliver", "Delivered at Branch"];

    // Validate status
    if (![...statusFlow, ...specialStatuses].includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    // Prevent staff from updating after "Unable to Deliver"
    if (courier.status === "Unable to Deliver" && userRole === "staff") {
      return res.status(400).json({
        message: "Courier is returned to branch. Staff cannot update status."
      });
    }

    // ❌ Prevent Out for Delivery without assigned staff
    if (status === "Out for Delivery" && !courier.assignedStaff) {
      return res.status(400).json({
        message: "Courier cannot be marked 'Out for Delivery' without assigning a staff member."
      });
    }

    // 📌 Send Out for Delivery Email (only to receiver)
    if (status === "Out for Delivery") {
      try {
        await sendEmailWithAttachment({
          to: courier.receiver.email,
          subject: `Your Courier is Out for Delivery - Tracking ID: ${courier.trackingId}`,
          text: `Dear ${courier.receiver.name},

Good news! Your courier is out for delivery and will arrive today.

Tracking ID: ${courier.trackingId}
Expected Delivery: Today
Delivery Address: ${courier.receiver.address}, ${courier.receiver.pincode}

Please ensure someone is available at the delivery address to receive it.

Thank you for choosing DakiyaPro.

Best regards,
The DakiyaPro Team`
        });
      } catch (err) {
        console.error("Error sending out for delivery email:", err);
      }
    }

    // OTP check for Delivered
    if (status === "Delivered") {
      // Check if OTP was sent
      if (!courier.deliveryOtp || !courier.deliveryOtp.code) {
        return res.status(400).json({ message: "OTP not sent yet" });
      }

      // Check if OTP expired
      if (new Date(courier.deliveryOtp.expiresAt) < new Date()) {
        return res.status(400).json({ message: "OTP expired" });
      }

      // Check if OTP is provided
      if (!otp) {
        return res.status(400).json({ message: "OTP is required" });
      }

      // Compare OTP safely
      const isMatch = await bcrypt.compare(otp, courier.deliveryOtp.code);
      if (!isMatch) {
        return res.status(400).json({ message: "Invalid OTP" });
      }

      courier.deliveryOtp.verified = true;
      courier.deliveryDate = new Date();
      // 📌 Send Delivered email only to receiver
      try {   // ← This try block
        await sendEmailWithAttachment({
          to: courier.sender.email,
          subject: `Courier Delivered - Tracking ID: ${courier.trackingId}`,
          text: `Dear ${courier.sender.name},
      
We are pleased to inform you that your courier has been successfully delivered.

Tracking ID: ${courier.trackingId}
Delivered On: ${courier.deliveryDate.toLocaleString()}
Delivery Address: ${courier.receiver.address}, ${courier.receiver.pincode}

Thank you for choosing DakiyaPro.

Best regards,
The DakiyaPro Team`
        });
      } catch (err) {
        console.error("Error sending delivery email:", err);
      }
    }

    // Reason for Unable to Deliver
    if (status === "Unable to Deliver") {
      if (!reason) {
        return res.status(400).json({ message: "Reason required for unable to deliver" });
      }
      courier.unableToDeliverReason = reason;
      courier.returnedToBranchAt = new Date(); // timestamp

      // 📌 Send Unable to Deliver email to receiver
      try {
        await sendEmailWithAttachment({
          to: courier.receiver.email,
          subject: `Courier Delivery Issue - Tracking ID: ${courier.trackingId}`,
          text: `Dear ${courier.receiver.name},

We attempted to deliver your courier (Tracking ID: ${courier.trackingId}) but were unable to do so due to:

"${reason}"

Your courier is now available for pickup at the destination branch:

Branch Name: ${courier.destinationBranch.branchName}
Address: ${courier.destinationBranch.address}, ${courier.destinationBranch.city}, ${courier.destinationBranch.state} - ${courier.destinationBranch.pincode}

Thank you for choosing DakiyaPro.

Best regards,
The DakiyaPro Team`
        });
      } catch (err) {
        console.error("Error sending unable delivery email:", err);
      }
    }

    // Update status in DB
    courier.status = status;
    await courier.save();

    res.status(200).json({
      message: "Status updated successfully",
      courier,
    });
  } catch (err) {
    console.error("Error updating status:", err);
    res.status(500).json({ message: "Server error" });
  }
};

//get all courier for super admin
const getAllCouriersForSuperAdmin = async (req, res) => {
  try {
    const couriers = await Courier.find({})
      .populate("originBranch", "branchName")
      .populate("destinationBranch", "branchName")
      .populate("assignedStaff", "name")
      .populate("createdBy", "name")
      .sort({ createdAt: -1 });

    res.status(200).json(couriers);
  } catch (error) {
    console.error("Error fetching all couriers:", error);
    res.status(500).json({ message: "Failed to fetch couriers" });
  }
};
//assign courier to each staff
const getAssignedCouriers = async (req, res) => {
  try {
    // Find couriers where assignedStaff matches logged-in user ID
    const couriers = await Courier.find({ assignedStaff: req.user.id })
      .populate("assignedStaff", "name email") 
      .populate("originBranch", "branchName")
      .populate("destinationBranch", "branchName")
      .sort({ createdAt: -1 });

    res.status(200).json(couriers);
  } catch (error) {
    console.error("Error fetching assigned couriers:", error);
    res.status(500).json({ message: "Server Error" });
  }
};
//get courier for tracking
const getCourierByTrackingId = async (req, res) => {
  try {
    const { trackingId } = req.params;
    const courier = await Courier.findOne({ trackingId: trackingId.toUpperCase() });

    if (!courier) {
      return res.status(404).json({ message: "Tracking ID not found" });
    }

    res.status(200).json(courier);
  } catch (error) {
    res.status(500).json({ message: "Error fetching courier", error: error.message });
  }
};
//get courier for user
const getUserCouriers = async (req, res) => {
  try {
    // Find couriers where the logged-in user is the sender
     const couriers = await Courier.find({ "sender.name": req.user.name })
      .populate("originBranch", "branchName")
      .populate("destinationBranch", "branchName")
      .sort({ createdAt: -1 });

    res.status(200).json(couriers);
  } catch (error) {
    console.error("Error fetching user's couriers:", error);
    res.status(500).json({ message: "Server Error" });
  }
};


module.exports = {
  previewCourier,
  createCourier,
  getCourierReceiptDetails,
  getSentCouriersByBranch,
  getReceivedCourierByBranch,
  assignStaffToCourier,
  updateCourierStatus,
  getAllCouriersForSuperAdmin,
  getAssignedCouriers,
  sendDeliveryOtp,
  getCourierByTrackingId,
   getUserCouriers
};
