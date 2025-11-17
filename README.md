# 💬 Real-Time Chat Application

A modern, feature-rich real-time chat application built with React, Socket.io, and Node.js. Experience seamless communication with advanced features and a beautiful, responsive interface.

![Chat Application](https://img.shields.io/badge/React-18.2.0-blue) ![Socket.io](https://img.shields.io/badge/Socket.io-4.7.5-green) ![Node.js](https://img.shields.io/badge/Node.js-18+-brightgreen)

## 🎥 Demo

![Chat Demo](https://via.placeholder.com/800x400/6366f1/ffffff?text=Chat+Application+Demo)
*Live demo: [Coming Soon]()*

## ✨ Features

### 🚀 Core Features
- **Real-time Messaging** - Instant message delivery using Socket.io
- **Multiple Chat Rooms** - Join different themed rooms (General, Tech, Gaming, etc.)
- **User Authentication** - Simple username-based authentication
- **Online Presence** - See who's online in real-time
- **Message History** - View previous messages when joining rooms

### 🌟 Advanced Features
- **💬 Private Messaging** - One-on-one conversations with other users
- **⌨️ Typing Indicators** - See when others are typing
- **🎯 Message Reactions** - React to messages with emojis (👍, ❤️, 😂, etc.)
- **🔔 Real-time Notifications** - Get notified for new messages and user activity
- **📱 Responsive Design** - Works perfectly on desktop and mobile devices
- **👤 User Avatars** - Automatically generated profile pictures
- **⚡ Smooth Animations** - Beautiful transitions and hover effects

### 🎨 UI/UX Enhancements
- **Modern Glass Morphism Design** - Beautiful gradient backgrounds and glass effects
- **Dark Theme** - Easy on the eyes with professional color scheme
- **Interactive Elements** - Hover effects and smooth transitions
- **Custom Scrollbars** - Styled scrollbars for better aesthetics
- **Message Bubbles** - Clean, modern chat interface
- **Room Icons** - Visual representation for different rooms

## 🛠️ Tech Stack

### Frontend
- **React 18** - Modern React with hooks
- **Socket.io Client** - Real-time communication
- **Vite** - Fast development build tool
- **CSS3** - Custom styles with modern features

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **Socket.io** - Real-time bidirectional communication
- **CORS** - Cross-origin resource sharing

## 📦 Installation

### Prerequisites
- Node.js 18 or higher
- npm or yarn

### Step 1: Clone the Repository
```bash
git clone <your-repository-url>
cd socketio-chat
```

### Step 2: Setup Server
```bash
cd server
npm install
```

### Step 3: Setup Client
```bash
cd ../client
npm install
```

## 🚀 Running the Application

### Development Mode

1. **Start the Server** (Terminal 1):
```bash
cd server
npm run dev
```
Server will run on `http://localhost:5000`

2. **Start the Client** (Terminal 2):
```bash
cd client
npm run dev
```
Client will run on `http://localhost:3000`

### Production Build
```bash
# Build client
cd client
npm run build

# Start server (make sure to serve built files)
cd ../server
npm start
```

## 📁 Project Structure

```
socketio-chat/
├── server/                 # Node.js Backend
│   ├── server.js          # Main server file
│   ├── package.json       # Server dependencies
│   └── (config/)          # Configuration files
├── client/                # React Frontend
│   ├── src/
│   │   ├── App.jsx        # Main React component
│   │   ├── main.jsx       # React entry point
│   │   └── index.css      # Global styles
│   ├── index.html         # HTML template
│   ├── vite.config.js     # Vite configuration
│   └── package.json       # Client dependencies
└── README.md              # Project documentation
```

## 🎯 Usage Guide

### Getting Started
1. Open your browser and navigate to `http://localhost:3000`
2. Enter your username and select a chat room
3. Click "Join Chat" to enter the application

### Basic Features
- **Send Messages**: Type in the input field and press Enter or click Send
- **Switch Rooms**: Click on different rooms in the sidebar
- **Private Chat**: Click on any user in the online users list to start a private conversation
- **Message Reactions**: Double-click on any message to add reactions

### Advanced Interactions
- **Typing Indicators**: See when other users are typing in real-time
- **Notifications**: Get notified for new messages and user activity
- **Message History**: View previous messages when joining rooms
- **Online Status**: See who's currently online in each room

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the server directory:

```env
PORT=5000
CLIENT_URL=http://localhost:3000
```

### Customization
- **Add New Rooms**: Modify the `rooms` array in `server.js`
- **Change Styling**: Update CSS variables in `index.css`
- **Add Emoji Reactions**: Modify the `reactions` array in `App.jsx`

## 🌐 Deployment

### Server Deployment (Render/Railway)
1. Push your code to GitHub
2. Connect your repository to Render/Railway
3. Set build command: `npm install`
4. Set start command: `npm start`
5. Add environment variables

### Client Deployment (Vercel/Netlify)
1. Build the client: `npm run build`
2. Deploy the `dist` folder to your hosting service
3. Update socket connection URL in production

## 🐛 Troubleshooting

### Common Issues

1. **Connection Errors**
   - Ensure server is running on port 5000
   - Check CORS configuration in server.js

2. **Messages Not Sending**
   - Verify Socket.io connection is established
   - Check browser console for errors

3. **Static Files Not Loading**
   - Clear browser cache
   - Check if Vite dev server is running

### Debug Mode
Enable debug logging by adding to server.js:
```javascript
io.engine.on("connection", (rawSocket) => {
  console.log("Raw socket connection details:", rawSocket);
});
```

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 Future Enhancements

- [ ] **File Sharing** - Upload and share images/files
- [ ] **Voice Messages** - Send and receive voice recordings
- [ ] **Video Calls** - Integrated video calling feature
- [ ] **Message Search** - Search through message history
- [ ] **User Profiles** - Customizable user profiles
- [ ] **Message Encryption** - End-to-end encryption
- [ ] **Database Integration** - Persistent message storage
- [ ] **Theme Switcher** - Light/dark mode toggle

## 🛡️ Security Considerations

- Input validation and sanitization
- XSS protection
- CORS configuration
- Rate limiting (to be implemented)
- Authentication enhancements (JWT)

## 📊 Performance

- Efficient re-rendering with React optimization
- Socket.io room management for scalable connections
- Message pagination for large chat histories
- Debounced typing indicators

## 👨‍💻 Development Team

- **Your Name** - [GitHub Profile](https://github.com/yourusername)
- **Contributors** - [List of contributors]()

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Socket.io](https://socket.io/) for real-time communication
- [React](https://reactjs.org/) for the frontend framework
- [DiceBear](https://dicebear.com/) for avatar generation
- [Vite](https://vitejs.dev/) for fast development builds

---

<div align="center">

**Made with ❤️ and Socket.io**

*If you find this project helpful, don't forget to give it a ⭐!*

</div>

## 📞 Support

If you have any questions or need help with setup, please:
1. Check the [Troubleshooting](#-troubleshooting) section
2. Open an [Issue](../../issues)
3. Contact the development team

---
