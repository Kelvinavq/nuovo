// AuthProvider.js
import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setLoggedIn] = useState(/* Lógica para verificar si el usuario está autenticado o no */);

  const login = () => {
    // Lógica para realizar el inicio de sesión
    setLoggedIn(true);
  };

  const logout = () => {
    // Lógica para cerrar la sesión
    setLoggedIn(false);
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
