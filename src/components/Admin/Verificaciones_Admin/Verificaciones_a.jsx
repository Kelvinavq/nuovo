import "./Style.css";

const Verificaciones_a = () => {
  return (
    <div className="verificaciones_admin">
      <div className="title">
        <h2>Solicitudes de Verificación</h2>
      </div>

      <div className="lista_verificaciones">
        <ul>
          <li>
            <div className="icono">N</div>
          </li>

          <li>
            <h2>Usuario</h2>
            <span>Nombre Apellido</span>
          </li>

          <li>
            <h2>Fecha Solicitud</h2>
            <span>Nov. 17, 2023</span>
          </li>

          <li >
            <h2>Fecha Registro</h2>
            <span>Nov. 17, 2023</span>
          </li>


          <li className="estatus approved">
            <h2>Estatus</h2>
            <span>Verificado</span>
          </li>
        </ul>
        <ul>
          <li>
            <div className="icono">N</div>
          </li>

          <li>
            <h2>Usuario</h2>
            <span>Nombre Apellido</span>
          </li>

          <li>
            <h2>Fecha Solicitud</h2>
            <span>Nov. 17, 2023</span>
          </li>

          <li >
            <h2>Fecha Registro</h2>
            <span>Nov. 17, 2023</span>
          </li>


          <li className="estatus approved">
            <h2>Estatus</h2>
            <span>Verificado</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Verificaciones_a;
