import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import "./Style.css";

const Verificaciones_a = () => {
  const [solicitudes, setSolicitudes] = useState([]);

  useEffect(() => {
    // Obtener la lista de solicitudes de verificación al cargar el componente
    const obtenerSolicitudes = async () => {
      try {
        const response = await fetch(
          "http://localhost/nuovo/backend/api/admin/getVerificationRequests.php",
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

    obtenerSolicitudes();
  }, []); // La dependencia vacía asegura que se ejecute solo una vez al montar el componente

  // Función para manejar clic en una solicitud
  const handleClick = (solicitud) => {
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
      <p>Direccióno</p>
      <p>${solicitud.address}</p>
    </div>

    <div className="grupo-input img">
      <p>Foto del DNI</p>
      <img src="http://localhost:5173/src/assets/user_dni/${solicitud.dni_image}" alt="Foto del DNI" />
    </div>

    <div className="grupo-input img">
      <p>Foto selfie con el DNI</p>
      <img src="http://localhost:5173/src/assets/user_selfie/${solicitud.selfie_with_dni_image}" alt="Foto del Selfie con DNI" />
    </div>
          `,
      showCancelButton: true,
      confirmButtonColor: "#28a745",
      cancelButtonColor: "#d33",
      confirmButtonText: "Aprobar",
      cancelButtonText: "Denegar",
      showCloseButton: true,
      customClass: {
        container: 'mi-swalert-container', 
        popup: 'mi-swalert-verificacion', 
      },
    }).then(async (result) => {
      if (result.isConfirmed) {
        // Lógica para aprobar la solicitud
        try {
          const response = await fetch(
            "http://localhost/nuovo/backend/api/admin/approvalVerification.php",
            {
              method: "POST",
              mode: "cors",
              credentials: "include",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                verificationId: solicitud.id,
                action: 'approve',
              }),
            }
          );

          const responseData = await response.json();

          if (response.ok) {
            // Solicitud aprobada exitosamente
            Swal.fire({
              title: "Solicitud aprobada exitosamente",
              icon: "success",
              timer: 2000,
              didClose: () =>{
                window.location.reload(false);
              }
            });
            console.log("Solicitud aprobada:", responseData.message);
          } else {
            // Manejar errores de la solicitud
            Swal.fire({
              title: "Hubo un error al procesar la solicitud",
              text: "Recargue la página e intente nuevamente",
              icon: "success",
              timer: 2000,
              didClose: () =>{
                window.location.reload(false);
              }
            });
            console.error("Error al aprobar la solicitud:", responseData.error);
          }
        } catch (error) {
          // Manejar errores de red, etc.
          console.error("Error al aprobar la solicitud:", error);
        }
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        // Lógica para denegar la solicitud
        try {
          const response = await fetch(
            "http://localhost/nuovo/backend/api/admin/approvalVerification.php",
            {
              method: "POST",
              mode: "cors",
              credentials: "include",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                verificationId: solicitud.id,
                action: 'deny',
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
              didClose: () =>{
                window.location.reload(false);
              }
            });
            console.log("Solicitud denegada:", responseData.message);
          } else {
            // Manejar errores de la solicitud
            Swal.fire({
              title: "Hubo un error al procesar la solicitud",
              text: "Recargue la página e intente nuevamente",
              icon: "success",
              timer: 2000,
              didClose: () =>{
                window.location.reload(false);
              }
            });
            console.error("Error al denegar la solicitud:", responseData.error);
          }
        } catch (error) {
          // Manejar errores de red, etc.
          console.error("Error al denegar la solicitud:", error);
        }
      }
    });
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
              <div className="icono">{solicitud.name.charAt(0)}</div>
            </li>

            <li>
              <h2>Usuario</h2>
              <span>{solicitud.name}</span>
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
