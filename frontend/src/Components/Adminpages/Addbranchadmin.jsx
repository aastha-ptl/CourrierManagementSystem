import React, { useState, useEffect } from "react";
import { Form, Button, Row, Col, Card, InputGroup } from "react-bootstrap";
import { Eye, EyeOff } from "lucide-react";
import Select from "react-select";
import { FaUserPlus } from "react-icons/fa";
import axios from "axios";

const AddBranchAdmin = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [focusedField, setFocusedField] = useState("");
  const [branchOptions, setBranchOptions] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState(null);

  // Controlled input states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState(""); // ✅ Phone field
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const getInputStyle = (fieldName) => ({
    borderColor: "#C76C3F",
    boxShadow:
      focusedField === fieldName
        ? "0 0 0 0.2rem rgba(199, 108, 63, 0.25)"
        : "none",
  });

  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(
          "http://localhost:5000/api/branches/getallbranchesname",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const formatted = res.data.map((branch) => ({
          value: branch._id,
          label: branch.branchName,
        }));
        setBranchOptions(formatted);
      } catch (error) {
        console.error("Failed to fetch branches:", error);
      }
    };

    fetchBranches();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name || !email || !phone || !password || !confirmPassword || !selectedBranch) {
      return alert("Please fill in all fields.");
    }

    if (password !== confirmPassword) {
      return alert("Passwords do not match.");
    }

    try {
      const token = localStorage.getItem("token");

      const res = await axios.post(
        "http://localhost:5000/api/auth/createbranchadmin",
        {
          name,
          email,
          phone, // ✅ send phone
          password,
          branchId: selectedBranch.value,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert(res.data.message);

      // Reset form
      setName("");
      setEmail("");
      setPhone("");
      setPassword("");
      setConfirmPassword("");
      setSelectedBranch(null);
    } catch (err) {
      alert(err.response?.data?.message || "Error creating branch admin");
    }
  };

  return (
    <div className="container-fluid">
      <h3 className="fw-bold mb-4 mt-2" style={{ color: "#C76C3F" }}>
        <FaUserPlus className="me-2 text-secondary" />
        Add Branch Admin
      </h3>

      <Card className="shadow-sm border-0" style={{ backgroundColor: "#FDFBD8" }}>
        <Card.Body>
          <Form onSubmit={handleSubmit}>
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group controlId="adminName">
                  <Form.Label className="fw-semibold">Name</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    style={getInputStyle("adminName")}
                    onFocus={() => setFocusedField("adminName")}
                    onBlur={() => setFocusedField("")}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group controlId="adminEmail">
                  <Form.Label className="fw-semibold">Email</Form.Label>
                  <Form.Control
                    type="email"
                    placeholder="Enter email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={getInputStyle("adminEmail")}
                    onFocus={() => setFocusedField("adminEmail")}
                    onBlur={() => setFocusedField("")}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row className="mb-3">
              <Col md={6}>
                <Form.Group controlId="adminPhone">
                  <Form.Label className="fw-semibold">Phone</Form.Label>
                  <Form.Control
                    type="tel"
                    placeholder="Enter phone number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    style={getInputStyle("adminPhone")}
                    onFocus={() => setFocusedField("adminPhone")}
                    onBlur={() => setFocusedField("")}
                  />
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group controlId="adminPassword">
                  <Form.Label className="fw-semibold">Password</Form.Label>
                  <InputGroup>
                    <Form.Control
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      style={getInputStyle("adminPassword")}
                      onFocus={() => setFocusedField("adminPassword")}
                      onBlur={() => setFocusedField("")}
                    />
                    <InputGroup.Text
                      onClick={() => setShowPassword(!showPassword)}
                      style={{
                        cursor: "pointer",
                        color: "#C76C3F",
                        backgroundColor: "#fff",
                        borderColor: "#C76C3F",
                      }}
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
                      placeholder="Re-enter password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      style={getInputStyle("confirmPassword")}
                      onFocus={() => setFocusedField("confirmPassword")}
                      onBlur={() => setFocusedField("")}
                    />
                    <InputGroup.Text
                      onClick={() => setShowConfirm(!showConfirm)}
                      style={{
                        cursor: "pointer",
                        color: "#C76C3F",
                        backgroundColor: "#fff",
                        borderColor: "#C76C3F",
                      }}
                    >
                      {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                    </InputGroup.Text>
                  </InputGroup>
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group controlId="assignBranch">
                  <Form.Label className="fw-semibold">Assign to Branch</Form.Label>
                  <Select
                    options={branchOptions}
                    placeholder="Select branch"
                    isSearchable
                    value={selectedBranch}
                    onChange={setSelectedBranch}
                    styles={{
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
                    }}
                  />
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
              Add Branch Admin
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </div>
  );
};

export default AddBranchAdmin;
