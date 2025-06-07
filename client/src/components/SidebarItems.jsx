import React from 'react';
import SidebarItem from './SidebarItem';

const sidebarItems = [
    {
        name: 'Tasks',
        id: 'tasks',
        icon: <span>📋</span>,
        route: '/dashboard',
    },
    {
        name: 'Board',
        id: 'board',
        icon: <span>🗂️</span>,
        route: '/board',
    },
    {
        name: 'Gantt Chart',
        id: 'gantt',
        icon: <span>📊</span>,
        route: '/gantt',
    },
    {
        name: 'Teams',
        id: 'teams',
        icon: <span>👥</span>,
        route: '/teams',
    },
    {
        name: 'Messages',
        id: 'messages',
        icon: <span>💬</span>,
        route: '/messages',
    },
    {
        name: 'Profile',
        id: 'profile',
        icon: <span>👤</span>,
        route: '/profile',
    },
    {
        name: 'Settings',
        id: 'settings',
        icon: <span>⚙️</span>,
        route: '/settings',
    },
];

const SidebarItems = ({ activeItem, navigate }) => {
    return (
        <>
            {sidebarItems.map((item) => (
                <SidebarItem
                    key={item.id}
                    name={item.name}
                    id={item.id}
                    icon={item.icon}
                    route={item.route}
                    activeItem={activeItem}
                    navigate={navigate}
                />
            ))}
        </>
    );
};

export default SidebarItems;