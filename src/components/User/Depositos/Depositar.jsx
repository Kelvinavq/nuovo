import React, { useState, useEffect } from "react";
import "./Style.css";
import Saldo from "../Saldo/Saldo";
import Swal from "sweetalert2";

const Depositar = () => {
  const [payment_method, setpayment_method] = useState("transferencia");
  const [amount, setAmount] = useState("");

  const [isUserVerified, setIsUserVerified] = useState(false);

  useEffect(() => {
    const checkVerification = async () => {
      const response = await fetch(
        "http://localhost/nuovo/backend/api/checkVerification.php",
        {
          method: "GET",
          credentials: "include",
        }
      );

      const data = await response.json();
      if (response.ok) {
        setIsUserVerified(data.status);
      }
    };
    
    checkVerification();
  }, []);


  const handleMedioChange = (e) => {
    setpayment_method(e.target.value);
  };

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

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validar que el monto sea mayor o igual a 1 dólar
    if (parseFloat(amount) < 1) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "El monto debe ser de al menos 1 dólar",
      });
      return;
    }

    function refreshPage() {
      window.location.reload(false);
    }

    // Enviar la solicitud al backend
    try {
      const response = await fetch(
        "http://localhost/nuovo/backend/api/depositRequest.php",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            payment_method,
            amount,
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
          didClose: () => {
            refreshPage();
          },
        });
      } else {
        // Procesar la respuesta de error
        Swal.fire({
          icon: "error",
          title: "Error",
          text:
            data.error || "Hubo un error al procesar la solicitud de depósito",
        });
      }
    } catch (error) {
      console.error("Error al enviar la solicitud de depósito:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Error inesperado al enviar la solicitud de depósito",
      });
    }
  };

  return (
    <div className="depositar">
      <Saldo />

      <div className="content">
        <h2>Depositar</h2>

        {isUserVerified === "approved" ? (
          
          <div className="form">
            <form onSubmit={handleSubmit}>
              <div className="grupo-input">
                <label htmlFor="payment_method">
                  Seleccione el medio de pago 
                </label>
                <select
                  name="payment_method"
                  id="payment_method"
                  value={payment_method}
                  onChange={handleMedioChange}
                >
                  <option value="transferencia">Transferencia</option>
                </select>
              </div>

              <div className="grupo-input monto">
                <label htmlFor="amount">Ingrese el monto a depositar</label>
                <div className="input">
                  <span>$</span>
                  <input
                    type="text"
                    id="amount"
                    name="amount"
                    value={amount}
                    onChange={handleMontoChange}
                  />
                  <label htmlFor="">Min. 1 dólar</label>
                </div>
              </div>

              <div className="grupo-submit">
                <input type="submit" value="Enviar Solicitud" />
              </div>
            </form>
          </div>
        ) : (
          <p>
            {isUserVerified}
            Debe verificar su cuenta antes de realizar un depósito. Puede
            encontrar información sobre cómo hacerlo en su perfil.
          </p>
        )}
      </div>
    </div>
  );
};

export default Depositar;
