import React, { useState, useEffect } from 'react';
import { Card, Form, Button, Spinner, InputGroup } from 'react-bootstrap';
import { HiOutlineUser, HiOutlineMail } from 'react-icons/hi';
import { RiLockPasswordLine } from 'react-icons/ri';
import { FiUser } from 'react-icons/fi';
import axios from 'axios';

const UpdateProfile = () => {
  const [profile, setProfile] = useState({ name: '', email: '' });
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState('');
  const [focusedField, setFocusedField] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      setFetching(true);
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://localhost:5000/api/auth/profile', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProfile({ name: res.data.name || '', email: res.data.email || '' });
      } catch (err) {
        setError('Failed to load profile');
      } finally {
        setFetching(false);
      }
    };

    fetchProfile();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        'http://localhost:5000/api/auth/update-profile',
        {
          name: profile.name,
          email: profile.email,
          currentPassword: currentPassword || undefined,
          newPassword: newPassword || undefined,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Profile updated successfully');
      setCurrentPassword('');
      setNewPassword('');
    } catch (err) {
      setError(err.response?.data?.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-100">
      <h3 className="fw-bold mb-4 mt-2" style={{ color: "#C76C3F" }}>
               <FiUser className="me-2" />
                Update Profile
            </h3>
      <Card
        className="shadow-sm mt-3 "
        style={{
          backgroundColor: '#FDFBD8',
          width: '100%',
          boxShadow: '0 6px 20px rgba(199,108,63,0.12)',
          border: '1px solid rgba(199,108,63,0.12)'
        }}
      >
        <Card.Body>

          {fetching ? (
            <div className="d-flex justify-content-center py-4">
              <Spinner animation="border" variant="secondary" />
            </div>
          ) : (
            <Form onSubmit={handleSubmit}>
              {error && <div className="alert alert-danger">{error}</div>}

              <Form.Group className="mb-3" controlId="name">
                <Form.Label style={{ color: '#C76C3F' }} className="small">Name</Form.Label>
                <InputGroup>
                    <InputGroup.Text style={{ backgroundColor: '#fff', borderColor: '#C76C3F', boxShadow: '0 2px 6px rgba(199,108,63,0.06)' }}>
                    <HiOutlineUser style={{ color: '#C76C3F' }} />
                  </InputGroup.Text>
                  <Form.Control
                    type="text"
                    value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    required
                    onFocus={() => setFocusedField('name')}
                    onBlur={() => setFocusedField('')}
                    style={{
                      borderColor: '#C76C3F',
                      boxShadow: focusedField === 'name' ? '0 0 0 0.2rem rgba(199,108,63,0.25)' : undefined,
                    }}
                  />
                </InputGroup>
              </Form.Group>

              <Form.Group className="mb-3" controlId="email">
                <Form.Label style={{ color: '#C76C3F' }} className="small">Email</Form.Label>
                <InputGroup>
                  <InputGroup.Text style={{ backgroundColor: '#fff', borderColor: '#C76C3F', boxShadow: '0 2px 6px rgba(199,108,63,0.06)' }}>
                    <HiOutlineMail style={{ color: '#C76C3F' }} />
                  </InputGroup.Text>
                  <Form.Control
                    type="email"
                    value={profile.email}
                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                    required
                    onFocus={() => setFocusedField('email')}
                    onBlur={() => setFocusedField('')}
                    style={{
                      borderColor: '#C76C3F',
                      boxShadow: focusedField === 'email' ? '0 0 0 0.2rem rgba(199,108,63,0.25)' : undefined,
                    }}
                  />
                </InputGroup>
              </Form.Group>

              <Form.Group className="mb-3" controlId="currentPassword">
                <Form.Label style={{ color: '#C76C3F' }} className="small">Current Password</Form.Label>
                <InputGroup>
                  <InputGroup.Text style={{ backgroundColor: '#fff', borderColor: '#C76C3F', boxShadow: '0 2px 6px rgba(199,108,63,0.06)' }}>
                    <RiLockPasswordLine style={{ color: '#C76C3F' }} />
                  </InputGroup.Text>
                  <Form.Control
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    onFocus={() => setFocusedField('currentPassword')}
                    onBlur={() => setFocusedField('')}
                    style={{
                      borderColor: '#C76C3F',
                      boxShadow: focusedField === 'currentPassword' ? '0 0 0 0.2rem rgba(199,108,63,0.25)' : undefined,
                    }}
                  />
                </InputGroup>
              </Form.Group>

              <Form.Group className="mb-3" controlId="newPassword">
                <Form.Label style={{ color: '#C76C3F' }} className="small">New Password (optional)</Form.Label>
                <InputGroup>
                  <InputGroup.Text style={{ backgroundColor: '#fff', borderColor: '#C76C3F', boxShadow: '0 2px 6px rgba(199,108,63,0.06)' }}>
                    <RiLockPasswordLine style={{ color: '#C76C3F' }} />
                  </InputGroup.Text>
                  <Form.Control
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    onFocus={() => setFocusedField('newPassword')}
                    onBlur={() => setFocusedField('')}
                    style={{
                      borderColor: '#C76C3F',
                      boxShadow: focusedField === 'newPassword' ? '0 0 0 0.2rem rgba(199,108,63,0.25)' : undefined,
                    }}
                  />
                </InputGroup>
              </Form.Group>

              <div className="d-flex justify-content-start">
                <Button type="submit" style={{ backgroundColor: '#C76C3F', borderColor: '#C76C3F' }} disabled={loading}>
                  {loading ? 'Updating...' : 'Update'}
                </Button>
              </div>
            </Form>
          )}
        </Card.Body>
      </Card>
    </div>
  );
};

export default UpdateProfile;
