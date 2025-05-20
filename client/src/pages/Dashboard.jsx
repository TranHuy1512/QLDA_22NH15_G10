import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/authContext';
import TaskPage from './TaskPage';
import CreateTeam from '../components/CreateTeam';
import axios from 'axios';

const Dashboard = () => {
  const { user } = useAuth();
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

  const fetchTeams = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/teams');
      if (response.data.success) {
        const teamsData = response.data.data;
        setTeams(teamsData);
        if (teamsData.length > 0) {
          setSelectedTeam(teamsData[0]);
          setActiveItem(`team-${teamsData[0]._id}`);
        }
      }
    } catch (error) {
      setError('Failed to fetch teams');
      console.error('Error fetching teams:', error);
    } finally {
      setLoading(false);
    }
  };

  const SidebarItem = ({ name, id, icon, onClick }) => (
    <div
      onClick={onClick || (() => setActiveItem(id))}
      style={{
        padding: '1rem',
        color: activeItem === id ? 'white' : '#9CA3AF',
        backgroundColor: activeItem === id ? '#374151' : 'transparent',
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

  const handleCreateTeam = (teamData) => {
    const newTeams = [teamData, ...teams];
    setTeams(newTeams);
    if (!selectedTeam) {
      setSelectedTeam(teamData);
      setActiveItem(`team-${teamData._id}`);
    }
  };

  const renderContent = () => {
    switch (activeItem) {
      case 'tasks':
        return <TaskPage />;
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
          const teamId = activeItem.replace('team-', '');
          const team = teams.find(t => t._id === teamId);
          if (team) {
            return (
              <div style={{ color: 'white' }}>
                <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>{team.name}</h2>
                <div style={{ 
                  backgroundColor: '#1F2937', 
                  padding: '1.5rem', 
                  borderRadius: '0.5rem',
                  maxWidth: '600px'
                }}>
                  <p style={{ color: '#9CA3AF', marginBottom: '1rem' }}>{team.description}</p>
                  <div style={{ 
                    fontSize: '0.875rem',
                    color: '#6B7280'
                  }}>
                    Created at: {new Date(team.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            );
          }
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
        backgroundColor: '#1F2937',
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
        />
        <SidebarItem
          name="Settings"
          id="settings"
          icon={<span>⚙️</span>}
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
                          setActiveItem(`team-${team._id}`);
                          setIsTeamDropdownOpen(false);
                        }}
                        style={{
                          padding: '0.75rem 1rem',
                          color: selectedTeam?._id === team._id ? 'white' : '#9CA3AF',
                          backgroundColor: selectedTeam?._id === team._id ? '#374151' : 'transparent',
                          cursor: 'pointer',
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

            <SidebarItem
              name="+ Create new team"
              id="create-team"
              icon={<span>➕</span>}
              onClick={() => setShowCreateTeam(true)}
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{
        flex: 1,
        padding: '2rem',
        backgroundColor: '#111827'
      }}>
        {renderContent()}
      </div>

      {showCreateTeam && (
        <CreateTeam
          onClose={() => setShowCreateTeam(false)}
          onSubmit={handleCreateTeam}
        />
      )}
    </div>
  );
};

export default Dashboard; 