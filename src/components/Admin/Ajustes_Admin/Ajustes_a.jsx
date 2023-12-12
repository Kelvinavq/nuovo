import foto from "../../../assets/icons/usuario.png";
import CameraAltOutlinedIcon from "@mui/icons-material/CameraAltOutlined";
import "./Style.css";
import Enlaces_a from "./Enlaces_a";

const Ajustes_a = () => {
  return (
    <div className="ajustes_a">
      <div className="content">
        <h2>Ajustes</h2>
        <Enlaces_a />

        <div className="imgPerfil">
          <div className="foto">
            <img src={foto} alt="" />
            <div className="input">
              <input type="file" name="foto" id="foto" />
              <label htmlFor="foto">
                <CameraAltOutlinedIcon />
              </label>
            </div>
          </div>

          <div className="text">
            <h2>Nombre Apellido</h2>
            <p>mail@gmail.com</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Ajustes_a;
