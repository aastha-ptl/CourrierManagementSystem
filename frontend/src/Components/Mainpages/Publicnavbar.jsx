import React, { useState } from "react";
import { Navbar, Nav, Container } from "react-bootstrap";
import { Link } from "react-router-dom";
import { FiMenu } from "react-icons/fi";
import logo from "../../image/logo_final.png";

const PublicNavbar = () => {
  const [expanded, setExpanded] = useState(false);

  const handleNavClick = () => setExpanded(false);

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
    .navbar {
      padding-top: 0.25rem !important;
      padding-bottom: 0.25rem !important;
      background-color: #B85E2F !important; 
    }
  `}
</style>


       <Navbar
  fixed="top"
  expand="lg"
  expanded={expanded}
  onToggle={(isExpanded) => setExpanded(isExpanded)}
  className="navbar"
>

        <Container>
          <Navbar.Brand
            as={Link}
            to="/"
            className="d-flex align-items-center"
            onClick={handleNavClick}
          >
            <img
              src={logo}
              alt="Logo"
              style={{
                height: "50px",
                width: "auto",
                objectFit: "contain",
                imageRendering: "auto",

              }}
            />
          </Navbar.Brand>


          <Navbar.Toggle
            aria-controls="basic-navbar-nav"
            className="custom-navbar-toggle"
            style={{
              backgroundColor: "#FDFBD8",
              border: "none",
              padding: "6px 10px",
              borderRadius: "4px",
            }}
          >
            <FiMenu color="#C76C3F" size={28} />
          </Navbar.Toggle>

          <Navbar.Collapse id="basic-navbar-nav" className="justify-content-end">
            <Nav className="align-items-center gap-3">
              <Nav.Link as={Link} to="/" onClick={handleNavClick}>
                Home
              </Nav.Link>
              <Nav.Link as={Link} to="/about" onClick={handleNavClick}>
                About
              </Nav.Link>
              <Nav.Link as={Link} to="/track" onClick={handleNavClick}>
                Track
              </Nav.Link>
              <Nav.Link as={Link} to="/register" className="fw-semibold" onClick={handleNavClick}>
                Register
              </Nav.Link>
              <Nav.Link as={Link} to="/login" className="fw-semibold" onClick={handleNavClick}>
                Login
              </Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </>
  );
};

export default PublicNavbar;