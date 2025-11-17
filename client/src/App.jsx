import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

const App = () => {
  const [socket, setSocket] = useState(null);
  const [user, setUser] = useState(null);
  const [username, setUsername] = useState('');
  const [room, setRoom] = useState('general');
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [users, setUsers] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);
  const [rooms, setRooms] = useState(['general', 'random', 'tech', 'gaming', 'support']);
  const [activePrivateChat, setActivePrivateChat] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [showReactionPicker, setShowReactionPicker] = useState(null);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  const roomIcons = {
    general: '💬',
    random: '🎲',
    tech: '💻',
    gaming: '🎮',
    support: '🛟'
  };

  const reactions = ['👍', '❤️', '😂', '😮', '😢', '🙏'];

  useEffect(() => {
    if (user) {
      const newSocket = io('http://localhost:5000');
      setSocket(newSocket);

      newSocket.emit('user_join', {
        username: user.username,
        room: user.room
      });

      newSocket.on('receive_message', (message) => {
        setMessages(prev => [...prev, message]);
      });

      newSocket.on('room_data', (data) => {
        setUsers(data.users);
        setMessages(data.messages);
      });

      newSocket.on('user_joined', (data) => {
        setUsers(data.users);
        addNotification(`${data.user.username} joined the room`, 'user_join');
      });

      newSocket.on('user_left', (data) => {
        setUsers(data.users);
        addNotification(`${data.username} left the room`, 'user_leave');
      });

      newSocket.on('user_typing', (data) => {
        setTypingUsers(data.users.map(u => u.username));
      });

      newSocket.on('users_updated', (usersList) => {
        setUsers(usersList);
      });

      newSocket.on('receive_private_message', (message) => {
        if (activePrivateChat === message.from || activePrivateChat === message.to) {
          setMessages(prev => [...prev, message]);
        }
        // Mark as read if we're viewing this chat
        if (activePrivateChat === message.from) {
          newSocket.emit('mark_messages_read', {
            user1: user.username,
            user2: message.from
          });
        }
      });

      newSocket.on('new_private_message_notification', (data) => {
        if (activePrivateChat !== data.from) {
          addNotification(`New message from ${data.from}: ${data.message}`, 'private_message');
        }
      });

      newSocket.on('message_reacted', (data) => {
        setMessages(prev => prev.map(msg => 
          msg.id === data.messageId ? { ...msg, reactions: data.reactions } : msg
        ));
      });

      return () => newSocket.close();
    }
  }, [user, activePrivateChat]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px';
    }
  }, [newMessage]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const addNotification = (message, type) => {
    const id = Date.now();
    const notification = { id, message, type, show: true };
    setNotifications(prev => [...prev, notification]);
    
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 5000);
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (username.trim()) {
      setUser({ username: username.trim(), room });
    }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim() && socket) {
      if (activePrivateChat) {
        socket.emit('send_private_message', {
          toUsername: activePrivateChat,
          text: newMessage.trim()
        });
      } else {
        socket.emit('send_message', {
          text: newMessage.trim()
        });
      }
      setNewMessage('');
      socket.emit('typing_stop');
    }
  };

  const handleTyping = () => {
    if (socket && newMessage) {
      socket.emit('typing_start');
    } else if (socket) {
      socket.emit('typing_stop');
    }
  };

  const changeRoom = (newRoom) => {
    if (socket && user) {
      socket.emit('change_room', newRoom);
      setRoom(newRoom);
      setActivePrivateChat(null);
      setUser(prev => ({ ...prev, room: newRoom }));
    }
  };

  const startPrivateChat = (username) => {
    setActivePrivateChat(username);
    setMessages([]);
    // In a real app, you'd fetch the private message history here
  };

  const addReaction = (messageId, reaction) => {
    if (socket) {
      socket.emit('react_to_message', {
        messageId,
        reaction,
        room: activePrivateChat ? 'private' : room
      });
    }
    setShowReactionPicker(null);
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  if (!user) {
    return (
      <div className="login-container">
        <div className="login-card">
          <h1>Welcome to ChatApp</h1>
          <p className="subtitle">Connect with people in real-time</p>
          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label>Choose a username:</label>
              <input
                type="text"
                className="form-input"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username..."
                required
              />
            </div>
            <div className="form-group">
              <label>Select a room:</label>
              <select 
                className="form-select" 
                value={room} 
                onChange={(e) => setRoom(e.target.value)}
              >
                {rooms.map(room => (
                  <option key={room} value={room}>
                    {roomIcons[room]} {room.charAt(0).toUpperCase() + room.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            <button type="submit" className="btn btn-primary">
              🚀 Join Chat
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-container">
      {/* Notifications */}
      {notifications.map(notification => (
        <div key={notification.id} className="notification show">
          <div className="notification-title">New Activity</div>
          <div className="notification-message">{notification.message}</div>
        </div>
      ))}

      {/* Sidebar */}
      <div className="sidebar">
        <div className="user-header">
          <div className="user-info">
            <img 
              src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`}
              alt="Avatar"
              className="user-avatar"
            />
            <div className="user-details">
              <h3>{user.username}</h3>
              <div className="user-status">
                <div className="status-indicator"></div>
                <span>Online</span>
              </div>
            </div>
          </div>
        </div>

        <div className="sidebar-section">
          <h4>Rooms</h4>
          <div className="rooms-list">
            {rooms.map(roomItem => (
              <div
                key={roomItem}
                className={`room-item ${roomItem === room && !activePrivateChat ? 'active' : ''}`}
                onClick={() => changeRoom(roomItem)}
              >
                <span className="room-icon">{roomIcons[roomItem]}</span>
                <span>{roomItem.charAt(0).toUpperCase() + roomItem.slice(1)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="sidebar-section" style={{flex: 1}}>
          <h4>Online Users ({users.length})</h4>
          <div className="users-list">
            {users
              .filter(userItem => userItem.username !== user.username)
              .map(userItem => (
                <div
                  key={userItem.id}
                  className={`user-item ${activePrivateChat === userItem.username ? 'active' : ''}`}
                  onClick={() => startPrivateChat(userItem.username)}
                >
                  <img 
                    src={userItem.avatar} 
                    alt="Avatar"
                    className="user-avatar-sm"
                  />
                  <span>{userItem.username}</span>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="chat-area">
        <div className="chat-header">
          <h2>
            {activePrivateChat ? (
              <>
                <span>💬</span> Private chat with {activePrivateChat}
              </>
            ) : (
              <>
                <span>{roomIcons[room]}</span> {room.charAt(0).toUpperCase() + room.slice(1)}
              </>
            )}
          </h2>
          <div className="room-description">
            {activePrivateChat 
              ? `Private conversation with ${activePrivateChat}`
              : `${users.length} users online in this room`
            }
          </div>
        </div>

        <div className="messages-container">
          {messages.map(message => (
            <div
              key={message.id}
              className={`message ${message.username === user.username ? 'own' : ''} ${
                message.type === 'system' ? 'system-message' : ''
              }`}
            >
              {message.type !== 'system' && message.username !== user.username && (
                <img 
                  src={message.avatar} 
                  alt="Avatar"
                  className="message-avatar"
                />
              )}
              
              <div className="message-content">
                {message.type !== 'system' && message.username !== user.username && (
                  <div className="message-sender">{message.username}</div>
                )}
                
                <div 
                  className="message-bubble"
                  onDoubleClick={() => setShowReactionPicker(message.id)}
                >
                  <div className="message-text">{message.text}</div>
                  <div className="message-time">
                    {formatTime(message.timestamp)}
                  </div>
                  
                  {message.reactions && Object.keys(message.reactions).length > 0 && (
                    <div className="message-reactions">
                      {Object.entries(message.reactions).map(([reaction, users]) => (
                        <div 
                          key={reaction} 
                          className={`reaction ${users.includes(user.username) ? 'active' : ''}`}
                          onClick={() => addReaction(message.id, reaction)}
                        >
                          {reaction} {users.length}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {showReactionPicker === message.id && (
                  <div className="reaction-picker">
                    {reactions.map(reaction => (
                      <div
                        key={reaction}
                        className="reaction-option"
                        onClick={() => addReaction(message.id, reaction)}
                      >
                        {reaction}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
          
          {typingUsers.length > 0 && (
            <div className="typing-indicator">
              <span>{typingUsers.join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing</span>
              <div className="typing-dots">
                <div className="typing-dot"></div>
                <div className="typing-dot"></div>
                <div className="typing-dot"></div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        <div className="message-input-container">
          <form onSubmit={handleSendMessage} className="message-input-wrapper">
            <div className="message-input">
              <textarea
                ref={textareaRef}
                value={newMessage}
                onChange={(e) => {
                  setNewMessage(e.target.value);
                  handleTyping();
                }}
                placeholder={
                  activePrivateChat 
                    ? `Message ${activePrivateChat}...` 
                    : "Type your message..."
                }
                rows="1"
              />
            </div>
            <button 
              type="submit" 
              className="send-button"
              disabled={!newMessage.trim()}
            >
              ➤
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default App;