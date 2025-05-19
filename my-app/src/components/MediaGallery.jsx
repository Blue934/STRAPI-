import React, { useState, useEffect, useCallback } from "react";

const STRAPI_URL = "http://localhost:1337";

const MediaGallery = ({ userId }) => {
  const [mediaUrls, setMediaUrls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (userId) {
      fetchUserMedia(userId);
    }
  }, [userId]);

  const fetchUserMedia = useCallback(async (userId) => {
    try {
      if (!userId) {
        setError("❌ ID utilisateur invalide !");
        return;
      }

      const jwt = localStorage.getItem("jwt");
      if (!jwt) {
        setError("❌ Vous devez être connecté !");
        return;
      }

      console.log(`🔄 Récupération des médias de l'utilisateur ID: ${userId}`);

      const response = await fetch(`${STRAPI_URL}/api/users/${userId}?populate=*`, {
        method: "GET",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${jwt}` }
      });

      if (!response.ok) throw new Error(`❌ Erreur HTTP ${response.status}: ${response.statusText}`);

      const result = await response.json();
      console.log("Données récupérées dans mediaGallery via fetchUserMedia ():", result);

      if (!result.media || result.media.length === 0) {
        setMediaUrls([]);
        return;
      }

      // Récupérer les détails de chaque média
      const mediaDetails = await Promise.all(
        result.galleries.map(async (media) => {
          console.log(media.documentId)
          console.log("Instance principale",media.documentId)
          console.log("Media url",media.url)
          console.log(userId)
          const mediaResponse = await fetch(`${STRAPI_URL}/api/users/${userId}?populate=*`, {
            method: "GET",
            headers: { "Authorization": `Bearer ${jwt}` }
          });

          if (!mediaResponse.ok) {
            console.error(`❌ Erreur lors de la récupération du média ID ${media.id}`);
            return null;
          }
          console.log("Media reponse avant .json()", mediaResponse)

          const mediaData = await mediaResponse.json(); // Correction : Parser la réponse JSON
          console.log("Média récupéré apres .json():", mediaData);
          console.log("Type", media.mime)
          return {
            id: media.id,
            url: `${STRAPI_URL}${media.url}`,
            mimeType: media.mime || "unknown",
          };
        })
      );

      // Filtrer les médias valides
      const validMedia = mediaDetails.filter((media) => media !== null);
      setMediaUrls(validMedia);
      console.log("✅ Médias stockés :", validMedia);
    } catch (error) {
      console.error("❌ Erreur réseau :", error);
      setError("Une erreur est survenue lors de la récupération des médias.");
    } finally {
      setLoading(false);
    }
  }, []);
  console.log("DATA FRONT", mediaUrls)
  return (
    <div className="media-gallery">
      <h3 className="animated-text2">Secret Garden : {mediaUrls.length}</h3>

      {loading ? (
        <p>Chargement des médias...</p>
      ) : error ? (
        <p className="error-message">{error}</p>
      ) : mediaUrls.length === 0 ? (
        <p>Aucune vidéo ou image disponible.</p>
      ) : (
        <div className="media-grid">
          {mediaUrls.map((media) =>
            media.mimeType?.startsWith("video") ? (
              <video key={media.id} controls className="profile-media">
                <source src={media.url} type={media.mimeType} />
              </video>
            ) : media.mimeType?.startsWith("image") ? (
              <img key={media.id} src={media.url} alt="Image" className="profile-media" />
            ) : (
              <p key={media.id}>❌ Impossible de charger le fichier</p>
            )
          )}
        </div>
      )}
    </div>
  );
};

export default MediaGallery;