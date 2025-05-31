import React, { useState, useEffect } from 'react';
import styled from '@emotion/styled'
import {Title, Label, Button} from '../components/FormComponents.jsx'
import axiosInstance from '../utils/axios';
import FormCreateTask from '../components/TaskComponents/FormCreateTask.jsx';
import TaskCard from '../components/TaskCard';
import EmptyTaskState from "../components/TaskComponents/EmptyTaskState.jsx";

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

    useEffect(() => {
      fetchTasks();
    }, []);

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
            <Button
                style={{height:'auto', width:'auto', backgroundColor: 'white', color: 'black'}}
                onClick={() => {
                    setEditingTask(null);
                    setShowForm(true);
                }}
            >
                <span style={{ fontSize: '1.25rem' }}></span> Create New Task
            </Button>
        </Header>

        {/* Tasks List */}
        {tasks.length === 0 ? (
            <EmptyTaskState setEditingTask={setEditingTask} setShowForm={setShowForm} />
        ) : (
            <TaskGrid>
                {tasks.map(task => (
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

