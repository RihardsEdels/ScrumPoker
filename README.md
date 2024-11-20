# Scrum Poker

A real-time planning poker application for agile teams, built with Next.js and Socket.IO.

## Features

- Create and join planning poker rooms
- Real-time vote synchronization
- Spectator mode support
- Vote distribution and average calculation
- Responsive design
- Share room links with team members

## Live Demo

Visit [https://scrum-poker-teal.vercel.app](https://scrum-poker-teal.vercel.app)

## Development Setup

1. Install dependencies:

```bash
npm install
```

2. Create a `.env` file:

```bash
NEXT_PUBLIC_SOCKET_URL=http://localhost:3001
```

3. Start the development server:

```bash
npm run dev
```

4. Start the Socket.IO server (in a separate terminal):

```bash
cd socket-server
npm install
npm start
```

## Deployment

### Frontend (Vercel)

1. Push your changes to GitHub
2. Connect your repository to Vercel
3. Add the production environment variable:
   - `NEXT_PUBLIC_SOCKET_URL`: Your Socket.IO server URL

### Socket.IO Server (Render)

1. Create a new Web Service on Render
2. Connect the `socket-server` directory
3. Configure the service:
   - Build Command: `npm install`
   - Start Command: `npm start`

## Usage

1. Create a room by entering your name
2. Choose to join as a voter or spectator
3. Share the room URL with team members
4. Vote on items using the poker cards
5. Reveal votes when everyone has voted
6. View vote distribution and average
7. Reset for the next round

## Tech Stack

- Next.js 14
- TypeScript
- Socket.IO
- TailwindCSS
