import React, { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom"; // Permet de récupérer l'userId depuis l'URL
import MediaGallery from "./MediaGallery";
import "../styles/Profile.css";

const STRAPI_URL = "http://localhost:1337";

const Profil2 = () => {
  const { userId } = useParams(); // Récupère l'userId de l'URL
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchUserData = useCallback(async () => {
    try {
      const jwt = localStorage.getItem("jwt");
      if (!jwt) throw new Error("❌ Vous devez être connecté !");

      console.log(`🔄 Récupération du profil utilisateur ID: ${userId}`);
      const response = await fetch(`${STRAPI_URL}/api/users/${userId}?populate=*`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${jwt}`,
        },
      });

      if (!response.ok) throw new Error(`❌ Erreur HTTP ${response.status}: ${response.statusText}`);

      const result = await response.json();
      console.log("📥 Profil utilisateur récupéré :", result);

      setUser({
        id: result.id,
        username: result.username || "Utilisateur",
        age: result.age || "Non spécifié",
        localisation: result.localisation || "Non spécifié",
        statut: result.statut || "Non spécifié",
        profilpic: result.profilpic?.url ? `${STRAPI_URL}${result.profilpic.url}` : "/images/default-avatar.png",
        media: result.media || [],
      });
    } catch (error) {
      console.error("❌ Erreur réseau :", error);
      setError("Une erreur est survenue, veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchUserData();
  }, [userId, fetchUserData]);

  return (
    <div className="profil-page">
      {loading ? (
        <p className="animated-text">Chargement...</p>
      ) : error ? (
        <p className="error-message">{error}</p>
      ) : (
        <>
          <img src={user.profilpic} alt="Photo de profil" className="profile-pic" />
          <h2 className="animated-text">{user.username}</h2>
          <p className="animated-text2">Âge: {user.age}</p>
          <p className="animated-text2">Localisation: {user.localisation}</p>
          <p className="animated-text2">Statut: {user.statut}</p>

          {/* ✅ Affichage des médias liés à cet utilisateur */}
          <MediaGallery userId={user.id} />
        </>
      )}
    </div>
  );
};

export default Profil2;