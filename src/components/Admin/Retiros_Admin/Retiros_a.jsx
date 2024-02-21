import "./Style.css";
import HorizontalRuleOutlinedIcon from "@mui/icons-material/HorizontalRuleOutlined";
import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import Config from "../../../Config";

const Retiros_a = () => {
  const [withdrawalRequests, setWithdrawalRequests] = useState([]);

  // obtener lista de solicitudes del backend
  useEffect(() => {
    const fetchWithdrawalRequests = async () => {
      try {
        const response = await fetch(
          `${Config.backendBaseUrlAdmin}getWithdrawalRequests.php`,
          {
            method: "GET",
            credentials: "include",
          }
        );

        if (response.ok) {
          const data = await response.json();
          setWithdrawalRequests(data);
        } else {
          console.error("Error al obtener las solicitudes de retiro");
          Swal.fire({
            title: "Error al obtener la lista de solicitudes",
            text: "Recargue la página e intente nuevamente",
            icon: "error",
          });
        }
      } catch (error) {
        console.error("Error al obtener las solicitudes de retiro:", error);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Error inesperado al obtener las solicitudes de retiro",
        });
      }
    };

    fetchWithdrawalRequests();
  }, []);

  const getTransactionType = (withdrawalRequest) => {
    switch (withdrawalRequest.method) {
      case "transferencia_entre_usuarios":
        return "Transferencia";
      case "transferencia_nacional":
        return "Transferencia Nacional";
      case "efectivo":
        return "Efectivo";
      case "transferencia_externa":
        return withdrawalRequest.region === "usa"
          ? "Transferencia Externa (USA)"
          : "Transferencia Externa (EUROPA)";
      default:
        return withdrawalRequest.method;
    }
  };

  const handleItemClick = (withdrawalRequest) => {
    const isPending = withdrawalRequest.status === "pending";

    let modalContent = `
      <span>Detalles del retiro</span>
      <p><strong>Tipo:</strong> ${getTransactionType(withdrawalRequest)}</p>
      <p><strong>Fecha y Hora:</strong> ${withdrawalRequest.request_date} ${
      withdrawalRequest.request_time
    }</p>
      <p><strong>Monto:</strong> $${withdrawalRequest.amount}</p>
      <p><strong>Usuario:</strong> ${withdrawalRequest.user_name}</p>
      <p><strong>Estatus:</strong> ${withdrawalRequest.status}</p>
    `;

    // Modificar el contenido del modal según el tipo de transacción
    switch (withdrawalRequest.method) {
      case "efectivo":
        modalContent += `
      `;
        break;
      case "transferencia_entre_usuarios":
        modalContent += `
        <p><strong>Correo del Emisor:</strong> ${withdrawalRequest.sender_email}</p>
        <p><strong>Correo del Receptor:</strong> ${withdrawalRequest.recipient_email}</p>
      `;
        break;
      case "transferencia_nacional":
        modalContent +=
          withdrawalRequest.method_arg === "virtual"
            ? `
          <h4>Tipo de Pago<h4>
          <span>${withdrawalRequest.method_arg}<span>
          <p>Alias / CBU: ${withdrawalRequest.alias_cbu}</p>
          <p>CUIT / CUIL: ${withdrawalRequest.cuit_cuil}</p>
          <p>Nombre de la cuenta: ${withdrawalRequest.name_account_arg}</p>
          <p></p>
          `
            : `
          <h4>Tipo de Pago<h4>
          <span>${withdrawalRequest.method_arg}<span>
          <p>Alias / CBU: ${withdrawalRequest.alias_cbu}</p>
          <p>CUIT / CUIL: ${withdrawalRequest.cuit_cuil}</p>
          <p>Nombre de la cuenta: ${withdrawalRequest.name_account_arg}</p>
          <p>Caja de ahorros / cuenta corriente: ${withdrawalRequest.num_cuenta_arg}</p>
          <p></p>
          `;

        break;
      case "transferencia_externa":
        modalContent +=
          withdrawalRequest.region === "usa"
            ? `
            <p><strong>Banco:</strong> ${withdrawalRequest.bank_name}</p>
            <p><strong>Routing Number (ACH):</strong> ${withdrawalRequest.routing_number_ach}</p>
            <p><strong>Routing Number (WIRE):</strong> ${withdrawalRequest.routing_number_wire}</p>
            <p><strong>Dirección del Banco:</strong> ${withdrawalRequest.bank_address}</p>
            <p><strong>Número de Cuenta:</strong> ${withdrawalRequest.account_number}</p>
            <p><strong>Beneficiario:</strong> ${withdrawalRequest.beneficiary}</p>
            <p></p>
        `
            : `
          <p><strong>Nombre del banco:</strong> ${withdrawalRequest.bank_name_eu}</p>
          <p><strong>SWIFT/BIC:</strong> ${withdrawalRequest.swift_bic_eu}</p>
          <p><strong>Dirección del banco:</strong> ${withdrawalRequest.address_bank_eu}</p>
          <p><strong>Numero de cuenta:</strong> ${withdrawalRequest.account_number_eu}</p>
          <p><strong>Sort code:</strong> ${withdrawalRequest.sort_code_eu}</p>
          <p><strong>IBAN:</strong> ${withdrawalRequest.iban}</p>
          <p></p>
        `;
        break;
      default:
        break;
    }

    Swal.fire({
      title: `Detalles de Retiro `,
      html: modalContent,
      confirmButtonText: "Marcar Completado",
      cancelButtonText: "Denegar Operación",
      confirmButtonColor: "#28a745",
      cancelButtonColor: "#dc3545",
      showConfirmButton: isPending,
      showCancelButton: isPending,
      showCloseButton: true,
    }).then((result) => {
      if (result.isConfirmed) {
        const additionalInfoInput = document.getElementById(
          withdrawalRequest.method === "efectivo"
            ? "withdrawalAddress"
            : "referenceNumber"
        );

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
            markAsCompleted(
              withdrawalRequest.id,
              additionalInfoInput ? additionalInfoInput.value : null
            );
          }
        });
      } else if (result.dismiss === Swal.DismissReason.cancel) {
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
                    <input type="checkbox" id="datosIncorrectos" name="reason" value="Datos de la cuenta incorrectos">
                    <label for="datosIncorrectos">Datos de la cuenta incorrectos</label>
                  </div>
                  <div>
                    <input type="checkbox" id="montoExcede" name="reason" value="Monto excede la capacidad máxima">
                    <label for="montoExcede">Monto excede la capacidad máxima</label>
                  </div>
                  <div>
                    <input type="checkbox" id="otra" name="reason" value="Otra">
                    <label for="otra">Otra</label>
                    <input type="text" id="otraMotivo" name="otraMotivo" placeholder="Especificar motivo" style="display:none;">
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

                denyRequest(withdrawalRequest.id, denialReasons);
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
  };

  const denyRequest = async (withdrawalRequestId, denialReasons) => {
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
        `${Config.backendBaseUrlAdmin}denyWithdrawalRequest.php?id=${withdrawalRequestId}`,
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
        Swal.fire({
          title: "¡Completado!",
          text: "La solicitud ha sido marcada como denegada.",
          icon: "success",
          didClose: () => {
            window.location.reload();
          },
        });
      } else {
        console.error("Error al denegar la solicitud de retiro");
        Swal.fire(
          "Error",
          "Hubo un error al denegar la solicitud de retiro",
          "error"
        );
      }
    } catch (error) {
      console.error("Error al denegar la solicitud de retiro:", error);
      Swal.fire(
        "Error",
        "Error inesperado al denegar la solicitud de retiro",
        "error"
      );
    }
  };

  const markAsCompleted = async (withdrawalRequestId) => {
    try {
      const withdrawalRequest = withdrawalRequests.find(
        (request) => request.id === withdrawalRequestId
      );
      const isExternalTransfer =
        withdrawalRequest.method === "transferencia_externa";
      const swalTitle = "Marcar como Completado";
      let swalContent = "";

      if (isExternalTransfer) {
        swalContent = `
                <p>Por favor, ingresa el número de referencia de la transacción:</p>
                <input class="swal2-input" type="text" id="transactionReference" required>
            `;
      } else if (withdrawalRequest.method === "transferencia_nacional") {
        swalContent = `
                <p>Por favor, ingresa el número de referencia de la transacción:</p>
                <input class="swal2-input" type="text" id="transactionReference" required>
            `;
      } else if (withdrawalRequest.method === "efectivo") {
        swalContent = `
                <p>Por favor, ingresa la dirección de retiro:</p>
                <input class="swal2-input" type="text" id="withdrawalAddress" required>
            `;
      }

      const { value } = await Swal.fire({
        title: swalTitle,
        html: swalContent,
        confirmButtonText: "Confirmar",
        cancelButtonText: "Cancelar",
        confirmButtonColor: "#28a745",
        cancelButtonColor: "#dc3545",
        showCancelButton: true,
        preConfirm: async () => {
          if (isExternalTransfer || withdrawalRequest.method === "transferencia_nacional") {
            const transactionReference = document.getElementById("transactionReference").value;
  
            // Validate that the input is not empty
            if (!transactionReference) {
              Swal.showValidationMessage("Este campo es obligatorio.");
              return;
            }
  
            // Realizar la llamada al backend para completar la solicitud
            await completeWithdrawalRequest(withdrawalRequestId, {
              transactionReference,
            });
          } else if (withdrawalRequest.method === "efectivo") {
            const withdrawalAddress = document.getElementById("withdrawalAddress").value;
  
            // Validate that the input is not empty
            if (!withdrawalAddress) {
              Swal.showValidationMessage("Este campo es obligatorio.");
              return;
            }
  
            // Realizar la llamada al backend para completar la solicitud
            await completeWithdrawalRequest(withdrawalRequestId, {
              withdrawalAddress,
            });
          }
        },
      });

      if (value) {
        // Luego, puedes recargar la página o realizar las acciones necesarias
        Swal.fire({
          title: "¡Completado!",
          text: "La solicitud ha sido marcada como completada.",
          icon: "success",
          didClose: () => {
            window.location.reload();
          },
        });
      }
    } catch (error) {
      console.error(
        "Error al marcar como completada la solicitud de retiro:",
        error
      );
      Swal.fire(
        "Error",
        "Error inesperado al marcar la solicitud de retiro como completada",
        "error"
      );
    }
  };

  const completeWithdrawalRequest = async (withdrawalRequestId, data) => {
    try {
      const response = await fetch(
        `${Config.backendBaseUrlAdmin}completedWithdrawalRequest.php?id=${withdrawalRequestId}`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        }
      );

      console.log(data);

      if (!response.ok) {
        console.error("Error al completar la solicitud de retiro");
        Swal.fire(
          "Error",
          "Hubo un error al completar la solicitud de retiro",
          "error"
        );
      }
    } catch (error) {
      console.error("Error al completar la solicitud de retiro:", error);
      Swal.fire(
        "Error",
        "Error inesperado al completar la solicitud de retiro",
        "error"
      );
    }
  };

  return (
    <div className="retiros_admin">
      <div className="title">
        <h2>Retiros</h2>
      </div>

      {withdrawalRequests.length === 0 ? (
        <p>No hay solicitudes de retiro.</p>
      ) : (
        <div className="lista_retiros">
          {withdrawalRequests.map((withdrawalRequest, index) => (
            <ul key={index} onClick={() => handleItemClick(withdrawalRequest)}>
              <li>
                <div className="icono">
                  <HorizontalRuleOutlinedIcon />
                </div>
              </li>

              <li>
                <h2>Retiro</h2>
                <span>
                  {withdrawalRequest.method === "transferencia_entre_usuarios"
                    ? "Transferencia"
                    : withdrawalRequest.method === "transferencia_nacional"
                    ? "Nacional"
                    : withdrawalRequest.method === "efectivo"
                    ? "Efectivo"
                    : withdrawalRequest.method === "transferencia_externa"
                    ? withdrawalRequest.region === "usa"
                      ? "Transferencia Externa (USA)"
                      : "Transferencia Externa (EUROPA)"
                    : withdrawalRequest.method}
                </span>
              </li>

              <li>
                <h2>Fecha</h2>
                <span>
                  {withdrawalRequest.request_date}{" "}
                  {withdrawalRequest.request_time}
                </span>
              </li>

              <li className="monto">
                <h2>Monto</h2>
                <span>${withdrawalRequest.amount}</span>
              </li>

              <li>
                <h2>Usuario</h2>
                <span>{withdrawalRequest.user_name}</span>
              </li>

              <li className={`estatus ${withdrawalRequest.status}`}>
                <h2>Estatus</h2>
                <span>{withdrawalRequest.status}</span>
              </li>
            </ul>
          ))}
        </div>
      )}
    </div>
  );
};

export default Retiros_a;
