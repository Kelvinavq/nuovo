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

  const [platforms, setPlatforms] = useState([]);
  const [listPlatforms, setListPlatforms] = useState([]);
  const UserId = localStorage.getItem("user_id");
  const [selectedPlatform, setSelectedPlatform] = useState(null);
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    // Lógica para recuperar las plataformas existentes
    const fetchData = async () => {
      try {
        const response = await fetch(
          `${Config.backendBaseUrl}getPlatformsAdmin.php`,
          {
            method: "GET",
            mode: "cors",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        const data = await response.json();

        if (response.ok) {
          setPlatforms(data);
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

  useEffect(() => {
    // Lógica para recuperar las plataformas existentes
    const fetchData = async () => {
      try {
        const response = await fetch(
          `${Config.backendBaseUrl}getPlatformsUser.php`,
          {
            method: "GET",
            mode: "cors",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        const data = await response.json();

        if (response.ok) {
          setListPlatforms(data.platforms);
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

  const handleAddPlatformClick = () => {
    if (platforms && platforms.length > 0) {
      Swal.fire({
        title: Translation[language].swalTitle6,
        input: "select",
        inputOptions: platforms.reduce((options, platform) => {
          options[platform.id] = platform.platformName;
          return options;
        }, {}),
        showCancelButton: true,
      }).then((result) => {
        if (result.isConfirmed) {
          const selectedPlatform = platforms.find(
            (platform) => platform.id === parseInt(result.value)
          );
          handlePlatformSelect(selectedPlatform);
        }
      });
    } else {
      Swal.fire({
        icon: "info",
        title: Translation[language].swalTitle7,
        text: Translation[language].swalMessage19,
      });
    }
  };

  const handlePlatformSelect = async (platform) => {
    setSelectedPlatform(platform);

    if (["paypal", "skrill", "wise"].includes(platform.platformType)) {
      Swal.fire({
        title: `${Translation[language].swalTitle8} ${platform.platformName}`,
        input: "email",
        inputPlaceholder: `${Translation[language].swalPlaceholder} ${platform.platformName}`,
        showCancelButton: true,
      }).then(async (result) => {
        if (result.isConfirmed) {
          setUserEmail(result.value);

          // Aquí es donde haces la solicitud fetch para guardar la plataforma del usuario
          try {
            const response = await fetch(
              `${Config.backendBaseUrl}registratePlatform.php`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  userId: UserId,
                  email: result.value,
                  platformType: platform.platformType,
                  platformName: platform.platformName,
                }),
                credentials: "include",
              }
            );

            const data = await response.json();

            if (response.ok) {
              Swal.fire({
                icon: "success",
                title: Translation[language].swalTitle9,
                text: Translation[language].swalMessage20,
              });
            } else {
              Swal.fire({
                icon: "error",
                title: "Error",
                text: Translation[language].swalMessage21,
              });
            }
          } catch (error) {
            Swal.fire({
              icon: "error",
              title: "Error",
              text: Translation[language].swalMessage21,
            });
          }
        }
      });
    } else if (platform.platformType === "otra") {
      try {
        const response = await fetch(
          `${Config.backendBaseUrl}getCustomFieldsUser.php?platformId=${platform.id}`,
          {
            method: "GET",
            mode: "cors",
            credentials: "include",
          }
        );
        const data = await response.json();

        if (response.ok) {
          const customFields = data.customFields;

          Swal.fire({
            title: `${Translation[language].swalTitle8} ${platform.platformName}`,
            html: customFields
              .map(
                (field, index) => `
                <div class="grupo-input">
                  <label class="swal2-input-label">${field.fieldName}</label>
                  <input id="customField-${index}" class="swal2-input">
                <div/>
            `
              )
              .join(""),
            preConfirm: () => {
              const userData = {};
              for (let index = 0; index < customFields.length; index++) {
                const value = document.getElementById(
                  `customField-${index}`
                ).value;
                if (!value) {
                  Swal.showValidationMessage(
                    `${customFields[index].fieldName} ${Translation[language].swalMessage22}`
                  );
                  return;
                }
                userData[customFields[index].fieldName] = value;
              }
              return userData;
            },
            showCancelButton: true,
          }).then(async (result) => {
            if (result.isConfirmed) {
              try {
                const response = await fetch(
                  `${Config.backendBaseUrl}saveCustomFieldsUser.php`,
                  {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                      userId: UserId,
                      platformType: platform.platformType,
                      platformName: platform.platformName,
                      platformId: platform.id,
                      customFields: result.value,
                    }),
                    credentials: "include",
                  }
                );

                const data = await response.json();

                if (response.ok) {
                  Swal.fire({
                    icon: "success",
                    title: Translation[language].swalTitle9,
                    text: Translation[language].swalMessage23,
                    didClose: () => {
                      window.location.reload();
                    },
                  });
                } else {
                  Swal.fire({
                    icon: "error",
                    title: "Error",
                    text: Translation[language].swalMessage21,
                    didClose: () => {
                      window.location.reload();
                    },
                  });
                }
              } catch (error) {
                Swal.fire({
                  icon: "error",
                  title: "Error",
                  text: Translation[language].swalMessage21,
                });
              }
            }
          });
        } else {
          console.error(
            "Error al obtener los campos personalizados:",
            data.error
          );
        }
      } catch (error) {
        console.error("Error al procesar la solicitud:", error.message);
      }
    }
  };

  const handleEditPlatform = async (platform) => {
    let customFields = [];

    if (platform.platformType === "otra") {
      // Consultar customFields asociados a la plataforma "otra"
      try {
        const response = await fetch(
          `${Config.backendBaseUrl}getCustomFieldsUser.php?platformId=${platform.id}`,
          {
            method: "GET",
            credentials: "include",
          }
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
      title: Translation[language].swalTitle10,
      html: `
      ${
        platform.platformType === "otra"
          ? `
        ${customFields
          .map(
            (field, index) => `
            <div class="custom-field">

            <input type="hidden" class="swal2-input" id="swal2-input-${index}" value="${field.fieldName}" required>

            <label>${field.fieldName}</label>
              <input type="text" class="swal2-input" placeholder="Valor del campo" id="swal2-value-${index}" value="${field.fieldValue}" required>
            </div>
            
          `
          )
          .join("")}
      `
          : `
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
      confirmButtonText: Translation[language].swalButtonSave,
      cancelButtonText: Translation[language].swalButtonCancel,
      denyButtonText:Translation[language].swalButtonDelete,
      customClass: "swalPlataforma",
      preConfirm: () => {
        // Lógica para obtener los nuevos valores de la plataforma
        const newValues = {
          platformId: platform.id,
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
        } else {
          newValues.platformEmail = document
            .getElementById("platformEmail")
            .value.trim();
        }
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
              title: Translation[language].swalTitle11,
              icon: "success",
              timer: 2000,
            });
            // Actualizar la lista de plataformas después de la eliminación
            setPlatforms((prevPlatforms) =>
              prevPlatforms.filter((p) => p.id !== platform.id)
            );
          } else {
            Swal.fire({
              title: Translation[language].swalTitle12,
              text: Translation[language].swalMessage24,
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
            title: Translation[language].swalTitle12,
            text: Translation[language].swalMessage24,
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

        <Enlaces />

        <h3>{Translation[language].h3}</h3>
        <button className="btns" onClick={handleAddPlatformClick}>
          {Translation[language].button5}
        </button>
        <div className="lista_plataformas">
          {listPlatforms &&
            listPlatforms.map((platform) => (
              <div key={platform.id}>
                {platform.platformType === "otra" ? (
                  // Si el tipo de plataforma es "otra", mostrar campos personalizados
                  <div className="plataforma">
                    <div className="platformName">
                      <span>{platform.platformName}</span>
                      <p>{Translation[language].text13}</p>
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
                      <p>{platform.email}</p>
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
