import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/authContext';
import TaskPage from './TaskPage';
import KanbanBoard from './KanbanBoard';
import CreateTeam from '../components/CreateTeam';
import TeamsPage from './TeamsPage';
import TeamManagement from './TeamManagement';
import axiosInstance from '../utils/axios';
import { useLocation, useParams, useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [activeItem, setActiveItem] = useState('tasks');
  const [showCreateTeam, setShowCreateTeam] = useState(false);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [isTeamDropdownOpen, setIsTeamDropdownOpen] = useState(false);

  useEffect(() => {
    fetchTeams();
  }, []);

  useEffect(() => {
    if (location.pathname.startsWith('/teams/') && location.pathname.split('/').length === 3) {
      const teamIdFromUrl = location.pathname.split('/')[2];
      setActiveItem(`team-${teamIdFromUrl}`);
    } else if (location.pathname === '/dashboard') {
       setActiveItem('tasks');
    } else if (location.pathname === '/settings') {
      setActiveItem('settings');
    } else if (location.pathname === '/teams') {
      setActiveItem('teams');
    } else if (location.pathname === '/board') {
      setActiveItem('board');
    }

  }, [location.pathname]);

  const fetchTeams = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/api/teams');
      if (response.data.success) {
        const teamsData = response.data.data;
        setTeams(teamsData);
        if (!location.pathname.startsWith('/teams/') && teamsData.length > 0) {
          setSelectedTeam(teamsData[0]);
        }
      }
    } catch (error) {
      setError('Failed to fetch teams');
      console.error('Error fetching teams:', error);
    } finally {
      setLoading(false);
    }
  };

  const SidebarItem = ({ name, id, icon, route }) => {
    const handleClick = () => {
      setActiveItem(id);
      if (route) {
        navigate(route);
      }
    };

    return (
      <div
        onClick={handleClick}
        style={{
          padding: '1rem',
          color: activeItem === id || (route && location.pathname.startsWith(route)) ? 'white' : '#9CA3AF',
          backgroundColor: activeItem === id || (route && location.pathname.startsWith(route)) ? '#374151' : 'transparent',
          cursor: 'pointer',
          borderRadius: '0.375rem',
          marginBottom: '0.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          transition: 'all 0.2s',
          ':hover': {
            backgroundColor: '#374151',
            color: 'white'
          }
        }}
      >
        {icon}
        <span style={{ flex: 1 }}>{name}</span>
      </div>
    );
  };

  const handleCreateTeam = (teamData) => {
    const newTeams = [teamData, ...teams];
    setTeams(newTeams);
    if (!location.pathname.startsWith('/teams/') && !selectedTeam) {
      setSelectedTeam(teamData);
    }
  };

  const renderContent = () => {
    if (location.pathname.startsWith('/teams/') && location.pathname.split('/').length === 3) {
        const teamIdFromUrl = location.pathname.split('/')[2];
        return <TeamManagement teamId={teamIdFromUrl} />;
    }

    switch (activeItem) {
      case 'tasks':
        return <TaskPage />;
      case 'board':
        return <KanbanBoard />;
      case 'teams':
        return <TeamsPage />;
      case 'settings':
        return (
          <div style={{ color: 'white' }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Settings</h2>
            <div style={{ 
              backgroundColor: '#1F2937', 
              padding: '1.5rem', 
              borderRadius: '0.5rem',
              maxWidth: '600px'
            }}>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Account Settings</h3>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#9CA3AF' }}>
                  Email
                </label>
                <div style={{ 
                  padding: '0.75rem',
                  backgroundColor: '#374151',
                  borderRadius: '0.375rem',
                  color: 'white'
                }}>
                  {user?.email}
                </div>
              </div>
            </div>
          </div>
        );
      default:
        if (activeItem.startsWith('team-')) {
           const teamIdFromActiveItem = activeItem.replace('team-', '');
           return <TeamManagement teamId={teamIdFromActiveItem} />;
        }
        return null;
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#111827',
      display: 'flex'
    }}>
      {/* Sidebar */}
      <div style={{
        width: '250px',
        backgroundColor: '#0A0E14',
        padding: '1.5rem',
        borderRight: '1px solid #374151',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{ color: 'white', fontSize: '1.25rem', marginBottom: '0.5rem' }}>
            Dashboard
          </h2>
          <p style={{ color: '#9CA3AF', fontSize: '0.875rem' }}>
            {user?.email}
          </p>
        </div>

        <SidebarItem
          name="Tasks"
          id="tasks"
          icon={<span>📋</span>}
          route="/dashboard"
        />
        <SidebarItem
          name="Board"
          id="board"
          icon={<span>🗂️</span>}
           route="/board"
        />
        <SidebarItem
          name="Teams"
          id="teams"
          icon={<span>👥</span>}
           route="/teams"
        />
        <SidebarItem
          name="Settings"
          id="settings"
          icon={<span>⚙️</span>}
           route="/settings"
        />

        <div style={{ 
          marginTop: '2rem',
          paddingTop: '1rem',
          borderTop: '1px solid #374151',
          flex: 1,
          display: 'flex',
          flexDirection: 'column'
        }}>
          <div style={{ marginBottom: '1rem' }}>
            <h3 style={{ 
              color: '#9CA3AF', 
              fontSize: '0.875rem', 
              fontWeight: '500',
              marginBottom: '0.5rem',
              paddingLeft: '1rem'
            }}>
              Teams
            </h3>
            {loading ? (
              <div style={{ color: '#9CA3AF', padding: '1rem' }}>Loading teams...</div>
            ) : error ? (
              <div style={{ color: '#EF4444', padding: '1rem' }}>{error}</div>
            ) : (
              <div style={{ position: 'relative' }}>
                <div
                  onClick={() => setIsTeamDropdownOpen(!isTeamDropdownOpen)}
                  style={{
                    padding: '0.75rem 1rem',
                    backgroundColor: '#374151',
                    borderRadius: '0.375rem',
                    color: 'white',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '0.5rem'
                  }}
                >
                  <span>{selectedTeam ? selectedTeam.name : 'Select a team'}</span>
                  <span style={{ 
                    transform: isTeamDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.2s'
                  }}>
                    ▼
                  </span>
                </div>
                
                {isTeamDropdownOpen && (
                  <div style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    backgroundColor: '#1F2937',
                    borderRadius: '0.375rem',
                    border: '1px solid #374151',
                    maxHeight: '200px',
                    overflowY: 'auto',
                    zIndex: 10
                  }}>
                    {teams.map(team => (
                      <div
                        key={team._id}
                        onClick={() => {
                          setSelectedTeam(team);
                          setIsTeamDropdownOpen(false);
                          setActiveItem(`team-${team._id}`);
                          navigate(`/teams/${team._id}`);
                        }}
                        style={{
                          padding: '0.75rem 1rem',
                          color: activeItem === `team-${team._id}` ? 'white' : '#9CA3AF',
                          backgroundColor: activeItem === `team-${team._id}` ? '#374151' : 'transparent',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          ':hover': {
                            backgroundColor: '#374151',
                            color: 'white'
                          }
                        }}
                      >
                        {team.name}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

             <div style={{ 
               marginTop: '1rem',
               paddingLeft: '1rem'
             }}>
               <button
                 style={{
                   background: 'none',
                   border: 'none',
                   color: '#9CA3AF',
                   cursor: 'pointer',
                   fontSize: '0.875rem',
                   display: 'flex',
                   alignItems: 'center',
                   gap: '0.5rem'
                 }}
                 onClick={() => {
                   setShowCreateTeam(true);
                 }}
               >
                 +
                 <span>Create new team</span>
               </button>
             </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div style={{
        flex: 1,
        padding: '2rem',
        overflowY: 'auto'
      }}>
        {renderContent()}
      </div>

      {showCreateTeam && (
         <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.6)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
           <form onSubmit={(e) => { e.preventDefault(); setShowCreateTeam(false); handleCreateTeam({ name: e.target.teamName.value, description: e.target.teamDesc.value }); }} style={{ background: '#181C23', borderRadius: 12, padding: '2rem', minWidth: 340, boxShadow: '0 2px 16px rgba(0,0,0,0.18)' }}>
             <h2 style={{ color: 'white', fontSize: '1.25rem', marginBottom: 16 }}>Create New Team</h2>
             <div style={{ marginBottom: 16 }}>
               <label style={{ color: '#9CA3AF', fontSize: 14 }}>Team Name</label>
               <input
                 type="text"
                 name="teamName"
                 required
                 style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #374151', background: '#23272F', color: 'white', marginTop: 6 }}
               />
             </div>
             <div style={{ marginBottom: 16 }}>
               <label style={{ color: '#9CA3AF', fontSize: 14 }}>Description</label>
               <textarea
                 name="teamDesc"
                 rows={3}
                 style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #374151', background: '#23272F', color: 'white', marginTop: 6, resize: 'none' }}
               />
             </div>
             <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
               <button type="button" onClick={() => setShowCreateTeam(false)} style={{ background: 'none', color: '#9CA3AF', border: 'none', fontSize: 15, cursor: 'pointer' }}>Cancel</button>
               <button type="submit" style={{ background: '#fff', color: '#181C23', fontWeight: 'bold', borderRadius: 8, padding: '0.5rem 1.25rem', border: 'none', cursor: 'pointer', fontSize: '1rem' }}>
                 Create
               </button>
             </div>
           </form>
         </div>
      )}

    </div>
  );
};

export default Dashboard;