import React, { useState, useEffect } from 'react';
import axios from '../utils/axios';

// Sample data for groups, replace with your actual data
const groups = [
  { _id: '1', name: 'Team Alpha' },
  { _id: '2', name: 'Team Beta' },
  { _id: '3', name: 'Team Gamma' },
];

// Màu sắc cho các thanh task
const taskColors = [
  '#FF6B6B', // Coral Red
  '#4ECDC4', // Turquoise
  '#FFD93D', // Bright Yellow
  '#95E1D3', // Mint
  '#FF8B94', // Salmon Pink
  '#6C5CE7', // Bright Purple
  '#00B894', // Mint Green
  '#FFA502', // Orange
  '#00CEC9', // Bright Teal
  '#FF7675', // Soft Red
];

const getTaskColor = (index) => {
  return taskColors[index % taskColors.length];
};

const GanttChart = () => {
  const [selectedMember, setSelectedMember] = useState('');
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState([]);
  const [loadingTasks, setLoadingTasks] = useState(true);
  const [teams, setTeams] = useState([]);
  const [loadingTeams, setLoadingTeams] = useState(true);

  // Fetch members
  useEffect(() => {
    const fetchMembers = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/users');
        if (response.data.success) {
          setMembers(response.data.data);
        } else {
          setMembers([]);
        }
      } catch (error) {
        setMembers([]);
      } finally {
        setLoading(false);
      }
    };
    fetchMembers();
  }, []);

  // Fetch tasks
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setLoadingTasks(true);
        const response = await axios.get('/api/tasks');
        if (response.data.success) {
          setTasks(response.data.data);
        } else {
          setTasks([]);
        }
      } catch (error) {
        setTasks([]);
      } finally {
        setLoadingTasks(false);
      }
    };
    fetchTasks();
  }, []);

  // Fetch teams
  useEffect(() => {
    const fetchTeams = async () => {
      try {
        setLoadingTeams(true);
        const response = await axios.get('/api/teams');
        if (response.data.success) {
          setTeams(response.data.data);
        } else {
          setTeams([]);
        }
      } catch (error) {
        setTeams([]);
      } finally {
        setLoadingTeams(false);
      }
    };
    fetchTeams();
  }, []);

  return (
    <div style={{ padding: '24px', backgroundColor: '#1F2937', minHeight: '100vh' }}>
      <div style={{ 
        display: "flex", 
        gap: 16, 
        marginBottom: 24,
        backgroundColor: '#374151',
        padding: '16px',
        borderRadius: '12px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
      }}>
        {/* Team filter UI */}
        <div style={{ width: '200px' }}>
          <label style={{
            display: 'block',
            color: '#9CA3AF',
            fontSize: '12px',
            marginBottom: '4px',
            fontWeight: 500
          }}>
            Select Team
          </label>
          <select style={{
            width: '100%',
            padding: '8px 12px',
            borderRadius: '8px',
            border: '1px solid #4B5563',
            backgroundColor: '#1F2937',
            color: '#fff',
            fontSize: '13px',
            cursor: 'pointer',
            outline: 'none',
            transition: 'all 0.2s',
            appearance: 'none',
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='%239CA3AF' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'right 8px center',
            backgroundSize: '14px',
            '&:hover': {
              borderColor: '#6366F1',
              backgroundColor: '#2D3748',
            },
            '&:focus': {
              borderColor: '#6366F1',
              boxShadow: '0 0 0 2px rgba(99, 102, 241, 0.2)',
            }
          }}>
            <option value="">All Teams</option>
            {teams.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
          </select>
        </div>

        {/* Member filter UI */}
        <div style={{ width: '200px' }}>
          <label style={{
            display: 'block',
            color: '#9CA3AF',
            fontSize: '12px',
            marginBottom: '4px',
            fontWeight: 500
          }}>
            Select Member
          </label>
          <select 
            value={selectedMember} 
            onChange={e => setSelectedMember(e.target.value)} 
            style={{
              width: '100%',
              padding: '8px 12px',
              borderRadius: '8px',
              border: '1px solid #4B5563',
              backgroundColor: '#1F2937',
              color: '#fff',
              fontSize: '13px',
              cursor: 'pointer',
              outline: 'none',
              transition: 'all 0.2s',
              appearance: 'none',
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='%239CA3AF' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right 8px center',
              backgroundSize: '14px',
              '&:hover': {
                borderColor: '#6366F1',
                backgroundColor: '#2D3748',
              },
              '&:focus': {
                borderColor: '#6366F1',
                boxShadow: '0 0 0 2px rgba(99, 102, 241, 0.2)',
              }
            }}
          >
            <option value="">All Members</option>
            {members.map(m => <option key={m._id} value={m._id}>{m.name || m.email}</option>)}
          </select>
        </div>
      </div>

      {/* Gantt Chart Visualization */}
      <div style={{ 
        overflowX: 'auto', 
        background: '#374151', 
        borderRadius: '12px', 
        padding: '24px', 
        marginTop: '24px',
        boxShadow: '0 8px 16px -4px rgba(0, 0, 0, 0.2), 0 4px 8px -4px rgba(0, 0, 0, 0.1)',
        transition: 'transform 0.3s ease-in-out',
        '&:hover': {
          transform: 'translateY(-4px)',
        }
      }}>
        {loadingTasks ? (
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            minHeight: '200px',
            color: '#9CA3AF',
            fontSize: '16px'
          }}>
            Loading tasks...
          </div>
        ) : tasks.length === 0 ? (
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            minHeight: '200px',
            color: '#9CA3AF',
            fontSize: '16px'
          }}>
            No tasks found.
          </div>
        ) : (
          <div style={{ minWidth: 600 }}>
            {/* Calculate min/max dates */}
            {(() => {
              // Filter tasks by member if selected
              const filteredTasks = tasks.filter(task => {
                if (!selectedMember) return true;
                if (!task.assignees) return false;
                return task.assignees.some(aid =>
                  (typeof aid === 'string' && aid === selectedMember) ||
                  (typeof aid === 'object' && (aid._id === selectedMember))
                );
              });
              if (filteredTasks.length === 0) return (
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'center', 
                  alignItems: 'center', 
                  minHeight: '200px',
                  color: '#9CA3AF',
                  fontSize: '16px'
                }}>
                  No tasks for this member.
                </div>
              );

              // Get all start/end dates
              const parseDate = d => d ? new Date(d) : null;
              const isSameDate = (d1, d2) => {
                if (!d1 || !d2) return false;
                return d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth() && d1.getDate() === d2.getDate();
              };
              const allDates = filteredTasks.flatMap(task => [parseDate(task.createdAt), parseDate(task.dueDate)]).filter(Boolean);
              const minDate = new Date(Math.min(...allDates.map(d => d.getTime())));
              const maxDate = new Date(Math.max(...allDates.map(d => d.getTime())));
              
              // Build date columns (by day)
              const days = [];
              let d = new Date(minDate);
              while (d <= maxDate) {
                days.push(new Date(d));
                d.setDate(d.getDate() + 1);
              }

              // If only one task, ensure at least one day is shown
              if (days.length === 0 && filteredTasks.length === 1) {
                const t = filteredTasks[0];
                const start = parseDate(t.createdAt);
                const end = parseDate(t.dueDate) || start;
                let d = new Date(start);
                while (d <= end) {
                  days.push(new Date(d));
                  d.setDate(d.getDate() + 1);
                }
                if (days.length === 0) days.push(new Date());
              }

              // Render header
              return (
                <div>
                  <div style={{ 
                    display: 'flex', 
                    fontWeight: 'bold', 
                    color: '#9CA3AF', 
                    fontSize: 14,
                    borderBottom: '2px solid #4B5563',
                    paddingBottom: '12px',
                    marginBottom: '16px',
                    position: 'relative',
                    '&::after': {
                      content: '""',
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      height: '1px',
                      background: 'linear-gradient(90deg, transparent, #4B5563, transparent)',
                    }
                  }}>
                    <div style={{ 
                      width: 200, 
                      minWidth: 200, 
                      padding: '8px',
                      color: '#fff',
                      fontSize: '16px',
                      borderRight: '1px solid #4B5563'
                    }}>
                      Task
                    </div>
                    {days.map(day => (
                      <div key={day.toISOString()} style={{ 
                        minWidth: 32, 
                        textAlign: 'center', 
                        padding: '8px 4px',
                        color: '#fff',
                        fontSize: '14px',
                        borderRight: '1px solid #4B5563',
                        position: 'relative',
                        '&::after': {
                          content: '""',
                          position: 'absolute',
                          bottom: '-12px',
                          left: 0,
                          right: 0,
                          height: '1px',
                          background: '#4B5563',
                        }
                      }}>
                        {day.getDate()}/{day.getMonth() + 1}
                      </div>
                    ))}
                  </div>

                  {/* Render each task as a bar */}
                  {filteredTasks.map((task, taskIndex) => {
                    const start = parseDate(task.createdAt);
                    const end = parseDate(task.dueDate) || start;
                    let startIdx = days.findIndex(day => isSameDate(day, start));
                    let endIdx = days.findIndex(day => isSameDate(day, end));
                    if (startIdx === -1) startIdx = 0;
                    if (endIdx === -1) endIdx = days.length - 1;

                    return (
                      <div key={task._id} style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        height: 40,
                        marginBottom: '8px',
                        transition: 'all 0.2s',
                        position: 'relative',
                        '&::after': {
                          content: '""',
                          position: 'absolute',
                          bottom: 0,
                          left: 0,
                          right: 0,
                          height: '1px',
                          background: '#4B5563',
                          opacity: 0.5,
                        },
                        '&:hover': {
                          backgroundColor: '#4B5563',
                          borderRadius: '8px',
                        }
                      }}>
                        <div style={{ 
                          width: 200, 
                          minWidth: 200, 
                          padding: '8px',
                          color: '#fff', 
                          fontSize: 14,
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          fontWeight: 500,
                          borderRight: '1px solid #4B5563'
                        }} 
                        title={task.title}>
                          {task.title}
                        </div>
                        {days.map((day, idx) => {
                          if (idx < startIdx || idx > endIdx) {
                            return (
                              <div key={idx} style={{ 
                                minWidth: 32, 
                                height: 24,
                                borderRight: '1px solid #4B5563',
                                opacity: 0.5
                              }} />
                            );
                          }

                          const isStart = idx === startIdx;
                          const isEnd = idx === endIdx;
                          return (
                            <div
                              key={idx}
                              style={{
                                minWidth: 32,
                                height: 24,
                                background: getTaskColor(taskIndex),
                                marginLeft: isStart ? 1 : 0,
                                marginRight: isEnd ? 1 : 0,
                                transition: 'all 0.2s',
                                borderRight: '1px solid #4B5563',
                                '&:hover': {
                                  transform: 'scaleY(1.1)',
                                  boxShadow: '0 4px 6px -1px rgba(99, 102, 241, 0.4)',
                                }
                              }}
                            />
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </div>
        )}
      </div>
    </div>
  );
};

export default GanttChart;