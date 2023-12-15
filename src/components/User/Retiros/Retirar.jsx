import React, { useState, useEffect } from "react";
import "./Style.css";
import Saldo from "../Saldo/Saldo";
import Swal from "sweetalert2";

const Retirar = () => {
  const [payment_method, setpayment_method] = useState("transferencia");
  const [amount, setAmount] = useState("");
  const [cbu, setCbu] = useState("");

  const [isUserVerified, setIsUserVerified] = useState(false);

  useEffect(() => {
    // Ejemplo ficticio:
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

  const handleMontoChange = (e) => {
    let value = e.target.value;
  
    // Permitir solo números
    value = value.replace(/[^0-9]/g, "");
  
    // Insertar un punto cada dos dígitos
    value = value
    .replace(/\D/g, "") // Reemplaza los caracteres que no sean números con una cadena vacía
    .replace(/([0-9])([0-9]{2})$/, "$1,$2") // Reemplaza los dos últimos dígitos con una coma
    .replace(/\B(?=(\d{3})+(?!\d)\.?)/g, ".");// Reemplaza los caracteres de punto y coma que estén entre tres dígitos
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

        {isUserVerified === "approved" ? (
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
                <input type="submit" value="Enviar Solicitud" />
              </div>
            </form>
          </div>
        ) : (
          <p>
            Debe verificar su cuenta antes de realizar un retiro. Puede
            encontrar información sobre cómo hacerlo en su perfil.
          </p>
        )}
      </div>
    </div>
  );
};

export default Retirar;
