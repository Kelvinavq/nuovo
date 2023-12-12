import "./Style.css";
import logotipo from "../../../assets/images/nuovo.png";
import { Link } from "react-router-dom";

const CallToAction = () => {
  return (
    <div className="container calltoaction">
      <div className="content">
        <img src={logotipo} alt="logotipo nuovotech" />

        <p>
          ¡Unite a la revolución financiera con <strong>Nuovo</strong>!
          Registrate hoy mismo para descubrir la comodidad de gestionar tu
          dinero de forma inteligente. Desde depósitos sin complicaciones hasta
          servicios personalizados, <strong>Nuovo</strong> te ofrece una experiencia
          financiera moderna y segura. ¡No te pierdas la oportunidad de tomar el
          control de tu futuro financiero! Hacé clic para comenzar ahora.
        </p>

        <button>
          <Link to="/registro">Unite ahora</Link>
        </button>
      </div>
    </div>
  );
};

export default CallToAction;
