import logotipo from "../../../assets/images/nuovo.png";
import "./Style.css";

import { Link } from "react-router-dom";

const Head = () => {
  return (
    <div className="head">
      <Link to={"/"}>
        <div className="logo">
          <img src={logotipo} alt="nuovotech logo" />
        </div>
      </Link>
      <div className="buttons">
        <button>
          <Link to="/login">Iniciar Sesión</Link>
        </button>
        <button>
          <Link to="/registro">Registrarme</Link>
        </button>
      </div>
    </div>
  );
};

export default Head;
