import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import TeamMembers from '../components/TeamMembers';
import axios from '../utils/axios';

const TeamManagement = () => {
  const { teamId } = useParams();
  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTeamDetails();
  }, [teamId]);

  const fetchTeamDetails = async () => {
    try {
      const response = await axios.get(`/api/teams/${teamId}`);
      setTeam(response.data.data);
    } catch (error) {
      toast.error('Failed to fetch team details');
      console.error('Error fetching team:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Loading...</div>;
  }

  if (!team) {
    return <div style={{ textAlign: 'center', color: '#DC2626' }}>Team not found</div>;
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '768px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#111827' }}>{team.name}</h1>
        <p style={{ marginTop: '0.5rem', color: '#4B5563' }}>{team.description}</p>
      </div>

      <TeamMembers teamId={teamId} />
    </div>
  );
};

export default TeamManagement; 