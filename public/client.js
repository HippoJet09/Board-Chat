const socket = io();

let myName = "";
let roomId = "";
let players = {};

let currentChat = null;

// unread messages per player
let unread = {};

// ----------------------
// CREATE / JOIN ROOM
// ----------------------

function createGame() {

    myName = document.getElementById("nameInput").value;
    if (!myName) return alert("Enter your name");

    socket.emit("createRoom", { name: myName }, (res) => {

        roomId = res.roomId;
        enterLobby();

    });
}

function joinGame() {

    myName = document.getElementById("nameInput").value;
    roomId = document.getElementById("roomInput").value;

    if (!myName || !roomId) return alert("Enter name and room code");

    socket.emit("joinRoom", { roomId, name: myName }, (res) => {

        if (res.error) {
            alert(res.error);
            return;
        }

        enterLobby();

    });
}

// ----------------------
// SWITCH UI
// ----------------------

function enterLobby() {

    document.getElementById("login").classList.add("hidden");
    document.getElementById("lobby").classList.remove("hidden");

    document.getElementById("roomCode").innerText = roomId;

}

// ----------------------
// PLAYERS UPDATE
// ----------------------

socket.on("players", (serverPlayers) => {

    players = serverPlayers;
    renderPlayers();

});

// ----------------------
// RENDER PLAYER GRID
// ----------------------

function renderPlayers() {

    const div = document.getElementById("players");
    div.innerHTML = "";

    Object.keys(players).forEach(id => {

        if (id === socket.id) return;

        const box = document.createElement("div");

        box.style = `
            border: 2px solid #5a4632;
            padding: 20px;
            margin: 10px;
            cursor: pointer;
            position: relative;
            display: inline-block;
            width: 40%;
            text-align: center;
        `;

        box.innerText = players[id];

        // unread badge
        if (unread[id]) {

            const badge = document.createElement("div");

            badge.style = `
                position: absolute;
                top: 5px;
                right: 5px;
                background: red;
                color: white;
                border-radius: 50%;
                width: 22px;
                height: 22px;
                font-size: 12px;
                display: flex;
                align-items: center;
                justify-content: center;
            `;

            badge.innerText = unread[id];

            box.appendChild(badge);
        }

        box.onclick = () => openChat(id);

        div.appendChild(box);

    });

}

// ----------------------
// OPEN CHAT
// ----------------------

function openChat(id) {

    currentChat = id;

    unread[id] = 0;

    renderPlayers();

    document.getElementById("game").classList.remove("hidden");

    document.getElementById("chat").innerHTML = "";

}

// ----------------------
// SEND MESSAGE
// ----------------------

function sendMessage() {

    const msg = document.getElementById("msgInput").value;

    if (!msg || !currentChat) return;

    socket.emit("privateMessage", {
        to: currentChat,
        message: msg
    });

    addMessage("me", msg);

    document.getElementById("msgInput").value = "";

}

// ----------------------
// RECEIVE MESSAGE
// ----------------------

socket.on("privateMessage", (data) => {

    const from = data.from;

    // if not currently chatting with sender → unread
    if (currentChat !== from) {

        unread[from] = (unread[from] || 0) + 1;
        renderPlayers();
        return;
    }

    addMessage("them", data.fromName + ": " + data.message);

});

// ----------------------
// CHAT DISPLAY
// ----------------------

function addMessage(type, text) {

    const chat = document.getElementById("chat");

    const div = document.createElement("div");
    div.className = type;
    div.innerText = text;

    chat.appendChild(div);

}