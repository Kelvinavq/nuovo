import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import NotificationsNoneOutlinedIcon from "@mui/icons-material/NotificationsNoneOutlined";
import Pusher from "pusher-js";
import "./Style.css"

const Notification_a = () => {
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const notificationsDropdownRef = useRef(null);
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0);
  const [notifications, setNotifications] = useState([]);

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
        "http://localhost/nuovo/backend/Api/admin/getNotifications.php",
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
        "http://localhost/nuovo/backend/Api/admin/markNotificationsAsRead.php",
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

    const closeNotificationsDropdownOutsideClick = (event) => {
      closeDropdownOutsideClick(
        event,
        notificationsDropdownRef,
        setIsNotificationsOpen
      );
    };

    return () => {
      document.removeEventListener(
        "mousedown",
        closeNotificationsDropdownOutsideClick
      );
    };
  }, []);

  return (
    <div>
        <div className="notification float">
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
                <div key={notification.id}>
                  <p>
                    {notification.admin_message}
                    <small>{notification.created_at}</small>
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
    </div>
  )
}

export default Notification_a
