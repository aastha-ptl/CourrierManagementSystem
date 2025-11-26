import React, { useState } from "react";
import { Table, Button, Form, Row, Col, Modal } from "react-bootstrap";
import { BoxSeam } from "react-bootstrap-icons";
import Select from "react-select";

const ViewAllCouriers = () => {
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [selectedStaff, setSelectedStaff] = useState({ value: "All", label: "All" });
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedCourier, setSelectedCourier] = useState(null);
  const [assignModal, setAssignModal] = useState(false);
  const [selectedCourierForAssign, setSelectedCourierForAssign] = useState(null);
  const [assignToStaff, setAssignToStaff] = useState(null);

  const statuses = ["All", "Pending", "In Transit", "Delivered"];
  const staffMembers = [
    { value: "Ravi Mehta", label: "Ravi Mehta" },
    { value: "Neha Patel", label: "Neha Patel" },
    { value: "Karan Shah", label: "Karan Shah" },
  ];
  const staffFilterOptions = [{ value: "All", label: "All" }, ...staffMembers];

  const [couriers, setCouriers] = useState([
    {
      id: 1,
      trackingId: "TRK12345",
      sender: "Ravi Mehta",
      receiver: "Neha Patel",
      status: "Pending",
      createdAt: "2025-05-20",
      handledBy: "Unassigned",
    },
    {
      id: 2,
      trackingId: "TRK67890",
      sender: "Neha Patel",
      receiver: "Karan Shah",
      status: "In Transit",
      createdAt: "2025-05-25",
      handledBy: "Neha Patel",
    },
    {
      id: 3,
      trackingId: "TRK54321",
      sender: "Karan Shah",
      receiver: "Ravi Mehta",
      status: "Delivered",
      createdAt: "2025-05-10",
      handledBy: "Unassigned",
    },
  ]);

  const filteredCouriers = couriers.filter((courier) => {
    const matchStatus = selectedStatus === "All" || courier.status === selectedStatus;
    const matchStaff = selectedStaff.value === "All" || courier.handledBy === selectedStaff.value;
    const matchDateFrom = dateFrom ? new Date(courier.createdAt) >= new Date(dateFrom) : true;
    const matchDateTo = dateTo ? new Date(courier.createdAt) <= new Date(dateTo) : true;
    return matchStatus && matchStaff && matchDateFrom && matchDateTo;
  });

  const handleView = (courier) => {
    setSelectedCourier(courier);
    setShowModal(true);
  };

  const handleAssign = () => {
    if (selectedCourierForAssign && assignToStaff) {
      const updated = couriers.map((courier) =>
        courier.id === selectedCourierForAssign.id
          ? { ...courier, handledBy: assignToStaff.value }
          : courier
      );
      setCouriers(updated);
      setAssignModal(false);
      setSelectedCourierForAssign(null);
      setAssignToStaff(null);
    }
  };

  const filterSummary = () => {
    const statusText = selectedStatus !== "All" ? `Status: ${selectedStatus}` : "";
    const staffText = selectedStaff.value !== "All" ? `Staff: ${selectedStaff.label}` : "";
    const dateFromText = dateFrom ? `From: ${new Date(dateFrom).toLocaleDateString()}` : "";
    const dateToText = dateTo ? `To: ${new Date(dateTo).toLocaleDateString()}` : "";

    const filters = [statusText, staffText, dateFromText, dateToText].filter(Boolean);
    return filters.length ? `Filtered by - ${filters.join(", ")}` : "Showing all couriers.";
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
        <BoxSeam size={24} className="me-2 text-secondary" />
        All Couriers
      </h3>

      <Row className="mb-1">
        <Col md={3}>
          <Form.Label><strong>Status</strong></Form.Label>
          <Select
            options={statuses.map((status) => ({ value: status, label: status }))}
            value={{ value: selectedStatus, label: selectedStatus }}
            onChange={(selected) => setSelectedStatus(selected.value)}
            isSearchable
            styles={selectStyles}
          />
        </Col>

        <Col md={3}>
          <Form.Label><strong>Staff</strong></Form.Label>
          <Select
            options={staffFilterOptions}
            value={selectedStaff}
            onChange={setSelectedStaff}
            isSearchable
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
            onFocus={(e) => e.target.style.boxShadow = focusShadow}
            onBlur={(e) => e.target.style.boxShadow = "none"}
          />
        </Col>

        <Col md={3}>
          <Form.Label><strong>Date To</strong></Form.Label>
          <Form.Control
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            style={dateInputStyle}
            onFocus={(e) => e.target.style.boxShadow = focusShadow}
            onBlur={(e) => e.target.style.boxShadow = "none"}
          />
        </Col>
      </Row>

      <Row className="mb-3">
        <Col>
          <div style={{ fontStyle: "italic", color: "#555" }}>{filterSummary()}</div>
        </Col>
      </Row>

      <Table bordered hover responsive>
        <thead className="custom-thead">
          <tr>
            <th>Tracking ID</th>
            <th>Sender</th>
            <th>Receiver</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredCouriers.length === 0 ? (
            <tr>
              <td colSpan="5" className="text-center">No couriers found.</td>
            </tr>
          ) : (
            filteredCouriers.map((courier) => (
              <tr key={courier.id}>
                <td>{courier.trackingId}</td>
                <td>{courier.sender}</td>
                <td>{courier.receiver}</td>
                <td>{courier.status}</td>
                <td>
                  <Button
                    variant="info"
                    size="sm"
                    className="me-2"
                    onClick={() => handleView(courier)}
                  >
                    View
                  </Button>
                  {courier.handledBy === "Unassigned" ? (
                    <Button
                      variant="warning"
                      size="sm"
                      onClick={() => {
                        setSelectedCourierForAssign(courier);
                        setAssignModal(true);
                      }}
                    >
                      Assign
                    </Button>
                  ) : (
                    <span className="badge bg-success">{courier.handledBy}</span>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </Table>

      {/* View Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Courier Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedCourier && (
            <>
              <p><strong>Tracking ID:</strong> {selectedCourier.trackingId}</p>
              <p><strong>Sender:</strong> {selectedCourier.sender}</p>
              <p><strong>Receiver:</strong> {selectedCourier.receiver}</p>
              <p><strong>Status:</strong> {selectedCourier.status}</p>
              <p><strong>Date:</strong> {selectedCourier.createdAt}</p>
              <p><strong>Handled By:</strong> {selectedCourier.handledBy}</p>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>Close</Button>
        </Modal.Footer>
      </Modal>

      {/* Assign Modal */}
      <Modal show={assignModal} onHide={() => setAssignModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Assign Courier</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group>
            <Form.Label><strong>Select Staff</strong></Form.Label>
            <Select
              options={staffMembers}
              value={assignToStaff}
              onChange={setAssignToStaff}
              isSearchable
              placeholder="Select staff"
              styles={selectStyles}
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setAssignModal(false)}>Cancel</Button>
          <Button variant="success" onClick={handleAssign} disabled={!assignToStaff}>
            Assign
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

// 🔸 Theming styles
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

const focusShadow = "0 0 0 0.2rem rgba(199, 108, 63, 0.25)";

export default ViewAllCouriers;
