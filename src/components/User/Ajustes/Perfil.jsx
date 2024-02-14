import Saldo from "../Saldo/Saldo";
import Enlaces from "./Enlaces";
import CameraAltOutlinedIcon from "@mui/icons-material/CameraAltOutlined";
import { useEffect, useState, useContext } from "react";
import Swal from "sweetalert2";
import Pusher from "pusher-js";
import Notification from "../Notification/Notification";

import { LanguageContext } from "../../../Language/LanguageContext";
import { Translation } from "./Translation";
import LanguageSelector from "../../Selector/LanguageSelector";

const Perfil = () => {
  const { language } = useContext(LanguageContext);

  const [userData, setUserData] = useState({});
  const [newProfilePicture, setNewProfilePicture] = useState(null);

  function refreshPage() {
    window.location.reload(false);
  }

  useEffect(() => {
    // Obtener información del usuario al cargar el componente
    fetch("http://localhost/nuovo/backend/Api/getUserInfo.php", {
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
        text: Translation[language].swalMessage1,
      });
      return;
    }

    setNewProfilePicture(file);

    // Mostrar la ventana de Swal al seleccionar una imagen
    Swal.fire({
      title: Translation[language].swalTitle1,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: Translation[language].swalButton1,
      cancelButtonText: Translation[language].swalButton2,
    }).then((result) => {
      if (result.isConfirmed) {
        // Crear un objeto FormData y agregar la nueva imagen
        const formData = new FormData();
        formData.append("profile_picture", file);

        // Enviar la nueva imagen al servidor
        fetch("http://localhost/nuovo/backend/Api/updateProfilePicture.php", {
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

            Swal.fire(Translation[language].swalMessage2, "", "success");
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

  const [notifications, setNotifications] = useState([]);
  useEffect(() => {
    const pusher = new Pusher("afe7fd857579ff4b05d7", {
      cluster: "mt1",
      encrypted: true,
    });

    const channel = pusher.subscribe("canal");
    channel.bind("evento", (data) => {
      // Manejar la notificación recibida
      setNotifications((prevNotifications) => [...prevNotifications, data]);
    });

    // Limpieza al desmontar el componente
    return () => {
      channel.unbind();
      pusher.unsubscribe("canal");
    };
  }, []);

  return (
    <div className="ajustes_perfil">
      <Saldo />

      <div className="content">
        <h2>{Translation[language].title}</h2>
        {notifications.map((notification, index) => (
          <li key={index}>{notification.message}</li>
        ))}
        <Enlaces />

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
        <div className="language">
          <h2>{Translation[language].titleLanguage}</h2>
          <p>
          {Translation[language].textLanguage}
          </p>

          <div className="language-selector">
            <span>{Translation[language].selector}</span>
            <LanguageSelector />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Perfil;
