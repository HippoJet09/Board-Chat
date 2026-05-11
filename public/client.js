const socket = io();

let myName = "";
let selectedPlayer = "";


function show(id) {
    document.getElementById(id).classList.remove("hidden");
}

function hide(id) {
    document.getElementById(id).classList.add("hidden");
}


function joinGame() {

    myName = document.getElementById("nameInput").value;

    if (!myName) return;

    socket.emit("join", myName);

    hide("loginScreen");
    show("lobby");

}


socket.on("players", (players) => {

    const div = document.getElementById("players");
    div.innerHTML = "";

    players.forEach(p => {

        if (p === myName) return;

        const btn = document.createElement("button");
        btn.innerText = p;

        btn.onclick = () => {
            selectedPlayer = p;

            document.getElementById("selectedPlayer").innerText = p;

            hide("lobby");
            show("messageScreen");
        };

        div.appendChild(btn);

    });

});


function setMessage(text) {
    document.getElementById("messageInput").value = text;
}


function sendMessage() {

    const msg = document.getElementById("messageInput").value;

    if (!msg || !selectedPlayer) return;

    socket.emit("privateMessage", {
        from: myName,
        to: selectedPlayer,
        message: msg
    });

    // show YOUR sent message instantly
    const inbox = document.getElementById("inbox");

    inbox.innerHTML += `
        <div class="me">
            <b>You → ${selectedPlayer}:</b> ${msg}
        </div>
    `;

    document.getElementById("messageInput").value = "";
}


function backToLobby() {
    hide("messageScreen");
    show("lobby");
}


socket.on("privateMessage", (data) => {

    const inbox = document.getElementById("inbox");

    const msgClass = data.from === myName ? "me" : "them";

    inbox.innerHTML += `
        <div class="${msgClass}">
            <b>${data.from}:</b> ${data.message}
        </div>
    `;

});