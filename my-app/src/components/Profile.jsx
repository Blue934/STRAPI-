import { useState, useEffect, useCallback } from "react";
import MediaGallery from "./MediaGallery"; 
import "../styles/Profile.css";

const STRAPI_URL = "http://localhost:1337";
const UPLOAD_URL = `${STRAPI_URL}/api/upload`;
//const USER_MEDIA_URL = `${STRAPI_URL}/api/users/`; 

function Profil() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = useCallback(async () => {
    try {
      const jwt = localStorage.getItem("jwt");
      if (!jwt) throw new Error("❌ Vous devez être connecté !");

      console.log("🔄 Récupération des données utilisateur...");
      const response = await fetch(`${STRAPI_URL}/api/users/me?populate=*`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${jwt}`,
        },
      });

      if (!response.ok) throw new Error(`❌ Erreur HTTP ${response.status}: ${response.statusText}`);

      const result = await response.json();
      console.log("📥 Données utilisateur reçues :", JSON.stringify(result, null, 2));

      setUser({
        id: result.id,
        username: result.username || "Utilisateur",
        email: result.email || "Non spécifié",
        age: result.age || "Non spécifié",
        localisation: result.localisation || "Non spécifié",
        statut: result.statut || "Non spécifié",
        profilpic: result.profilpic?.url ? `${STRAPI_URL}${result.profilpic.url}` : "/images/default-avatar.png",
        documentId: result.documentId || "Non spécifié",
        media: result.media || "Non spécifié",

      });
    } catch (error) {
      console.error("❌ Erreur réseau :", error);
      setError("Une erreur est survenue, veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleAddMedia = async (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      alert("❌ Aucun fichier sélectionné !");
      return;
    }
  
    try {
      const jwt = localStorage.getItem("jwt");
      if (!jwt) {
        alert("❌ Vous devez être connecté !");
        return;
      }
  
      // Étape 1 : Upload du fichier sur Strapi
      const formData = new FormData();
      formData.append("files", file);
  
      const uploadResponse = await fetch(`${UPLOAD_URL}`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${jwt}` },
        body: formData,
      });
  
      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json();
        throw new Error(`❌ Erreur upload: ${errorData.error?.message || uploadResponse.status}`);
      }
  
      const uploadResult = await uploadResponse.json();
      const mediaId = uploadResult?.[0] || uploadResult?.[0];
      if (!mediaId) {
        throw new Error("❌ Erreur : Aucun média ID récupéré !");
      }
  
      if (!user?.id) {
        throw new Error("❌ Erreur : Aucun ID utilisateur trouvé !");
      }
      console.log("mediaId_url", mediaId.url);
      console.log("mediaId", mediaId)
      // Étape 2 : Créer une entrée dans Gallery en liant le média et l'utilisateur
      const galleryResponse = await fetch(`http://localhost:1337/api/galleries`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${jwt}`,
        },
        body: JSON.stringify({
          data: {
            media: mediaId.id,      
            user: user.id,        
            url: mediaId.url,
            mime: mediaId.mime,
          }
        }),
      });
      
      if (!galleryResponse.ok) {
        const errorData = await galleryResponse.json();
        throw new Error(`❌ Erreur lors de la création de la galerie: ${errorData.error?.message || galleryResponse.status}`);
      }
      
      console.log("✅ Média ajouté à la galerie avec succès !");
      fetchUserData();
    } catch (error) {
      console.error("❌ Erreur lors de l'ajout du média :", error);
      alert(`Une erreur est survenue : ${error.message}`);
    }
  };

  return (
    <div className="profil-page">
      {loading ? (
        <p className="animated-text">Chargement...</p>
      ) : error ? (
        <p className="error-message">{error}</p>
      ) : (
        <>
          <img src={user.profilpic} alt="Photo de profil" className="profile-pic" />
          <h2 className="animated-text">{user.username}</h2><br />
          <p className="verified">🎗️</p>
          <p className="animated-text2">Âge: {user.age}</p>
          <p className="animated-text2">Localisation: {user.localisation}</p>
          <p className="animated-text2">Likes: {user.likes}</p>
          <p className="animated-text2">Statut: {user.statut}</p>

          {/* ✅ Bouton pour ajouter un média */}
          <label className="add-media-button">
            ➕
            <input type="file" accept="image/*,video/*" onChange={handleAddMedia} style={{ display: "none" }} />
          </label>

          {/* ✅ Affichage des médias liés à l'utilisateur */}
          <MediaGallery userId={user.id} />
        </>
      )}
    </div>
  );
}
export default Profil;