import React, { useState, useEffect } from 'react';
import axiosInstance from '../../utils/axios';

const FormCreateTask = ({ onClose, onSubmit, initialData }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'todo',
    priority: 'medium',
    assignees: [],
    dueDate: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (initialData) {
      // Convert assignees array to array of user IDs
      const assigneeIds = initialData.assignees.map(assignee => 
        typeof assignee === 'object' ? assignee._id : assignee
      );
      
      setFormData({
        title: initialData.title || '',
        description: initialData.description || '',
        status: initialData.status || 'todo',
        priority: initialData.priority || 'medium',
        assignees: assigneeIds,
        dueDate: initialData.dueDate ? new Date(initialData.dueDate).toISOString().slice(0, 16) : ''
      });
    }
  }, [initialData]);

  const fetchUsers = async () => {
    try {
      setLoadingUsers(true);
      const response = await axiosInstance.get('/api/users');
      if (response.data.success) {
        setUsers(response.data.data);
      } else {
        setError('Failed to fetch users');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      setError('Failed to fetch users');
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'assignees') {
      // Convert the selected options to an array of values
      const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
      setFormData(prev => ({
        ...prev,
        [name]: selectedOptions
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      console.log('Submitting task data:', formData);
      let response;
      
      if (initialData) {
        // Update existing task
        response = await axiosInstance.put(`/api/tasks/${initialData._id}`, formData);
      } else {
        // Create new task
        response = await axiosInstance.post('/api/tasks', formData);
      }
      
      console.log('Task response:', response.data);
      
      if (response.data.success) {
        onSubmit(response.data.data);
        onClose();
      } else {
        setError(response.data.message || `Failed to ${initialData ? 'update' : 'create'} task`);
      }
    } catch (error) {
      console.error('Error with task:', error);
      if (error.response?.data?.message) {
        setError(error.response.data.message);
      } else if (error.response?.status === 400) {
        setError('Please check your input and try again');
      } else {
        setError(`Failed to ${initialData ? 'update' : 'create'} task. Please try again later.`);
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
          }}>{initialData ? 'Edit Task' : 'Create New Task'}</h2>
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
              transition: 'all 0.2s'
            }}
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={commonLabelStyles}>Title</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              style={commonInputStyles}
              placeholder="Enter task title"
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={commonLabelStyles}>Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              style={{
                ...commonInputStyles,
                minHeight: '100px',
                resize: 'vertical'
              }}
              placeholder="Enter task description"
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={commonLabelStyles}>Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              style={{
                ...commonInputStyles,
                color: getStatusColor(formData.status)
              }}
            >
              <option value="todo">To Do</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={commonLabelStyles}>Priority</label>
            <select
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              style={{
                ...commonInputStyles,
                color: getPriorityColor(formData.priority)
              }}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={commonLabelStyles}>Assignees (optional)</label>
            <div style={{
              maxHeight: '200px',
              overflowY: 'auto',
              backgroundColor: '#374151',
              border: '1px solid #4B5563',
              borderRadius: '0.375rem',
              padding: '0.5rem'
            }}>
              {loadingUsers ? (
                <div style={{ color: '#9CA3AF', padding: '0.5rem' }}>Loading users...</div>
              ) : (
                users.map(user => (
                  <label
                    key={user._id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '0.5rem',
                      cursor: 'pointer',
                      borderRadius: '0.25rem',
                      transition: 'background-color 0.2s',
                      ':hover': {
                        backgroundColor: '#4B5563'
                      }
                    }}
                  >
                    <input
                      type="checkbox"
                      value={user._id}
                      checked={formData.assignees.includes(user._id)}
                      onChange={(e) => {
                        const userId = e.target.value;
                        setFormData(prev => ({
                          ...prev,
                          assignees: e.target.checked
                            ? [...prev.assignees, userId]
                            : prev.assignees.filter(id => id !== userId)
                        }));
                      }}
                      style={{
                        marginRight: '0.75rem',
                        width: '1rem',
                        height: '1rem',
                        cursor: 'pointer'
                      }}
                    />
                    <span style={{ color: 'white' }}>
                      {user.name} ({user.email})
                    </span>
                  </label>
                ))
              )}
            </div>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={commonLabelStyles}>Due Date</label>
            <input
              type="datetime-local"
              name="dueDate"
              value={formData.dueDate}
              onChange={handleChange}
              required
              style={commonInputStyles}
            />
          </div>

          {error && (
            <div style={{
              color: '#EF4444',
              marginBottom: '1rem',
              padding: '0.75rem',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              borderRadius: '0.375rem'
            }}>
              {error}
            </div>
          )}

          <div style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '1rem'
          }}>
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
                transition: 'all 0.2s'
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
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1,
                transition: 'all 0.2s'
              }}
            >
              {loading ? 'Saving...' : (initialData ? 'Update Task' : 'Create Task')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FormCreateTask; 