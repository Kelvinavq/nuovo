import React, { useState, useEffect } from "react";
import Enlaces_a from "./Enlaces_a";
import Swal from "sweetalert2";
import Config from "../../../Config";

const Bancos_a = () => {
  const [nuevaCuenta, setNuevaCuenta] = useState({
    accountName: "",
    routingNumberACH: "",
    routingNumberWire: "",
    bankAddress: "",
    bankAddressNuovo: "",
  });

  const [cuentasBanco, setCuentasBanco] = useState([]);
  const [cuentaSeleccionada, setCuentaSeleccionada] = useState("");
  const [detalleCuenta, setDetalleCuenta] = useState({
    account_name: "",
    routing_number_ach: "",
    routing_number_wire: "",
    bank_address_nuovo: "",
    bank_address: "",
    registros: 0,
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNuevaCuenta((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const [isModalOpen, setIsModalOpen] = useState(false);

  const abrirModalNuevaCuenta = () => {
    setIsModalOpen(true);
  };

  const cerrarModalNuevaCuenta = () => {
    setIsModalOpen(false);
  };

  const cargarCuentasBanco = async () => {
    try {
      const response = await fetch(
        `${Config.backendBaseUrlAdmin}getBankAccounts.php`,
        {
          method: "GET",
          mode: "cors",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setCuentasBanco(data);
      } else {
        console.error("Error al obtener la lista de cuentas de banco");
      }
    } catch (error) {
      console.error("Error al obtener la lista de cuentas de banco:", error);
    }
  };

  useEffect(() => {
    cargarCuentasBanco();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !nuevaCuenta.accountName ||
      !nuevaCuenta.routingNumberACH ||
      !nuevaCuenta.routingNumberWire ||
      !nuevaCuenta.bankAddress ||
      !nuevaCuenta.bankAddressNuovo
    ) {
      Swal.fire({
        title: "Campos Vacíos",
        text: "Por favor, completa todos los campos",
        icon: "warning",
      });
      return;
    }

    try {
      const response = await fetch(
        `${Config.backendBaseUrlAdmin}createBank.php`,
        {
          method: "POST",
          mode: "cors",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(nuevaCuenta),
        }
      );

      const responseData = await response.json();

      if (response.ok) {
        Swal.fire({
          title: "Cuenta de banco creada con éxito",
          icon: "success",
          timer: 2000,
          didClose: () => {
            window.location.reload();
          },
        });
      } else {
        Swal.fire({
          title: "Error al crear la cuenta de banco",
          text: "Por favor, inténtalo de nuevo",
          icon: "error",
        });
        console.error("Error al crear la cuenta de banco:", responseData.error);
      }
    } catch (error) {
      console.error("Error de red al crear la cuenta de banco:", error);
    }
  };

  const handleSelectChange = async (e) => {
    const selectedAccount = e.target.value;

    try {
      const response = await fetch(
        `${Config.backendBaseUrlAdmin}getBankAccountDetails.php?id=${selectedAccount}`,
        {
          method: "GET",
          mode: "cors",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setDetalleCuenta(data);
      } else {
        console.error("Error al obtener los detalles de la cuenta de banco");
      }
    } catch (error) {
      console.error(
        "Error al obtener los detalles de la cuenta de banco:",
        error
      );
    }

    setCuentaSeleccionada(selectedAccount);
  };

  return (
    <div className="bancos_a">
      <div className="content">
        <div className="title">
          <h2>Bancos</h2>
          <button className="btns" onClick={abrirModalNuevaCuenta}>
            Agregar
          </button>
        </div>
        <Enlaces_a />

        {isModalOpen && (
          <div className="modal">
            <div className="overlay" onClick={cerrarModalNuevaCuenta}></div>
            <div className="modal-content">
              <div className="grupo-input">
                <label htmlFor="accountName">Nombre del Banco</label>
                <input
                  type="text"
                  id="accountName"
                  name="accountName"
                  value={nuevaCuenta.accountName}
                  onChange={handleInputChange}
                />
              </div>
              <div className="grupo-input">
                <label htmlFor="bankAddressNuovo">
                  Dirección del beneficiario
                </label>
                <input
                  type="text"
                  id="bankAddressNuovo"
                  name="bankAddressNuovo"
                  value={nuevaCuenta.bankAddressNuovo}
                  onChange={handleInputChange}
                />
              </div>
              <div className="grupo-input">
                <label htmlFor="routingNumberACH">Routing Number (ACH)</label>
                <input
                  type="text"
                  id="routingNumberACH"
                  name="routingNumberACH"
                  value={nuevaCuenta.routingNumberACH}
                  onChange={handleInputChange}
                />
              </div>
              <div className="grupo-input">
                <label htmlFor="routingNumberWire">Routing Number (Wire)</label>
                <input
                  type="text"
                  id="routingNumberWire"
                  name="routingNumberWire"
                  value={nuevaCuenta.routingNumberWire}
                  onChange={handleInputChange}
                />
              </div>
              <div className="grupo-input">
                <label htmlFor="bankAddress">Dirección del Banco</label>
                <input
                  type="text"
                  id="bankAddress"
                  name="bankAddress"
                  value={nuevaCuenta.bankAddress}
                  onChange={handleInputChange}
                />
              </div>

              <div className="button-group">
                <button onClick={handleSubmit}>Guardar</button>
                <button onClick={cerrarModalNuevaCuenta}>Cancelar</button>
              </div>
            </div>
          </div>
        )}

        <div className="banks">
          <div className="grupo-input">
            <label htmlFor="account">
              Seleccionar banco para ver información
            </label>
            <select
              name="account"
              id="account"
              onChange={handleSelectChange}
              value={cuentaSeleccionada}
            >
              <option value="">Seleccionar cuenta</option>
              {cuentasBanco.map((cuenta) => (
                <option key={cuenta.account_name} value={cuenta.id}>
                  {cuenta.account_name}
                </option>
              ))}
            </select>
          </div>
          {cuentaSeleccionada && (
            <div className="account_detail">
              <div>
                <h2>
                  Nombre de la cuenta:{" "}
                  <strong>{detalleCuenta.account_name}</strong>
                </h2>
              </div>
              <div>
                <h2>
                  Direcciòn del beneficiario:{" "}
                  <strong>{detalleCuenta.bank_address_nuovo}</strong>
                </h2>
              </div>
              <div>
                <h2>
                  Routing number (ACH):{" "}
                  <strong>{detalleCuenta.routing_number_ach}</strong>
                </h2>
              </div>
              <div>
                <h2>
                  Routing number (Wire):{" "}
                  <strong>{detalleCuenta.routing_number_wire}</strong>
                </h2>
              </div>
              <div>
                <h2>
                  Bank address: <strong>{detalleCuenta.bank_address}</strong>
                </h2>
              </div>
              <div>
                <h2>
                  Usuarios registrados:{" "}
                  <strong>{detalleCuenta.registros}</strong>
                </h2>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Bancos_a;
