import React, { useState, useEffect } from 'react';
import axiosInstance from '../../utils/axios';

const FormCreateTask = ({ onClose, onSubmit, initialData }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'todo',
    priority: 'medium',
    assignees: [],
    dueDate: '',
    teamId: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [comments, setComments] = useState([]);
  const [newCommentContent, setNewCommentContent] = useState('');
  const [loadingComments, setLoadingComments] = useState(false);
  const [postingComment, setPostingComment] = useState(false);
  const [teams, setTeams] = useState([]);
  const [loadingTeams, setLoadingTeams] = useState(true);
  const [teamMembers, setTeamMembers] = useState([]);
  const [loadingTeamMembers, setLoadingTeamMembers] = useState(false);

  useEffect(() => {
    fetchTeams();
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
        dueDate: initialData.dueDate ? new Date(initialData.dueDate).toISOString().slice(0, 16) : '',
        teamId: initialData.team?._id || ''
      });
      fetchComments(initialData._id);
      if (initialData.team?._id) {
        fetchTeamMembers(initialData.team._id);
      }
    }
  }, [initialData]);

  const fetchTeamMembers = async (teamId) => {
    try {
      setLoadingTeamMembers(true);
      const response = await axiosInstance.get(`/api/teams/${teamId}/members`);
      if (response.data.success) {
        setTeamMembers(response.data.data);
      } else {
        setError('Failed to fetch team members');
      }
    } catch (error) {
      console.error('Error fetching team members:', error);
      setError('Failed to fetch team members');
    } finally {
      setLoadingTeamMembers(false);
    }
  };

  const fetchTeams = async () => {
    try {
      setLoadingTeams(true);
      const response = await axiosInstance.get('/api/teams');
      if (response.data.success) {
        setTeams(response.data.data);
      } else {
        setError('Failed to fetch teams');
      }
    } catch (error) {
      console.error('Error fetching teams:', error);
      setError('Failed to fetch teams');
    } finally {
      setLoadingTeams(false);
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

    if (name === 'teamId') {
      if (initialData) return;
      
      setFormData(prev => ({
        ...prev,
        [name]: value,
        assignees: [] // Reset assignees when team changes
      }));
      if (value) {
        fetchTeamMembers(value);
      } else {
        setTeamMembers([]);
      }
    } else if (name === 'assignees' && type === 'checkbox') {
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
      const taskData = {
        ...formData,
        team: formData.teamId
      };
      delete taskData.teamId;

      let response;
      
      if (initialData) {
        response = await axiosInstance.put(`/api/tasks/${initialData._id}`, taskData);
      } else {
        response = await axiosInstance.post('/api/tasks', taskData);
      }
      
      if (response.data.success) {
        // Fetch the complete task data with populated fields
        const completeTaskResponse = await axiosInstance.get(`/api/tasks/${response.data.data._id}`);
        if (completeTaskResponse.data.success) {
          onSubmit(completeTaskResponse.data.data);
          onClose();
        } else {
          setError('Failed to fetch complete task data');
        }
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
              <label style={commonLabelStyles}>Team</label>
              <select
                name="teamId"
                value={formData.teamId}
                onChange={handleChange}
                style={{
                  ...commonInputStyles,
                  backgroundColor: initialData ? '#2D3748' : '#374151',
                  cursor: initialData ? 'not-allowed' : 'pointer'
                }}
                required
                disabled={!!initialData}
              >
                <option value="">Select a team</option>
                {loadingTeams ? (
                  <option value="" disabled>Loading teams...</option>
                ) : (
                  teams.map(team => (
                    <option key={team._id} value={team._id}>
                      {team.name}
                    </option>
                  ))
                )}
              </select>
              {initialData && (
                <small style={{ color: '#9CA3AF', marginTop: '0.25rem', display: 'block' }}>
                  Team cannot be changed after task creation
                </small>
              )}
            </div>

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
                style={commonInputStyles}
                required
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
                style={commonInputStyles}
                required
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={commonLabelStyles}>Assignees</label>
              <select
                name="assignees"
                value={formData.assignees}
                onChange={handleChange}
                style={{
                  ...commonInputStyles,
                  height: '120px'
                }}
                multiple
                required
                disabled={!formData.teamId || loadingTeamMembers}
              >
                {!formData.teamId ? (
                  <option value="" disabled>Please select a team first</option>
                ) : loadingTeamMembers ? (
                  <option value="" disabled>Loading team members...</option>
                ) : teamMembers.length === 0 ? (
                  <option value="" disabled>No members in this team</option>
                ) : (
                  teamMembers.map(member => (
                    <option key={member.user._id} value={member.user._id}>
                      {member.user.name || member.user.email}
                    </option>
                  ))
                )}
              </select>
              <small style={{ color: '#9CA3AF', marginTop: '0.25rem', display: 'block' }}>
                Hold Ctrl/Cmd to select multiple users
              </small>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={commonLabelStyles}>Due Date</label>
              <input
                type="datetime-local"
                name="dueDate"
                value={formData.dueDate}
                onChange={handleChange}
                style={commonInputStyles}
                required
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
                disabled={loading || loadingTeamMembers}
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