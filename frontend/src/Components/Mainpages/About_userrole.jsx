import React from "react";
import { Container, Row, Col, Card } from "react-bootstrap";
import {
  FaUserShield,
  FaBuilding,
  FaUsers,
  FaUser,
  FaBoxOpen,
  FaChartBar,
} from "react-icons/fa";

const roles = [
  {
    title: "Super Admin",
    description:
      "Manage all branches and oversee operations with full control and supervision over the entire courier management system.",
    icon: <FaUserShield size={40} style={{ color: "#C76C3F" }} />,
  },
  {
    title: "Branch Admin",
    description:
      "Control couriers, assign staff, monitor deliveries, and ensure smooth branch operations.",
    icon: <FaBuilding size={40} style={{ color: "#C76C3F" }} />,
  },
  {
    title: "Staff",
    description:
      "Handle parcel pickups, drop-offs, updates, and customer interactions efficiently.",
    icon: <FaUsers size={40} style={{ color: "#C76C3F" }} />,
  },
  {
    title: "Customers",
    description:
      "Book, track, and view courier history through a user-friendly interface.",
    icon: <FaUser size={40} style={{ color: "#C76C3F" }} />,
  },
  {
    title: "Courier Services",
    description:
      "Deliver parcels quickly with real-time tracking support and timely notifications.",
    icon: <FaBoxOpen size={40} style={{ color: "#C76C3F" }} />,
  },
  {
    title: "Reports & Analytics",
    description:
      "Generate performance reports to make smarter operational decisions.",
    icon: <FaChartBar size={40} style={{ color: "#C76C3F" }} />,
  },
];

const UserRoles = () => {
  return (
    <div style={{ backgroundColor: "#FDFBD8", padding: "4rem 0" }}>
      <style>{`
        .role-card {
          transition: transform 0.3s ease, box-shadow 0.3s ease;
          cursor: pointer;
        }
        .role-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 8px 20px rgba(199, 108, 63, 0.4);
          border-color: #C76C3F;
        }
      `}</style>

      <Container>
        <h2 className="text-center mb-5" style={{ color: "#C76C3F" }}>
          Our System Roles & Services
        </h2>
        <Row className="g-4">
          {roles.map((role, idx) => (
            <Col key={idx} xs={12} md={6}>
              <Card
                className="d-flex flex-row align-items-center p-3 border role-card"
                style={{ borderColor: "#C76C3F", minHeight: "130px" }}
              >
                <div
                  style={{
                    minWidth: "90px",
                    height: "90px",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    backgroundColor: "#fff",
                    borderRadius: "8px",
                    boxShadow: "0 0 8px rgba(199, 108, 63, 0.2)",
                    marginRight: "1.5rem",
                    flexShrink: 0,
                  }}
                >
                  {role.icon}
                </div>
                <div>
                  <h5 style={{ color: "#C76C3F", marginBottom: "0.5rem" }}>
                    {role.title}
                  </h5>
                  <p style={{ marginBottom: 0, color: "#555" }}>
                    {role.description}
                  </p>
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>
    </div>
  );
};

export default UserRoles;
