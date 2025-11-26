import React, { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import UserNavbar from "./Usernavbar"; 

const UserLayout = () => {
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
     
      <UserNavbar />
      <div >
        <Outlet />
      </div>
    </>
  );
};

export default UserLayout;
