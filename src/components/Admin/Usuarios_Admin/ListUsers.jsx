import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import "./Style.css";
import Config from "../../../Config";

const ListUsers = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [estatusFilter, setEstatusFilter] = useState("all");
  const [bankFilter, setBankFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [bancos, setBancos] = useState([]);

  useEffect(() => {
    const obtenerUsuarios = async () => {
      try {
        const url = new URL(`${Config.backendBaseUrlAdmin}getUsers.php`);

        url.searchParams.append("estatus", estatusFilter);
        url.searchParams.append("bank", bankFilter);
        url.searchParams.append("search", searchTerm);

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
          } else {
            // Manejar el caso en que no hay usuarios
            Swal.fire({
              icon: "info",
              title: "Sin usuarios registrados",
              text: "No hay usuarios registrados en este momento.",
            });
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
  }, [estatusFilter, bankFilter, searchTerm]);

  useEffect(() => {
    const obtenerBancos = async () => {
      try {
        const response = await fetch(
          `${Config.backendBaseUrlAdmin}getBanksFilter.php`,
          {
            method: "GET",
            mode: "cors",
            credentials: "include",
            headers: {
              "content-type": "application/json",
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          setBancos(data);
        } else {
          console.error("Error al obtener la lista de bancos");
        }
      } catch (error) {
        console.error("Error al obtener la lista de bancos:", error);
      }
    };

    obtenerBancos();
  }, []);

  const mostrarDetallesUsuario = (usuario) => {
    // Crear el contenido HTML para la ventana modal

    let modalContent = `
      <div>
        <h2>${usuario.name}</h2>
        <p>Email: ${usuario.email}</p>
        <p>Teléfono: +${usuario.phoneNumber} </p>
        <p>Dirección: ${usuario.address} </p>
        <p>Fecha de Registro: ${usuario.formatted_registrationDate} </p>
        <p>Número de cuenta: ${usuario.bank_account}</p>
        <p>Routing Number (ACH): ${usuario.routing_number_ach} </p>
        <p>Routing Number (WIRE): ${usuario.routing_number_wire} </p>
        <p>Dirección del banco: ${usuario.bank_address} </p>
        <p>Nombre de la cuenta: ${usuario.account_name} </p>
        <button id="viewPlatforms" class="swal2-confirm swal2-styled">Ver plataformas</button>

        <p></p>
      </div>
    `;

    Swal.fire({
      title: "Detalles del Usuario",
      html: modalContent,
      showCloseButton: true,
    });
    const verPlataformasBtn = document.getElementById("viewPlatforms");
    if (verPlataformasBtn) {
      verPlataformasBtn.addEventListener("click", () => {
        mostrarPlataformas(usuario.id);
      });
    }
  };

  const mostrarPlataformas = async (userId) => {
    try {
      const response = await fetch(`${Config.backendBaseUrlAdmin}getPlatformsUsers.php?userId=${userId}`, {
        method: "GET",
        mode: "cors",
        credentials: "include",
        headers: {
          "content-type": "application/json",
        },
      });
  
      if (response.ok) {
        const data = await response.json();
  
        if (data && data.platforms.length > 0) {
          // Modificar la lógica para mostrar la información en Swal según tus necesidades
          let modalContent = `<div>`;
  
          data.platforms.forEach((platform) => {
            modalContent += `<h3>${platform.platformName}</h3>`;
  
            if (platform.email) {
              modalContent += `<p>Email: ${platform.email}</p>`;
            } else {
              modalContent += `<p>Campos Personalizados:</p>`;
              modalContent += `<ul>`;
  
              // Asegúrate de dividir los strings en arrays
              const fieldNames = platform.fieldName.split(',');
              const fieldValues = platform.fieldValue.split(',');
  
              // Iterar sobre los arrays
              fieldNames.forEach((fieldName, index) => {
                modalContent += `<li>${fieldName}: ${fieldValues[index]}</li>`;
              });
  
              modalContent += `</ul>`;
            }
          });
  
          modalContent += `</div>`;
  
          Swal.fire({
            title: "Plataformas del Usuario",
            html: modalContent,
            showCloseButton: true,
          });
        } else {
          Swal.fire({
            icon: "info",
            title: "Sin plataformas registradas",
            text: "No hay plataformas registradas para este usuario en este momento.",
          });
        }
      } else {
        console.error("Error al obtener las plataformas");
      }
    } catch (error) {
      console.error("Error al obtener las plataformas:", error);
    }
  };
  
  

  return (
    <div className="usuarios">
      <div className="title">
        <h2>Usuarios </h2>
      </div>

      <div className="filters">
        <label>
          Estatus:
          <select
            value={estatusFilter}
            onChange={(e) => setEstatusFilter(e.target.value)}
          >
            <option value="all">Todos</option>
            <option value="approved">Aprobados</option>
            <option value="pending">Pendientes</option>
            <option value="denied">Denegados</option>
          </select>
        </label>

        <label>
          Bancos:
          <select
            value={bankFilter}
            onChange={(e) => setBankFilter(e.target.value)}
          >
            <option value="all">Todos</option>
            {bancos.map((banco) => (
              <option key={banco.id} value={banco.id}>
                {banco.account_name}
              </option>
            ))}
          </select>
        </label>

        <label>
          Búsqueda:
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar..."
          />
        </label>
      </div>

      <div className="lista_usuarios">
        {usuarios.map((usuario, index) => (
          <ul
            key={usuario.id || index}
            onClick={() => mostrarDetallesUsuario(usuario)}
          >
            <li>
              <div className="icono">{usuario.name.charAt(0)}</div>
            </li>

            <li>
              <h2>Usuario</h2>
              <span>{usuario.name}</span>
            </li>

            <li>
              <h2>Fecha Registro</h2>
              <span>{usuario.formatted_registrationDate}</span>
            </li>

            <li>
              <h2>Cuenta Nº</h2>
              <span>{usuario.bank_account}</span>
            </li>
            <li>
              <h2>R.N (ACH)</h2>
              <span>{usuario.routing_number_ach}</span>
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

export default ListUsers;
