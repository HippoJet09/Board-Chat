const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

const rooms = {};

// generate simple IDs
function makeId() {
    return Math.random().toString(36).substring(2, 8);
}

io.on("connection", (socket) => {

    let currentRoom = null;

    // CREATE ROOM (host)
    socket.on("createRoom", (name, callback) => {

        const roomId = makeId();

        rooms[roomId] = {
            hostId: socket.id,
            players: {}
        };

        rooms[roomId].players[socket.id] = {
            name,
            id: socket.id
        };

        currentRoom = roomId;

        socket.join(roomId);

        callback({ roomId });

        io.to(roomId).emit("players", rooms[roomId].players);
    });


    // JOIN ROOM
    socket.on("joinRoom", ({ roomId, name }, callback) => {

        const room = rooms[roomId];

        if (!room) return callback({ error: "Room not found" });

        room.players[socket.id] = {
            name,
            id: socket.id
        };

        currentRoom = roomId;

        socket.join(roomId);

        callback({ success: true });

        io.to(roomId).emit("players", room.players);
    });


    // PRIVATE MESSAGE
socket.on("privateMessage", ({ to, message }) => {

    const room = rooms[currentRoom];
    if (!room) return;

    const targetSocketId = to;

    io.to(targetSocketId).emit("privateMessage", {
        from: socket.id,
        message
    });

});


    // HOST START GAME
    socket.on("startGame", () => {

        const room = rooms[currentRoom];
        if (!room) return;

        if (socket.id !== room.hostId) return;

        io.to(currentRoom).emit("gameStarted");

    });


    // DISCONNECT (reconnect-friendly cleanup)
    socket.on("disconnect", () => {

        const room = rooms[currentRoom];
        if (!room) return;

        delete room.players[socket.id];

        io.to(currentRoom).emit("players", room.players);

    });

});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
    console.log("Server running on port " + PORT);
});