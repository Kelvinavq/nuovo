import React, { useState, useContext, useEffect, useRef } from "react";
import { LanguageContext } from "../../Language/LanguageContext";
import { Translation } from "../../Language/Translation";
import Config from "../../Config";
import inglesIcon from "../../assets/icons/ingles.png";
import espanaIcon from "../../assets/icons/espana.png";
import portugalIcon from "../../assets/icons/portugal.png";

import "./Style.css";

const languageFlagMap = {
  es: espanaIcon,
  en: inglesIcon,
  pt: portugalIcon,
};

const LanguageSelector = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("es");

  const toggleDropdown = () => {
    setDropdownOpen((prevState) => !prevState);
  };

  const buttonRef = useRef(null);
  const chevronRef = useRef(null);
  const menuRef = useRef(null);

  const handleDocumentClick = (event) => {
    const { target } = event;

    if (
      !buttonRef.current.contains(target) &&
      !chevronRef.current.contains(target) &&
      !menuRef.current.contains(target)
    ) {
      // Cerrar el menú si se hace clic fuera de él
      setDropdownOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("click", handleDocumentClick);

    return () => {
      document.removeEventListener("click", handleDocumentClick);
    };
  }, []);

  useEffect(() => {
    const button = buttonRef.current;
    const chevron = chevronRef.current;
    const menu = menuRef.current;

    if (button && chevron && menu) {
      const buttonRect = button.getBoundingClientRect();
      const chevronRect = chevron.getBoundingClientRect();
      const menuRight = buttonRect.right - chevronRect.right;
      const menuTop = chevronRect.top - buttonRect.top;

      if (dropdownOpen) {
        menu.style.top = `${buttonRect.height + 10}px`;
        menu.style.right = 0;
      } else {
        menu.style.top = `${menuTop}px`;
        menu.style.right = `${menuRight}px`;
      }
    }
  }, [dropdownOpen]);

  const { language, setLanguage } = useContext(LanguageContext);

  const handleLanguageChange = (newLanguage) => {
    setLanguage(newLanguage);
    setSelectedLanguage(newLanguage);
    setDropdownOpen(false);
    updateLanguageOnBackend(newLanguage);
  };

  const updateLanguageOnBackend = async (newLanguage) => {
    try {
      const response = await fetch(`${Config.backendBaseUrl}updateLanguage.php`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          language: newLanguage,
        }),
        credentials: "include",
      });

      if (response.ok) {
        console.log("Idioma actualizado en el backend con éxito.");
      } else {
        console.error(
          "Error al actualizar el idioma en el backend:",
          response.status,
          response.statusText
        );
      }
    } catch (error) {
      console.error("Error en la solicitud al backend:", error);
    }
  };

  useEffect(() => {
    setSelectedLanguage(language);
  }, [language]);

  return (
    <>
      <div className="selector">
        <div className={`dropdown ${dropdownOpen ? "open" : ""}`} id="dropdown">
          <button className="btnSelector" id="button" onClick={toggleDropdown} ref={buttonRef}>
            <img id="chevron" className="chevron" src={languageFlagMap[selectedLanguage]} alt="" ref={chevronRef} />
          </button>
          <div id="menu" className="menu" ref={menuRef}>
            <button className="btnSelector" onClick={() => handleLanguageChange("es")}>
              <img src={espanaIcon} alt="" />
            </button>
            <button className="btnSelector" onClick={() => handleLanguageChange("en")}>
              <img src={inglesIcon} alt="" />
            </button>
            <button className="btnSelector" onClick={() => handleLanguageChange("pt")}>
              <img src={portugalIcon} alt="" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default LanguageSelector;
