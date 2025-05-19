import { useEffect, useState, useRef } from "react";

const STRAPI_URL = "http://localhost:1337";
const API_URL = `${STRAPI_URL}/api/upload/files`;

const MediaGallery = () => {
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const mediaRefs = useRef([]);

  useEffect(() => {
    const fetchMedia = async () => {
      try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error(`Erreur: ${response.status}`);
        const data = await response.json();
        setMedia(data);
      } catch (error) {
        console.error("Erreur de chargement des médias :", error);
        setError("Impossible de charger les médias.");
      } finally {
        setLoading(false);
      }
    };

    fetchMedia();
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const video = entry.target;
          if (entry.isIntersecting) {
            if (!video.paused) video.play();
          } else {
            video.pause();
          }
        });
      },
      { threshold: 0.8 }
    );

    mediaRefs.current.forEach((video) => {
      if (video instanceof Element) observer.observe(video); // ✅ Vérification avant observe()
    });

    return () => {
      observer.disconnect(); // ✅ Supprime proprement l'observateur
    };
  }, [media]);

  return (
    <div style={styles.body}>
      {loading ? (
        <p>Chargement des médias...</p>
      ) : error ? (
        <p style={styles.error}>{error}</p>
      ) : media.length === 0 ? (
        <p>Aucun média disponible.</p>
      ) : (
        media.map((item, index) => (
          item.mime.startsWith("video") ? (
            <video
              key={index}
              controls
              ref={(el) => {
                if (el) mediaRefs.current[index] = el; // ✅ Empêche les valeurs null/undefined
              }}
              style={styles.video}
            >
              <source src={`${STRAPI_URL}${item.url}`} type={item.mime} />
            </video>
          ) : (
            <img
              key={index}
              src={`${STRAPI_URL}${item.url}`}
              alt={`Media ${index}`}
              style={styles.image}
            />
          )
        ))
      )}
    </div>
  );
};

const styles = {
  body: {
    width: "100vw",
    height: "100vh",
    overflowY: "scroll",
    scrollSnapType: "y mandatory",
  },
  video: {
    width: "100vw",
    height: "99vh",
    objectFit: "contain",
    scrollSnapAlign: "start",
  },
  image: {
    width: "100vw",
    height: "100vh",
    objectFit: "contain",
    scrollSnapAlign: "start",
  },
  error: {
    color: "red",
    fontWeight: "bold",
  },
};

export default MediaGallery;