import logotipo from "../../assets/images/nuovo.png";
import "./Style.css"

const Footer = () => {
  return (
    <div className="footer">

        <img src={logotipo} alt="logotipo nuovotech" />
        <p>©Nuovotech - Todos los derechos reservados - <a href="/legal">Términos Legales</a></p>
        <small>El Señor es mi pastor, nada me faltará.</small>
    </div>
  )
}

export default Footer
