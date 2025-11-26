import React, { useState, useEffect } from "react";
import { Table, Form, Row, Col, Modal, Button } from "react-bootstrap";
import { BoxSeam } from "react-bootstrap-icons";
import Select from "react-select";
import {
  FaBox,
  FaUserAlt,
  FaPhoneAlt,
  FaMapMarkerAlt,
  FaTag,
  FaCalendarAlt,
  FaUserCheck,
  FaDownload,
  FaUserPlus,
  FaTimes,
  FaBoxOpen,
  FaCheck,
  FaCheckCircle
} from "react-icons/fa";
import axios from "axios";

const ViewReceivedCouriers = () => {
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [selectedStaff, setSelectedStaff] = useState({ value: "All", label: "All" });
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [couriers, setCouriers] = useState([]);
  const [staffOptions, setStaffOptions] = useState([{ value: "All", label: "All" }]);
  const [loading, setLoading] = useState(true);

  // Assign Staff Modal
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [courierToAssign, setCourierToAssign] = useState(null);
  const [selectedAssignStaff, setSelectedAssignStaff] = useState(null);

  // Courier Info Modal
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [selectedCourier, setSelectedCourier] = useState(null);

  // OTP Modal
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpInput, setOtpInput] = useState("");
  const [otpError, setOtpError] = useState("");
  const [courierForOtp, setCourierForOtp] = useState(null);
  const [resendingOtp, setResendingOtp] = useState(false);

  // Search
  const [searchTrackingId, setSearchTrackingId] = useState("");
  //verify otp
  const [verifyingOtp, setVerifyingOtp] = useState(false);

  const [loadingAssign, setLoadingAssign] = useState(false);

  const statuses = [
    "All",
    "Booked",
    "In Transit",
    "Received at Destination Branch",
    "Out for Delivery",
    "Delivered",
    "Unable to Deliver",
    "Delivered at Branch"
  ];

  const statusFlow = [
    "Booked",
    "In Transit",
    "Received at Destination Branch",
    "Out for Delivery",
    "Delivered",
    "Delivered at Branch"
  ];

  const statusOptions = statuses
    .filter((s) => s !== "All")
    .map((status) => ({ value: status, label: status }));

  // Fetch couriers from backend
  const fetchCouriers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const params = {
        status: selectedStatus !== "All" ? selectedStatus : undefined,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
      };
      const res = await axios.get("http://localhost:5000/api/couriers/received", {
        headers: { Authorization: `Bearer ${token}` },
        params,
      });

      const mapped = res.data.map((courier) => ({
        id: courier._id,
        trackingId: courier.trackingId,
        sender: courier.sender || {},
        receiver: courier.receiver || {},
        originBranch: courier.originBranch?.branchName || "N/A",
        destinationBranch: courier.destinationBranch?.branchName || "N/A",
        status: courier.status,
        deliveredAt: courier.deliveryDate ? courier.deliveryDate.slice(0, 10) : "-",
        handledBy: courier.assignedStaff?.name || "Unassigned",
        createdAt: courier.createdAt,
        deliveryOtp: courier.deliveryOtp,
        unableReason: courier.unableToDeliverReason || "",
        weight: courier.weight || "-",
        distanceInKm: courier.distanceInKm || null,
        price: courier.price || 0,
        deliveryDate: courier.deliveryDate ? courier.deliveryDate.slice(0, 10) : null

      }));

      setCouriers(mapped);
    } catch (err) {
      console.error("Error fetching received couriers:", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch staff
  const fetchStaffByBranch = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:5000/api/auth/staff-by-branch", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const staffList = res.data.map((staff) => ({
        value: staff._id,
        label: staff.name,
      }));
      setStaffOptions([{ value: "All", label: "All" }, ...staffList]);
    } catch (err) {
      console.error("Error fetching staff list:", err);
    }
  };

  useEffect(() => {
    fetchStaffByBranch();
  }, []);

  useEffect(() => {
    fetchCouriers();
  }, [selectedStatus, selectedStaff, dateFrom, dateTo]);

  const filteredCouriers = couriers
    .filter((c) => selectedStaff.value === "All" || c.handledBy === selectedStaff.label)
    .filter((c) => c.trackingId.toLowerCase().includes(searchTrackingId.toLowerCase()));

  // Assign staff handler
  const assignStaffHandler = async () => {
    if (!selectedAssignStaff) return;

    setLoadingAssign(true); // start loading

    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `http://localhost:5000/api/couriers/assign-staff/${courierToAssign}`,
        { staffId: selectedAssignStaff.value },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Reset states after success
      setShowAssignModal(false);
      setSelectedAssignStaff(null);
      setCourierToAssign(null);
      fetchCouriers();
    } catch (error) {
      console.error("Error assigning staff:", error);
    } finally {
      setLoadingAssign(false); // stop loading
    }
  };

  // Update status handler
  const updateStatusHandler = async (courier, newStatus) => {
    try {
      const token = localStorage.getItem("token");

      // Delivered requires OTP
      // Delivered requires OTP
      if (newStatus === "Delivered") {
        try {
          const token = localStorage.getItem("token");

          // Call API to send OTP before opening modal
          await axios.post(
            `http://localhost:5000/api/couriers/${courier.id}/send-otp`,
            {},
            { headers: { Authorization: `Bearer ${token}` } }
          );

          // Then open modal for OTP entry
          setCourierForOtp(courier);
          setShowOtpModal(true);
        } catch (err) {
          alert(err.response?.data?.message || "Failed to send OTP");
          return;
        }
        return;
      }

      // Unable to Deliver
      if (newStatus === "Unable to Deliver") {
        const reason = prompt("Enter reason for unable to deliver:");
        if (!reason) return;
        await axios.put(
          `http://localhost:5000/api/couriers/update-status/${courier.id}`,
          { status: newStatus, reason },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        await axios.put(
          `http://localhost:5000/api/couriers/update-status/${courier.id}`,
          { status: newStatus },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }

      fetchCouriers();
    } catch (err) {
      alert(err.response?.data?.message || "Error updating status");
      console.error(err);
    }
  };

  // OTP submit
  const handleOtpSubmit = async () => {
    if (!otpInput.trim()) {
      setOtpError("Please enter OTP");
      return;
    }

    try {
      setVerifyingOtp(true); // start loading
      const token = localStorage.getItem("token");
      await axios.put(
        `http://localhost:5000/api/couriers/update-status/${courierForOtp.id}`,
        { status: "Delivered", otp: otpInput },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setOtpInput("");
      setOtpError("");
      setShowOtpModal(false);
      setCourierForOtp(null);
      fetchCouriers();
    } catch (err) {
      setOtpError(err.response?.data?.message || "Invalid OTP");
      console.error(err);
    } finally {
      setVerifyingOtp(false); // stop loading
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    if (!courierForOtp) return;
    setResendingOtp(true);
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `http://localhost:5000/api/couriers/${courierForOtp.id}/send-otp`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("OTP resent successfully");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to resend OTP");
    } finally {
      setResendingOtp(false);
    }
  };

  const style = document.createElement("style");
  style.innerHTML = `.custom-thead th { background-color: #C76C3F !important; color: white !important; }`;
  document.head.appendChild(style);

  return (
    <div className="container">
      <h3 className="fw-bold mb-3 d-flex align-items-center" style={{ color: "#C76C3F" }}>
        <BoxSeam size={24} className="me-2 text-secondary" />
        Received Couriers
      </h3>

      {/* Search */}
      <Row className="mb-3">
        <Col md={4}>
          <Form.Label><strong>Search by Tracking ID</strong></Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter tracking ID..."
            value={searchTrackingId}
            onChange={(e) => setSearchTrackingId(e.target.value)}
            style={dateInputStyle}
          />
        </Col>
      </Row>

      {/* Filters */}
      <Row className="mb-4">
        <Col md={3}>
          <Form.Label><strong>Status</strong></Form.Label>
          <Select
            options={statuses.map((status) => ({ value: status, label: status }))}
            value={{ value: selectedStatus, label: selectedStatus }}
            onChange={(selected) => setSelectedStatus(selected.value)}
            styles={selectStyles}
          />
        </Col>
        <Col md={3}>
          <Form.Label><strong>Staff</strong></Form.Label>
          <Select
            options={staffOptions}
            value={selectedStaff}
            onChange={setSelectedStaff}
            styles={selectStyles}
          />
        </Col>
        <Col md={3}>
          <Form.Label><strong>Date From</strong></Form.Label>
          <Form.Control
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            style={dateInputStyle}
          />
        </Col>
        <Col md={3}>
          <Form.Label><strong>Date To</strong></Form.Label>
          <Form.Control
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            style={dateInputStyle}
          />
        </Col>
      </Row>

      {/* Table */}
      <Table bordered responsive>
        <thead className="custom-thead">
          <tr>
            <th>Tracking ID</th>
            <th>Sender</th>
            <th>Receiver</th>
            <th>Status</th>
            <th>Handled By</th>
            <th>Delivered At</th>
            <th>Info</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr><td colSpan="7" className="text-center">Loading...</td></tr>
          ) : filteredCouriers.length === 0 ? (
            <tr><td colSpan="7" className="text-center">No received couriers.</td></tr>
          ) : (
            filteredCouriers.map((courier) => (
              <tr key={courier.id}>
                <td>{courier.trackingId}</td>
                <td>{courier.sender.name}</td>
                <td>{courier.receiver.name}</td>


                <td>
                  <Select
                    value={statusOptions.find(opt => opt.value === courier.status)}
                    onChange={(selectedOption) => updateStatusHandler(courier, selectedOption.value)}
                    options={statusOptions.filter(opt => opt.value !== "Delivered at Branch")}
                    styles={{
                      ...selectStyles,
                      option: (base, state) => ({
                        ...base,
                        backgroundColor: state.isFocused ? "#F5DCCB" : "#fff",
                        color:
                          // If already delivered, disable everything
                          courier.status === "Delivered"
                            ? "#a0a0a0"
                            : // disable previous statuses
                            statusFlow.indexOf(state.data.value) < statusFlow.indexOf(courier.status) && state.data.value !== "Delivered"
                              ? "#a0a0a0"
                              : "#000",
                        cursor:
                          courier.status === "Delivered"
                            ? "not-allowed"
                            : statusFlow.indexOf(state.data.value) < statusFlow.indexOf(courier.status) && state.data.value !== "Delivered"
                              ? "not-allowed"
                              : "pointer"
                      }),
                    }}
                    menuPlacement="auto"
                    menuPosition="fixed"
                    className="w-100"
                    isDisabled={courier.status === "Delivered"} // fully disable dropdown if delivered
                  />
                </td>



                <td>
                  {courier.status === "Received at Destination Branch" && courier.handledBy === "Unassigned" ? (
                    <button
                      className="btn btn-sm btn-outline"
                      style={{ borderColor: "#C76C3F", color: "#C76C3F" }}
                      onClick={() => {
                        setCourierToAssign(courier.id);
                        setShowAssignModal(true);
                      }}
                    >
                      Assign Staff
                    </button>
                  ) : courier.handledBy}
                </td>
                <td>{courier.deliveredAt}</td>
                <td>
                  <Button
                    size="sm"
                    style={{
                      backgroundColor: "#C76C3F",
                      border: "none",
                      color: "#FDFBD8"
                    }}
                    onClick={() => {
                      setSelectedCourier(courier);
                      setShowInfoModal(true);
                    }}
                  >
                    Show Info
                  </Button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </Table>

      {/* Assign Staff Modal */}
      <Modal show={showAssignModal} onHide={() => setShowAssignModal(false)} centered>
        <div style={{ backgroundColor: "#FDFBD8", borderRadius: "10px", padding: "20px", width: "100%" }}>
          <Modal.Header closeButton className="border-0">
            <Modal.Title style={{ color: "#C76C3F", fontWeight: "bold" }}>
              <FaUserPlus className="me-2 mb-1" />
              Assign Staff
            </Modal.Title>
          </Modal.Header>
          <Modal.Body style={{ color: "#333" }}>
            <Form.Group>
              <Form.Label className="fw-bold">Select Staff</Form.Label>
              <Select
                options={staffOptions.filter((opt) => opt.value !== "All")}
                value={selectedAssignStaff}
                onChange={setSelectedAssignStaff}
                styles={selectStyles}
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer className="border-0">
            <Button onClick={() => setShowAssignModal(false)} style={{ backgroundColor: "#FDFBD8", color: "#C76C3F", border: "1px solid #C76C3F" }}><FaTimes className="me-1" /> Cancel</Button>
            <Button
              onClick={assignStaffHandler}
              disabled={!selectedAssignStaff || loadingAssign}
              style={{ backgroundColor: "#C76C3F", color: "#FDFBD8", border: "none" }}
            >
              {loadingAssign ? "Assigning..." : <><FaCheck className="me-1" /> Assign</>}
            </Button>

          </Modal.Footer>
        </div>
      </Modal>

      {/* Info Modal */}
      <Modal show={showInfoModal} onHide={() => setShowInfoModal(false)} centered>
        <div style={{ backgroundColor: "#FDFBD8", borderRadius: "10px", padding: "20px", width: "100%" }}>
          <Modal.Header closeButton className="border-0">
            <Modal.Title style={{ color: "#C76C3F", fontWeight: "bold" }}>
              <FaBox className="me-2" /> Courier Details
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {selectedCourier && (
              <div>
                <p><FaUserAlt /> <strong>Sender:</strong> {selectedCourier.sender.name}</p>
                <p><FaMapMarkerAlt /> <strong>Sender Address:</strong> {selectedCourier.sender.address}, {selectedCourier.sender.pincode}</p>
                <p><FaMapMarkerAlt /> <strong>Origin Branch:</strong> {selectedCourier.originBranch}</p>

                <p><FaUserAlt /> <strong>Receiver:</strong> {selectedCourier.receiver.name}</p>
                <p><FaPhoneAlt /> <strong>Receiver Mobile:</strong> {selectedCourier.receiver.phone}</p>
                <p><FaMapMarkerAlt /> <strong>Receiver Address:</strong> {selectedCourier.receiver.address}, {selectedCourier.receiver.pincode}</p>
                <p><FaMapMarkerAlt /> <strong>Destination Branch:</strong> {selectedCourier.destinationBranch}</p>

                <p><FaBoxOpen /> <strong>Weight:</strong> {selectedCourier.weight} Kg</p>
                <p><FaTag /> <strong>Price:</strong> ₹{selectedCourier.price}</p>

                <p><FaTag /> <strong>Current Status:</strong> {selectedCourier.status}</p>
                {selectedCourier.unableReason && (
                  <p><FaTag /> <strong>Unable to Deliver Reason:</strong> {selectedCourier.unableReason}</p>
                )}

                {selectedCourier.distanceInKm && selectedCourier.createdAt && (
                  <p>
                    <FaCalendarAlt /> <strong>Expected Delivery:</strong>{" "}
                    {(() => {
                      const deliveryDays = Math.ceil(selectedCourier.distanceInKm / 500) + 1;
                      const estimatedDate = new Date(selectedCourier.createdAt);
                      estimatedDate.setDate(estimatedDate.getDate() + deliveryDays);
                      const dd = String(estimatedDate.getDate()).padStart(2, "0");
                      const mm = String(estimatedDate.getMonth() + 1).padStart(2, "0");
                      const yyyy = estimatedDate.getFullYear();
                      return `${dd}-${mm}-${yyyy}`;
                    })()}
                  </p>
                )}
                {selectedCourier.status === "Delivered" && (
                  <p>
                    <FaUserCheck /> <strong>Handled By:</strong> {selectedCourier.handledBy}
                  </p>
                )}
                {selectedCourier.status?.toLowerCase() === "delivered" && selectedCourier.deliveryDate && (
                  <p style={{ color: "#28a745" }}>
                    <FaCheckCircle /> <strong>Delivered On:</strong>{" "}
                    {(() => {
                      const d = new Date(selectedCourier.deliveryDate);
                      const dd = String(d.getDate()).padStart(2, "0");
                      const mm = String(d.getMonth() + 1).padStart(2, "0");
                      const yyyy = d.getFullYear();
                      return `${dd}-${mm}-${yyyy}`;
                    })()}
                  </p>
                )}
                
              </div>
            )}
          </Modal.Body>

          <Modal.Footer className="border-0">
            <Button onClick={() => setShowInfoModal(false)} style={{ backgroundColor: "#C76C3F", color: "#FDFBD8", border: "none" }}>Close</Button>
          </Modal.Footer>
        </div>
      </Modal>

      {/* OTP Modal */}
      <Modal show={showOtpModal} onHide={() => setShowOtpModal(false)} centered>
        <Modal.Header
          closeButton
          style={{
            backgroundColor: "#FDFBD8",
            borderBottom: "1px solid #C76C3F",
          }}
        >
          <Modal.Title style={{ color: "#C76C3F", fontWeight: "bold" }}>
            Enter Delivery OTP
          </Modal.Title>
        </Modal.Header>

        <Modal.Body style={{ backgroundColor: "#FDFBD8" }}>
          <div className="mb-3">
            <label
              style={{
                color: "#C76C3F",
                fontWeight: "500",
                marginBottom: "10px",
              }}
            >
              Enter the 6-digit OTP sent to your email
            </label>
            <input
              type="text"
              placeholder="Enter 6-digit OTP"
              className="form-control"
              style={{ boxShadow: "none", border: "1px solid #C76C3F" }}
              value={otpInput}
              onChange={(e) => {
                setOtpInput(e.target.value);
                setOtpError("");
              }}
              maxLength={6}
            />
            {otpError && (
              <div className="text-danger mt-2" style={{ fontWeight: "500" }}>
                {otpError}
              </div>
            )}
          </div>

          <div className="text-end">
            <button
              type="button"
              className="btn"
              style={{
                color: "#C76C3F",
                fontWeight: "bold",
                textDecoration: "underline",
                background: "none",
                border: "none",
              }}
              onClick={handleResendOtp}
              disabled={resendingOtp}
            >
              {resendingOtp ? "Resending..." : "Resend OTP"}
            </button>
          </div>
        </Modal.Body>

        <Modal.Footer
          style={{
            backgroundColor: "#FDFBD8",
            borderTop: "1px solid #C76C3F",
          }}
        >
          <Button
            variant="secondary"
            onClick={() => setShowOtpModal(false)}
            style={{ backgroundColor: "#C76C3F", border: "none" }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleOtpSubmit}
            style={{ backgroundColor: "#C76C3F", border: "none" }}
            disabled={verifyingOtp}
          >
            {verifyingOtp ? "Verifying..." : "Submit OTP"}
          </Button>
        </Modal.Footer>
      </Modal>

    </div>
  );
};

// Reusable styles
const selectStyles = {
  control: (base, state) => ({
    ...base,
    borderColor: "#C76C3F",
    boxShadow: state.isFocused ? "0 0 0 0.2rem rgba(199, 108, 63, 0.25)" : "none",
    "&:hover": { borderColor: "#C76C3F" },
  }),
  option: (base, state) => ({
    ...base,
    backgroundColor: state.isFocused ? "#F5DCCB" : "#fff",
    color: "#000",
    cursor: "pointer",
  }),
  menu: (base) => ({ ...base, zIndex: 9999 }),
};

const dateInputStyle = {
  borderColor: "#C76C3F",
  boxShadow: "none",
  transition: "border-color 0.2s, box-shadow 0.2s",
};

export default ViewReceivedCouriers;
