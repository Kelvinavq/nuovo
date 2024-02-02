import "./Style.css";
import React, { useContext } from "react";

// images
import seguridad from "../../../assets/icons/seguridad.png";
import transacciones_rapidas from "../../../assets/icons/transacciones_rapidas.png";
import comisiones from "../../../assets/icons/comisiones.png";
import atencion from "../../../assets/icons/atencion_personalizada.png";
import logo from "../../../assets/images/nuovo.png";

import { LanguageContext } from "../../../Language/LanguageContext";
import { Translation } from "../../../Language/Translation";

const Advantages = () => {
  const { language } = useContext(LanguageContext);

  return (
    <div className="container">
      <div className="advantages">
        <div className="content">
          <h2>{Translation[language].advantageTitle} </h2>
          <img src={logo} alt="" />
          <p>
            {Translation[language].advantageText} <strong>Nuovo</strong>,{" "}
            {Translation[language].advantageText2}
          </p>
        </div>

        <div className="cards">
          <div className="card">
            <div className="img">
              <img src={seguridad} alt="seguridad integral icono" />
            </div>

            <div className="content">
              <h2>{Translation[language].advantageCard1Title}</h2>
              <p>
                {Translation[language].advantageCard1Text1}{" "}
                <strong>Nuovo</strong>{" "}
                {Translation[language].advantageCard1Text2}
              </p>
            </div>
          </div>

          <div className="card">
            <div className="img">
              <img
                src={transacciones_rapidas}
                alt="transacciones rapidas icono"
              />
            </div>

            <div className="content">
              <h2>{Translation[language].advantageCard2Title}</h2>
              <p>{Translation[language].advantageCard2Text}</p>
            </div>
          </div>

          <div className="card">
            <div className="img">
              <img src={comisiones} alt="comisiones icono" />
            </div>

            <div className="content">
              <h2>{Translation[language].advantageCard3Title}</h2>
              <p>{Translation[language].advantageCard3Text}</p>
            </div>
          </div>

          <div className="card">
            <div className="img">
              <img src={atencion} alt="atencion icono" />
            </div>

            <div className="content">
              <h2>{Translation[language].advantageCard4Title}</h2>
              <p>{Translation[language].advantageCard4Text}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Advantages;
