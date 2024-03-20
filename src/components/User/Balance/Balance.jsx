import "./Style.css";
import React, { useState,useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import RemoveRedEyeOutlinedIcon from "@mui/icons-material/RemoveRedEyeOutlined";
import Config from "../../../Config";

import { LanguageContext } from "../../../Language/LanguageContext";
import { Translation } from "./Translation";

const Balance = () => {
  const { language } = useContext(LanguageContext);

  const [showBalance, setShowBalance] = useState(true);
  const [balance, setBalance] = useState(null);

  useEffect(() => {
    // Al cargar el componente, intenta obtener la configuración desde localStorage
    const storedShowBalance = localStorage.getItem("showBalance");
    if (storedShowBalance !== null) {
      setShowBalance(JSON.parse(storedShowBalance));
    }

    // Obtener el saldo del usuario
    fetch(`${Config.backendBaseUrl}getUserBalance.php`, {
      method: "GET",
      credentials: "include",
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.hasOwnProperty("balance")) {
          setBalance(data.balance);
        }
      })
      .catch((error) => console.error("Error al obtener el saldo:", error));
  }, []);

  const toggleBalanceVisibility = () => {
    // Cambia el estado y actualiza localStorage
    setShowBalance((prevShowBalance) => {
      const newShowBalance = !prevShowBalance;
      localStorage.setItem("showBalance", JSON.stringify(newShowBalance));
      return newShowBalance;
    });
  };

  const formatBalance = (balance) => {
    // const numericBalance = balance !== null ? balance.replace(/[^\d]/g, "") : 0;
    const numericAmount = balance == null ? "0" : balance.toString().replace(/[^\d]/g, "");

    // Formatear con separador de miles y decimales
    const formattedBalance = new Intl.NumberFormat("en-US", {
      style: "decimal",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(parseFloat(numericAmount) / 100);
  
    return showBalance ? formattedBalance : "*****";
  };
  


  
  return (
    <div className="balance">
      <div className="balance">
        <div className="title">
          <h2>{Translation[language].title}</h2>
        </div>

        <div className="card">
          <div className="content">
            <div className="text">
              <p>{Translation[language].text1}</p>
              <button onClick={toggleBalanceVisibility}>
          <RemoveRedEyeOutlinedIcon />
        </button>
            </div>

            <div className="saldo">
              <span>
                <strong>$</strong> {formatBalance(balance !== null ? balance : Translation[language].text2)} <small>USD</small>
              </span>
            </div>

            <div className="enlace">
              <Link to="/user/movimientos">{Translation[language].link}</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Balance;
