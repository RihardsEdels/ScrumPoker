import { Server } from 'socket.io';
import http from 'http';
import { job } from './cron.js';

// Create HTTP server
const httpServer = http.createServer();

const io = new Server(httpServer, {
    cors: {
        // Allow both local development and production URLs
        origin: [
            "http://localhost:3000",
            "https://scrum-poker-teal.vercel.app"
        ],
        methods: ["GET", "POST"],
        credentials: true
    }
});

const rooms = new Map();

// Log room state for debugging
const logRoomState = (roomId) => {
    const room = rooms.get(roomId);
    if (room) {
        console.log(`Room ${roomId} state:`, {
            users: Array.from(room.values()).map(u => ({
                name: u.userName,
                isSpectator: u.isSpectator,
                hasVoted: u.vote !== null
            }))
        });
    }
};

io.on("connection", (socket) => {
    console.log(`Client connected: ${socket.id}`);

    socket.on("join-room", ({ roomId, userName, isSpectator }) => {
        try {
            socket.join(roomId);
            console.log(`${userName} joined room ${roomId} ${isSpectator ? 'as spectator' : ''}`);

            if (!rooms.has(roomId)) {
                rooms.set(roomId, new Map());
            }

            const room = rooms.get(roomId);
            room.set(socket.id, { userName, vote: null, isSpectator });

            io.to(roomId).emit("room-update", Array.from(room.values()));
            logRoomState(roomId);
        } catch (error) {
            console.error("Error in join-room:", error);
            socket.emit("error", "Failed to join room");
        }
    });

    socket.on("vote", ({ roomId, vote }) => {
        try {
            const room = rooms.get(roomId);
            if (room) {
                const user = room.get(socket.id);
                if (user && !user.isSpectator) {
                    user.vote = vote;
                    io.to(roomId).emit("room-update", Array.from(room.values()));
                    logRoomState(roomId);
                }
            }
        } catch (error) {
            console.error("Error in vote:", error);
            socket.emit("error", "Failed to record vote");
        }
    });

    socket.on("reveal-votes", (roomId) => {
        try {
            const room = rooms.get(roomId);
            if (room) {
                const participants = Array.from(room.values()).filter(user => !user.isSpectator);
                const allVoted = participants.every(user => user.vote !== null);
                if (allVoted) {
                    io.to(roomId).emit("votes-revealed");
                    console.log(`Votes revealed in room ${roomId}`);
                }
            }
        } catch (error) {
            console.error("Error in reveal-votes:", error);
            socket.emit("error", "Failed to reveal votes");
        }
    });

    socket.on("reset-votes", (roomId) => {
        try {
            const room = rooms.get(roomId);
            if (room) {
                for (const user of room.values()) {
                    if (!user.isSpectator) {
                        user.vote = null;
                    }
                }
                io.to(roomId).emit("room-update", Array.from(room.values()));
                io.to(roomId).emit("votes-reset");
                console.log(`Votes reset in room ${roomId}`);
                logRoomState(roomId);
            }
        } catch (error) {
            console.error("Error in reset-votes:", error);
            socket.emit("error", "Failed to reset votes");
        }
    });

    socket.on("disconnecting", () => {
        try {
            for (const [roomId, room] of rooms.entries()) {
                if (room.has(socket.id)) {
                    const user = room.get(socket.id);
                    console.log(`${user.userName} disconnected from room ${roomId}`);
                    room.delete(socket.id);
                    if (room.size === 0) {
                        console.log(`Room ${roomId} deleted - no users remaining`);
                        rooms.delete(roomId);
                    } else {
                        io.to(roomId).emit("room-update", Array.from(room.values()));
                        logRoomState(roomId);
                    }
                }
            }
        } catch (error) {
            console.error("Error in disconnecting:", error);
        }
    });

    socket.on("error", (error) => {
        console.error("Socket error:", error);
    });
});

const PORT = process.env.PORT || 3001;

// Start the cron job
job.start();
console.log('Cron job started');

// Start the server
httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

// Handle process termination
process.on('SIGTERM', () => {
    console.log('SIGTERM received. Closing server...');
    job.stop();
    httpServer.close(() => {
        console.log('Server closed');
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    console.log('SIGINT received. Closing server...');
    job.stop();
    httpServer.close(() => {
        console.log('Server closed');
        process.exit(0);
    });
});
