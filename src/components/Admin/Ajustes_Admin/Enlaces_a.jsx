import { Link, useLocation } from "react-router-dom";
import "./Style.css";


const Enlaces_a = () => {

    const location = useLocation();

    const isActive = (pathname) => {
      return location.pathname === pathname ? "active" : "";
    };

    
  return (
    <div className="enlaces_a">
      <div className="content">
        <div className={`item ${isActive("/admin/ajustes")}`}>
          <Link to="/admin/ajustes">Perfil</Link>
        </div>

        <div className={`item ${isActive("/admin/ajustes/seguridad")}`}>
          <Link to="/admin/ajustes/seguridad">Seguridad</Link>
        </div>
      </div>
    </div>
  )
}

export default Enlaces_a
