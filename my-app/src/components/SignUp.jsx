import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/SignUp.css";

function SignUp() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (event) => {
    event.preventDefault();

    if (!username.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
      setMessage("Tous les champs sont requis !");
      return;
    }

    if (password !== confirmPassword) {
      setMessage("Les mots de passe ne correspondent pas !");
      return;
    }

    const formData = { username, email, password };

    try {
      const response = await fetch("http://localhost:1337/api/auth/local/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (response.ok) {
        localStorage.setItem("jwt", result.jwt); // Stocker le token JWT
        setMessage("Inscription réussie !");
        navigate("/edit-profile"); // Redirection vers le profil
      } else {
        setMessage(result.error?.message || "Erreur lors de l'inscription.");
      }
    } catch (error) {
      console.error("Erreur réseau :", error);
      setMessage("Une erreur est survenue, veuillez réessayer.");
    }
  };

  return (
    <div className="signup-page">
      {/* En-tête */}
      <header>
        <h1 className="animated-text">All For One</h1>
      </header>

      {/* Formulaire d'inscription */}
      <div className="form-container">
        <h2 className="animated-text2">Créer un compte</h2>
        <form onSubmit={handleRegister}>
          <input type="text" placeholder="Nom d'utilisateur" value={username} onChange={(e) => setUsername(e.target.value)} required />
          <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <input type="password" placeholder="Mot de passe" value={password} onChange={(e) => setPassword(e.target.value)} required />
          <input type="password" placeholder="Confirmer le mot de passe" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
          <button className="animated-text2" type="submit">S'inscrire</button>
          {message && <p className="message">{message}</p>}
          <Link to="/">
            <button className="animated-text2">Déjà un compte ?</button>
          </Link>
        </form>
      </div>

      {/* Pied de page */}
      <footer>
        <p className="animated-text2">&copy; 2025 AllForOne | Tous droits réservés</p>
      </footer>
    </div>
  );
}

export default SignUp;