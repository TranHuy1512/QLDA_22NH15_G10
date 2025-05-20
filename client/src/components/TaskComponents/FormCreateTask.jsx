import React, { useState } from 'react';
import axios from 'axios';

const FormCreateTask = ({ onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'todo',
    priority: 'medium',
    assignee: 'unassigned',
    dueDate: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      console.log('Submitting task data:', formData); // Log dữ liệu task
      const response = await axios.post('http://localhost:5000/api/tasks', formData);
      console.log('Task creation response:', response.data); // Log response
      
      if (response.data.success) {
        onSubmit(response.data.data);
        onClose();
      } else {
        setError(response.data.message || 'Failed to create task');
      }
    } catch (error) {
      console.error('Error creating task:', error);
      if (error.response?.data?.message) {
        setError(error.response.data.message);
      } else if (error.response?.status === 400) {
        setError('Please check your input and try again');
      } else {
        setError('Failed to create task. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return '#10B981';
      case 'in-progress':
        return '#F59E0B';
      case 'pending':
        return '#6B7280';
      default:
        return '#6B7280';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return '#EF4444';
      case 'medium':
        return '#F59E0B';
      case 'low':
        return '#10B981';
      default:
        return '#6B7280';
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
          }}>Create New Task</h2>
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
        
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={commonLabelStyles}>
              Title *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              placeholder="Enter task title"
              style={{
                ...commonInputStyles,
                fontSize: '1rem'
              }}
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={commonLabelStyles}>
              Description (optional)
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Enter task description"
              style={{
                ...commonInputStyles,
                minHeight: '100px',
                resize: 'vertical',
                fontSize: '1rem'
              }}
            />
          </div>

          <div style={{ 
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '1rem',
            marginBottom: '1.5rem'
          }}>
            <div>
              <label style={commonLabelStyles}>
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                style={{
                  ...commonInputStyles,
                  cursor: 'pointer',
                  appearance: 'none',
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%239CA3AF'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 0.75rem center',
                  backgroundSize: '1.25rem',
                  paddingRight: '2.5rem'
                }}
              >
                <option value="pending">To Do</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            <div>
              <label style={commonLabelStyles}>
                Priority
              </label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                style={{
                  ...commonInputStyles,
                  cursor: 'pointer',
                  appearance: 'none',
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%239CA3AF'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 0.75rem center',
                  backgroundSize: '1.25rem',
                  paddingRight: '2.5rem'
                }}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={commonLabelStyles}>
              Assignee (optional)
            </label>
            <select
              name="assignee"
              value={formData.assignee}
              onChange={handleChange}
              style={{
                ...commonInputStyles,
                cursor: 'pointer',
                appearance: 'none',
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%239CA3AF'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 0.75rem center',
                backgroundSize: '1.25rem',
                paddingRight: '2.5rem'
              }}
            >
              <option value="unassigned">Unassigned</option>
              <option value="user1">User 1</option>
              <option value="user2">User 2</option>
            </select>
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <label style={commonLabelStyles}>
              Due Date & Time (optional)
            </label>
            <input
              type="datetime-local"
              name="dueDate"
              value={formData.dueDate}
              onChange={handleChange}
              style={{
                ...commonInputStyles,
                cursor: 'pointer'
              }}
            />
          </div>

          <div style={{ 
            display: 'flex', 
            gap: '1rem', 
            justifyContent: 'flex-end',
            borderTop: '1px solid #374151',
            paddingTop: '1.5rem'
          }}>
            {error && (
              <div style={{ 
                color: '#EF4444', 
                fontSize: '0.875rem',
                marginRight: 'auto'
              }}>
                {error}
              </div>
            )}
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: '#374151',
                color: 'white',
                border: 'none',
                borderRadius: '0.375rem',
                cursor: 'pointer',
                transition: 'all 0.2s',
                fontWeight: '500',
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
                backgroundColor: loading ? '#6B7280' : '#3B82F6',
                color: 'white',
                border: 'none',
                borderRadius: '0.375rem',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s',
                fontWeight: '500',
                ':hover': {
                  backgroundColor: loading ? '#6B7280' : '#2563EB'
                }
              }}
            >
              {loading ? 'Creating...' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FormCreateTask; 