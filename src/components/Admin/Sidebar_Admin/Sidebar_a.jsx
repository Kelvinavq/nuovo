import { Link, useLocation } from "react-router-dom";
import "./Style.css";

import InicioIcon from "../../../assets/icons/Home.svg";
import DepositoIcon from "../../../assets/icons/Depositos.svg";
import RetirosIcon from "../../../assets/icons/Retiros.svg";
import VerificacionIcon from "../../../assets/icons/Verificacion.svg";
import AjustesIcon from "../../../assets/icons/Ajustes.svg";
import LogoutIcon from "../../../assets/icons/Logout.svg";

const Sidebar_a = () => {
  const location = useLocation();

  const isActive = (pathname) => {
    return location.pathname === pathname ? "active" : "";
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
        <div className={`item i-ajustes ${isActive("/admin/ajustes")} ${isActive("/admin/ajustes/seguridad")} `}>
          <div className="icon">
            <Link to="/admin/ajustes">
              <img src={AjustesIcon} alt="" />
            </Link>
          </div>
        </div>
        <div className="item">
          <div className="icon">
            <Link>
              <img src={LogoutIcon} alt="" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar_a;
