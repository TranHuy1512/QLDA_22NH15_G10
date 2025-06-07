import React, { useState, useEffect } from 'react';
import styled from '@emotion/styled'
import {Title, Label, Button} from '../components/FormComponents.jsx'
import axiosInstance from '../utils/axios';
import FormCreateTask from '../components/TaskComponents/FormCreateTask.jsx';
import TaskCard from '../components/TaskCard';
import EmptyTaskState from "../components/TaskComponents/EmptyTaskState.jsx";
import { useAuth } from '../context/authContext';

const NotificationContainer = styled.div`
    color: white;
    text-align: center;
    padding: 2rem;
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 200px;
`
const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  font-family: 'Fira Sans', sans-serif;
`;
const TaskGrid = styled.div`
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
`;
const TaskPage = () => {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
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
            console.error('Error fetching tasks:', error);
            setError(error.response?.data?.message || 'Failed to fetch tasks');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateTask = async (newTask) => {
        try {
            setTasks(prev => [newTask, ...prev]);
            await fetchTasks();
        } catch (error) {
            console.error('Error adding task to state:', error);
        }
    };

    const handleEditTask = (task) => {
        setEditingTask(task);
        setShowForm(true);
    };

    const handleUpdateTask = async (updatedTask) => {
        try {
            setTasks(prev => prev.map(task =>
                task._id === updatedTask._id ? updatedTask : task
            ));
            await fetchTasks();
            setEditingTask(null);
        } catch (error) {
            console.error('Error updating task:', error);
        }
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

    const handleStatusChange = async (taskId, newStatus) => {
        try {
            const response = await axiosInstance.put(`/api/tasks/${taskId}`, { status: newStatus });
            if (response.data.success) {
                // Update UI with the updated task from backend
                setTasks(prev => prev.map(task =>
                    task._id === taskId ? response.data.data : task
                ));
            } else {
                setError('Failed to update status: ' + response.data.message);
            }
        } catch (error) {
            console.error('Error updating status:', error);
            setError(error.response?.data?.message || 'Failed to update status');
        }
    };

    const filteredTasks = tasks.filter(task => {
      const teamMatch = selectedTeam === 'all' || task.team?._id === selectedTeam;
      const assigneeMatch = selectedAssignee === 'all' || 
        (selectedAssignee === 'myself' && task.assignees?.some(assignee => assignee._id === user?._id));
      return teamMatch && assigneeMatch;
    });

    if (loading) {
        return (
            <NotificationContainer>
                <Title>Loading tasks...</Title>
                <Title>Please wait while we fetch your tasks</Title>
            </NotificationContainer>
        );
    }

    if (error) {
        return (
            <NotificationContainer style={{color: "red"}}>
              <Title style={{fontSize: '1.5rem', marginBottom: '1rem'}}>Error</Title>
              <Title>{error}</Title>
            </NotificationContainer>
        );
    }

  return (
      <div style={{color: 'white', padding: '2rem'}}>
      {/* Header Section */}
        <Header>
            <div>
              <Title style={{textAlign: "start"}}>Tasks</Title>
              <Label style={{textAlign: "start"}}>Manage all tasks and track progress</Label>
            </div>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
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
                <option value="all">All Teams</option>
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
                  marginTop: '12px',
                  fontSize: '1rem'
                }}
              >
                <option value="all">All Tasks</option>
                <option value="myself">My Tasks</option>
              </select>
              <Button
                  style={{height:'auto', width:'auto', backgroundColor: 'white', color: 'black'}}
                  onClick={() => {
                      setEditingTask(null);
                      setShowForm(true);
                  }}
              >
                  <span style={{ fontSize: '1.25rem' }}></span> Create New Task
              </Button>
            </div>
        </Header>

        {/* Tasks List */}
        {filteredTasks.length === 0 ? (
            <EmptyTaskState setEditingTask={setEditingTask} setShowForm={setShowForm} />
        ) : (
            <TaskGrid>
                {filteredTasks.map(task => (
                    <TaskCard
                        key={task._id}
                        task={task}
                        onStatusChange={handleStatusChange}
                        onEdit={handleEditTask}
                        onDelete={handleDeleteTask}
                    />
                ))}
            </TaskGrid>
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

