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
  BsEyeFill,
  BsPlusCircleFill,
  BsPersonGear,
  BsKeyFill,
  BsBoxArrowRight,
  BsBuilding,
  BsPersonBadgeFill,
  BsPersonLinesFill,
  BsPersonFill
} from "react-icons/bs";
import { FaRupeeSign, FaFileAlt } from "react-icons/fa";
import "../../css/AdminSidebar.css";
import logo from "../../image/logo_final.png";

const AdminSidebar = () => {
  const [showSidebar, setShowSidebar] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [dropdowns, setDropdowns] = useState({
    branch: false,
    branchAdmin: false,
    staff: false,
    users: false,
    courier: false,
    reports: false,
  });
  const [showAccountDropdown, setShowAccountDropdown] = useState(false);

  const toggleDropdown = (key) => {
    setDropdowns((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) setShowSidebar(true);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleNavClick = () => {
    if (isMobile) setShowSidebar(false);
  };

  const navigate = useNavigate();

  const handleLogout = () => {
    // remove token and user data
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    // close sidebar on mobile
    if (isMobile) setShowSidebar(false);
    // redirect to login
    navigate('/login');
  };

  return (
    <>
      {isMobile && (
        <div
          className="d-flex justify-content-between align-items-center px-3 py-2 position-fixed top-0 w-100 z-3 text-white"
          style={{ backgroundColor: "#C76C3F" }}
        >
          <span className="fs-5 d-flex align-items-center">
            <img
              src={logo}
              alt="Logo"
              style={{
                height: "60px",
                width: "auto",
                objectFit: "contain",
                imageRendering: "auto",
              }}
            />
          </span>
          <button
            className="btn text-white"
            onClick={() => setShowSidebar(!showSidebar)}
          >
            {showSidebar ? <BsXLg /> : <BsList />}
          </button>
        </div>
      )}

      {showSidebar && (
        <div
          className={`d-flex flex-column flex-shrink-0 text-white vh-100 position-fixed z-2 ${isMobile ? "pt-5" : ""}`}
          style={{
            width: "260px",
            top: 0,
            left: 0,
            backgroundColor: "#C76C3F",
            overflowY: "auto",
            paddingLeft: "10px",
            paddingRight: "10px",
          }}
        >
          {/* Top Logo + Admin Panel */}
          {/* Super Admin Panel heading (always show) */}
          <div className="text-center mt-4">
            {/* Show logo only in desktop view */}
            {!isMobile && (
              <img
                src={logo}
                alt="Logo"
                style={{
                  height: "60px",
                  width: "auto",
                  objectFit: "contain",
                  imageRendering: "auto",
                  margin: "0 auto",
                  display: "block",
                }}
              />
            )}

            {/* This part always visible */}
            <div className="mt-2 fw-bold fs-5 d-flex justify-content-center align-items-center text-white">
              <BsPersonGear className="me-2" size={30} />
              Super Admin Panel
            </div>
          </div>

          {/* Navigation Items */}
          <ul className="nav nav-pills flex-column mt-4 px-2">
            <li>
              <NavLink to="/admin/dashboard" className={({ isActive }) => `nav-link text-white ${isActive ? "active-custom-bg" : ""}`} onClick={handleNavClick}>
                <BsHouseDoorFill className="me-2" /> Dashboard
              </NavLink>
            </li>

            {/* Branch */}
            <li>
              <div className="nav-link text-white d-flex justify-content-between align-items-center" onClick={() => toggleDropdown("branch")} style={{ cursor: "pointer" }}>
                <span><BsBuilding className="me-2" /> Branch Management</span>
                {dropdowns.branch ? <BsChevronDown /> : <BsChevronLeft />}
              </div>
              {dropdowns.branch && (
                <ul className="list-unstyled ps-3">
                  <li>
                    <NavLink to="/admin/viewbranches" className={({ isActive }) => `nav-link text-white ${isActive ? "active-custom-bg" : ""}`} onClick={handleNavClick}>
                      <BsEyeFill className="me-2" /> View Branches
                    </NavLink>
                  </li>
                  <li>
                    <NavLink to="/admin/addbranch" className={({ isActive }) => `nav-link text-white ${isActive ? "active-custom-bg" : ""}`} onClick={handleNavClick}>
                      <BsPlusCircleFill className="me-2" /> Add Branch
                    </NavLink>
                  </li>
                </ul>
              )}
            </li>

            {/* Branch Admin */}
            <li>
              <div className="nav-link text-white d-flex justify-content-between align-items-center" onClick={() => toggleDropdown("branchAdmin")} style={{ cursor: "pointer" }}>
                <span><BsPersonBadgeFill className="me-2" /> Branch Admins</span>
                {dropdowns.branchAdmin ? <BsChevronDown /> : <BsChevronLeft />}
              </div>
              {dropdowns.branchAdmin && (
                <ul className="list-unstyled ps-3">
                  <li>
                    <NavLink to="/admin/viewbranchadmin" className={({ isActive }) => `nav-link text-white ${isActive ? "active-custom-bg" : ""}`} onClick={handleNavClick}>
                      <BsEyeFill className="me-2" /> View Branch Admins
                    </NavLink>
                  </li>
                  <li>
                    <NavLink to="/admin/addbranchadmin" className={({ isActive }) => `nav-link text-white ${isActive ? "active-custom-bg" : ""}`} onClick={handleNavClick}>
                      <BsPlusCircleFill className="me-2" /> Add Branch Admin
                    </NavLink>
                  </li>
                </ul>
              )}
            </li>

            {/* Staff */}
            <li>
              <div className="nav-link text-white d-flex justify-content-between align-items-center" onClick={() => toggleDropdown("staff")} style={{ cursor: "pointer" }}>
                <span><BsPeopleFill className="me-2" /> Staff</span>
                {dropdowns.staff ? <BsChevronDown /> : <BsChevronLeft />}
              </div>
              {dropdowns.staff && (
                <ul className="list-unstyled ps-3">
                  <li>
                    <NavLink to="/admin/viewstaff" className={({ isActive }) => `nav-link text-white ${isActive ? "active-custom-bg" : ""}`} onClick={handleNavClick}>
                      <BsEyeFill className="me-2" /> View Staff
                    </NavLink>
                  </li>
                  <li>
                    <NavLink to="/admin/unassigned-users" className={({ isActive }) => `nav-link text-white ${isActive ? "active-custom-bg" : ""}`} onClick={handleNavClick}>
                      <BsPersonFill className="me-2" /> Manage Unassigned
                    </NavLink>
                  </li>
                </ul>
              )}
            </li>

            {/* Users */}
            <li>
              <div className="nav-link text-white d-flex justify-content-between align-items-center" onClick={() => toggleDropdown("users")} style={{ cursor: "pointer" }}>
                <span><BsPersonLinesFill className="me-2" /> Users</span>
                {dropdowns.users ? <BsChevronDown /> : <BsChevronLeft />}
              </div>
              {dropdowns.users && (
                <ul className="list-unstyled ps-3">
                  <li>
                    <NavLink to="/admin/viewusers" className={({ isActive }) => `nav-link text-white ${isActive ? "active-custom-bg" : ""}`} onClick={handleNavClick}>
                      <BsEyeFill className="me-2" /> View Users
                    </NavLink>
                  </li>
                </ul>
              )}
            </li>

            {/* Couriers */}
            <li>
              <div className="nav-link text-white d-flex justify-content-between align-items-center" onClick={() => toggleDropdown("courier")} style={{ cursor: "pointer" }}>
                <span><BsBoxSeam className="me-2" /> Couriers</span>
                {dropdowns.courier ? <BsChevronDown /> : <BsChevronLeft />}
              </div>
              {dropdowns.courier && (
                <ul className="list-unstyled ps-3">
                  <li>
                    <NavLink to="/admin/viewcourriers" className={({ isActive }) => `nav-link text-white ${isActive ? "active-custom-bg" : ""}`} onClick={handleNavClick}>
                      <BsEyeFill className="me-2" /> View Couriers
                    </NavLink>
                  </li>
                </ul>
              )}
            </li>

            {/* Reports */}
            <li>
              <div className="nav-link text-white d-flex justify-content-between align-items-center" onClick={() => toggleDropdown("reports")} style={{ cursor: "pointer" }}>
                <span><FaFileAlt className="me-2" /> Reports</span>
                {dropdowns.reports ? <BsChevronDown /> : <BsChevronLeft />}
              </div>
              {dropdowns.reports && (
                <ul className="list-unstyled ps-3">
                  <li>
                    <NavLink to="/admin/courier-report" className={({ isActive }) => `nav-link text-white ${isActive ? "active-custom-bg" : ""}`} onClick={handleNavClick}>
                      <BsBoxSeam className="me-2" /> Courier Report
                    </NavLink>
                  </li>
                  <li>
                    <NavLink to="/admin/transaction-report" className={({ isActive }) => `nav-link text-white ${isActive ? "active-custom-bg" : ""}`} onClick={handleNavClick}>
                      <FaRupeeSign className="me-2" /> Transaction Report
                    </NavLink>
                  </li>
                </ul>
              )}
            </li>

            {/* Analytics */}
            <li>
              <NavLink to="/admin/analytics" className={({ isActive }) => `nav-link text-white ${isActive ? "active-custom-bg" : ""}`} onClick={handleNavClick}>
                <BsBarChartFill className="me-2" /> Analytics
              </NavLink>
            </li>
          </ul>

          {/* Manage Account */}
          <div className="mt-auto px-3 pb-3">
            <div className="nav-link text-white d-flex justify-content-between align-items-center" style={{ cursor: "pointer" }} onClick={() => setShowAccountDropdown(!showAccountDropdown)}>
              <span><BsPersonGear className="me-2" /> Manage Account</span>
              {showAccountDropdown ? <BsChevronDown /> : <BsChevronLeft />}
            </div>
            {showAccountDropdown && (
              <ul className="list-unstyled ps-3">
                <li>
                  <NavLink
                    to="/admin/update-profile"
                    className={({ isActive }) => `nav-link text-white ${isActive ? "active-custom-bg" : ""}`}
                    onClick={handleNavClick}
                  >
                    <BsPersonFill className="me-2" /> Update Profile
                  </NavLink>

                </li>
                <li>
                  <a href="#" className="nav-link text-white" onClick={(e) => { e.preventDefault(); handleLogout(); }}>
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

export default AdminSidebar;
