import "./Style.css";
import HorizontalRuleOutlinedIcon from "@mui/icons-material/HorizontalRuleOutlined";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import React, { useState, useEffect } from "react";

import Swal from "sweetalert2";

const ListaMovimientos_a = () => {
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    // Llamada al backend para obtener la lista de movimientos
    const fetchTransactions = async () => {
      try {
        const response = await fetch(
          "http://localhost/nuovo/backend/Api/admin/getAdminMoves.php",
          {
            method: "GET",
            credentials: "include",
          }
        );

        if (response.ok) {
          const data = await response.json();
          setTransactions(data.transactions);
        } else {
          console.error("Error al obtener la lista de movimientos");
          Swal.fire({
            title: "Error al obtener la lista de movimientos",
            text: "Recargue la página e intente nuevamente",
            icon: "error",
          });
        }
      } catch (error) {
        console.error("Error al obtener la lista de movimientos:", error);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Error inesperado al obtener la lista de movimientos",
        });
      }
    };

    fetchTransactions();
  }, []);

  const showTransactionDetails = (transaction) => {
    let withdrawalDetails =
      transaction.withdrawal.method === "transferencia_entre_usuarios"
        ? "Transferencia"
        : transaction.withdrawal.method === "transferencia_nacional"
        ? "Nacional"
        : transaction.withdrawal.method === "efectivo"
        ? "Efectivo"
        : transaction.withdrawal.method === "transferencia_externa"
        ? transaction.withdrawal.region === "usa"
          ? "Transferencia Externa (USA)"
          : "Transferencia Externa (EUROPA)"
        : transaction.withdrawal.method;

    let depositDetails = transaction.deposit.platform_type;

    let modalContent = `
      <span>Detalles del movimiento</span>
      <p><strong>Tipo:</strong> ${
        transaction.type === "withdrawal" ? "Retiro" : "Depósito"
      }</p>
      <p><strong>Fecha y Hora:</strong> ${transaction.transaction_date} ${
      transaction.transaction_time
    }</p>
      <p><strong>Monto:</strong> $${transaction.amount}</p>
      <p><strong>Estatus:</strong> ${transaction.status}</p>
       <p><strong>Método:</strong> ${
         transaction.type === "withdrawal" ? withdrawalDetails : depositDetails
       }</p>
    `;

    Swal.fire({
      title: `Detalles del Movimiento `,
      html: modalContent,
      confirmButtonText: "Cerrar",
      confirmButtonColor: "#28a745",
      showCloseButton: true,
    });
  };

  return (
    <div>
      <div className="title">
        <h2>Lista de Movimientos </h2>
      </div>

      {transactions.length === 0 ? (
        <p>No hay movimientos disponibles.</p>
      ) : (
        <div className="lista_movimientos">
          {transactions.map((transaction, index) => (
            <ul key={index} onClick={() => showTransactionDetails(transaction)}>
              <li>
                <div className={`icono ${transaction.type}`}>
                  {transaction.type === "withdrawal" ? (
                    <HorizontalRuleOutlinedIcon />
                  ) : (
                    <AddOutlinedIcon />
                  )}
                </div>
              </li>

              <li>
                <h2>
                  {transaction.type === "withdrawal" ? "Retiro" : "Depósito"}
                </h2>
                {transaction.type === "withdrawal" ? (
                  <span>
                    {transaction.withdrawal.method ===
                    "transferencia_entre_usuarios"
                      ? "Transferencia"
                      : transaction.withdrawal.method ===
                        "transferencia_nacional"
                      ? "Nacional"
                      : transaction.withdrawal.method === "efectivo"
                      ? "Efectivo"
                      : transaction.withdrawal.method ===
                        "transferencia_externa"
                      ? transaction.withdrawal.region === "usa"
                        ? "Transferencia Externa (USA)"
                        : "Transferencia Externa (EUROPA)"
                      : transaction.withdrawal.method}
                  </span>
                ) : (
                  <span>{transaction.deposit.platform_type}</span>
                )}
              </li>

              <li>
                <h2>Fecha</h2>
                <span>{transaction.transaction_date}</span>
              </li>

              <li className="monto">
                <h2>Monto</h2>
                <span>${transaction.amount}</span>
              </li>

              <li>
                <h2>Usuario</h2>
                <span>{transaction.user_name}</span>
              </li>

              <li className={`estatus ${transaction.status.toLowerCase()}`}>
                <h2>Estatus</h2>
                <span>{transaction.status}</span>
              </li>
            </ul>
          ))}
        </div>
      )}
    </div>
  );
};

export default ListaMovimientos_a;
