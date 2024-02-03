import { useContext } from "react";
import "./Style.css";
import { LanguageContext } from "../../Language/LanguageContext";
import { TranslationLegal } from "../../Language/TranslationLegal";

const LegalTerms = () => {
  const { language } = useContext(LanguageContext);

  return (
    <div className="contenedor_legales">
        <div className="title">
            <h1>{TranslationLegal[language].title}</h1>
        </div>
      <div className="legales">
        <ul>
          <li>{TranslationLegal[language].text1}</li>
          <li>
          {TranslationLegal[language].text2}
          </li>
          <li>
          {TranslationLegal[language].text3}
          </li>
        </ul>
      </div>
    </div>
  );
};

export default LegalTerms;
