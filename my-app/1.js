import fetch from "node-fetch"; 
import { faker } from "@faker-js/faker";

const STRAPI_URL = "http://localhost:1337"; 
const ADMIN_EMAIL = "oreylli15@gmail.com"; 
const ADMIN_PASSWORD = "Pokpokpok12@";

// Fonction pour récupérer un token JWT d'admin
async function getAdminToken() {
  const loginData = {
    identifier: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
  };

  const response = await fetch(`${STRAPI_URL}/api/auth/local`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(loginData),
  });

  if (!response.ok) {
    console.error("❌ Erreur lors de l'authentification admin :", await response.text());
    return null;
  }

  const data = await response.json();
  return data.jwt; // Retourne le token JWT
}

// Fonction pour créer un utilisateur
async function createUser() {
  const userData = {
    username: faker.internet.username(), 
    email: faker.internet.email(),
    password: "password123", // Mot de passe par défaut
  };

  const response = await fetch(`${STRAPI_URL}/api/auth/local/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(userData),
  });

  if (!response.ok) {
    console.error("❌ Erreur lors de la création de l'utilisateur :", await response.text());
    return null;
  }

  const data = await response.json();
  return data.user;
}

// Fonction pour créer un média (image ou vidéo)
async function createMedia(userId, type, token) {
  const mediaData = {
    name: faker.lorem.words(3),
    url: type === "image" ? faker.image.url() : faker.internet.url(),
    mimeType: type === "image" ? "image/png" : "video/mp4",
    uploadedBy: userId,
  };

  const response = await fetch(`${STRAPI_URL}/api/medias`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`, // Utilisation du token récupéré
    },
    body: JSON.stringify({ data: mediaData }),
  });

  if (!response.ok) {
    console.error("❌ Erreur lors de l'ajout du média :", await response.text());
    return null;
  }

  return await response.json();
}

// Fonction principale pour remplir la base de données
async function fillDatabase() {
  const ADMIN_TOKEN = await getAdminToken();
  if (!ADMIN_TOKEN) {
    console.error("❌ Impossible de récupérer le token admin !");
    return;
  }

  for (let i = 0; i < 10; i++) {
    const user = await createUser();
    if (!user) continue; // Ignore si l'utilisateur n'a pas été créé

    console.log(`✅ Utilisateur créé : ${user.username}`);

    for (let j = 0; j < 3; j++) {
      const mediaType = j % 2 === 0 ? "image" : "video"; // Alterne entre image et vidéo
      const media = await createMedia(user.id, mediaType, ADMIN_TOKEN);
      if (!media) continue; // Ignore si le média n'a pas été créé

      console.log(`📸 Média ajouté (${mediaType}) pour ${user.username} : ${media.data.name}`);
    }
  }
}

// Exécuter le script
fillDatabase();