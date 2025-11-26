import React, { useState } from 'react';
import axios from 'axios';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import '../css/Forgotpassword.css';
import { useNavigate } from 'react-router-dom';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [step, setStep] = useState(1);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [resettingPassword, setResettingPassword] = useState(false);

  const handleSendOtp = async () => {
    setError('');
    setSendingOtp(true);
    try {
      await axios.post('http://localhost:5000/api/otp/send-forgot-password-otp', { email });
      setSuccess('OTP sent to your email!');
      setShowModal(true);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send OTP');
    }
    setSendingOtp(false);
  };

  const handleVerifyOtp = async () => {
    setVerifyingOtp(true);
    try {
      const res = await axios.post('http://localhost:5000/api/otp/verify-otp', { email, otp });
      if (res.data.success) {
        setStep(3);
        setShowModal(false);
        setError('');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid OTP');
    }
    setVerifyingOtp(false);
  };

  const handleResetPassword = async () => {
    if (newPassword !== confirmPassword) {
      return setError('Passwords do not match');
    }

    setResettingPassword(true);
    try {
      await axios.post('http://localhost:5000/api/auth/update-password', {
        email,
        newPassword,
      });
      setSuccess('Password reset successful. You can now log in.');
      navigate('/login');
      setError('');
      setStep(1);
      setEmail('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to reset password');
    }
    setResettingPassword(false);
  };

  return (
    <div className="forgot-password-page">
      <div className="forgot-password-overlay" />
      <div className="forgot-password-container">
        <h2>Forgot Password</h2>

        {step === 1 && (
          <>
            <input
              type="email"
              placeholder="Enter registered email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <button onClick={handleSendOtp} disabled={sendingOtp}>
              {sendingOtp ? 'Sending OTP...' : 'Send OTP'}
            </button>
          </>
        )}

        {step === 3 && (
          <>
            <div className="password-field">
              <input
                type={showNewPassword ? 'text' : 'password'}
                placeholder="New Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              <span onClick={() => setShowNewPassword(!showNewPassword)} className="eye-icon">
                {showNewPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>

            <div className="password-field">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Confirm New Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              <span
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="eye-icon"
              >
                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>

            <button onClick={handleResetPassword} disabled={resettingPassword}>
              {resettingPassword ? 'Resetting...' : 'Reset Password'}
            </button>
          </>
        )}

        {error && <div className="error">{error}</div>}

        {/* OTP Modal */}
        <Modal show={showModal} onHide={() => setShowModal(false)} centered>
          <Modal.Header
            closeButton
            style={{ backgroundColor: '#FDFBD8', borderBottom: '1px solid #C76C3F' }}
          >
            <Modal.Title style={{ color: '#C76C3F' }}>Verify OTP</Modal.Title>
          </Modal.Header>

          <Modal.Body style={{ backgroundColor: '#FDFBD8' }}>
            <div className="mb-3">
              <label style={{ color: '#C76C3F', fontWeight: '500', marginBottom: '10px' }}>
                Enter the verification code sent to your registered email to reset your password
              </label>
              <input
                type="text"
                placeholder="Enter verification code"
                className="form-control"
                style={{ boxShadow: 'none',border: '1px solid #C76C3F' }}
                value={otp}
                onChange={(e) => {
                  setOtp(e.target.value);
                  setError('');
                }}
                maxLength={6}
              />

              {error && (
                <div className="text-danger mt-2" style={{ fontWeight: '500' }}>
                  {error}
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
                disabled={sendingOtp}
              >
                {sendingOtp ? 'Resending...' : 'Resend Code'}
              </button>
            </div>
          </Modal.Body>

          <Modal.Footer style={{ backgroundColor: '#FDFBD8', borderTop: '1px solid #C76C3F' }}>
            <Button
              variant="secondary"
              onClick={() => setShowModal(false)}
              style={{ backgroundColor: '#C76C3F', border: 'none' }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleVerifyOtp}
              disabled={verifyingOtp}
              style={{ backgroundColor: '#C76C3F', border: 'none' }}
            >
              {verifyingOtp ? 'Verifying...' : 'Verify'}
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    </div>
  );
};

export default ForgotPassword;
