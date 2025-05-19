import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Logout = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Supprimer le JWT ou les données utilisateur
    localStorage.removeItem("jwt");

    // Rediriger vers la page d'accueil après la déconnexion
    navigate("/");
  }, []); // Exécute la déconnexion dès le chargement

  return <p>Déconnexion en cours...</p>;
};


export default Logout;