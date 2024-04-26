const io = require('socket.io-client')

const socket = io('http://localhost:3000', {reconnect: true})

let players = [];
let gameStarted = false;

// Listen for 'newMessage' event from the server
socket.on('newMessage', (message) => {
    console.log('Received message from server:', message);
});

socket.on("connect_error", (err) => {
    // the reason of the error, for example "xhr poll error"
    console.log(err.message);
  
    // some additional description, for example the status code of the initial HTTP response
    console.log(err.description);
  
    // some additional context, for example the XMLHttpRequest object
    console.log(err.context);
  });

// Function to send a message to the server
function sendMessage() {
    const newMessage = {
        from: 'client@mds',
        text: 'Hello from client',
        createdAt: Date.now()
    };
    // Emit 'createMessage' event to the server with the new message
    socket.emit('createMessage', newMessage);
}

// Listen for 'disconnect' event from the server
socket.on('disconnect', () => {
    console.log('Disconnected from server');
});

function generatePlayers() {
    const numPlayers = document.getElementById("numPlayers").value;
    const playerContainer = document.querySelector(".player-container");
    playerContainer.innerHTML = ""; // Clear previous players

    for (let i = 1; i <= numPlayers; i++) {
        const playerDiv = document.createElement("div");
        playerDiv.classList.add("player");
        playerDiv.innerHTML = `
            <button id="player${i}"></button>
            <button onclick="increaseHealth(${i})">+</button>
            <button onclick="decreaseHealth(${i})">-</button>
        `;
        playerContainer.appendChild(playerDiv);
    }

    updatePlayerStatus(); // Initial update
}

function increaseHealth(playerId) {
    const playerButton = document.getElementById(`player${playerId}`);
    const currentHealth = parseInt(playerButton.dataset.health || 0);
    const newHealth = currentHealth + 1;
    playerButton.dataset.health = newHealth;
    updatePlayerStatus();
}

function decreaseHealth(playerId) {
    const playerButton = document.getElementById(`player${playerId}`);
    const currentHealth = parseInt(playerButton.dataset.health || 0);
    const newHealth = currentHealth - 1 >= 0 ? currentHealth - 1 : 0;
    playerButton.dataset.health = newHealth;
    updatePlayerStatus();
}

function updatePlayerStatus() {
    // This function should be replaced with server communication logic
    const players = document.querySelectorAll(".player button[id^='player']");
    players.forEach(playerButton => {
        const playerId = playerButton.id.replace("player", "");
        const playerName = `Player ${playerId}`;
        const health = parseInt(playerButton.dataset.health || 0);
        playerButton.textContent = `${playerName}: ${health} HP`;
    });
}

window.onload = function () {
}