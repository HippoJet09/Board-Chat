const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

const players = {};

io.on("connection", (socket) => {

    socket.on("join", (name) => {
        players[name] = socket.id;
        io.emit("players", Object.keys(players));
    });

    socket.on("privateMessage", (data) => {

        const targetSocket = players[data.to];

        if (targetSocket) {
            io.to(targetSocket).emit("privateMessage", {
                from: data.from,
                message: data.message
            });
        }

    });

    socket.on("disconnect", () => {

        for (const name in players) {
            if (players[name] === socket.id) {
                delete players[name];
            }
        }

        io.emit("players", Object.keys(players));
    });

});

const PORT = process.env.PORT || 3000;

server.listen(PORT, "0.0.0.0", () => {
    console.log("Server running on port " + PORT);
});
    console.log("Server running on port 3000");
});