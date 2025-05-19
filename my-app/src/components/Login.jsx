import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/Login.css";


function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (event) => {
    event.preventDefault();

    if (!username.trim() || !password.trim()) {
      setMessage("Tous les champs sont requis !");
      return;
    }

    const formData = { identifier: username, password };

    try {
      const response = await fetch("http://localhost:1337/api/auth/local", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (response.ok) {
        localStorage.setItem("jwt", result.jwt); // Stocker le token JWT
        console.log("JWT:",result.jwt)
        setMessage("Connexion réussie !");
        navigate("/Chat"); // Redirection vers la page de chat
      } else {
        setMessage(result.error?.message || "Identifiants incorrects.");
      }
    } catch (error) {
      console.error("Erreur réseau :", error);
      setMessage("Une erreur est survenue, veuillez réessayer.");
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/logout", { method: "POST" });
      localStorage.removeItem("jwt");
      console.log("Déconnexion réussie");
    } catch (error) {
      console.error("Erreur lors de la déconnexion :", error);
    }
  };

  return (
    <div className="login-page">

      {/* En-tête */}
      <header>
        <h1 className="animated-text">AllForOne</h1>
      </header>

      {/* Formulaire de connexion */}
      <div className="form-container">
        <h2 className="animated-text2">Connexion</h2>
        <form onSubmit={handleLogin}>
          <input
            className="inputprime"
            type="text"
            placeholder="Nom d'utilisateur"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <input
            className="inputprime"
            type="password"
            placeholder="Mot de passe"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button className="animated-text2" type="submit">Se connecter</button>
          {message && <p className="message">{message}</p>}
          <div className="button-group">
            <Link to="/SignUp" onClick={handleLogout}>
              <button className="animated-text2">Inscription</button>
            </Link>
            <Link to="/Forgot" onClick={handleLogout}>
              <button className="animated-text2">Mot de passe oublié ?</button>
            </Link>
          </div>
        </form>
      </div>

      {/* Pied de page */}
      <footer>
        <p className="animated-text2">&copy; 2025 AllForOne$£ | Tous droits réservés</p>
      </footer>
    </div>
  );
}

export default Login;