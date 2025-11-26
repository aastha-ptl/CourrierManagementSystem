import React from "react";
import { Container, Row, Col } from "react-bootstrap";

const Footer = () => {
  return (
    <footer>
      {/* Top Section */}
      <div
        style={{
          backgroundColor: "#C76C3F",  
          color: "#FDFBD8",            
          padding: "50px 0 30px",
          borderTop: "2px solid #C76C3F",
          textAlign: "center",
        }}
      >
        <Container>
          <Row>
            <Col>
              <h5 className="fw-bold mb-3">🚚 Simple Courier</h5>
              <p style={{ fontSize: "0.95rem", maxWidth: "600px", margin: "0 auto" }}>
                A comprehensive Courier Management System to streamline delivery, provide branch admin dashboards, manage staff branch-wise, allow users to register, track shipments in real-time using tracking IDs, view their shipment history, and generate smart reports
                 </p>
            </Col>
          </Row>
        </Container>
      </div>

      {/* Bottom Section */}
      <div
        style={{
          backgroundColor: "#C76C3F",  
          color: "#FDFBD8",           
          padding: "15px 0",
          textAlign: "center",
          fontSize: "0.85rem",
        }}
      >
        <Container>
          <p className="mb-1">
            &copy; {new Date().getFullYear()} Simple Courier — All Rights Reserved
          </p>
          <p>
            Designed and Developed by <strong>Aastha Patel</strong>
          </p>
        </Container>
      </div>
    </footer>
  );
};

export default Footer;
