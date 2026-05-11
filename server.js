const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

const rooms = {};

function makeId() {
    return Math.random().toString(36).substring(2, 7);
}

io.on("connection", (socket) => {

    socket.on("createRoom", ({ name }, cb) => {

        const roomId = makeId();

        rooms[roomId] = {
            players: {}
        };

        rooms[roomId].players[socket.id] = name;

        socket.join(roomId);
        socket.roomId = roomId;

        cb({ roomId });

        io.to(roomId).emit("players", rooms[roomId].players);
    });


    socket.on("joinRoom", ({ roomId, name }, cb) => {

        const room = rooms[roomId];
        if (!room) return cb({ error: "Room not found" });

        room.players[socket.id] = name;

        socket.join(roomId);
        socket.roomId = roomId;

        cb({ ok: true });

        io.to(roomId).emit("players", room.players);
    });


socket.on("privateMessage", ({ to, message }) => {

    const room = rooms[socket.roomId];
    if (!room) return;

    // send message to recipient
    io.to(to).emit("privateMessage", {
        from: socket.id,
        fromName: room.players[socket.id],
        message
    });

});


    socket.on("disconnect", () => {

        const room = rooms[socket.roomId];
        if (!room) return;

        delete room.players[socket.id];

        io.to(socket.roomId).emit("players", room.players);
    });

});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
    console.log("Server running on port " + PORT);
});