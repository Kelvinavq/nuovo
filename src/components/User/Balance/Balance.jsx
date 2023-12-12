import "./Style.css";
import React, { useState,useEffect } from "react";
import { Link } from "react-router-dom";
import RemoveRedEyeOutlinedIcon from "@mui/icons-material/RemoveRedEyeOutlined";

const Balance = () => {
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
    <div className="balance">
      <div className="balance">
        <div className="title">
          <h2>Dashboard</h2>
        </div>

        <div className="card">
          <div className="content">
            <div className="text">
              <p>Balance</p>
              <button onClick={toggleBalanceVisibility}>
          <RemoveRedEyeOutlinedIcon />
        </button>
            </div>

            <div className="saldo">
              <span>
                <strong>$</strong> {formatBalance(balance !== null ? balance : "Cargando...")} <small>USD</small>
              </span>
            </div>

            <div className="enlace">
              <Link to="/">Ver todos los movimientos</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Balance;
