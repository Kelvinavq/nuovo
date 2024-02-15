import React, { useState, useEffect , useContext} from "react";
import "./Style.css";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import HorizontalRuleOutlinedIcon from '@mui/icons-material/HorizontalRuleOutlined';
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
        const response = await fetch(`${Config.backendBaseUrl}getTransactions.php`, {
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
        <h2>{Translation[language].title}</h2>
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
                <span>{transaction.type === 'deposit' ? Translation[language].transaction1 + " - " + transaction.platform_type : Translation[language].transaction2}</span>
                <small>{transaction.transaction_time}</small>
              </div>
            </div>
            <div className="right">
              <div className="monto">
                <span>
                  {transaction.amount} <small>USD</small>
                </span>
                <p className={transaction.status === 'approved' ? 'completed' : 'pending'}>{transaction.status === 'approved' ? Translation[language].status1 : Translation[language].status2}</p>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Recents;
