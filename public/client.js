const socket = io();

let myName = "";
let roomId = "";
let mySocketId = "";

// LOGIN
function createGame() {

    myName = document.getElementById("nameInput").value;

    socket.emit("createRoom", myName, (res) => {

        roomId = res.roomId;

        enterLobby();

    });

}

function joinGame() {

    myName = document.getElementById("nameInput").value;
    roomId = document.getElementById("roomInput").value;

    socket.emit("joinRoom", { roomId, name: myName }, (res) => {

        if (res.error) {
            alert(res.error);
            return;
        }

        enterLobby();

    });

}

// UI SWITCH
function enterLobby() {

    document.getElementById("login").classList.add("hidden");
    document.getElementById("lobby").classList.remove("hidden");

    document.getElementById("roomCode").innerText = roomId;

}

// PLAYERS UPDATE
socket.on("players", (players) => {

    const div = document.getElementById("players");
    div.innerHTML = "";

    const ids = Object.keys(players);

    ids.forEach(id => {

        const p = players[id];

        const btn = document.createElement("button");
        btn.innerText = p.name;

btn.onclick = () => {

    const msg = prompt("Message to " + p.name);

    if (!msg) return;

    socket.emit("privateMessage", {
        to: id,
        message: msg
    });

    addMessage("me", msg);

};

        div.appendChild(btn);

    });

    // host detection (first player = host button shown via server logic)
    if (ids.length > 0 && players[socket.id] && players[socket.id].id === socket.id) {
        document.getElementById("startBtn").classList.remove("hidden");
    }

});

// START GAME
function startGame() {
    socket.emit("startGame");
}

// GAME STARTED
socket.on("gameStarted", () => {

    document.getElementById("lobby").classList.add("hidden");
    document.getElementById("game").classList.remove("hidden");

});

// CHAT
function sendMessage() {

    const msg = document.getElementById("msgInput").value;

    socket.emit("privateMessage", {
        to: socket.id, // placeholder (we will upgrade targeting next step)
        message: msg
    });

    addMessage("me", msg);

}

socket.on("privateMessage", (data) => {

    addMessage("them", data.message);

});

function addMessage(type, text) {

    const chat = document.getElementById("chat");

    const div = document.createElement("div");
    div.className = type;
    div.innerText = text;

    chat.appendChild(div);

}