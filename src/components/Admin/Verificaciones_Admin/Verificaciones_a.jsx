import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import "./Style.css";

const Verificaciones_a = () => {
  const [solicitudes, setSolicitudes] = useState([]);
  const [bancos, setBancos] = useState([]);

  useEffect(() => {
    // Obtener la lista de solicitudes de verificación al cargar el componente
    const obtenerSolicitudes = async () => {
      try {
        const response = await fetch(
          "http://localhost/nuovo/backend/Api/admin/getVerificationRequests.php",
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

          if (data && data.length > 0) {
            setSolicitudes(data);
          } else {
            // Manejar el caso en que no hay solicitudes
            Swal.fire({
              icon: "info",
              title: "Sin solicitudes",
              text: "No hay solicitudes de verificación en este momento.",
            });
          }
        } else {
          // Manejar errores de la solicitud
          console.error(
            "Error al obtener las solicitudes:",
            response.statusText
          );
        }
      } catch (error) {
        console.error("Error al obtener las solicitudes:", error);
        // Manejar errores, mostrar un mensaje o redirigir si es necesario
      }
    };

    const obtenerBancos = async () => {
      try {
        const response = await fetch(
          "http://localhost/nuovo/backend/Api/admin/getBankAccounts.php",
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
          setBancos(data);
        } else {
          // Manejar errores de la solicitud
          console.error(
            "Error al obtener la lista de cuentas bancarias:",
            response.statusText
          );
        }
      } catch (error) {
        console.error("Error al obtener la lista de cuentas bancarias:", error);
      }
    };

    obtenerSolicitudes();
    obtenerBancos();
  }, []);

  const [selectedBank, setSelectedBank] = useState("");

  // Función para manejar clic en una solicitud
  const handleClick = async (solicitud) => {
    // Obtener el estado de verificación del usuario
    const verificationStatusResponse = await fetch(
      `http://localhost/nuovo/backend/Api/admin/getVerificationStatus.php?user_id=${solicitud.user_id}`,
      {
        method: "GET",
        mode: "cors",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const verificationStatusData = await verificationStatusResponse.json();

    if (verificationStatusResponse.ok) {
      const verificationStatus = verificationStatusData.status;

      // Verificar si el estado es "denied"
      const showDeniedMessage = verificationStatus === "denied";
      const showButtons =
        verificationStatus !== "approved" && !showDeniedMessage;

      Swal.fire({
        title: `Detalles de la solicitud de ${solicitud.name}`,
        html: `
        <div className="grupo-input">
          <p>Nombre</p>
          <p>${solicitud.name}</p>
        </div>

        <div className="grupo-input">
          <p>Teléfono</p>
          <p>${solicitud.phoneNumber}</p>
        </div>

        <div className="grupo-input">
          <p>Correo Electrónico</p>
          <p>${solicitud.email}</p>
        </div>

        <div className="grupo-input">
          <p>Dirección</p>
          <p>${solicitud.address}</p>
        </div>

        <div className="grupo-input img">
          <p>Foto del DNI</p>
          <img src="http://localhost/nuovo/src/assets/user_dni/${
            solicitud.dni_image
          }" alt="Foto del DNI" />
        </div>

        <div className="grupo-input img">
        <p>Foto selfie con el DNI</p>
        <img src="http://localhost/nuovo/src/assets/user_selfie/${
          solicitud.selfie_with_dni_image
        }" alt="Foto del Selfie con DNI" />
      </div>

        <div className="grupo-input img">
          <p>Foto del dorso DNI</p>
          <img src="http://localhost/nuovo/src/assets/user_dni_back/${
            solicitud.dni_back
          }" alt="Foto del Selfie con DNI" />
        </div>

        ${
          showDeniedMessage
            ? `
          <p>Solicitud Denegada</p>
          <p>Esta solicitud ha sido denegada. En espera que el usuario envie su informacion de nuevo</p>
      `
            : ""
        }
      `,
        showCancelButton: true,
        confirmButtonColor: "#28a745",
        cancelButtonColor: "#d33",
        confirmButtonText: "Aprobar",
        cancelButtonText: "Denegar",
        showCloseButton: true,
        customClass: {
          container: "mi-swalert-container",
          popup: "mi-swalert-verificacion",
        },
        showConfirmButton: showButtons,
        showCancelButton: showButtons,
      }).then(async (result) => {
        if (result.isConfirmed) {
          // Si confirma

          const bankAccountSelect = await Swal.fire({
            title: "Seleccionar Banco",
            input: "select",
            inputOptions: {
              ...bancos.reduce((options, banco) => {
                options[banco.id] = banco.account_name;
                return options;
              }, {}),
            },
            showCancelButton: true,
            confirmButtonText: "Aceptar",
            cancelButtonText: "Cancelar",
            inputValidator: (value) => {
              if (!value) {
                return "Por favor, seleccione un banco.";
              }
            },
          });

          if (bankAccountSelect.isConfirmed) {
            // Lógica para manejar la selección del banco
            const selectedBankId = bankAccountSelect.value;
            setSelectedBank(selectedBankId);

            const bankAccount = await Swal.fire({
              title: "Ingresar número de cuenta bancaria",
              input: "text",
              inputValidator: (value) => {
                if (!value || !/^\d+$/.test(value)) {
                  return "Por favor, ingrese un número de cuenta válido.";
                }
              },
              showCancelButton: true,
              confirmButtonText: "Aceptar",
              cancelButtonText: "Cancelar",
            });

            // logica para manejar la aprobacion de la solicitud
            if (bankAccount.isConfirmed) {
              // Actualizar el número de cuenta bancaria en la tabla user_verification

              const selectedBankId = bankAccountSelect.value;

              const updateBankAccountResponse = await fetch(
                "http://localhost/nuovo/backend/Api/admin/updateBankAccount.php",
                {
                  method: "POST",
                  mode: "cors",
                  credentials: "include",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                    verificationId: solicitud.id,
                    bankAccount: bankAccount.value,
                    selectedBankId: selectedBankId,
                    user_id: solicitud.user_id,
                  }),
                }
              );

              const updateBankAccountData =
                await updateBankAccountResponse.json();

              if (updateBankAccountResponse.ok) {
                // Aprobación exitosa con número de cuenta, mostrar mensaje y recargar la página
                Swal.fire({
                  title: "Solicitud aprobada exitosamente",
                  icon: "success",
                  timer: 2000,
                  didClose: () => {
                    window.location.reload(false);
                  },
                });
                console.log("Solicitud aprobada:", responseData.message);
              } else if (updateBankAccountResponse.status === 400) {
                // Error de número de cuenta existente
                Swal.fire({
                  icon: "error",
                  title: "Número de cuenta existente",
                  text: "El número de cuenta ya existe. Por favor, ingrese un número de cuenta diferente.",
                });
              } else {
                // Manejar errores al actualizar el número de cuenta
                Swal.fire({
                  title: "Hubo un error al procesar la solicitud",
                  text: "Recargue la página e intente nuevamente",
                  icon: "error",
                  timer: 2000,
                  didClose: () => {
                    // window.location.reload(false);
                  },
                });
                console.error(
                  "Error al actualizar el número de cuenta:",
                  updateBankAccountData.error
                );
              }
            } else {
              // Usuario canceló la entrada del número de cuenta
              Swal.fire({
                title: "Aprobación cancelada",
                icon: "info",
              });
            }
          } else {
            // Usuario canceló la seleccion del numero de cuenta
            Swal.fire({
              title: "Aprobación cancelada",
              icon: "info",
            });
          }
        } else if (result.dismiss === Swal.DismissReason.cancel) {
          // Lógica para denegar la solicitud

          //

          try {
            const { value: formValues } = await Swal.fire({
              title: "Motivo de Denegación",
              html: `
              <form id="denialForm">
                <div>
                    <input type="checkbox" id="fotoBorrosa" name="reason" value="Foto borrosa">
                    <label for="fotoBorrosa">Foto Borrosa</label>
                </div>
                <div>
                    <input type="checkbox" id="caraNoCoincide" name="reason" value="La cara no coincide con el DNI">
                    <label for="caraNoCoincide">La cara no coincide con el DNI</label>
                </div>
                <div>
                    <input type="checkbox" id="otra" name="reason" value="otra">
                    <label for="otra">Otra</label>
                    <input type="text" id="otraText" name="otraText" placeholder="Motivo personalizado" style="display: none;">
                </div>
            </form>
              `,
              focusConfirm: false,
              showCancelButton: true,
              confirmButtonText: "Denegar",
              cancelButtonText: "Cancelar",
              preConfirm: () => {
                const reasons = Array.from(
                  document.querySelectorAll('input[name="reason"]:checked')
                ).map((input) =>
                  input.value === "otra"
                    ? document.getElementById("otraText").value
                    : input.value
                );
                if (reasons.includes("otra")) {
                  return {
                    reasons,
                    otraText: document.getElementById("otraText").value,
                  };
                }
                return { reasons };
              },
              didOpen: () => {
                document
                  .getElementById("otra")
                  .addEventListener("change", (event) => {
                    document.getElementById("otraText").style.display = event
                      .target.checked
                      ? "inline-block"
                      : "none";
                  });
              },
            });

            if (
              formValues &&
              formValues.reasons &&
              formValues.reasons.length > 0
            ) {
              // Denegar la solicitud y registrar el motivo en la base de datos
              const response = await fetch(
                "http://localhost/nuovo/backend/Api/admin/denyVerification.php",
                {
                  method: "POST",
                  mode: "cors",
                  credentials: "include",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                    verificationId: solicitud.id,
                    reasons: formValues.reasons,
                    otraText: formValues.otraText,
                  }),
                }
              );

              const responseData = await response.json();

              if (response.ok) {
                // Solicitud denegada exitosamente
                Swal.fire({
                  title: "Solicitud denegada exitosamente",
                  icon: "success",
                  timer: 2000,
                  didClose: () => {
                    window.location.reload(false);
                  },
                });
                console.log("Solicitud denegada:", responseData.message);
              } else {
                // Manejar errores de la solicitud
                Swal.fire({
                  title: "Hubo un error al procesar la solicitud",
                  text: "Recargue la página e intente nuevamente",
                  icon: "success",
                  timer: 2000,
                  didClose: () => {
                    window.location.reload(false);
                  },
                });
                console.error(
                  "Error al denegar la solicitud:",
                  responseData.error
                );
              }
            } else {
              // Usuario canceló la entrada del motivo
              Swal.fire({
                title: "Denegación cancelada",
                icon: "info",
              });
            }
          } catch (error) {
            // Manejar errores de red, etc.
            console.error("Error al denegar la solicitud:", error);
          }

          //
        }
      });
    } else {
      // Manejar errores al obtener el estado de verificación
      console.error(
        "Error al obtener el estado de verificación:",
        verificationStatusData.error
      );
    }
  };

  return (
    <div className="verificaciones_admin">
      <div className="title">
        <h2>Solicitudes de Verificación</h2>
      </div>

      <div className="lista_verificaciones">
        {solicitudes.map((solicitud) => (
          <ul key={solicitud.id} onClick={() => handleClick(solicitud)}>
            <li>
              <div className="icono">{solicitud.name.charAt(0)} </div>
            </li>

            <li>
              <h2>Usuario</h2>
              <span>{solicitud.name} </span>
            </li>

            <li>
              <h2>Fecha Registro</h2>
              <span>
                {solicitud.fecha_registro} {solicitud.registrationTime}
              </span>
            </li>

            <li>
              <h2>Fecha Solicitud</h2>
              <span>{solicitud.fecha_solicitud}</span>
            </li>

            <li className={`estatus ${solicitud.status.toLowerCase()}`}>
              <h2>Estatus</h2>
              <span>{solicitud.status}</span>
            </li>
          </ul>
        ))}
      </div>
    </div>
  );
};

export default Verificaciones_a;
