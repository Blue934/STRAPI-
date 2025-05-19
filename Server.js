const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" } // ✅ Autorise toutes les origines (évite les erreurs CORS)
});

let streamer = null;
let spectators = new Set();

io.on("connection", (socket) => {
  console.log(`✅ Client WebSocket connecté : ${socket.id}`);

  socket.on("join", ({ username }) => {
    console.log(`📥 ${username} a rejoint le live`);
    if (!streamer) {
      streamer = username;
      io.emit("streamer_set", { streamer });
    } else {
      spectators.add(username);
      io.emit("user_joined", { username });
    }

    // ✅ Envoi d’un ping régulier pour garder la connexion active
    setInterval(() => {
      socket.emit("heartbeat");
    }, 5000);
  });

  socket.on("message", (data) => {
    io.emit("new_message", data);
  });

  socket.on("disconnect", () => {
    console.log(`🔴 Déconnexion : ${socket.id}`);
    spectators.delete(socket.id);
  });
});

server.listen(5000, () => {
  console.log("🚀 Serveur WebSocket actif sur http://127.0.0.1:5000");
});