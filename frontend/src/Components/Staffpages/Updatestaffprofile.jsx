import React, { useState, useEffect } from "react";
import { Card, Button, Form, Container } from "react-bootstrap";
import { FaUserEdit, FaUser, FaEnvelope, FaLock } from "react-icons/fa";
import Footer from "../Mainpages/Footer";
import axios from 'axios';
import { useNavigate } from "react-router-dom";

const UpdateProfile = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
  });
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // submit update via API
    const update = async () => {
      setLoading(true);
      setError("");
      try {
        const token = localStorage.getItem('token');
        await axios.put(
          'http://localhost:5000/api/auth/update-profile',
          {
            name: formData.name,
            email: formData.email,
            currentPassword: currentPassword || undefined,
            newPassword: newPassword || undefined,
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        navigate("/staff/profile");
      } catch (err) {
        setError(err.response?.data?.message || 'Update failed');
      } finally {
        setLoading(false);
      }
    };

    update();
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://localhost:5000/api/auth/profile', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setFormData({ name: res.data.name || '', email: res.data.email || '' });
      } catch (err) {
        // ignore or set error
      }
    };
    fetchProfile();
  }, []);

  return (
    <>
      {/* Add theme color focus styles here */}
      <style>{`
        input:focus, textarea:focus, select:focus {
          outline: none;
          border-color: #C76C3F !important;
          box-shadow: none !important;
        }
      `}</style>

      <div style={styles.mainContainer}>
        <Container style={styles.scrollContainer}>
          <Card style={styles.card}>
            <h2 className="text-center mb-2" style={styles.heading}>
              <FaUserEdit style={{ marginRight: "10px" }} />
              Update Profile
            </h2>

            <Form onSubmit={handleSubmit}>
              <Form.Group controlId="name" className="mb-3">
                <Form.Label>
                  <FaUser style={styles.icon} />
                  Name
                </Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter your name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </Form.Group>

              <Form.Group controlId="email" className="mb-3">
                <Form.Label>
                  <FaEnvelope style={styles.icon} />
                  Email
                </Form.Label>
                <Form.Control
                  type="email"
                  placeholder="Enter your email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </Form.Group>

              <Form.Group controlId="password" className="mb-4">
                <Form.Label>
                  <FaLock style={styles.icon} />
                  Password
                </Form.Label>
                <Form.Control
                  type="password"
                  placeholder="Enter current password (required to change)"
                  name="currentPassword"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />
              </Form.Group>

              <Form.Group controlId="newPassword" className="mb-4">
                <Form.Label>
                  <FaLock style={styles.icon} />
                  New Password (optional)
                </Form.Label>
                <Form.Control
                  type="password"
                  placeholder="Enter new password"
                  name="newPassword"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </Form.Group>

              {error && <div className="alert alert-danger">{error}</div>}
              <div className="text-center">
                <Button type="submit" style={styles.button} disabled={loading}>
                  {loading ? 'Updating...' : 'Update Profile'}
                </Button>
              </div>
            </Form>
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
    padding: "15px",
    boxSizing: "border-box",
  },
  scrollContainer: {
    maxHeight: "90vh",
    overflowY: "auto",
    padding: 0,
    maxWidth: "500px",
    width: "100%",
  },
  card: {
    borderRadius: "1.5rem",
    backgroundColor: "#ffffff",
    margin: "0 auto",
    padding: "30px",
  },
  heading: {
    color: "#C76C3F",
    fontWeight: "700",
    fontSize: "2rem",
  },
  icon: {
    color: "#C76C3F",
    marginRight: "8px",
  },
  button: {
    backgroundColor: "#C76C3F",
    border: "none",
    padding: "10px 40px",
    fontWeight: "600",
    borderRadius: "8px",
  },
};

export default UpdateProfile;
