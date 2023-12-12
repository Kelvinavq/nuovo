import "./Style.css";
import HorizontalRuleOutlinedIcon from "@mui/icons-material/HorizontalRuleOutlined";

const Retiros_a = () => {
  return (
    <div className="retiros_admin">
      <div className="title">
        <h2>Solicitudes de Retiro</h2>
      </div>

      <div className="lista_retiros">
        <ul>
          <li>
            <div className="icono">
              <HorizontalRuleOutlinedIcon />
            </div>
          </li>

          <li>
            <h2>Retiro</h2>
            <span>Transferencia</span>
          </li>

          <li>
            <h2>Fecha</h2>
            <span>Nov. 17, 2023</span>
          </li>

          <li className="monto">
            <h2>Monto</h2>
            <span>$500</span>
          </li>

          <li>
            <h2>Usuario</h2>
            <span>Nombre Apellido</span>
          </li>

          <li className="estatus approved">
            <h2>Estatus</h2>
            <span>Completado</span>
          </li>
        </ul>
        <ul>
          <li>
            <div className="icono">
              <HorizontalRuleOutlinedIcon />
            </div>
          </li>

          <li>
            <h2>Retiro</h2>
            <span>Transferencia</span>
          </li>

          <li>
            <h2>Fecha</h2>
            <span>Nov. 17, 2023</span>
          </li>

          <li className="monto">
            <h2>Monto</h2>
            <span>$500</span>
          </li>

          <li>
            <h2>Usuario</h2>
            <span>Nombre Apellido</span>
          </li>

          <li className="estatus pending">
            <h2>Estatus</h2>
            <span>Pendiente</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Retiros_a;
