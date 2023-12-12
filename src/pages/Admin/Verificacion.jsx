import Verificacion_a from "../../components/Admin/Verificaciones_Admin/Verificacion_a";
import Button_a from "../../components/Admin/Sidebar_Admin/Button_a";
import Sidebar_a from "../../components/Admin/Sidebar_Admin/Sidebar_a";
Sidebar_a;

const Verificacion = () => {
  return (
    <div className="verificacion_a">
      <Sidebar_a />
      <Button_a />

      <main>
        <Verificacion_a />
      </main>
    </div>
  );
};

export default Verificacion;
