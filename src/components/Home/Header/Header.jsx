import React, { useContext } from "react";
import device from "../../../assets/images/frame.png";
import "./Style.css";
import { Link } from "react-router-dom";
import ParticlesBg from "particles-bg";

import { LanguageContext } from "../../../Language/LanguageContext";
import {Translation} from "../../../Language/Translation";

const Header = () => {
  const { language } = useContext(LanguageContext);


  return (
    <div className="container">
  <ParticlesBg num={100} type="cobweb" bg={true} color="#85ff2e"  />
      <div className="header">
        <div className="left">
          <h2>{Translation[language].headerTitle}</h2>
          <p>
          {Translation[language].headerText}
          </p>

          <button>
            <Link to="/registro">{Translation[language].headerButton}</Link>
          </button>
        </div>

        <div className="right">
          <img src={device} alt="device nuovotech" />
        </div>
      </div>
    </div>
  );
};

export default Header;
