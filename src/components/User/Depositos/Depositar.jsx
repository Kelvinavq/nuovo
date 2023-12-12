import React, { useState } from "react";
import "./Style.css"
import Saldo from "../Saldo/Saldo";
import Swal from "sweetalert2";
 
const Depositar = () => {

  const [payment_method, setpayment_method] = useState("transferencia");
  const [amount, setAmount] = useState("");

  const handleMedioChange = (e) => {
    setpayment_method(e.target.value);
  };

  const handleMontoChange = (e) => {
    setAmount(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {

      const csrfToken = document.querySelector(
        'meta[name="csrf-token"]'
      ).content;

      const response = await fetch("http://127.0.0.1:8000/depositar", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
           "X-CSRF-TOKEN": csrfToken,
        },
        body: JSON.stringify({ payment_method, amount }),
      });

      if (response.ok) {
        // La solicitud fue exitosa, mostrar una alerta de éxito
        Swal.fire({
          icon: "success",
          title: "¡Solicitud enviada!",
          text:"Tu solicitud de depósito se envió con éxito.",
        });
      } else {
        // La solicitud falló, mostrar una alerta de error
        Swal.fire({
          icon: "error",
          title: "Error",
          text:"Hubo un problema al enviar la solicitud de depósito.",
        });
      }
    } catch (error) {
      console.error("Error al enviar la solicitud de depósito", error);
      // Mostrar una alerta de error en caso de un error inesperado

      Swal.fire({
        icon: "error",
        title: "Error",
        text:"Hubo un error inesperado al enviar la solicitud de depósito.",
      });
    }
  };

return (
    <div className="depositar">
      <Saldo />

      <div className="content">
        <h2>Depositar</h2>

        <div className="form">
          <form onSubmit={handleSubmit}>
            <div className="grupo-input">
              <label htmlFor="payment_method">Seleccione el medio de pago</label>
              <select name="payment_method" id="payment_method" value={payment_method} onChange={handleMedioChange}>
                <option value="transferencia">Transferencia</option>
              </select>
            </div>

            <div className="grupo-input monto">
              <label htmlFor="amount">Ingrese el monto a depositar</label>
              <div className="input">
                <span>$</span>
                <input type="text" id="amount" name="amount" value={amount} onChange={handleMontoChange} />
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

export default Depositar;
