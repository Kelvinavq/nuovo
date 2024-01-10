import React, { useState, useEffect } from "react";
import "./Style.css";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import HorizontalRuleOutlinedIcon from '@mui/icons-material/HorizontalRuleOutlined';

const Recents = () => {
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    // Lógica para obtener las transacciones desde el backend
    const fetchTransactions = async () => {
      try {
        const response = await fetch("http://localhost/nuovo/backend/api/getTransactions.php", {
          method: "GET",
          credentials: "include",
        });

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

  return (
    <div className="recents">
      <div className="title">
        <h2>Transacciones Recientes</h2>
      </div>

 {transactions.map((transaction, index) => (
        <div key={index} className="transacciones">
          <div className="date">
            <span>{transaction.transaction_date}</span>
          </div>

          <div className="transaccion">
            <div className="left">
              <div className={`icono ${transaction.type === 'deposit' ? 'depositar' : 'retirar'}`}>
                {transaction.type === 'deposit' ? <AddOutlinedIcon /> : <HorizontalRuleOutlinedIcon />}
              </div>

              <div className="detalle">
                <span>{transaction.type === 'deposit' ? 'Depositar Fondos -' + " " + transaction.platform_type : 'Retirar Fondos'}</span>
                <small>{transaction.transaction_time}</small>
              </div>
            </div>
            <div className="right">
              <div className="monto">
                <span>
                  {transaction.amount} <small>USD</small>
                </span>
                <p className={transaction.status === 'completed' ? 'completed' : 'pending'}>{transaction.status === 'completed' ? 'Completada' : 'Pendiente'}</p>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Recents;
