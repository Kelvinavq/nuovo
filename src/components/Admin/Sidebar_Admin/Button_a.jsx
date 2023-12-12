import MenuOpenIcon from "@mui/icons-material/MenuOpen";
import React, { useState, useEffect } from "react";

const Button_a = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleOutsideClick = (event) => {
    if (
      isSidebarOpen &&
      !event.target.closest(".sidebar") &&
      !event.target.closest(".btnSidebar")
    ) {
      setIsSidebarOpen(false);
    }
  };

  useEffect(() => {
    document.body.classList.toggle("open", isSidebarOpen);
    document.addEventListener("click", handleOutsideClick);

    return () => {
      document.body.classList.remove("open");
      document.removeEventListener("click", handleOutsideClick);
    };
  }, [isSidebarOpen]);
  return (
    <button className="btnSidebar" onClick={toggleSidebar}>
      <MenuOpenIcon />
    </button>
  );
};

export default Button_a;
