import React, { useState, useEffect } from "react";
import { Table, Row, Col, Form, Modal, Button } from "react-bootstrap";
import Select from "react-select";
import { FaShippingFast } from "react-icons/fa";
import Footer from "../Mainpages/Footer";
import { BoxSeam, PeopleFill } from "react-bootstrap-icons";

import axios from "axios";
import {
  FaBox,
  FaUserAlt,
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaBoxOpen,
  FaTag,
  FaCalendarAlt,
  FaUserCheck,
  FaCheckCircle
} from "react-icons/fa";


const AssignedCouriers = () => {
  const [couriers, setCouriers] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState("All");

  // OTP modal states
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpInput, setOtpInput] = useState("");
  const [otpError, setOtpError] = useState("");
  const [selectedCourierId, setSelectedCourierId] = useState(null);
  const [submittingOtp, setSubmittingOtp] = useState(false);
  const [resendingOtp, setResendingOtp] = useState(false);

  // Unable to Deliver modal states
  const [showUnableModal, setShowUnableModal] = useState(false);
  const [unableReason, setUnableReason] = useState("");
  const [unableError, setUnableError] = useState("");
  const [submittingUnableReason, setSubmittingUnableReason] = useState(false);

  // Courier Details modal states
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [selectedCourier, setSelectedCourier] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");



  // Status filter dropdown options
  const statusFilterOptions = [
    { value: "All", label: "All" },
    { value: "Out for Delivery", label: "Out for Delivery" },
    { value: "Delivered", label: "Delivered" },
    { value: "Unable to Deliver", label: "Unable to Deliver" },
  ];

  // Row status change options
  const rowStatusOptions = [
    { value: "Out for Delivery", label: "Out for Delivery" },
    { value: "Delivered", label: "Delivered" },
    { value: "Unable to Deliver", label: "Unable to Deliver" },
  ];

  // Fetch couriers
  useEffect(() => {
    const token = localStorage.getItem("token");
    axios
      .get("http://localhost:5000/api/couriers/assigned", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        const updatedCouriers = res.data.map((c) => {
          const deliveryDays = Math.ceil(c.distanceInKm / 500) + 1;
          const estimatedDate = new Date(c.createdAt);
          estimatedDate.setDate(estimatedDate.getDate() + deliveryDays);
          return {
            ...c,
            expectedDelivery: estimatedDate.toISOString().split("T")[0],
          };
        });
        setCouriers(updatedCouriers);
      })
      .catch((err) => console.error("Error fetching couriers:", err));
  }, []);

  // Filter change
  const handleFilterChange = (selected) => {
    setSelectedStatus(selected.value);
  };

  // Send OTP function
  const handleSendOtp = async () => {
    if (!selectedCourierId) return;
    setResendingOtp(true);
    const token = localStorage.getItem("token");
    try {
      await axios.post(
        `http://localhost:5000/api/couriers/${selectedCourierId}/send-otp`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("OTP has been resent to the receiver's email.");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to resend OTP");
    } finally {
      setResendingOtp(false);
    }
  };

  // Row status change
  const handleStatusChange = (trackingId, newStatus) => {
    const courierToUpdate = couriers.find((c) => c.trackingId === trackingId);
    if (!courierToUpdate?._id) return;

    if (newStatus === "Delivered") {
      setSelectedCourierId(courierToUpdate._id);
      setShowOtpModal(true);

      // Send OTP automatically when modal opens
      const token = localStorage.getItem("token");
      axios
        .post(
          `http://localhost:5000/api/couriers/${courierToUpdate._id}/send-otp`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        )
        .then(() => {
          alert("OTP sent to the receiver's email");
        })
        .catch((err) => {
          alert(err.response?.data?.message || "Failed to send OTP");
        });
    } else if (newStatus === "Unable to Deliver") {
      setSelectedCourierId(courierToUpdate._id);
      setShowUnableModal(true);
    } else {
      updateStatus(courierToUpdate._id, newStatus);
    }
  };

  // Update status API call
  const updateStatus = async (courierId, status, reason = null, otp = null) => {
    const token = localStorage.getItem("token");
    try {
      await axios.put(
        `http://localhost:5000/api/couriers/update-status/${courierId}`,
        { status, reason, otp },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCouriers((prev) =>
        prev.map((c) =>
          c._id === courierId
            ? { ...c, status, unableToDeliverReason: reason }
            : c
        )
      );
    } catch (err) {
      throw err;
    }
  };

  // Submit OTP
  const handleOtpSubmit = async () => {
    if (!otpInput.trim()) {
      setOtpError("Please enter OTP");
      return;
    }
    setSubmittingOtp(true);
    try {
      await updateStatus(selectedCourierId, "Delivered", null, otpInput);
      setShowOtpModal(false);
      setOtpInput("");
    } catch (err) {
      setOtpError(err.response?.data?.message || "Failed to verify OTP");
    } finally {
      setSubmittingOtp(false);
    }
  };

  // Submit Unable to Deliver reason
  const handleUnableSubmit = async () => {
    if (!unableReason.trim()) {
      setUnableError("Please enter a reason");
      return;
    }
    setSubmittingUnableReason(true);
    try {
      await updateStatus(selectedCourierId, "Unable to Deliver", unableReason);
      setShowUnableModal(false);
      setUnableReason("");
    } catch (err) {
      console.error("Error updating status:", err);
    } finally {
      setSubmittingUnableReason(false);
    }
  };

  const filteredCouriers = couriers.filter((c) => {
    const matchesStatus =
      selectedStatus === "All" || c.status === selectedStatus;
    const matchesSearch = c.trackingId
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const selectStyles = {
    control: (base, state) => ({
      ...base,
      borderColor: "#C76C3F",
      boxShadow: state.isFocused
        ? "0 0 0 0.2rem rgba(199, 108, 63, 0.25)"
        : "none",
      "&:hover": { borderColor: "#C76C3F" },
      minHeight: "30px",
      height: "30px",
      fontSize: "0.9rem",
    }),
    valueContainer: (base) => ({ ...base, height: "30px", padding: "0 6px" }),
    indicatorsContainer: (base) => ({ ...base, height: "30px" }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isFocused ? "#F5DCCB" : "#fff",
      color: "#000",
      cursor: "pointer",
      fontSize: "0.9rem",
    }),
    menu: (base) => ({ ...base, zIndex: 9999, fontSize: "0.9rem" }),
    singleValue: (base) => ({ ...base, lineHeight: "30px" }),
  };

  const sectionStyle = {
    backgroundColor: "#FDFBD8",
    minHeight: "100vh",
    padding: "40px 0",
    overflowX: "auto",
  };
  const headingStyle = {
    color: "#C76C3F",
    fontWeight: "700",
    fontSize: "2rem",
    maxWidth: "900px",
    margin: "0 auto",
  };
  const tableStyle = {
    maxWidth: "900px",
    margin: "0 auto",
    boxShadow: "0 0 15px rgba(0,0,0,0.1)",
    borderRadius: "10px",
    backgroundColor: "#FDFBD8",
    overflow: "visible",
  };

  const style = document.createElement("style");
  style.innerHTML = `.custom-thead th { background-color: #C76C3F !important; color: white !important; }`;
  document.head.appendChild(style);

  return (
    <>
      <div style={sectionStyle}>
        <h2
          className="text-center mb-4 d-flex align-items-center justify-content-center gap-2"
          style={headingStyle}
        >
          <FaShippingFast style={{ marginRight: "8px" }} /> Assigned Couriers
        </h2>

        {/* Status Filter */}
        <Row
          className="mb-3 justify-content-center"
          style={{
            maxWidth: "900px",
            margin: "0 auto",
            gap: "15px",
          }}
        >
          {/* Status Filter */}
          <Col xs={12} md={5}>
            <Form.Label>
              <strong>Status Filter</strong>
            </Form.Label>
            <Select
              options={statusFilterOptions}
              value={statusFilterOptions.find(
                (opt) => opt.value === selectedStatus
              )}
              onChange={handleFilterChange}
              isSearchable={false}
              styles={selectStyles}
              menuPortalTarget={document.body}
              menuPosition={"fixed"}
            />
          </Col>

          {/* Search Input */}
          <Col xs={12} md={5}>
            <Form.Label>
              <strong>Search by Tracking ID</strong>
            </Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter Tracking ID"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                borderColor: "#C76C3F",
                height: "30px",
                boxShadow: "0 0 0 0.2rem rgba(199, 108, 63, 0.25)",
                transition: "box-shadow 0.2s ease-in-out",
              }}
              onFocus={(e) =>
                (e.target.style.boxShadow = "0 0 0 0.2rem rgba(199, 108, 63, 0.25)")
              }
              onBlur={(e) =>
                (e.target.style.boxShadow = "none")
              }
            />

          </Col>
        </Row>

        {/* Table */}
        <Table bordered responsive style={tableStyle}>
          <thead className="custom-thead">
            <tr>
              <th>Tracking ID</th>
              <th>Sender</th>
              <th>Receiver</th>
              <th>Status</th>
              <th>Expected Delivery</th>
              <th>Details</th>
            </tr>
          </thead>
          <tbody>
            {filteredCouriers.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center p-4">
                  No assigned couriers found.
                </td>
              </tr>
            ) : (
              filteredCouriers.map((courier) => {
                const disabled =
                  courier.status === "Delivered" ||
                  courier.status === "Unable to Deliver";
                const selectedOption =
                  rowStatusOptions.find(
                    (opt) => opt.value === courier.status.trim()
                  ) || null;
                return (
                  <tr key={courier.trackingId}>
                    <td>{courier.trackingId}</td>
                    <td>{courier.sender?.name || courier.sender}</td>
                    <td>{courier.receiver?.name || courier.receiver}</td>
                    <td style={{ minWidth: "150px" }}>
                      <Select
                        options={rowStatusOptions}
                        value={selectedOption}
                        onChange={(selected) =>
                          handleStatusChange(courier.trackingId, selected.value)
                        }
                        isSearchable={false}
                        styles={selectStyles}
                        menuPortalTarget={document.body}
                        menuPosition={"fixed"}
                        placeholder="Select Status"
                        isDisabled={disabled}
                      />
                    </td>
                    <td>{courier.expectedDelivery}</td>
                    <td>
                      <Button
                        size="sm"
                        style={{ backgroundColor: "#C76C3F", border: "none" }}
                        onClick={() => {
                          setSelectedCourier(courier);
                          setShowInfoModal(true);
                        }}
                      >
                        View Details
                      </Button>
                    </td>

                  </tr>
                );
              })
            )}
          </tbody>
        </Table>
      </div>

      {/* OTP Modal */}
      <Modal
        show={showOtpModal}
        onHide={() => setShowOtpModal(false)}
        centered
      >
        <Modal.Header
          closeButton
          style={{
            backgroundColor: "#FDFBD8",
            borderBottom: "1px solid #C76C3F",
          }}
        >
          <Modal.Title style={{ color: "#C76C3F", fontWeight: "bold" }}>
            Verify OTP
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
              onClick={handleSendOtp}
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
            disabled={submittingOtp}
          >
            {submittingOtp ? "Verifying..." : "Submit OTP"}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Unable to Deliver Modal */}
      <Modal
        show={showUnableModal}
        onHide={() => setShowUnableModal(false)}
        centered
      >
        <Modal.Header
          closeButton
          style={{
            backgroundColor: "#FDFBD8",
            borderBottom: "1px solid #C76C3F",
          }}
        >
          <Modal.Title style={{ color: "#C76C3F", fontWeight: "bold" }}>
            Unable to Deliver
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
              Enter the reason for unable to deliver
            </label>
            <textarea
              className="form-control"
              style={{ boxShadow: "none", border: "1px solid #C76C3F" }}
              value={unableReason}
              onChange={(e) => {
                setUnableReason(e.target.value);
                setUnableError("");
              }}
            />
            {unableError && (
              <div className="text-danger mt-2" style={{ fontWeight: "500" }}>
                {unableError}
              </div>
            )}
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
            onClick={() => setShowUnableModal(false)}
            style={{ backgroundColor: "#C76C3F", border: "none" }}
          >
            Cancel
          </Button>

          <Button
            onClick={handleUnableSubmit} // ✅ fixed here
            style={{ backgroundColor: "#C76C3F", border: "none" }}
            disabled={submittingUnableReason}
          >
            {submittingUnableReason ? "Submitting..." : "Submit"}
          </Button>
        </Modal.Footer>
      </Modal>
      {/* info modal */}
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
                <p><FaMapMarkerAlt /> <strong>Origin Branch:</strong> {selectedCourier.originBranch?.branchName}</p>

                <p><FaUserAlt /> <strong>Receiver:</strong> {selectedCourier.receiver.name}</p>
                <p><FaPhoneAlt /> <strong>Receiver Mobile:</strong> {selectedCourier.receiver.phone}</p>
                <p><FaMapMarkerAlt /> <strong>Receiver Address:</strong> {selectedCourier.receiver.address}, {selectedCourier.receiver.pincode}</p>
                <p><FaMapMarkerAlt /> <strong>Destination Branch:</strong> {selectedCourier.destinationBranch?.branchName}</p>

                <p><FaBoxOpen /> <strong>Weight:</strong> {selectedCourier.weight} Kg</p>
                <p><FaTag /> <strong>Price:</strong> ₹{selectedCourier.price}</p>

                <p><FaTag /> <strong>Current Status:</strong> {selectedCourier.status}</p>
                {selectedCourier.unableToDeliverReason && (
                  <p><FaTag /> <strong>Unable to Deliver Reason:</strong> {selectedCourier.unableToDeliverReason}</p>
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

                {selectedCourier.status === "Delivered" && selectedCourier.handledBy && (
                  <p><FaUserCheck /> <strong>Handled By:</strong> {selectedCourier.handledBy}</p>
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
            <Button onClick={() => setShowInfoModal(false)} style={{ backgroundColor: "#C76C3F", color: "#FDFBD8", border: "none" }}>
              Close
            </Button>
          </Modal.Footer>
        </div>
      </Modal>


      <Footer />
    </>
  );
};
  
export default AssignedCouriers;
