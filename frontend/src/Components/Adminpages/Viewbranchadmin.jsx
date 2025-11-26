import React, { useEffect, useState } from "react";
import axios from "axios";
import { Card, Row, Col, Button } from "react-bootstrap";
import { PersonFill, EnvelopeFill, Building, TelephoneFill, XCircleFill, CheckCircleFill } from "react-bootstrap-icons";
import { FaUserTie } from "react-icons/fa";

const ViewBranchAdmins = () => {
  const [branchAdmins, setBranchAdmins] = useState([]);

  const fetchBranchAdmins = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:5000/api/auth/getbranchadmins", {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Show all branch admins (both active and inactive) but filter those without branch
      const branchAdminsWithBranch = res.data.filter(admin => admin.branch && admin.branch._id);
      setBranchAdmins(branchAdminsWithBranch);
    } catch (error) {
      console.error("Failed to fetch branch admins:", error);
      alert("Failed to fetch branch admins");
    }
  };

  useEffect(() => {
    fetchBranchAdmins();
  }, []);

  const handleDeactivate = async (admin) => {
    if (!window.confirm(`Are you sure you want to deactivate ${admin.name}?\n\nThey will be moved to Unassigned Personnel and cannot login until reassigned.`)) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `http://localhost:5000/api/admin/deactivate-user/${admin._id}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      alert(`${admin.name} has been deactivated successfully`);
      fetchBranchAdmins();
    } catch (err) {
      console.error("Deactivate error:", err);
      alert(err?.response?.data?.message || "Failed to deactivate user");
    }
  };

  const handleReactivate = async (admin) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `http://localhost:5000/api/admin/reactivate-user/${admin._id}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      alert(`${admin.name} has been reactivated successfully`);
      fetchBranchAdmins();
    } catch (err) {
      console.error("Reactivate error:", err);
      alert(err?.response?.data?.message || "Failed to reactivate user");
    }
  };

  return (
    <div className="container-fluid">
      <h3 className="fw-bold mb-4 mt-2 d-flex align-items-center" style={{ color: "#C76C3F" }}>
        <FaUserTie size={24} className="me-2 text-secondary" /> View All Branch Admins
      </h3>

      <Row className="g-4">
        {branchAdmins.map((admin, index) => (
          <Col key={index} xs={12} sm={12} md={6} lg={4}>
            <Card className="h-100 shadow-sm border-0" style={{ backgroundColor: "#FDFBD8" }}>
              <Card.Body>
                <h5 className="fw-bold" style={{ color: "#C76C3F" }}>
                  <PersonFill className="me-2" />{admin.name}
                </h5>
                <div className="text-muted">
                  <Building className="me-2" style={{ color: "#C76C3F" }} />
                  <strong>Branch:</strong> {admin.branch?.branchName || "N/A"}
                </div>
                <div className="text-muted">
                  <EnvelopeFill className="me-2" style={{ color: "#C76C3F" }} />
                  {admin.email}
                </div>
                <div className="text-muted mb-1">
                  <TelephoneFill className="me-2" style={{ color: "#C76C3F" }} />
                  {admin.phone || "N/A"}
                </div>
                <div className="d-flex justify-content-end gap-2 mt-4">
                  {admin.isActive ? (
                    <Button size="sm" variant="outline-danger" onClick={() => handleDeactivate(admin)}>
                      <XCircleFill className="me-1" />Deactivate
                    </Button>
                  ) : (
                    <Button size="sm" variant="outline-success" onClick={() => handleReactivate(admin)}>
                      <CheckCircleFill className="me-1" />Reactivate
                    </Button>
                  )}
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default ViewBranchAdmins;
