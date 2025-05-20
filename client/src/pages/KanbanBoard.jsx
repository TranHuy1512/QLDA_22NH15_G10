import axiosInstance from "../utils/axios";
import React, { useState } from "react";
import TaskCard from "../components/TaskCard";
import FormCreateTask from "../components/TaskComponents/FormCreateTask";

const KanbanBoard = () => {
  const [tasks, setTasks] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  React.useEffect(() => {
    const fetchTasks = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get('/api/tasks');
        if (response.data.success) {
          setTasks(response.data.data);
        } else {
          setError('Failed to fetch tasks: ' + response.data.message);
        }
      } catch (error) {
        setError(error.response?.data?.message || 'Failed to fetch tasks');
      } finally {
        setLoading(false);
      }
    };
    fetchTasks();
  }, []);

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      // Optimistically update UI
      setTasks(prev => prev.map(task =>
        task._id === taskId ? { ...task, status: newStatus } : task
      ));
      // Send update to backend
      await axiosInstance.put(`/api/tasks/${taskId}`, { status: newStatus });
    } catch (error) {
      console.error('Error updating status:', error);
      setError(error.response?.data?.message || 'Failed to update status');
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

  const handleDeleteTask = async (taskId) => {
    try {
      const response = await axiosInstance.delete(`/api/tasks/${taskId}`);
      if (response.data.success) {
        setTasks(prev => prev.filter(task => task._id !== taskId));
      } else {
        setError('Failed to delete task: ' + response.data.message);
      }
    } catch (error) {
      console.error('Error deleting task:', error);
      setError(error.response?.data?.message || 'Failed to delete task');
    }
  };

  const columns = [
    { key: 'todo', title: 'To Do' },
    { key: 'in-progress', title: 'In Progress' },
    { key: 'completed', title: 'Done' },
  ];

  if (loading) return <div style={{ color: 'white', textAlign: 'center', padding: '2rem' }}>Loading board...</div>;
  if (error) return <div style={{ color: 'red', textAlign: 'center', padding: '2rem' }}>{error}</div>;

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', gap: '2rem', justifyContent: 'center', alignItems: 'flex-start', minHeight: '60vh' }}>
        {columns.map(col => (
          <div key={col.key} style={{ background: '#1F2937', borderRadius: '0.5rem', padding: '1rem', minWidth: '300px', flex: 1 }}>
            <h2 style={{ color: 'white', fontSize: '1.25rem', marginBottom: '1rem', textAlign: 'center' }}>{col.title}</h2>
            {tasks.filter(task => task.status === col.key).length === 0 ? (
              <div style={{ color: '#9CA3AF', textAlign: 'center', padding: '1rem' }}>No tasks</div>
            ) : (
              tasks.filter(task => task.status === col.key).map(task => (
                <TaskCard
                  key={task._id}
                  task={task}
                  onStatusChange={handleStatusChange}
                  onEdit={handleEditTask}
                  onDelete={handleDeleteTask}
                />
              ))
            )}
          </div>
        ))}
      </div>

      {/* Create/Edit Task Form Modal */}
      {showForm && (
        <FormCreateTask
          onClose={() => {
            setShowForm(false);
            setEditingTask(null);
          }}
          onSubmit={editingTask ? handleUpdateTask : null}
          initialData={editingTask}
        />
      )}
    </div>
  );
};

export default KanbanBoard;