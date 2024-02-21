import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import "./Style.css";
import usuarioIcon from "../../../assets/icons/usuario.png";
import NotificationsNoneOutlinedIcon from "@mui/icons-material/NotificationsNoneOutlined";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import HorizontalRuleOutlinedIcon from "@mui/icons-material/HorizontalRuleOutlined";
import Pusher from "pusher-js";
import Config from "../../../Config";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";

const Lateral_a = () => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileDropdownRef = useRef(null);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const notificationsDropdownRef = useRef(null);
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0);
  const [notifications, setNotifications] = useState([]);

  const [userData, setUserData] = useState({});
  const [recentDeposits, setRecentDeposits] = useState([]);
  const [recentWithdrawals, setRecentWithdrawals] = useState([]);

  const toggleProfileDropdown = () => {
    setIsProfileOpen(!isProfileOpen);
  };



  const closeDropdownOutsideClick = (event, dropdownRef, setIsOpen) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setIsOpen(false);
    }
  };

  const toggleNotificationsDropdown = () => {
    setIsNotificationsOpen(!isNotificationsOpen);
    markNotificationsAsRead();
  };
  
  const getNotifications = async () => {
    try {
      const response = await fetch(
        `${Config.backendBaseUrlAdmin}getNotifications.php`,
        {
          method: "GET",
          credentials: "include",
        }
      );

      const data = await response.json();
      if (response.ok) {
        setNotifications(data);
        const unreadCount = data.filter(
          (notification) => notification.status_admin === "unread"
        ).length;
        setUnreadNotificationsCount(unreadCount);
      }
    } catch (error) {
      console.error("Error al obtener notificaciones", error);
    }
  };

  const markNotificationsAsRead = async () => {
    try {
      // Enviar una solicitud para marcar las notificaciones como "read"
      const response = await fetch(
        `${Config.backendBaseUrlAdmin}markNotificationsAsRead.php`,
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

  const getRecentTransactions = async () => {
    try {
      // Obtener los últimos 3 depósitos
      const depositResponse = await fetch(
        `${Config.backendBaseUrlAdmin}getRecentDeposits.php`,
        {
          method: "GET",
          credentials: "include",
        }
      );

      const depositData = await depositResponse.json();
      if (depositResponse.ok) {
        setRecentDeposits(depositData);
      }

      // Obtener los últimos 3 retiros
      const withdrawalResponse = await fetch(
        `${Config.backendBaseUrlAdmin}getRecentWithdrawals.php`,
        {
          method: "GET",
          credentials: "include",
        }
      );

      const withdrawalData = await withdrawalResponse.json();
      if (withdrawalResponse.ok) {
        setRecentWithdrawals(withdrawalData);
      }
    } catch (error) {
      console.error("Error al obtener transacciones recientes", error);
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

    // Obtener información del usuario al cargar el componente
    fetch(`${Config.backendBaseUrlAdmin}getUserInfo.php`, {
      method: "GET",
      credentials: "include",
    })
      .then((response) => response.json())
      .then((data) => setUserData(data))
      .catch((error) =>
        console.error("Error al obtener información del usuario", error)
      );

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

    // Llamada para obtener notificaciones
    getNotifications();

    // Llamada para obtener las últimas transacciones
    getRecentTransactions();

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

  const deleteNotification = async () => {
    try {
      // Enviar una solicitud para marcar las notificaciones como "read"
      const response = await fetch(
        `${Config.backendBaseUrlAdmin}deleteNotification.php`,
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

  return (
    <div className="lateral_a">
      <div className="profile">
        <div className="img">
          <img src={usuarioIcon} alt="" />
          <div className="dropdown" ref={profileDropdownRef}>
            <button onClick={toggleProfileDropdown}>
              <KeyboardArrowDownIcon />
            </button>
            {isProfileOpen && (
              <div className="dropdown-content">
                <Link to={"/admin/ajustes"}>Perfil</Link>
                <Link to={"/admin/ajustes/seguridad"}>Seguridad</Link>
                <Link to={"/admin/ajustes/bancos"}>Bancos</Link>
                <Link to={"/admin/ajustes/plataformas"}>Plataformas</Link>
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
                    {notification.admin_message}
                    <small>{notification.created_at}</small>
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="transacciones">
        <div className="recents">
          <div className="title">
            <h2>Transacciones Recientes</h2>
          </div>
          <div className="date">
            <span>Depósitos</span>
          </div>

          {recentDeposits.length === 0 ? (
            <p>No hay depositos por el momento</p>
          ) : (
            <div className="transacciones">
              {recentDeposits.map((deposit) => (
                <div className="transaccion" key={deposit.id}>
                  <div className="left">
                    <div className="icono depositar">
                      <AddOutlinedIcon />
                    </div>

                    <div className="detalle">
                      <span>
                        {" "}
                        {deposit.type === "deposit" ? "Depósito" : ""}
                      </span>
                      <small>{deposit.transaction_time}</small>
                    </div>
                  </div>
                  <div className="right">
                    <div className="monto">
                      <span>
                        {deposit.amount} <small>USD</small>
                      </span>
                      <p className={`${deposit.status}`}>{deposit.status}</p>
                    </div>
                  </div>
                </div>
              ))}

              {/* <div className="enlace">
                <Link to="/admin/movimientos?tipo=deposit">Ver más</Link>
              </div> */}
            </div>
          )}

          <div className="transacciones">
            <div className="date">
              <span>Retiros</span>
            </div>

            {recentWithdrawals.length === 0 ? (
              <p>No hay retiros por el momento</p>
            ) : (
              <div className="transacciones">
                {recentWithdrawals.map((withdrawal) => (
                  <div className="transaccion" key={withdrawal.id}>
                    <div className="left">
                      <div className="icono retirar">
                        <HorizontalRuleOutlinedIcon />
                      </div>

                      <div className="detalle">
                        <span>
                          {withdrawal.type === "withdrawal" ? "Retiro" : ""}
                        </span>
                        <small>{withdrawal.transaction_time}</small>
                      </div>
                    </div>
                    <div className="right">
                      <div className="monto">
                        <span>
                          {withdrawal.amount} <small>USD</small>
                        </span>
                        <p className={`${withdrawal.status}`}>
                          {withdrawal.status}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}

                {/* <div className="enlace">
                  <Link to="/admin/movimientos?tipo=retiros">Ver más</Link>
                </div> */}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Lateral_a;
