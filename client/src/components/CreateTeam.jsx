import React, { useState } from 'react';
import axios from 'axios';

const CreateTeam = ({ onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) {
      errors.name = 'Team name is required';
    }
    if (!formData.description.trim()) {
      errors.description = 'Team description is required';
    }
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear validation error when user types
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
    setError(''); // Clear general error when user types
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setValidationErrors({});

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post('http://localhost:5000/api/teams', formData);
      
      if (response.data.success) {
        onSubmit(response.data.data);
        onClose();
      } else {
        setError(response.data.message || 'Failed to create team');
      }
    } catch (error) {
      console.error('Error creating team:', error);
      if (error.response?.data?.message) {
        setError(error.response.data.message);
      } else if (error.response?.status === 400) {
        setError('Please check your input and try again');
      } else {
        setError('Failed to create team. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  const commonInputStyles = {
    width: '100%',
    padding: '0.75rem',
    backgroundColor: '#374151',
    border: '1px solid #4B5563',
    borderRadius: '0.375rem',
    color: 'white',
    transition: 'all 0.2s',
    outline: 'none',
    ':focus': {
      borderColor: '#3B82F6',
      boxShadow: '0 0 0 2px rgba(59, 130, 246, 0.5)'
    }
  };

  const commonLabelStyles = {
    display: 'block',
    marginBottom: '0.5rem',
    color: '#9CA3AF',
    fontSize: '0.875rem',
    fontWeight: '500'
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      backdropFilter: 'blur(4px)'
    }}>
      <div style={{
        backgroundColor: '#1F2937',
        borderRadius: '0.75rem',
        padding: '2rem',
        width: '100%',
        maxWidth: '500px',
        color: 'white',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '2rem'
        }}>
          <h2 style={{ 
            fontSize: '1.5rem',
            fontWeight: '600',
            color: 'white'
          }}>Create New Team</h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#9CA3AF',
              cursor: 'pointer',
              fontSize: '1.25rem',
              padding: '0.5rem',
              borderRadius: '0.375rem',
              transition: 'all 0.2s',
              ':hover': {
                backgroundColor: '#374151',
                color: 'white'
              }
            }}
          >
            ✕
          </button>
        </div>
        
        {error && (
          <div style={{
            backgroundColor: '#991B1B',
            color: 'white',
            padding: '0.75rem',
            borderRadius: '0.375rem',
            marginBottom: '1rem'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={commonLabelStyles}>
              Team Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="Enter team name"
              style={{
                ...commonInputStyles,
                fontSize: '1rem',
                borderColor: validationErrors.name ? '#EF4444' : '#4B5563'
              }}
            />
            {validationErrors.name && (
              <div style={{ color: '#EF4444', fontSize: '0.875rem', marginTop: '0.5rem' }}>
                {validationErrors.name}
              </div>
            )}
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <label style={commonLabelStyles}>
              Description *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              placeholder="Enter team description"
              style={{
                ...commonInputStyles,
                minHeight: '100px',
                resize: 'vertical',
                fontSize: '1rem',
                borderColor: validationErrors.description ? '#EF4444' : '#4B5563'
              }}
            />
            {validationErrors.description && (
              <div style={{ color: '#EF4444', fontSize: '0.875rem', marginTop: '0.5rem' }}>
                {validationErrors.description}
              </div>
            )}
          </div>

          <div style={{ 
            display: 'flex', 
            gap: '1rem', 
            justifyContent: 'flex-end',
            borderTop: '1px solid #374151',
            paddingTop: '1.5rem'
          }}>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: '#374151',
                color: 'white',
                border: 'none',
                borderRadius: '0.375rem',
                cursor: 'pointer',
                transition: 'all 0.2s',
                fontWeight: '500',
                opacity: loading ? 0.7 : 1,
                ':hover': {
                  backgroundColor: '#4B5563'
                }
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: '#3B82F6',
                color: 'white',
                border: 'none',
                borderRadius: '0.375rem',
                cursor: 'pointer',
                transition: 'all 0.2s',
                fontWeight: '500',
                opacity: loading ? 0.7 : 1,
                ':hover': {
                  backgroundColor: '#2563EB'
                }
              }}
            >
              {loading ? 'Creating...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTeam; 