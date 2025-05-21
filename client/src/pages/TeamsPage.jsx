import React, { useState, useEffect } from 'react';
import axiosInstance from '../utils/axios';
import { Link } from 'react-router-dom';

// Accept modal state and handlers as props
const TeamsPage = ({ 
  teams, 
  loading,
  error,
  fetchTeams, // Keep fetching teams logic here or move to Dashboard?
  openCreateModal, // Handler to open create modal
  handleEditTeam, // Handler to open edit modal
  handleDeleteTeam, // Handler to delete team
  deletingTeamId, // State for deleting
  deleting // State for deleting
}) => {
  // Remove local modal state
  // const [teams, setTeams] = useState([]);
  // const [showModal, setShowModal] = useState(false);
  // const [teamName, setTeamName] = useState('');
  // const [teamDesc, setTeamDesc] = useState('');
  // const [loading, setLoading] = useState(true);
  // const [error, setError] = useState('');
  // const [creating, setCreating] = useState(false);
  // const [editingTeam, setEditingTeam] = useState(null);
  // const [deletingTeamId, setDeletingTeamId] = useState(null);
  // const [savingEdit, setSavingEdit] = useState(false);
  // const [deleting, setDeleting] = useState(false);

  // State for new team member selection (move to Dashboard)
  // const [allUsers, setAllUsers] = useState([]);
  // const [userSearchTerm, setUserSearchTerm] = useState('');
  // const [selectedNewTeamUserIds, setSelectedNewTeamUserIds] = useState([]);
  // const [loadingUsers, setLoadingUsers] = useState(false);

  useEffect(() => {
    fetchTeams(); // Use fetchTeams prop
  }, [fetchTeams]);

  // Remove modal related useEffects and handler functions
  // useEffect(() => {
  //   if (showModal && !editingTeam) {
  //     fetchUsers();
  //   }
  // }, [showModal, editingTeam]);

  // Remove fetchUsers, handleCreateTeam, handleEditTeam, handleSaveEdit, handleDeleteTeam, handleNewTeamCheckboxChange, filteredUsers, handleCloseModal

  return (
    <div style={{ padding: '2rem', color: 'white' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold' }}>Teams</h1>
        <button
          style={{
            background: '#fff', color: '#111827', fontWeight: 'bold', borderRadius: 8, padding: '0.75rem 1.5rem', border: 'none', cursor: 'pointer', fontSize: '1rem'
          }}
          onClick={openCreateModal} // Call openCreateModal prop
        >
          + New Team
        </button>
      </div>
      {loading ? (
        <div style={{ color: '#9CA3AF' }}>Loading teams...</div>
      ) : error ? (
        <div style={{ color: '#EF4444' }}>{error}</div>
      ) : (
        <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
          {teams.map(team => (
            <div key={team._id} style={{ background: '#181C23', borderRadius: 12, padding: '1.5rem', minWidth: 320, maxWidth: 350, flex: 1, boxShadow: '0 2px 8px rgba(0,0,0,0.08)', position: 'relative' }}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: 12, justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <span style={{ fontSize: 22, marginRight: 8 }}>👥</span>
                  <span style={{ fontWeight: 600, fontSize: '1.1rem' }}>{team.name}</span>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <Link to={`/teams/${team._id}`} style={{ background: 'none', border: 'none', color: '#9CA3AF', cursor: 'pointer', fontSize: 18 }} title="Manage Members">
                    <span role="img" aria-label="manage members">👥</span>
                  </Link>
                  <button onClick={() => handleEditTeam(team)} style={{ background: 'none', border: 'none', color: '#9CA3AF', cursor: 'pointer', fontSize: 18 }} title="Edit"><span role="img" aria-label="edit">✏️</span></button>
                  <button onClick={() => handleDeleteTeam(team._id)} style={{ background: 'none', border: 'none', color: '#EF4444', cursor: deletingTeamId === team._id && deleting ? 'not-allowed' : 'pointer', fontSize: 18 }} title="Delete" disabled={deletingTeamId === team._id && deleting}><span role="img" aria-label="delete">🗑️</span></button>
                </div>
              </div>
              <div style={{ color: '#9CA3AF', fontSize: 14, marginBottom: 16 }}>{team.description}</div>
              <div style={{ color: '#6B7280', fontSize: 13, marginBottom: 8 }}>Members ({team.memberCount})</div>
              <div style={{ background: '#23272F', borderRadius: 8, minHeight: 48, padding: 8, color: '#9CA3AF', fontSize: 14 }}>
                {team.memberCount === 0 ? (
                  <span>No members yet</span>
                ) : (
                  <span>{team.memberCount} members</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      {/* Modal will be rendered in Dashboard */}
    </div>
  );
};

export default TeamsPage;
