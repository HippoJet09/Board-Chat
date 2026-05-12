const socket = io();

let myName = "";
let roomCode = "";

let players = {};

let currentChat = null;

let unread = {};

let chats = {};



function showRoomPage(){

    myName =
        document.getElementById(
            "nameInput"
        ).value;

    if(!myName) return;

    namePage.classList.add(
        "hidden"
    );

    roomPage.classList.remove(
        "hidden"
    );

}



function createRoom(){

    socket.emit(

        "createRoom",

        {name: myName},

        (res)=>{

            roomCode =
                res.roomCode;

            enterLobby();

        }

    );

}



function joinRoom(){

    roomCode =

        document.getElementById(
            "roomInput"
        ).value.toUpperCase();



    socket.emit(

        "joinRoom",

        {
            roomCode,
            name: myName
        },

        (response)=>{

            if(
                response.error
            ){

                alert(
                    response.error
                );

                return;
            }



            enterLobby();

        }

    );

}


function enterLobby(){

    roomPage.classList.add(
        "hidden"
    );

    lobbyPage.classList.remove(
        "hidden"
    );



    document.getElementById(
        "roomCodeDisplay"
    ).innerText =
        roomCode;

}



socket.on(

    "players",

    (serverPlayers)=>{

        players =
            serverPlayers;

        renderPlayers();

    }

);



function renderPlayers(){

    const grid =
        document.getElementById(
            "players"
        );



    const sidebar =
        document.getElementById(
            "sidebarPlayers"
        );



    grid.innerHTML = "";
    sidebar.innerHTML = "";



    Object.keys(players).forEach(id=>{

        if(id===socket.id) return;



        const name =
            players[id];



        // lobby box

        const box =
            document.createElement(
                "div"
            );

        box.className =
            "playerBox";

        box.innerText =
            name;

        box.onclick =
            ()=>openChat(id);



        if(unread[id]){

            const badge =
                document.createElement(
                    "div"
                );

            badge.className =
                    "badge";

            badge.innerText =
                    unread[id];

            box.appendChild(
                    badge
            );

        }



        grid.appendChild(
            box
        );



        // sidebar

        const side =
            document.createElement(
                "div"
            );

        side.className =
            "sidebarPlayer";

        side.innerText =
            name;

        side.onclick =
            ()=>openChat(id);

        sidebar.appendChild(
            side
        );

    });

}



function openChat(id){

    currentChat = id;

    unread[id] = 0;

    renderPlayers();



    lobbyPage.classList.add(
        "hidden"
    );



    chatPage.classList.remove(
        "hidden"
    );



    document.getElementById(
        "chatName"
    ).innerText =
        players[id];



    renderChat();

}



function backToLobby(){

    chatPage.classList.add(
        "hidden"
    );

    lobbyPage.classList.remove(
        "hidden"
    );

}



function sendPreset(text){

    document.getElementById(
        "messageInput"
    ).value = text;

}



function sendMessage(){

    const msg =
        document.getElementById(
            "messageInput"
        ).value;

    if(!msg) return;



    socket.emit(

        "privateMessage",

        {
            to: currentChat,
            message: msg
        }

    );



    saveMessage(
        currentChat,
        myName,
        msg
    );



    document.getElementById(
        "messageInput"
    ).value = "";



    renderChat();

}



socket.on(

    "privateMessage",

    (data)=>{

        saveMessage(

            data.from,

            data.fromName,

            data.message

        );



        if(
            currentChat !==
            data.from
        ){

            unread[data.from] =
                (unread[data.from] || 0) + 1;

            renderPlayers();

        }
        else{

            renderChat();

        }

    }

);



function saveMessage(
    id,
    sender,
    message
){

    if(!chats[id]){

        chats[id] = [];

    }



    chats[id].push({

        sender,
        message

    });

}



function renderChat(){

    const div =
        document.getElementById(
            "chatMessages"
        );



    div.innerHTML = "";



    const history =
        chats[currentChat] || [];



    history.forEach(m=>{

        const line =
            document.createElement(
                "div"
            );



        line.className =

            m.sender===myName

            ? "myMessage"

            : "theirMessage";



        line.innerHTML =

            "<div class='sender'>"

            + m.sender

            + "</div>"

            +

            m.message;



        div.appendChild(
            line
        );

    });

}