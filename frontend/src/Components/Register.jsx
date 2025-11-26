import React, { useState } from 'react';
import { FaUser, FaLock, FaEye, FaEyeSlash, FaEnvelope } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import '../css/Register.css';

const RegisterForm = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [resendingOtp, setResendingOtp] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/^\S+@\S+\.\S+$/.test(formData.email)) newErrors.email = 'Invalid email';
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 4) newErrors.password = 'Min 4 characters';
    if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = 'Passwords do not match';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSendOtp = async () => {
    setSendingOtp(true);
    setResendingOtp(true); // for Resend OTP loader
    try {
      await axios.post('http://localhost:5000/api/otp/send-register-otp', {
        email: formData.email,
      });
      setErrors({});
      setOtpError('');
      setShowOtpModal(true);
    } catch (err) {
      setErrors({ api: err.response?.data?.error || 'OTP sending failed' });
    }
    setSendingOtp(false);
    setResendingOtp(false);
  };

  const handleVerifyOtpAndRegister = async () => {
    setVerifyingOtp(true);
    try {
      const verifyRes = await axios.post('http://localhost:5000/api/otp/verify-otp', {
        email: formData.email,
        otp,
      });

      if (verifyRes.data.success) {
        await axios.post('http://localhost:5000/api/auth/register', {
          name: formData.fullName,
          email: formData.email,
          password: formData.password,
          role: '',
          branch: null,
        });

        alert('Registration successful!');
        setShowOtpModal(false);
        navigate('/login');
      }
    } catch (err) {
      setOtpError(err.response?.data?.message || 'Invalid or expired OTP');
    }
    setVerifyingOtp(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      await handleSendOtp(); // send OTP first
    }
  };

  return (
    <div className="register-form-container">
      <div className="overlay" />
      <div className="form-wrapper">
        <h2 className="header">Create Account</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group-custom">
            <label htmlFor="fullName">Full Name</label>
            <div className="input-with-icon">
              <input
                type="text"
                id="fullName"
                name="fullName"
                placeholder="Enter Full Name"
                value={formData.fullName}
                onChange={handleChange}
              />
            </div>
            {errors.fullName && <div className="error">{errors.fullName}</div>}
          </div>

          <div className="form-group-custom">
            <label htmlFor="email">Email</label>
            <div className="input-with-icon">
              <input
                type="email"
                id="email"
                name="email"
                placeholder="Enter Email"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            {errors.email && <div className="error">{errors.email}</div>}
          </div>

          <div className="form-group-custom">
            <label htmlFor="password">Password</label>
            <div className="input-with-icon">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                placeholder="Enter Password"
                value={formData.password}
                onChange={handleChange}
              />
              <button
                type="button"
                className="show-password-btn"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            {errors.password && <div className="error">{errors.password}</div>}
          </div>

          <div className="form-group-custom">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <div className="input-with-icon">
              <input
                type={showPassword ? 'text' : 'password'}
                id="confirmPassword"
                name="confirmPassword"
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChange={handleChange}
              />
              <button
                type="button"
                className="show-password-btn"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            {errors.confirmPassword && <div className="error">{errors.confirmPassword}</div>}
          </div>

          {errors.api && <div className="error api-error">{errors.api}</div>}

          <button type="submit" className="submit-btn" disabled={sendingOtp}>
            {sendingOtp ? 'Sending OTP...' : 'Register'}
          </button>

          <p className="login-redirect">
            Already have an account? <Link to="/login">Sign In</Link>
          </p>
        </form>
      </div>

      {/* OTP Modal */}
      <Modal show={showOtpModal} onHide={() => setShowOtpModal(false)} centered>
        <Modal.Header
          closeButton
          style={{ backgroundColor: '#FDFBD8', borderBottom: '1px solid #C76C3F' }}
        >
          <Modal.Title style={{ color: '#C76C3F', fontWeight: 'bold' }}>
            Verify OTP
          </Modal.Title>
        </Modal.Header>

        <Modal.Body style={{ backgroundColor: '#FDFBD8' }}>
          <div className="mb-3">
            <label style={{ color: '#C76C3F', fontWeight: '500',marginBottom: '10px' }}>
              Enter the 6-digit OTP sent to your email
            </label>
            <input
              type="text"
              placeholder="Enter 6-digit OTP"
              className="form-control"
              style={{ boxShadow: 'none',border: '1px solid #C76C3F' }}
              value={otp}
              onChange={(e) => {
                setOtp(e.target.value);
                setOtpError('');
              }}
              maxLength={6}
            />
            {otpError && (
              <div className="text-danger mt-2" style={{ fontWeight: '500' }}>
                {otpError}
              </div>
            )}
          </div>

          <div className="text-end">
            <button
              type="button"
              className="btn"
              style={{
                color: '#C76C3F',
                fontWeight: 'bold',
                textDecoration: 'underline',
                background: 'none',
                border: 'none',
              }}
              onClick={handleSendOtp}
              disabled={resendingOtp}
            >
              {resendingOtp ? 'Resending...' : 'Resend OTP'}
            </button>
          </div>
        </Modal.Body>

        <Modal.Footer style={{ backgroundColor: '#FDFBD8', borderTop: '1px solid #C76C3F' }}>
          <Button
            variant="secondary"
            onClick={() => setShowOtpModal(false)}
            style={{ backgroundColor: '#C76C3F', border: 'none' }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleVerifyOtpAndRegister}
            disabled={verifyingOtp}
            style={{ backgroundColor: '#C76C3F', border: 'none' }}
          >
            {verifyingOtp ? 'Verifying...' : 'Verify & Register'}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default RegisterForm;
