import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion"; 
import Login from "./components/Login";
import Chat from "./components/Chat";
import Navbar from "./components/Navbar";
import SignUp from "./components/SignUp";
import Forgot from "./components/Forgot";
import Profil from "./components/Profile";
import Profil2 from "./components/Profil2"; // Profile 2 est présent afin de gerer la vue d'autre profile que le sien 
import MediaGallery from "./components/VideoUploader";
import Live from "./components/live";
import Logout from "./components/Logout";
import EditProfile from "./components/EditProfil";
import Avatar from "./components/Avatar";
import SearchBar from "./components/SerachBar";

const pageVariants = {
  initial: { opacity: 1 },
  animate: { opacity: 1 },
  exit: { opacity: 0, transition: { duration: 0.8 } }, // Disparition progressive
};
const AnimatedRoutes = () => {
  const location = useLocation(); // Détecte les changements de page

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
      >
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<Login />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/forgot" element={<Forgot />} />
          <Route path="/profil" element={<Profil />} />
          <Route path="/profil2" element={<Profil2 />} />
          <Route path="/video" element={<MediaGallery />} />
          <Route path="/live" element={<Live />} />
          <Route path="/logout" element={<Logout />} />
          <Route path="/edit-profile" element={<EditProfile />} />
          <Route path="/avatar" element={<Avatar />} />
          <Route path="/Bar" element={<SearchBar/>}/>
          <Route path="*" element={<h1>404 - Page non trouvée</h1>} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
};

function App() {
  return (
    <Router>
      <Navbar />
      <AnimatedRoutes />
    </Router>
  );
}

export default App;