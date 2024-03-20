import React, { useState, useEffect } from "react";
import "./Style.css";
import RemoveRedEyeOutlinedIcon from "@mui/icons-material/RemoveRedEyeOutlined";
import Config from "../../../Config";

const Saldo = () => {
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
    const numericAmount = balance == null ? "0" : balance.toString().replace(/[^\d]/g, "");
    const formattedAmount = new Intl.NumberFormat("en-US", {
      style: "decimal",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(parseFloat(numericAmount) / 100);

    return showBalance ? `$${formattedAmount}` : "*****";
  };


  return (
    <div className="saldo">
      <div className="content">
        <strong>$</strong>
        <p>{formatBalance(balance !== null ? balance : "Cargando...")}</p>
        <button onClick={toggleBalanceVisibility}>
          <RemoveRedEyeOutlinedIcon />
        </button>
      </div>
    </div>
  );
};

export default Saldo;
