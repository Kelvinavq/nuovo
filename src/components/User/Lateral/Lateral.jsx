import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import "./Style.css";
import NotificationsNoneOutlinedIcon from "@mui/icons-material/NotificationsNoneOutlined";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import VerifiedIcon from "@mui/icons-material/Verified";

const Lateral = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const [userData, setUserData] = useState({});
  const [isUserVerified, setIsUserVerified] = useState(false);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const closeDropdownOutsideClick = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", closeDropdownOutsideClick);

    // Obtener información del usuario al cargar el componente
    fetch("http://localhost/nuovo/backend/api/getUserInfo.php", {
      method: "GET",
      credentials: "include",
    })
      .then((response) => response.json())
      .then((data) => setUserData(data))
      .catch((error) =>
        console.error("Error al obtener información del usuario", error)
      );

      const checkVerification = async () => {
        const response = await fetch(
          "http://localhost/nuovo/backend/api/checkVerification.php",
          {
            method: "GET",
            credentials: "include",
          }
        );
  
        const data = await response.json();
        if (response.ok) {
          setIsUserVerified(data.status);
        }
      };
  
      checkVerification();

    return () => {
      document.removeEventListener("mousedown", closeDropdownOutsideClick);
    };
  }, []);


  return (
    <div className="lateral">
      <div className="profile">
        <div className="img">
          {isUserVerified === "approved" ? <p className="verified"><VerifiedIcon/></p> : ""}

          <img
            src={`http://localhost/nuovo/src/assets/users/${userData.profile_picture}`}
            alt=""
          />
          <div className="dropdown" ref={dropdownRef}>
            <button onClick={toggleDropdown}>
              <KeyboardArrowDownIcon />
            </button>
            {isOpen && (
              <div className="dropdown-content">
                <Link to={"/user/ajustes/perfil"}>Perfil</Link>
                <Link to={"/user/ajustes/verificacion"}>Verificación</Link>
                <Link to={"/user/ajustes/seguridad"}>Seguridad</Link>
              </div>
            )}
          </div>
          <p>{userData.name}</p>
        </div>

        <div className="notification">
          <button>
            <NotificationsNoneOutlinedIcon />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Lateral;
