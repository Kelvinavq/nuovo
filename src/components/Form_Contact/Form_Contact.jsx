import React, { useState } from "react";
import { Link } from "react-router-dom";
import Swal from 'sweetalert2';
import logotipo from "../../assets/images/nuovo.png";
import "./Style.css";
import Config from "../../Config"

const Form_Contact = () => {
  const [form, setForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const fieldNames = {
    name: 'Nombre y apellido',
    email: 'Correo electrónico',
    subject: 'Asunto',
    message: 'Mensaje'
  };

  const handleChange = e => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async e => {
    e.preventDefault();

    for (let key in form) {
      if (form[key] === '') {
        Swal.fire({
          icon: 'error',
          title: 'Campo vacío',
          text: `Por favor, rellena el campo ${fieldNames[key]}`
        });
        return;
      }
    }

    try {
        const response = await fetch(`${Config.backendBaseUrl}contact.php`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          mode: "cors",
          credentials: "include",
          body: JSON.stringify(form)
        });
  
        if (!response.ok) {
          throw new Error('Hubo un problema al enviar el formulario');
        }
  
        Swal.fire({
          icon: 'success',
          title: 'Formulario enviado',
          text: 'Gracias por contactarnos. Te responderemos lo antes posible.',
          didClose: () =>{
            window.location = "/"
          }
        });
  
        setForm({
          name: '',
          email: '',
          subject: '',
          message: ''
        });
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Error al enviar el formulario',
          text: error.message
        });
      }
  };

  return (
    <div className="contact">
      <form onSubmit={handleSubmit}>
        <div className="content">
          <img src={logotipo} alt="logotipo nuovotech" />
          <h2>Contáctanos</h2>
        </div>

        <div className="inputs">
          <div className="grupo-input">
            <label htmlFor="name">Nombre y apellido</label>
            <input
              type="text"
              name="name"
              id="name"
              placeholder="Nombre y apellido"
              value={form.name}
              onChange={handleChange}
            />
          </div>

          <div className="grupo-input">
            <label htmlFor="email">Correo electrónico</label>
            <input
              type="email"
              name="email"
              id="email"
              placeholder="E-mail"
              value={form.email}
              onChange={handleChange}
            />
          </div>

          <div className="grupo-input">
            <label htmlFor="subject">Asunto</label>
            <input
              type="text"
              name="subject"
              id="subject"
              placeholder="Asunto"
              value={form.subject}
              onChange={handleChange}
            />
          </div>

          <div className="grupo-input">
            <label htmlFor="message">Mensaje</label>
            <textarea
              name="message"
              id="message"
              value={form.message}
              onChange={handleChange}
            ></textarea>
          </div>

          <div className="submit">
            <input type="submit" value="enviar" />
          </div>

          <div className="enlace">
            <p>
              <Link to="/login">Iniciar sesión</Link>
            </p>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Form_Contact;
