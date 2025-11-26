import React from 'react';
import { Routes, Route } from 'react-router-dom';
import BranchAdminLayout from './Branchadminlayout';
import BranchDashboard from './BranchDashboard';
import AddStaff from './Addstaff';
import ViewStaff from './Viewstaff';
import AddCourriers from './Addcourrier';
import PrivateRoute from '../Privateroute';
import SentCouriers from './ViewSentCouriers';
import ViewReceivedCouriers from './ViewReceivedCouriers';
import EstimateCourier from './Estimate_price';
import CourierReceipt from './CourierReceipt';
import UpdateProfile from'../Adminpages/UpdateProfile';
import GenerateCourierReport from './GenerateCourierReport';
import TransactionReport from './TransactionReport';

const BranchAdminRoutes = () => {
  return (
    <Routes>
      <Route path='/branchadmin' element={
        <PrivateRoute requiredRole="branchadmin">
        <BranchAdminLayout />
        </PrivateRoute>}>
        
        <Route index element={<BranchDashboard />} />
        <Route path='dashboard' element={<BranchDashboard />} />
        <Route path='sentcouriers' element={<SentCouriers />} />
        <Route path='receivedcouriers' element={<ViewReceivedCouriers />} />
        <Route path='addcourriers' element={<AddCourriers />} />
        <Route path='addstaff' element={<AddStaff />} />
        <Route path='viewstaff' element={<ViewStaff />} />
        <Route path='estimate-courier' element={<EstimateCourier />} />
        <Route path='courier-receipt' element={<CourierReceipt />} />
        <Route path='courier-report' element={<GenerateCourierReport />} />
        <Route path='transaction-report' element={<TransactionReport />} />
        <Route path='update-profile' element={<UpdateProfile />} />
      </Route>
    </Routes>
  );
};

export default BranchAdminRoutes;
