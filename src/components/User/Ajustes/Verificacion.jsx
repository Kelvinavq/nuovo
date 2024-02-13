import Saldo from "../Saldo/Saldo";
import Enlaces from "./Enlaces";
import "./Style.css";
import { useState, useEffect , useContext} from "react";

import ErrorOutlineOutlinedIcon from "@mui/icons-material/ErrorOutlineOutlined";
import DangerousOutlinedIcon from "@mui/icons-material/DangerousOutlined";
import VerifiedIcon from "@mui/icons-material/Verified";
import imgDni from "../../../assets/images/dni.png";
import ImgSelfie from "../../../assets/images/selfie.jpg";

import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

import { LanguageContext } from "../../../Language/LanguageContext";
import { Translation } from "./Translation";

const MySwal = withReactContent(Swal);

const Verificacion = () => {
  const { language } = useContext(LanguageContext);


  const openModal = (modalConfig) => {
    MySwal.fire({
      text: modalConfig.text,
      imageUrl: modalConfig.imageUrl,
      imageWidth: 350,
      imageHeight: 250,
      imageAlt: "Imagen modal",
    });
  };

  const [verificationStatus, setVerificationStatus] = useState(null);
  const [content, setContent] = useState(null);

  function refreshPage() {
    window.location.reload(false);
  }

  const [dniFront, setDniFront] = useState(null);
  const [dniSelfie, setDniSelfie] = useState(null);
  const [dniBack, setDniBack] = useState(null);

  const [isDniFrontUploaded, setIsDniFrontUploaded] = useState(false);

  const handleDniFrontChange = (e) => {
    const file = e.target.files[0];
    setDniFront(file);
    setIsDniFrontUploaded(true);
  };

  const handleDniSelfieChange = (e) => {
    const file = e.target.files[0];
    setDniSelfie(file);
  };

  const handleDniBackChange = (e) => {
    const file = e.target.files[0];
    setDniBack(file);
  };

  const handleUpload = async () => {
    // Validar que ambos archivos estén seleccionados
    if (!dniFront || !dniSelfie || !dniBack) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Debes seleccionar las tres imágenes",
      });
      return;
    }

    const formData = new FormData();
    formData.append("dniFront", dniFront);
    formData.append("dniBack", dniBack);
    formData.append("dniSelfie", dniSelfie);

    try {
      const response = await fetch(
        "http://localhost/nuovo/backend/Api/uploadVerification.php",
        {
          method: "POST",
          body: formData,
          credentials: "include",
        }
      );

      const data = await response.json();

      if (response.ok) {
        // Procesar la respuesta exitosa
        Swal.fire({
          icon: "success",
          title: "Éxito",
          text: data.message,
          didClose: () => {
            refreshPage();
          },
        });
      } else {
        // Procesar la respuesta de error
        Swal.fire({
          icon: "error",
          title: "Error",
          text: data.error || "Hubo un error al subir las imágenes",
        });
      }
    } catch (error) {
      console.error("Error al subir imágenes:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Error inesperado al subir las imágenes",
      });
    }
  };

  useEffect(() => {
    // Obtener estado de verificación al cargar el componente
    fetch("http://localhost/nuovo/backend/Api/getVerificationStatus.php", {
      method: "GET",
      credentials: "include",
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Error de red: ${response.statusText}`);
        }
        return response.json();
      })
      .then((data) => {
        setVerificationStatus(data.status);
        setContent(data.content); // Almacena el contenido en la variable
      })
      .catch((error) =>
        console.error("Error al obtener el estado de verificación:", error)
      );
  }, []);

  return (
    <div className="ajustes_verificacion">
      <Saldo />

      <div className="content">
        <h2>{Translation[language].titleVerificacion}</h2>

        <Enlaces />

        {verificationStatus === "pending" && (
          <div className={`estatus active ${verificationStatus}`}>
            <div className="danger">
              <DangerousOutlinedIcon />
              <span>{Translation[language].span1}</span>
            </div>

            <div className="text">
              <p>
              {Translation[language].text1}
              </p>
            </div>
          </div>
        )}

        {verificationStatus === "approved" && (
          <div className="verificado active ">
            <VerifiedIcon />
            <p>{Translation[language].text2}</p>
          </div>
        )}

        {verificationStatus === "denied" && (
          <div className="estatus active">
            <div className="danger">
              <DangerousOutlinedIcon />
              <span>{Translation[language].span2}</span>
            </div>

            <div className="text">
              <p>
              {Translation[language].text3}
              </p>
              <p>{Translation[language].text4}</p>
              <p>{content}</p>
              <p>
              {Translation[language].text5}
              </p>
            </div>
            <div className="fotosVerificacion">
              {/* selfie dni */}
              {!dniFront && !dniBack && !dniSelfie && (
                <div className="fotoVerificacion">
                  <label
                    htmlFor="selfie"
                    onClick={() =>
                      openModal({
                        text: Translation[language].swalMessage3,
                        imageUrl: ImgSelfie,
                      })
                    }
                  >
                    {Translation[language].label1}
                  </label>
                  <input
                    type="file"
                    name="selfie"
                    id="selfie"
                    accept=".jpg, .jpeg, .png"
                    onChange={handleDniFrontChange}
                  />
                </div>
              )}

              {/* dni */}
              {dniFront && !dniBack && !dniSelfie && (
                <div className="fotoVerificacion">
                  <label
                    htmlFor="dni"
                    onClick={() =>
                      openModal({
                        text: Translation[language].swalMessage4,
                        imageUrl: imgDni,
                      })
                    }
                  >
                    {Translation[language].label2}
                  </label>
                  <input
                    type="file"
                    name="dni"
                    id="dni"
                    accept=".jpg, .jpeg, .png"
                    onChange={handleDniSelfieChange}
                  />
                </div>
              )}

              {/* dni back */}
              {!dniBack && dniSelfie && (
                <div className="fotoVerificacion">
                  <label
                    htmlFor="dniBack"
                    onClick={() =>
                      openModal({
                        text: Translation[language].swalMessage5,
                        imageUrl: imgDni,
                      })
                    }
                  >
                   {Translation[language].label3}
                  </label>
                  <input
                    type="file"
                    name="dniBack"
                    id="dniBack"
                    accept=".jpg, .jpeg, .png"
                    onChange={handleDniBackChange}
                  />
                </div>
              )}

              {dniFront && dniBack && dniSelfie && (
                <button className="btnVerificacion" onClick={handleUpload}>
                  {Translation[language].button1}
                </button>
              )}

              {(dniFront || dniBack || dniSelfie) && (
                <div className="previews">
                  {dniFront && (
                    <div className="preview">
                      <p>{Translation[language].text6}</p>
                      <img
                        src={URL.createObjectURL(dniFront)}
                        alt="DNI Preview"
                      />
                    </div>
                  )}
              
                  {dniSelfie && (
                    <div className="preview">
                      <p>{Translation[language].text7}</p>
                      <img
                        src={URL.createObjectURL(dniSelfie)}
                        alt="Selfie Preview"
                      />
                    </div>
                  )}
                      {dniBack && (
                    <div className="preview">
                      <p>{Translation[language].text8}</p>
                      <img
                        src={URL.createObjectURL(dniBack)}
                        alt="DNI Back Preview"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {!verificationStatus && (
          <div className="estatus active">
            <div className="danger">
              <DangerousOutlinedIcon />
              <span>{Translation[language].span3}</span>
            </div>

            <div className="text">
              <p>
              {Translation[language].text9}
                <ErrorOutlineOutlinedIcon />
              </p>
            </div>

            <div className="fotosVerificacion">
              {/* selfie dni */}
              {!dniFront && !dniBack && !dniSelfie && (
                <div className="fotoVerificacion">
                  <label
                    htmlFor="selfie"
                    onClick={() =>
                      openModal({
                        text: Translation[language].swalMessage3,
                        imageUrl: ImgSelfie,
                      })
                    }
                  >
                     {Translation[language].label1}
                  </label>
                  <input
                    type="file"
                    name="selfie"
                    id="selfie"
                    accept=".jpg, .jpeg, .png"
                    onChange={handleDniFrontChange}
                  />
                </div>
              )}

              {/* dni */}
              {dniFront && !dniBack && !dniSelfie && (
                <div className="fotoVerificacion">
                  <label
                    htmlFor="dni"
                    onClick={() =>
                      openModal({
                        text: Translation[language].swalMessage4,
                        imageUrl: imgDni,
                      })
                    }
                  >
                    {Translation[language].label2}
                  </label>
                  <input
                    type="file"
                    name="dni"
                    id="dni"
                    accept=".jpg, .jpeg, .png"
                    onChange={handleDniSelfieChange}
                  />
                </div>
              )}

              {/* dni back */}
              {!dniBack && dniSelfie && (
                <div className="fotoVerificacion">
                  <label
                    htmlFor="dniBack"
                    onClick={() =>
                      openModal({
                        text: Translation[language].swalMessage5,
                        imageUrl: imgDni,
                      })
                    }
                  >
                   {Translation[language].label3}
                  </label>
                  <input
                    type="file"
                    name="dniBack"
                    id="dniBack"
                    accept=".jpg, .jpeg, .png"
                    onChange={handleDniBackChange}
                  />
                </div>
              )}

              {dniFront && dniBack && dniSelfie && (
                <button className="btnVerificacion" onClick={handleUpload}>
                  {Translation[language].button1}
                </button>
              )}

              {(dniFront || dniBack || dniSelfie) && (
                <div className="previews">
                  {dniFront && (
                    <div className="preview">
                      <p>{Translation[language].text6}</p>
                      <img
                        src={URL.createObjectURL(dniFront)}
                        alt="DNI Preview"
                      />
                    </div>
                  )}
              
                  {dniSelfie && (
                    <div className="preview">
                      <p>{Translation[language].text7}</p>
                      <img
                        src={URL.createObjectURL(dniSelfie)}
                        alt="Selfie Preview"
                      />
                    </div>
                  )}
                      {dniBack && (
                    <div className="preview">
                      <p>{Translation[language].text8}</p>
                      <img
                        src={URL.createObjectURL(dniBack)}
                        alt="DNI Back Preview"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Verificacion;
