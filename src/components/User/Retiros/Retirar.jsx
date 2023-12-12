import React, { useState } from "react";
import "./Style.css";
import Saldo from "../Saldo/Saldo";
import Swal from "sweetalert2";

const Retirar = () => {
  const [payment_method, setpayment_method] = useState("transferencia");
  const [amount, setAmount] = useState("");
  const [cbu, setCbu] = useState("");

  const handleMontoChange = (e) => {
    let value = e.target.value;

    // Reemplazar cualquier caracter que no sea número o punto decimal con una cadena vacía
    value = value.replace(/[^0-9.]/g, "");

    // Formatear con separadores de miles
    value = value.replace(/\B(?=(\d{3})+(?!\d))/g, ",");

    // Solo permitir un punto decimal
    const decimalIndex = value.indexOf(".");
    if (decimalIndex !== -1) {
      value =
        value.slice(0, decimalIndex + 1) +
        value.slice(decimalIndex + 1).replace(/\./g, "");
    }

    // Establecer el valor en el estado
    setAmount(value);
  };

  const handleCbuChange = (e) => {
    let value = e.target.value;

    // Reemplazar cualquier caracter que no sea número o punto decimal con una cadena vacía
    value = value.replace(/[^0-9.]/g, "");
    setCbu(value);
  };

  function refreshPage() {
    window.location.reload(false);
  }

  const handleWithdrawalRequest = async (e) => {
    e.preventDefault();

    // Validar que el monto sea mayor a cero
    if (amount <= 0) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "El monto de retiro debe ser mayor a cero",
      });
      return;
    }

    // Validar que el CBU no esté vacío
    if (!cbu) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Debes ingresar un número de CBU válido",
      });
      return;
    }

    // Enviar la solicitud de retiro al backend
    try {
      const response = await fetch(
        "http://localhost/nuovo/backend/api/withdrawalRequest.php",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            payment_method,
            amount,
            cbu,
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        // Procesar la respuesta exitosa
        Swal.fire({
          icon: "success",
          title: "Éxito",
          text: data.message,
          didClose: () =>{
            refreshPage() 
          }
        }); 

      } else {
        // Procesar la respuesta de error
        Swal.fire({
          icon: "error",
          title: "Error",
          text:
            data.error || "Hubo un error al procesar la solicitud de retiro",
        });
      }
    } catch (error) {
      console.error("Error al enviar la solicitud de retiro:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Error inesperado al enviar la solicitud de retiro",
      });
    }
  };

  return (
    <div className="retirar">
      <Saldo />

      <div className="content">
        <h2>Retirar</h2>

        <div className="form">
          <form action=" " onSubmit={handleWithdrawalRequest}>
            <div className="grupo-input">
              <label htmlFor="medio">Seleccione el medio de pago</label>
              <select
                name="medio"
                id="medio"
                value={payment_method}
                onChange={(e) => setpayment_method(e.target.value)}
              >
                <option value="transferencia">Transferencia</option>
                <option value="efectivo">Efectivo</option>
              </select>
            </div>

            <div className="grupo-input">
              <label htmlFor="cbu">CBU</label>
              <input
                type="text"
                name="cbu"
                id="cbu"
                value={cbu}
                onChange={handleCbuChange}
              />
            </div>

            <div className="grupo-input monto">
              <label htmlFor="monto">Ingrese el monto a retirar</label>
              <div className="input">
                <span>$</span>
                <input
                  type="text"
                  id="monto"
                  name="monto"
                  value={amount}
                  onChange={handleMontoChange}
                />
                <label htmlFor="">Min. 1 dólar</label>
              </div>
            </div>

            <div className="grupo-submit">
              <input type="submit" value="Enviar Solicitud"  />
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Retirar;
