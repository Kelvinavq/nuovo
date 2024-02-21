import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import "./Style.css";
import NotificationsNoneOutlinedIcon from "@mui/icons-material/NotificationsNoneOutlined";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import VerifiedIcon from "@mui/icons-material/Verified";
import Pusher from "pusher-js";
import Config from "../../../Config";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";

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
    markNotificationsAsRead();
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
        `${Config.backendBaseUrl}getNotifications.php`,
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
      const unreadCount = data.filter(
        (notification) => notification.status === "unread"
      ).length;
      setUnreadNotificationsCount(unreadCount);
    } catch (error) {
      console.error("Error al obtener notificaciones", error);
    }
  };

  const markNotificationsAsRead = async () => {
    try {
      // Enviar una solicitud para marcar las notificaciones como "read"
      const response = await fetch(
        `${Config.backendBaseUrl}markNotificationsAsRead.php`,
        {
          method: "POST",
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error(`Error en la solicitud: ${response.statusText}`);
      }

      // Actualizar el estado local de las notificaciones
      setNotifications((prevNotifications) =>
        prevNotifications.map((notification) => ({
          ...notification,
          status: "read",
        }))
      );

      // Actualizar el recuento de notificaciones no leídas
      setUnreadNotificationsCount(0);
    } catch (error) {
      console.error("Error al marcar las notificaciones como leídas", error);
    }
  };

  const deleteNotification = async () => {
    try {
      // Enviar una solicitud para marcar las notificaciones como "read"
      const response = await fetch(
        `${Config.backendBaseUrl}deleteNotification.php`,
        {
          method: "POST",
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error(`Error en la solicitud: ${response.statusText}`);
      } else {
        getNotifications();
        setIsNotificationsOpen(false);
      }

      // Actualizar el recuento de notificaciones no leídas
      setUnreadNotificationsCount(0);
    } catch (error) {
      console.error("Error al marcar las notificaciones como leídas", error);
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
    fetch(`${Config.backendBaseUrl}getUserInfo.php`, {
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
        `${Config.backendBaseUrl}checkVerification.php`,
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

          <img src={`${Config.imgProfile}${userData.profile_picture}`} alt="" />
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
              <div className="deleteAll">
                <button onClick={deleteNotification}>
                  <DeleteForeverIcon />
                </button>
              </div>

              {notifications.map((notification) => (
                <div key={notification.id}>
                  <p>
                    {notification.content}
                    <small>{notification.created_at}</small>
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Lateral;
