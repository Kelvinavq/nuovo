import { useContext, useEffect } from "react";
import logotipo from "../../../assets/images/nuovo.png";
import "./Style.css";

import { Link } from "react-router-dom";

import LanguageSelector from "../../Selector/LanguageSelector";
import { LanguageContext } from "../../../Language/LanguageContext";
import {Translation} from "../../../Language/Translation";

const Head = () => {
  const { language } = useContext(LanguageContext);

  return (
    <div className="head">
      <Link to={"/"}>
        <div className="logo">
          <img src={logotipo} alt="nuovotech logo" />
        </div>
      </Link>
      <div className="buttons">
        <LanguageSelector />

        <button>
          <Link to="/login">{Translation[language].headButton1}</Link>
        </button>
        <button className="btnRegistro">
          <Link  to="/registro">{Translation[language].headButton2}</Link>
        </button>
      </div>
    </div>
  );
};

export default Head;
