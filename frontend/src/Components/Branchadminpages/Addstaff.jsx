import React, { useState } from "react";
import { Form, Button, Row, Col, Card, InputGroup } from "react-bootstrap";
import { Eye, EyeOff } from "lucide-react";
import { FaUserPlus } from "react-icons/fa";
import axios from "axios";

const AddStaff = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [focusedField, setFocusedField] = useState("");

  const getInputStyle = (fieldName) => ({
    borderColor: "#C76C3F",
    boxShadow:
      focusedField === fieldName
        ? "0 0 0 0.2rem rgba(199, 108, 63, 0.25)"
        : "none",
  });

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { name, email, phone, password, confirmPassword } = formData;

    if (!name || !email || !phone || !password || !confirmPassword) {
      return alert("All fields are required.");
    }

    if (password !== confirmPassword) {
      return alert("Passwords do not match.");
    }

    try {
      const token = localStorage.getItem("token");

      const response = await axios.post(
        "http://localhost:5000/api/auth/addstaff",
        { name, email, phone, password, confirmPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert(response.data.message);
      setFormData({
        name: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: ""
      });
    } catch (err) {
      alert(err.response?.data?.message || "Failed to add staff.");
    }
  };

  return (
    <div className="container-fluid">
      <h3 className="fw-bold mb-4 d-flex align-items-center" style={{ color: "#C76C3F" }}>
        <FaUserPlus size={24} className="me-2 text-secondary" />
        Add Staff
      </h3>

      <Card className="shadow-sm border-0" style={{ backgroundColor: "#FDFBD8" }}>
        <Card.Body>
          <Form onSubmit={handleSubmit}>
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group controlId="staffName">
                  <Form.Label className="fw-semibold">Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    value={formData.name}
                    placeholder="Enter name"
                    onChange={handleChange}
                    style={getInputStyle("staffName")}
                    onFocus={() => setFocusedField("staffName")}
                    onBlur={() => setFocusedField("")}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group controlId="staffEmail">
                  <Form.Label className="fw-semibold">Email</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={formData.email}
                    placeholder="Enter email"
                    onChange={handleChange}
                    style={getInputStyle("staffEmail")}
                    onFocus={() => setFocusedField("staffEmail")}
                    onBlur={() => setFocusedField("")}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row className="mb-3">
              <Col md={6}>
                <Form.Group controlId="staffPhone">
                  <Form.Label className="fw-semibold">Phone</Form.Label>
                  <Form.Control
                    type="text"
                    name="phone"
                    value={formData.phone}
                    placeholder="Enter phone number"
                    onChange={handleChange}
                    style={getInputStyle("staffPhone")}
                    onFocus={() => setFocusedField("staffPhone")}
                    onBlur={() => setFocusedField("")}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group controlId="staffPassword">
                  <Form.Label className="fw-semibold">Password</Form.Label>
                  <InputGroup>
                    <Form.Control
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      placeholder="Enter password"
                      onChange={handleChange}
                      style={getInputStyle("staffPassword")}
                      onFocus={() => setFocusedField("staffPassword")}
                      onBlur={() => setFocusedField("")}
                    />
                    <InputGroup.Text
                      style={{ cursor: "pointer", backgroundColor: "#fff", color: "#C76C3F", borderColor: "#C76C3F" }}
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </InputGroup.Text>
                  </InputGroup>
                </Form.Group>
              </Col>
            </Row>

            <Row className="mb-3">
              <Col md={6}>
                <Form.Group controlId="confirmPassword">
                  <Form.Label className="fw-semibold">Confirm Password</Form.Label>
                  <InputGroup>
                    <Form.Control
                      type={showConfirm ? "text" : "password"}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      placeholder="Re-enter password"
                      onChange={handleChange}
                      style={getInputStyle("confirmPassword")}
                      onFocus={() => setFocusedField("confirmPassword")}
                      onBlur={() => setFocusedField("")}
                    />
                    <InputGroup.Text
                      style={{ cursor: "pointer", backgroundColor: "#fff", color: "#C76C3F", borderColor: "#C76C3F" }}
                      onClick={() => setShowConfirm(!showConfirm)}
                    >
                      {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                    </InputGroup.Text>
                  </InputGroup>
                </Form.Group>
              </Col>
            </Row>

            <Button
              type="submit"
              className="mt-2 px-4"
              style={{
                backgroundColor: "#C76C3F",
                color: "#fff",
                border: "none",
              }}
            >
              Add Staff
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </div>
  );
};

export default AddStaff;
