import React, { useState, useEffect } from "react";
import { Table, Form, Row, Col, Spinner } from "react-bootstrap";
import { Send } from "react-bootstrap-icons";
import { FaDownload } from "react-icons/fa";
import Select from "react-select";
import axios from "axios";

const SentCouriers = () => {
  const [couriers, setCouriers] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchTrackingId, setSearchTrackingId] = useState("");

  const statuses = [
    "All",
    "Booked",
    "In Transit",
    "Received at Destination Branch",
    "Out for Delivery",
    "Delivered",
    "Unable to Deliver",
  ];

  // Options for the status change dropdown
  const statusOptions = statuses
    .filter((s) => s !== "All")
    .map((status) => ({ value: status, label: status }));

  // Define status flow (to disable backward updates)
  const statusFlow = [
    "Booked",
    "In Transit",
    "Received at Destination Branch",
    "Out for Delivery",
    "Delivered",
    "Unable to Deliver",
  ];

  const fetchCouriers = async () => {
    try {
      setLoading(true);
      const response = await axios.get("http://localhost:5000/api/couriers/sent", {
        params: { status: selectedStatus, dateFrom, dateTo },
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setCouriers(response.data);
    } catch (err) {
      console.error("Failed to fetch sent couriers:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCouriers();
  }, [selectedStatus, dateFrom, dateTo]);

  const updateStatusHandler = async (courierId, newStatus) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `http://localhost:5000/api/couriers/update-status/${courierId}`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCouriers((prev) =>
        prev.map((c) =>
          c._id === courierId ? { ...c, status: newStatus } : c
        )
      );
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  // Filter couriers by search input
  const filteredCouriers = couriers.filter((courier) =>
    courier.trackingId.toLowerCase().includes(searchTrackingId.toLowerCase())
  );

  const filterSummary = () => {
    const statusText = selectedStatus !== "All" ? `Status: ${selectedStatus}` : "";
    const dateFromText = dateFrom ? `From: ${new Date(dateFrom).toLocaleDateString()}` : "";
    const dateToText = dateTo ? `To: ${new Date(dateTo).toLocaleDateString()}` : "";
    const filters = [statusText, dateFromText, dateToText].filter(Boolean);
    return filters.length ? `Filtered by - ${filters.join(", ")}` : "Showing all sent couriers.";
  };

  const style = document.createElement("style");
  style.innerHTML = `
    .custom-thead th {
      background-color: #C76C3F !important;
      color: white !important;
    }
  `;
  document.head.appendChild(style);

  return (
    <div className="container">
      <h3 className="fw-bold mb-3 d-flex align-items-center" style={{ color: "#C76C3F" }}>
        <Send size={24} className="me-2 text-secondary" />
        Sent Couriers
      </h3>

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
      <Row className="mb-1">
        <Col md={4}>
          <Form.Label><strong>Status</strong></Form.Label>
          <Select
            options={statuses.map((status) => ({ value: status, label: status }))}
            value={{ value: selectedStatus, label: selectedStatus }}
            onChange={(selected) => setSelectedStatus(selected.value)}
            isSearchable
            styles={selectStyles}
          />
        </Col>
        <Col md={4}>
          <Form.Label><strong>Date From</strong></Form.Label>
          <Form.Control
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            style={dateInputStyle}
          />
        </Col>
        <Col md={4}>
          <Form.Label><strong>Date To</strong></Form.Label>
          <Form.Control
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            style={dateInputStyle}
          />
        </Col>
      </Row>

      <Row className="mb-3">
        <Col>
          <div style={{ fontStyle: "italic", color: "#555" }}>{filterSummary()}</div>
        </Col>
      </Row>

      {loading ? (
        <div className="text-center my-5">
          <Spinner animation="border" variant="primary" />
        </div>
      ) : (
        <Table bordered responsive>
          <thead className="custom-thead">
            <tr>
              <th>Tracking ID</th>
              <th>Sender</th>
              <th>Receiver</th>
              <th>Destination</th>
              <th>Status</th>
              <th>Date Sent</th>
              <th>Delivered At</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredCouriers.length === 0 ? (
              <tr>
                <td colSpan="8" className="text-center">No sent couriers found.</td>
              </tr>
            ) : (
              filteredCouriers.map((courier) => (
                <tr key={courier._id}>
                  <td>{courier.trackingId}</td>
                  <td>{courier.sender?.name || "-"}</td>
                  <td>{courier.receiver?.name || "-"}</td>
                  <td>{courier.destinationBranch?.branchName || "-"}</td>
                  <td>
                    <Select
                      value={statusOptions.find(opt => opt.value === courier.status)}
                      onChange={(selectedOption) => {
                        const newStatus = selectedOption.value;
                        updateStatusHandler(courier._id, newStatus);
                      }}
                      options={statusOptions.map(opt => ({
                        ...opt,
                        isDisabled:
                          // Disable if moving backwards in status flow
                          statusFlow.indexOf(opt.value) < statusFlow.indexOf(courier.status),
                      }))}
                      styles={{
                        ...selectStyles,
                        option: (base, state) => ({
                          ...base,
                          backgroundColor: state.isFocused
                            ? "#F5DCCB"
                            : state.data.isDisabled
                              ? "#f0f0f0"
                              : "#fff",
                          color: state.data.isDisabled ? "#a0a0a0" : "#000",
                          cursor: state.data.isDisabled ? "not-allowed" : "pointer",
                        }),
                      }}
                      menuPlacement="auto"
                      menuPosition="fixed"
                      className="w-100"
                    />

                  </td>
                  <td>{new Date(courier.createdAt).toLocaleDateString()}</td>
                  <td>
                    {courier.deliveredAt
                      ? new Date(courier.deliveredAt).toLocaleDateString()
                      : "-"}
                  </td>
                  <td>
                    <a
                      className="btn"
                      style={{
                        backgroundColor: "#fff",
                        color: "#C76C3F",
                        border: "1px solid #C76C3F",
                        padding: "0px 3px",
                        borderRadius: "6px",
                        fontWeight: "500",
                        display: "inline-flex",
                        alignItems: "center",
                        fontSize: "14px",
                      }}
                      href={`http://localhost:5000/receipts/${courier.trackingId}.pdf`}
                      download={`${courier.trackingId}.pdf`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <FaDownload className="" style={{ color: "#C76C3F" }} />
                      View & Download
                    </a>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      )}
    </div>
  );
};

// Styles
const selectStyles = {
  control: (base, state) => ({
    ...base,
    borderColor: "#C76C3F",
    boxShadow: state.isFocused
      ? "0 0 0 0.2rem rgba(199, 108, 63, 0.25)"
      : "none",
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

export default SentCouriers;
