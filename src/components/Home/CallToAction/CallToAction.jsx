import { useContext } from "react";
import "./Style.css";
import logotipo from "../../../assets/images/nuovo.png";
import { Link } from "react-router-dom";

import { LanguageContext } from "../../../Language/LanguageContext";
import { Translation } from "../../../Language/Translation";

const CallToAction = () => {
  const { language } = useContext(LanguageContext);

  return (
    <div className="container calltoaction">
      <div className="content">
        <img src={logotipo} alt="logotipo nuovotech" />

        <p>
          {Translation[language].ctaText1} <strong>Nuovo! </strong>
          {Translation[language].ctaText2} <strong>Nuovo </strong>{" "}
          {Translation[language].ctaText3}
        </p>

        <button>
          <Link to="/registro">{Translation[language].ctaButton}</Link>
        </button>
      </div>
    </div>
  );
};

export default CallToAction;
