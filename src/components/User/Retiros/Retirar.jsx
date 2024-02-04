import React, { useState, useEffect } from "react";
import "./Style.css";
import Saldo from "../Saldo/Saldo";
import Swal from "sweetalert2";

const Retirar = () => {
  const [isUserVerified, setIsUserVerified] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState("");
  const [selectedMethod, setSelectedMethod] = useState("");
  const [amount, setAmount] = useState("");
  const [emailSuggestions, setEmailSuggestions] = useState([]);
  // const [allEmails, setAllEmails] = useState([]);
  const [email, setEmail] = useState("");

  const [nameBank, setNameBank] = useState("");
  const [routingNumberAch, setRoutingNumberAch] = useState("");
  const [routingNumberWire, setRoutingNumberWire] = useState("");
  const [addressBank, setAddressBank] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [iban, setIban] = useState("");
  const [aliasCbu, setAliasCbu] = useState("");
  const [cuitcuil, setCuitCuil] = useState("");
  const [nombreCuenta, setNombreCuenta] = useState("");
  const [methodArg, setmethodArg] = useState("");
  const [numeroCuenta, setNumeroCuenta] = useState("");
  const [beneficiary, setBeneficiary] = useState("");
  const [bankNameEu, setBankNameEu] = useState("");
  const [swiftBic, setSwiftBic] = useState("");
  const [addressBankEu, setAddressBankEu] = useState("");
  const [accountNumberEu, setAccountNumberEu] = useState("");
  const [sortCodeEu, setSortCodeEu] = useState("");

  // Lógica para obtener el estado de verificación del usuario
  useEffect(() => {
    const checkVerification = async () => {
      const response = await fetch(
        "http://localhost/nuovo/backend/Api/checkVerification.php",
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

  // useEffect(() => {
  //   const fetchAllEmails = async () => {
  //     try {
  //       const response = await fetch(
  //         "http://localhost/nuovo/backend/Api/getAllEmails.php",
  //         {
  //           method: "GET",
  //           credentials: "include",
  //         }
  //       );

  //       if (response.ok) {
  //         const data = await response.json();
  //         setAllEmails(data.emails);
  //       } else {
  //         console.error("Error al obtener la lista de correos electrónicos");
  //       }
  //     } catch (error) {
  //       console.error(
  //         "Error al obtener la lista de correos electrónicos:",
  //         error
  //       );
  //     }
  //   };

  //   fetchAllEmails();
  // }, []);

  // const handleEmailSelection = (selectedEmail) => {
  //   setEmail(selectedEmail);
  //   setEmailSuggestions([]);
  // };

  const renderSpecificFields = () => {
    switch (selectedMethod) {
      case "transferencia_entre_usuarios":
        return (
          <>
            {/* Campos específicos para "Transferencia entre usuarios" */}
            <div className="grupo-input">
              <label htmlFor="email">Correo electrónico destino</label>
              <input
                type="email"
                id="email"
                name="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                }}
              />
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
          </>
        );
      case "transferencia_externa":
        return (
          <>
            {/* Campos específicos para "Transferencia externa" */}
            <div className="grupo-input">
              <label htmlFor="region">Selecciona la región</label>
              <select
                name="region"
                id="region"
                onChange={(e) => setSelectedRegion(e.target.value)}
              >
                <option value="">Selecciona una región</option>
                <option value="usa">USA</option>
                <option value="europa">Europa</option>
              </select>
            </div>

            {/* Mostrar campos adicionales según la región seleccionada */}
            {selectedRegion === "usa" && (
              <>
                <div className="grupo-input">
                  <label htmlFor="name_bank">Nombre del banco</label>
                  <input
                    type="text"
                    id="name_bank"
                    name="name_bank"
                    value={nameBank}
                    onChange={(e) => setNameBank(e.target.value)}
                  />
                </div>
                <div className="grupo-input">
                  <label htmlFor="routingNumberAch">Routing Number (ACH)</label>
                  <input
                    type="text"
                    id="routingNumberAch"
                    name="routingNumberAch"
                    value={routingNumberAch}
                    onChange={(e) => setRoutingNumberAch(e.target.value)}
                  />
                </div>

                <div className="grupo-input">
                  <label htmlFor="routingNumberWire">
                    Routing Number (WIRE)
                  </label>
                  <input
                    type="text"
                    id="routingNumberWire"
                    name="routingNumberWire"
                    value={routingNumberWire}
                    onChange={(e) => setRoutingNumberWire(e.target.value)}
                  />
                </div>

                <div className="grupo-input">
                  <label htmlFor="address_bank">Dirección del banco</label>
                  <input
                    type="text"
                    id="address_bank"
                    name="address_bank"
                    value={addressBank}
                    onChange={(e) => setAddressBank(e.target.value)}
                  />
                </div>
                <div className="grupo-input">
                  <label htmlFor="accountNumber">Número de cuenta</label>
                  <input
                    type="text"
                    id="accountNumber"
                    name="accountNumber"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                  />
                </div>

                <div className="grupo-input">
                  <label htmlFor="beneficiary">Nombre del beneficiario</label>
                  <input
                    type="text"
                    id="beneficiary"
                    name="beneficiary"
                    value={beneficiary}
                    onChange={(e) => setBeneficiary(e.target.value)}
                  />
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
              </>
            )}

            {selectedRegion === "europa" && (
              <>
                <div className="grupo-input">
                  <label htmlFor="banknameeu">Nombre del banco</label>
                  <input
                    type="text"
                    id="banknameeu"
                    name="banknameeu"
                    value={bankNameEu}
                    onChange={(e) => setBankNameEu(e.target.value)}
                  />
                </div>

                <div className="grupo-input">
                  <label htmlFor="swiftbic">Código SWIFT / BIC</label>
                  <input
                    type="text"
                    id="swiftbic"
                    name="swiftbic"
                    value={swiftBic}
                    onChange={(e) => setSwiftBic(e.target.value)}
                  />
                </div>

                <div className="grupo-input">
                  <label htmlFor="addressbank">Dirección del banco</label>
                  <input
                    type="text"
                    id="addressbank"
                    name="addressbank"
                    value={addressBankEu}
                    onChange={(e) => setAddressBankEu(e.target.value)}
                  />
                </div>

                <div className="grupo-input">
                  <label htmlFor="accountnumber">Numero de cuenta</label>
                  <input
                    type="text"
                    id="accountnumber"
                    name="accountnumber"
                    value={accountNumberEu}
                    onChange={(e) => setAccountNumberEu(e.target.value)}
                  />
                </div>

                <div className="grupo-input">
                  <label htmlFor="sortcode">Código SORT</label>
                  <input
                    type="text"
                    id="sortcode"
                    name="sortcode"
                    value={sortCodeEu}
                    onChange={(e) => setSortCodeEu(e.target.value)}
                  />
                </div>

                <div className="grupo-input">
                  <label htmlFor="iban">IBAN</label>
                  <input
                    type="text"
                    id="iban"
                    name="iban"
                    value={iban}
                    onChange={(e) => setIban(e.target.value)}
                  />
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
              </>
            )}
          </>
        );
      case "transferencia_nacional":
        return (
          <>
            {/* Campos específicos para "Transferencia nacional" */}
            <div className="grupo-input">
              <label htmlFor="tipoPago">Selecciona el tipo de pago</label>
              <select
                name="tipoPago"
                id="tipoPago"
                onChange={(e) => setmethodArg(e.target.value)}
              >
                <option value="">Selecciona un método</option>
                <option value="virtual">Banco Virtual</option>
                <option value="fisico">Banco Físico</option>
              </select>
            </div>

            {methodArg === "virtual" && (
              <>
                <div className="grupo-input">
                  <label htmlFor="alias">
                    Ingrese su alias o Número de cuenta nacional (CBU)
                  </label>
                  <input
                    type="text"
                    id="alias"
                    name="alias"
                    value={aliasCbu}
                    onChange={(e) => setAliasCbu(e.target.value)}
                  />
                </div>

                <div className="grupo-input">
                  <label htmlFor="cuitcuil">Ingrese el CUIT/CUIL</label>
                  <input
                    type="text"
                    id="cuitcuil"
                    name="cuitcuil"
                    value={cuitcuil}
                    onChange={(e) => setCuitCuil(e.target.value)}
                  />
                </div>

                <div className="grupo-input">
                  <label htmlFor="nombrecuenta">
                    Ingrese el nombre de la cuenta
                  </label>
                  <input
                    type="text"
                    id="nombrecuenta"
                    name="nombrecuenta"
                    value={nombreCuenta}
                    onChange={(e) => setNombreCuenta(e.target.value)}
                  />
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
              </>
            )}

            {methodArg === "fisico" && (
              <>
                <div className="grupo-input">
                  <label htmlFor="alias">
                    Ingrese su alias o Número de cuenta nacional (CBU)
                  </label>
                  <input
                    type="text"
                    id="alias"
                    name="alias"
                    value={aliasCbu}
                    onChange={(e) => setAliasCbu(e.target.value)}
                  />
                </div>

                <div className="grupo-input">
                  <label htmlFor="numerocuenta">
                    Ingrese el numero de caja de ahorros ó cuenta corriente
                  </label>
                  <input
                    type="text"
                    id="numerocuenta"
                    name="numerocuenta"
                    value={numeroCuenta}
                    onChange={(e) => setNumeroCuenta(e.target.value)}
                  />
                </div>

                <div className="grupo-input">
                  <label htmlFor="cuitcuil">Ingrese el CUIT/CUIL</label>
                  <input
                    type="text"
                    id="cuitcuil"
                    name="cuitcuil"
                    value={cuitcuil}
                    onChange={(e) => setCuitCuil(e.target.value)}
                  />
                </div>

                <div className="grupo-input">
                  <label htmlFor="nombrecuenta">
                    Ingrese el nombre de la cuenta
                  </label>
                  <input
                    type="text"
                    id="nombrecuenta"
                    name="nombrecuenta"
                    value={nombreCuenta}
                    onChange={(e) => setNombreCuenta(e.target.value)}
                  />
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
              </>
            )}
          </>
        );
      case "efectivo":
        return (
          <>
            {/* Campos específicos para "Efectivo" */}
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
        );
      default:
        return null;
    }
  };

  const handleAmountChange = (e) => {
    const formattedAmount = formatAmount(e.target.value);
    setAmount(formattedAmount);
  };

  const formatAmount = (value) => {
    // Eliminar caracteres no numéricos
    const numericValue = value.replace(/[^\d]/g, "");

    // Formatear con separador de miles y decimales
    const formattedValue = new Intl.NumberFormat("en-US", {
      style: "decimal",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(parseFloat(numericValue) / 100);

    return formattedValue;
  };

  // Lógica para manejar el envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validar campos obligatorios según el método de retiro seleccionado
    if (
      selectedMethod === "transferencia_entre_usuarios" &&
      (email.trim() === "" || amount.trim() === "")
    ) {
      // Muestra un mensaje de error si algún campo está vacío
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Por favor, complete todos los campos obligatorios.",
      });
      return;
    }

    if (
      selectedMethod === "transferencia_externa" &&
      selectedRegion === "usa" &&
      (nameBank.trim() === "" ||
        routingNumberAch.trim() === "" ||
        routingNumberWire.trim() === "" ||
        addressBank.trim() === "" ||
        accountNumber.trim() === "" ||
        amount.trim() === "")
    ) {
      // Muestra un mensaje de error si algún campo está vacío
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Por favor, complete todos los campos obligatorios.",
      });
      return;
    }

    if (
      selectedMethod === "transferencia_externa" &&
      selectedRegion === "europa" &&
      (iban.trim() === "" || amount.trim() === "")
    ) {
      // Muestra un mensaje de error si algún campo está vacío
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Por favor, complete todos los campos obligatorios.",
      });
      return;
    }

    if (
      selectedMethod === "transferencia_nacional" &&
      (aliasCbu.trim() === "" || amount.trim() === "")
    ) {
      // Muestra un mensaje de error si algún campo está vacío
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Por favor, complete todos los campos obligatorios.",
      });
      return;
    }

    // validar monto
    const numericAmount = parseFloat(amount.replace(/[^\d.]/g, ""));
    if (isNaN(numericAmount) || numericAmount < 1) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "El monto debe ser de al menos 1 dólar",
      });
      return;
    }

    // Construir el objeto formData según el método seleccionado
    let formData = {
      selectedMethod,
      amount,
    };

    switch (selectedMethod) {
      case "transferencia_entre_usuarios":
        formData = {
          ...formData,
          email,
        };
        break;
      case "transferencia_externa":
        if (selectedRegion === "usa") {
          formData = {
            ...formData,
            selectedRegion,
            nameBank,
            routingNumberAch,
            routingNumberWire,
            addressBank,
            accountNumber,
            beneficiary,
          };
        } else if (selectedRegion === "europa") {
          formData = {
            ...formData,
            selectedRegion,
            bankNameEu,
            swiftBic, 
            addressBankEu,
            accountNumberEu,
            sortCodeEu,
            iban,
          };
        }
        break;

      case "transferencia_nacional":
        if (methodArg === "virtual") {
          formData = {
            ...formData,
            methodArg,
            aliasCbu,
            cuitcuil,
            nombreCuenta,
          };
        } else if (methodArg === "fisico") {
          formData = {
            ...formData,
            methodArg,
            aliasCbu,
            numeroCuenta,
            cuitcuil,
            nombreCuenta,
          };
        }

        break;

      default:
        break;
    }

    try {
      // Enviar la solicitud al backend
      const response = await fetch(
        "http://localhost/nuovo/backend/Api/withdrawalRequests.php",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(formData),
        }
      );

      const responseData = await response.json();
      // Manejar la respuesta del backend

      if (response.ok) {
        Swal.fire({
          icon: "success",
          title: "Éxito",
          text: responseData["message"],
          didClose: () => {
            window.location.reload();
          },
        });
      } else {
        // Manejar el caso en que la respuesta no es exitosa
        Swal.fire({
          icon: "error",
          title: "Error",
          text: responseData["error"],
        });
      }
    } catch (error) {
      // Manejar errores de red u otras excepciones
      console.error("Error al enviar la solicitud al backend:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Hubo un problema al procesar la solicitud. Por favor, inténtelo de nuevo más tarde.",
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
            <form onSubmit={handleSubmit}>
              <div className="grupo-input">
                <label htmlFor="paymentMethod">
                  Seleccione el medio de pago
                </label>
                <select
                  name="paymentMethod"
                  id="paymentMethod"
                  value={selectedMethod}
                  onChange={(e) => setSelectedMethod(e.target.value)}
                >
                  <option value="">Seleccionar método de retiro</option>
                  <option value="transferencia_entre_usuarios">
                    Transferencia entre usuarios
                  </option>
                  <option value="transferencia_externa">
                    Transferencia externa
                  </option>
                  <option value="transferencia_nacional">
                    Transferencia nacional (Arg)
                  </option>
                  <option value="efectivo">Efectivo</option>
                </select>
              </div>

              {renderSpecificFields()}

              <div className="grupo-submit">
                <input className="btns" type="submit" value="Enviar" />
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
