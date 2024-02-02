import React, { useEffect } from "react";
import device from "../../../assets/images/frame.png";
import "./Style.css";
import { Link } from "react-router-dom";
import ParticlesBg from "particles-bg";


const Header = () => {



  return (
    <div className="container">
  <ParticlesBg num={100} type="cobweb" bg={true} color="#85ff2e"  />
      <div className="header">
        <div className="left">
          <h2>Mové y usá tu dinero, como y cuando quieras!</h2>
          <p>
            Traé tu dinero de otras billeteras, recibí pagos y transferilo desde
            tu cuenta en EEUU en dólares conectada con el mundo.
          </p>

          <button>
            <Link to="/registro">UNITE AHORA</Link>
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
