import React, { useState, useEffect } from 'react';
import background2 from "../../image/background2.jpg";


const HeroSection = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const heroStyle = {
    width: '100%',
    height: isMobile ? '40vh' : '100vh',  
    backgroundImage: `url(${background2})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    position: 'relative',
    color: '#fff',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
  };

  const overlayStyle = {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0,0,0,0.4)',
    zIndex: 1,
  };

  const contentStyle = {
    position: 'relative',
    zIndex: 2,
    padding: '0 20px',
  };

  return (
    <section style={heroStyle}>
      <div style={overlayStyle}></div>
      <div style={contentStyle}>
        <h1 style={{ color: "#FDFBD8" }}>Welcome to Simple Courier</h1>
        <p style={{ color: "#FDFBD8" }}>Your trusted courier service to deliver fast and safe.</p>
      </div>
    </section>
  );
};

export default HeroSection;
