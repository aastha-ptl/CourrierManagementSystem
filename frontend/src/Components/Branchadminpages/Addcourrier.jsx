import React, { useState, useEffect } from "react";
import { Form, Button, Row, Col, Card } from "react-bootstrap";
import Select from "react-select";
import axios from "axios";
import { TbTruckDelivery } from "react-icons/tb";
import CourierReceipt from "./CourierReceipt";

const AddCourier = () => {
  const [selectedSender, setSelectedSender] = useState(null);
  const [senderPhone, setSenderPhone] = useState("");
  const [senderAddress, setSenderAddress] = useState("");
  const [senderPincode, setSenderPincode] = useState("");
  const [receiverName, setReceiverName] = useState("");
  const [receiverPhone, setReceiverPhone] = useState("");
  const [receiverEmail, setReceiverEmail] = useState("");
  const [receiverAddress, setReceiverAddress] = useState("");
  const [receiverPincode, setReceiverPincode] = useState("");
  const [destinationBranch, setDestinationBranch] = useState(null);
  const [weight, setWeight] = useState("");
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [createdCourier, setCreatedCourier] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [allBranches, setAllBranches] = useState([]);
  const [loadingBranches, setLoadingBranches] = useState(true);
  const [allSenders, setAllSenders] = useState([]);
  const [loadingSenders, setLoadingSenders] = useState(true);

  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          "http://localhost:5000/api/branches/getallbranchesname",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setAllBranches(response.data);
      } catch (error) {
        console.error("Error fetching branches:", error);
      } finally {
        setLoadingBranches(false);
      }
    };
    fetchBranches();
  }, []);

  useEffect(() => {
    const fetchSenders = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          "http://localhost:5000/api/auth/all-user-names",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const senderOptions = response.data.map((user) => ({
          value: user.email,
          label: user.name,
          email: user.email,
        }));
        setAllSenders(senderOptions);
      } catch (error) {
        console.error("Error fetching senders:", error);
      } finally {
        setLoadingSenders(false);
      }
    };
    fetchSenders();
  }, []);

  const branchOptions = allBranches.map((branch) => ({
    value: branch.branchName,
    label: branch.branchName,
  }));

  const customSelectStyles = {
    control: (base, state) => ({
      ...base,
      borderColor: "#C76C3F",
      boxShadow: state.isFocused
        ? "0 0 0 0.25rem rgba(199, 108, 63, 0.4)"
        : "none",
      "&:hover": { borderColor: "#C76C3F" },
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

  const isValidEmail = (email) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const isValidPincode = (pincode) => /^\d{6}$/.test(pincode);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true); // Start loading

    if (
      !selectedSender ||
      !senderPhone ||
      !senderAddress ||
      !senderPincode ||
      !receiverName ||
      !receiverPhone ||
      !receiverEmail ||
      !receiverAddress ||
      !receiverPincode ||
      !destinationBranch ||
      !weight
    ) {
      setError("Please fill in all fields.");
      setSuccessMsg("");
      setIsSubmitting(false); // Stop loading
      return;
    }

    if (!isValidEmail(receiverEmail)) {
      setError("Please enter a valid receiver email.");
      setSuccessMsg("");
      setIsSubmitting(false); // Stop loading
      return;
    }

    if (!isValidPincode(senderPincode) || !isValidPincode(receiverPincode)) {
      setError("Please enter valid 6-digit pincodes.");
      setSuccessMsg("");
      setIsSubmitting(false); // Stop loading
      return;
    }

    const newCourierData = {
      sender: {
        name: selectedSender.label,
        email: selectedSender.email,
        phone: senderPhone,
        address: senderAddress,
        pincode: senderPincode,
      },
      receiver: {
        name: receiverName,
        phone: receiverPhone,
        email: receiverEmail,
        address: receiverAddress,
        pincode: receiverPincode,
      },
      destinationBranch: destinationBranch.value,
      weight: parseFloat(weight),
    };

    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        "http://localhost:5000/api/couriers/create",
        newCourierData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const receiptData = await axios.get(
        `http://localhost:5000/api/couriers/receipt/${response.data.courier._id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setCreatedCourier(receiptData.data);
      setSuccessMsg("Courier created successfully!");
      setError("");
    } catch (err) {
      console.error("Error creating courier:", err);
      setError(err.response?.data?.message || "Something went wrong.");
      setSuccessMsg("");
    } finally {
      setIsSubmitting(false); // Stop loading
    }
  };


  return (
    <div className="container-fluid">
      <style>
        {`
        .custom-input {
          border: 1px solid #C76C3F !important;
          box-shadow: none !important;
        }
        .custom-input:focus {
          box-shadow: 0 0 0 0.25rem rgba(199, 108, 63, 0.4) !important;
          border-color: #C76C3F !important;
        }
      `}
      </style>

      {createdCourier ? (
        <CourierReceipt courier={createdCourier} />
      ) : (
        <>
          <h3
            className="fw-bold mb-4 d-flex align-items-center"
            style={{ color: "#C76C3F" }}
          >
            <TbTruckDelivery size={28} className="me-2 text-secondary" />
            Add New Courier
          </h3>

          <Card className="shadow-sm border-0" style={{ backgroundColor: "#FDFBD8" }}>
            <Card.Body>
              <Form onSubmit={handleSubmit}>
                {/* --- SENDER SECTION --- */}
                <h5 className="mb-3">Sender Info</h5>
                <Row className="mb-3">
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className="fw-semibold">Name (Search)</Form.Label>
                      <Select
                        options={allSenders}
                        value={selectedSender}
                        onChange={setSelectedSender}
                        placeholder={loadingSenders ? "Loading senders..." : "Select sender"}
                        styles={customSelectStyles}
                        isClearable
                        isDisabled={loadingSenders}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group controlId="senderPhone">
                      <Form.Label className="fw-semibold">Phone</Form.Label>
                      <Form.Control
                        type="tel"
                        placeholder="Enter sender phone"
                        value={senderPhone}
                        onChange={(e) => setSenderPhone(e.target.value)}
                        className="custom-input"
                      />
                    </Form.Group>
                  </Col>
                </Row>
                <Row className="mb-3">
                  <Col md={8}>
                    <Form.Group controlId="senderAddress">
                      <Form.Label className="fw-semibold">Address</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={2}
                        placeholder="Enter sender address"
                        value={senderAddress}
                        onChange={(e) => setSenderAddress(e.target.value)}
                        className="custom-input"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group controlId="senderPincode">
                      <Form.Label className="fw-semibold">Sender Pincode</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Enter sender pincode"
                        value={senderPincode}
                        onChange={(e) => setSenderPincode(e.target.value)}
                        className="custom-input"
                        maxLength={6}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                {/* --- RECEIVER SECTION --- */}
                <h5 className="mb-3">Receiver Info</h5>
                <Row className="mb-3">
                  <Col md={4}>
                    <Form.Group controlId="receiverName">
                      <Form.Label className="fw-semibold">Name</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Enter receiver name"
                        value={receiverName}
                        onChange={(e) => setReceiverName(e.target.value)}
                        className="custom-input"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group controlId="receiverPhone">
                      <Form.Label className="fw-semibold">Phone</Form.Label>
                      <Form.Control
                        type="tel"
                        placeholder="Enter receiver phone"
                        value={receiverPhone}
                        onChange={(e) => setReceiverPhone(e.target.value)}
                        className="custom-input"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group controlId="receiverEmail">
                      <Form.Label className="fw-semibold">Email</Form.Label>
                      <Form.Control
                        type="email"
                        placeholder="Enter receiver email"
                        value={receiverEmail}
                        onChange={(e) => setReceiverEmail(e.target.value)}
                        className="custom-input"
                      />
                    </Form.Group>
                  </Col>
                </Row>
                <Row className="mb-3">
                  <Col md={8}>
                    <Form.Group controlId="receiverAddress">
                      <Form.Label className="fw-semibold">Address</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={2}
                        placeholder="Enter receiver address"
                        value={receiverAddress}
                        onChange={(e) => setReceiverAddress(e.target.value)}
                        className="custom-input"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group controlId="receiverPincode">
                      <Form.Label className="fw-semibold">Receiver Pincode</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Enter receiver pincode"
                        value={receiverPincode}
                        onChange={(e) => setReceiverPincode(e.target.value)}
                        className="custom-input"
                        maxLength={6}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                {/* --- BRANCH & WEIGHT --- */}
                <Row className="mb-3">
                  <Col md={6}>
                    <Form.Group controlId="destinationBranch">
                      <Form.Label className="fw-semibold">Destination Branch</Form.Label>
                      <Select
                        options={branchOptions}
                        value={destinationBranch}
                        onChange={setDestinationBranch}
                        placeholder={loadingBranches ? "Loading branches..." : "Select branch"}
                        styles={customSelectStyles}
                        isClearable
                        isDisabled={loadingBranches}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group controlId="weight">
                      <Form.Label className="fw-semibold">Weight (kg)</Form.Label>
                      <Form.Control
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="Weight"
                        value={weight}
                        onChange={(e) => setWeight(e.target.value)}
                        className="custom-input"
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Button
                  type="submit"
                  className="px-4"
                  style={{
                    backgroundColor: "#C76C3F",
                    border: "none",
                    color: "#fff",
                  }}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Adding..." : "Add Courier"}
                </Button>

              </Form>
            </Card.Body>
          </Card>
        </>
      )}
    </div>
  );
};

export default AddCourier;


