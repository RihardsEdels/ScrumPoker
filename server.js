const { Server } = require("socket.io");

const io = new Server({
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"]
    }
});

const rooms = new Map();

io.on("connection", (socket) => {
    console.log("Client connected");

    socket.on("join-room", ({ roomId, userName, isSpectator }) => {
        socket.join(roomId);
        console.log(`${userName} joined room ${roomId} ${isSpectator ? 'as spectator' : ''}`);

        if (!rooms.has(roomId)) {
            rooms.set(roomId, new Map());
        }

        const room = rooms.get(roomId);
        room.set(socket.id, { userName, vote: null, isSpectator });

        io.to(roomId).emit("room-update", Array.from(room.values()));
    });

    socket.on("vote", ({ roomId, vote }) => {
        const room = rooms.get(roomId);
        if (room) {
            const user = room.get(socket.id);
            if (user && !user.isSpectator) {
                user.vote = vote;
                io.to(roomId).emit("room-update", Array.from(room.values()));
            }
        }
    });

    socket.on("reveal-votes", (roomId) => {
        const room = rooms.get(roomId);
        if (room) {
            const participants = Array.from(room.values()).filter(user => !user.isSpectator);
            const allVoted = participants.every(user => user.vote !== null);
            if (allVoted) {
                io.to(roomId).emit("votes-revealed");
            }
        }
    });

    socket.on("reset-votes", (roomId) => {
        const room = rooms.get(roomId);
        if (room) {
            for (const user of room.values()) {
                if (!user.isSpectator) {
                    user.vote = null;
                }
            }
            io.to(roomId).emit("room-update", Array.from(room.values()));
            io.to(roomId).emit("votes-reset");
        }
    });

    socket.on("disconnecting", () => {
        for (const [roomId, room] of rooms.entries()) {
            if (room.has(socket.id)) {
                room.delete(socket.id);
                if (room.size === 0) {
                    rooms.delete(roomId);
                } else {
                    io.to(roomId).emit("room-update", Array.from(room.values()));
                }
            }
        }
    });
});

const PORT = 3001;
io.listen(PORT);
console.log(`Socket.IO server running on port ${PORT}`);
