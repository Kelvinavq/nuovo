import React, { useState, useEffect, useContext } from "react";
import "./Style.css";
import Saldo from "../Saldo/Saldo";
import Swal from "sweetalert2";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import { LanguageContext } from "../../../Language/LanguageContext";
import { Translation } from "./Translation";
import Config from "../../../Config";

const Depositar = () => {
  const { language } = useContext(LanguageContext);
  const [verificationComplete, setVerificationComplete] = useState(false);
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
  const [paymentProof, setPaymentProof] = useState(null);
  const [platformSelected, setPlatformSelected] = useState();
  const [platformAdminId, setPlatformAdminId] = useState();
  const [platformsUser, setPlatformsUser] = useState([]);
  const UserId = localStorage.getItem("user_id");
  // verificar estatus del usuario
  useEffect(() => {
    const checkVerification = async () => {
      const response = await fetch(
        `${Config.backendBaseUrl}checkVerification.php`,
        {
          method: "GET",
          credentials: "include",
        }
      );

      const data = await response.json();
      if (response.ok) {
        setIsUserVerified(data.status);
        setVerificationComplete(true);
      }
    };

    checkVerification();
  }, []);

  // obtener id del usuario
  useEffect(() => {
    // Lógica para obtener el ID del usuario
    const fetchUserId = async () => {
      const response = await fetch(`${Config.backendBaseUrl}getUserId.php`, {
        method: "GET",
        credentials: "include",
      });

      const data = await response.json();

      if (response.ok) {
        setUserId(data.userId);
      } else {
        console.error("Error al obtener el ID del usuario");
      }
    };

    fetchUserId();
  }, []);

  // obtener lista de plataformas
  useEffect(() => {
    const fetchPlatforms = async () => {
      try {
        const response = await fetch(
          `${Config.backendBaseUrl}getPlatforms.php`,
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
    } else if (e.target.value === "platform") {
      handlePlatformUser();
    }
  };

  const handlePlatformUser = async () => {
    try {
      const response = await fetch(
        `${Config.backendBaseUrl}getPlatformUser.php?userId=${UserId}`,
        {
          method: "GET",
          credentials: "include",
        }
      );
      if (response.ok) {
        const data = await response.json();

        if (data.length === 0) {
          Swal.fire({
            icon: "warning",
            title: Translation[language].swalTitle1,
            text: Translation[language].swalText1,
            didClose: () => {
              window.location = "/user/ajustes/plataformas";
            },
          });
        } else {
          setPlatformsUser(data);
        }
      } else {
        console.error("Error al obtener la listra de plataformas del usuario");
      }
    } catch (error) {
      console.error(
        "Error al obtener la listra de plataformas del usuario:",
        error
      );
    }
  };

  const handleAmountChange = (e) => {
    const formattedAmount = formatAmount(e.target.value);
    setAmount(formattedAmount);
  };

  const handleBankSelect = async () => {
    // Lógica para obtener información del banco desde el backend
    try {
      // Obtener información del banco desde el backend
      const response = await fetch(
        `${Config.backendBaseUrl}getBankInfo.php?userId=${userId}`,
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

  const handlePlatformSelect = async (e) => {
    const platformId = e.target.value;

    // Lógica para obtener información detallada de la plataforma desde el backend
    try {
      const response = await fetch(
        `${Config.backendBaseUrl}getPlatformInfo.php?platformId=${platformId}`,
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
        setPlatformAdminId(data.id);
      } else {
        console.error("Error al obtener la información de la plataforma");
      }
    } catch (error) {
      console.error("Error al obtener la información de la plataforma:", error);
    }
  };

  const handleReferenceNumberChange = (e) => {
    const value = e.target.value;

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
    }).format(parseFloat(numericValue) / 100);

    return formattedValue;
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setPaymentProof(file);

    if (file) {
      const fileName = file.name;
      document.getElementById("nombreImagen").innerText = fileName;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // validar
    if (paymentMethod === "bank" && (!amount || !referenceNumber)) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: Translation[language].swalEmpty,
      });
      return;
    }

    if (
      paymentMethod === "platform" &&
      (!selectedPlatform || !referenceNumber)
    ) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: Translation[language].swalEmpty,
      });
      return;
    }

    if (["bank", "platform"].includes(paymentMethod) && !paymentProof) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: Translation[language].swalEmpty,
      });
      return;
    }

    // Validar que el monto sea mayor o igual a 1 dólar
    const numericAmount = parseFloat(amount.replace(/[^\d.]/g, ""));
    if (isNaN(numericAmount) || numericAmount < 1) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: Translation[language].amount,
      });
      return;
    }

    // Mostrar SweetAlert de confirmación
    const confirmation = await Swal.fire({
      icon: "warning",
      title: Translation[language].swalTitle2,
      text: `${Translation[language].swalText4} ${formatAmount(amount)} USD`,
      showCancelButton: true,
      confirmButtonText: Translation[language].swalButton1,
      cancelButtonText: Translation[language].swalButton2,
    });

    if (!confirmation.isConfirmed) {
      return; // Si el usuario cancela, salir de la función
    }

    const formData = new FormData();
    formData.append("payment_method", paymentMethod);
    formData.append("user_id", userId);
    formData.append("amount", amount);
    formData.append("reference_number", referenceNumber);

    if (["bank", "platform"].includes(paymentMethod)) {
      formData.append("payment_proof", paymentProof);
    }

    // Agregar el campo selected_platform si el paymentMethod es "platform"
    if (paymentMethod === "platform") {
      formData.append(
        "selected_platform",
        selectedPlatform?.platformName || ""
      );
      formData.append("id_platform_user", platformSelected);
      formData.append("platformAdminId", platformAdminId);
    }

    // Lógica para enviar la solicitud al backend según el método de pago seleccionado
    try {
      const response = await fetch(
        `${Config.backendBaseUrl}depositRequest.php`,
        {
          method: "POST",
          credentials: "include",
          body: formData,
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
          text: Translation[language].swalText2,
        });
      }
    } catch (error) {
      console.error("Error al enviar la solicitud de depósito:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: Translation[language].swalText3,
      });
    }
  };

  const CopiarAlPortapapeles = ({ texto }) => {
    const [copiado, setCopiado] = useState(false);

    const copiarAlPortapapeles = (e) => {
      e.preventDefault();

      navigator.clipboard.writeText(texto);
      setCopiado(true);

      setTimeout(() => {
        setCopiado(false);
      }, 3000);
    };

    return (
      <button onClick={copiarAlPortapapeles}>
        {copiado ? (
          <span>
            Copiado <ContentCopyIcon />
          </span>
        ) : (
          <ContentCopyIcon />
        )}
      </button>
    );
  };

  return (
    <div className="depositar">
      <Saldo />

      <div className="content">
        <h2>{Translation[language].title}</h2>

        {verificationComplete && isUserVerified === "approved" ? (
          <div className="form">
            <form onSubmit={handleSubmit}>
              <div className="grupo-input">
                <label htmlFor="paymentMethod">
                  {Translation[language].label1}
                </label>
                <select
                  name="paymentMethod"
                  id="paymentMethod"
                  value={paymentMethod}
                  onChange={handlePaymentMethodChange}
                >
                  <option value="">{Translation[language].option1}</option>
                  <option value="bank">{Translation[language].option2}</option>
                  <option value="platform">
                    {Translation[language].option3}
                  </option>
                  <option value="cash">{Translation[language].option4}</option>
                </select>
              </div>

              {paymentMethod === "bank" && (
                <>
                  <div className="instrucciones">
                    {bankInfo && (
                      <>
                        <p>
                          {Translation[language].text1} {bankInfo.account_name}
                          <CopiarAlPortapapeles texto={bankInfo.account_name} />
                        </p>
                        <p>
                          {Translation[language].text2de2}:{" "}
                          {bankInfo.bank_address_nuovo}
                          <CopiarAlPortapapeles texto={bankInfo.bank_address_nuovo} />
                        </p>
                        <p>
                          {Translation[language].text2de2de2}:
                          info@nuovotechusa.com
                          <CopiarAlPortapapeles texto={"info@nuovotechusa.com"} />
                        </p>
                        <p>
                          {Translation[language].text4} {bankInfo.bank_address}
                          <CopiarAlPortapapeles texto={bankInfo.bank_address} />
                        </p>
                        <p>
                          {Translation[language].text5}{" "}
                          {bankInfo.account_number}
                          <CopiarAlPortapapeles texto={bankInfo.account_number} />
                        </p>

                        <p>
                          {Translation[language].text2}{" "}
                          {bankInfo.routing_number_ach}
                          <CopiarAlPortapapeles texto={bankInfo.routing_number_ach} />
                        </p>
                        <p>
                          {Translation[language].text3}{" "}
                          {bankInfo.routing_number_wire}
                          <CopiarAlPortapapeles texto={bankInfo.routing_number_wire} />
                        </p>

                        <p>
                          {Translation[language].text6} {bankInfo.ref}
                          <CopiarAlPortapapeles texto={bankInfo.ref} />
                        </p>
                      </>
                    )}
                  </div>

                  <div className="grupo-input monto">
                    <label htmlFor="amount">
                      {Translation[language].label2}
                    </label>
                    <div className="input">
                      <span>$</span>
                      <input
                        type="text"
                        id="amount"
                        name="amount"
                        value={amount}
                        onChange={handleAmountChange}
                      />
                      <label htmlFor="">Min. 1 USD</label>
                    </div>
                  </div>

                  <div className="grupo-input">
                    <label htmlFor="referenceNumber">
                      {Translation[language].label3}
                    </label>
                    <input
                      type="text"
                      id="referenceNumber"
                      name="referenceNumber"
                      value={referenceNumber}
                      onChange={handleReferenceNumberChange}
                    />
                  </div>

                  <div className="grupo-input">
                    <label htmlFor="">{Translation[language].label4}</label>

                    <label htmlFor="paymentProof" className="file">
                      <UploadFileIcon />
                    </label>
                    <p id="nombreImagen"></p>
                    <input
                      type="file"
                      id="paymentProof"
                      name="paymentProof"
                      accept="image/*"
                      onChange={handleFileChange}
                    />
                  </div>
                </>
              )}

              {paymentMethod === "platform" && (
                <>
                  <div className="grupo-input">
                    <label htmlFor="selectedPlatform">
                      {Translation[language].label5}
                    </label>
                    <select
                      name="selectedPlatform"
                      id="selectedPlatform"
                      onChange={handlePlatformSelect}
                    >
                      <option value="">{Translation[language].option5}</option>
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
                      {selectedPlatformInfo.platformType === "otra" ? (
                        // Si el tipo de plataforma es "otra", mostrar campos personalizados
                        <div className="plataforma">
                          <p>{Translation[language].text7}</p>
                          <h3>{selectedPlatformInfo.platformName}</h3>

                          {selectedPlatformInfo.customFields && (
                            <div>
                              {selectedPlatformInfo.customFields.map(
                                (field, index) => (
                                  <div className="grupo">
                                    <p>{field.fieldName}:</p>
                                    <div key={index}>
                                      <p>{field.fieldValue}</p>
                                      <CopiarAlPortapapeles
                                        texto={field.fieldValue}
                                      />
                                    </div>
                                  </div>
                                )
                              )}
                            </div>
                          )}
                        </div>
                      ) : (
                        // Si el tipo de plataforma no es "otra", mostrar nombre y valor del campo
                        <div className="plataforma">
                          <p>{Translation[language].text8}</p>
                          <div className="grupo">
                            <h3>{selectedPlatformInfo.platformName}</h3>
                            <div>
                              <p>{selectedPlatformInfo.email}</p>
                              <CopiarAlPortapapeles
                                texto={selectedPlatformInfo.email}
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  <div className="grupo-input monto">
                    <label htmlFor="amount">
                      {Translation[language].label6}
                    </label>
                    <div className="input">
                      <span>$</span>
                      <input
                        type="text"
                        id="amount"
                        name="amount"
                        value={amount}
                        onChange={handleAmountChange}
                      />
                      <label htmlFor="">Min. 1 USD</label>
                    </div>
                  </div>

                  <div className="grupo-input">
                    <label htmlFor="referenceNumber">
                      {Translation[language].label7}
                    </label>
                    <input
                      type="text"
                      id="referenceNumber"
                      name="referenceNumber"
                      value={referenceNumber}
                      onChange={(e) => setReferenceNumber(e.target.value)}
                    />
                  </div>

                  <div className="grupo-input">
                    <label htmlFor="platformSelected">
                      {Translation[language].label8}
                    </label>
                    <select
                      name="platformSelected"
                      id="platformSelected"
                      value={platformSelected}
                      onChange={(e) => setPlatformSelected(e.target.value)}
                    >
                      <option value="">{Translation[language].option6}</option>

                      {platformsUser.map((platformsUsers) => (
                        <option
                          key={platformsUsers.id}
                          value={platformsUsers.id}
                        >
                          {platformsUsers.platformName}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grupo-input">
                    <label htmlFor="">{Translation[language].label9}</label>

                    <label htmlFor="paymentProof" className="file">
                      <UploadFileIcon />
                    </label>
                    <p id="nombreImagen"></p>
                    <input
                      type="file"
                      id="paymentProof"
                      name="paymentProof"
                      accept="image/*"
                      onChange={handleFileChange}
                    />
                  </div>
                </>
              )}

              {paymentMethod === "cash" && (
                <>
                  <div className="grupo-input monto">
                    <label htmlFor="amount">
                      {Translation[language].label10}
                    </label>
                    <div className="input">
                      <span>$</span>
                      <input
                        type="text"
                        id="amount"
                        name="amount"
                        value={amount}
                        onChange={handleAmountChange}
                      />
                      <label htmlFor="">Min. 1 USD</label>
                    </div>
                  </div>
                </>
              )}

              <div className="grupo-submit">
                <input
                  className="btns"
                  type="submit"
                  value={Translation[language].button}
                />
              </div>
            </form>
          </div>
        ) : verificationComplete && isUserVerified !== "approved" ? (
          <p>{Translation[language].text9}</p>
        ) : (
          <p></p>
        )}
      </div>
    </div>
  );
};

export default Depositar;
