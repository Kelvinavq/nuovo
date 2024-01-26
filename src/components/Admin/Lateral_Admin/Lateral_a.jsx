import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import "./Style.css";
import usuarioIcon from "../../../assets/icons/usuario.png";
import NotificationsNoneOutlinedIcon from "@mui/icons-material/NotificationsNoneOutlined";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import HorizontalRuleOutlinedIcon from "@mui/icons-material/HorizontalRuleOutlined";

const Lateral_a = () => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileDropdownRef = useRef(null);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const notificationsDropdownRef = useRef(null);

  const [userData, setUserData] = useState({});
  const [notifications, setNotifications] = useState([]);
  const [recentDeposits, setRecentDeposits] = useState([]);
  const [recentWithdrawals, setRecentWithdrawals] = useState([]);

  const toggleProfileDropdown = () => {
    setIsProfileOpen(!isProfileOpen);
  };

  const toggleNotificationsDropdown = () => {
    setIsNotificationsOpen(!isNotificationsOpen);
  };

  const closeDropdownOutsideClick = (event, dropdownRef, setIsOpen) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
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

      const data = await response.json();
      if (response.ok) {
        setNotifications(data);
      }
    } catch (error) {
      console.error("Error al obtener notificaciones", error);
    }
  };

  const getRecentTransactions = async () => {
    try {
      // Obtener los últimos 3 depósitos
      const depositResponse = await fetch(
        "http://localhost/nuovo/backend/Api/admin/getRecentDeposits.php",
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
        "http://localhost/nuovo/backend/Api/admin/getRecentWithdrawals.php",
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
    // Obtener información del usuario al cargar el componente
    fetch("http://localhost/nuovo/backend/Api/admin/getUserInfo.php", {
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
                <Link>Perfil</Link>
                <Link>Verificación</Link>
                <Link>Seguridad</Link>
                <Link>Ajustes</Link>
              </div>
            )}
          </div>
          <p>{userData.name}</p>
        </div>

        <div className="notification">
          <button onClick={toggleNotificationsDropdown}>
            <NotificationsNoneOutlinedIcon />
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

      <div className="transacciones">
        <div className="recents">
          <div className="title">
            <h2>Transacciones Recientes</h2>
          </div>

          <div className="transacciones">
            <div className="date">
              <span>Depósitos</span>
            </div>

            {recentDeposits.map((deposit) => (
              <div className="transaccion" key={deposit.id}>
                <div className="left">
                  <div className="icono depositar">
                    <AddOutlinedIcon />
                  </div>

                  <div className="detalle">
                    <span> {deposit.type === "deposit" ? "Depósito" : ""}</span>
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

            <div className="enlace">
              <Link to="/admin/movimientos?tipo=depositos">Ver más</Link>
            </div>
          </div>

          <div className="transacciones">
            <div className="date">
              <span>Retiros</span>
            </div>

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

            <div className="enlace">
              <Link to="/admin/movimientos?tipo=retiros">Ver más</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Lateral_a;
