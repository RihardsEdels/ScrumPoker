# Scrum Poker Socket.IO Server

WebSocket server for the Scrum Poker application, handling real-time communication between clients.

## Features

- Real-time vote synchronization
- Support for spectator mode
- Vote revealing and resetting
- Room management
- Automatic cleanup of empty rooms

## Setup

1. Install dependencies:

```bash
npm install
```

2. Start the server:

```bash
npm start
```

## Environment Variables

- `PORT`: Server port (default: 3001)

## Deployment to Render

1. Create a new Web Service on Render
2. Connect your repository
3. Use the following settings:
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Environment Variables: None required (uses default port)

## CORS Configuration

The server is configured to accept connections from:

- http://localhost:3000 (development)
- https://scrum-poker-teal.vercel.app (production)

## Client Configuration

The client should use the appropriate WebSocket URL:

- Development: `http://localhost:3001`
- Production: `https://[your-render-app-url]`
