import React, { useState, useEffect } from "react";
import "./Style.css";
import Swal from "sweetalert2";
import Enlaces_a from "./Enlaces_a";
import Config from "../../../Config";

const Plataformas_a = () => {
  const [selectedPlatform, setSelectedPlatform] = useState("");
  const [email, setEmail] = useState("");
  const [comision, setComision] = useState("");
  const [customFields, setCustomFields] = useState([]);
  const [customFieldName, setCustomFieldName] = useState("");
  const [customFieldValue, setCustomFieldValue] = useState("");
  const [platformName, setPlatformName] = useState("");

  const [platforms, setPlatforms] = useState([]);

  useEffect(() => {
    // Lógica para recuperar las plataformas existentes
    const fetchData = async () => {
      try {
        const response = await fetch(
          `${Config.backendBaseUrlAdmin}getPlatforms.php`
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
  }, []);

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
            text: "Por favor, complete todos los campos requeridos.",
          });
          return;
        }else if(comision === ""){
          Swal.fire({
            icon: "error",
            title: "Error",
            text: "Por favor, Ingrese la comisión",
          });
          return;
        }

        // Lógica para manejar la plataforma "otra" con campos personalizados
        const response = await fetch(
          `${Config.backendBaseUrlAdmin}createPlatform.php`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              platformType: selectedPlatform,
              customFields: customFields,
              customPlatformName: platformName,
              comision: comision,
            }),
          }
        );

        const data = await response.json();

        if (response.ok) {
          Swal.fire({
            icon: "success",
            title: "Éxito",
            text: data.message,
            didClose: () =>{
              window.location.reload();
            }
          });
          console.log("Plataforma 'otra' creada con éxito:", data.message);
        } else {
          Swal.fire({
            icon: "error",
            title: "Error",
            text: data.error,
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
              text: "Por favor, complete el campo de correo electrónico.",
            });
            return;
          }else if(comision === ""){
            Swal.fire({
              icon: "error",
              title: "Error",
              text: "Por favor, Ingrese la comisión",
            });
            return;
          }
        }

        const response = await fetch(
          `${Config.backendBaseUrlAdmin}createPlatform.php`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              platformType: selectedPlatform,
              platformName:
                selectedPlatform !== "otra" ? selectedPlatform : null,
              value: email,
              email: email,
              comision: comision,
            }),
          }
        );

        const data = await response.json();

        if (response.ok) {
          Swal.fire({
            icon: "success",
            title: "Éxito",
            text: data.message,
            didClose: () =>{
              window.location.reload();
            }
          });
          console.log("Plataforma creada con éxito:", data.message);
        } else {
          Swal.fire({
            icon: "error",
            title: "Error",
            text: data.error,
          });
          console.error("Error al crear plataforma:", data.error);
        }
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Error al procesar la solicitud.",
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
          `${Config.backendBaseUrlAdmin}getCustomFields.php?platformId=${platform.id}`
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
      title: "Editar Plataforma",
      html: `
      ${
        platform.platformType === "otra"
          ? `
          <div class="custom-field">
          <label>Nombre de la plataforma</label>
            <input type="text" id="platformName" value="${
              platform.platformName
            }" class="swal2-input" placeholder="Nombre de la plataforma" required>
          </div>
          
        ${customFields
          .map(
            (field, index) => `
            <div class="custom-field">
            <label>Campo ${field.fieldName}</label>
              <input type="text" class="swal2-input" placeholder="Nombre del campo" id="swal2-input-${index}" value="${field.fieldName}" required>

            <label>Valor ${field.fieldName}</label>
              <input type="text" class="swal2-input" placeholder="Valor del campo" id="swal2-value-${index}" value="${field.fieldValue}" required>
            </div>
            
          `
          )
          .join("")}
      `
          : `
          <label htmlFor="platformName">Nombre de la plataforma</label>
          <br>
          <br>
          <input type="text" id="platformName" value="${platform.platformName}" class="swal2-input" placeholder="Nombre de la plataforma" required>
          <br>
          <br>
          <label htmlFor="platformEmail">Email</label>
          <br>
          <br>
          <input type="text" id="platformEmail" value="${platform.email}" class="swal2-input" placeholder="Valor" required>
      `
      }
    `,
      focusConfirm: false,
      showCancelButton: true,
      showDenyButton: true,
      confirmButtonText: "Guardar",
      cancelButtonText: "Cancelar",
      denyButtonText: `Eliminar`,
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
            `${Config.backendBaseUrlAdmin}deletePlatform.php?id=${platform.id}`,
            {
              method: "GET",
            }
          );

          const responseData = await response.json();

          if (response.ok) {
            Swal.fire({
              title: "Plataforma eliminada con éxito",
              icon: "success",
              timer: 2000,
            });
            // Actualizar la lista de plataformas después de la eliminación
            setPlatforms((prevPlatforms) =>
              prevPlatforms.filter((p) => p.id !== platform.id)
            );
          } else {
            Swal.fire({
              title: "Error al eliminar la plataforma",
              text: "Recargue la página e intente nuevamente",
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
            title: "Error al eliminar la plataforma",
            text: "Recargue la página e intente nuevamente",
            icon: "error",
            timer: 2000,
          });
          console.error("Error al eliminar la plataforma:", error);
        }
      } else if (result.isConfirmed) {
        try {
          // Enviar datos al backend para la actualización
          const response = await fetch(
            `${Config.backendBaseUrlAdmin}updatePlatform.php`,
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
              title: "Plataforma actualizada con éxito",
              icon: "success",
              timer: 2000,
              didClose: () => {
                window.location.reload();
              },
            });
          } else {
            Swal.fire({
              title: "Error al actualizar la plataforma",
              text: "Recargue la página e intente nuevamente",
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
            title: "Error al actualizar la plataforma",
            text: "Recargue la página e intente nuevamente",
            icon: "error",
            timer: 2000,
          });
          console.error("Error during fetch:", error);
        }
      }
    });
  };

  const formatComision = (comision) => {
    const numeric = comision.replace(/[^\d]/g, "");

    // Formatear con separador de miles y decimales
    const formattedComision = new Intl.NumberFormat("en-US", {
      style: "decimal",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(parseFloat(numeric) / 100);

    return formattedComision;
  };

  const handleComisionChange = (e) => {
    const numeric = formatComision(e.target.value);
    setComision(numeric);
  };

  return (
    <div className="plataforma_a">
      <div className="content">
        <div className="title">
          <h2>Plataformas</h2>
          <button className="btns" onClick={showPlatformModal}>
            Agregar
          </button>
        </div>

        {/* Modal de selección de plataforma */}
        <div id="platform-modal" className="modal">
          <div className="modal-content">
            <span className="close" onClick={closeModal}>
              &times;
            </span>
            <h2>Seleccione una plataforma</h2>

            <div className="grupo-input">
              <label htmlFor="">Seleccione una opcion</label>
              <select
                className="swal2-input"
                onChange={(e) => handlePlatformSelect(e.target.value)}
              >
                <option value="">Seleccione una plataforma</option>
                <option value="paypal">PayPal</option>
                <option value="skrill">Skrill</option>
                <option value="wise">Wise</option>
                <option value="otra">Otra</option>
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
            <h2>Agregar nueva plataforma</h2>

            <div className="grupo-input">
              <label>Ingrese el correo electrónico de {selectedPlatform}</label>
              <input
                className="swal2-input"
                type="email"
                placeholder={`Correo electrónico de ${selectedPlatform}`}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <br />
            <div className="grupo-input">
              <label>Porcentaje (%) de comision para {selectedPlatform} </label>
              <input
                className="swal2-input"
                type="comision"
                placeholder={`Ejemplo: 5`}
                value={comision}
                onChange={handleComisionChange}
              />
            </div>

            <button className="btns" onClick={handleSavePlatform}>
              Guardar
            </button>
          </div>
        </div>

        {/* Modal de campos personalizados */}
        <div id="custom-fields-modal" className="modal">
          <div className="modal-content">
            <span className="close" onClick={closeModal}>
              &times;
            </span>

            <h2>Agregar nueva plataforma personalizada</h2>
            <p>Ingrese hasta 10 campos personalizados</p>

            <div className="grupo-input">
              <label htmlFor="">Nombre de la plataforma</label>
              <input
                className="swal2-input"
                type="text"
                placeholder="Nombre de la plataforma"
                value={platformName}
                onChange={(e) => setPlatformName(e.target.value)}
              />
            </div>
            <br/>

            <div className="grupo-input">
              <label>Porcentaje (%) de comision para {selectedPlatform} </label>
              <input
                className="swal2-input"
                type="comision"
                placeholder={`Ejemplo: 5`}
                value={comision}
                onChange={handleComisionChange}
              />
            </div>

            {customFields.length > 0 && (
              <h4>Ingrese el nombre del campo y el valor que desee añadirle</h4>
            )}

            {/* Fin del nuevo input */}
            {customFields.map((field, index) => (
              <div>
                <div key={index} className="custom-field">
                  <input
                    className="swal2-input"
                    type="text"
                    placeholder="Nombre del campo"
                    value={field.name}
                    onChange={(e) =>
                      handleFieldChange(index, "name", e.target.value)
                    }
                  />
                  <input
                    className="swal2-input"
                    type="text"
                    placeholder="Valor del campo"
                    value={field.value}
                    onChange={(e) =>
                      handleFieldChange(index, "value", e.target.value)
                    }
                  />
                  <button
                    className="eliminar"
                    onClick={() => handleDeleteField(index)}
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            ))}

            <div className="buttons">
              {customFields.length < 10 && (
                <button className="btns agregar" onClick={handleAddField}>
                  Agregar campo
                </button>
              )}
              <button className="btns" onClick={handleSavePlatform}>
                Guardar
              </button>
            </div>
          </div>
        </div>

        <Enlaces_a />

        <h3>Lista de Plataformas</h3>
        <div className="lista_plataformas">
          {platforms.map((platform) => (
            <div key={platform.id}>
              {platform.platformType === "otra" ? (
                // Si el tipo de plataforma es "otra", mostrar campos personalizados
                <div className="plataforma">
                  <div className="platformName">
                    <span>{platform.platformName}</span>
                    <p>Plataforma con campos personalizados</p>

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
                    Editar
                  </button>
                </div>
              ) : (
                // Si el tipo de plataforma no es "otra", mostrar nombre y correo
                <div className="plataforma">
                  <div className="platformName">
                    <span>{platform.platformName}</span>
                    <p>{platform.email}</p>
                  </div>
                  <button
                    className="btns"
                    onClick={() => handleEditPlatform(platform)}
                  >
                    Editar
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

export default Plataformas_a;
