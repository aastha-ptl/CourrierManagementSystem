import React, { useState } from "react";
import { Navbar, Nav, Container } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { FiMenu } from "react-icons/fi";
import logo from "../../image/logo_final.png"; 

const StaffNavbar = () => {
  const [expanded, setExpanded] = useState(false);
  const navigate = useNavigate();

  const handleNavClick = () => setExpanded(false);

  const handleLogout = () => {
    // close navbar first
    setExpanded(false);
    // clear auth data
    try {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    } catch (e) {
      // ignore storage errors
      console.warn('Error clearing localStorage during logout', e);
    }
    // redirect to login
    navigate('/login');
  };

  return (
    <>
      <style>
        {`
          .custom-navbar-toggle:focus {
            outline: none !important;
            box-shadow: none !important;
            border: none !important;
          }
          .nav-link {
            color: #FDFBD8 !important;
            background-color: transparent !important;
            transition: color 0.3s ease;
          }
          .nav-link:hover, .nav-link:focus {
            color: #ffffff !important;
            background-color: transparent !important;
          }
          .navbar-brand {
            color: #FDFBD8 !important;
          }
          .navbar-brand:hover, .navbar-brand:focus {
            color: #ffffff !important;
            background-color: transparent !important;
          }
          body {
            padding-top: 55px;
          }
        `}
      </style>

      <Navbar
        fixed="top"
        expand="lg"
        expanded={expanded}
        onToggle={(isExpanded) => setExpanded(isExpanded)}
        style={{ backgroundColor: "#C76C3F" }}
        className="shadow-sm"
      >
        <Container>
          <Navbar.Brand
            as={Link}
            to="/staff/home"
            className="d-flex align-items-center gap-2"
            onClick={handleNavClick}
          >
            <img
              src={logo}
              alt="Logo"
              style={{
                height: "45px",
                width: "auto",
                objectFit: "contain",
              }}
            />
          </Navbar.Brand>

          <Navbar.Toggle
            aria-controls="staff-navbar-nav"
            className="custom-navbar-toggle"
            style={{
              backgroundColor: "#C76C3F",
              border: "none",
              padding: "6px 10px",
              borderRadius: "4px",
            }}
          >
            <FiMenu color="#FDFBD8" size={28} />
          </Navbar.Toggle>

          <Navbar.Collapse id="staff-navbar-nav" className="justify-content-end">
            <Nav className="align-items-center gap-3">
              <Nav.Link as={Link} to="/staff/" onClick={handleNavClick}>
                Home
              </Nav.Link>
              <Nav.Link as={Link} to="/staff/about" onClick={handleNavClick}>
                About
              </Nav.Link>
              <Nav.Link as={Link} to="/staff/assigned" onClick={handleNavClick}>
                Assigned Couriers
              </Nav.Link>
              <Nav.Link as={Link} to="/staff/profile" onClick={handleNavClick}>
                Profile
              </Nav.Link>
              <Nav.Link onClick={() => { handleLogout(); }}>
                Logout
              </Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </>
  );
};

export default StaffNavbar;
