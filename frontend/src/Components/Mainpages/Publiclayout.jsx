import React, { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import PublicNavbar from "./Publicnavbar";

const PublicLayout = () => {
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
      <PublicNavbar />

      {/* Main content area with some padding, margin to avoid navbar overlap */}
      <div>
        <Outlet />
      </div>
    </>
  );
};

export default PublicLayout;
