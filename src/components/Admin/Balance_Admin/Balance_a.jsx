import { Link } from "react-router-dom";
import DescriptionIcon from "@mui/icons-material/Description";
import "./Style.css";

const Balance_a = () => {
  return (
    <div className="balance_a">
      <div className="title">
        <h2>Dashboard</h2>
        <button>
          <Link>
            <DescriptionIcon />
          </Link>
        </button>
      </div>

      <div className="card">
        <div className="content">
          <div className="item">
            <div className="text">
              <p>Total depositados</p>
            </div>

            <div className="saldo">
              <span>
                <strong>$</strong> 12.000 <small>USD</small>
              </span>
            </div>
          </div>
          <div className="item">
            <div className="text">
              <p>Total retirados</p>
            </div>

            <div className="saldo">
              <span>
                <strong>$</strong> 6.000 <small>USD</small>
              </span>
            </div>
          </div>
          <div className="item">
            <div className="text">
              <p>Usuarios registrados</p>
            </div>

            <div className="saldo">
              <span>245</span>
            </div>
          </div>

          <div className="enlace">
            <Link to="/">Ver todos los movimientos</Link>
          </div>
        </div>
      </div>

    
    </div>
  );
};

export default Balance_a;
