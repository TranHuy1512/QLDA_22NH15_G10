import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import axios from '../utils/axios';
import { useAuth } from '../context/authContext';

const TeamMembers = ({ teamId }) => {
  const { user: loggedInUser } = useAuth();
  const [members, setMembers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUserIds, setSelectedUserIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingUsers, setLoadingUsers] = useState(true);

  useEffect(() => {
    fetchMembers();
    fetchUsers();
  }, [teamId]);

  useEffect(() => {
    if (members.length > 0) {
      setSelectedUserIds(members.map(member => member.user._id));
    }
    const memberUserIds = members.map(member => member.user._id);
    setSelectedUserIds(prevSelected => {
      const validSelected = prevSelected.filter(id => allUsers.some(user => user._id === id) || memberUserIds.includes(id));
      const newlyAddedMembers = memberUserIds.filter(id => !validSelected.includes(id));
      return [...validSelected, ...newlyAddedMembers];
    });
  }, [members, allUsers]);

  const fetchMembers = async () => {
    try {
      const response = await axios.get(`/api/teams/${teamId}/members`);
      setMembers(response.data.data);
    } catch (error) {
      toast.error('Failed to fetch team members');
      console.error('Error fetching members:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      setLoadingUsers(true);
      const response = await axios.get('/api/users');
      if (response.data.success) {
        setAllUsers(response.data.data);
      } else {
        toast.error('Failed to fetch users');
        console.error('Error fetching users:', error);
      }
    } catch (error) {
      toast.error('Failed to fetch users');
      console.error('Error fetching users:', error);
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    const currentMemberIds = members.map(member => member.user._id);
    const usersToAdd = selectedUserIds.filter(userId => !currentMemberIds.includes(userId));

    if (usersToAdd.length === 0) {
      toast.error('No new members selected to add.');
      return;
    }

    try {
      const addPromises = usersToAdd.map(userId => 
        axios.post(`/api/teams/${teamId}/members`, { userId })
      );
      await Promise.all(addPromises);
      toast.success('New member(s) added successfully');
      fetchMembers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add member');
      console.error('Error adding member:', error);
    }
  };

  const handleRemoveMember = async (userId) => {
    try {
      await axios.delete(`/api/teams/${teamId}/members/${userId}`);
      toast.success('Member removed successfully');
      fetchMembers();
    } catch (error) {
      console.error('Error removing member:', error);
      if (error.response && error.response.status === 403) {
        toast.error('You do not have permission to remove members.');
      } else {
        toast.error('Failed to remove member');
      }
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      // Optimistically update the UI
      setMembers(members.map(member =>
        member.user._id === userId ? { ...member, role: newRole } : member
      ));

      const response = await axios.put(`/api/teams/${teamId}/members/${userId}/role`, { role: newRole });

      if (response.data.success) {
        toast.success('Member role updated successfully');
        // No need to fetchMembers() again if optimistic update is correct
      } else {
        toast.error(response.data.message || 'Failed to update member role');
        // Revert UI change if API call failed
        fetchMembers();
      }
    } catch (error) {
      toast.error('Failed to update member role');
      console.error('Error updating member role:', error);
      // Revert UI change on error
      fetchMembers();
    }
  };

  const handleCheckboxChange = (userId) => {
    setSelectedUserIds(prevSelected =>
      prevSelected.includes(userId)
        ? prevSelected.filter(id => id !== userId)
        : [...prevSelected, userId]
    );
  };

  const filteredUsers = allUsers.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const currentMemberIds = members.map(member => member.user._id);
  const hasNewSelectedMembers = selectedUserIds.some(userId => !currentMemberIds.includes(userId));

  // Determine if the current user is an admin
  const currentUserMember = members.find(member => member.user._id === loggedInUser?._id);
  const isCurrentUserAdmin = currentUserMember && currentUserMember.role === 'admin';

  if (loading || loadingUsers) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100%',
        minHeight: '200px',
        fontSize: '1rem',
        color: '#374151',
      }}>
        Loading...
      </div>
    );
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '1.5rem',
      maxWidth: '800px',
      margin: '0 auto',
      padding: '1rem',
    }}>
      {/* Add Member Section */}
      <div style={{
        background: '#ffffff',
        padding: '2rem',
        borderRadius: '0.75rem',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.05)',
        transition: 'all 0.3s ease',
      }}>
        <h3 style={{
          fontSize: '1.25rem',
          fontWeight: '600',
          color: '#1F2937',
          marginBottom: '1.5rem',
        }}>Add New Member</h3>
        <form onSubmit={handleAddMember} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Search Input */}
          <div>
            <label style={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: '500',
              color: '#374151',
              marginBottom: '0.5rem',
            }}>
              Search Users by Name or Email
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                borderRadius: '0.5rem',
                border: '1px solid #D1D5DB',
                fontSize: '0.875rem',
                color: '#1F2937',
                backgroundColor: '#F9FAFB',
                transition: 'all 0.2s ease',
                outline: 'none',
                boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
              }}
              placeholder="Enter name or email"
              onFocus={(e) => e.target.style.borderColor = '#4F46E5'}
              onBlur={(e) => e.target.style.borderColor = '#D1D5DB'}
            />
          </div>

          {/* User List with Checkboxes */}
          <div style={{
            maxHeight: '250px',
            overflowY: 'auto',
            border: '1px solid #E5E7EB',
            borderRadius: '0.5rem',
            backgroundColor: '#F9FAFB',
            scrollbarWidth: 'thin',
            scrollbarColor: '#9CA3AF #F3F4F6',
          }}>
            {loadingUsers ? (
              <div style={{
                padding: '1.5rem',
                textAlign: 'center',
                color: '#6B7280',
                fontSize: '0.875rem',
              }}>Loading users...</div>
            ) : filteredUsers.length > 0 ? (
              filteredUsers.map(user => (
                <div
                  key={user._id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '1rem',
                    borderBottom: '1px solid #E5E7EB',
                    transition: 'background-color 0.2s ease',
                    backgroundColor: selectedUserIds.includes(user._id) ? '#E0E7FF' : 'transparent',
                    '&:hover': { backgroundColor: '#F3F4F6' },
                  }}
                >
                  <input
                    type="checkbox"
                    checked={selectedUserIds.includes(user._id)}
                    onChange={() => handleCheckboxChange(user._id)}
                    style={{
                      marginRight: '1rem',
                      accentColor: '#4F46E5',
                      width: '1.25rem',
                      height: '1.25rem',
                      cursor: 'pointer',
                    }}
                  />
                  <div>
                    <p style={{ fontWeight: '500', color: '#1F2937' }}>{user.name}</p>
                    <p style={{ fontSize: '0.75rem', color: '#6B7280' }}>{user.email}</p>
                  </div>
                </div>
              ))
            ) : (filteredUsers.length === 0 && searchTerm !== '') ? (
              <div style={{
                padding: '1.5rem',
                textAlign: 'center',
                color: '#6B7280',
                fontSize: '0.875rem',
              }}>No users found matching your search.</div>
            ) : (
              <div style={{
                padding: '1.5rem',
                textAlign: 'center',
                color: '#6B7280',
                fontSize: '0.875rem',
              }}>No users available.</div>
            )}
          </div>

          <button
            type="submit"
            style={{
              padding: '0.75rem 1.5rem',
              borderRadius: '0.5rem',
              backgroundColor: hasNewSelectedMembers ? '#4F46E5' : '#9CA3AF',
              color: '#ffffff',
              fontSize: '0.875rem',
              fontWeight: '500',
              border: 'none',
              cursor: hasNewSelectedMembers ? 'pointer' : 'not-allowed',
              transition: 'background-color 0.3s ease, transform 0.2s ease',
              boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.1)',
            }}
            disabled={!hasNewSelectedMembers}
            onMouseOver={(e) => hasNewSelectedMembers && (e.target.style.backgroundColor = '#4338CA')}
            onMouseOut={(e) => hasNewSelectedMembers && (e.target.style.backgroundColor = '#4F46E5')}
            onFocus={(e) => hasNewSelectedMembers && (e.target.style.backgroundColor = '#4338CA')}
            onBlur={(e) => hasNewSelectedMembers && (e.target.style.backgroundColor = '#4F46E5')}
          >
            Add Selected Member(s)
          </button>
        </form>
      </div>

      {/* Members List */}
      <div style={{
        background: '#ffffff',
        padding: '2rem',
        borderRadius: '0.75rem',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.05)',
        transition: 'all 0.3s ease',
      }}>
        <h3 style={{
          fontSize: '1.25rem',
          fontWeight: '600',
          color: '#1F2937',
          marginBottom: '1.5rem',
        }}>Team Members</h3>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          maxHeight: '250px',
          overflowY: 'auto',
          scrollbarWidth: 'thin',
          scrollbarColor: '#9CA3AF #F3F4F6',
        }}>
          {members.length > 0 ? (
            members.map((member) => (
              <div
                key={member._id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '1rem',
                  backgroundColor: '#F9FAFB',
                  borderRadius: '0.5rem',
                  transition: 'background-color 0.2s ease',
                  '&:hover': { backgroundColor: '#F3F4F6' },
                }}
              >
                <div>
                  <p style={{ fontWeight: '500', color: '#1F2937' }}>{member.user.name}</p>
                  <p style={{ fontSize: '0.75rem', color: '#6B7280' }}>{member.user.email}</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  {/* Role Selection */}
                  <select
                    value={member.role}
                    onChange={(e) => handleRoleChange(member.user._id, e.target.value)}
                    disabled={!isCurrentUserAdmin}
                    style={{
                      padding: '0.5rem',
                      borderRadius: '0.375rem',
                      border: '1px solid #D1D5DB',
                      backgroundColor: '#F9FAFB',
                      fontSize: '0.75rem',
                      color: '#1F2937',
                      cursor: 'pointer',
                    }}
                  >
                    <option value="member">Member</option>
                    <option value="admin">Admin</option>
                  </select>
                  <button
                    onClick={() => handleRemoveMember(member.user._id)}
                    disabled={!isCurrentUserAdmin}
                    style={{
                      padding: '0.5rem 1rem',
                      borderRadius: '0.375rem',
                      backgroundColor: '#DC2626',
                      color: '#ffffff',
                      fontSize: '0.75rem',
                      fontWeight: '500',
                      border: 'none',
                      cursor: 'pointer',
                      transition: 'background-color 0.3s ease, transform 0.2s ease',
                      boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.1)',
                    }}
                    onMouseOver={(e) => (e.target.style.backgroundColor = '#B91C1C')}
                    onMouseOut={(e) => (e.target.style.backgroundColor = '#DC2626')}
                    onFocus={(e) => (e.target.style.backgroundColor = '#B91C1C')}
                    onBlur={(e) => (e.target.style.backgroundColor = '#DC2626')}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p style={{
              color: '#6B7280',
              textAlign: 'center',
              fontSize: '0.875rem',
              padding: '1.5rem',
            }}>No members found</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeamMembers;