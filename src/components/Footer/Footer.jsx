import logotipo from "../../assets/images/nuovo.png";
import "./Style.css"

const Footer = () => {
  return (
    <div className="footer">

        <img src={logotipo} alt="logotipo nuovotech" />
        <p>©Nuovotech - Todos los derechos reservados</p>
      
    </div>
  )
}

export default Footer
