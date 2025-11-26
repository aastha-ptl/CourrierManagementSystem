import React, { useState, useEffect } from "react";
import { Card, Row, Col, Spinner, Form } from "react-bootstrap";
import { BsBarChartFill } from "react-icons/bs";
import axios from "axios";
import Select from "react-select";
import { Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend);

const Analytics = () => {
  const [loading, setLoading] = useState(true);
  const [focusedField, setFocusedField] = useState("");
  const [branches, setBranches] = useState([]);
  const [branchOptions, setBranchOptions] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState({ value: "All", label: "All Branches" });
  const [courierStats, setCourierStats] = useState({
    delivered: 0,
    inTransit: 0,
    booked: 0,
    unableToDeliver: 0,
    outForDelivery: 0,
    receivedAtDestination: 0,
    total: 0,
  });

  useEffect(() => {
    fetchBranches();
    fetchCourierStats();
  }, []);

  useEffect(() => {
    if (branchOptions.length > 0 && selectedBranch) {
      fetchCourierStats();
    }
  }, [selectedBranch]);

  const fetchBranches = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:5000/api/branches/getallbranchesname", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBranches(res.data);
      const options = res.data.map((branch) => ({
        value: branch._id,
        label: branch.branchName,
      }));
      setBranchOptions([{ value: "All", label: "All Branches" }, ...options]);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching branches", err);
      setLoading(false);
    }
  };

  const fetchCourierStats = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const params = {};
      if (selectedBranch?.value && selectedBranch.value !== "All") {
        params.branch = selectedBranch.value;
      }
      
      const res = await axios.get("http://localhost:5000/api/analytics/courier-status", {
        headers: { Authorization: `Bearer ${token}` },
        params,
      });

      setCourierStats(res.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching courier stats:", error);
      setLoading(false);
    }
  };

  const chartData = {
    labels: ["Delivered", "In Transit", "Booked", "Unable to Deliver", "Out for Delivery", "Received at Destination"],
    datasets: [
      {
        label: "Couriers",
        data: [
          courierStats.delivered,
          courierStats.inTransit,
          courierStats.booked,
          courierStats.unableToDeliver,
          courierStats.outForDelivery,
          courierStats.receivedAtDestination,
        ],
        backgroundColor: [
          "#28a745", // Green for Delivered
          "#007bff", // Blue for In Transit
          "#ffc107", // Yellow for Booked
          "#dc3545", // Red for Unable to Deliver
          "#17a2b8", // Cyan for Out for Delivery
          "#6f42c1", // Purple for Received at Destination
        ],
        borderColor: [
          "#28a745",
          "#007bff",
          "#ffc107",
          "#dc3545",
          "#17a2b8",
          "#6f42c1",
        ],
        borderWidth: 2,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          padding: 20,
          font: {
            size: 14,
          },
        },
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            const label = context.label || "";
            const value = context.parsed || 0;
            const total = courierStats.total;
            const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
            return `${label}: ${value} (${percentage}%)`;
          },
        },
      },
    },
  };

  const selectStyles = {
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
  };

  return (
    <div className="container-fluid">
      <h3 className="fw-bold mb-4 mt-2" style={{ color: "#C76C3F" }}>
        <BsBarChartFill className="me-2" />
        Analytics Dashboard
      </h3>

      {/* Branch Selection Filter */}
      <Card className="shadow-sm border-0 mb-4" style={{ backgroundColor: "#FDFBD8" }}>
        <Card.Body>
          <Form>
            <Row>
              <Col md={4}>
                <Form.Group controlId="branch">
                  <Form.Label className="fw-semibold">Select Branch</Form.Label>
                  <Select
                    options={branchOptions}
                    value={selectedBranch}
                    onChange={(option) => setSelectedBranch(option)}
                    placeholder="Select branch"
                    styles={selectStyles}
                    onFocus={() => setFocusedField("branch")}
                    onBlur={() => setFocusedField("")}
                  />
                </Form.Group>
              </Col>
            </Row>
          </Form>
        </Card.Body>
      </Card>

      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" style={{ color: "#C76C3F" }} />
          <p className="mt-3">Loading analytics...</p>
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <Row className="mb-4">
            <Col md={3} sm={6} className="mb-3">
              <Card className="shadow-sm border-0 h-100" style={{ backgroundColor: "#FDFBD8" }}>
                <Card.Body className="text-center">
                  <h2 className="fw-bold" style={{ color: "#28a745" }}>
                    {courierStats.delivered}
                  </h2>
                  <p className="mb-0 text-muted">Delivered</p>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3} sm={6} className="mb-3">
              <Card className="shadow-sm border-0 h-100" style={{ backgroundColor: "#FDFBD8" }}>
                <Card.Body className="text-center">
                  <h2 className="fw-bold" style={{ color: "#007bff" }}>
                    {courierStats.inTransit}
                  </h2>
                  <p className="mb-0 text-muted">In Transit</p>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3} sm={6} className="mb-3">
              <Card className="shadow-sm border-0 h-100" style={{ backgroundColor: "#FDFBD8" }}>
                <Card.Body className="text-center">
                  <h2 className="fw-bold" style={{ color: "#ffc107" }}>
                    {courierStats.booked}
                  </h2>
                  <p className="mb-0 text-muted">Booked</p>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3} sm={6} className="mb-3">
              <Card className="shadow-sm border-0 h-100" style={{ backgroundColor: "#FDFBD8" }}>
                <Card.Body className="text-center">
                  <h2 className="fw-bold" style={{ color: "#dc3545" }}>
                    {courierStats.unableToDeliver}
                  </h2>
                  <p className="mb-0 text-muted">Unable to Deliver</p>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3} sm={6} className="mb-3">
              <Card className="shadow-sm border-0 h-100" style={{ backgroundColor: "#FDFBD8" }}>
                <Card.Body className="text-center">
                  <h2 className="fw-bold" style={{ color: "#17a2b8" }}>
                    {courierStats.outForDelivery}
                  </h2>
                  <p className="mb-0 text-muted">Out for Delivery</p>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3} sm={6} className="mb-3">
              <Card className="shadow-sm border-0 h-100" style={{ backgroundColor: "#FDFBD8" }}>
                <Card.Body className="text-center">
                  <h2 className="fw-bold" style={{ color: "#6f42c1" }}>
                    {courierStats.receivedAtDestination}
                  </h2>
                  <p className="mb-0 text-muted">Received at Destination</p>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Pie Chart */}
          <Row>
            <Col md={12}>
              <Card className="shadow-sm border-0" style={{ backgroundColor: "#FDFBD8" }}>
                <Card.Body>
                  <h5 className="fw-bold mb-4" style={{ color: "#C76C3F" }}>
                    Courier Status Breakdown
                  </h5>
                  <div style={{ maxWidth: "500px", margin: "0 auto" }}>
                    <Pie data={chartData} options={chartOptions} />
                  </div>
                  <div className="text-center mt-4">
                    <h4 className="fw-bold" style={{ color: "#C76C3F" }}>
                      Total Couriers: {courierStats.total}
                    </h4>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </>
      )}
    </div>
  );
};

export default Analytics;
