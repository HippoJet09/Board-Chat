const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

const rooms = {};

function makeRoomCode() {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
}

io.on("connection", (socket) => {

    socket.on("createRoom", ({ name }, callback) => {

        const roomCode = makeRoomCode();

        rooms[roomCode] = {
            players: {}
        };

        rooms[roomCode].players[socket.id] = name;

        socket.roomCode = roomCode;

        socket.join(roomCode);

        callback({ roomCode });

        io.to(roomCode).emit(
            "players",
            rooms[roomCode].players
        );

    });


socket.on("joinRoom", ({ roomCode, name }, callback) => {

    if (!rooms[roomCode]) {

        callback({
            error: "Room does not exist"
        });

        return;
    }



    rooms[roomCode].players[
        socket.id
    ] = name;



    socket.roomCode =
        roomCode;



    socket.join(
        roomCode
    );



    callback({
        success: true
    });



    io.to(
        roomCode
    ).emit(

        "players",

        rooms[
            roomCode
        ].players

    );

});


    socket.on("privateMessage", ({ to, message }) => {

        const room = rooms[socket.roomCode];

        if (!room) return;

        io.to(to).emit("privateMessage", {
            from: socket.id,
            fromName: room.players[socket.id],
            message
        });

    });


    socket.on("disconnect", () => {

        const room = rooms[socket.roomCode];

        if (!room) return;

        delete room.players[socket.id];

        io.to(socket.roomCode).emit(
            "players",
            room.players
        );

    });

});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
    console.log("Running");
});