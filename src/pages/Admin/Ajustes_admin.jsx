import Sidebar_a from "../../components/Admin/Sidebar_Admin/Sidebar_a";
import Button_a from "../../components/Admin/Sidebar_Admin/Button_a";
import Ajustes_a from "../../components/Admin/Ajustes_Admin/Ajustes_a";

const Verificaciones_Admin = () => {
  return (
    <div classname="ajustes_a perfil">
      <Sidebar_a />
      <Button_a />

      <main >
        <Ajustes_a />
      </main>
    </div>
  );
};

export default Verificaciones_Admin;
