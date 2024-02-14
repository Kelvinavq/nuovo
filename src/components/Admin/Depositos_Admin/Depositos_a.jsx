import React, { useState, useEffect } from "react";
import "./Style.css";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import Swal from "sweetalert2";

const Depositos_a = () => {
  const [depositRequests, setDepositRequests] = useState([]);

  // Lógica para obtener las solicitudes de depósito desde el backend
  useEffect(() => {
    const fetchDepositRequests = async () => {
      try {
        const response = await fetch(
          "http://localhost/nuovo/backend/Api/admin/getDepositRequests.php",
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
        `http://localhost/nuovo/backend/Api/admin/getDepositDetails.php?id=${solicitud.id}`,
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
      <img src="http://localhost/nuovo/src/assets/vouchers/${
        depositDetails.voucher_img
      }" alt="" />
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
      if (depositDetails.is_personalizable === "yes" &&  depositDetails.platformEmail_user === null) {
        htmlContent += `
        <p><strong>Plataforma emisora (Personalizada):</strong>  ${depositDetails.user_platform_name}</p>

        <p><strong>Datos personalizados:</strong> ${depositDetails.custom_fields}</p>
      <p></p>
        
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
              markAsCompleted(solicitud.id);
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
                    .map((reasonCheckbox) => reasonCheckbox.value)
                    .join(", ");

                  // Lógica para denegar la solicitud con motivos
                  denyRequest(solicitud.id, denialReasons);
                }
              });
            }
          });
        }
      });
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
        `http://localhost/nuovo/backend/Api/admin/denyDepositRequest.php?id=${depositRequestId}`,
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

  const markAsCompleted = async (depositRequestId) => {
    try {
      const response = await fetch(
        `http://localhost/nuovo/backend/Api/admin/completedDepositRequest.php?id=${depositRequestId}`,
        {
          method: "POST",
          credentials: "include",
        }
      );

      if (response.ok) {
        // Puedes realizar acciones adicionales si es necesario

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
  };

  return (
    <div className="depositos_admin">
      <div className="title">
        <h2>Solicitudes de Depósito</h2>
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
                <span>${solicitud.amount}</span>
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
