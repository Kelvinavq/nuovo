import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import DescriptionIcon from "@mui/icons-material/Description";
import "./Style.css";
import Swal from "sweetalert2";

const Balance_a = () => {
  const [balance, setBalance] = useState({
    total_deposit: 0,
    total_withdrawal: 0,
    total_users: 0
  });

  useEffect(() => {
    // Llamada al backend para obtener el balance
    const fetchBalance = async () => {
      try {
        const response = await fetch(
          "http://localhost/nuovo/backend/Api/admin/getBalanceAdmin.php",
          {
            method: "GET",
            credentials: "include",
          }
        );

        if (response.ok) {
          const data = await response.json();
          setBalance(data);
        } else {
          console.error("Error al obtener el balance");
          Swal.fire({
            title: "Error al obtener el balance",
            text: "Recargue la página e intente nuevamente",
            icon: "error",
          });
        }
      } catch (error) {
        console.error("Error al obtener el balance:", error);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Error inesperado al obtener el balance",
        });
      }
    };

    fetchBalance();
  }, []);

  

  const generateExcelReport = async () => {
    try {
      const response = await fetch(
        "http://localhost/nuovo/backend/Api/admin/generateExcelReport.php",
        {
          method: "GET",
          credentials: "include",
        }
      );
  
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          // Construir la URL completa del archivo
          const baseUrl = 'http://localhost/nuovo/src/assets/reports';
          const fullUrl = `${baseUrl}/${data.file_url}`;
  
          // Mostrar la alerta con el botón de descarga
          Swal.fire({
            icon: "success",
            title: "Informe generado",
            text: "El informe se ha generado exitosamente.",
            footer: `<a href="${fullUrl}" download>Descargar informe</a>`,
          });
        } else {
          Swal.fire({
            icon: "error",
            title: "Error al generar el informe",
            text: "Hubo un problema al generar el informe.",
          });
        }
      } else {
        console.error("Error al generar el informe:", response.statusText);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Error inesperado al generar el informe",
        });
      }
    } catch (error) {
      console.error("Error al generar el informe:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Error inesperado al generar el informe",
      });
    }
  };

  return (
    <div className="balance_a">
      <div className="title">
        <h2>Dashboard</h2>
        <button className="report" onClick={generateExcelReport}>
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
                <strong>$</strong> {balance.total_deposit} <small>USD</small>
              </span>
            </div>
          </div>
          <div className="item">
            <div className="text">
              <p>Total retirados</p>
            </div>

            <div className="saldo">
              <span>
                <strong>$</strong> {balance.total_withdrawal} <small>USD</small>
              </span>
            </div>
          </div>
          <div className="item">
            <div className="text">
              <p>Usuarios registrados</p>
            </div>

            <div className="saldo">
              <span>{balance.total_users}</span>
            </div>
          </div>

          <div className="enlace">
            <Link to="/admin/movimientos">Ver todos los movimientos</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Balance_a;
