import "./Style.css";
import { Link } from "react-router-dom";
import dni from "../../../assets/images/dni.png";
import selfie from "../../../assets/images/selfie.jpg";

const Verificacion_a = () => {
  return (
    <div>
      <div className="title">
        <h2>Solicitud de Verificación</h2>
        <h4>Nombre Apellido</h4>
      </div>

      <div className="info_usuario">
        <div className="left">
          <h2>Datos del usuario</h2>

          <div>
            <span>Nombre del usuario</span>
            <p>Nombre Apellido</p>
          </div>

          <div>
            <span>Teléfono</span>
            <p>+54 9 0000 0000</p>
          </div>

          <div>
            <span>Correo electrónico</span>
            <p>usuario@gmail.com</p>
          </div>

          <div>
            <span>Dirección</span>
            <p>Buenos Aires, Argentina</p>
          </div>

       
        </div>

        <div className="right">
          <h2>Identificación del usuario</h2>
          <img src={dni} alt="dni usuario" />

          <h2>Selfie del usuario</h2>
          <img src={selfie} alt="dni usuario" />

          <div className="buttons">
            <button><Link>Verificar</Link></button>
            <button><Link>Rechazar</Link></button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Verificacion_a;
