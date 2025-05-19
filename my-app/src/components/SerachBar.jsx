import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Search.css"
const STRAPI_URL = "http://localhost:1337";

const SearchBar = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [users, setUsers] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const jwt = localStorage.getItem("jwt");
        if (!jwt) throw new Error("❌ Vous devez être connecté !");

        const response = await fetch(`${STRAPI_URL}/api/users?populate=*`, {
          method: "GET",
          headers: { "Authorization": `Bearer ${jwt}` },
        });

        if (!response.ok) throw new Error(`❌ Erreur API : ${response.status}`);

        const data = await response.json();
        setUsers(data);
      } catch (error) {
        console.error("❌ Erreur récupération des utilisateurs :", error);
      }
    };

    fetchUsers();
  }, []);

  const filteredUsers = users.filter((user) =>
    user.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="search-bar-container">
      {/* ✅ Ajout du titre */}
      <h3 className="search-title">🔍 Search Bar </h3>

      <input
        type="text"
        className="search-input"
        placeholder="Tapez un nom..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      {/* Liste des utilisateurs sous la barre de recherche */}
      {searchTerm && (
        <ul className="search-results">
          {filteredUsers.length > 0 ? (
            filteredUsers.map((user) => (
              <li key={user.id} onClick={() => navigate(`/profil2/${user.documentId}`)}>
                {user.username}
              </li>
            ))
          ) : (
            <li className="no-results">Aucun utilisateur trouvé.</li>
          )}
        </ul>
      )}
    </div>
  );
};

export default SearchBar;