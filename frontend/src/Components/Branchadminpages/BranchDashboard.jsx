import React from "react";
import { useEffect, useState } from "react";
import axios from "axios";
import { Card, Spinner, Row, Col } from "react-bootstrap";
import { BsBuildingGear, BsBarChartFill, BsCurrencyRupee } from "react-icons/bs";
import {
  PersonBadgeFill,
  BoxSeam,
  TruckFlatbed,
  CheckCircleFill,
} from "react-bootstrap-icons";
import { Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  Title,
} from "chart.js";

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend, Title);

const BranchAdminDashboard = ({ stats }) => {
  const {
    totalStaff = 20,
    totalCouriers = 100,
    inTransit = 30,
    delivered = 50,
  } = stats || {};

  const [loading, setLoading] = useState(true);
  const [courierStats, setCourierStats] = useState({
    delivered: 0,
    inTransit: 0,
    booked: 0,
    unableToDeliver: 0,
    outForDelivery: 0,
    receivedAtDestination: 0,
    total: 0,
  });
  const [staffCount, setStaffCount] = useState(0);
  const [branchName, setBranchName] = useState("");
  const [transactionData, setTransactionData] = useState({
    totalTransactions: 0,
    totalAmount: 0,
  });

  useEffect(() => {
    fetchBranchCourierStats();
    fetchStaffCount();
  }, []);

  const fetchBranchCourierStats = async () => {
    try {
      const token = localStorage.getItem("token");
      let userStr = localStorage.getItem("user");
      
      console.log("=== Frontend Debug ===");
      console.log("Token exists:", !!token);
      console.log("User string:", userStr);
      
      if (!userStr) {
        console.error("No user data found in localStorage");
        setLoading(false);
        return;
      }
      
      let user = JSON.parse(userStr);
      console.log("Parsed user:", user);
      console.log("User branch:", user.branch);
      
      // If branch is not in localStorage, fetch from profile API
      if (!user.branch) {
        console.log("Branch not found in localStorage, fetching from profile API...");
        try {
          const profileRes = await axios.get('http://localhost:5000/api/auth/profile', {
            headers: { Authorization: `Bearer ${token}` },
          });
          user = profileRes.data;
          // Update localStorage with complete user data
          localStorage.setItem("user", JSON.stringify(user));
          console.log("Updated user from profile:", user);
          
          // Set branch name
          if (user.branch && user.branch.branchName) {
            setBranchName(user.branch.branchName);
          }
        } catch (profileError) {
          console.error("Error fetching profile:", profileError);
          alert("Please log out and log in again to update your session.");
          setLoading(false);
          return;
        }
      }
      
      // Set branch name from user object
      const branchId = user.branch?._id || user.branch;
      if (user.branch && user.branch.branchName) {
        setBranchName(user.branch.branchName);
      } else if (branchId) {
        // Fetch branch details if branchName is not available
        try {
          const branchRes = await axios.get(`http://localhost:5000/api/branches/getallbranchesname`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const branch = branchRes.data.find(b => b._id === branchId);
          if (branch && branch.branchName) {
            setBranchName(branch.branchName);
          }
        } catch (branchError) {
          console.error("Error fetching branch details:", branchError);
        }
      }
      
      if (!branchId) {
        console.error("No branch ID found for user");
        alert("Your account is not assigned to any branch. Please contact the administrator.");
        setLoading(false);
        return;
      }
      
      const url = `http://localhost:5000/api/analytics/branch-courier-status/${branchId}`;
      console.log("Fetching from URL:", url);
      
      const res = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log("Branch Courier Stats Response:", res.data);
      
      setCourierStats({
        delivered: res.data.delivered || 0,
        inTransit: res.data.inTransit || 0,
        booked: res.data.booked || 0,
        unableToDeliver: res.data.unableToDeliver || 0,
        outForDelivery: res.data.outForDelivery || 0,
        receivedAtDestination: res.data.receivedAtDestination || 0,
        total: res.data.total || 0,
      });
      
      // Fetch transaction data for this branch
      await fetchTransactionData(branchId, token);
      
      setLoading(false);
    } catch (error) {
      console.error("Error fetching branch courier stats:", error);
      console.error("Error response:", error.response?.data);
      console.error("Error status:", error.response?.status);
      console.error("Full error:", error.message);
      setLoading(false);
    }
  };

  const fetchTransactionData = async (branchId, token) => {
    try {
      const res = await axios.get('http://localhost:5000/api/analytics/transaction-analytics', {
        headers: { Authorization: `Bearer ${token}` },
        params: { branch: branchId },
      });
      
      if (res.data.success) {
        setTransactionData({
          totalTransactions: res.data.totalTransactions || 0,
          totalAmount: res.data.totalAmount || 0,
        });
      }
    } catch (error) {
      console.error("Error fetching transaction data:", error);
    }
  };

  const fetchStaffCount = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get('http://localhost:5000/api/auth/staff-by-branch', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStaffCount(res.data.length || 0);
    } catch (error) {
      console.error("Error fetching staff count:", error);
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

  return (
    <div className="container-fluid">
      <h3
        className="mb-4 fw-bold d-flex align-items-center"
        style={{ color: "#C76C3F" }}
       
      >
        <BsBuildingGear size={28} className="me-2 text-secondary" />
        Branch Admin Dashboard
        {branchName && (
          <span className="ms-3 badge" style={{ backgroundColor: "#C76C3F", fontSize: "0.9rem" }}>
            {branchName}
          </span>
        )}
      </h3>


      <div className="row g-4">
        {/* Total Staff */}
        <div className="col-md-6 col-lg-3">
          <Card
            className="bg-danger-subtle text-dark shadow-sm text-center h-100"
            style={{ minHeight: "200px" }}
          >
            <Card.Body className="d-flex flex-column align-items-center justify-content-center h-100">
              <PersonBadgeFill size={50} className="text-danger mb-3" />
              <Card.Title>Total Staff</Card.Title>
              <Card.Text className="fs-4 fw-semibold">{staffCount}</Card.Text>
            </Card.Body>
          </Card>
        </div>

        {/* Total Couriers */}
        <div className="col-md-6 col-lg-3">
          <Card
            className="bg-primary-subtle text-dark shadow-sm text-center h-100"
            style={{ minHeight: "200px" }}
          >
            <Card.Body className="d-flex flex-column align-items-center justify-content-center h-100">
              <BoxSeam size={50} className="text-primary mb-3" />
              <Card.Title>Total Couriers</Card.Title>
              <Card.Text className="fs-4 fw-semibold">{courierStats.total || 0}</Card.Text>
            </Card.Body>
          </Card>
        </div>

        {/* In Transit Couriers */}
        <div className="col-md-6 col-lg-3">
          <Card
            className="bg-warning-subtle text-dark shadow-sm text-center h-100"
            style={{ minHeight: "200px" }}
          >
            <Card.Body className="d-flex flex-column align-items-center justify-content-center h-100">
              <TruckFlatbed size={50} className="text-warning mb-3" />
              <Card.Title>In Transit</Card.Title>
              <Card.Text className="fs-4 fw-semibold">{courierStats.inTransit || 0}</Card.Text>
            </Card.Body>
          </Card>
        </div>

        {/* Delivered Couriers */}
        <div className="col-md-6 col-lg-3">
          <Card
            className="bg-success-subtle text-dark shadow-sm text-center h-100"
            style={{ minHeight: "200px" }}
          >
            <Card.Body className="d-flex flex-column align-items-center justify-content-center h-100">
              <CheckCircleFill size={50} className="text-success mb-3" />
              <Card.Title>Delivered</Card.Title>
              <Card.Text className="fs-4 fw-semibold">{courierStats.delivered || 0}</Card.Text>
            </Card.Body>
          </Card>
        </div>
      </div>

      {/* Courier Status Analytics Section */}
      <div className="row mt-5">
        <div className="col-12">
          <h4 className="mb-3 fw-bold d-flex align-items-center" style={{ color: "#C76C3F" }}>
            <BsBarChartFill size={24} className="me-2" />
            Courier Status Analytics
          </h4>
        </div>
      </div>

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

          {/* Transaction Summary Section */}
          <div className="row mt-5">
            <div className="col-12">
              <h4 className="mb-3 fw-bold d-flex align-items-center" style={{ color: "#C76C3F" }}>
                <BsCurrencyRupee size={24} className="me-2" />
                Transaction Summary
              </h4>
            </div>
          </div>

          <Row className="mb-4">
            <Col md={6} className="mb-3">
              <Card className="shadow-sm border-0 h-100" style={{ backgroundColor: "#FDFBD8" }}>
                <Card.Body className="text-center">
                  <h2 className="fw-bold" style={{ color: "#C76C3F" }}>
                    {transactionData.totalTransactions}
                  </h2>
                  <p className="mb-0 text-muted">Total Transactions</p>
                </Card.Body>
              </Card>
            </Col>
            <Col md={6} className="mb-3">
              <Card className="shadow-sm border-0 h-100" style={{ backgroundColor: "#FDFBD8" }}>
                <Card.Body className="text-center">
                  <h2 className="fw-bold" style={{ color: "#28a745" }}>
                    ₹{transactionData.totalAmount.toFixed(2)}
                  </h2>
                  <p className="mb-0 text-muted">Total Amount</p>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </>
      )}
    </div>
  );
};

export default BranchAdminDashboard;
