import React, { useState, useEffect } from "react";
import "./Style.css";
import RemoveRedEyeOutlinedIcon from "@mui/icons-material/RemoveRedEyeOutlined";

const Saldo = () => {
  const [showBalance, setShowBalance] = useState(true);

  useEffect(() => {
    // Al cargar el componente, intenta obtener la configuración desde localStorage
    const storedShowBalance = localStorage.getItem("showBalance");
    if (storedShowBalance !== null) {
      setShowBalance(JSON.parse(storedShowBalance));
    }
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
    return showBalance ? balance : "*".repeat(balance.length);
  };

  return (
    <div className="saldo">
      <div className="content">
        <strong>$</strong>
        <p>{formatBalance("1.000")}</p>
        <button onClick={toggleBalanceVisibility}>
          <RemoveRedEyeOutlinedIcon />
        </button>
      </div>
    </div>
  );
};

export default Saldo;
