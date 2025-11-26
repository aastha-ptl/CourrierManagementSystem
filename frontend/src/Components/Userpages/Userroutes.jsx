import React from "react";
import { Routes, Route } from "react-router-dom";
import UserLayout from "./Userlayout";
import Home from "../Mainpages/Home";
import About from "../Mainpages/About";
import Track from "../Mainpages/Track";
import CourierHistory from "./Courierhistory";
import UserProfile from "./Userprofile";
import Logout from "../Logout";
import Updateuserprofile from "./Updateuserprofile";
import PrivateRoute from "../Privateroute";
const UserRoutes = () => {
  return (
    <Routes>
      <Route path="/user" element={
        <PrivateRoute requiredRole="user">
          <UserLayout />
        </PrivateRoute>
      }>
        <Route index element={<Home />} />
        <Route path="about" element={<About />} />
        <Route path="track" element={<Track />} />
        <Route path="courier-history" element={<CourierHistory />} />
        <Route path="profile" element={<UserProfile />} />
        <Route path="updateprofile" element={<Updateuserprofile />} />
        <Route path="logout" element={<Logout />} />
      </Route>
    </Routes>
  );
};

export default UserRoutes;
