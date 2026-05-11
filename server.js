const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

const players = {};

// health check (important for hosting platforms)
app.get("/health", (req, res) => {
    res.send("ok");
});

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

// CRITICAL: Render uses process.env.PORT
const PORT = process.env.PORT || 3000;

server.listen(PORT, "0.0.0.0", () => {
    console.log("Server running on port " + PORT);
});