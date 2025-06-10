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
      backgroundColor: '#111722',
      borderRadius: '0.5rem',
      padding: '1.25rem',
      marginBottom: '1rem',
      position: 'relative',
      border: '1px solid rgba(255, 255, 255, 0.1)',
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
          <button
            onClick={e => {
              const nextStatus =
                task.status === 'todo' ? 'in-progress' :
                task.status === 'in-progress' ? 'completed' :
                'todo';
              onStatusChange(task._id, nextStatus);
            }}
            style={{
              width: 'auto',
              minWidth: '120px',
              height: '1.75rem',
              padding: '0 1rem',
              borderRadius: '9999px',
              backgroundColor: getStatusColor(task.status),
              color: 'white',
              border: 'none',
              fontWeight: 600,
              fontSize: '0.95rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              transition: 'box-shadow 0.2s',
            }}
            onMouseOver={e => {
              const color = getStatusColor(task.status);
              e.currentTarget.style.boxShadow = `0 0 12px 2px ${color}`;
            }}
            onMouseOut={e => {
              e.currentTarget.style.boxShadow = '';
            }}
            title="Click to cycle status"
          >
            {task.status === 'completed' ? 'Completed' :
             task.status === 'in-progress' ? 'In Progress' : 'To Do'}
          </button>
          
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
                  onDelete(task._id);
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
        flexDirection: 'column',
        gap: '0.75rem'
      }}>
        {task.team && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <span style={{
              color: '#9CA3AF',
              fontSize: '0.875rem'
            }}>
              Team:
            </span>
            <span style={{
              color: 'white',
              fontSize: '0.875rem'
            }}>
              {task.team.name}
            </span>
          </div>
        )}

        <div style={{
          display: 'flex',
          gap: '1rem',
          flexWrap: 'wrap',
          alignItems: 'center'
        }}>
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

          {task.assignees && task.assignees.length > 0 && (
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '0.5rem',
              alignItems: 'center'
            }}>
              <span style={{
                color: '#9CA3AF',
                fontSize: '0.875rem'
              }}>
                Assigned to:
              </span>
              {task.assignees.map(assignee => (
                <span
                  key={assignee._id}
                  style={{
                    backgroundColor: '#374151',
                    padding: '0.25rem 0.75rem',
                    borderRadius: '9999px',
                    fontSize: '0.75rem',
                    color: 'white'
                  }}
                >
                  {assignee.name || assignee.email}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskCard;
