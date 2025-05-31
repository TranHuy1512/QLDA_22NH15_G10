import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/authContext';
import TaskPage from './TaskPage';
import KanbanBoard from './KanbanBoard';
import TeamsPage from './TeamsPage';
import ProfilePage from './ProfilePage';
import TeamManagement from './TeamManagement';
import axiosInstance from '../utils/axios';
import { useLocation, useParams, useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [activeItem, setActiveItem] = useState('tasks');
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [isTeamDropdownOpen, setIsTeamDropdownOpen] = useState(false);

  // State for team creation/edit modal
  const [showModal, setShowModal] = useState(false);
  const [teamName, setTeamName] = useState('');
  const [teamDesc, setTeamDesc] = useState('');
  const [creating, setCreating] = useState(false);
  const [editingTeam, setEditingTeam] = useState(null);
  const [deletingTeamId, setDeletingTeamId] = useState(null);
  const [savingEdit, setSavingEdit] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // State for new team member selection
  const [allUsers, setAllUsers] = useState([]);
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [selectedNewTeamUserIds, setSelectedNewTeamUserIds] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  const fetchTeams = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/api/teams');
      if (response.data.success) {
        const teamsData = response.data.data;
        setTeams(teamsData);
        if (!location.pathname.startsWith('/teams/') && teamsData.length > 0) {
          setSelectedTeam(teamsData[0]);
        }
      } else {
        setError('Failed to fetch teams');
        console.error('Failed to fetch teams:', response.data.message);
      }
    } catch (error) {
      setError('Failed to fetch teams');
      console.error('Error fetching teams:', error);
    } finally {
      setLoading(false);
    }
  }, [setTeams, setLoading, setError, setSelectedTeam, location.pathname]);

  const fetchUsers = useCallback(async () => {
    try {
      setLoadingUsers(true);
      const response = await axiosInstance.get('/api/users');
      if (response.data.success) {
        setAllUsers(response.data.data);
      } else {
        console.error('Failed to fetch users:', response.data.message);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoadingUsers(false);
    }
  }, [setAllUsers, setLoadingUsers, setError]);

  useEffect(() => {
    fetchTeams();
  }, [fetchTeams]);

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

  // Fetch all users when the modal is shown for creating a new team
  useEffect(() => {
    if (showModal && !editingTeam) {
      fetchUsers();
    }
  }, [showModal, editingTeam, fetchUsers]);

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

  // Handle checkbox change for new team members
  const handleNewTeamCheckboxChange = (userId) => {
    setSelectedNewTeamUserIds(prevSelected =>
      prevSelected.includes(userId)
        ? prevSelected.filter(id => id !== userId)
        : [...prevSelected, userId]
    );
  };

  // Filter users based on search term
  const filteredUsers = allUsers.filter(user => 
    user.name.toLowerCase().includes(userSearchTerm.toLowerCase()) || 
    user.email.toLowerCase().includes(userSearchTerm.toLowerCase())
  );

  // Close modal and reset states
  const handleCloseModal = () => {
    setShowModal(false);
    setEditingTeam(null);
    setTeamName('');
    setTeamDesc('');
    setUserSearchTerm('');
    setSelectedNewTeamUserIds([]);
  };

  const openCreateModal = () => {
    setEditingTeam(null); // Ensure not in editing mode
    setTeamName('');
    setTeamDesc('');
    setSelectedNewTeamUserIds([]); // Clear selected users for new team
    setShowModal(true);
  };

  // Edit team
  const handleEditTeam = (team) => {
    setEditingTeam(team);
    setTeamName(team.name);
    setTeamDesc(team.description);
    setShowModal(true);
  };

  // Save team edit
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    setSavingEdit(true);
    try {
      console.log('Editing team:', editingTeam);
      const response = await axiosInstance.patch(`/api/teams/${editingTeam._id}`, {
        name: teamName,
        description: teamDesc,
      });
      if (response.data.success) {
        setTeams(teams.map(t => t._id === editingTeam._id ? response.data.data : t));
        handleCloseModal(); // Close modal after saving
      } else {
        setError('Failed to update team');
      }
    } catch (err) {
      setError('Failed to update team');
    } finally {
      setSavingEdit(false);
    }
  };

  // Delete team
  const handleDeleteTeam = async (teamId) => {
    if (!window.confirm('Are you sure you want to delete this team?')) return;
    setDeletingTeamId(teamId);
    setDeleting(true);
    try {
      const response = await axiosInstance.delete(`/api/teams/${teamId}`);
      if (response.data.success) {
        setTeams(teams.filter(t => t._id !== teamId));
         // If the deleted team was the selected one, clear selectedTeam or select another
        if (selectedTeam && selectedTeam._id === teamId) {
            setSelectedTeam(teams.length > 1 ? teams.filter(t => t._id !== teamId)[0] : null);
             // Optionally navigate away if the last team is deleted
            if(teams.filter(t => t._id !== teamId).length === 0 && location.pathname === '/teams') {
                navigate('/dashboard'); // Example: navigate to tasks if no teams left
            }
        }
      } else {
        setError('Failed to delete team');
      }
    } catch (err) {
      setError('Failed to delete team');
    } finally {
      setDeleting(false);
      setDeletingTeamId(null);
    }
  };

  const handleCreateTeamSubmit = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      const response = await axiosInstance.post('/api/teams', {
        name: teamName,
        description: teamDesc,
        members: selectedNewTeamUserIds, // Include selected member IDs
      });
      if (response.data.success) {
        // Add the newly created team to the teams state
        setTeams([response.data.data, ...teams]);
        handleCloseModal(); // Close modal after creation
        // Optionally select the new team or navigate to its page
        // navigate(`/teams/${response.data.data._id}`); // Example: Navigate to the new team's page
      } else {
         // Handle backend validation errors or other issues
        const errorMessage = response.data.message || 'Failed to create team';
        console.error('Failed to create team:', errorMessage);
        setError(errorMessage); // Display error in the modal or page
      }
    } catch (err) {
       // Handle network errors or unexpected issues
      console.error('Error creating team:', err);
      setError('An error occurred while creating the team'); // Display a generic error
    } finally {
      setCreating(false);
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
        return (
            <TeamsPage 
                teams={teams}
                loading={loading}
                error={error}
                fetchTeams={fetchTeams}
                openCreateModal={openCreateModal}
                handleEditTeam={handleEditTeam}
                handleDeleteTeam={handleDeleteTeam}
                deletingTeamId={deletingTeamId}
                deleting={deleting}
            />
        );
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
      case 'profile':
        return <ProfilePage />;
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
      display: 'flex',
      fontFamily: 'Inter, sans-serif',
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
          name="Profile"
          id="profile"
          icon={<span>👤</span>}
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
              // Render team items and the "+ New Team" button here
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                 {/* Add "+ New Team" button to sidebar */}
                <button
                  onClick={openCreateModal}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '0.75rem',
                    padding: '0.75rem 1rem',
                    backgroundColor: '#374151',
                    color: 'white',
                    borderRadius: '0.375rem',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '1rem',
                    fontWeight: '500',
                    transition: 'background-color 0.2s',
                    ':hover': { backgroundColor: '#4B5563' }
                  }}
                >
                  <span>+</span> New Team
                </button>
                 {/* Render team list if not on /teams page */}
                {location.pathname !== '/teams' && teams.map(team => (
                   <div
                    key={team._id}
                     onClick={() => {
                       setSelectedTeam(team);
                       navigate(`/teams/${team._id}`);
                       setIsTeamDropdownOpen(false); // Close dropdown on select
                     }}
                    style={{
                       padding: '0.75rem 1rem',
                       backgroundColor: selectedTeam?._id === team._id ? '#4B5563' : 'transparent',
                       color: selectedTeam?._id === team._id ? 'white' : '#D1D5DB',
                       borderRadius: '0.375rem',
                       cursor: 'pointer',
                       fontSize: '0.875rem',
                       transition: 'background-color 0.2s',
                       ':hover': { backgroundColor: '#4B5563', color: 'white' }
                    }}
                  >
                    {team.name}
                   </div>
                ))}


                {/* Original dropdown structure - may need adjustment or removal */}
                 {isTeamDropdownOpen && location.pathname !== '/teams' && (
                  <div style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    width: '100%',
                    backgroundColor: '#23272F',
                    borderRadius: '0.375rem',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                    zIndex: 50,
                    padding: '0.5rem 0'
                  }}>
                    {teams.map(team => (
                      <div
                        key={team._id}
                        onClick={() => {
                          setSelectedTeam(team);
                          navigate(`/teams/${team._id}`);
                          setIsTeamDropdownOpen(false); // Close dropdown on select
                        }}
                        style={{
                          padding: '0.5rem 1rem',
                          color: selectedTeam?._id === team._id ? 'white' : '#D1D5DB',
                          backgroundColor: selectedTeam?._id === team._id ? '#4B5563' : 'transparent',
                          cursor: 'pointer',
                          fontSize: '0.875rem',
                          ':hover': { backgroundColor: '#4B5563', color: 'white' }
                        }}
                      >
                        {team.name}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid #374151' }}>
          <button
            onClick={logout}
            style={{
              width: '100%',
              padding: '0.75rem',
              backgroundColor: '#EF4444',
              color: 'white',
              border: 'none',
              borderRadius: '0.375rem',
              cursor: 'pointer',
              textAlign: 'center',
              fontWeight: 'bold',
            }}
          >
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div style={{
        flex: 1,
        padding: '1.5rem',
        overflowY: 'auto'
      }}>
        {renderContent()}
      </div>

      {/* Team Creation/Edit Modal (Rendered in Dashboard) */}
      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.6)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <form onSubmit={editingTeam ? handleSaveEdit : handleCreateTeamSubmit} style={{ background: '#181C23', borderRadius: 12, padding: '2rem', minWidth: 340, boxShadow: '0 2px 16px rgba(0,0,0,0.18)' }}>
            <h2 style={{ color: 'white', fontSize: '1.25rem', marginBottom: 16 }}>{editingTeam ? 'Edit Team' : 'Create New Team'}</h2>
            <div style={{ marginBottom: 16 }}>
              <label style={{ color: '#9CA3AF', fontSize: 14 }}>Team Name</label>
              <input
                type="text"
                value={teamName}
                onChange={e => setTeamName(e.target.value)}
                required
                style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #374151', background: '#23272F', color: 'white', marginTop: 6 }}
              />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ color: '#9CA3AF', fontSize: 14 }}>Description</label>
              <textarea
                value={teamDesc}
                onChange={e => setTeamDesc(e.target.value)}
                rows={3}
                style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #374151', background: '#23272F', color: 'white', marginTop: 6, resize: 'none' }}
              />
            </div>
             {/* Add Members Section (only for new team) */}
            {!editingTeam && (
              <div style={{ marginBottom: 16 }}>
                <label style={{
                  display: 'block',
                  color: '#9CA3AF',
                  fontSize: 14,
                  marginBottom: 6,
                }}>Select Members</label>
                {/* Search Input */}
                <input
                  type="text"
                  value={userSearchTerm}
                  onChange={(e) => setUserSearchTerm(e.target.value)}
                  style={{
                    width: '100%',
                    padding: 10,
                    borderRadius: 6,
                    border: '1px solid #374151',
                    background: '#23272F',
                    color: 'white',
                    marginBottom: 10,
                  }}
                  placeholder="Search users"
                />
                {/* User List with Checkboxes */}
                <div style={{
                  maxHeight: '150px',
                  overflowY: 'auto',
                  border: '1px solid #374151',
                  borderRadius: 6,
                  background: '#23272F',
                  scrollbarWidth: 'thin',
                  scrollbarColor: '#4B5563 #23272F',
                }}>
                  {loadingUsers ? (
                    <div style={{ padding: 10, textAlign: 'center', color: '#9CA3AF', fontSize: 14 }}>Loading users...</div>
                  ) : filteredUsers.length > 0 ? (
                    filteredUsers.map(user => (
                      <div
                        key={user._id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          padding: 10,
                          borderBottom: '1px solid #374151',
                          cursor: 'pointer',
                          background: selectedNewTeamUserIds.includes(user._id) ? '#4B5563' : 'transparent',
                        }}
                        onClick={() => handleNewTeamCheckboxChange(user._id)}
                      >
                        <input
                          type="checkbox"
                          checked={selectedNewTeamUserIds.includes(user._id)}
                          onChange={() => handleNewTeamCheckboxChange(user._id)} // Keep onChange for accessibility/redundancy
                          style={{
                            marginRight: 10,
                            accentColor: '#6366F1',
                            cursor: 'pointer',
                          }}
                        />
                        <div>
                          <p style={{ fontWeight: 'bold', color: 'white' }}>{user.name}</p>
                          <p style={{ fontSize: 12, color: '#9CA3AF' }}>{user.email}</p>
                        </div>
                      </div>
                    ))
                  ) : (userSearchTerm !== '' && filteredUsers.length === 0) ? (
                    <div style={{ padding: 10, textAlign: 'center', color: '#9CA3AF', fontSize: 14 }}>No users found.</div>
                  ) : (
                    <div style={{ padding: 10, textAlign: 'center', color: '#9CA3AF', fontSize: 14 }}>Search or select users to add.</div>
                  )}
                </div>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
              <button type="button" onClick={handleCloseModal} style={{ background: 'none', color: '#9CA3AF', border: 'none', fontSize: 15, cursor: 'pointer' }}>Cancel</button>
              <button type="submit" disabled={creating || savingEdit} style={{ background: '#fff', color: '#181C23', fontWeight: 'bold', borderRadius: 8, padding: '0.5rem 1.25rem', border: 'none', cursor: 'pointer', fontSize: '1rem' }}>
                {editingTeam ? (savingEdit ? 'Saving...' : 'Save') : (creating ? 'Creating...' : 'Create')}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default Dashboard;