import { Link, useLocation } from "react-router-dom";
import "./Style.css";

const Enlaces = () => {
  const location = useLocation();

  const isActive = (pathname) => {
    return location.pathname === pathname ? "active" : "";
  };

  return (
    <div className="enlaces_ajustes">
      <div className="content">
        <div className={`item ${isActive("/user/ajustes/perfil")}`}>
          <Link to="/user/ajustes/perfil">Perfil</Link>
        </div>
        <div className={`item ${isActive("/user/ajustes/verificacion")}`}>
          <Link to="/user/ajustes/verificacion">Verificación</Link>
        </div>
        <div className={`item ${isActive("/user/ajustes/seguridad")}`}>
          <Link to="/user/ajustes/seguridad">Seguridad</Link>
        </div>
      </div>
    </div>
  );
};

export default Enlaces;
