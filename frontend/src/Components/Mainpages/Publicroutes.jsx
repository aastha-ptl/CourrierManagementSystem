import React from 'react';
import { Routes, Route } from 'react-router-dom';
import PublicLayout from './Publiclayout';

// Import your public page components
import Home from './Home';
import About from './About';
import Track from './Track';
import Contact from './Contact';
import Register from '../Register';
import Login from '../Login';
import ForgotPassword from '../Forgetpassword';

const PublicRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<PublicLayout />}>
        <Route index element={<Home />} />           
        <Route path="about" element={<About />} />
        <Route path="track" element={<Track />} />
        <Route path="contact" element={<Contact />} />
        <Route path="register" element={<Register />} />
        <Route path="login" element={<Login />} />
        <Route path="forgot-password" element={<ForgotPassword />} />
      </Route>
    </Routes>
  );
};

export default PublicRoutes;
