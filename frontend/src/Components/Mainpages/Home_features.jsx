import React, { useEffect } from "react";
import { Container, Row, Col, Card } from "react-bootstrap";
import {
  FaTruck,
  FaUsersCog,
  FaChartLine,
  FaEnvelopeOpenText,
  FaShieldAlt,
  FaDatabase,
} from "react-icons/fa";
import AOS from "aos";
import "aos/dist/aos.css";

const features = [
  {
    icon: <FaTruck size={60} />,
    title: "Real-time Courier Tracking",
  },
  {
    icon: <FaUsersCog size={60} />,
    title: "Branch, Branch Admin & Staff Management",
  },
  {
    icon: <FaChartLine size={60} />,
    title: "Smart Reports and Analytics",
  },
  {
    icon: <FaEnvelopeOpenText size={60} />,
    title: "Automatic Email Notifications",
  },
  {
    icon: <FaShieldAlt size={60} />,
    title: "Role-Based Access Control",
  },
  {
    icon: <FaDatabase size={60} />,
    title: "Secure Data Handling",
  },
];

const FeatureSection = () => {
  useEffect(() => {
    AOS.init({ duration: 800, once: true });
  }, []);

  return (
    <div style={{ backgroundColor: "#FDFBD8", padding: "60px 0" }}>
      <style>
        {`
          .feature-card {
            transition: all 0.3s ease;
          }

          .feature-card:hover {
            box-shadow: 0 4px 20px rgba(199, 108, 63, 0.5);
            transform: translateY(-5px);
          }
        `}
      </style>

      <Container>
        <h2 className="text-center mb-5" style={{ color: "#C76C3F" }}>
          Features We Offer
        </h2>
        <Row className="g-4">
          {features.map((feature, index) => (
            <Col key={index} md={4} sm={6} data-aos="fade-up">
              <Card className="text-center h-100 border-0 shadow-sm feature-card">
                <Card.Body
                  style={{
                    minHeight: "240px",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                  }}
                >
                  <div style={{ color: "#C76C3F" }} className="mb-3">
                    {feature.icon}
                  </div>
                  <Card.Title style={{ color: "#C76C3F", fontSize: "1.1rem" }}>
                    {feature.title}
                  </Card.Title>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>
    </div>
  );
};

export default FeatureSection;
