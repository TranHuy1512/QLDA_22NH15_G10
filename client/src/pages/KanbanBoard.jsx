import axiosInstance from "../utils/axios";
import React, { useState, useEffect } from "react";
import TaskCard from "../components/TaskCard";
import FormCreateTask from "../components/TaskComponents/FormCreateTask";
import { useAuth } from '../context/authContext';

const KanbanBoard = () => {
  const [tasks, setTasks] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [teams, setTeams] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState('all');
  const [selectedAssignee, setSelectedAssignee] = useState('all');
  const [loadingTeams, setLoadingTeams] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    fetchTasks();
    fetchTeams();
  }, []);

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

  const filteredTasks = tasks.filter(task => {
    const teamMatch = !selectedTeam || task.team?._id === selectedTeam;
    const assigneeMatch = selectedAssignee === 'all' || 
      (selectedAssignee === 'myself' && task.assignees?.some(assignee => assignee._id === user?._id));
    return teamMatch && assigneeMatch;
  });

  if (loading) return <div style={{ color: 'white', textAlign: 'center', padding: '2rem' }}>Loading board...</div>;
  if (error) return <div style={{ color: 'red', textAlign: 'center', padding: '2rem' }}>{error}</div>;

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'flex-end', 
        gap: '1rem', 
        marginBottom: '2rem',
        alignItems: 'center'
      }}>
        <select
          value={selectedTeam}
          onChange={(e) => setSelectedTeam(e.target.value)}
          style={{
            height: '43px',
            minWidth: '110px',
            backgroundColor: 'white',
            color: 'black',
            border: 'none',
            borderRadius: '0.375rem',
            padding: '0.5rem 1rem',
            cursor: 'pointer',
            outline: 'none',
            marginTop: '12px',
            fontSize: '1rem'
          }}
        >
          {loadingTeams ? (
            <option value="" disabled>Loading teams...</option>
          ) : teams.length > 0 ? (
            teams.map(team => (
              <option key={team._id} value={team._id}>
                {team.name}
              </option>
            ))
          ) : (
            <option value="" disabled>No teams available</option>
          )}
        </select>
        <select
          value={selectedAssignee}
          onChange={(e) => setSelectedAssignee(e.target.value)}
          style={{
            height: '43px',
            minWidth: '110px',
            backgroundColor: 'white',
            color: 'black',
            border: 'none',
            borderRadius: '0.375rem',
            padding: '0.5rem 1rem',
            cursor: 'pointer',
            outline: 'none',
            fontSize: '1rem'
          }}
        >
          <option value="all">All Tasks</option>
          <option value="myself">My Tasks</option>
        </select>
      </div>

      <div style={{ display: 'flex', gap: '2rem', justifyContent: 'center', alignItems: 'flex-start', minHeight: '60vh' }}>
        {columns.map(col => (
          <div key={col.key} style={{ background: '#1F2937', borderRadius: '0.5rem', padding: '1rem', minWidth: '300px', flex: 1 }}>
            <h2 style={{ color: 'white', fontSize: '1.25rem', marginBottom: '1rem', textAlign: 'center' }}>{col.title}</h2>
            {filteredTasks.filter(task => task.status === col.key).length === 0 ? (
              <div style={{ color: '#9CA3AF', textAlign: 'center', padding: '1rem' }}>No tasks</div>
            ) : (
              filteredTasks.filter(task => task.status === col.key).map(task => (
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