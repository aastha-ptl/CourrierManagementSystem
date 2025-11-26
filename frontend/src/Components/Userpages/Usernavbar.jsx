import React, { useState } from "react";
import { Navbar, Nav, Container } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { FiMenu } from "react-icons/fi";
import logo from "../../image/logo_final.png"; 

const UserNavbar = () => {
  const [expanded, setExpanded] = useState(false);
  const navigate = useNavigate();

  const handleNavClick = () => setExpanded(false);

  const handleLogout = () => {
    setExpanded(false);
    try {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    } catch (e) {
      console.warn('Error clearing localStorage during logout', e);
    }
    navigate('/login');
  };

  return (
    <>
      <style>
        {`
          :root {
            --navbar-bg-color: #C76C3F;
            --navbar-text-color: #FDFBD8;
            --navbar-text-hover: #ffffff;
          }
          .custom-navbar-toggle:focus {
            outline: none !important;
            box-shadow: none !important;
            border: none !important;
          }
          .nav-link {
            color: var(--navbar-text-color) !important;
            background-color: transparent !important;
            transition: color 0.3s ease;
          }
          .nav-link:hover, .nav-link:focus {
            color: var(--navbar-text-hover) !important;
            background-color: transparent !important;
          }
          .navbar-brand {
            color: var(--navbar-text-color) !important;
          }
          .navbar-brand:hover, .navbar-brand:focus {
            color: var(--navbar-text-hover) !important;
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
        style={{ backgroundColor: "var(--navbar-bg-color)" }}
        className="shadow-sm"
      >
        <Container>
          <Navbar.Brand
            as={Link}
            to="/user/home"
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
            aria-controls="user-navbar-nav"
            className="custom-navbar-toggle"
            style={{
              backgroundColor: "var(--navbar-bg-color)",
              border: "none",
              padding: "6px 10px",
              borderRadius: "4px",
            }}
          >
            <FiMenu color="var(--navbar-text-color)" size={28} />
          </Navbar.Toggle>

          <Navbar.Collapse id="user-navbar-nav" className="justify-content-end">
            <Nav className="align-items-center gap-3">
              <Nav.Link as={Link} to="/user/" onClick={handleNavClick}>
                Home
              </Nav.Link>
              <Nav.Link as={Link} to="/user/about" onClick={handleNavClick}>
                About
              </Nav.Link>
              <Nav.Link as={Link} to="/user/track" onClick={handleNavClick}>
                Track
              </Nav.Link>
              <Nav.Link
                as={Link}
                to="/user/courier-history"
                onClick={handleNavClick}
              >
                Courier History
              </Nav.Link>
              <Nav.Link as={Link} to="/user/profile" onClick={handleNavClick}>
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

export default UserNavbar;
