import Verificaciones_a from "../../components/Admin/Verificaciones_Admin/Verificaciones_a";
import Button_a from "../../components/Admin/Sidebar_Admin/Button_a";
import Sidebar_a from "../../components/Admin/Sidebar_Admin/Sidebar_a";
Sidebar_a

const Verificaciones_Admin = () => {
  return (
    <div className="verificaciones_a">
      <Sidebar_a />
      <Button_a />

      <main>
        <Verificaciones_a />
      </main>
    </div>
  );
};

export default Verificaciones_Admin;
