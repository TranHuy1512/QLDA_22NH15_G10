import React, { useState } from 'react';

const TaskCard = ({ task, onStatusChange, onEdit, onDelete }) => {
  const [showDropdown, setShowDropdown] = useState(false);

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

  const formatDueDate = (dueDate) => {
    if (!dueDate) return 'No due date';
    const date = new Date(dueDate);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Due today';
    if (diffDays === 1) return 'Due tomorrow';
    if (diffDays < 0) return `Due ${Math.abs(diffDays)} days ago`;
    return `Due in ${diffDays} days`;
  };

  return (
    <div style={{
      backgroundColor: '#1F2937',
      borderRadius: '0.5rem',
      padding: '1.25rem',
      marginBottom: '1rem',
      position: 'relative',
      border: '1px solid #374151',
      transition: 'all 0.2s',
      ':hover': {
        borderColor: '#4B5563',
        transform: 'translateY(-2px)',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
      }
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '1rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <input
            type="checkbox"
            checked={task.status === 'completed'}
            onChange={() => onStatusChange(task.id, task.status === 'completed' ? 'pending' : 'completed')}
            style={{
              width: '1.25rem',
              height: '1.25rem',
              cursor: 'pointer',
              accentColor: '#3B82F6'
            }}
          />
          <h3 style={{
            fontSize: '1.125rem',
            fontWeight: '600',
            color: 'white',
            margin: 0
          }}>
            {task.title}
          </h3>
        </div>

        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            style={{
              background: 'none',
              border: 'none',
              color: '#9CA3AF',
              cursor: 'pointer',
              padding: '0.5rem',
              borderRadius: '0.375rem',
              transition: 'all 0.2s',
              ':hover': {
                backgroundColor: '#374151',
                color: 'white'
              }
            }}
          >
            ⋮
          </button>

          {showDropdown && (
            <div style={{
              position: 'absolute',
              right: 0,
              top: '100%',
              backgroundColor: '#1F2937',
              borderRadius: '0.375rem',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
              border: '1px solid #374151',
              zIndex: 10,
              minWidth: '150px'
            }}>
              <button
                onClick={() => {
                  onEdit(task);
                  setShowDropdown(false);
                }}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  textAlign: 'left',
                  background: 'none',
                  border: 'none',
                  color: 'white',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  ':hover': {
                    backgroundColor: '#374151'
                  }
                }}
              >
                Edit
              </button>
              <button
                onClick={() => {
                  onDelete(task.id);
                  setShowDropdown(false);
                }}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  textAlign: 'left',
                  background: 'none',
                  border: 'none',
                  color: '#EF4444',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  ':hover': {
                    backgroundColor: '#374151'
                  }
                }}
              >
                Delete
              </button>
            </div>
          )}
        </div>
      </div>

      {task.description && (
        <p style={{
          color: '#9CA3AF',
          marginBottom: '1rem',
          fontSize: '0.875rem',
          lineHeight: '1.5'
        }}>
          {task.description}
        </p>
      )}

      <div style={{
        display: 'flex',
        gap: '1rem',
        flexWrap: 'wrap',
        alignItems: 'center'
      }}>
        <span style={{
          backgroundColor: getStatusColor(task.status),
          padding: '0.25rem 0.75rem',
          borderRadius: '9999px',
          fontSize: '0.75rem',
          fontWeight: '500',
          color: 'white'
        }}>
          {task.status === 'completed' ? 'Completed' : 
           task.status === 'in-progress' ? 'In Progress' : 'To Do'}
        </span>

        <span style={{
          backgroundColor: getPriorityColor(task.priority),
          padding: '0.25rem 0.75rem',
          borderRadius: '9999px',
          fontSize: '0.75rem',
          fontWeight: '500',
          color: 'white'
        }}>
          {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)} Priority
        </span>

        {task.dueDate && (
          <span style={{
            color: '#9CA3AF',
            fontSize: '0.875rem'
          }}>
            {formatDueDate(task.dueDate)}
          </span>
        )}

        {task.assignee && task.assignee !== 'unassigned' && (
          <span style={{
            color: '#9CA3AF',
            fontSize: '0.875rem'
          }}>
            Assigned to: {task.assignee}
          </span>
        )}
      </div>
    </div>
  );
};

export default TaskCard; 