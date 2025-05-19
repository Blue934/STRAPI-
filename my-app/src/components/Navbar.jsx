import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const Navbar = () => {
  const [menuVisible, setMenuVisible] = useState(false);

  const toggleMenu = () => {
    setMenuVisible((prev) => !prev); // Change l'état du menu
  };

  // Fermer le menu si on clique en dehors
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuVisible && !event.target.closest(".menu") && !event.target.closest(".menu-icon")) {
        setMenuVisible(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [menuVisible]);

  return (
    <div style={styles.navbarContainer}>
      {/* Bouton menu */}
      <button className="menu-icon" onClick={toggleMenu} aria-label="Ouvrir le menu" style={styles.menuIcon}>
        ☰
      </button>

      {/* Navbar droite (Menu déroulant) */}
      <div className="menu" style={{ ...styles.menu, transform: menuVisible ? "translateX(0)" : "translateX(-100%)" }}>
        <ul style={styles.menuList}>
          {menuItems.map((item, index) => (
            <li key={index}>
              <Link to={item.path}>
                <img src={item.icon} alt={item.label} style={styles.icon} />
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

// Liste des éléments du menu
const menuItems = [
  { path: "/chat", label: "Chat", icon: "/icons/Firefly_Fond d11'écran a coupé le souffle avec All For One écrit au premier plan rien d'autre 146911.jpg" },
  { path: "/profil", label: "Profil", icon: "/icons/copilot_image_1746971559129.jpeg" },
  { path: "/video", label: "Gallery", icon: "/icons/i-upscaled-shots-from-my-fav-hunter-x-hunter-endings-for-my-v0-uordnt5njr8c1.webp" },
  { path: "/live", label: "Live", icon: "/icons/copilot_image_1747203987789.jpeg" },
  { path: "/edit-profile", label: "Modifier Profil", icon: "/icons/Firefly_logo pour la fonctionnalité Hall of Fame avec Hall of Fame écrit en gros devant et le 184774.jpg" },
  { path: "/Bar", label: "Modifier Profil", icon: "/icons/671a5b4d01ea6d83dee3bbf6.webp" },
  { path: "/logout", label: "Déconnexion", icon: "/icons/logout-icon_1134231-40689.avif" },
];


const styles = {
  navbarContainer: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    position: "fixed",
    height: "99vh",
    top:"0",
    width: "10px",
    zIndex:"1000",
  },

  menuIcon: {
    position: "fixed",
    right: "10px",
    top: "80px",
    color: "#ffffff",
    border: "none",
    padding: "10px",
    borderRadius: "30px",
    fontSize: "20px",
    cursor: "pointer",
    height: "45px",
    width: "40px",
    zIndex: "1002",
    transition: "transform 0.3s ease-in-out",
  },

  menu: {
    position: "absolut",
    top: "200px",
    bottom:"0",
    height: "99vh",
    width: "auto",
    background: "linear-gradient(190deg, #ffae00, #c152a7, rgb(255, 0, 0))",
    padding: "20px",
    borderLeft: "2px solid #ddd",
    transition: "transform 0.5s ease-in-out",
    boxShadow: "-5px 0px 15px rgba(0, 0, 0, 0.3)",
    transform: "translateX(-100%)", // Cache le menu au démarrage
    zIndex:"1002",
  },

  menuList: {
    listStyle: "none",
    padding: "0",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "30px",
    top: "320px",
    zIndex:"1002",
  },

  icon: {
    width: "80px",
    height: "80px",
    cursor: "pointer",
    transition: "transform 0.3s ease-in-out",
  },
};

export default Navbar;