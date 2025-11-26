import React, { useState } from "react";
import axios from "axios";
import {
  Container,
  Row,
  Col,
  Form,
  Button,
  Card,
  Alert,
  Spinner,
  Badge,
} from "react-bootstrap";
import { MdMyLocation } from "react-icons/md";

import {
  FaTruckMoving,
  FaUser,
  FaBoxOpen,
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaWarehouse,
  FaCheckCircle,
} from "react-icons/fa";

// Timeline steps
const TIMELINE_STEPS = [
  { key: "Booked", label: "Booked", icon: <FaBoxOpen /> },
  { key: "In Transit", label: "In Transit", icon: <FaTruckMoving /> },
  { key: "Received at Destination Branch", label: "Received at Destination Branch", icon: <FaWarehouse /> },
  { key: "Out for Delivery", label: "Out for Delivery", icon: <FaMapMarkerAlt /> },
  { key: "Delivered", label: "Delivered", icon: <FaCheckCircle /> },
];

// Map API statuses to our timeline keys
const STATUS_MAP = {
  booked: "Booked",
  "in transit": "In Transit",
  "received at destination branch": "Received at Destination Branch",
  "out for delivery": "Out for Delivery",
  delivered: "Delivered",
  "unable to deliver": "Received at Destination Branch", // Map unable to deliver to destination branch
};

// Get step color based on current status
const getStepStyle = (currentStatus, stepKey) => {
  if (!currentStatus) return { borderColor: "#ccc", color: "#ccc" };

  const normalized =
    STATUS_MAP[currentStatus.toLowerCase().trim()] || currentStatus.trim();

  const steps = TIMELINE_STEPS.map((s) => s.key.trim());
  const currentIndex = steps.indexOf(normalized.trim());
  const stepIndex = steps.indexOf(stepKey.trim());

  if (currentIndex === -1) {
    console.warn("Status not in timeline:", normalized);
    return { borderColor: "#ccc", color: "#ccc" };
  }

  if (stepIndex < currentIndex) {
    return { borderColor: "#C76C3F", color: "#C76C3F", backgroundColor: "transparent" };
  }

  if (stepIndex === currentIndex) {
    return { borderColor: "#C76C3F", color: "#fff", backgroundColor: "#C76C3F" };
  }

  return { borderColor: "#ccc", color: "#ccc", backgroundColor: "transparent" };
};

const TrackPage = () => {
  const [trackingId, setTrackingId] = useState("");
  const [loading, setLoading] = useState(false);
  const [trackingData, setTrackingData] = useState(null);
  const [error, setError] = useState(null);

  const handleTrack = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setTrackingData(null);

    try {
      const token = localStorage.getItem("token");

      const res = await axios.get(
        `http://localhost:5000/api/couriers/tracking/${trackingId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );


      let data = res.data;
      data.originalStatus = data.status; // Save the real status

      // Normalize for timeline display
      data.status =
        STATUS_MAP[data.status?.toLowerCase().trim()] || TIMELINE_STEPS[0].key;

      // Normalize status to exact match with timeline keys
      const normalizedStatus =
        STATUS_MAP[data.status?.toLowerCase().trim()] || TIMELINE_STEPS[0].key;
      data.status = normalizedStatus;

      // Calculate expected delivery date
      if (data.distanceInKm && data.createdAt) {
        const deliveryDays = Math.ceil(data.distanceInKm / 500) + 1;
        const estimatedDate = new Date(data.createdAt);
        estimatedDate.setDate(estimatedDate.getDate() + deliveryDays);
        data.expectedDelivery = estimatedDate.toISOString().split("T")[0];
      }

      setTrackingData(data);
    } catch (error) {
      console.error("Error fetching courier:", error);
      setError("Failed to fetch tracking details");
    }

    setLoading(false);
  };

  return (
    <div style={{ backgroundColor: "#FDFBD8", minHeight: "100vh", padding: "4rem 1rem" }}>
      <style>{`
        input.form-control:focus {
          outline: none !important;
          box-shadow: 0 0 6px 2px rgba(199, 108, 63, 0.7) !important;
          border-color: #C76C3F !important;
        }
        .timeline-wrapper {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 15px;
        }
        .timeline-row {
          display: flex;
          justify-content: center;
          gap: 28px;
          flex-wrap: wrap;
        }
        .timeline-step {
          flex: 1 1 25%;
          min-width: 70px;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
        }
        .timeline-icon {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          border: 4px solid;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          margin-bottom: 6px;
          transition: border-color 0.3s, color 0.3s;
        }
        .timeline-label {
          font-size: 13px;
          font-weight: 500;
          color: #333;
          white-space: normal;
          line-height: 1.2;
        }
        @media (max-width: 576px) {
          .timeline-step {
            min-width: 60px;
          }
          .timeline-icon {
            width: 40px;
            height: 40px;
            font-size: 16px;
          }
          .timeline-label {
            font-size: 11px;
          }
        }
      `}</style>

      <Container>
        <h2 className="text-center mb-4" style={{ color: "#C76C3F", fontWeight: 700 }}>
          <MdMyLocation style={{ marginRight: "10px", verticalAlign: "middle" }} />
          Track Your Parcel
        </h2>

        <Form onSubmit={handleTrack} className="mb-4">
          <Row className="justify-content-center">
            <Col md={8} lg={6}>
              <Form.Group controlId="trackingId">
                <Form.Control
                  type="text"
                  placeholder="Enter Tracking ID (e.g. TRK123456)"
                  value={trackingId}
                  onChange={(e) => setTrackingId(e.target.value)}
                  style={{ borderColor: "#C76C3F" }}
                  autoComplete="off"
                />
              </Form.Group>
              <div className="d-flex justify-content-center">
                <Button
                  type="submit"
                  className="mt-3 px-4"
                  style={{ backgroundColor: "#C76C3F", borderColor: "#C76C3F" }}
                  disabled={loading}
                >
                  {loading ? <Spinner animation="border" size="sm" /> : "Track Now"}
                </Button>
              </div>
            </Col>
          </Row>
        </Form>

        {error && (
          <Alert variant="danger" className="text-center">
            {error}
          </Alert>
        )}
        {trackingData &&
          trackingData.originalStatus?.toLowerCase() === "unable to deliver" && (
            <Alert variant="warning" className="text-center">
              ⚠️ Delivery could not be completed. Collect your parcel from the destination branch as soon as possible.
              {trackingData.unableToDeliverReason && (
                <div style={{ marginTop: "5px", fontWeight: "500" }}>
                  Reason: {trackingData.unableToDeliverReason}
                </div>
              )}
            </Alert>
          )}



        {trackingData && (
          <Card
            className="mx-auto"
            style={{
              maxWidth: "850px",
              borderColor: "#C76C3F",
              backgroundColor: "#FDFBD8",
            }}
          >
            <Card.Body>
              <Row className="mb-3">
                <Col md={6}>
                  <h5 style={{ color: "#C76C3F" }}>
                    <FaUser className="me-2" /> Sender: {trackingData.sender?.name}
                  </h5>
                  <h6>
                    <FaBoxOpen className="me-2" /> Weight: {trackingData.weight} Kg
                  </h6>
                </Col>
                <Col md={6}>
  <h5 style={{ color: "#C76C3F" }}>
    <FaUser className="me-2" /> Receiver: {trackingData.receiver?.name}
  </h5>
  <h6>
    <FaCalendarAlt className="me-2" /> Expected: {trackingData.expectedDelivery.split("-").reverse().join("-")}
  </h6>
  {trackingData.originalStatus?.toLowerCase() === "delivered" && trackingData.deliveryDate && (
    <h6 style={{ marginTop: "4px", color: "#28a745" }}>
      <FaCheckCircle className="me-2" /> Delivered On: {new Date(trackingData.deliveryDate).toISOString().split("T")[0].split("-").reverse().join("-")}
    </h6>
  )}
</Col>

              </Row>

              <div className="mb-4">
                <h5 style={{ color: "#C76C3F" }}>
                  <FaTruckMoving className="me-2" /> Current Status:{" "}
                  <Badge bg="warning" text="dark">
                    {trackingData.status}
                  </Badge>
                </h5>
              </div>

              <div className="text-center mt-5 mb-3">
                <div className="timeline-wrapper">
                  <div className="timeline-row">
                    {TIMELINE_STEPS.slice(0, 3).map((step, index) => (
                      <div key={index} className="timeline-step">
                        <div
                          className="timeline-icon"
                          style={getStepStyle(trackingData.status, step.key)}
                        >
                          {step.icon}
                        </div>
                        <div className="timeline-label">{step.label}</div>
                      </div>
                    ))}
                  </div>
                  <div className="timeline-row">
                    {TIMELINE_STEPS.slice(3).map((step, index) => (
                      <div key={index + 3} className="timeline-step">
                        <div
                          className="timeline-icon"
                          style={getStepStyle(trackingData.status, step.key)}
                        >
                          {step.icon}
                        </div>
                        <div className="timeline-label">{step.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Card.Body>
          </Card>
        )}
      </Container>
    </div>
  );
};

export default TrackPage;
