import React from "react";
import { Link, useLocation } from "react-router-dom";
import "./Style.css";

import InicioIcon from "../../../assets/icons/Home.svg";
import DepositoIcon from "../../../assets/icons/Depositos.svg";
import RetirosIcon from "../../../assets/icons/Retiros.svg";
import AjustesIcon from "../../../assets/icons/Ajustes.svg";
import LogoutIcon from "../../../assets/icons/Logout.svg";
import Config from "../../../Config";

const Sidebar = () => {
  const location = useLocation();

  const isActive = (pathname) => {
    return location.pathname === pathname ? "active" : "";
  };

  const handleLogout = async () => {
    try {
      const response = await fetch(`${Config.backendBaseUrl}logout.php`, {
        method: "POST",
        mode: "cors",
        credentials: "include",
      });
  
      if (response.ok) {
        // Elimina la información de la sesión del almacenamiento local
        sessionStorage.removeItem('user_role');
        sessionStorage.removeItem('user_id');
  
        // Redirige al usuario a la página de inicio de sesión
        window.location.href = '/login';
      } else {
        // Maneja errores si es necesario
        console.error("Error al cerrar sesión");
      }
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  return (
    <div className="sidebar" >
      <div className="items">
        <div className={`item i-dashboard ${isActive("/user/dashboard")}  ${isActive("/user/movimientos")}`}>
          <div className="icon">
            <Link to="/user/dashboard">
              <img src={InicioIcon} alt="" />
            </Link>
          </div>
        </div>
        <div className={`item i-retirar ${isActive("/user/retirar")}`}>
          <div className="icon">
            <Link to="/user/retirar">
              <img src={RetirosIcon} alt="" />
            </Link>
          </div>
        </div>
        <div className={`item i-depositar ${isActive("/user/depositar")}`}>
          <div className="icon">
            <Link to="/user/depositar">
              <img src={DepositoIcon} alt="" />
            </Link>
          </div>
        </div>
        <div
          className={`item i-ajustes ${isActive(
            "/user/ajustes/perfil"
          )} ${isActive("/user/ajustes/verificacion")} ${isActive(
            "/user/ajustes/seguridad" 
          )} ${isActive(
            "/user/ajustes/plataformas" 
          )}`}
        >
          <div className="icon">
            <Link to="/user/ajustes/perfil">
              <img src={AjustesIcon} alt="" />
            </Link>
          </div>
        </div>
        <div className="item">
          <div className="icon">
            <button onClick={handleLogout}>
              <img src={LogoutIcon} alt="" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
