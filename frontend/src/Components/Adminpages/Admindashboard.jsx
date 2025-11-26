import React from "react";
import { useEffect, useState } from "react";
import axios from "axios";
import { Card, Spinner, Row, Col } from "react-bootstrap";
import { BsBuildingGear, BsBarChartFill } from "react-icons/bs";
import {
  PeopleFill,
  BoxSeam,
  Building,
  PersonBadgeFill,
} from "react-bootstrap-icons";
import { Pie, Bar, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
} from "chart.js";

// Register ChartJS components
ChartJS.register(
  ArcElement, 
  Tooltip, 
  Legend, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  LineElement,
  PointElement,
  Title
);

const Admindashboard = () => {
  const [dashboard, setDashboard] = useState({
    admins: 0,
    branchAdmins: 0,
    staff: 0,
    customers: 0,
    couriers: { pending: 0, inTransit: 0, delivered: 0 },
    branches: 0,
    totalStaff: 0,
  });

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

  const [transactionStats, setTransactionStats] = useState({
    totalTransactions: 0,
    totalAmount: 0,
    branchBreakdown: [],
  });

  const [allBranches, setAllBranches] = useState([]);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://localhost:5000/api/admin/dashboard', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setDashboard(res.data);
      } catch (err) {
        // fallback: keep zeros
      }
    };
    
    const fetchAllBranches = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://localhost:5000/api/branches/getallbranchesname', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        console.log("All Branches Response:", res.data);
        setAllBranches(res.data);
      } catch (err) {
        console.error("Error fetching branches:", err);
      }
    };
    
    fetchDashboard();
    fetchAllBranches();
    fetchCourierStats();
    fetchTransactionStats();
  }, []);

  const fetchCourierStats = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:5000/api/analytics/courier-status", {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log("Courier Stats Response:", res.data);
      setCourierStats(res.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching courier stats:", error);
      setLoading(false);
    }
  };

  const fetchTransactionStats = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:5000/api/analytics/transaction-analytics", {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log("Transaction Stats Response:", res.data);
      setTransactionStats(res.data);
    } catch (error) {
      console.error("Error fetching transaction stats:", error);
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

  // Transaction chart data with line and scatter points - shows all branches including zero transactions
  // Merge all branches with transaction data
  const unsortedBranchData = allBranches.length > 0 
    ? allBranches.map(branch => {
        const transactionData = transactionStats.branchBreakdown?.find(
          tb => tb.branchName === branch.branchName || tb.branchId === branch._id
        );
        return {
          branchName: branch.branchName,
          totalAmount: transactionData?.totalAmount || 0,
          count: transactionData?.count || 0,
        };
      })
    : transactionStats.branchBreakdown?.map(tb => ({
        branchName: tb.branchName,
        totalAmount: tb.totalAmount || 0,
        count: tb.count || 0,
      })) || [];

  // Sort branches alphabetically to avoid slope effect
  const mergedBranchData = [...unsortedBranchData].sort((a, b) => 
    a.branchName.localeCompare(b.branchName)
  );

  console.log("All Branches:", allBranches);
  console.log("Transaction Stats:", transactionStats);
  console.log("Merged Branch Data:", mergedBranchData);

  const transactionChartData = {
    labels: mergedBranchData.map(branch => branch.branchName) || [],
    datasets: [
      {
        label: "Revenue",
        data: mergedBranchData.map(branch => branch.totalAmount || 0) || [],
        borderColor: "rgb(199, 108, 63)",
        backgroundColor: "rgba(199, 108, 63, 0.1)",
        borderWidth: 3,
        fill: true,
        tension: 0.4,  // Smooth curve
        pointBackgroundColor: mergedBranchData.map((_, index) => {
          const colors = [
            "rgb(40, 167, 69)",
            "rgb(0, 123, 255)",
            "rgb(255, 193, 7)",
            "rgb(220, 53, 69)",
            "rgb(111, 66, 193)",
            "rgb(23, 162, 184)",
            "rgb(255, 87, 34)",
            "rgb(76, 175, 80)",
          ];
          return colors[index % colors.length];
        }),
        pointBorderColor: "#fff",
        pointBorderWidth: 2,
        pointRadius: 8,
        pointHoverRadius: 12,
        pointHoverBackgroundColor: mergedBranchData.map((_, index) => {
          const colors = [
            "rgb(40, 167, 69)",
            "rgb(0, 123, 255)",
            "rgb(255, 193, 7)",
            "rgb(220, 53, 69)",
            "rgb(111, 66, 193)",
            "rgb(23, 162, 184)",
            "rgb(255, 87, 34)",
            "rgb(76, 175, 80)",
          ];
          return colors[index % colors.length];
        }),
        pointHoverBorderColor: "#fff",
        pointHoverBorderWidth: 3,
      },
    ],
  };

  const transactionChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        display: true,
        position: "top",
        labels: {
          font: {
            size: 14,
            weight: "bold",
          },
          color: "#333",
          padding: 20,
        },
      },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        titleColor: "#fff",
        bodyColor: "#fff",
        borderColor: "#C76C3F",
        borderWidth: 2,
        padding: 12,
        displayColors: true,
        callbacks: {
          label: function (context) {
            const value = context.parsed.y || 0;
            const label = context.label || "";
            return `${label}: Rs ${value.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
          },
        },
      },
      title: {
        display: false,
      },
    },
    scales: {
      x: {
        grid: {
          display: true,
          color: "rgba(0, 0, 0, 0.05)",
        },
        ticks: {
          font: {
            size: 11,
            weight: "600",
          },
          color: "#555",
          maxRotation: 45,
          minRotation: 45,
          autoSkip: false,  // Show all branch names
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          color: "rgba(0, 0, 0, 0.1)",
          borderDash: [5, 5],
        },
        ticks: {
          font: {
            size: 12,
            weight: "600",
          },
          color: "#555",
          callback: function(value) {
            return 'Rs ' + value.toLocaleString('en-IN', { maximumFractionDigits: 0 });
          },
        },
      },
    },
  };

  return (
    <div className="container-fluid">
      <h3 className="mb-4 fw-bold mt-2 d-flex align-items-center"
       style={{ color: "#C76C3F" }}
       >
        <BsBuildingGear size={26} className="me-2 text-secondary" />
        Admin Dashboard
      </h3>

      <div className="row g-4">
        {/* Total Users */}
        <div className="col-md-6 col-lg-3">
          <Card className="bg-primary-subtle text-dark h-100 shadow-sm text-center">
            <Card.Body className="d-flex flex-column align-items-center justify-content-center">
              <PeopleFill size={40} className="text-primary mb-3" />
              <Card.Title>Total Users</Card.Title>
              <Card.Text>
                Admins: {dashboard.admins} <br />
                Branch Admins: {dashboard.branchAdmins} <br />
                Staff: {dashboard.staff} <br />
                Customers: {dashboard.customers}
              </Card.Text>
            </Card.Body>
          </Card>
        </div>

        {/* Total Couriers */}
        <div className="col-md-6 col-lg-3">
          <Card className="bg-success-subtle text-dark h-100 shadow-sm text-center">
            <Card.Body className="d-flex flex-column align-items-center justify-content-center">
              <BoxSeam size={40} className="text-success mb-3" />
              <Card.Title>Total Couriers</Card.Title>
              <Card.Text>{courierStats.total}</Card.Text>
            </Card.Body>
          </Card>
        </div>

        {/* Total Branches */}
        <div className="col-md-6 col-lg-3">
          <Card className="bg-warning-subtle text-dark h-100 shadow-sm text-center">
            <Card.Body className="d-flex flex-column align-items-center justify-content-center">
              <Building size={40} className="text-warning mb-3" />
              <Card.Title>Total Branches</Card.Title>
              <Card.Text>{dashboard.branches}</Card.Text>
            </Card.Body>
          </Card>
        </div>

        {/* Total Staff */}
        <div className="col-md-6 col-lg-3">
          <Card className="bg-danger-subtle text-dark h-100 shadow-sm text-center">
            <Card.Body className="d-flex flex-column align-items-center justify-content-center">
              <PersonBadgeFill size={40} className="text-danger mb-3" />
              <Card.Title>Total Staff</Card.Title>
              <Card.Text>{dashboard.totalStaff}</Card.Text>
            </Card.Body>
          </Card>
        </div>
      </div>

      {/* Analytics Section */}
      <div className="row mt-4">
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
        </>
      )}

      {/* Transaction Analytics Section */}
      <div className="row mt-5">
        <div className="col-12">
          <h4 className="mb-3 fw-bold d-flex align-items-center" style={{ color: "#C76C3F" }}>
            <BsBarChartFill size={24} className="me-2" />
            Transaction Analytics
          </h4>
        </div>
      </div>

      <Row className="mb-4">
        <Col md={6} className="mb-3">
          <Card className="shadow-sm border-0 h-100" style={{ backgroundColor: "#FDFBD8" }}>
            <Card.Body className="text-center">
              <h2 className="fw-bold" style={{ color: "#C76C3F" }}>
                {transactionStats.totalTransactions}
              </h2>
              <p className="mb-0 text-muted fw-semibold">Total Transactions</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6} className="mb-3">
          <Card className="shadow-sm border-0 h-100" style={{ backgroundColor: "#FDFBD8" }}>
            <Card.Body className="text-center">
              <h2 className="fw-bold" style={{ color: "#28a745" }}>
                Rs {transactionStats.totalAmount?.toFixed(2) || "0.00"}
              </h2>
              <p className="mb-0 text-muted fw-semibold">Total Revenue</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Branch-wise Transaction Breakdown */}
      {(allBranches.length > 0 || transactionStats.branchBreakdown?.length > 0) && (
        <>
          <Row className="mb-4">
            <Col md={12}>
              <Card className="shadow-sm border-0" style={{ backgroundColor: "#FDFBD8" }}>
                <Card.Body>
                  <h5 className="fw-bold mb-4" style={{ color: "#C76C3F" }}>
                    Branch-wise Revenue Chart
                  </h5>
                  <div style={{ height: "450px", padding: "10px 20px" }}>
                    <Line data={transactionChartData} options={transactionChartOptions} />
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          <Row>
            <Col md={12}>
              <Card className="shadow-sm border-0" style={{ backgroundColor: "#FDFBD8" }}>
                <Card.Body>
                  <h5 className="fw-bold mb-4" style={{ color: "#C76C3F" }}>
                    Branch-wise Transaction Breakdown
                  </h5>
                  <div className="table-responsive">
                    <table className="table table-hover">
                      <thead style={{ backgroundColor: "#C76C3F", color: "white" }}>
                        <tr>
                          <th>Branch Name</th>
                          <th className="text-center">Total Transactions</th>
                          <th className="text-end">Total Amount (Rs)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {mergedBranchData.length > 0 ? (
                          mergedBranchData.map((branch, index) => (
                            <tr key={index}>
                              <td className="fw-semibold">{branch.branchName}</td>
                              <td className="text-center">{branch.count || 0}</td>
                              <td className="text-end fw-semibold text-success">
                                Rs {(branch.totalAmount || 0).toFixed(2)}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="3" className="text-center text-muted py-4">
                              No branch data available
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
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

export default Admindashboard;
