import React, { useState, useEffect } from "react";
import { Table, Button, Form, Row, Col, Modal } from "react-bootstrap";
import Select from "react-select";
import { FiPackage } from "react-icons/fi";
import axios from "axios";
import { FaBox, FaTag, FaUserAlt, FaPhoneAlt, FaMapMarkerAlt, FaCalendarAlt, FaUserCheck, FaDownload } from "react-icons/fa";

const focusStyle = {
  borderColor: "#C76C3F",
  boxShadow: "0 0 0 0.2rem rgba(199, 108, 63, 0.25)",
};

const normalStyle = {
  borderColor: "#C76C3F",
  boxShadow: "none",
  transition: "border-color 0.2s, box-shadow 0.2s",
};

const DateInput = ({ value, onChange }) => {
  const [style, setStyle] = useState(normalStyle);

  return (
    <Form.Control
      type="date"
      value={value}
      onChange={onChange}
      style={style}
      onFocus={() => setStyle(focusStyle)}
      onBlur={() => setStyle(normalStyle)}
    />
  );
};

const ViewCouriers = () => {
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [selectedBranch, setSelectedBranch] = useState({ value: "All", label: "All" });
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedCourier, setSelectedCourier] = useState(null);
  const [couriers, setCouriers] = useState([]);
  const [branchOptions, setBranchOptions] = useState([]);
  const [searchTrackingId, setSearchTrackingId] = useState("");
  const statuses = [
    "All",
    "Booked",
    "In Transit",
    "Received at Destination Branch",
    "Out for Delivery",
    "Delivered",
    "Delivery Failed",
    "Returned to Origin"];


  // Fetch couriers from backend
  const fetchCouriers = async () => {
    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.get(
        "http://localhost:5000/api/couriers/all-couriers",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCouriers(data);
    } catch (error) {
      console.error("Error fetching couriers:", error);
    }
  };
  // Fetch branches for dropdown
  const fetchBranches = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/branches/getallbranchesname", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      const data = Array.isArray(res.data) ? res.data : [];
      const options = [
        { value: "All", label: "All" },
        ...data.map((b) => ({
          value: b._id,
          label: b.branchName,
        })),
      ];

      setBranchOptions(options);
      setSelectedBranch(options[0]);
    } catch (err) {
      console.error("Failed to fetch branches", err);
      const fallback = [{ value: "All", label: "All" }];
      setBranchOptions(fallback);
      setSelectedBranch(fallback[0]);
    }
  };
  useEffect(() => {
    fetchBranches();
  }, []);


  useEffect(() => {
    fetchCouriers();
  }, []);

  // Filter couriers
  const filteredCouriers = couriers.filter((courier) => {
    const matchStatus = selectedStatus === "All" || courier.status === selectedStatus;
    const matchBranch =
      selectedBranch.value === "All" ||
      courier.originBranch?.branchName === selectedBranch.label ||
      courier.destinationBranch?.branchName === selectedBranch.label;


    const matchDateFrom = dateFrom ? new Date(courier.createdAt) >= new Date(dateFrom) : true;
    const matchDateTo = dateTo ? new Date(courier.createdAt) <= new Date(dateTo) : true;


    const matchTrackingId = searchTrackingId
      ? courier.trackingId.toLowerCase().includes(searchTrackingId.toLowerCase())
      : true;

    return matchStatus && matchBranch && matchDateFrom && matchDateTo && matchTrackingId;
  });

  // Filter summary text
  const filterSummary = () => {
    const filters = [];
    if (selectedStatus !== "All") filters.push(`Status: ${selectedStatus}`);
    if (selectedBranch.value !== "All") filters.push(`Branch: ${selectedBranch.label}`);
    if (dateFrom) filters.push(`From: ${dateFrom}`);
    if (dateTo) filters.push(`To: ${dateTo}`);

    return filters.length > 0 ? `Filtered by ${filters.join(" and ")}` : "Showing all couriers";
  };

  const handleView = (courier) => {
    setSelectedCourier(courier);
    setShowModal(true);
  };

  // Inject style once on mount
  useEffect(() => {
    const style = document.createElement("style");
    style.innerHTML = `
      .custom-thead th {
        background-color: #C76C3F !important;
        color: white !important;
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return (
    <div className="container">
      <h3 className="fw-bold mb-3 mt-2 d-flex align-items-center" style={{ color: "#C76C3F" }}>
        <FiPackage size={32} className="me-2 text-secondary" />
        All Couriers
      </h3>
      <Row className="mb-3">
        <Col md={4}>
          <Form.Label>
            <strong>Search by Tracking ID</strong>
          </Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter tracking ID..."
            value={searchTrackingId}
            onChange={(e) => setSearchTrackingId(e.target.value)}
            style={{
              borderColor: "#C76C3F",
              boxShadow: "none",
            }}
          />
        </Col>
      </Row>
      <Row className="mb-1">
        <Col md={3}>
          <Form.Label><strong>Status</strong></Form.Label>
          <Select
            options={statuses.map((status) => ({ value: status, label: status }))}
            value={{ value: selectedStatus, label: selectedStatus }}
            onChange={(selected) => setSelectedStatus(selected.value)}
            isSearchable
            placeholder="Select status"
            styles={{
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
            }}
          />
        </Col>

        <Col md={3}>
          <Form.Label>
            <strong>Branch</strong>
          </Form.Label>
          <Select
            options={branchOptions}
            value={selectedBranch}
            onChange={setSelectedBranch}
            isSearchable
            placeholder="Select or search branch"
            styles={{
              control: (base, state) => ({
                ...base,
                borderColor: "#C76C3F",
                boxShadow: state.isFocused
                  ? "0 0 0 0.2rem rgba(199, 108, 63, 0.25)"
                  : "none",
                "&:hover": {
                  borderColor: "#C76C3F",
                },
              }),
              option: (base, state) => ({
                ...base,
                backgroundColor: state.isFocused ? "#F5DCCB" : "#fff",
                color: "#000",
                cursor: "pointer",
              }),
              menu: (base) => ({
                ...base,
                zIndex: 9999,
              }),
            }}
          />
        </Col>

        <Col md={3}>
          <Form.Label>
            <strong>Date From</strong>
          </Form.Label>
          <DateInput value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
        </Col>

        <Col md={3}>
          <Form.Label>
            <strong>Date To</strong>
          </Form.Label>
          <DateInput value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
        </Col>
      </Row>

      {/* Filter summary */}
      <Row className="mb-3">
        <Col>
          <div style={{ fontStyle: "italic", color: "#555" }}>{filterSummary()}</div>
        </Col>
      </Row>

      <Table bordered responsive>
        <thead className="custom-thead">
          <tr>
            <th>Tracking ID</th>
            <th>Origin Branch</th>
            <th>Destination Branch</th>
            <th>Created By</th>
            <th>Handled By</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredCouriers.length === 0 ? (
            <tr>
              <td colSpan="6" className="text-center">
                No couriers found.
              </td>
            </tr>
          ) : (
            filteredCouriers.map((courier) => (
              <tr key={courier._id}>
                <td>{courier.trackingId}</td>
                <td>{courier.originBranch?.branchName}</td>
                <td>{courier.destinationBranch?.branchName}</td>
                <td>{courier.createdBy?.name}</td>
                <td>{courier.assignedStaff?.name || "Unassigned"}</td>
                <td>{courier.status}</td>
                <td>
                  <Button
                    variant="info"
                    size="sm"
                    style={{
                      backgroundColor: "#C76C3F",
                      border: "none",
                      color: "#FDFBD8"
                    }}
                    onClick={() => handleView(courier)}
                  >
                    Show Info
                  </Button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </Table>

      {/* Modal for courier details */}
      <Modal
        show={showModal}
        onHide={() => setShowModal(false)}
        centered
        style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
      >
        <div
          style={{
            backgroundColor: "#FDFBD8",
            borderRadius: "10px",
            padding: "20px",
            width: "100%",
          }}
        >
          <Modal.Header closeButton className="border-0">
            <Modal.Title style={{ color: "#C76C3F", fontWeight: "bold" }}>
              <FaBox className="me-2" /> Courier Details
            </Modal.Title>
          </Modal.Header>

          <Modal.Body style={{ lineHeight: "1.8", color: "#333" }}>
            {selectedCourier && (
              <>
                <p><strong><FaTag className="me-2" />Tracking ID:</strong> {selectedCourier.trackingId}</p>
                <p><strong><FaUserAlt className="me-2" />Sender:</strong> {selectedCourier.sender.name}</p>
                <p><strong><FaUserAlt className="me-2" />Receiver:</strong> {selectedCourier.receiver.name}</p>
                <p><strong><FaMapMarkerAlt className="me-2" />Origin Branch:</strong> {selectedCourier.originBranch?.branchName}</p>
                <p><strong><FaMapMarkerAlt className="me-2" />Destination Branch:</strong> {selectedCourier.destinationBranch?.branchName}</p>
                <p><strong><FaUserAlt className="me-2" />Created By:</strong> {selectedCourier.createdBy?.name}</p>
                <p><strong><FaUserCheck className="me-2" />Handled By:</strong> {selectedCourier.assignedStaff?.name || "Unassigned"}</p>
                <p><strong><FaTag className="me-2" />Status:</strong> {selectedCourier.status}</p>
                <p><strong><FaCalendarAlt className="me-2" />Created At:</strong> {new Date(selectedCourier.createdAt).toLocaleString()}</p>
                <p><strong><FaCalendarAlt className="me-2" />Delivered At:</strong> {selectedCourier.deliveredAt || "-"}</p>


                <a
                  className="btn mt-3"
                  style={{
                    backgroundColor: "#C76C3F",
                    color: "#FDFBD8",
                    border: "none",
                    padding: "6px 12px",
                    borderRadius: "6px",
                    fontWeight: "500",
                    display: "inline-flex",
                    alignItems: "center",
                    fontSize: "14px",
                  }}
                  href={`http://localhost:5000/receipts/${selectedCourier.trackingId}.pdf`}
                  download={`${selectedCourier.trackingId}.pdf`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <FaDownload className="me-2" style={{ color: "#FDFBD8" }} />
                  View & Download Receipt
                </a>
              </>
            )}
          </Modal.Body>
        </div>
      </Modal>

    </div>
  );
};

export default ViewCouriers;
