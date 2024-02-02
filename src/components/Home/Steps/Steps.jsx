import "./Style.css";
import React, { useContext } from "react";
import { Link } from "react-router-dom";
import registro from "../../../assets/icons/registro.png";
import deposito from "../../../assets/icons/deposito.png";
import retiro from "../../../assets/icons/retiro.png";

// icons
import ArrowRightAltIcon from "@mui/icons-material/ArrowRightAlt";

import { LanguageContext } from "../../../Language/LanguageContext";
import { Translation } from "../../../Language/Translation";

const Steps = () => {
  const { language } = useContext(LanguageContext);

  return (
    <div className="container">
      <div className="steps">
        <div className="card">
          <div className="container">
            <img src={registro} alt="registro nuovo" />
          </div>

          <div className="content">
            <h2>{Translation[language].step1Title}</h2>
            <p>{Translation[language].step1Text}</p>

            <Link to="/registro">
              <ArrowRightAltIcon />
            </Link>
          </div>
        </div>
        <div className="card">
          <div className="container">
            <img src={deposito} alt="deposito nuovo" />
          </div>

          <div className="content">
            <h2>{Translation[language].step2Title}</h2>
            <p>
              {Translation[language].step2Text} <strong>Nuovo</strong>,{" "}
              {Translation[language].step2Text2}
            </p>

            <Link to="/registro">
              <ArrowRightAltIcon />
            </Link>
          </div>
        </div>
        <div className="card">
          <div className="container">
            <img src={retiro} alt="retiro nuovo" />
          </div>

          <div className="content">
            <h2>{Translation[language].step3Title}</h2>
            <p>{Translation[language].step3Text}</p>

            <Link to="/registro">
              <ArrowRightAltIcon />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Steps;
