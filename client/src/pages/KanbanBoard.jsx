import axios from "axios";
import React from "react";
import TaskCard from "../components/TaskCard";

const KanbanBoard = () => {
  const [tasks, setTasks] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');

  React.useEffect(() => {
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
        setError(error.response?.data?.message || 'Failed to fetch tasks');
      } finally {
        setLoading(false);
      }
    };
    fetchTasks();
  }, []);

  const columns = [
    { key: 'todo', title: 'To Do' },
    { key: 'in-progress', title: 'In Progress' },
    { key: 'completed', title: 'Done' },
  ];

  if (loading) return <div style={{ color: 'white', textAlign: 'center', padding: '2rem' }}>Loading board...</div>;
  if (error) return <div style={{ color: 'red', textAlign: 'center', padding: '2rem' }}>{error}</div>;

  return (
    <div style={{ display: 'flex', gap: '2rem', justifyContent: 'center', alignItems: 'flex-start', minHeight: '60vh' }}>
      {columns.map(col => (
        <div key={col.key} style={{ background: '#1F2937', borderRadius: '0.5rem', padding: '1rem', minWidth: '300px', flex: 1 }}>
          <h2 style={{ color: 'white', fontSize: '1.25rem', marginBottom: '1rem', textAlign: 'center' }}>{col.title}</h2>
          {tasks.filter(task => task.status === col.key).length === 0 ? (
            <div style={{ color: '#9CA3AF', textAlign: 'center', padding: '1rem' }}>No tasks</div>
          ) : (
            tasks.filter(task => task.status === col.key).map(task => (
              <TaskCard key={task._id} task={task} onStatusChange={() => {}} onEdit={() => {}} onDelete={() => {}} />
            ))
          )}
        </div>
      ))}
    </div>
  );
};

export default KanbanBoard;