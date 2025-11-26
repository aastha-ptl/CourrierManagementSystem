import React, { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  BsHouseDoorFill,
  BsPeopleFill,
  BsBoxSeam,
  BsBarChartFill,
  BsSearch,
  BsList,
  BsXLg,
  BsChevronDown,
  BsChevronLeft,
  BsPersonCircle,
  BsKeyFill,
  BsBoxArrowRight,
  BsPlusCircleFill,
  BsEyeFill,
  BsPencilSquare,
  BsCalculator,
  BsPersonFill
} from "react-icons/bs";
import { FaRupeeSign, FaFileAlt } from "react-icons/fa";
import "../../css/Branchadminsidebar.css";
import logo from "../../image/logo_final.png";

const BranchAdminSidebar = () => {
  const [showSidebar, setShowSidebar] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [dropdowns, setDropdowns] = useState({
    staff: false,
    courier: false,
    reports: false,
    profile: false,
  });

  const toggleDropdown = (key) => {
    setDropdowns((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleResize = () => {
    const mobile = window.innerWidth < 768;
    setIsMobile(mobile);
    if (!mobile) setShowSidebar(true);
  };

  useEffect(() => {
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleNavClick = () => {
    if (isMobile) setShowSidebar(false);
  };

  const navigate = useNavigate();

  const handleLogout = () => {
    // clear auth token and user info
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    if (isMobile) setShowSidebar(false);
    navigate('/login');
  };

  return (
    <>
      {/* Mobile Top Bar */}
      {isMobile && (
        <div
          className="d-flex justify-content-between align-items-center px-3 py-2 position-fixed top-0 w-100 z-3 text-white"
          style={{ backgroundColor: "#C76C3F", height: "48px" }}
        >
          <div className="d-flex align-items-center">
            <img
              src={logo}
              alt="Logo"
              style={{
                height: "40px",
                width: "auto",
                objectFit: "contain",
                imageRendering: "auto",
              }}
            />
          </div>
          <button className="btn text-white" onClick={() => setShowSidebar(!showSidebar)}>
            {showSidebar ? <BsXLg /> : <BsList />}
          </button>
        </div>
      )}

      {/* Sidebar */}
      {showSidebar && (
        <div
          className={`d-flex flex-column flex-shrink-0 p-3 text-white vh-100 position-fixed z-2 ${isMobile ? "pt-5" : ""}`}
          style={{ width: "260px", top: 0, left: 0, backgroundColor: "#C76C3F" }}
        >
          {/* Logo & Title */}
          <div className="text-center mt-2 mb-3">
            {!isMobile && (
              <img
                src={logo}
                alt="Logo"
                style={{
                  height: "70px",
                  width: "auto",
                  objectFit: "contain",
                  imageRendering: "auto",
                  marginBottom: "6px",
                }}
              />
            )}
            <div
              className="fw-bold fs-5 d-flex justify-content-center align-items-center text-white"
              style={{ gap: "5px" }}
            >
              <BsPersonCircle size={30} />
              <span>Branch Admin Panel</span>
            </div>
          </div>

          {/* Menu */}
          <ul className="nav nav-pills flex-column mt-2">
            <li>
              <NavLink
                to="/branchadmin/dashboard"
                className={({ isActive }) =>
                  `nav-link text-white ${isActive ? "active-custom-bg" : ""}`
                }
                onClick={handleNavClick}
              >
                <BsHouseDoorFill className="me-2" />
                Dashboard
              </NavLink>
            </li>

            {/* Staff Management */}
            <li>
              <div
                className="nav-link text-white d-flex justify-content-between align-items-center"
                onClick={() => toggleDropdown("staff")}
                style={{ cursor: "pointer" }}
              >
                <span>
                  <BsPeopleFill className="me-2" />
                  Staff Management
                </span>
                {dropdowns.staff ? <BsChevronDown /> : <BsChevronLeft />}
              </div>
              {dropdowns.staff && (
                <ul className="list-unstyled ps-3">
                  <li>
                    <NavLink
                      to="/branchadmin/viewstaff"
                      className={({ isActive }) =>
                        `nav-link text-white ${isActive ? "active-custom-bg" : ""}`
                      }
                      onClick={handleNavClick}
                    >
                      <BsEyeFill className="me-2" /> View Staff
                    </NavLink>
                  </li>
                  <li>
                    <NavLink
                      to="/branchadmin/addstaff"
                      className={({ isActive }) =>
                        `nav-link text-white ${isActive ? "active-custom-bg" : ""}`
                      }
                      onClick={handleNavClick}
                    >
                      <BsPlusCircleFill className="me-2" /> Add Staff
                    </NavLink>
                  </li>
                </ul>
              )}
            </li>

            {/* Courier Management */}
            <li>
              <div
                className="nav-link text-white d-flex justify-content-between align-items-center"
                onClick={() => toggleDropdown("courier")}
                style={{ cursor: "pointer" }}
              >
                <span>
                  <BsBoxSeam className="me-2" />
                  Courier Management
                </span>
                {dropdowns.courier ? <BsChevronDown /> : <BsChevronLeft />}
              </div>
              {dropdowns.courier && (
                <ul className="list-unstyled ps-3">
                  <li>
                    <NavLink
                      to="/branchadmin/sentcouriers"
                      className={({ isActive }) =>
                        `nav-link text-white ${isActive ? "active-custom-bg" : ""}`
                      }
                      onClick={handleNavClick}
                    >
                      <BsBoxSeam className="me-2" /> Sent Couriers
                    </NavLink>
                  </li>
                  <li>
                    <NavLink
                      to="/branchadmin/receivedcouriers"
                      className={({ isActive }) =>
                        `nav-link text-white ${isActive ? "active-custom-bg" : ""}`
                      }
                      onClick={handleNavClick}
                    >
                      <BsBoxSeam className="me-2" /> Received Couriers
                    </NavLink>
                  </li>
                  <li>
                    <NavLink
                      to="/branchadmin/addcourriers"
                      className={({ isActive }) =>
                        `nav-link text-white ${isActive ? "active-custom-bg" : ""}`
                      }
                      onClick={handleNavClick}
                    >
                      <BsPlusCircleFill className="me-2" /> Add New Courier
                    </NavLink>
                  </li>
                </ul>
              )}
            </li>

            {/* Estimate Courier Price */}
            <li>
              <NavLink
                to="/branchadmin/estimate-courier"
                className={({ isActive }) =>
                  `nav-link text-white ${isActive ? "active-custom-bg" : ""}`
                }
                onClick={handleNavClick}
              >
                <BsCalculator className="me-2" /> Estimate Courier Price
              </NavLink>
            </li>

            {/* Reports */}
            <li>
              <div
                className="nav-link text-white d-flex justify-content-between align-items-center"
                onClick={() => toggleDropdown("reports")}
                style={{ cursor: "pointer" }}
              >
                <span>
                  <FaFileAlt className="me-2" />
                  Reports
                </span>
                {dropdowns.reports ? <BsChevronDown /> : <BsChevronLeft />}
              </div>
              {dropdowns.reports && (
                <ul className="list-unstyled ps-3">
                  <li>
                    <NavLink
                      to="/branchadmin/courier-report"
                      className={({ isActive }) =>
                        `nav-link text-white ${isActive ? "active-custom-bg" : ""}`
                      }
                      onClick={handleNavClick}
                    >
                      <BsBoxSeam className="me-2" /> Courier Report
                    </NavLink>
                  </li>
                  <li>
                    <NavLink
                      to="/branchadmin/transaction-report"
                      className={({ isActive }) =>
                        `nav-link text-white ${isActive ? "active-custom-bg" : ""}`
                      }
                      onClick={handleNavClick}
                    >
                      <FaRupeeSign className="me-2" /> Transaction Report
                    </NavLink>
                  </li>
                </ul>
              )}
            </li>
          </ul>

          {/* Profile Settings */}
          <div className="mt-auto">
            <div
              className="nav-link text-white d-flex justify-content-between align-items-center"
              onClick={() => toggleDropdown("profile")}
              style={{ cursor: "pointer" }}
            >
              <span>⚙️ Profile & Settings</span>
              {dropdowns.profile ? <BsChevronDown /> : <BsChevronLeft />}
            </div>
            {dropdowns.profile && (
              <ul className="list-unstyled ps-3">
                <li>
                  <NavLink
                    to="/branchadmin/update-profile"
                    className={({ isActive }) => `nav-link text-white ${isActive ? "active-custom-bg" : ""}`}
                    onClick={handleNavClick}
                  >
                    <BsPersonFill className="me-2" /> Update Profile
                  </NavLink>

                </li>
                <li>
                  <a
                    href="#"
                    className="nav-link text-white"
                    onClick={(e) => { e.preventDefault(); handleLogout(); }}
                  >
                    <BsBoxArrowRight className="me-2" /> Logout
                  </a>
                </li>
              </ul>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default BranchAdminSidebar;
