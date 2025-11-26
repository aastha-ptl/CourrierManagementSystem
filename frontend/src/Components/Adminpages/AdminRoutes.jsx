import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Addbranch from './Addbranch'
import Addbranchadmin from './Addbranchadmin'
import Viewbranchadmin from './Viewbranchadmin'
import Viewbranch from './Viewbranch'
import Viewcourrier from './Viewcourrier'
import Viewstaff from './Viewstaff'
import Viewusers from './Viewusers'
import AdminLayout from './AdminLayout'
import Admindashboard from './Admindashboard'
import PrivateRoute from '../Privateroute'
import UpdateProfile from './UpdateProfile'
import GenerateReport from './GenerateReport'
import TransactionReport from './TransactionReport'
import Analytics from './Analytics'
import UnassignedUsers from './UnassignedUsers'

const AdminRoutes = () => {
  return (
    <>
      <Routes>
        <Route
          path="/admin"
          element={
            <PrivateRoute requiredRole="admin">
              <AdminLayout />
            </PrivateRoute>
          }
        >
          <Route index element={<Admindashboard />} />
          <Route path='dashboard' element={<Admindashboard />} />
          <Route path='addbranch' element={<Addbranch />} />
          <Route path='addbranchadmin' element={<Addbranchadmin />} />
          <Route path='viewbranchadmin' element={<Viewbranchadmin />} />
          <Route path='viewbranches' element={<Viewbranch />} />
          <Route path='viewcourriers' element={<Viewcourrier />} />
          <Route path='viewstaff' element={<Viewstaff />} />
          <Route path='viewusers' element={<Viewusers />} />
          <Route path='unassigned-users' element={<UnassignedUsers />} />
          <Route path="update-profile" element={<UpdateProfile />} />
          <Route path="courier-report" element={<GenerateReport />} />
          <Route path="transaction-report" element={<TransactionReport />} />
          <Route path="analytics" element={<Analytics />} />
        </Route>
      </Routes>
    </>
  )
}

export default AdminRoutes