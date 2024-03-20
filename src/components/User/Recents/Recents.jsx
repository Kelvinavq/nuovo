import React, { useState, useEffect, useContext } from "react";
import "./Style.css";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import HorizontalRuleOutlinedIcon from "@mui/icons-material/HorizontalRuleOutlined";
import Config from "../../../Config";

import { LanguageContext } from "../../../Language/LanguageContext";
import { Translation } from "./Translation";

const Recents = () => {
  const { language } = useContext(LanguageContext);

  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    // Lógica para obtener las transacciones desde el backend
    const fetchTransactions = async () => {
      try {
        const response = await fetch(
          `${Config.backendBaseUrl}getTransactions.php`,
          {
            method: "GET",
            credentials: "include",
          }
        );

        if (response.ok) {
          const data = await response.json();
          setTransactions(data.transactions);
        } else {
          console.error("Error al obtener las transacciones");
        }
      } catch (error) {
        console.error("Error al obtener las transacciones:", error);
      }
    };

    fetchTransactions();
  }, []);

  const formatAmount = (amount) => {
    // Verificar si amount es undefined o nulo
    if (amount === undefined || amount === null) {
      return ""; // O puedes retornar otro valor predeterminado si es necesario
    }

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
    <div className="recents">
      <div className="title">
        <h2>{Translation[language].title}</h2>
      </div>

      {transactions.map((transaction, index) => (
        <div key={index} className="transacciones">
          <div className="date">
            <span>{transaction.transaction_date}</span>
          </div>

          <div className="transaccion">
            <div className="left">
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

              <div className="detalle">
                <span>
                  {transaction.type === "deposit"
                    ? Translation[language].transaction1 +
                      " - " +
                      transaction.platform_type
                    : transaction.type === "withdrawal" &&
                      transaction.payment_method ===
                        "transferencia_entre_usuarios"
                    ? transaction.received
                    : transaction.type === "restar"
                    ? Translation[language].transaction3
                    : transaction.type === "sumar"
                    ? Translation[language].transaction4
                    : Translation[language].transaction2}
                </span>

                <small>{transaction.transaction_time}</small>

                {transaction.deposit_note_amount_modified != null ? (
                  <small className="note">{transaction.deposit_note_amount_modified}</small>
                ) : transaction.withdrawal_note_amount_modified != null ? (
                  <small className="note">{transaction.withdrawal_note_amount_modified}</small>
                ) : transaction.deposit_note_transaction_modified != null ? (
                  <small className="note">{transaction.deposit_note_transaction_modified}</small>
                ) : (
                  ""
                )}

                {/* <small>kdewnfewoifwef</small> */}
              </div>
            </div>
            <div className="right">
              <div className="monto">
                {transaction.payment_method === "platform" ? (
                  <span>$ {formatAmount(transaction.final_amount)} +</span>
                ) : (
                  <span>$ {formatAmount(transaction.amount)} +</span>
                )}

                <p
                  className={
                    transaction.status === "approved" ? "completed" : "pending"
                  }
                >
                  {transaction.status === "approved"
                    ? Translation[language].status1
                    : Translation[language].status2}
                </p>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Recents;
