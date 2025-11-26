import React, { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import StaffNavbar from "./Staffnavbar";

const StaffLayout = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <>
      {/* Navbar fixed on top */}
      <StaffNavbar />

      {/* Main content area with padding/margin to avoid overlap */}
      <div>
        <Outlet />
      </div>
    </>
  );
};

export default StaffLayout;
