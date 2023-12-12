import Saldo from "../Saldo/Saldo";
import "./Style.css";

const Retirar = () => {
  return (
    <div className="retirar">
      <Saldo />

      <div className="content">
        <h2>Retirar</h2>

        <div className="form">
          <form action="">
            <div className="grupo-input">
              <label htmlFor="medio">Seleccione el medio de pago</label>
              <select name="medio" id="medio">
                <option value="transferencia">Transferencia</option>
                <option value="efectivo">Efectivo</option>
              </select>
            </div>

            <div className="grupo-input">
              <label htmlFor="cbu">CBU</label>
              <input type="text" name="cbu" id="cbu" />
            </div>

            <div className="grupo-input monto">
              <label htmlFor="monto">Ingrese el monto a retirar</label>
              <div className="input">
                <span>$</span>
                <input type="text" id="monto" name="monto" />
                <label htmlFor="">Min. 1 dólar</label>
              </div>
            </div>

            <div className="grupo-submit">
              <input type="submit" value="Enviar Solicitud" />
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Retirar;
