import React, { useState } from "react";
import { Form, Button, Row, Col, Card } from "react-bootstrap";
import { FaMapMarkerAlt } from "react-icons/fa";
import Select from "react-select";
import axios from "axios";

//List of Indian States
const indianStates = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand",
  "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur",
  "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab",
  "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura",
  "Uttar Pradesh", "Uttarakhand", "West Bengal", "Delhi", "Jammu and Kashmir"
];

// Convert states to react-select options
const stateOptions = indianStates.map((state) => ({
  value: state,
  label: state,
}));

const AddBranch = () => {
  const [focusedField, setFocusedField] = useState("");
  const [formData, setFormData] = useState({
    branchName: "",
    city: "",
    address: "",
    state: null,
    pincode: "",
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    // For pincode, allow only digits
    if (name === "pincode" && !/^\d{0,6}$/.test(value)) return;

    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSelectChange = (selectedOption) => {
    setFormData((prev) => ({ ...prev, state: selectedOption }));
    if (errors.state) setErrors((prev) => ({ ...prev, state: "" }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.branchName.trim()) newErrors.branchName = "Branch name is required";
    if (!formData.city.trim()) newErrors.city = "City is required";
    if (!formData.address.trim()) newErrors.address = "Address is required";
    if (!formData.state) newErrors.state = "State is required";
    if (!formData.pincode || formData.pincode.length !== 6)
      newErrors.pincode = "Pincode must be a 6-digit number";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const API_URL = "http://localhost:5000/api/branches/addbranch";
    const token = localStorage.getItem("token");

    axios.post(API_URL, formData, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((res) => {
        alert("Branch added successfully!");
      })
      .catch((err) => {
        alert(err.response?.data?.message || "Error adding branch.");
      });
  };

  const getInputStyle = (fieldName) => ({
    borderColor: "#C76C3F",
    boxShadow:
      focusedField === fieldName
        ? "0 0 0 0.2rem rgba(199, 108, 63, 0.25)"
        : "none",
  });

  return (
    <div className="container-fluid">
      <h3 className="fw-bold mb-4 mt-2" style={{ color: "#C76C3F" }}>
        <FaMapMarkerAlt className="me-2 text-secondary" />
        Add Branch
      </h3>
      <Card className="shadow-sm border-0" style={{ backgroundColor: "#FDFBD8" }}>
        <Card.Body>
          <Form onSubmit={handleSubmit}>
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group controlId="branchName">
                  <Form.Label className="fw-semibold">Branch Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="branchName"
                    placeholder="Enter branch name"
                    value={formData.branchName}
                    style={getInputStyle("branchName")}
                    onFocus={() => setFocusedField("branchName")}
                    onBlur={() => setFocusedField("")}
                    onChange={handleChange}
                  />
                  {errors.branchName && <div className="text-danger">{errors.branchName}</div>}
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group controlId="branchCity">
                  <Form.Label className="fw-semibold">City</Form.Label>
                  <Form.Control
                    type="text"
                    name="city"
                    placeholder="Enter city"
                    value={formData.city}
                    style={getInputStyle("branchCity")}
                    onFocus={() => setFocusedField("branchCity")}
                    onBlur={() => setFocusedField("")}
                    onChange={handleChange}
                  />
                  {errors.city && <div className="text-danger">{errors.city}</div>}
                </Form.Group>
              </Col>
            </Row>

            <Row className="mb-3">
              <Col md={12}>
                <Form.Group controlId="branchAddress">
                  <Form.Label className="fw-semibold">Address</Form.Label>
                  <Form.Control
                    as="textarea"
                    name="address"
                    rows={2}
                    placeholder="Enter address"
                    value={formData.address}
                    style={getInputStyle("branchAddress")}
                    onFocus={() => setFocusedField("branchAddress")}
                    onBlur={() => setFocusedField("")}
                    onChange={handleChange}
                  />
                  {errors.address && <div className="text-danger">{errors.address}</div>}
                </Form.Group>
              </Col>
            </Row>

            <Row className="mb-3">
              <Col md={6}>
                <Form.Group controlId="branchState">
                  <Form.Label className="fw-semibold">State</Form.Label>
                  <Select
                    options={stateOptions}
                    value={formData.state}
                    onChange={handleSelectChange}
                    placeholder="Select a state"
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
                        backgroundColor: state.isFocused
                          ? "#F5DCCB"
                          : "#fff",
                        color: "#000",
                        cursor: "pointer",
                      }),
                      menu: (base) => ({
                        ...base,
                        zIndex: 9999,
                      }),
                    }}
                    onFocus={() => setFocusedField("branchState")}
                    onBlur={() => setFocusedField("")}
                  />
                  {errors.state && <div className="text-danger">{errors.state}</div>}
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group controlId="branchPincode">
                  <Form.Label className="fw-semibold">Pincode</Form.Label>
                  <Form.Control
                    type="text"
                    name="pincode"
                    placeholder="Enter 6-digit pincode"
                    value={formData.pincode}
                    style={getInputStyle("branchPincode")}
                    onFocus={() => setFocusedField("branchPincode")}
                    onBlur={() => setFocusedField("")}
                    onChange={handleChange}
                  />
                  {errors.pincode && <div className="text-danger">{errors.pincode}</div>}
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
              Add Branch
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </div>
  );
};

export default AddBranch;
