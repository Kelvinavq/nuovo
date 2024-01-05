import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import Enlaces_a from "./Enlaces_a";

const Plataformas_a = () => {

  const [formData, setFormData] = useState({
    platformType: "",
    customField: "",
    platformName: "",
  });
  const [platforms, setPlatforms] = useState([]);

  useEffect(() => {
    // Lógica para obtener la lista de plataformas desde el backend
    const fetchPlatforms = async () => {
      try {
        const response = await fetch("http://localhost/nuovo/backend/api/admin/getPlatforms.php");
        const data = await response.json();
        setPlatforms(data);
      } catch (error) {
        console.error("Error fetching platforms:", error);
      }
    };

    fetchPlatforms();
  }, []);


  const handleEditPlatform = (platformId) => {
    const platformToEdit = platforms.find((platform) => platform.id === platformId);

    Swal.fire({
      title: "Editar Plataforma",
      html: `
        <input type="text" id="editCustomField" value="${platformToEdit.customField}" class="swal2-input" required>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: "Guardar",
      cancelButtonText: "Cancelar",
      preConfirm: () => {
        const newCustomField = document.getElementById("editCustomField").value;
        return {
          platformId: platformId,
          newCustomField: newCustomField,
        };
      },
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          // Enviar datos al backend para la actualización
          const response = await fetch(
            "http://localhost/nuovo/backend/api/admin/updatePlatform.php",
            {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(result.value),
            }
          );

          const responseData = await response.json();

          if (response.ok) {
            Swal.fire({
              title: "Plataforma actualizada con éxito",
              icon: "success",
              timer: 2000,
            });
            // Actualizar la lista de plataformas después de la edición
            setPlatforms((prevPlatforms) =>
              prevPlatforms.map((platform) =>
                platform.id === platformId ? { ...platform, customField: result.value.newCustomField } : platform
              )
            );
          } else {
            Swal.fire({
              title: "Error al actualizar la plataforma",
              text: "Recargue la página e intente nuevamente",
              icon: "error",
              timer: 2000,
            });
            console.error("Error al actualizar la plataforma:", responseData.error);
          }
        } catch (error) {
          Swal.fire({
            title: "Error al actualizar la plataforma",
            text: "Recargue la página e intente nuevamente",
            icon: "error",
            timer: 2000,
          });
          console.error("Error al actualizar la plataforma:", error);
        }
      }
    });
  };

  

  const handleAddPlatform = async () => {
    try {
      const { value: formValues } = await Swal.fire({
        title: "Agregar Nueva Plataforma",
        html: `
        <select id="platformType" name="platformType" class="swal2-input" required>
          <option value="">Seleccione una plataforma</option>
          <option value="PayPal">PayPal</option>
          <option value="Skrill">Skrill</option>
          <option value="Wise">Wise</option>
          <option value="Otra">Otra</option>
        </select>
        <div id="emailField" style="display: none;">
          <input type="email" name="emailCustomField" placeholder="Ingrese correo electrónico" class="swal2-input" required>
        </div>
        <div id="otherField" style="display: none;">
          <input type="text" name="platformName" placeholder="Nombre de la plataforma" class="swal2-input" required>
          <input type="text" name="customField" placeholder="Valor del campo" class="swal2-input" required>
        </div>
      `,
        focusConfirm: false,
        showCancelButton: true,
        confirmButtonText: "Agregar",
        cancelButtonText: "Cancelar",
        preConfirm: () => {
          const selectedPlatform =
            document.getElementsByName("platformType")[0].value;
          const emailField = document.getElementById("emailField");
          const otherField = document.getElementById("otherField");

          if (selectedPlatform === "") {
            // Si se selecciona "Seleccione una plataforma", oculta todos los campos
            emailField.style.display = "none";
            otherField.style.display = "none";
          } else if (selectedPlatform === "Otra") {
            // Si se selecciona "Otra", muestra solo el campo "otherField"
            emailField.style.display = "none";
            otherField.style.display = "block";
          } else {
            // Si se selecciona una plataforma diferente, muestra solo el campo "emailField"
            emailField.style.display = "block";
            otherField.style.display = "none";
          }

          return {
            platformType: selectedPlatform,
            customField: selectedPlatform === "Otra"
              ? document.querySelector('input[name="customField"]').value
              : document.querySelector('input[name="emailCustomField"]').value,
            platformName: document.getElementsByName("platformName")[0]?.value,
          };
        },
        didOpen: () => {
          const platformTypeSelect =
            document.getElementsByName("platformType")[0];

          platformTypeSelect.addEventListener("change", () => {
            const selectedPlatform = platformTypeSelect.value;
            const emailField = document.getElementById("emailField");
            const otherField = document.getElementById("otherField");

            if (selectedPlatform === "") {
                emailField.style.display = "none";
                otherField.style.display = "none";
              } else if (selectedPlatform === "Otra") {
                emailField.style.display = "none";
                otherField.style.display = "block";
              } else {
                emailField.style.display = "block";
                otherField.style.display = "none";
              }
          });
        },
      });

      if (formValues) {
        console.log(formValues)

        // Enviar datos al backend
        const response = await fetch(
          "http://localhost/nuovo/backend/api/admin/createPlatform.php",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(formValues),
          }
        );

        const responseData = await response.json();

        if (response.ok) {

          Swal.fire({
            title: "Plataforma creada con éxito",
            icon: "success",
            timer: 2000,
            didClose: () => {
            //   window.location.reload();
            },
          });
        } else {
          // Manejar errores de la solicitud al backend
          Swal.fire({
            title: "Error al registrar la plataforma",
            text: "Recargue la página e intente nuevamente",
            icon: "error",
            timer: 2000,
            didClose: () => {
            //   window.location.reload();
            },
          });
          console.error("Error al agregar la plataforma:", responseData.error);
        }
      }
    } catch (error) {
        Swal.fire({
            title: "Error al registrar la plataforma",
            text: "Recargue la página e intente nuevamente",
            icon: "error",
            timer: 2000,
            didClose: () => {
            //   window.location.reload();
            },
          });
      console.error("Error al agregar nueva plataforma:", error);
    }
  };

  return (
    <div className="plataforma_a">
      <div className="content">
        <div className="title">
          <h2>Plataformas</h2>
          <button onClick={handleAddPlatform}>Agregar nueva plataforma</button>
        </div>
        <Enlaces_a />

        <h3>Lista de Plataformas</h3>
          <ul>
            {platforms.map((platform) => (
              <li key={platform.id}>
                {platform.platformType === "Otra"

                  ? `${platform.platformName}: ${platform.value}`
                  : platform.platformName + ": " + platform.value}

                <button onClick={() => handleEditPlatform(platform.id)}>Editar</button>
              </li>
            ))}
          </ul>
      </div>
    </div>
  );
};

export default Plataformas_a;
