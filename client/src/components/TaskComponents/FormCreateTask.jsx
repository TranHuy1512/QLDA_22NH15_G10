import React, { useState, useEffect } from 'react';
import axiosInstance from '../../utils/axios';
import { useAuth } from '../../context/authContext';

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
  const [comments, setComments] = useState([]);
  const [newCommentContent, setNewCommentContent] = useState('');
  const [loadingComments, setLoadingComments] = useState(false);
  const [postingComment, setPostingComment] = useState(false);

  const { user } = useAuth();

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (initialData) {
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
      fetchComments(initialData._id);
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

  const fetchComments = async (taskId) => {
    if (!taskId) return;
    try {
      setLoadingComments(true);
      const response = await axiosInstance.get(`/api/tasks/${taskId}/comments`);
      if (response.data.success) {
        setComments(response.data.data);
      } else {
        console.error('Failed to fetch comments:', response.data.message);
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setLoadingComments(false);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newCommentContent.trim() || !initialData?._id || postingComment) return;

    setPostingComment(true);
    try {
      const response = await axiosInstance.post(`/api/tasks/${initialData._id}/comments`, {
        content: newCommentContent,
      });

      if (response.data.success) {
        setComments(prev => [...prev, response.data.data]);
        setNewCommentContent('');
      } else {
        console.error('Failed to post comment:', response.data.message);
      }
    } catch (error) {
      console.error('Error posting comment:', error);
    } finally {
      setPostingComment(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name === 'assignees' && type === 'checkbox') {
      const userId = value;
      setFormData(prev => ({
        ...prev,
        assignees: checked
          ? [...prev.assignees, userId]
          : prev.assignees.filter(id => id !== userId)
      }));
    } else if (name === 'assignees' && type === 'select-multiple') {
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
      let response;
      
      if (initialData) {
        response = await axiosInstance.put(`/api/tasks/${initialData._id}`, formData);
      } else {
        response = await axiosInstance.post('/api/tasks', formData);
      }
      
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

  const commentInputStyles = {
    ...commonInputStyles,
    resize: 'vertical',
    minHeight: '60px',
    marginBottom: '1rem'
  };

  const commentButtonStyles = {
    backgroundColor: '#3B82F6',
    color: 'white',
    padding: '0.75rem 1.5rem',
    borderRadius: '0.375rem',
    border: 'none',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
    ':hover': {
      backgroundColor: '#2563EB'
    },
    ':disabled': {
      backgroundColor: '#1E3A8A',
      cursor: 'not-allowed'
    }
  };

  const checkboxListStyles = {
    maxHeight: '150px',
    overflowY: 'auto',
    backgroundColor: '#374151',
    border: '1px solid #4B5563',
    borderRadius: '0.375rem',
    padding: '0.5rem'
  };

  const checkboxItemStyles = {
    display: 'flex',
    alignItems: 'center',
    padding: '0.5rem',
    cursor: 'pointer',
    borderRadius: '0.25rem',
    transition: 'background-color 0.2s',
    ':hover': {
      backgroundColor: '#4B5563'
    }
  };

  const checkboxStyles = {
    marginRight: '0.75rem',
    width: '1rem',
    height: '1rem',
    cursor: 'pointer'
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
      backdropFilter: 'blur(4px)',
      overflowY: 'auto'
    }}>
      <div style={{
        backgroundColor: '#1F2937',
        borderRadius: '0.75rem',
        padding: '2rem',
        width: '100%',
        maxWidth: initialData ? '700px' : '500px',
        color: 'white',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        maxHeight: '90vh',
        overflowY: 'auto'
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
          }}>{initialData ? 'Task Details' : 'Create New Task'}</h2>
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

        <div>
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
                }}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={commonLabelStyles}>Assignees</label>
               {loadingUsers ? (
                  <p style={{color: '#9CA3AF'}}>Loading users...</p>
                ) : (
               <div style={checkboxListStyles}>
                  {users.map(user => (
                    <label key={user._id} style={checkboxItemStyles}>
                      <input
                        type="checkbox"
                        name="assignees"
                        value={user._id}
                        checked={formData.assignees.includes(user._id)}
                        onChange={handleChange}
                        style={checkboxStyles}
                      />
                      <span style={{ color: 'white' }}>
                        {user.name} ({user.email})
                      </span>
                    </label>
                  ))}
                </div>
                )}
            </div>

             <div style={{ marginBottom: '1.5rem' }}>
              <label style={commonLabelStyles}>Due Date</label>
              <input
                type="datetime-local"
                name="dueDate"
                value={formData.dueDate}
                onChange={handleChange}
                 style={commonInputStyles}
              />
            </div>

            {error && <p style={{ color: '#EF4444', marginBottom: '1rem' }}>{error}</p>}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
               <button
                type="button"
                onClick={onClose}
                style={{
                  padding: '0.75rem 1.5rem',
                  borderRadius: '0.375rem',
                  border: '1px solid #4B5563',
                  backgroundColor: '#374151',
                  color: 'white',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                   ':hover': {
                      backgroundColor: '#4B5563'
                    }
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || loadingUsers}
                style={{
                  backgroundColor: '#3B82F6',
                  color: 'white',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '0.375rem',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s',
                  ':hover': {
                    backgroundColor: '#2563EB'
                  },
                  ':disabled': {
                    backgroundColor: '#1E3A8A',
                    cursor: 'not-allowed'
                  }
                }}
              >
                {loading ? 'Saving...' : (initialData ? 'Save Changes' : 'Create Task')}
              </button>
            </div>
          </form>
        </div>
        
        {initialData && (
          <div style={{ marginTop: '2rem', borderTop: '1px solid #374151', paddingTop: '2rem' }}>
            <h3 style={{
              fontSize: '1.25rem',
              fontWeight: '600',
              color: 'white',
              marginBottom: '1.5rem'
            }}>Comments</h3>

            <div style={{ marginBottom: '1.5rem', maxHeight: '300px', overflowY: 'auto' }}>
              {loadingComments ? (
                <p style={{color: '#9CA3AF'}}>Loading comments...</p>
              ) : comments.length === 0 ? (
                <p style={{color: '#9CA3AF'}}>No comments yet.</p>
              ) : (
                comments.map(comment => (
                  <div key={comment._id} style={{ marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px dashed #374151' }}>
                    <p style={{ fontSize: '0.9rem', color: '#9CA3AF', marginBottom: '0.25rem' }}>
                      <strong>{comment.user.name || 'Unknown User'}</strong> at {new Date(comment.createdAt).toLocaleString()}
                    </p>
                    <p style={{ color: 'white', lineHeight: '1.4' }}>{comment.content}</p>
                  </div>
                ))
              )}
            </div>

            <form onSubmit={handleCommentSubmit}>
              <textarea
                value={newCommentContent}
                onChange={(e) => setNewCommentContent(e.target.value)}
                placeholder="Add a comment..."
                required
                style={commentInputStyles}
              />
              <button type="submit" disabled={postingComment || !newCommentContent.trim()} style={commentButtonStyles}>
                {postingComment ? 'Posting...' : 'Post Comment'}
              </button>
            </form>
          </div>
        )}

      </div>
    </div>
  );
};

export default FormCreateTask; 