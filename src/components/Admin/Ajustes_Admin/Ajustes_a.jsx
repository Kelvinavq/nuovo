import foto from "../../../assets/icons/usuario.png";
import CameraAltOutlinedIcon from "@mui/icons-material/CameraAltOutlined";
import "./Style.css";
import Enlaces_a from "./Enlaces_a";

import { useEffect, useState } from "react";
import Swal from "sweetalert2";

const Ajustes_a = () => {
  const [userData, setUserData] = useState({});
  const [newProfilePicture, setNewProfilePicture] = useState(null);

  function refreshPage() {
    window.location.reload(false);
  }

  useEffect(() => {
    // Obtener información del usuario al cargar el componente
    fetch("http://localhost/nuovo/backend/Api/admin/getUserInfo.php", {
      method: "GET",
      credentials: "include",
    })
      .then((response) => response.json())
      .then((data) => setUserData(data))
      .catch((error) =>
        console.error("Error al obtener información del usuario", error)
      );
  }, []);

  const handleFileChange = (event) => {
    const file = event.target.files[0];

    // Validar la extensión del archivo
    const allowedExtensions = /\.(png|jpg|jpeg)$/i;
    if (!allowedExtensions.test(file.name)) {
      Swal.fire({
        title: "Error",
        icon: "error",
        text: "Por favor, selecciona un archivo de imagen válido (png, jpg, jpeg).",
      });
      return;
    }

    setNewProfilePicture(file);

    // Mostrar la ventana de Swal al seleccionar una imagen
    Swal.fire({
      title: "¿Estás seguro de actualizar tu foto de perfil?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Sí, actualizar",
      cancelButtonText: "Cancelar",
    }).then((result) => {
      if (result.isConfirmed) {
        // Crear un objeto FormData y agregar la nueva imagen
        const formData = new FormData();
        formData.append("profile_picture", file);

        // Enviar la nueva imagen al servidor
        fetch("http://localhost/nuovo/backend/Api/admin/updateProfilePicture.php", {
          method: "POST",
          credentials: "include",
          body: formData,
        })
          .then((response) => response.json())
          .then((data) => {
            // Actualizar la información del usuario en el estado
            setUserData((prevData) => ({
              ...prevData,
              profile_picture: data.newProfilePictureName,
            }));

            // Restablecer el estado de la nueva imagen
            setNewProfilePicture(null);

            Swal.fire("¡Foto de perfil actualizada!", "", "success");
            refreshPage();
          })
          .catch((error) =>
            console.error("Error al actualizar la foto de perfil", error)
          );
      } else {
        // Restablecer el estado si el usuario cancela la actualización
        setNewProfilePicture(null);
      }
    });
  };

  return (
    <div className="ajustes_a">
      <div className="content">
        <h2>Ajustes</h2>
        <Enlaces_a />

        <div className="imgPerfil">
          <div className="foto">
            <img
              src={`http://localhost/nuovo/src/assets/users/${userData.profile_picture}`}
              alt=""
            />
            <div className="input">
              <input
                type="file"
                name="profile_picture"
                id="profile_picture"
                onChange={handleFileChange}
              />
              <label htmlFor="profile_picture">
                <CameraAltOutlinedIcon />
              </label>
            </div>
          </div>

          <div className="text">
            <h2>{userData.name}</h2>
            <p>{userData.email}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Ajustes_a;
