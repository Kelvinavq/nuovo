import "./Style.css";
import HorizontalRuleOutlinedIcon from "@mui/icons-material/HorizontalRuleOutlined";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import React, { useState, useEffect } from "react";
import Config from "../../../Config";

import Swal from "sweetalert2";

const ListaMovimientos_a = () => {
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    // Llamada al backend para obtener la lista de movimientos
    const fetchTransactions = async () => {
      try {
        const response = await fetch(
          `${Config.backendBaseUrlAdmin}getAdminMoves.php`,
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

    let comisionsDetails = `
    <p><strong>Monto enviado:</strong> $${transaction.amount}</p>
    <p><strong>Comisión:</strong> $${transaction.deposit.subtracted_amount}</p>
    <p><strong>Monto a recibir:</strong> $${transaction.deposit.final_amount}</p>
    `;

    let DepositbalanceModified = `
    <p><strong>Motivo: </strong>${transaction.deposit.note_amount_modified}</p>
    `;

    let WithdrawbalanceModified = `
    <p><strong>Motivo: </strong>${transaction.withdrawal.note_amount_modified}</p>
    `;

    let modalContent = `
      <span>Detalles del movimiento</span>

      <p><strong>Tipo:</strong> ${
        transaction.type === "sumar"
          ? "Monto agregado"
          : transaction.type === "restar"
          ? "Monto restado"
          : transaction.type === "deposit"
          ? "Depósito"
          : transaction.type === "withdrawal"
          ? "Retiro"
          : ""
      }</p>

      <p><strong>Fecha y Hora:</strong> ${transaction.transaction_date} ${
      transaction.transaction_time
    }</p>

    ${
      transaction.type === "sumar"
        ? DepositbalanceModified
        : transaction.type === "restar"
        ? WithdrawbalanceModified
        : ""
    }


 ${
   transaction.deposit.payment_method === "platform"
     ? comisionsDetails
     : ` <p><strong>Monto:</strong> $${transaction.amount}</p>`
 }

    
      <p><strong>Estatus:</strong> ${transaction.status}</p>


   ${
        transaction.type === "withdrawal"
          ? `<p><strong>Método:</strong> 
        ${withdrawalDetails}</p>`
          : transaction.type === "deposit"
          ? `<p><strong>Método:</strong> 
        ${depositDetails}</p>`
          : ""
      }

    `;

    Swal.fire({
      title: `Detalles del Movimiento `,
      html: modalContent,
      confirmButtonText: "Cerrar",
      confirmButtonColor: "#28a745",
      showCloseButton: true,
    });
  };

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
                  ) : transaction.type === "deposit" ? (
                    <AddOutlinedIcon />
                  ) : transaction.type === "restar" ? (
                    <HorizontalRuleOutlinedIcon />
                  ) : transaction.type === "sumar" ? (
                    <AddOutlinedIcon />
                  ) : (
                    ""
                  )}
                </div>
              </li>

              <li>
                <h2>
                  {transaction.type === "withdrawal"
                    ? "Retiro"
                    : transaction.type === "deposit"
                    ? "Depósito"
                    : transaction.type === "restar"
                    ? "Monto restado"
                    : transaction.type === "sumar"
                    ? "Monto agregado"
                    : ""}
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
                  <span>
                    {transaction.type === "sumar"
                      ? "Monto agregado"
                      : transaction.type === "restar"
                      ? "Monto restado"
                      : transaction.deposit.platform_type}
                  </span>
                )}
              </li>

              <li>
                <h2>Fecha</h2>
                <span>{transaction.transaction_date}</span>
              </li>

              <li className="monto">
                <h2>Monto</h2>
                <span>${formatAmount(transaction.amount)}</span>
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
