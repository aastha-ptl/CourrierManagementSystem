import React, { useState, useEffect } from "react";
import { Form, Button, Row, Col, Card } from "react-bootstrap";
import { FaCalculator } from "react-icons/fa";
import axios from "axios";
import { FaMapMarkedAlt, FaRupeeSign, FaClock } from "react-icons/fa";
import Select from "react-select";
import { FaClipboardList } from "react-icons/fa";

const EstimateCourier = () => {
    const [branches, setBranches] = useState([]);
    const [formData, setFormData] = useState({ weight: "" });
    const [destinationBranch, setDestinationBranch] = useState(null);
    const [result, setResult] = useState(null);
    const [focusedField, setFocusedField] = useState("");
    const [loadingBranches, setLoadingBranches] = useState(true);

    const getInputStyle = (fieldName) => ({
        borderColor: "#C76C3F",
        boxShadow:
            focusedField === fieldName
                ? "0 0 0 0.2rem rgba(199, 108, 63, 0.25)"
                : "none",
    });

    const customSelectStyles = {
        control: (base, state) => ({
            ...base,
            borderColor: "#C76C3F",
            boxShadow: state.isFocused
                ? "0 0 0 0.25rem rgba(199, 108, 63, 0.4)"
                : "none",
            "&:hover": { borderColor: "#C76C3F" },
            minHeight: "38px",
        }),
        placeholder: (base) => ({
            ...base,
            color: "#6c757d",
        }),
        singleValue: (base) => ({
            ...base,
            color: "#212529",
        }),
        option: (base, state) => ({
            ...base,
            backgroundColor: state.isSelected
                ? "#C76C3F"
                : state.isFocused
                    ? "#fbe2d4"
                    : "#fff",
            color: state.isSelected ? "#fff" : "#000",
            cursor: "pointer",
        }),
        menu: (base) => ({
            ...base,
            zIndex: 9999,
        }),
    };


    useEffect(() => {
        const fetchBranches = async () => {
            try {
                const token = localStorage.getItem("token");
                const res = await axios.get(
                    "http://localhost:5000/api/branches/getallbranchesname",
                    {
                        headers: { Authorization: `Bearer ${token}` },
                    }
                );
                const options = res.data.map((branch) => ({
                    label: branch.branchName,
                    value: branch.branchName,
                }));
                setBranches(options);
                setLoadingBranches(false);
            } catch (err) {
                console.error("Failed to fetch branches", err);
                setLoadingBranches(false);
            }
        };

        fetchBranches();
    }, []);

    const handleChange = (e) => {
        setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.weight || !destinationBranch) {
            return alert("Please enter weight and select a destination branch.");
        }

        try {
            const token = localStorage.getItem("token");
            const res = await axios.post(
                "http://localhost:5000/api/couriers/preview",
                {
                    weight: formData.weight,
                    destinationBranch: destinationBranch.value,
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setResult(res.data);
        } catch (err) {
            alert(err.response?.data?.message || "Failed to estimate.");
        }
    };

    return (
        <div className="container-fluid">
            <h3 className="fw-bold mb-4 d-flex align-items-center" style={{ color: "#C76C3F" }}>
                <FaCalculator className="me-2 text-secondary" />
                Estimate Courier Price
            </h3>

            <Card className="shadow-sm border-0" style={{ backgroundColor: "#FDFBD8" }}>
                <Card.Body>
                    <Form onSubmit={handleSubmit}>
                        <Row className="mb-3">
                            <Col md={6}>
                                <Form.Group controlId="weight">
                                    <Form.Label className="fw-semibold">Weight (kg)</Form.Label>
                                    <Form.Control
                                        type="number"
                                        name="weight"
                                        value={formData.weight}
                                        placeholder="Enter weight"
                                        onChange={handleChange}
                                        style={getInputStyle("weight")}
                                        onFocus={() => setFocusedField("weight")}
                                        onBlur={() => setFocusedField("")}
                                    />
                                </Form.Group>
                            </Col>

                            <Col md={6}>
                                <Form.Group controlId="destinationBranch">
                                    <Form.Label className="fw-semibold">Destination Branch</Form.Label>
                                    <Select
                                        options={branches}
                                        value={destinationBranch}
                                        onChange={setDestinationBranch}
                                        placeholder={loadingBranches ? "Loading branches..." : "Select branch"}
                                        styles={customSelectStyles}
                                        isClearable
                                        isDisabled={loadingBranches}
                                    />
                                </Form.Group>
                            </Col>
                        </Row>

                        <Button
                            type="submit"
                            className="mt-2 px-4"
                            style={{ backgroundColor: "#C76C3F", color: "#fff", border: "none" }}
                        >
                            Estimate
                        </Button>
                    </Form>

                    {result && (
                        <Card className="mt-4 border-0 shadow-sm" style={{ backgroundColor: "#fff8e6" }}>
                            <Card.Body>
                                <h5 className="fw-bold mb-3" style={{ color: "#C76C3F" }}>
  <FaClipboardList className="me-2 icon-gray" /> Estimation Summary
</h5>
                                <Row>
                                    <Col md={4} className="mb-3">
                                        <div className="d-flex align-items-center gap-3 px-3 py-3 border rounded bg-white shadow-sm">
                                            <FaMapMarkedAlt size={24} color="#C76C3F" />
                                            <div>
                                                <div className="text-muted small fw-semibold">Branch Distance</div>
                                                <div className="fs-5 fw-bold text-dark">{result.distance} km</div>
                                            </div>
                                        </div>
                                    </Col>

                                    <Col md={4} className="mb-3">
                                        <div className="d-flex align-items-center gap-3 px-3 py-3 border rounded bg-white shadow-sm">
                                            <FaRupeeSign size={24} color="#C76C3F" />
                                            <div>
                                                <div className="text-muted small fw-semibold">Estimated Price</div>
                                                <div className="fs-5 fw-bold text-dark">₹{result.price}</div>
                                            </div>
                                        </div>
                                    </Col>

                                    <Col md={4} className="mb-3">
                                        <div className="d-flex align-items-center gap-3 px-3 py-3 border rounded bg-white shadow-sm">
                                            <FaClock size={24} color="#C76C3F" />
                                            <div>
                                                <div className="text-muted small fw-semibold">Estimated Delivery</div>
                                                <div className="fs-5 fw-bold text-dark">{result.estimatedDays}</div>
                                            </div>
                                        </div>
                                    </Col>
                                </Row>
                            </Card.Body>
                        </Card>
                    )}

                </Card.Body>
            </Card>
        </div>
    );
};

export default EstimateCourier;
