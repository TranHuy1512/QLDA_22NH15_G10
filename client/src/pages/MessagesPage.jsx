import React, { useState, useEffect, useRef } from 'react';
import styled from '@emotion/styled';
import axiosInstance from '../utils/axios';
import { useAuth } from '../context/authContext';
import io from 'socket.io-client';

const Container = styled.div`
  display: flex;
  height: calc(100vh - 4rem);
  background: #111827;
  border-radius: 0.5rem;
  overflow: hidden;
`;

const Sidebar = styled.div`
  width: 300px;
  background: #1F2937;
  border-right: 1px solid #374151;
  display: flex;
  flex-direction: column;
`;

const SearchBar = styled.div`
  padding: 1rem;
  border-bottom: 1px solid #374151;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 0.75rem;
  background: #374151;
  border: none;
  border-radius: 0.375rem;
  color: white;
  font-size: 0.875rem;
  
  &::placeholder {
    color: #9CA3AF;
  }
  
  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px #4B5563;
  }
`;

const ChatList = styled.div`
  flex: 1;
  overflow-y: auto;
`;

const ChatItem = styled.div`
  padding: 1rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  transition: background-color 0.2s;
  
  &:hover {
    background: #374151;
  }
  
  ${props => props.active && `
    background: #374151;
  `}
`;

const ChatContent = styled.div`
  flex: 1;
  min-width: 0;
`;

const ChatName = styled.div`
  color: white;
  font-weight: 500;
  margin-bottom: 0.25rem;
`;

const LastMessage = styled.div`
  color: #9CA3AF;
  font-size: 0.875rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const MainChat = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  background: #111827;
`;

const ChatHeader = styled.div`
  padding: 1rem;
  border-bottom: 1px solid #374151;
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const ChatMessages = styled.div`
  flex: 1;
  padding: 1rem;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  background: #111827;
`;

const MessageInput = styled.div`
  padding: 1rem;
  border-top: 1px solid #374151;
  display: flex;
  gap: 0.75rem;
`;

const Input = styled.input`
  flex: 1;
  padding: 0.75rem;
  background: #374151;
  border: none;
  border-radius: 0.375rem;
  color: white;
  font-size: 0.875rem;
  
  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px #4B5563;
  }
`;

const SendButton = styled.button`
  padding: 0.75rem 1.5rem;
  background: #3B82F6;
  color: white;
  border: none;
  border-radius: 0.375rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
  
  &:hover {
    background: #2563EB;
  }
  
  &:disabled {
    background: #6B7280;
    cursor: not-allowed;
  }
`;

const MessageGroup = styled.div`
  display: flex;
  flex-direction: column;
  margin: 0.5rem 0;
  width: 100%;
  ${props => props.isOwn ? 'align-items: flex-end;' : 'align-items: flex-start;'}
`;

const Message = styled.div`
  max-width: 70%;
  padding: 0.75rem 1rem;
  border-radius: 1rem;
  font-size: 0.875rem;
  position: relative;
  display: flex;
  flex-direction: column;
  
  ${props => props.isOwn ? `
    background: #3B82F6;
    color: white;
    border-bottom-right-radius: 0.25rem;
  ` : `
    background: #374151;
    color: white;
    border-bottom-left-radius: 0.25rem;
  `}
`;

const MessageContent = styled.div`
  word-break: break-word;
  line-height: 1.4;
`;

const MessageTime = styled.div`
  font-size: 0.75rem;
  margin-top: 0.25rem;
  opacity: 0.8;
  text-align: ${props => props.isOwn ? 'right' : 'left'};
`;

const MessagesPage = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const messagesEndRef = useRef(null);
  const socketRef = useRef();

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  // Initialize socket connection
  useEffect(() => {
    if (user) {
      socketRef.current = io(API_URL, {
        withCredentials: true,
        transports: ['websocket']
      });
      
      // Join user's room
      const userId = user.userId || user._id;
      socketRef.current.emit('join', userId);

      // Listen for new messages
      socketRef.current.on('newMessage', (message) => {
        console.log('Received new message:', message);
        
        // Check if the message belongs to the current chat
        const isCurrentChat = selectedChat && (
          (message.senderId._id === selectedChat.id && message.receiverId === userId) ||
          (message.senderId._id === userId && message.receiverId === selectedChat.id) ||
          (message.teamId === selectedChat.id)
        );

        if (isCurrentChat) {
          setMessages(prev => {
            // Check if message already exists
            const exists = prev.some(m => m._id === message._id);
            if (!exists) {
              return [...prev, message];
            }
            return prev;
          });
        }
      });

      return () => {
        if (socketRef.current) {
          socketRef.current.disconnect();
        }
      };
    }
  }, [user, selectedChat]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (user) {
      fetchUsersAndTeams();
    }
  }, [user]);

  useEffect(() => {
    if (selectedChat && user) {
      fetchMessages(selectedChat.id);
    }
  }, [selectedChat, user]);

  const fetchMessages = async (chatId) => {
    try {
      const response = await axiosInstance.get(`/api/messages/${chatId}`);
      if (response.data.success) {
        setMessages(response.data.data);
        // Mark messages as read
        await axiosInstance.put(`/api/messages/read/${chatId}`);
      } else {
        setError('Failed to fetch messages');
      }
    } catch (error) {
      setError('Failed to fetch messages');
    }
  };

  const fetchUsersAndTeams = async () => {
    try {
      setLoading(true);
      setError('');
      const [usersResponse, teamsResponse] = await Promise.all([
        axiosInstance.get('/api/users'),
        axiosInstance.get('/api/teams')
      ]);

      if (usersResponse.data.success && teamsResponse.data.success) {
        const filteredUsers = usersResponse.data.data.filter(u => u._id !== user._id);
        setUsers(filteredUsers);
        setTeams(teamsResponse.data.data);
      }
    } catch (error) {
      setError('Failed to fetch users and teams');
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedChat) return;

    try {
      const messageData = {
        content: newMessage.trim(),
        receiverId: selectedChat.type === 'user' ? selectedChat.id : null,
        teamId: selectedChat.type === 'team' ? selectedChat.id : null
      };

      const response = await axiosInstance.post('/api/messages', messageData);
      
      if (response.data.success) {
        const message = response.data.data;
        const userId = user.userId || user._id;
        
        // Emit message through socket
        socketRef.current.emit('sendMessage', {
          receiverId: selectedChat.id,
          message,
          senderId: userId
        });

        // Add message to local state immediately
        setMessages(prev => [...prev, message]);
        setNewMessage('');
      }
    } catch (error) {
      setError('Failed to send message');
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const filteredChats = [...users, ...teams].filter(item => {
    const searchLower = searchTerm.toLowerCase();
    return item.name.toLowerCase().includes(searchLower);
  });

  const isOwnMessage = (message) => {
    const userId = user.userId || user._id;
    return message.senderId._id === userId;
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const groupMessages = (messages) => {
    const groups = [];
    let currentGroup = [];
    let currentSender = null;

    messages.forEach((message, index) => {
      const isOwn = isOwnMessage(message);
      
      if (currentSender === null) {
        currentSender = isOwn;
        currentGroup.push(message);
      } else if (currentSender === isOwn) {
        currentGroup.push(message);
      } else {
        groups.push({ messages: currentGroup, isOwn: currentSender });
        currentGroup = [message];
        currentSender = isOwn;
      }

      if (index === messages.length - 1) {
        groups.push({ messages: currentGroup, isOwn: currentSender });
      }
    });

    return groups;
  };

  if (!user) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100%',
        color: '#9CA3AF'
      }}>
        Please log in to access messages
      </div>
    );
  }

  return (
    <Container>
      <Sidebar>
        <SearchBar>
          <SearchInput
            type="text"
            placeholder="Search users or teams..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </SearchBar>
        <ChatList>
          {loading ? (
            <div style={{ padding: '1rem', color: '#9CA3AF', textAlign: 'center' }}>
              Loading...
            </div>
          ) : error ? (
            <div style={{ padding: '1rem', color: '#EF4444', textAlign: 'center' }}>
              {error}
            </div>
          ) : filteredChats.length === 0 ? (
            <div style={{ padding: '1rem', color: '#9CA3AF', textAlign: 'center' }}>
              No users or teams found
            </div>
          ) : (
            filteredChats.map(chat => (
              <ChatItem
                key={chat._id}
                active={selectedChat?.id === chat._id}
                onClick={() => setSelectedChat({ id: chat._id, type: chat.members ? 'team' : 'user' })}
              >
                <div style={{ fontSize: '1.5rem' }}>
                  {chat.members ? '👥' : '👤'}
                </div>
                <ChatContent>
                  <ChatName>{chat.name}</ChatName>
                  <LastMessage>
                    {chat.lastMessage || 'No messages yet'}
                  </LastMessage>
                </ChatContent>
              </ChatItem>
            ))
          )}
        </ChatList>
      </Sidebar>

      <MainChat>
        {selectedChat ? (
          <>
            <ChatHeader>
              <div style={{ fontSize: '1.5rem' }}>
                {selectedChat.type === 'team' ? '👥' : '👤'}
              </div>
              <ChatName>
                {selectedChat.type === 'team'
                  ? teams.find(t => t._id === selectedChat.id)?.name
                  : users.find(u => u._id === selectedChat.id)?.name}
              </ChatName>
            </ChatHeader>
            <ChatMessages>
              {groupMessages(messages).map((group, groupIndex) => (
                <MessageGroup key={groupIndex} isOwn={group.isOwn}>
                  {group.messages.map((message, index) => (
                    <Message
                      key={message._id}
                      isOwn={group.isOwn}
                      style={{
                        marginTop: index === 0 ? '0.5rem' : '0.25rem',
                        marginBottom: index === group.messages.length - 1 ? '0.5rem' : '0.25rem'
                      }}
                    >
                      <MessageContent>
                        {message.content}
                      </MessageContent>
                      <MessageTime isOwn={group.isOwn}>
                        {formatTime(message.createdAt)}
                      </MessageTime>
                    </Message>
                  ))}
                </MessageGroup>
              ))}
              <div ref={messagesEndRef} />
            </ChatMessages>
            <MessageInput>
              <Input
                type="text"
                placeholder="Type a message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              />
              <SendButton
                onClick={handleSendMessage}
                disabled={!newMessage.trim()}
              >
                Send
              </SendButton>
            </MessageInput>
          </>
        ) : (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100%',
            color: '#9CA3AF'
          }}>
            Select a chat to start messaging
          </div>
        )}
      </MainChat>
    </Container>
  );
};

export default MessagesPage; 