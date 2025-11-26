import React, { useState } from 'react';
import { useNavigate,Link } from 'react-router-dom';
import axios from 'axios';
import { FaUser, FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';
import '../css/Register.css';

const LoginForm = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/^\S+@\S+\.\S+$/.test(formData.email)) newErrors.email = 'Invalid email format';
    if (!formData.password) newErrors.password = 'Password is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  if (!validateForm()) return;

  setLoading(true);
  try {
    const response = await axios.post('http://localhost:5000/api/auth/login', formData);

    const { token, user } = response.data;

    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));

    alert('Login successful!');

    //Role-based navigation
    if (user.role === 'admin') {
      navigate('/admin');
    } else if (user.role === 'branchadmin') {
      navigate('/branchadmin');
    } else if (user.role === 'staff') {
      navigate('/staff');
    } else {
      navigate('/user'); 
    }

  } catch (err) {
    const msg = err.response?.data?.message || 'Login failed. Please try again.';
    alert(msg);
    console.error('Login error:', err);
  } finally {
    setLoading(false);
  }
};


  return (
    <div className="register-form-container">
      <div className="overlay" />
      <div className="form-wrapper">
        <h2 className="header">Sign In</h2>
        <form onSubmit={handleSubmit}>
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
              <button type="button" className="show-password-btn" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            {errors.password && <div className="error">{errors.password}</div>}
          </div>
          <div className="form-group-custom">
            <Link to="/forgot-password" className="forgot-password-link">Forgot Password?</Link>
          </div>

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>

          <p className="login-redirect">
            Don’t have an account? <Link to="/register">Register</Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default LoginForm;
