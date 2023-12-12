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
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const profileDropdownRef = useRef(null);
  const notificationsDropdownRef = useRef(null);

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

  useEffect(() => {
    const closeProfileDropdownOutsideClick = (event) => {
      closeDropdownOutsideClick(event, profileDropdownRef, setIsProfileOpen);
    };

    const closeNotificationsDropdownOutsideClick = (event) => {
      closeDropdownOutsideClick(event, notificationsDropdownRef, setIsNotificationsOpen);
    };

    document.addEventListener("mousedown", closeProfileDropdownOutsideClick);
    document.addEventListener("mousedown", closeNotificationsDropdownOutsideClick);

    return () => {
      document.removeEventListener("mousedown", closeProfileDropdownOutsideClick);
      document.removeEventListener("mousedown", closeNotificationsDropdownOutsideClick);
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
          <p>Nombre Apellido</p>
        </div>

         <div className="notification">
         <button onClick={toggleNotificationsDropdown}>
            <NotificationsNoneOutlinedIcon />
          </button>
          {isNotificationsOpen && (
            <div className="dropdown-content" ref={notificationsDropdownRef}>
              {/* Contenido del dropdown de notificaciones */}
              <p>Contenido de notificaciones...</p>
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
