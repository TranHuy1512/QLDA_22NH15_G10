import styled from '@emotion/styled';

// Styled Components
const EmptyState = styled.div`
  text-align: center;
  padding: 3rem;
  background-color: rgba(255, 255, 255, 0.05);
  border-radius: 0.5rem;
  margin-top: 2rem;
  font-family: 'Fira Sans', sans-serif;
`;

const EmptyTitle = styled.div`
  font-size: 1.5rem;
  margin-bottom: 1rem;
  color: rgba(255, 255, 255, 0.8);
`;

const EmptyMessage = styled.p`
  color: rgba(255, 255, 255, 0.6);
  margin-bottom: 2rem;
`;

const CreateButton = styled.button`
  background-color: #3b82f6;
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  border: none;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1rem;
  font-weight: 500;
  transition: all 0.2s;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

  &:hover {
    background-color: #2563eb;
    transform: translateY(-1px);
  }

  span {
    font-size: 1.25rem;
  }
`;

const EmptyTaskState = ({ setEditingTask, setShowForm }) => {
    return (
        <EmptyState>
            <EmptyTitle>No Tasks Found</EmptyTitle>
            <EmptyMessage>There are no tasks available at the moment. Create a new task to get started!</EmptyMessage>
            <CreateButton
                onClick={() => {
                    setEditingTask(null);
                    setShowForm(true);
                }}
            >
                <span>➕</span> Create Your First Task
            </CreateButton>
        </EmptyState>
    );
};

export default EmptyTaskState;