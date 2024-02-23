import "./Style.css";
import HorizontalRuleOutlinedIcon from "@mui/icons-material/HorizontalRuleOutlined";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import React, { useState, useEffect, useContext } from "react";

import Swal from "sweetalert2";
import Config from "../../../Config";

import { LanguageContext } from "../../../Language/LanguageContext";
import { Translation } from "./Translation";

const ListaMovimientos = () => {
  const { language } = useContext(LanguageContext);

  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    // Llamada al backend para obtener la lista de movimientos del usuario
    const fetchTransactions = async () => {
      try {
        const response = await fetch(`${Config.backendBaseUrl}getMoves.php`, {
          method: "GET",
          credentials: "include",
        });

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
        <h2>{Translation[language].title}</h2>
      </div>

      {transactions.length === 0 ? (
        <p>{Translation[language].text1}</p>
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
                  {transaction.type === "withdrawal"
                    ? Translation[language].transaction2
                    : Translation[language].transaction1}
                </h2>

                {transaction.type === "withdrawal" ? (
                  <span>
                    {transaction.withdrawal.method ===
                    "transferencia_entre_usuarios"
                      ? Translation[language].tipo1
                      : transaction.withdrawal.method ===
                        "transferencia_nacional"
                      ? Translation[language].tipo2
                      : transaction.withdrawal.method === "efectivo"
                      ? Translation[language].tipo3
                      : transaction.withdrawal.method ===
                        "transferencia_externa"
                      ? transaction.withdrawal.region === "usa"
                        ? Translation[language].tipo4
                        : Translation[language].tipo5
                      : transaction.withdrawal.method}
                  </span>
                ) : (
                  <span>{transaction.deposit.platform_type}</span>
                )}
              </li>

              <li>
                <h2>{Translation[language].h2Date}</h2>
                <span>{transaction.transaction_date}</span>
              </li>

              <li className="monto">
                <h2>{Translation[language].h2Amount}</h2>
                <span>${formatAmount(transaction.amount)}</span>
              </li>

              <li className={`estatus ${transaction.status.toLowerCase()}`}>
                <h2>{Translation[language].h2Status}</h2>
                <span>{transaction.status}</span>
              </li>
            </ul>
          ))}
        </div>
      )}
    </div>
  );
};

export default ListaMovimientos;
