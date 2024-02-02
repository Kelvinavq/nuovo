import { useContext } from "react";
import logotipo from "../../assets/images/nuovo.png";
import "./Style.css";

import { LanguageContext } from "../../Language/LanguageContext";
import { Translation } from "../../Language/Translation";

const Footer = () => {
  const { language } = useContext(LanguageContext);

  return (
    <div className="footer">
      <img src={logotipo} alt="logotipo nuovotech" />
      <p>
        {Translation[language].footerCopy}{" "}
        <a href="/legal">{Translation[language].footerButton}</a>
      </p>
      <small>{Translation[language].footerSmall}</small>
    </div>
  );
};

export default Footer;
