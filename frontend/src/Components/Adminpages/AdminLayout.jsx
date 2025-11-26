import React, { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";

const AdminLayout = () => {
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
      <AdminSidebar />
      <div
        className="flex-grow-1 p-3"
        style={{ marginLeft: isMobile ? "0" : "260px", marginTop: isMobile ? "56px" : "0" }}
      >
        <Outlet />
      </div>
    </div>
  );
};

export default AdminLayout;
