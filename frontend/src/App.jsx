// App.jsx
import { useEffect, useState } from 'react';
import { jwtDecode } from 'jwt-decode';
import Branchadminroutes from './Components/Branchadminpages/Branchadminroutes';
import './App.css';
import AdminRoutes from './Components/Adminpages/AdminRoutes';
import Publicroutes from './Components/Mainpages/Publicroutes';
import StaffRoutes from './Components/Staffpages/Staffroutes';
import UserRoutes from './Components/Userpages/Userroutes';

function App() {
 

  return (
    <>
      <AdminRoutes />
      <Branchadminroutes />
      <Publicroutes/>   
      <StaffRoutes />
      <UserRoutes />
     
    </>
  );
}

export default App;
