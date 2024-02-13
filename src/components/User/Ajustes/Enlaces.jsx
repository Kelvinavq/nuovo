import { Link, useLocation } from "react-router-dom";
import { useContext } from "react";
import "./Style.css";
import { LanguageContext } from "../../../Language/LanguageContext";
import { Translation } from "./Translation";

const Enlaces = () => {
  const { language } = useContext(LanguageContext);

  const location = useLocation();

  const isActive = (pathname) => {
    return location.pathname === pathname ? "active" : "";
  };

  return (
    // 
    <div className="enlaces_ajustes">
      <div className="content">
        <div className={`item ${isActive("/user/ajustes/perfil")}`}>
          <Link to="/user/ajustes/perfil">{Translation[language].link1}</Link>
        </div>
        <div className={`item ${isActive("/user/ajustes/verificacion")}`}>
          <Link to="/user/ajustes/verificacion">{Translation[language].link2}</Link>
        </div>
        <div className={`item ${isActive("/user/ajustes/seguridad")}`}>
          <Link to="/user/ajustes/seguridad">{Translation[language].link3}</Link>
        </div>
        <div className={`item ${isActive("/user/ajustes/plataformas")}`}>
          <Link to="/user/ajustes/plataformas">{Translation[language].link4}</Link>
        </div>
        
      </div>
    </div>
  );
};

export default Enlaces;
