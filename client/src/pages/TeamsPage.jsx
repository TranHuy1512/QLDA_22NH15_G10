import React, { useState, useEffect } from 'react';
import axiosInstance from '../utils/axios';
import { Link } from 'react-router-dom';

const TeamsPage = () => {
  const [teams, setTeams] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [teamName, setTeamName] = useState('');
  const [teamDesc, setTeamDesc] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [creating, setCreating] = useState(false);
  const [editingTeam, setEditingTeam] = useState(null);
  const [deletingTeamId, setDeletingTeamId] = useState(null);
  const [savingEdit, setSavingEdit] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/api/teams');
      if (response.data.success) {
        setTeams(response.data.data);
      } else {
        setError('Failed to fetch teams');
      }
    } catch (err) {
      setError('Failed to fetch teams');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTeam = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      const response = await axiosInstance.post('/api/teams', {
        name: teamName,
        description: teamDesc,
      });
      if (response.data.success) {
        setTeams([response.data.data, ...teams]);
        setShowModal(false);
        setTeamName('');
        setTeamDesc('');
      } else {
        setError('Failed to create team');
      }
    } catch (err) {
      setError('Failed to create team');
    } finally {
      setCreating(false);
    }
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
        setShowModal(false);
        setEditingTeam(null);
        setTeamName('');
        setTeamDesc('');
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

  return (
    <div style={{ padding: '2rem', color: 'white' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold' }}>Teams</h1>
        <button
          style={{
            background: '#fff', color: '#111827', fontWeight: 'bold', borderRadius: 8, padding: '0.75rem 1.5rem', border: 'none', cursor: 'pointer', fontSize: '1rem'
          }}
          onClick={() => setShowModal(true)}
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
      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.6)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <form onSubmit={editingTeam ? handleSaveEdit : handleCreateTeam} style={{ background: '#181C23', borderRadius: 12, padding: '2rem', minWidth: 340, boxShadow: '0 2px 16px rgba(0,0,0,0.18)' }}>
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
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
              <button type="button" onClick={() => { setShowModal(false); setEditingTeam(null); setTeamName(''); setTeamDesc(''); }} style={{ background: 'none', color: '#9CA3AF', border: 'none', fontSize: 15, cursor: 'pointer' }}>Cancel</button>
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

export default TeamsPage;
