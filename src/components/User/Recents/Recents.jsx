import "./Style.css";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import HorizontalRuleOutlinedIcon from '@mui/icons-material/HorizontalRuleOutlined';

const Recents = () => {
  return (
    <div className="recents">
      <div className="title">
        <h2>Transacciones Recientes</h2>
      </div>

      <div className="transacciones">
        <div className="date">
          <span>Hoy</span>
        </div>

        <div className="transaccion">
          <div className="left">
            <div className="icono depositar">
              <AddOutlinedIcon />
            </div>

            <div className="detalle">
              <span>Depositar Fondos</span>
              <small>11:55 A.M</small>
            </div>
          </div>
          <div className="right">
            <div className="monto">
              <span>
                500 <small>USD</small>
              </span>
              <p className="pending">Pendiente</p>
            </div>
          </div>
        </div>

        <div className="transaccion">
          <div className="left">
            <div className="icono retirar">
              <HorizontalRuleOutlinedIcon />
            </div>

            <div className="detalle">
              <span>Retirar Fondos</span>
              <small>11:55 A.M</small>
            </div>
          </div>
          <div className="right">
            <div className="monto">
              <span>
                500 <small>USD</small>
              </span>
              <p className="completed">Completada</p>
            </div>
          </div>
        </div>
      </div>
      <div className="transacciones">
        <div className="date">
          <span>Ayer</span>
        </div>

        <div className="transaccion">
          <div className="left">
            <div className="icono depositar">
              <AddOutlinedIcon />
            </div>

            <div className="detalle">
              <span>Depositar Fondos</span>
              <small>11:55 A.M</small>
            </div>
          </div>
          <div className="right">
            <div className="monto">
              <span>
                500 <small>USD</small>
              </span>
              <p className="pending">Pendiente</p>
            </div>
          </div>
        </div>

        <div className="transaccion">
          <div className="left">
            <div className="icono retirar">
              <HorizontalRuleOutlinedIcon />
            </div>

            <div className="detalle">
              <span>Retirar Fondos</span>
              <small>11:55 A.M</small>
            </div>
          </div>
          <div className="right">
            <div className="monto">
              <span>
                500 <small>USD</small>
              </span>
              <p className="completed">Completada</p>
            </div>
          </div>
        </div>
        <div className="transaccion">
          <div className="left">
            <div className="icono retirar">
              <HorizontalRuleOutlinedIcon />
            </div>

            <div className="detalle">
              <span>Retirar Fondos</span>
              <small>11:55 A.M</small>
            </div>
          </div>
          <div className="right">
            <div className="monto">
              <span>
                500 <small>USD</small>
              </span>
              <p className="completed">Completada</p>
            </div>
          </div>
        </div>
 
      </div>
    </div>
  );
};

export default Recents;
