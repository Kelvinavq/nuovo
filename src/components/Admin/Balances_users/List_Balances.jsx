import { useState, useEffect } from "react";
import Config from "../../../Config";
import Swal from "sweetalert2";
import "./Style.css";

const List_Balances = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [operation, setOperation] = useState(null);
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");

  useEffect(() => {
    const obtenerUsuarios = async () => {
      try {
        const url = new URL(
          `${Config.backendBaseUrlAdmin}getBalancesUsers.php`
        );
        const response = await fetch(url, {
          method: "GET",
          mode: "cors",
          credentials: "include",
          headers: {
            "content-type": "application/json",
          },
        });

        if (response.ok) {
          const data = await response.json();
          if (data && data.length > 0) {
            setUsuarios(data);
          }
        } else {
          Swal.fire({
            icon: "info",
            title: "No hay resultados para la búsqueda existente",
          });
        }
      } catch (error) {
        console.error("Error al obtener los usuarios:", error);
      }
    };

    obtenerUsuarios();
  }, []);

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

  const handleUserClick = async (usuario) => {
    const { value: operation } = await Swal.fire({
      title: "¿Quieres sumar o restar dinero?",
      input: "select",
      inputOptions: {
        sumar: "Sumar",
        restar: "Restar",
      },
      inputPlaceholder: "Selecciona una opción",
      showCancelButton: true,
    });

    if (operation) {
      setSelectedUser(usuario);
      setOperation(operation);
      setShowModal(true);
    }
  };

  const handleModalSubmit = async () => {
    if (amount.trim() === '' || note.trim() === '') {
      Swal.fire({
        icon: 'warning',
        title: 'Campos obligatorios',
        text: 'Por favor, completa todos los campos.',
      });
      return;
    }

    
    const numericAmount = parseFloat(amount.replace(/[^\d.-]/g, ""));

    if (operation === "restar" && numericAmount > selectedUser?.balance) {
      Swal.fire({
        icon: "error",
        title: "No puedes restar más de lo que tiene el usuario en la cuenta",
      });

      setShowModal(false);
      setAmount("");
      return;
    }

    const confirmationResult = await Swal.fire({
      icon: "question",
      title: `¿Estás seguro que quieres ${
        operation === "sumar" ? "sumarle" : "restarle"
      } ${amount} al balance del usuario ${selectedUser?.name}?`,
      showCancelButton: true,
      confirmButtonText: "Sí, actualizar",
      cancelButtonText: "Cancelar",
    });

    if (!confirmationResult.isConfirmed) {
      setShowModal(false);
      setAmount("");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("id", selectedUser?.id);
      formData.append("balance", amount);
      formData.append("operation", operation);
      formData.append("note", note);

      const response = await fetch(
        `${Config.backendBaseUrlAdmin}updateUserBalance.php`,
        {
          method: "POST",
          credentials: "include",
          body: formData,
        }
      );

      if (response.ok) {
        Swal.fire({
          icon: "success",
          title: "Balance actualizado con éxito",
          didClose: () => {
            window.location.reload();
          },
        });
      } else {
        console.error("Error al actualizar el balance del usuario");
        Swal.fire({
          icon: "error",
          title: "Error al actualizar el balance del usuario",
        });
      }
    } catch (error) {
      console.error("Error en la solicitud fetch:", error);
      Swal.fire({
        icon: "error",
        title: "Error inesperado",
      });
    }

    setShowModal(false);
    setAmount("");
  };

  const handleAmountChange = (e) => {
    const numericAmount = formatAmount(e.target.value);
    setAmount(numericAmount);
  };

  return (
    <div className="">
      <div className="title">
        <h2>Balance de usuarios </h2>
      </div>

      <div className="lista_usuarios">
        {usuarios.map((usuario, index) => (
          <ul
            key={usuario.id || index}
            onClick={() => handleUserClick(usuario)}
          >
            <li>
              <div className="icono">{usuario.name.charAt(0)}</div>
            </li>

            <li>
              <h2>Usuario</h2>
              <span>{usuario.name}</span>
            </li>

            <li>
              <h2>Balance</h2>
              <span>${usuario.balance}</span>
            </li>

            <li className={`estatus ${usuario.status}`}>
              <h2>Estatus</h2>
              <span>{usuario.status}</span>
            </li>
          </ul>
        ))}
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-window">
            <h2 className="swal2-title">{`Ingresa la cantidad a ${operation}`}</h2>

            <div className="grupo-input">
              <label htmlFor="">Monto a {operation}</label>
              <input
                className="swal2-input"
                type="text"
                value={amount}
                onChange={handleAmountChange}
              />
            </div>

            <div className="grupo-input">
              <label htmlFor="">Nota para el usuario</label>
              <input
                className="swal2-input"
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </div>

            <button
              className="modal-submit swal2-confirm swal2-styled"
              onClick={handleModalSubmit}
            >
              Actualizar
            </button>

            <button
              className="modal-close swal2-close"
              onClick={() => setShowModal(false)}
            >
              X
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default List_Balances;
