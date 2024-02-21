import React, { useState, useEffect, useContext } from "react";
import "./Style.css";
import Swal from "sweetalert2";
import Enlaces from "./Enlaces";
import Config from "../../../Config";
import Saldo from "../Saldo/Saldo";

import { LanguageContext } from "../../../Language/LanguageContext";
import { Translation } from "./Translation";

const Plataformas_u = () => {
  const { language } = useContext(LanguageContext);

  const [selectedPlatform, setSelectedPlatform] = useState("");
  const [email, setEmail] = useState("");
  const [customFields, setCustomFields] = useState([]);
  const [customFieldName, setCustomFieldName] = useState("");
  const [customFieldValue, setCustomFieldValue] = useState("");
  const [platformName, setPlatformName] = useState("");

  const [platforms, setPlatforms] = useState([]);
  const UserId = localStorage.getItem("user_id");

  useEffect(() => {
    // Lógica para recuperar las plataformas existentes
    const fetchData = async () => {
      try {
        const response = await fetch(
          `${Config.backendBaseUrl}getPlatformsSettings.php?user_id=${UserId}`
        );
        const data = await response.json();

        if (response.ok) {
          setPlatforms(data.platforms);
        } else {
          console.error(
            "Error al obtener la lista de plataformas:",
            data.error
          );
        }
      } catch (error) {
        console.error("Error al procesar la solicitud:", error.message);
      }
    };

    fetchData();
  }, [UserId]);

  const handleAddField = () => {
    if (customFields.length < 10) {
      const newField = { name: customFieldName, value: customFieldValue };
      setCustomFields([...customFields, newField]);
    }
  };

  const handleFieldChange = (index, key, value) => {
    const updatedFields = [...customFields];
    updatedFields[index][key] = value;
    setCustomFields(updatedFields);
  };

  const handleSavePlatform = async () => {
    try {
      if (selectedPlatform === "otra") {
        if (
          !platformName ||
          customFields.some((field) => !field.name || !field.value)
        ) {
          Swal.fire({
            icon: "error",
            title: "Error",
            text: Translation[language].swalMessage12,
          });
          return;
        }

        // Lógica para manejar la plataforma "otra" con campos personalizados
        const response = await fetch(
          `${Config.backendBaseUrl}createPlatform.php`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              userid: UserId,
              platformType: selectedPlatform,
              customFields: customFields,
              customPlatformName: platformName,
            }),
          }
        );

        const data = await response.json();

        if (response.ok) {
          Swal.fire({
            icon: "success",
            title: "Éxito",
            text: Translation[language].swalMessage13,
            didClose: () => {
              window.location.reload();
            },
          });
          console.log("Plataforma 'otra' creada con éxito:", data.message);
        } else {
          Swal.fire({
            icon: "error",
            title: "Error",
            text: Translation[language].swalMessage14,
          });
          console.error("Error al crear plataforma 'otra':", data.error);
        }
      } else {
        // Lógica para manejar otras plataformas (PayPal, Skrill, Wise)
        if (
          selectedPlatform === "paypal" ||
          selectedPlatform === "skrill" ||
          selectedPlatform === "wise"
        ) {
          if (!email) {
            Swal.fire({
              icon: "error",
              title: "Error",
              text: Translation[language].swalMessage15,
            });
            return;
          }
        }

        const response = await fetch(
          `${Config.backendBaseUrl}createPlatform.php`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              userid: UserId,
              platformType: selectedPlatform,
              platformName:
                selectedPlatform !== "otra" ? selectedPlatform : null,
              value: email,
              email: email,
            }),
          }
        );

        const data = await response.json();

        if (response.ok) {
          Swal.fire({
            icon: "success",
            title: "Éxito",
            text: Translation[language].swalMessage13,
            didClose: () => {
              window.location.reload();
            },
          });
          console.log("Plataforma creada con éxito:", data.message);
        } else {
          Swal.fire({
            icon: "error",
            title: "Error",
            text: Translation[language].swalMessage14,
          });
          console.error("Error al crear plataforma:", data.error);
        }
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: Translation[language].swalMessage16,
      });
      console.error("Error al procesar la solicitud:", error.message);
    }
  };

  const handleDeleteField = (index) => {
    const updatedFields = [...customFields];
    updatedFields.splice(index, 1);
    setCustomFields(updatedFields);
  };

  const showPlatformModal = () => {
    const platformModal = document.getElementById("platform-modal");
    platformModal.classList.add("active");
    // platformModal.style.display = "block";
  };

  const showEmailModal = () => {
    const emailModal = document.getElementById("email-modal");
    emailModal.classList.add("active");
    // emailModal.style.display = "block";
  };

  const showCustomFieldsModal = () => {
    const customFieldsModal = document.getElementById("custom-fields-modal");
    customFieldsModal.classList.add("active");
    // customFieldsModal.style.display = "block";
  };

  const closeModal = () => {
    const modals = document.querySelectorAll(".modal");
    // modals.forEach((modal) => (modal.style.display = "none"));
    modals.forEach((modal) => modal.classList.remove("active"));
  };

  const handlePlatformSelect = (platform) => {
    setSelectedPlatform(platform);
    if (platform === "otra") {
      showCustomFieldsModal();
    } else {
      showEmailModal();
    }
  };

  const handleEditPlatform = async (platform) => {
    let customFields = [];

    if (platform.platformType === "otra") {
      // Consultar customFields asociados a la plataforma "otra"
      try {
        const response = await fetch(
          `${Config.backendBaseUrl}getCustomFields.php?platformId=${platform.id}`
        );

        const data = await response.json();

        if (response.ok) {
          customFields = data.customFields;
        } else {
          console.error("Error al obtener customFields:", data.error);
          return;
        }
      } catch (error) {
        console.error("Error al procesar la solicitud:", error.message);
        return;
      }
    }

    Swal.fire({
      title: Translation[language].swalTitle2,
      html: `
      ${
        platform.platformType === "otra"
          ? `
          <div class="custom-field">
          <label>${Translation[language].label10}</label>
            <input type="text" id="platformName" value="${
              platform.platformName
            }" class="swal2-input" placeholder=${
              Translation[language].label10
            } required>
          </div>
          
        ${customFields
          .map(
            (field, index) => `
            <div class="custom-field">
            <label>Campo ${field.fieldName}</label>
              <input type="text" class="swal2-input" placeholder=${Translation[language].place2} id="swal2-input-${index}" value="${field.fieldName}" required>

            <label>Valor ${field.fieldName}</label>
              <input type="text" class="swal2-input" placeholder=${Translation[language].place3}id="swal2-value-${index}" value="${field.fieldValue}" required>
            </div>
            
          `
          )
          .join("")}
      `
          : `
          <label htmlFor="platformName">${Translation[language].label10}</label>
          <br>
          <br>
          <input type="text" id="platformName" value="${platform.platformName}" class="swal2-input" placeholder=${Translation[language].label10} required>
          <br>
          <br>
          <label htmlFor="platformEmail">${Translation[language].label11}</label>
          <br>
          <br>
          <input type="text" id="platformEmail" value="${platform.email}" class="swal2-input" placeholder=${Translation[language].label11} required>
      `
      }
    `,
      focusConfirm: false,
      showCancelButton: true,
      showDenyButton: true,
      confirmButtonText: Translation[language].button11,
      cancelButtonText: Translation[language].button12,
      denyButtonText: Translation[language].button13,
      customClass: "swalPlataforma",
      preConfirm: () => {
        // Lógica para obtener los nuevos valores de la plataforma
        const newValues = {
          platformId: platform.id,
          platformName: document.getElementById("platformName").value,
          platformEmail: document.getElementById("platformEmail")
            ? document.getElementById("platformEmail").value
            : null,
        };

        if (platform.platformType === "otra") {
          // Obtener los nuevos customFields
          newValues.customFields = customFields.map((field, index) => ({
            fieldName: document
              .getElementById(`swal2-input-${index}`)
              .value.trim(),
            fieldValue: document
              .getElementById(`swal2-value-${index}`)
              .value.trim(),
          }));

          // Incluir platformName para el tipo "otra"
          newValues.platformName = document
            .getElementById("platformName")
            .value.trim();
        } else {
          newValues.platformEmail = document
            .getElementById("platformEmail")
            .value.trim();
        }
        console.log("Datos enviados al servidor:", newValues);
        return newValues;
      },
    }).then(async (result) => {
      if (result.isDenied) {
        try {
          const response = await fetch(
            `${Config.backendBaseUrl}deletePlatform.php?id=${platform.id}`,
            {
              method: "GET",
            }
          );

          const responseData = await response.json();

          if (response.ok) {
            Swal.fire({
              title: Translation[language].swalTitle3,
              icon: "success",
              timer: 2000,
            });
            // Actualizar la lista de plataformas después de la eliminación
            setPlatforms((prevPlatforms) =>
              prevPlatforms.filter((p) => p.id !== platform.id)
            );
          } else {
            Swal.fire({
              title: Translation[language].swalTitle4,
              text: Translation[language].swalMessage17,
              icon: "error",
              timer: 2000,
            });
            console.error(
              "Error al eliminar la plataforma:",
              responseData.error
            );
          }
        } catch (error) {
          Swal.fire({
            title: Translation[language].swalTitle4,
            text: Translation[language].swalMessage17,
            icon: "error",
            timer: 2000,
          });
          console.error("Error al eliminar la plataforma:", error);
        }
      } else if (result.isConfirmed) {
        try {
          // Enviar datos al backend para la actualización
          const response = await fetch(
            `${Config.backendBaseUrl}updatePlatform.php`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(result.value),
              credentials: "include",
            }
          );
          const responseData = await response.json();
          console.log("Response from server:", responseData);

          if (response.ok) {
            Swal.fire({
              title: Translation[language].swalMessage18,
              icon: "success",
              timer: 2000,
              didClose: () => {
                window.location.reload();
              },
            });
          } else {
            Swal.fire({
              title: Translation[language].swalTitle5,
              text: Translation[language].swalMessage17,
              icon: "error",
              timer: 2000,
            });
            console.error(
              "Error al actualizar la plataforma:",
              responseData.error
            );
          }
        } catch (error) {
          Swal.fire({
            title: Translation[language].swalTitle5,
            text: Translation[language].swalMessage17,
            icon: "error",
            timer: 2000,
          });
          console.error("Error during fetch:", error);
        }
      }
    });
  };

  return (
    <div>
      <Saldo />
      <div className="content">
        <div className="title">
          <h2>{Translation[language].titlePlatforms}</h2>
        </div>

        {/* Modal de selección de plataforma */}
        <div id="platform-modal" className="modal">
          <div className="modal-content">
            <span className="close" onClick={closeModal}>
              &times;
            </span>
            <h2>{Translation[language].h2}</h2>

            <div className="grupo-input">
              <label htmlFor="">{Translation[language].label7}</label>
              <select
                className="swal2-input"
                onChange={(e) => handlePlatformSelect(e.target.value)}
              >
                <option value="">{Translation[language].option1}</option>
                <option value="paypal">{Translation[language].option2}</option>
                <option value="skrill">{Translation[language].option3}</option>
                <option value="wise">{Translation[language].option4}</option>
                <option value="otra">{Translation[language].option5}</option>
              </select>
            </div>
          </div>
        </div>

        {/* Modal de correo electrónico */}
        <div id="email-modal" className="modal">
          <div className="modal-content">
            <span className="close" onClick={closeModal}>
              &times;
            </span>
            <h2>{Translation[language].h22}</h2>

            <div className="grupo-input">
              <label>{Translation[language].label8}</label>
              <input
                className="swal2-input"
                type="email"
                placeholder={`${Translation[language].place1}  ${selectedPlatform}`}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <button className="btns" onClick={handleSavePlatform}>
              {Translation[language].button6}
            </button>
          </div>
        </div>

        {/* Modal de campos personalizados */}
        <div id="custom-fields-modal" className="modal">
          <div className="modal-content">
            <span className="close" onClick={closeModal}>
              &times;
            </span>

            <h2>{Translation[language].h23}</h2>
            <p>{Translation[language].text12}</p>

            <div className="grupo-input">
              <label htmlFor="">{Translation[language].label9}</label>
              <input
                className="swal2-input"
                type="text"
                placeholder={Translation[language].label9}
                value={platformName}
                onChange={(e) => setPlatformName(e.target.value)}
              />
            </div>

            {customFields.length > 0 && <h4>{Translation[language].h4}</h4>}

            {/* Fin del nuevo input */}
            {customFields.map((field, index) => (
              <div>
                <div key={index} className="custom-field">
                  <input
                    className="swal2-input"
                    type="text"
                    placeholder={Translation[language].input1}
                    value={field.name}
                    onChange={(e) =>
                      handleFieldChange(index, "name", e.target.value)
                    }
                  />
                  <input
                    className="swal2-input"
                    type="text"
                    placeholder={Translation[language].input2}
                    value={field.value}
                    onChange={(e) =>
                      handleFieldChange(index, "value", e.target.value)
                    }
                  />
                  <button
                    className="eliminar"
                    onClick={() => handleDeleteField(index)}
                  >
                    {Translation[language].button7}
                  </button>
                </div>
              </div>
            ))}

            <div className="buttons">
              {customFields.length < 10 && (
                <button className="btns agregar" onClick={handleAddField}>
                  {Translation[language].button8}
                </button>
              )}
              <button className="btns" onClick={handleSavePlatform}>
                {Translation[language].button9}
              </button>
            </div>
          </div>
        </div>

        <Enlaces />

        <h3>{Translation[language].h3}</h3>
        <button className="btns" onClick={showPlatformModal}>
          {Translation[language].button5}
        </button>
        <div className="lista_plataformas">
          {platforms &&
            platforms.map((platform) => (
              <div key={platform.id}>
                {platform.platformType === "otra" ? (
                  // Si el tipo de plataforma es "otra", mostrar campos personalizados
                  <div className="plataforma">
                    <div className="platformName">
                      <span>{platform.platformName}</span>
                      <p>{Translation[language].text13}</p>

                      {/* {Object.entries(platform.customFields).map(
                    ([name, value]) => (
                      <div key={name}>
                     
                      </div>
                    )
                  )} */}
                    </div>

                    <button
                      className="btns"
                      onClick={() => handleEditPlatform(platform)}
                    >
                      {Translation[language].button10}
                    </button>
                  </div>
                ) : (
                  // Si el tipo de plataforma no es "otra", mostrar nombre y correo
                  <div className="plataforma">
                    <div className="platformName">
                      <span>{platform.platformName}</span>
                      <p>{Translation[language].text14}</p>
                    </div>
                    <button
                      className="btns"
                      onClick={() => handleEditPlatform(platform)}
                    >
                      {Translation[language].button10}
                    </button>
                  </div>
                )}
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default Plataformas_u;
