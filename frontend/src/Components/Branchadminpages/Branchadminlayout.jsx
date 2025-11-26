import React, { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import BranchAdminSidebar from "./Branchadminsidebar"; // Make sure this component exists

const BranchAdminLayout = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="d-flex">
      <BranchAdminSidebar />
      <div
        className="flex-grow-1 p-3"
        style={{
          marginLeft: isMobile ? "0" : "260px",
          marginTop: isMobile ? "56px" : "0",
        }}
      >
        <Outlet />
      </div>
    </div>
  );
};

export default BranchAdminLayout;
