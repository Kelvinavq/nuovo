import { Link, useLocation } from "react-router-dom";
import "./Style.css";

import InicioIcon from "../../../assets/icons/Home.svg";
import DepositoIcon from "../../../assets/icons/Depositos.svg";
import RetirosIcon from "../../../assets/icons/Retiros.svg";
import VerificacionIcon from "../../../assets/icons/Verificacion.svg";
import AjustesIcon from "../../../assets/icons/Ajustes.svg";
import UserIcon from "../../../assets/icons/user-line.svg";
import LogoutIcon from "../../../assets/icons/Logout.svg";

const Sidebar_a = () => {
  const location = useLocation();

  const isActive = (pathname) => {
    return location.pathname === pathname ? "active" : "";
  };

  const handleLogout = async () => {
    try {
      const response = await fetch("http://localhost/nuovo/backend/api/logout.php", {
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
    <div className="sidebar">
      <div className="items">
        <div className={`item i-dashboard ${isActive("/admin/dashboard")}`}>
          <div className="icon">
            <Link to="/admin/dashboard">
              <img src={InicioIcon} alt="" />
            </Link>
          </div>
        </div>
        <div className={`item i-retirar ${isActive("/admin/retiros")}`}>
          <div className="icon">
            <Link to="/admin/retiros">
              <img src={RetirosIcon} alt="" />
            </Link>
          </div>
        </div>
        <div className={`item i-depositar ${isActive("/admin/depositos")}`}>
          <div className="icon">
            <Link to="/admin/depositos">
              <img src={DepositoIcon} alt="" />
            </Link>
          </div>
        </div>
        <div
          className={`item i-verificacion ${isActive("/admin/verificaciones")} ${isActive("/admin/verificacion")}`}
        >
          <div className="icon">
            <Link to="/admin/verificaciones">
              <img src={VerificacionIcon} alt="" />
            </Link>
          </div>
        </div>
        <div
          className={`item i-usuarios ${isActive("/admin/usuarios")}`}
        >
          <div className="icon">
            <Link to="/admin/usuarios">
              <img src={UserIcon} alt="" />
            </Link>
          </div>
        </div>
        <div className={`item i-ajustes ${isActive("/admin/ajustes")} ${isActive("/admin/ajustes/seguridad")} ${isActive("/admin/ajustes/bancos")} ${isActive("/admin/ajustes/plataformas")}`}>
          <div className="icon">
            <Link to="/admin/ajustes">
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

export default Sidebar_a;
