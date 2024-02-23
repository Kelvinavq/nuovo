import { useEffect, useState } from "react";
import Config from "../../../Config";
import Swal from "sweetalert2";
import "./Style.css";

const List_Balances = () => {
  const [usuarios, setUsuarios] = useState([]);

  useEffect(() => {
    const obtenerUsuarios = async () => {
      try {
        const url = new URL(
          `${Config.backendBaseUrlAdmin}getBalancesUsers.php`
        );

        const response = await fetch(url, {
          method: "GET",
          mode: "cors",
          credentials: "include",
          headers: {
            "content-type": "application/json",
          },
        });

        if (response.ok) {
          const data = await response.json();

          if (data && data.length > 0) {
            setUsuarios(data);
          }
        } else {
          Swal.fire({
            icon: "info",
            title: "No hay resultados para la búsqueda existente",
          });
        }
      } catch (error) {
        console.error("Error al obtener los usuarios:", error);
      }
    };

    obtenerUsuarios();
  }, []);

  const formatAmount = (amount) => {
    const numericAmount = amount.replace(/[^\d]/g, "");

    // Formatear con separador de miles y decimales
    const formattedAmount = new Intl.NumberFormat("en-US", {
      style: "decimal",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(parseFloat(numericAmount) / 100);

    return formattedAmount;
  };

  return (
    <div className="">
      <div className="title">
        <h2>Balance de usuarios </h2>
      </div>

      <div className="lista_usuarios">
        {usuarios.map((usuario, index) => (
          <ul
            key={usuario.id || index}
          >
            <li>
              <div className="icono">{usuario.name.charAt(0)}</div>
            </li>

            <li>
              <h2>Usuario</h2>
              <span>{usuario.name}</span>
            </li>

            <li>
              <h2>Balance</h2>
              <span>${formatAmount(usuario.balance)}</span>
            </li>


            <li className={`estatus ${usuario.status}`}>
              <h2>Estatus</h2>
              <span>{usuario.status}</span>
            </li>
          </ul>
        ))}
      </div>
    </div>
  );
};

export default List_Balances;
