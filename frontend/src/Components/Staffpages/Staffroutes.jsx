import React from 'react';
import { Routes, Route } from 'react-router-dom';
import StaffLayout from './StaffLayout';

// Import Home and About from Mainpages
import Home from '../Mainpages/Home';
import About from '../Mainpages/About';

// Import other staff pages from the same folder
import AssignedCouriers from './Assignedcourier';
import Profile from './Staffprofile';
import Logout from '../Logout';
import UpdateProfile from './Updatestaffprofile';
import PrivateRoute from '../Privateroute';
const StaffRoutes = () => {
  return (
    <Routes>
      <Route path="/staff" element={
        <PrivateRoute requiredRole="staff">
          <StaffLayout />
        </PrivateRoute>
      }>
        <Route index element={<Home />} />
        <Route path="about" element={<About />} />
        <Route path="assigned" element={<AssignedCouriers />} />
        <Route path="profile" element={<Profile />} />
        <Route path="updateprofile" element={<UpdateProfile />} />
        <Route path="logout" element={<Logout />} />
      </Route>
    </Routes>

  );
};

export default StaffRoutes;
