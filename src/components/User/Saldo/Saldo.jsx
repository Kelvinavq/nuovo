import React, { useState, useEffect } from "react";
import "./Style.css";
import RemoveRedEyeOutlinedIcon from "@mui/icons-material/RemoveRedEyeOutlined";

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
    fetch("http://localhost/nuovo/backend/api/getUserBalance.php", {
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
    return showBalance ? balance : "*****";
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
