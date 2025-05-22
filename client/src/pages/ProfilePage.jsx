import React, { useState } from 'react';
import { useAuth } from '../context/authContext';
import axiosInstance from '../utils/axios';

const ProfilePage = () => {
  const { user, setUser } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [oldPassword, setOldPassword] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      const response = await axiosInstance.put('/api/users/profile', { name, oldPassword, password });
      if (response.data.success) {
        setUser({ ...user, name });
        setMessage('Profile updated successfully!');
        setError('');
      } else {
        setMessage('');
        setError('Failed to update profile.');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage('');
      setError('An error occurred. Please try again.');
    }
  };

  return (
    <div style={{ color: 'white' }}>
      <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Edit Profile</h2>
      <form onSubmit={handleUpdateProfile} style={{ maxWidth: '400px' }}>
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', color: '#9CA3AF' }}>Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{
              width: '100%',
              padding: '0.75rem',
              borderRadius: '0.375rem',
              backgroundColor: '#374151',
              color: 'white',
              border: 'none',
            }}
          />
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', color: '#9CA3AF' }}>Email</label>
          <input
            type="email"
            value={user?.email || ''}
            readOnly
            style={{
              width: '100%',
              padding: '0.75rem',
              borderRadius: '0.375rem',
              backgroundColor: '#374151',
              color: 'white',
              border: 'none',
            }}
          />
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', color: '#9CA3AF' }}>Current Password</label>
          <input
            type="password"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            style={{
              width: '100%',
              padding: '0.75rem',
              borderRadius: '0.375rem',
              backgroundColor: '#374151',
              color: 'white',
              border: 'none',
            }}
          />
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', color: '#9CA3AF' }}>New Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{
              width: '100%',
              padding: '0.75rem',
              borderRadius: '0.375rem',
              backgroundColor: '#374151',
              color: 'white',
              border: 'none',
            }}
          />
        </div>
        <button
          type="submit"
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: '#2563EB',
            color: 'white',
            border: 'none',
            borderRadius: '0.375rem',
            cursor: 'pointer',
          }}
        >
          Update Profile
        </button>
      </form>
      {message && <p style={{ marginTop: '1rem', color: '#10B981' }}>{message}</p>}
      {error && <p style={{ marginTop: '1rem', color: '#EF4444' }}>{error}</p>}
    </div>
  );
};

export default ProfilePage;