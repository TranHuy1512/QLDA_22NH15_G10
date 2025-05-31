import styled from '@emotion/styled';

const Item = styled.div`
    padding: 1rem;
    color: ${(props) => (props.active ? 'white' : '#9ca3af')};
    background-color: ${(props) => (props.active ? '#374151' : 'transparent')};
    cursor: pointer;
    border-radius: 0.375rem;
    margin-bottom: 0.5rem;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    transition: all 0.2s;
    
    &:hover {
        background-color: #374151;
        color: white;
    }
`

const SidebarItem = ({ name, id, icon, route, activeItem, navigate }) => {
    const handleClick = () => {
        if (route) navigate(route);
    };
    return (
        <Item active={activeItem === id || (route && location.pathname.startsWith(route))} onClick={handleClick}>
            {icon}
            <span>{name}</span>
        </Item>
    );
};

export default SidebarItem;