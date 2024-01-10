import React, { useState, useEffect } from "react";
import "./Style.css";
import Saldo from "../Saldo/Saldo";
import Swal from "sweetalert2";

const Depositar = () => {
  const [isUserVerified, setIsUserVerified] = useState(false);
  const [userId, setUserId] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [amount, setAmount] = useState("");
  const [selectedBank, setSelectedBank] = useState(null);
  const [platforms, setPlatforms] = useState([]);
  const [selectedPlatform, setSelectedPlatform] = useState("");
  const [referenceNumber, setReferenceNumber] = useState("");
  const [bankInfo, setBankInfo] = useState(null);
  const [platformInfo, setPlatformInfo] = useState(null);
  const [selectedPlatformInfo, setSelectedPlatformInfo] = useState(null);

  // obtener id del usuario
  useEffect(() => {
    // Lógica para obtener el ID del usuario
    const fetchUserId = async () => {
      const response = await fetch(
        "http://localhost/nuovo/backend/api/getUserId.php",
        {
          method: "GET",
          credentials: "include",
        }
      );

      const data = await response.json();

      if (response.ok) {
        setUserId(data.userId);
      } else {
        console.error("Error al obtener el ID del usuario");
      }
    };

    fetchUserId();
  }, []);

  // verificar estatus del usuario
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

  // obtener lista de plataformas
  useEffect(() => {
    const fetchPlatforms = async () => {
      try {
        const response = await fetch(
          "http://localhost/nuovo/backend/api/getPlatforms.php",
          {
            method: "GET",
            credentials: "include",
          }
        );

        if (response.ok) {
          const data = await response.json();
          setPlatforms(data);
        } else {
          console.error("Error al obtener la lista de plataformas");
        }
      } catch (error) {
        console.error("Error al obtener la lista de plataformas:", error);
      }
    };

    fetchPlatforms();
  }, []);

  const handlePaymentMethodChange = (e) => {
    setPaymentMethod(e.target.value);
    setSelectedBank(null);
    setSelectedPlatform(null);
    setBankInfo(null);

    if (e.target.value === "bank") {
      // Llamar a la función handleBankSelect automáticamente
      handleBankSelect();
    }
  };

  const handleAmountChange = (e) => {
    setAmount(formatAmount(e.target.value));
  };

  const handleBankSelect = async () => {
    // Lógica para obtener información del banco desde el backend
    try {
      // Obtener información del banco desde el backend
      const response = await fetch(
        `http://localhost/nuovo/backend/api/getBankInfo.php?userId=${userId}`,
        {
          method: "GET",
          credentials: "include",
        }
      );
      if (response.ok) {
        const data = await response.json();
        setBankInfo(data);
      } else {
        console.error("Error al obtener la información del banco");
      }
    } catch (error) {
      console.error("Error al obtener la información del banco:", error);
    }
  };

  // En la función handlePlatformSelect
  const handlePlatformSelect = async (e) => {
    const platformId = e.target.value;

    // Lógica para obtener información detallada de la plataforma desde el backend
    try {
      const response = await fetch(
        `http://localhost/nuovo/backend/api/getPlatformInfo.php?platformId=${platformId}`,
        {
          method: "GET",
          credentials: "include",
        }
      );

      if (response.ok) {
        const data = await response.json();
        setPlatformInfo(data);
        setSelectedPlatformInfo(data);
        setSelectedPlatform(data);
      } else {
        console.error("Error al obtener la información de la plataforma");
      }
    } catch (error) {
      console.error("Error al obtener la información de la plataforma:", error);
    }
  };

  const handleReferenceNumberChange = (e) => {
    const value = e.target.value;

    // Puedes agregar cualquier lógica de validación o formateo necesario aquí

    setReferenceNumber(e.target.value);
  };

  const formatAmount = (value) => {
    // Eliminar caracteres no numéricos
    const numericValue = value.replace(/[^\d]/g, "");

    // Formatear con separador de miles y decimales
    const formattedValue = new Intl.NumberFormat("en-US", {
      style: "decimal",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(numericValue / 100); // Dividir por 100 para manejar los dos decimales

    return formattedValue;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validar que el monto sea mayor o igual a 1 dólar
    const numericAmount = parseFloat(amount.replace(/[^\d]/g, ""));
    if (isNaN(numericAmount) || numericAmount < 1) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "El monto debe ser de al menos 1 dólar",
      });
      return;
    }

    // Lógica para enviar la solicitud al backend según el método de pago seleccionado
    try {
      const requestBody = {
        payment_method: paymentMethod,
        user_id: userId,
        amount: amount,
        reference_number: referenceNumber,
      };

      // Agregar el campo selected_platform si el paymentMethod es "platform"
      if (paymentMethod === "platform") {
        requestBody.selected_platform = selectedPlatform['platformName'];
      }

      console.log(requestBody)

      const response = await fetch(
        "http://localhost/nuovo/backend/api/depositRequest.php",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(requestBody),
        }
      );

      const data = await response.json();

      if (response.ok) {
        Swal.fire({
          icon: "success",
          title: "Éxito",
          text: data.message,
          didClose: () => {
            window.location = "/user/dashboard";
          },
        });
      } else {
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
                <label htmlFor="paymentMethod">
                  Seleccione el método de pago
                </label>
                <select
                  name="paymentMethod"
                  id="paymentMethod"
                  value={paymentMethod}
                  onChange={handlePaymentMethodChange}
                >
                  <option value="">Seleccionar método de depósito</option>
                  <option value="bank">Bancos</option>
                  <option value="platform">Plataformas</option>
                  <option value="cash">Efectivo</option>
                </select>
              </div>

              {paymentMethod === "bank" && (
                <>
                  <div className="instrucciones">
                    {bankInfo && (
                      <>
                        <p>Account Name: {bankInfo.account_name}</p>
                        <p>
                          Routing Number (ACH): {bankInfo.routing_number_ach}
                        </p>
                        <p>
                          Routing Number (Wire): {bankInfo.routing_number_wire}
                        </p>
                        <p>Bank Address: {bankInfo.bank_address}</p>
                        <p>Account Number: {bankInfo.account_number}</p>
                        <p>Ref: {bankInfo.ref}</p>
                      </>
                    )}
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
                        onChange={handleAmountChange}
                      />
                      <label htmlFor="">Min. 1 dólar</label>
                    </div>
                  </div>

                  <div className="grupo-input">
                    <label htmlFor="referenceNumber">
                      Número de Referencia
                    </label>
                    <input
                      type="text"
                      id="referenceNumber"
                      name="referenceNumber"
                      value={referenceNumber}
                      onChange={handleReferenceNumberChange}
                    />
                  </div>
                </>
              )}

              {paymentMethod === "platform" && (
                <>
                  <div className="grupo-input">
                    <label htmlFor="selectedPlatform">
                      Seleccione la plataforma
                    </label>
                    <select
                      name="selectedPlatform"
                      id="selectedPlatform"
                      onChange={handlePlatformSelect}
                    >
                      <option value="">Seleccionar plataforma</option>
                      {platforms.map((platform) => (
                        <option key={platform.id} value={platform.id}>
                          {platform.platformName}
                        </option>
                      ))}
                    </select>
                  </div>
                  <br />
                  {selectedPlatformInfo && (
                    <div className="mensaje-plataforma">
                      Envía el dinero a la siguiente dirección:{" "}
                      {selectedPlatformInfo.value}
                    </div>
                  )}

                  <div className="grupo-input monto">
                    <label htmlFor="amount">Ingrese el monto a depositar</label>
                    <div className="input">
                      <span>$</span>
                      <input
                        type="text"
                        id="amount"
                        name="amount"
                        value={amount}
                        onChange={handleAmountChange}
                      />
                      <label htmlFor="">Min. 1 dólar</label>
                    </div>
                  </div>

                  {selectedPlatform && (
                    <>
                      {/* Mostrar información detallada de la plataforma seleccionada */}
                      {/* Lógica para mostrar información de la plataforma desde el backend */}
                    </>
                  )}

                  <div className="grupo-input">
                    <label htmlFor="referenceNumber">
                      Número de referencia
                    </label>
                    <input
                      type="text"
                      id="referenceNumber"
                      name="referenceNumber"
                      value={referenceNumber}
                      onChange={(e) => setReferenceNumber(e.target.value)}
                    />
                  </div>
                </>
              )}

              {paymentMethod === "cash" && (
                <>
                  <div className="grupo-input monto">
                    <label htmlFor="amount">Ingrese el monto a depositar</label>
                    <div className="input">
                      <span>$</span>
                      <input
                        type="text"
                        id="amount"
                        name="amount"
                        value={amount}
                        onChange={handleAmountChange}
                      />
                      <label htmlFor="">Min. 1 dólar</label>
                    </div>
                  </div>
                </>
              )}

              <div className="grupo-submit">
                <input type="submit" value="Enviar Solicitud" />
              </div>
            </form>
          </div>
        ) : (
          <p>
            Debe verificar su cuenta antes de realizar un depósito. Puede
            encontrar información sobre cómo hacerlo en Ajustes - Verificación.
          </p>
        )}
      </div>
    </div>
  );
};

export default Depositar;
