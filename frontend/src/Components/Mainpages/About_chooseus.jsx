import React, { useEffect } from "react";
import { Container, Row, Col, Card } from "react-bootstrap";
import {
  FaUsers,
  FaEnvelopeOpenText,
  FaShippingFast,
  FaLock,
  FaChartLine,
  FaCogs,
} from "react-icons/fa";
import AOS from "aos";
import "aos/dist/aos.css";

const points = [
  {
    icon: <FaUsers size={70} color="#C76C3F" />,
    title: "Simplified Workflow",
    description: "Streamlined processes tailored for every user role.",
  },
  {
    icon: <FaEnvelopeOpenText size={70} color="#C76C3F" />,
    title: "Real-time Email Notifications",
    description: "Send tracking IDs and updates instantly to recipients.",
  },
  {
    icon: <FaShippingFast size={70} color="#C76C3F" />,
    title: "Efficient Courier Tracking",
    description: "Track shipments in real time with high accuracy.",
  },
  {
    icon: <FaLock size={70} color="#C76C3F" />,
    title: "Secure Data Handling",
    description: "Your data is encrypted and securely managed at all times.",
  },
  {
    icon: <FaChartLine size={70} color="#C76C3F" />,
    title: "Scalable Network",
    description: "Designed to grow with small and large courier networks.",
  },
  {
    icon: <FaCogs size={70} color="#C76C3F" />,
    title: "User-friendly Interface",
    description: "Easy to navigate and operate for all users.",
  },
];

const WhyChooseUs = () => {
  useEffect(() => {
    AOS.init({ duration: 800, once: true });
  }, []);

  return (
    <div style={{ backgroundColor: "#FDFBD8", padding: "60px 0" }}>
      <style>{`
        .feature-card {
          border-left: 5px solid #C76C3F;
          background-color: white;
          padding: 20px;
          transition: box-shadow 0.3s ease, transform 0.3s ease;
          cursor: pointer;
        }
        .feature-card:hover {
          box-shadow: 0 8px 20px rgba(199, 108, 63, 0.4);
          transform: translateY(-6px);
        }
        .icon-wrapper {
          width: 90px;
          height: 90px;
          margin-bottom: 20px;
          display: flex;
          justify-content: center;
          align-items: center;
          border-radius: 50%;
          background-color: #C76C3F20;
          transition: background-color 0.3s ease;
        }
        .feature-card:hover .icon-wrapper {
          background-color: #C76C3F40;
        }
      `}</style>

      <Container>
        <h2
          className="text-center mb-5"
          style={{ color: "#C76C3F", fontWeight: "700" }}
        >
          Why Choose Our Courier Management System
        </h2>

        <Row className="g-4">
          {points.map((point, idx) => (
            <Col key={idx} md={6} lg={4} data-aos="fade-up">
              <Card className="feature-card h-100 border-0 shadow-sm">
                <div className="icon-wrapper">{point.icon}</div>
                <Card.Title style={{ color: "#C76C3F", fontWeight: "600" }}>
                  {point.title}
                </Card.Title>
                <Card.Text style={{ color: "#444" }}>{point.description}</Card.Text>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>
    </div>
  );
};

export default WhyChooseUs;
