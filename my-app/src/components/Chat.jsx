import { useState, useEffect } from "react";
import "../styles/Chat.css";

const STRAPI_URL = "http://localhost:1337"; 
const API_URL_USER= `${STRAPI_URL}/api/users/`;


function Chat() {
  const [user, setUser] = useState([]);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedMediaComments, setSelectedMediaComments] = useState([]);
  const [selectedMediaId, setSelectedMediaId] = useState([]);
  //const [loading, setLoading] = useState(true);
  //const [error, setError] = useState("");
  
  useEffect(() => {
    const fetchUser = async () => {
        fetchMessages();
        const userId = getUserIdFromJwt();
        //console.log("UserId du premier useEffect a utiliser dans fetchUserById", userId);

        try {
            const user = await fetchUserById(userId); 
            setUser(user); 
        } catch (error) {
            console.error("Erreur lors de la récupération de l'utilisateur :", error);
        }
    };

    fetchUser();
}, []);

  //console.log("setUser apres les premier useEffect",user)
  
  async function fetchMessages() {
  try {
    const jwt = localStorage.getItem("jwt");
    if (!jwt) {
      console.error("❌ Aucun JWT trouvé !");
      return;
    }

    let allMessages = [];
    let page = 1;
    let pageSize = 100; 
    let totalPages = 10;

    while (page <= totalPages) {
      const response = await fetch(`${STRAPI_URL}/api/messages?populate=*&pagination[page]=${page}&pagination[pageSize]=${pageSize}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${jwt}`,
        },
      });

      if (!response.ok) throw new Error(`Erreur API : ${response.status}`);

      const data = await response.json();

      if (data?.meta?.pagination) {
        totalPages = data.meta.pagination.pageCount; // Nombre total de pages
      }

      allMessages = [...allMessages, ...data.data]; // Ajoute les nouveaux messages
      page++; 
    }
    setMessages(allMessages.sort((a, b) => (b.likes || 0) - (a.likes || 0)));
    //console.log("✅ Tous les messages récupérés :", allMessages);
  } catch (error) {
    console.error("❌ Erreur récupération des messages :", error);
  }
}
  function getUserIdFromJwt() {
    const jwt = localStorage.getItem("jwt");
    if (!jwt) {
      alert("❌ Aucun token trouvé !");
      return null;
    }

    try {
      const [, payloadBase64] = jwt.split(".");
      const payload = JSON.parse(atob(payloadBase64));
      return payload.id || null;
    } catch (error) {
      console.error("Erreur de décodage du JWT :", error);
      return null;
    }
  }
async function fetchUserById(userId) {
  try {
    const jwt = localStorage.getItem("jwt");
    if (!jwt) {
      console.error("❌ Aucun JWT trouvé !");
      return null;
    }

    const response = await fetch(`${API_URL_USER}${userId}?populate=*`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${jwt}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Erreur HTTP : ${response.status}`);
    }

    const userData = await response.json();
    console.log("👤 Utilisateur récupéré :", userData);

    return userData;
  } catch (error) {
    console.error("❌ Erreur récupération de l'utilisateur :", error);
    return null;
  }

}
async function uploadFile(file) {
  try {
    const jwt = localStorage.getItem("jwt");
    if (!jwt) {
      alert("❌ Vous devez être connecté !");
      return null;
    }

    console.log("📂 Fichier à uploader :", file);
    // FormData pour l'upload de fichier
    const formData = new FormData();
    formData.append("files", file);
    //formData.append("refId", user.id)
    //formData.append("field", user.media)
    
    // Envoi du fichier via POST
    const response = await fetch(`${STRAPI_URL}/api/upload`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
      body: formData,
    });
    const responseData = await response.json();
    if (!response.ok || !responseData?.length || !responseData[0]?.id) {
      throw new Error(`❌ Erreur upload : ${responseData.error?.message || "Réponse invalide"}`);
    } else {
      console.log("📤 Fichier uploadé  url:", responseData[0].url);
    }
    console.log("Response.id in uploadfile()",responseData[0].id)
    return responseData[0].id;
  } catch (error) {
    console.error("❌ Erreur upload :", error);
    return null;
  }
}
async function sendMessage() {
  if (!newMessage.trim() && !selectedMedia) {
    alert("❌ Vous devez envoyer un message, une image ou une vidéo !");
    return;
  }

  try {
    const jwt = localStorage.getItem("jwt");
    if (!jwt) {
      alert("❌ Vous devez être connecté !");
      return;
    }

    let uploadedMedia = [];
    //console.log("user dans sendMessages()", user.id)
    //console.log("selectedmedia dans sendmessage()", selectedMedia.id)
    if (selectedMedia) {
      const mediaId = await uploadFile(selectedMedia, user);
      if (mediaId) uploadedMedia.push(mediaId);

      console.log("mediaId", mediaId)
    }
    console.log("User dans sendMessage()",user.id)
    //console.log("userId dans sendmessage()", user.id)
    console.log("📤 Médias uploadés :", uploadedMedia);
    
    const payload = {
      messages: newMessage,
      media: uploadedMedia.length > 0 ? uploadedMedia : [],
      user: user.id,
    };

    console.log("📤 Payload envoyé :", JSON.stringify({ data: payload }));

    const response = await fetch(`${STRAPI_URL}/api/messages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${jwt}`,
      },
      body: JSON.stringify({ data: payload }),
    });

    const responseData = await response.json();
    console.log("📩 Message créé :", responseData);

    if (!response.ok) throw new Error(`Erreur lors de l'envoi du message : ${responseData.error?.message}`);

    setNewMessage("");
    setSelectedMedia(null);
    fetchMessages();
  } catch (error) {
    console.error("❌ Erreur :", error);
  }
}
async function addLike(mediaId) {
  try {
    const jwt = localStorage.getItem("jwt");
    if (!jwt) {
      alert("❌ Vous devez être connecté !");
      return;
    }
    console.log("Messages in addLike", messages)
    // 🔎 Récupérer les infos actuelles du média
    const getMediaResponse = await fetch(`${STRAPI_URL}/api/messages/${mediaId}`, {
      method: "GET",
      headers: { "Authorization": `Bearer ${jwt}` },
    });

    if (!getMediaResponse.ok) throw new Error(`Erreur API : ${getMediaResponse.status}`);

    const mediaData = await getMediaResponse.json();
    const currentLikes = mediaData.data.likes || 0; // Nombre actuel de likes

    // 📌 Mettre à jour le nombre de likes
    const response = await fetch(`${STRAPI_URL}/api/messages/${mediaId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${jwt}`,
      },
      body: JSON.stringify({ data: { likes: currentLikes + 1 } }),
    });

    if (!response.ok) throw new Error(`Erreur lors de l'ajout du like`);

    console.log("👍 Like ajouté avec succès !");
    fetchMessages()
  } catch (error) {
    console.error("❌ Erreur lors de l'ajout du like :", error);
  }
}
  async function openCommentsModal(mediaId) {
  try {
    const jwt = localStorage.getItem("jwt");
    if (!jwt) {
      alert("❌ Vous devez être connecté !");
      return;
    }
    console.log("Media.documentId in openCommentModal", mediaId)
    setSelectedMediaId(mediaId); // Stocker mediaId dans le state

    // 📥 Récupérer les commentaires liés au média
    const response = await fetch(`${STRAPI_URL}/api/messages/${mediaId}?populate=comments`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${jwt}`,
      },
    });

    if (!response.ok) throw new Error(`Erreur API : ${response.status}`);

    const data = await response.json();
    console.log("📥 Commentaires récupérés :", data.data);

    // Met à jour la liste des commentaires et ouvre le modal
    setSelectedMediaComments(data.data || []);
    setModalOpen(true);
  } catch (error) {
    console.error("❌ Erreur lors de la récupération des commentaires :", error);
  }
}
function CommentModal({ modalOpen, setModalOpen, selectedMediaComments }) {
  const [newComment, setNewComment] = useState("");

  const handleCommentSubmit = () => {
    if (!newComment.trim()) return;
    console.log("SelectedMediaComments passé à addComment()", "co8fgwm0opcqdqejte4uln69")
    addCommentToMessage(newComment, selectedMediaId); 
    setNewComment("");
  };

  //console.log("Commentaire pour le modal:", selectedMediaComments);
  //console.log("🔎 Vérification selectedMediaComments.comments :", selectedMediaComments?.comments);

  return (
    modalOpen && (
      <div className="modal">
        <div className="modal-content">
          <span className="close" onClick={() => setModalOpen(false)}>×</span>
          <h2>💬 Commentaires</h2>

          <div id="commentList">
            {Array.isArray(selectedMediaComments?.comments) && selectedMediaComments.comments.length > 0 ? (
              selectedMediaComments.comments.map((comment, index) => (
                <p key={index}>{comment.texte}</p>
              ))
            ) : (
              <p>Aucun commentaire</p>
            )}
          </div>

          <textarea
            id="commentInput"
            placeholder="Écrire un commentaire..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
          ></textarea>

          <button onClick={handleCommentSubmit}>Envoyer</button>
        </div>
      </div>
    )
  );
}
async function addCommentToMessage(newComment, mediaId) {
  if (!newComment.trim()) return;
  
  try {
    const jwt = localStorage.getItem("jwt");
    if (!jwt) {
      alert("❌ Vous devez être connecté !");
      return;
    }

    // 1. Créer le commentaire
    const commentPayload = {
      texte: newComment, // ou le nom du champ texte de ton modèle comments
      user: user.id,
    };

    const commentResponse = await fetch(`${STRAPI_URL}/api/comments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${jwt}`,
      },
      body: JSON.stringify({ data: commentPayload }),
    });

    if (!commentResponse.ok) {
      const errorData = await commentResponse.json();
      throw new Error(`Erreur création commentaire : ${errorData.error?.message}`);
    }

    const commentData = await commentResponse.json();
    const commentId = commentData.data?.id; // Vérifier si l'ID est bien retourné
    console.log("CommentData in addCommentToMesage", commentData)
    if (!commentId) {
      throw new Error("L'API n'a pas retourné d'ID pour le commentaire.");
    }
    console.log("MediaId in addCommentToMessage", selectedMediaId)
    // 2. Lier le commentaire au message
    const linkResponse = await fetch(`${STRAPI_URL}/api/messages/${mediaId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${jwt}`,
      },
      body: JSON.stringify({
        data: {
          comments: {
            connect: [commentId],
          },
        },
      }),
    });

    if (!linkResponse.ok) {
      const errorData = await linkResponse.json();
      throw new Error(`Erreur liaison commentaire : ${errorData.error?.message}`);
    }

    const updatedMessage = await linkResponse.json();
    console.log("✅ Commentaire lié au message :", updatedMessage);

    // 3. Met à jour l'état local en s'assurant que prevComments est un tableau
    setSelectedMediaComments((prevComments) => {
      return Array.isArray(prevComments) ? [...prevComments, commentData.data] : [commentData.data];
    });
    fetchMessages()

  } catch (error) {
    console.error("❌ Erreur lors de l'ajout du commentaire :", error);
  }
}
async function deleteMessage(messageId) {
  try {
    const jwt = localStorage.getItem("jwt");
    if (!jwt) {
      alert("❌ Vous devez être connecté !");
      return;
    }

    const response = await fetch(`${STRAPI_URL}/api/messages/${messageId}`, {
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${jwt}`,
      },
    });

    if (!response.ok) throw new Error(`❌ Erreur suppression message : ${response.status}`);

    console.log("🗑️ Message supprimé !");
    fetchMessages(); // Met à jour la liste
  } catch (error) {
    console.error("❌ Erreur lors de la suppression du message :", error);
  }
}
async function editMessage(messageId, currentText, mediaId) {
  const action = prompt("Que voulez-vous modifier ? (1) Texte (2) Média");

  if (action === "1") {
    const newText = prompt("Modifier votre message :", currentText);
    if (!newText || newText.trim() === "") return;

    try {
      const jwt = localStorage.getItem("jwt");
      if (!jwt) {
        alert("🚫 Vous devez être connecté !");
        return;
      }

      const response = await fetch(`${STRAPI_URL}/api/messages/${messageId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${jwt}`,
        },
        body: JSON.stringify({ data: { messages: newText } }),
      });

      if (!response.ok) throw new Error(`🚫 Erreur modification message : ${response.status}`);

      console.log("✏️ Message modifié !");
      fetchMessages();
    } catch (error) {
      alert("❌ Erreur lors de la modification du message !");
      console.error("❌ Détails :", error);
    }
  }

  if (action === "2") {
    const newFile = document.createElement("input");
    newFile.type = "file";
    newFile.accept = "image/*,video/*";

    newFile.onchange = async (event) => {
      const selectedFile = event.target.files[0];
      if (!selectedFile) return;

      try {
        const jwt = localStorage.getItem("jwt");
        if (!jwt) {
          alert("🚫 Vous devez être connecté !");
          return;
        }

        // 2. Uploader le nouveau fichier
        const formData = new FormData();
        formData.append("files", selectedFile);

        const uploadResponse = await fetch(`${STRAPI_URL}/api/upload`, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${jwt}`,
          },
          body: formData,
        });

        if (!uploadResponse.ok) throw new Error(`🚫 Erreur upload média : ${uploadResponse.status}`);

        const uploadedFiles = await uploadResponse.json();
        const newMediaId = uploadedFiles[0]?.id;

        // 3. Mettre à jour la référence dans le message si besoin
        // (à adapter selon la structure de ton modèle)
        await fetch(`${STRAPI_URL}/api/messages/${mediaId.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${jwt}`,
          },
          body: JSON.stringify({ data: { media: newMediaId } }),
        });

        console.log("📷 Média modifié !");
        fetchMessages();
      } catch (error) {
        alert("❌ Erreur lors de la modification du média !");
        console.error("❌ Détails :", error);
      }
    };

    newFile.click();
  }
}
  const handleShare = (mediaUrl) => {
    navigator.clipboard.writeText(mediaUrl);
    alert("Lien copié !");
  };
  //console.log("📜 Messages reçus :", messages);
  return (
    <div className="chat-container">
      <div id="chat2">
        {messages.length > 0 ? (
          messages.map((msg, index) => {
            console.log("🔄 Traitement du message :", msg);

            return (
              <div key={msg.id} className={`message ${index % 2 === 0 ? "right" : "left"}`}>
                <span className="username">{msg.user?.username || "Utilisateur inconnu"}:</span>
                <span className="text-content">
                  
                 

                      {msg.media.mime?.startsWith("video") ? (
                        <video key={msg.media.id} controls className="chat2-media">
                          <source src={`${STRAPI_URL}${msg.media.url}`} type={msg.media.mime} />
                        </video>
                      ) : msg.media.mime?.startsWith("image") ? (
                        <img 
                          key={msg.media.id} 
                          src={`${STRAPI_URL}${msg.media.url}`} 
                          alt={msg.media.alternativeText || "Image non disponible"} 
                          className="chat2-media"
                          onError={() => console.log("❌ Erreur de chargement de l’image")}
                        />
                      ) : (
                        <p>❌ Fichier non pris en charge</p>
                      )}
                    </>
                  )}

                  {/* Affichage du message texte */}
                  <p>{msg.messages ? msg.messages : ""}</p>
                </span>

                {/* Actions utilisateur */}
                <div className="actions">
                  <button onClick={() => addLike(msg.documentId)}>❤️ {msg.likes || 0}</button>
                  <button onClick={() => openCommentsModal(msg.documentId)}>💬 {msg.comments?.length || 0}</button>
                  <button onClick={() => handleShare(`${STRAPI_URL}${msg.media.url}`)}>🔗</button>
                  {msg.user?.id === user.id && (
  <button onClick={() => editMessage(msg.id, msg.messages, msg.media)}>✏️</button>
)}
{msg.user?.id === user.id && (
  <button onClick={() => deleteMessage(msg.id)}>🗑️</button>
)}
                </div>
              </div>
            );
          })
        ) : (
          <p className="empty-chat">Aucun message pour le moment.</p>
        )}
      </div>

      {/* Zone d'écriture du message */}
      <div className="input-container">
        <input 
          type="text" 
          placeholder="Écrire un message..." 
          value={newMessage} 
          onChange={(e) => {
            console.log("✏️ Message en cours de saisie :", e.target.value);
            setNewMessage(e.target.value);
          }} 
        />
        <input 
          type="file" 
          accept="image/*, video/*" 
          onChange={(e) => {
            console.log("📂 Fichier sélectionné :", e.target.files[0]);
            setSelectedMedia(e.target.files[0]);
          }} 
        />
        <button onClick={() => {
          console.log("🚀 Envoi du message...");
          sendMessage();
        }}>Envoyer</button>
      </div>
      
      <CommentModal 
  modalOpen={modalOpen} 
  setModalOpen={setModalOpen} 
  selectedMediaComments={selectedMediaComments} 
  addComment={(newComment) => addCommentToMessage(newComment, selectedMediaId)} 
/></div>
  );
};
export default Chat;
