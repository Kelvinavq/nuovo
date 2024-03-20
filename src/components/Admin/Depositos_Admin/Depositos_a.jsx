import React, { useState, useEffect } from "react";
import "./Style.css";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import Swal from "sweetalert2";
import Config from "../../../Config";

const Depositos_a = () => {
  const [depositRequests, setDepositRequests] = useState([]);

  // Lógica para obtener las solicitudes de depósito desde el backend
  useEffect(() => {
    const fetchDepositRequests = async () => {
      try {
        const response = await fetch(
          `${Config.backendBaseUrlAdmin}getDepositRequests.php`,
          {
            method: "GET",
            credentials: "include",
          }
        );

        if (response.ok) {
          const data = await response.json();
          setDepositRequests(data);
        } else {
          console.error("Error al obtener las solicitudes de depósito");
          Swal.fire({
            title: "Error al obtener la lista de solicitudes",
            text: "Recargue la página e intente nuevamente",
            icon: "error",
          });
        }
      } catch (error) {
        console.error("Error al obtener las solicitudes de depósito:", error);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Error inesperado al obtener las solicitudes de depósito",
        });
      }
    };

    fetchDepositRequests();
  }, []);

  const handleItemClick = async (solicitud) => {
    try {
      // Obtener detalles específicos del depósito
      const response = await fetch(
        `${Config.backendBaseUrlAdmin}getDepositDetails.php?id=${solicitud.id}`,
        {
          method: "GET",
          credentials: "include",
        }
      );

      if (!response.ok) {
        console.error("Error al obtener detalles del depósito");
        Swal.fire({
          title: "Error al obtener detalles del depósito",
          text: "Hubo un error al obtener los detalles del depósito",
          icon: "error",
        });
        return;
      }

      const depositDetails = await response.json();

      // Mostrar el modal de SweetAlert2 con la información de la solicitud y los nuevos detalles
      const isPending = solicitud.status === "pending";

      let htmlContent = `
      <span>Información bancaria del usuario</span>
      <p><strong>Banco:</strong> ${depositDetails.account_name}</p>
      <p><strong>R.N (ACH):</strong> ${depositDetails.routing_number_ach}</p>
      <p><strong>R.N (WIRE):</strong> ${depositDetails.routing_number_wire}</p>
      <p><strong>Número de cuenta:</strong> ${depositDetails.account_number}</p>

      <span>Detalles del depósito</span>
      <p><strong>Método:</strong> ${solicitud.platform_type}</p>
      <p><strong>Fecha y Hora:</strong> ${solicitud.request_date} ${
        solicitud.request_time
      }</p>
      <p><strong>Monto:</strong> $${solicitud.amount}</p>
      <p><strong>Usuario:</strong> ${solicitud.user_name}</p>
      <p><strong>Estatus:</strong> ${solicitud.status}</p>
      <p><strong>Numero de referencia de la transacción:</strong> ${
        solicitud.reference_number || "No aplica"
      }</p>
      <p></p>
     
      `;

      // Agregar el campo platformEmail_user si no es null
      if (depositDetails.platformEmail_user !== null) {
        htmlContent += `
        <p><strong>Plataforma emisora:</strong>  ${depositDetails.platformName_user}</p>
        <p><strong>Email de la Plataforma:</strong> ${depositDetails.platformEmail_user}</p>
      <p></p>
        
        `;
      }

      // Agregar custom_fields si no está vacío
      if (
        depositDetails.is_personalizable === "yes" &&
        depositDetails.platformEmail_user === null
      ) {
        htmlContent += `
        <p><strong>Plataforma emisora (Personalizada):</strong>  ${depositDetails.user_platform_name}</p>

        <p><strong>Datos personalizados:</strong> ${depositDetails.custom_fields}</p>
      <p></p>
        
        `;
      }

      if (depositDetails.voucher_img !== null) {
        htmlContent += `
        <p>Comprobante</p>
        <img src="${Config.imgVoucher}${depositDetails.voucher_img}" alt="" />
        `;
      }

      Swal.fire({
        title: `Detalles de la Solicitud - ${solicitud.platform_type}`,
        html: htmlContent,
        confirmButtonText: "Marcar como Completado",
        cancelButtonText: "Denegar Operación",
        confirmButtonColor: "#28a745",
        cancelButtonColor: "#dc3545",
        showConfirmButton: isPending,
        showCancelButton: isPending,
        showCloseButton: true,
        footer:
          solicitud.status === "approved"
            ? '<button class="swal2-confirm swal2-styled" id="editButton">Editar</button>'
            : null,
      }).then((result) => {
        if (result.isConfirmed) {
          // Lógica para marcar como completado
          Swal.fire({
            title: "¿Estás seguro?",
            text: "Esta acción marcará la solicitud como completada.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Sí, Marcar como Completado",
            cancelButtonText: "Cancelar",
            confirmButtonColor: "#28a745",
            cancelButtonColor: "#dc3545",
          }).then((result) => {
            if (result.isConfirmed) {
              // Lógica para marcar como completado
              markAsCompleted(solicitud);
            }
          });
        } else if (result.dismiss === Swal.DismissReason.cancel) {
          // Lógica para denegar operación
          Swal.fire({
            title: "¿Estás seguro?",
            text: "Esta acción marcará la solicitud como denegada.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Sí, denegar solicitud",
            cancelButtonText: "Cancelar",
            confirmButtonColor: "#28a745",
            cancelButtonColor: "#dc3545",
          }).then((result) => {
            if (result.isConfirmed) {
              Swal.fire({
                title: "Motivo de Denegación",
                html: `
                  <form id="denialForm">
                    <div>
                      <input type="checkbox" id="refIncorrecto" name="reason" value="Numero de referencia incorrecto">
                      <label for="refIncorrecto">Número de referencia incorrecto</label>
                    </div>
                    <div>
                      <input type="checkbox" id="montoNoCoincide" name="reason" value="El monto de la operación no coincide con el depositado">
                      <label for="montoNoCoincide">El monto de la operación no coincide con el depositado</label>
                    </div>
                    <div>
                      <input type="checkbox" id="noSeEncuentraDeposito" name="reason" value="No se encuentra el depósito">
                      <label for="noSeEncuentraDeposito">No se encuentra el depósito</label>
                    </div>
                    <div>
                    <input type="checkbox" id="otra" name="reason" value="Otra">
                    <label for="otra">Otra</label>
                    <input class="swal2-input" type="text" id="otraMotivo" name="otraMotivo" placeholder="Especificar motivo" style="display:none;">
                  </div>
                  </form>
                `,
                focusConfirm: false,
                showCancelButton: true,
                confirmButtonText: "Denegar",
                cancelButtonText: "Cancelar",
              }).then((result) => {
                if (result.isConfirmed) {
                  const denialReasons = Array.from(
                    document.querySelectorAll('input[name="reason"]:checked')
                  )
                  .map((reasonCheckbox) => {
                    const value = reasonCheckbox.value;
                    return value === "Otra"
                      ? `${value}: ${
                          document.getElementById("otraMotivo").value
                        }`
                      : value;
                  })
                  .join(", ");


                  // Lógica para denegar la solicitud con motivos
                  denyRequest(solicitud.id, denialReasons);
                }
              });

              // Mostrar u ocultar el campo de entrada 'otraMotivo' según si 'Otra' está seleccionado
            const otraCheckbox = document.getElementById("otra");
            const otraMotivoInput = document.getElementById("otraMotivo");
            otraCheckbox.addEventListener("change", () => {
              otraMotivoInput.style.display = otraCheckbox.checked
                ? "block"
                : "none";
            });
            }
          });
        }
      });

      if (solicitud.status === "approved") {
        document.getElementById("editButton").addEventListener("click", () => {
          Swal.fire({
            title: "Editar Transacción",
            html: '<input id="newAmount" class="swal2-input" placeholder="Ingrese el nuevo monto">',
            showCancelButton: true,
            confirmButtonText: "Actualizar",
            cancelButtonText: "Cancelar",
            preConfirm: () => {
              let newAmount = document.getElementById("newAmount").value;
              // Eliminar las comas
              newAmount = newAmount.replace(/,/g, "");
              if (!newAmount || isNaN(newAmount)) {
                Swal.showValidationMessage(
                  "Por favor, ingrese un monto válido"
                );
              }
              return newAmount;
            },
          }).then((result) => {
            if (result.isConfirmed) {
              const newAmount = result.value;
              Swal.fire({
                title: "¿Estás seguro?",
                text: `¿Estás seguro que quieres actualizar el monto de $${solicitud.amount} por el monto $${newAmount}?`,
                icon: "warning",
                showCancelButton: true,
                confirmButtonText: "Sí, Actualizar",
                cancelButtonText: "Cancelar",
              }).then(async (result) => {
                if (result.isConfirmed) {
                  const response = await fetch(
                    `${Config.backendBaseUrlAdmin}updateDepositAmount.php?id=${solicitud.id}&newAmount=${newAmount}`,
                    {
                      method: "GET",
                      credentials: "include",
                      headers: {
                        "Content-Type": "application/json",
                      },
                    }
                  );

                  if (response.ok) {
                    Swal.fire({
                      title: "¡Completado!",
                      text: "El monto ha sido actualizado exitosamente.",
                      icon: "success",
                      didClose: () => {
                        window.location.reload();
                      },
                    });
                  } else {
                    console.error("Error al actualizar el monto");
                    Swal.fire(
                      "Error",
                      "Hubo un error al actualizar el monto",
                      "error"
                    );
                  }
                }
              });
            }
          });
          document
            .getElementById("newAmount")
            .addEventListener("input", (event) => {
              const numericAmount = event.target.value.replace(/[^\d]/g, "");
              const formattedAmount = new Intl.NumberFormat("en-US", {
                style: "decimal",
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              }).format(parseFloat(numericAmount) / 100);
              event.target.value = formattedAmount;
            });
        });
      }
    } catch (error) {
      console.error("Error al manejar la solicitud de detalles:", error);
      Swal.fire({
        title: "Error",
        text: "Error inesperado al manejar la solicitud de detalles",
        icon: "error",
      });
    }
  };

  const denyRequest = async (depositRequestId, denialReasons) => {
    if (denialReasons === "") {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Debe seleccionar al menos un motivo",
      });
      return;
    }
    try {
      const response = await fetch(
        `${Config.backendBaseUrlAdmin}denyDepositRequest.php?id=${depositRequestId}`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ denialReasons }),
        }
      );

      if (response.ok) {
        // Puedes realizar acciones adicionales si es necesario
        Swal.fire({
          title: "¡Completado!",
          text: "La solicitud ha sido marcada como denegada.",
          icon: "success",
          didClose: () => {
            window.location.reload();
          },
        });
      } else {
        console.error("Error al denegar la solicitud");
        Swal.fire("Error", "Hubo un error al denegar la solicitud", "error");
      }
    } catch (error) {
      console.error("Error al denegar la solicitud:", error);
      Swal.fire("Error", "Error inesperado al denegar la solicitud", "error");
    }
  };

  const markAsCompleted = async (depositRequest) => {

    const { isConfirmed } = await Swal.fire({
      title: 'Confirmación',
      text: `¿Estás seguro de que deseas aprobar esta solicitud por el monto de ${depositRequest.amount}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, aprobar',
      cancelButtonText: 'cancelar'
    });
  
    if (isConfirmed) {
    if (depositRequest.payment_method === "cash") {
      if (depositRequest.address === null) {
        const { value: depositAddress, dismiss } = await Swal.fire({
          title: "Ingrese la dirección de depósito",
          input: "text",
          inputLabel: "Dirección de depósito",
          inputPlaceholder: "Ingrese la dirección aquí...",
          showCancelButton: true,
          confirmButtonText: "Enviar",
          cancelButtonText: "Cancelar",
        });

        if (depositAddress.trim() === "") {
          Swal.fire({
            title: "Error",
            text: "La dirección no puede estar vacía",
            icon: "warning",
          });
          return;
        }

        if (depositAddress !== undefined && depositAddress.trim() !== "") {
          try {
            const response = await fetch(
              `${Config.backendBaseUrlAdmin}completedDepositRequest.php?id=${depositRequest.id}&depositAddress=${depositAddress}`,
              {
                method: "POST",
                credentials: "include",
                headers: {
                  "Content-Type": "application/json",
                },
              }
            );

            if (response.ok) {
              Swal.fire({
                title: "¡Completado!",
                text: "La solicitud ha sido marcada como pendiente.",
                icon: "success",
                didClose: () => {
                  window.location.reload();
                },
              });
            } else {
              console.error("Error al marcar como pendiente");
              Swal.fire(
                "Error",
                "Hubo un error al marcar la solicitud como completada",
                "error"
              );
            }
          } catch (error) {
            console.error("Error al marcar como completado:", error);
            Swal.fire(
              "Error",
              "Error inesperado al marcar la solicitud como completada",
              "error"
            );
          }
        } else if (dismiss === Swal.DismissReason.cancel) {
          // User clicked on "Cancelar"
          Swal.fire("Cancelado", "No se ha enviado la solicitud", "info");
        }
      } else {
        try {
          const response = await fetch(
            `${Config.backendBaseUrlAdmin}completedDepositRequest.php?id=${depositRequest.id}`,
            {
              method: "POST",
              credentials: "include",
              headers: {
                "Content-Type": "application/json",
              },
            }
          );

          if (response.ok) {
            Swal.fire({
              title: "¡Completado!",
              text: "La solicitud ha sido marcada como completada.",
              icon: "success",
              didClose: () => {
                window.location.reload();
              },
            });
          } else {
            console.error("Error al marcar como completado");
            Swal.fire(
              "Error",
              "Hubo un error al marcar la solicitud como completada",
              "error"
            );
          }
        } catch (error) {
          console.error("Error al marcar como completado:", error);
          Swal.fire(
            "Error",
            "Error inesperado al marcar la solicitud como completada",
            "error"
          );
        }
      }
    } else {
      try {
        const response = await fetch(
          `${Config.backendBaseUrlAdmin}completedDepositRequest.php?id=${depositRequest.id}`,
          {
            method: "POST",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (response.ok) {
          Swal.fire({
            title: "¡Completado!",
            text: "La solicitud ha sido marcada como completada.",
            icon: "success",
            didClose: () => {
              window.location.reload();
            },
          });
        } else {
          console.error("Error al marcar como completado");
          Swal.fire(
            "Error",
            "Hubo un error al marcar la solicitud como completada",
            "error"
          );
        }
      } catch (error) {
        console.error("Error al marcar como completado:", error);
        Swal.fire(
          "Error",
          "Error inesperado al marcar la solicitud como completada",
          "error"
        );
      }
    }

  }

    // Verificar si el usuario hizo clic en "Enviar"
  };

  const formatAmount = (amount) => {
    const numericAmount = amount.replace(/[^\d]/g, "");

    // Formatear con separador de miles y decimales
    const formattedAmount = new Intl.NumberFormat("en-US", {
      style: "decimal",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(parseFloat(numericAmount) / 100);

    return formattedAmount;
  };

  return (
    <div className="depositos_admin">
      <div className="title">
        <h2>Depósitos</h2>
      </div>

      {depositRequests.length === 0 ? (
        <p>No hay solicitudes de depósito.</p>
      ) : (
        <div className="lista_depositos">
          {depositRequests.map((solicitud, index) => (
            <ul key={index} onClick={() => handleItemClick(solicitud)}>
              <li>
                <div className="icono">
                  <AddOutlinedIcon />
                </div>
              </li>

              <li>
                <h2>Depositar</h2>
                <span>{solicitud.platform_type}</span>
              </li>

              <li>
                <h2>Fecha</h2>
                <span>
                  {solicitud.request_date} {solicitud.request_time}
                </span>
              </li>

              <li className="monto">
                <h2>Monto</h2>
                <span>${formatAmount(solicitud.amount)}</span>
              </li>

              <li>
                <h2>Usuario</h2>
                <span>{solicitud.user_name}</span>
              </li>

              <li className={`estatus ${solicitud.status}`}>
                <h2>Estatus</h2>
                <span>{solicitud.status}</span>
              </li>
            </ul>
          ))}
        </div>
      )}
    </div>
  );
};

export default Depositos_a;
