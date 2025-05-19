import { useEffect, useState } from "react";
import io from "socket.io-client";
import "../styles/live.css"
const SERVER_URL = "http://127.0.0.1:5000";

const Live = () => {
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [username, setUsername] = useState("");
  const [streamActive, setStreamActive] = useState(false);
  const [streamerName, setStreamerName] = useState("");
  const [spectators, setSpectators] = useState([]);

  // 📌 Générer un pseudo automatique
  useEffect(() => {
    let storedUsername = localStorage.getItem("username");
    if (!storedUsername) {
      storedUsername = `User${Math.floor(Math.random() * 10000)}`;
      localStorage.setItem("username", storedUsername);
    }
    setUsername(storedUsername);
  }, []);

  // 📌 Connexion WebSocket côté client avec reconnexion automatique
  useEffect(() => {
    const newSocket = io(SERVER_URL, {
      transports: ["websocket"], // ✅ Force WebSocket uniquement
      reconnectionAttempts: 10,  // 🔄 Essaye de se reconnecter si déconnexion
      reconnectionDelay: 3000,   // ⏳ Attente entre chaque tentative
      timeout: 10000,            // 🕓 Temps max avant échec de connexion (10s)
    });

    setSocket(newSocket);

    newSocket.on("connect", () => {
      console.log("✅ Connecté avec ID :", newSocket.id);
      newSocket.emit("join", { username });
    });

    newSocket.on("new_message", (data) => {
      setMessages((prevMessages) => [...prevMessages, data]);
    });

    newSocket.on("streamer_set", (data) => {
      setStreamerName(data.streamer);
    });

    newSocket.on("user_joined", (data) => {
      setSpectators((prevSpectators) => [...prevSpectators, data.username]);
    });

    newSocket.on("heartbeat", () => {
      console.log("❤️ Serveur toujours actif !");
    });

    return () => {
      newSocket.disconnect();
    };
  }, [username]);

  // 📌 Démarrer le live et notifier le serveur
  const startUserLive = async () => {
    try {
      console.log("🎥 Tentative de démarrage du live avec audio...");
  
      const constraints = { video: true, audio: true };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
  
      const videoElement = document.getElementById("userLive");
      if (!videoElement) {
        console.error("❌ Élément vidéo introuvable !");
        return;
      }
  
      videoElement.srcObject = stream;
      await videoElement.play().catch((err) => {
        console.error("❌ Erreur lecture vidéo :", err);
      });
  
      setStreamActive(true);
  
      const audioTracks = stream.getAudioTracks();
      if (audioTracks.length === 0) {
        console.warn("⚠️ Aucun micro détecté.");
      } else {
        console.log("🎤 Micro détecté :", audioTracks[0].label);
      }
  
      if (socket && socket.connected) {
        socket.emit("start_live", { username });
        setStreamerName(username);
      }
  
      console.log("✅ Live vidéo + audio démarré !");
    } catch (error) {
      // 💥 Gère les erreurs précisément
      if (error.name === "NotAllowedError") {
        alert("🚫 Autorisation refusée pour la caméra ou le micro.");
      } else if (error.name === "NotFoundError") {
        alert("🚫 Caméra ou micro introuvable.");
      } else if (error.name === "OverconstrainedError") {
        alert("⚠️ Aucun périphérique ne correspond aux contraintes.");
      } else {
        alert("❌ Erreur inconnue : " + error.message);
      }
      console.error("❌ Erreur lors du démarrage du live :", error);
    }
  };
  
  
  

  return (
    <div id="liveContainer">
      <div className="videoContainer">
        <video className="liveStream" id="userLive" autoPlay></video>
        {!streamActive && (
          <div id="startLive">
            <button onClick={startUserLive}>🎥 Passer en live</button>
          </div>
        )}
      </div>

      {streamerName && <h3 className="streamer-info">🎥 En live : {streamerName}</h3>}

      <div id="spectators">
        <h4>👀 Spectateurs ({spectators.length})</h4>
        <ul>
          {spectators.map((spectator, index) => (
            <li key={index}>{spectator}</li>
          ))}
        </ul>
      </div>

      <div id="chat">
        <div id="chat-messages">
          {messages.map((msg, index) => (
            <div key={index} className={`chat-message ${msg.username === streamerName ? "streamer-message" : ""}`}>
              <strong>{msg.username === streamerName ? "👑 Streamer" : msg.username}:</strong> {msg.message}
            </div>
          ))}
        </div>

        <input type="text" id="message" placeholder="💬 Écrire un message..." value={newMessage} onChange={(e) => setNewMessage(e.target.value)} />
        <button onClick={() => socket.emit("message", { username, message: newMessage })}>Envoyer</button>
      </div>
    </div>
  );
};

export default Live;