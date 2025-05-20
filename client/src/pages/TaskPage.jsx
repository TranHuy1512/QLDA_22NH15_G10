import React, { useState, useEffect } from 'react';
import axios from 'axios';
import FormCreateTask from '../components/FormCreateTask';
import TaskCard from '../components/TaskCard';

const TaskPage = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/tasks');
      
      if (response.data.success) {
        setTasks(response.data.data);
      } else {
        setError('Failed to fetch tasks: ' + response.data.message);
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
      setError(error.response?.data?.message || 'Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async (newTask) => {
    try {
      setTasks(prev => [newTask, ...prev]);
    } catch (error) {
      console.error('Error adding task to state:', error);
    }
  };

  const handleEditTask = (task) => {
    setEditingTask(task);
    setShowForm(true);
  };

  const handleUpdateTask = (updatedTask) => {
    setTasks(prev => prev.map(task => 
      task._id === updatedTask._id ? updatedTask : task
    ));
    setEditingTask(null);
  };

  const handleDeleteTask = (taskId) => {
    setTasks(prev => prev.filter(task => task._id !== taskId));
  };

  const handleStatusChange = (taskId, newStatus) => {
    setTasks(prev => prev.map(task =>
      task._id === taskId ? { ...task, status: newStatus } : task
    ));
  };

  if (loading) {
    return (
      <div style={{ 
        color: 'white', 
        textAlign: 'center', 
        padding: '2rem',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '200px'
      }}>
        <div>
          <div style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Loading tasks...</div>
          <div style={{ color: 'rgba(255, 255, 255, 0.6)' }}>Please wait while we fetch your tasks</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        color: '#EF4444', 
        textAlign: 'center', 
        padding: '2rem',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '200px'
      }}>
        <div>
          <div style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Error</div>
          <div>{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ color: 'white', padding: '2rem' }}>
      {/* Header Section */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '2rem',
        paddingBottom: '1rem',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        <div>
          <h1 style={{ 
            fontSize: '2rem', 
            fontWeight: '600',
            marginBottom: '0.5rem'
          }}>
            Tasks
          </h1>
          <p style={{ 
            color: 'rgba(255, 255, 255, 0.6)',
            fontSize: '1rem'
          }}>
            Manage all tasks and track progress
          </p>
        </div>
        <button 
          onClick={() => {
            setEditingTask(null);
            setShowForm(true);
          }}
          style={{
            backgroundColor: '#3B82F6',
            color: 'white',
            padding: '0.75rem 1.5rem',
            borderRadius: '0.5rem',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '1rem',
            fontWeight: '500',
            transition: 'all 0.2s',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
            ':hover': {
              backgroundColor: '#2563EB',
              transform: 'translateY(-1px)'
            }
          }}
        >
          <span style={{ fontSize: '1.25rem' }}>➕</span> Create New Task
        </button>
      </div>

      {/* Tasks List */}
      {tasks.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '3rem',
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
          borderRadius: '0.5rem',
          marginTop: '2rem'
        }}>
          <div style={{ 
            fontSize: '1.5rem', 
            marginBottom: '1rem',
            color: 'rgba(255, 255, 255, 0.8)'
          }}>
            No Tasks Found
          </div>
          <p style={{ 
            color: 'rgba(255, 255, 255, 0.6)',
            marginBottom: '2rem'
          }}>
            There are no tasks available at the moment. Create a new task to get started!
          </p>
          <button 
            onClick={() => {
              setEditingTask(null);
              setShowForm(true);
            }}
            style={{
              backgroundColor: '#3B82F6',
              color: 'white',
              padding: '0.75rem 1.5rem',
              borderRadius: '0.5rem',
              border: 'none',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '1rem',
              fontWeight: '500',
              transition: 'all 0.2s',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
              ':hover': {
                backgroundColor: '#2563EB',
                transform: 'translateY(-1px)'
              }
            }}
          >
            <span style={{ fontSize: '1.25rem' }}>➕</span> Create Your First Task
          </button>
        </div>
      ) : (
        <div style={{ 
          display: 'grid', 
          gap: '1rem',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))'
        }}>
          {tasks.map(task => (
            <TaskCard
              key={task._id}
              task={task}
              onStatusChange={handleStatusChange}
              onEdit={handleEditTask}
              onDelete={handleDeleteTask}
            />
          ))}
        </div>
      )}

      {/* Create/Edit Task Form Modal */}
      {showForm && (
        <FormCreateTask
          onClose={() => {
            setShowForm(false);
            setEditingTask(null);
          }}
          onSubmit={editingTask ? handleUpdateTask : handleCreateTask}
          initialData={editingTask}
        />
      )}
    </div>
  );
};

export default TaskPage; 