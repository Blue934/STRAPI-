import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const STRAPI_URL = "http://localhost:1337"; 
const EditProfile = () => {
  const [user, setUser] = useState({});
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [age, setAge] = useState("");
  const [statut, setStatut] = useState("En ligne"); // Statut par défaut
  const [localisation, setLocalisation] = useState("");
  const [profilpic, setProfilPic] = useState("");
  const [preview, setPreview] = useState(null);
  const [message, setMessage] = useState("");
  const [media, setMedia] = useState([]);

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const jwt = localStorage.getItem("jwt");
      if (!jwt) {
        setMessage("❌ Vous devez être connecté !");
        return;
      }

      const response = await fetch(`${STRAPI_URL}/api/users/me?populate=*`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${jwt}`,
        },
      });

      if (!response.ok) throw new Error("Impossible de récupérer le profil.");

      const data = await response.json();
      console.log(data)
      setUser(data);
      setUsername(data.username);
      setEmail(data.email);
      setAge(data.age || "");
      setLocalisation(data.localisation || "");
      setStatut(data.statut || "En ligne"); // Définit le statut par défaut
      setMedia(data.media);
      
      if (data.profilpic) {
        setPreview(`${STRAPI_URL}${data.profilpic.url}`);
      }
    } catch (error) {
      console.error("❌ Erreur :", error);
      setMessage("Erreur lors du chargement du profil.");
    }
  };

  const handleProfilPicChange = (e) => {
    const file = e.target.files[0];
    setProfilPic(file);
    setPreview(URL.createObjectURL(file)); // Génère une prévisualisation
  };

  const handleUpdateProfile = async () => {
    try {
      const jwt = localStorage.getItem("jwt");
      if (!jwt) {
        setMessage("❌ Vous devez être connecté !");
        return;
      }

      const formData = new FormData();
      formData.append("username", username);
      formData.append("email", email);
      if (password) formData.append("password", password);
      formData.append("age", age);
      formData.append("localisation", localisation);
      formData.append("statut", statut); 
      formData.append("media", media);
      console.log("Profilpic value",profilpic);
      const userId = user.id;
      if (profilpic) {
        updateProfilePic(profilpic, userId)}
      
      
      console.log("FormData avant le Put:",formData)
      const response = await fetch(`${STRAPI_URL}/api/users/${userId}`, {
        method: "PUT",
        headers: {
          
          "Authorization": `Bearer ${jwt}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Erreur lors de la mise à jour du profil.");
      }

      setMessage("✅ Profil mis à jour avec succès !");
      fetchUserProfile();
    } catch (error) {
      console.error("❌ Erreur :", error);
      setMessage("Erreur lors de la mise à jour du profil.");
    }




  };
  async function updateProfilePic(file, userId) {
  try {
    const jwt = localStorage.getItem("jwt");
    if (!jwt) throw new Error("❌ Vous devez être connecté !");

    // ✅ Étape 1 : Uploader l'image
    const formData = new FormData();
    formData.append("files", file);
    formData.append("ref", "plugin::users-permissions.user");
    formData.append("refId", userId);
    formData.append("field", "profilpic");

    const uploadResponse = await fetch(`${STRAPI_URL}/api/upload`, {
      method: "POST",
      headers: { Authorization: `Bearer ${jwt}` },
      body: formData,
    });

    const uploadData = await uploadResponse.json();
    if (!uploadResponse.ok || !uploadData[0]?.id) throw new Error("❌ Erreur lors de l'upload");

    const fileId = uploadData[0].id;
    console.log("✅ Image uploadée, ID :", fileId);

    // ✅ Étape 2 : Mettre à jour `profilpic`
    const updateResponse = await fetch(`${STRAPI_URL}/api/users/${userId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${jwt}`,
      },
      body: JSON.stringify({ profilpic: fileId }),
    });

    const updateData = await updateResponse.json();
    if (!updateResponse.ok) throw new Error("❌ Erreur lors de la mise à jour du profil");

    console.log("✅ Profil mis à jour :", updateData);
    return updateData;
  } catch (error) {
    console.error("❌ Erreur :", error);
    return null;
  }
}
  return (
    <div style={styles.container}>
      <h2 className="animated-text">Modifier mon profil</h2>
      {message && <p style={styles.message}>{message}</p>}
      
      {preview && <img src={preview} alt="Photo de profil" style={styles.profilpic} />}
      <p>Entrer votre nom d'utilisateur</p>
      <input
        type="text"
        placeholder="Nom d'utilisateur"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        style={styles.input}
      />
      <p>Entrer votre nouvelle email</p>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={styles.input}
      />
      <p>Entrer votre age</p>
      <input
        type="number"
        placeholder="Âge"
        value={age}
        onChange={(e) => setAge(e.target.value)}
        style={styles.input}
      />
      <p>Quelle est ta localisation ?</p>
      <input
        type="text"
        placeholder="Localisation"
        value={localisation}
        onChange={(e) => setLocalisation(e.target.value)}
        style={styles.input}
      />
      <p>Quelle est votre statut</p>
       {/* Sélecteur de statut */}
      <select onChange={(e) => setStatut(e.target.value)} value={statut} style={styles.select}>
        <option value="En ligne">🟢 En ligne</option>
        <option value="Occupé">🔴 Occupé</option>
        <option value="Invisible">🟣 Invisible</option>
      </select>
      <p>Ajouter une nouvelle photo de profil ?</p>
      <input
        type="file"
        accept="image/*"
        onChange={handleProfilPicChange}
        style={styles.input}
      />
      <Link to="/profil">
      <button onClick={handleUpdateProfile} style={styles.button}>
        Mettre à jour
      </button></Link>
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
  input: {
    width: "80%",
    padding: "10px",
    margin: "10px 0",
    borderRadius: "5px",
    border: "1px solid #ccc",
  },
  button: {
    background: "linear-gradient(190deg, #ffae00, #c152a7, rgb(255, 0, 0))",
    borderRadius: "20px",
    padding: "10px 15px",
    cursor: "pointer",
    color: "white",
    fontSize: "16px",
    border: "none",
  },
  message: {
    color: "lightgreen",
    fontWeight: "bold",
  },
  profilpic: {
    width: "100px",
    height: "100px",
    borderRadius: "50%",
    objectFit: "cover",
    marginBottom: "10px",
  },
};

export default EditProfile;