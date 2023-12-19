import { useState, useEffect, useRef } from "react";
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
        "http://localhost/nuovo/backend/api/getNotifications.php",
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

  useEffect(() => {
    // Obtener información del usuario al cargar el componente
    fetch("http://localhost/nuovo/backend/api/admin/getUserInfo.php", {
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
    getNotifications();
  }, []);

  // manejo de notificaciones

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
              <span>Depositos</span>
            </div>

            <div className="transaccion">
              <div className="left">
                <div className="icono depositar">
                  <AddOutlinedIcon />
                </div>

                <div className="detalle">
                  <span>Depositar Fondos</span>
                  <small>11:55 A.M</small>
                </div>
              </div>
              <div className="right">
                <div className="monto">
                  <span>
                    500 <small>USD</small>
                  </span>
                  <p className="pending">Pendiente</p>
                </div>
              </div>
            </div>
            <div className="transaccion">
              <div className="left">
                <div className="icono depositar">
                  <AddOutlinedIcon />
                </div>

                <div className="detalle">
                  <span>Depositar Fondos</span>
                  <small>11:55 A.M</small>
                </div>
              </div>
              <div className="right">
                <div className="monto">
                  <span>
                    500 <small>USD</small>
                  </span>
                  <p className="pending">Pendiente</p>
                </div>
              </div>
            </div>
            <div className="transaccion">
              <div className="left">
                <div className="icono depositar">
                  <AddOutlinedIcon />
                </div>

                <div className="detalle">
                  <span>Depositar Fondos</span>
                  <small>11:55 A.M</small>
                </div>
              </div>
              <div className="right">
                <div className="monto">
                  <span>
                    500 <small>USD</small>
                  </span>
                  <p className="pending">Pendiente</p>
                </div>
              </div>
            </div>

            <div className="enlace">
              <Link>Ver más</Link>
            </div>
          </div>
          <div className="transacciones">
            <div className="date">
              <span>Retiros</span>
            </div>

            <div className="transaccion">
              <div className="left">
                <div className="icono retirar">
                  <HorizontalRuleOutlinedIcon />
                </div>

                <div className="detalle">
                  <span>Retirar Fondos</span>
                  <small>11:55 A.M</small>
                </div>
              </div>
              <div className="right">
                <div className="monto">
                  <span>
                    500 <small>USD</small>
                  </span>
                  <p className="completed">Completada</p>
                </div>
              </div>
            </div>
            <div className="transaccion">
              <div className="left">
                <div className="icono retirar">
                  <HorizontalRuleOutlinedIcon />
                </div>

                <div className="detalle">
                  <span>Retirar Fondos</span>
                  <small>11:55 A.M</small>
                </div>
              </div>
              <div className="right">
                <div className="monto">
                  <span>
                    500 <small>USD</small>
                  </span>
                  <p className="completed">Completada</p>
                </div>
              </div>
            </div>
            <div className="transaccion">
              <div className="left">
                <div className="icono retirar">
                  <HorizontalRuleOutlinedIcon />
                </div>

                <div className="detalle">
                  <span>Retirar Fondos</span>
                  <small>11:55 A.M</small>
                </div>
              </div>
              <div className="right">
                <div className="monto">
                  <span>
                    500 <small>USD</small>
                  </span>
                  <p className="completed">Completada</p>
                </div>
              </div>
            </div>
            <div className="enlace">
              <Link>Ver más</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Lateral_a;
