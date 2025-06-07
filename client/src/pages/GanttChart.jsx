import React, { useState, useEffect } from 'react';
import axios from '../utils/axios';

// Sample data for groups, replace with your actual data
const groups = [
  { _id: '1', name: 'Team Alpha' },
  { _id: '2', name: 'Team Beta' },
  { _id: '3', name: 'Team Gamma' },
];

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
    <div>
      <div style={{ display: "flex", gap: 16, marginBottom: 24 }}>
        {/* Team filter UI (not required to implement actual filtering) */}
        <select>
          <option value="">All Teams (temporarily unusable)</option>
          {teams.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
        </select>
        {/* Member filter UI (active) */}
        <select value={selectedMember} onChange={e => setSelectedMember(e.target.value)} style={{ padding: 8, borderRadius: 6 }}>
          <option value="">All Members</option>
          {members.map(m => <option key={m._id} value={m._id}>{m.name || m.email}</option>)}
        </select>
      </div>
      {/* Simple Gantt Chart Visualization */}
      <div style={{ overflowX: 'auto', background: '#23272F', borderRadius: 8, padding: 16, marginTop: 24 }}>
        {loadingTasks ? (
          <div>Loading tasks...</div>
        ) : tasks.length === 0 ? (
          <div>No tasks found.</div>
        ) : (
          <div style={{ minWidth: 600 }}>
            {/* Calculate min/max dates */}
            {(() => {
              // Filter tasks by member if selected
              const filteredTasks = tasks.filter(task => {
                if (!selectedMember) return true;
                if (!task.assignees) return false;
                // Assignees can be array of strings or objects
                return task.assignees.some(aid =>
                  (typeof aid === 'string' && aid === selectedMember) ||
                  (typeof aid === 'object' && (aid._id === selectedMember))
                );
              });
              if (filteredTasks.length === 0) return <div>No tasks for this member.</div>;
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
                // If still empty (invalid dates), show today
                if (days.length === 0) days.push(new Date());
              }
              // Render header
              return (
                <div>
                  <div style={{ display: 'flex', fontWeight: 'bold', color: '#9CA3AF', fontSize: 13 }}>
                    <div style={{ width: 180, minWidth: 180, padding: 4 }}>Task</div>
                    {days.map(day => (
                      <div key={day.toISOString()} style={{ minWidth: 28, textAlign: 'center', padding: 2 }}>
                        {day.getDate()}/{day.getMonth() + 1}
                      </div>
                    ))}
                  </div>
                  {/* Render each task as a bar */}
                  {filteredTasks.map(task => {
                    const start = parseDate(task.createdAt);
                    const end = parseDate(task.dueDate) || start;
                    // fallback: if not found, use 0 (start) and days.length-1 (end)
                    let startIdx = days.findIndex(day => isSameDate(day, start));
                    let endIdx = days.findIndex(day => isSameDate(day, end));
                    if (startIdx === -1) startIdx = 0;
                    if (endIdx === -1) endIdx = days.length - 1;
                    return (
                      <div key={task._id} style={{ display: 'flex', alignItems: 'center', height: 32 }}>
                        <div style={{ width: 180, minWidth: 180, padding: 4, color: '#fff', fontSize: 14, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={task.title}>{task.title}</div>
                        {days.map((day, idx) => {
                          if (idx < startIdx || idx > endIdx) {
                            return <div key={idx} style={{ minWidth: 28, height: 18 }} />;
                          }
                          // Bar style
                          const isStart = idx === startIdx;
                          const isEnd = idx === endIdx;
                          return (
                            <div
                              key={idx}
                              style={{
                                minWidth: 28,
                                height: 18,
                                background: '#6366F1',
                                borderTopLeftRadius: isStart ? 8 : 0,
                                borderBottomLeftRadius: isStart ? 8 : 0,
                                borderTopRightRadius: isEnd ? 8 : 0,
                                borderBottomRightRadius: isEnd ? 8 : 0,
                                marginLeft: isStart ? 1 : 0,
                                marginRight: isEnd ? 1 : 0,
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