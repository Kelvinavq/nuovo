import React from "react";
import ReactDOM from "react-dom/client";

// configuration css
import "./css/config.css";

// idiomas
import { LanguageContextProvider } from "./Language/LanguageContext";

// routes import
import { AuthProvider } from "./AuthProvider ";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

// import components
import Home from "./pages/Home/Index";
import Login from "./pages/Login/Login";
import Register from "./pages/Register/Register";
import ResetPassword from "./pages/password/ResetPassword";
import ResetPasswordPage from "./pages/ResetPasswordPage/ResetPasswordPage"
import Legal from "./pages/Legal/Legal";
import Contact from "./pages/Contact/Contact";

import Dashboard from "./pages/User/Dashboard";
import Retiros from "./pages/User/Retiros";
import Depositos from "./pages/User/Depositos";
import Perfil from "./pages/User/Ajustes_Perfil";
import Ajustes_Verificacion from "./pages/User/Ajustes_Verificacion";
import Ajustes_Seguridad from "./pages/User/Ajustes_Seguridad";
import Ajustes_Plataformas from "./pages/User/Ajustes_Plataformas";

// admin
import Dashboard_a from "./pages/Admin/Dashboard_a";
import Retiros_admin from "./pages/Admin/Retiros_admin";
import Depositos_admin from "./pages/Admin/Depositos_admin";
import Verificaciones_admin from "./pages/Admin/Verificaciones_admin";
import Ajustes_admin from "./pages/Admin/Ajustes_admin";
import Verificacion from "./pages/Admin/Verificacion";
import Users from "./pages/Admin/Users";
import Ajustes_a_Seguridad from "./pages/Admin/Ajustes_a_Seguridad";
import Bancos from "./pages/Admin/Bancos";
import Plataformas from "./pages/Admin/Plataformas";
import Movimientos from "./pages/User/Movimientos";
import Movimientos_admin from "./pages/Admin/Movimientos_admin"
import Transacciones from "./pages/Admin/Transacciones";
import Balances_Users from "./pages/Admin/Balances_Users"



// paths
const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/registro",
    element: <Register />,
  },
  {
    path: "/reset-password",
    element: <ResetPassword />,
  },
  {
    path: "/reset-password-page",
    element: <ResetPasswordPage />,
  },
  {
    path: "/legal",
    element: <Legal />,
  },
  {
    path: "/contacto",
    element: <Contact />,
  },
  {
    path: "/user/dashboard",
    element: <Dashboard />,
  },
  {
    path: "/user/retirar",
    element: <Retiros />,
  },
  {
    path: "/user/depositar",
    element: <Depositos />,
  },
  {
    path: "/user/ajustes/perfil",
    element: <Perfil />,
  },
  {
    path: "/user/ajustes/verificacion",
    element: <Ajustes_Verificacion />,
  },
  {
    path: "/user/ajustes/seguridad",
    element: <Ajustes_Seguridad />,
  },
  {
    path: "/user/ajustes/plataformas",
    element: <Ajustes_Plataformas />,
  },
  {
    path: "/user/movimientos",
    element: <Movimientos />,
  },

  // admin
  {
    path: "/admin/dashboard",
    element: <Dashboard_a />,
  },
  {
    path: "/admin/retiros",
    element: <Retiros_admin />,
  },
  {
    path: "/admin/depositos",
    element: <Depositos_admin />,
  },
  {
    path: "/admin/verificaciones",
    element: <Verificaciones_admin />,
  },
  {
    path: "/admin/verificacion",
    element: <Verificacion />,
  },
  {
    path: "/admin/usuarios",
    element: <Users />,
  },
  {
    path: "/admin/ajustes",
    element: <Ajustes_admin />,
  },
  {
    path: "/admin/ajustes/seguridad",
    element: <Ajustes_a_Seguridad />,
  },
  {
    path: "/admin/ajustes/bancos",
    element: <Bancos />,
  },
  {
    path: "/admin/ajustes/plataformas",
    element: <Plataformas />,
  },
  {
    path: "/admin/movimientos",
    element: <Movimientos_admin />,
  },
  {
    path: "/admin/transacciones",
    element: <Transacciones />,
  },
  {
    path: "/admin/balances",
    element: <Balances_Users />,
  },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <LanguageContextProvider>
      <RouterProvider router={router}></RouterProvider>
    </LanguageContextProvider>
  </React.StrictMode>
);