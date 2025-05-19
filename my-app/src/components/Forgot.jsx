import React, { useState } from "react";
import "../styles/Forgot.css"; // Assure-toi d'avoir ce fichier CSS

function Forgot() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email.trim()) {
      setMessage("Veuillez entrer votre adresse e-mail.");
      return;
    }

    try {
      const response = await fetch("/api/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const result = await response.json();
      if (response.ok) {
        setMessage("Un lien de réinitialisation a été envoyé à votre e-mail.");
      } else {
        setMessage(result.error || "Une erreur s'est produite.");
      }
    } catch (error) {
      console.error("Erreur :", error);
      setMessage("Une erreur s'est produite. Veuillez réessayer.");
    }
  };

  return (
    <div className="forgot-page">

      {/* En-tête */}
      <header>
        <h1 className="animated-text">All For One</h1>
      </header>

      {/* Formulaire */}
      <div className="forgot-password-container">
        <h2 className="animated-text2">Réinitialisation du mot de passe</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Entrez votre e-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button type="submit">Envoyer</button>
        </form> 
        {message && <p className="message">{message}</p>} 
      </div>

      {/* Pied de page */}
      <footer>
        <p className="animated-text2">&copy; 2025 AllForOne$£ | Tous droits réservés</p>
      </footer>
    </div>
  );
}

export default Forgot;