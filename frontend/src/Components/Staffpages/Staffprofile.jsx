import React, { useState, useEffect } from "react";
import { Card, Button, Row, Col, Container, Spinner } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import {
  FaUserCircle,
  FaEnvelope,
  FaBuilding,
  FaUserTie,
  FaEdit,
} from "react-icons/fa";
import Footer from "../Mainpages/Footer";
import axios from 'axios';

const StaffProfile = () => {
  const [staff, setStaff] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          console.warn('No auth token found in localStorage');
          setStaff({ error: 'Not authenticated' });
          return navigate('/login');
        }

        const res = await axios.get('http://localhost:5000/api/auth/profile', {
          headers: { Authorization: `Bearer ${token}` },
        });

        // API returns a user object (password excluded), with populated branch and optional branchAdmin
        setStaff(res.data);
      } catch (err) {
        console.error('Failed to load profile', err.response || err.message || err);
        // If unauthorized, redirect to login so user can reauthenticate
        if (err.response && err.response.status === 401) {
          return navigate('/login');
        }
        setStaff({ error: err.response?.data?.message || 'Failed to load profile' });
      }
    };

    fetchProfile();
  }, []);

  if (!staff) {
    return (
      <div style={styles.loadingContainer}>
        <Spinner animation="border" variant="secondary" />
      </div>
    );
  }

  if (staff.error) {
    return (
      <div style={styles.loadingContainer}>
        <h4 style={styles.highlightText}>{staff.error}</h4>
      </div>
    );
  }

  return (
    <>
    <div style={styles.mainContainer}>
      <Container style={styles.scrollContainer}>
        <Card style={styles.card}>
          <h2 className="text-center mb-5" style={styles.heading}>
            <FaUserCircle style={{ marginRight: "10px" }} />
            Staff Profile
          </h2>

          <Row className="mb-4 g-4 align-items-start justify-content-center">
            {/* Staff Info */}
            <Col xs={12} md={6} style={styles.column}>
              <h5 style={styles.sectionTitle}>
                <FaUserCircle style={styles.sectionIcon} />
                Staff Information
              </h5>
              <div className="mb-3 d-flex align-items-center">
                <FaUserCircle style={styles.icon} />
                <strong>Name:</strong>&nbsp;{staff.name}
              </div>
              <div className="mb-3 d-flex align-items-center">
                <FaEnvelope style={styles.icon} />
                <strong>Email:</strong>&nbsp;{staff.email}
              </div>
            </Col>

            {/* Branch Info */}
            <Col xs={12} md={6} style={styles.column}>
              <h5 style={styles.sectionTitle}>
                <FaBuilding style={styles.sectionIcon} />
                Branch Details
              </h5>
              <div className="mb-3 d-flex align-items-center">
                <FaBuilding style={styles.icon} />
                <strong>Branch Name:</strong>&nbsp;{staff.branch?.branchName || 'N/A'}
              </div>
              <div className="mb-3 d-flex align-items-center">
                <FaUserTie style={styles.icon} />
                <strong>Branch Admin:</strong>&nbsp;{staff.branchAdmin?.name || 'N/A'}
              </div>
              <div className="mb-3 d-flex align-items-center">
                <FaEnvelope style={styles.icon} />
                <strong>Admin Email:</strong>&nbsp;{staff.branchAdmin?.email || 'N/A'}
              </div>
            </Col>
          </Row>

          <div className="text-center">
            <Button style={styles.button}
            onClick={() => navigate("/staff/updateprofile")}
            >
              <FaEdit style={{ marginRight: "8px" }} />
              Update Profile
            </Button>
          </div>
        </Card>
      </Container>
    </div>
      <Footer />
    </>
  );
};

// Reusable style constants
const styles = {
  mainContainer: {
    backgroundColor: "#FDFBD8",
    minHeight: "92vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "15px",
    boxSizing: "border-box",
  },
  scrollContainer: {
    maxHeight: "90vh",
    overflowY: "auto",
    padding: 0,
    maxWidth: "960px",
  },
  card: {
    borderRadius: "1.5rem",
    backgroundColor: "#ffffff",
    margin: "0 auto",
    padding: "30px",
    width: "100%",
  },
  heading: {
    color: "#C76C3F",
    fontWeight: "700",
    fontSize: "2rem",
  },
  sectionTitle: {
    color: "#C76C3F",
    fontWeight: "600",
    marginBottom: "20px",
  },
  sectionIcon: {
    marginRight: "8px",
  },
  column: {
    paddingLeft: "15px",
    paddingRight: "15px",
    maxWidth: "100%",
    margin: "0 auto",
    wordBreak: "break-word",
    overflowWrap: "break-word",
  },
  icon: {
    color: "#C76C3F",
    marginRight: "10px",
    minWidth: "20px",
    flexShrink: 0,
  },
  button: {
    backgroundColor: "#C76C3F",
    border: "none",
    padding: "10px 30px",
    fontWeight: "600",
    borderRadius: "8px",
  },
  loadingContainer: {
    backgroundColor: "#FDFBD8",
    height: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  highlightText: {
    color: "#C76C3F",
  },
};

export default StaffProfile;
