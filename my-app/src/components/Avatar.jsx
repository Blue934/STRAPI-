import { useState, useEffect } from "react";

const STRAPI_URL = "http://localhost:1337"; // Remplace par l'URL de ton Strapi

const Avatar = ({ username }) => {
  const [avatarUrl, setAvatarUrl] = useState("");
  const [style, setStyle] = useState("pixel-art"); // Style d'avatar
  const [bgColor, setBgColor] = useState("#ffffff"); // Couleur de fond
  const [borderRadius, setBorderRadius] = useState("50%"); // Forme de l'avatar
  const [customAvatar, setCustomAvatar] = useState(null); // Avatar personnalisé

  useEffect(() => {
    fetchUserAvatar();
  }, []);

  const fetchUserAvatar = async () => {
    try {
      const jwt = localStorage.getItem("jwt");
      if (!jwt) {
        setAvatarUrl(generateDiceBearAvatar(username, style, bgColor));
        return;
      }

      const response = await fetch(`${STRAPI_URL}/api/users/me?populate=avatar`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${jwt}`,
        },
      });

      if (!response.ok) throw new Error("Impossible de récupérer l'avatar.");

      const data = await response.json();
      if (data.avatar) {
        setAvatarUrl(`${STRAPI_URL}${data.avatar.url}`);
      } else {
        setAvatarUrl(generateDiceBearAvatar(username, style, bgColor));
      }
    } catch (error) {
      console.error("❌ Erreur :", error);
      setAvatarUrl(generateDiceBearAvatar(username, style, bgColor));
    }
  };

  const generateDiceBearAvatar = (username, style, bgColor) => {
    return `https://api.dicebear.com/7.x/${style}/svg?seed=${username}&backgroundColor=${bgColor.replace("#", "")}`;
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    setCustomAvatar(file);
    setAvatarUrl(URL.createObjectURL(file)); // Prévisualisation
  };

  const handleStyleChange = (e) => {
    setStyle(e.target.value);
    setAvatarUrl(generateDiceBearAvatar(username, e.target.value, bgColor));
  };

  const handleBgColorChange = (e) => {
    setBgColor(e.target.value);
    setAvatarUrl(generateDiceBearAvatar(username, style, e.target.value));
  };

  const handleBorderChange = (e) => {
    setBorderRadius(e.target.value);
  };

  return (
    <div style={styles.container}>
      <h2>Personnaliser mon avatar</h2>

      <img src={avatarUrl} alt="Avatar" style={{ ...styles.avatar, borderRadius }} />

      <div style={styles.controls}>
        <label>Style :</label>
        <select onChange={handleStyleChange} value={style} style={styles.select}>
          <option value="pixel-art">Pixel Art</option>
          <option value="bottts">Robot</option>
          <option value="avataaars">Cartoon</option>
          <option value="identicon">Identicon</option>
          <option value="micah">Micah</option>
        </select>

        <label>Couleur de fond :</label>
        <input type="color" onChange={handleBgColorChange} value={bgColor} style={styles.colorPicker} />

        <label>Forme :</label>
        <select onChange={handleBorderChange} value={borderRadius} style={styles.select}>
          <option value="50%">Rond</option>
          <option value="10px">Carré arrondi</option>
          <option value="0px">Carré</option>
        </select>

        <label>Uploader un avatar :</label>
        <input type="file" accept="image/*" onChange={handleAvatarChange} style={styles.fileInput} />
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "20px",
    background: "#222",
    borderRadius: "10px",
    color: "white",
    width: "50%",
    margin: "auto",
  },
  avatar: {
    width: "100px",
    height: "100px",
    objectFit: "cover",
    marginBottom: "10px",
    transition: "border-radius 0.3s ease-in-out",
  },
  controls: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "10px",
  },
  select: {
    padding: "5px",
    borderRadius: "5px",
    border: "1px solid #ccc",
  },
  colorPicker: {
    width: "50px",
    height: "30px",
    border: "none",
  },
  fileInput: {
    marginTop: "10px",
  },
};

export default Avatar;