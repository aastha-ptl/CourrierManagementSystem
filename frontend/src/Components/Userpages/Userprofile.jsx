import React, { useState, useEffect } from "react";
import { Card, Button, Container } from "react-bootstrap";
import { FaUserCircle, FaEnvelope, FaEdit } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import Footer from "../Mainpages/Footer";
import axios from 'axios';

const UserProfile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('Not authenticated');
          setLoading(false);
          return navigate('/login');
        }

        const res = await axios.get('http://localhost:5000/api/auth/profile', {
          headers: { Authorization: `Bearer ${token}` },
        });

        setUser(res.data);
      } catch (err) {
        console.error('Failed to load user profile', err.response || err.message || err);
        if (err.response && err.response.status === 401) {
          // unauthorized -> redirect to login
          return navigate('/login');
        }
        setError(err.response?.data?.message || 'Failed to load user profile');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <h4 style={styles.highlightText}>Loading user profile...</h4>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.loadingContainer}>
        <h4 style={styles.highlightText}>{error}</h4>
      </div>
    );
  }

  return (
    <>
      <div style={styles.mainContainer}>
        <Container style={styles.container}>
          <Card style={styles.card}>
            <h2 className="text-center mb-4" style={styles.heading}>
              <FaUserCircle style={{ marginRight: 10 }} />
              User Profile
            </h2>

            <div style={styles.infoRow}>
              <FaUserCircle style={styles.icon} />
              <strong>Name:</strong> &nbsp; {user.name}
            </div>

            <div style={styles.infoRow}>
              <FaEnvelope style={styles.icon} />
              <strong>Email:</strong> &nbsp; {user.email}
            </div>

            <div className="text-center mt-4">
              <Button
                style={styles.button}
                onClick={() => navigate("/user/updateprofile")}
              >
                <FaEdit style={{ marginRight: 8 }} />
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

const styles = {
  mainContainer: {
    backgroundColor: "#FDFBD8",
    minHeight: "92vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: 15,
    boxSizing: "border-box",
  },
  container: {
    maxWidth: 500,
    width: "100%",
  },
  card: {
    borderRadius: "1.5rem",
    backgroundColor: "#ffffff",
    padding: "30px 20px",
  },
  heading: {
    color: "#C76C3F",
    fontWeight: "700",
    fontSize: "1.8rem",
  },
  infoRow: {
    display: "flex",
    alignItems: "center",
    marginBottom: 20,
    fontSize: "1.1rem",
    color: "#333",
  },
  icon: {
    color: "#C76C3F",
    marginRight: 12,
    minWidth: 22,
  },
  button: {
    backgroundColor: "#C76C3F",
    border: "none",
    padding: "10px 28px",
    fontWeight: "600",
    borderRadius: 8,
  },
  loadingContainer: {
    backgroundColor: "#FDFBD8",
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  highlightText: {
    color: "#C76C3F",
  },
};

export default UserProfile;
