import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import "./Style.css";
import NotificationsNoneOutlinedIcon from "@mui/icons-material/NotificationsNoneOutlined";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import VerifiedIcon from "@mui/icons-material/Verified";
import Pusher from "pusher-js";

const Lateral = () => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileDropdownRef = useRef(null);

  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const notificationsDropdownRef = useRef(null);
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0);
  const [notifications, setNotifications] = useState([]);

  const [userData, setUserData] = useState({});
  const [isUserVerified, setIsUserVerified] = useState(false);

  const toggleProfileDropdown = () => {
    setIsProfileOpen(!isProfileOpen);
  };

  const toggleNotificationsDropdown = () => {
    setIsNotificationsOpen(!isNotificationsOpen);
  };

  const closeDropdownOutsideClick = (event, dropdownRef, setIsOpen) => {
    if (
      dropdownRef &&
      dropdownRef.current &&
      !dropdownRef.current.contains(event.target)
    ) {
      setIsOpen(false);
    }
  };

  const getNotifications = async () => {
    try {
      const response = await fetch(
        "http://localhost/nuovo/backend/Api/getNotifications.php",
        {
          method: "GET",
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error(`Error en la solicitud: ${response.statusText}`);
      }

      const data = await response.json();

      setNotifications(data);
      console.log(data)
      const unreadCount = data.filter(
        (notification) => notification.status === "unread"
      ).length;
      setUnreadNotificationsCount(unreadCount);
    } catch (error) {
      console.error("Error al obtener notificaciones", error);
    }
  };

  useEffect(() => {
    // Configurar Pusher
    const pusher = new Pusher("afe7fd857579ff4b05d7", {
      cluster: "mt1",
      useTLS: true,
      encrypted: true,
    });

    // Suscribirse al canal de notificaciones
    const channel = pusher.subscribe("notifications-channel");

    // Manejar nuevos eventos de notificación
    channel.bind("evento", (newNotification) => {
      // Actualizar la lista de notificaciones con la nueva notificación
      setNotifications((prevNotifications) => [
        ...prevNotifications,
        newNotification,
      ]);
      getNotifications();
    });

    getNotifications();

    document.addEventListener("mousedown", closeDropdownOutsideClick);

    // Obtener información del usuario al cargar el componente
    fetch("http://localhost/nuovo/backend/Api/getUserInfo.php", {
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
        "http://localhost/nuovo/backend/Api/checkVerification.php",
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

    const closeProfileDropdownOutsideClick = (event) => {
      closeDropdownOutsideClick(event, profileDropdownRef, setIsProfileOpen);
    };

    const closeNotificationsDropdownOutsideClick = (event) => {
      closeDropdownOutsideClick(
        event,
        notificationsDropdownRef,
        setIsNotificationsOpen
      );
    };

    document.addEventListener("mousedown", closeProfileDropdownOutsideClick);
    document.addEventListener(
      "mousedown",
      closeNotificationsDropdownOutsideClick
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        closeProfileDropdownOutsideClick
      );
      document.removeEventListener(
        "mousedown",
        closeNotificationsDropdownOutsideClick
      );
    };
  }, []);

  return (
    <div className="lateral">
      <div className="profile">
        <div className="img">
          {isUserVerified === "approved" ? (
            <p className="verified">
              <VerifiedIcon />
            </p>
          ) : (
            ""
          )}

          <img
            src={`http://localhost/nuovo/src/assets/users/${userData.profile_picture}`}
            alt=""
          />
          <div className="dropdown" ref={profileDropdownRef}>
            <button onClick={toggleProfileDropdown}>
              <KeyboardArrowDownIcon />
            </button>
            {isProfileOpen && (
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
          <button onClick={toggleNotificationsDropdown}>
            <NotificationsNoneOutlinedIcon />
            {unreadNotificationsCount > 0 && (
              <span className="notification-count">
                {unreadNotificationsCount}
              </span>
            )}
          </button>
          {isNotificationsOpen && (
            <div className="dropdown-content" ref={notificationsDropdownRef}>
                {notifications.map((notification) => (
                <p key={notification.id}>{notification.content}</p>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Lateral;
