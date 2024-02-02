import React, { createContext, useState, useEffect } from "react";
import Cookies from "js-cookie";

export const LanguageContext = createContext();

export const LanguageContextProvider = ({ children }) => {
  const userLanguage = navigator.language.split("-")[0]; 

  const storedLanguage = Cookies.get("selectedLanguage") || userLanguage;

  const [language, setLanguage] = useState(userLanguage || "es");

  useEffect(() => {
    setLanguage(storedLanguage);
  }, [storedLanguage]);

    const changeLanguage = (newLanguage) => {
      Cookies.set("selectedLanguage", newLanguage, { expires: 365 }); 
      setLanguage(newLanguage);
    };

    return (
      <LanguageContext.Provider value={{ language, setLanguage: changeLanguage }}>
        {children}
      </LanguageContext.Provider>
    );
};
