import Retiros_a from "../../components/Admin/Retiros_Admin/Retiros_a";
import Sidebar_a from "../../components/Admin/Sidebar_Admin/Sidebar_a";
import Lateral_a from "../../components/Admin/Lateral_Admin/Lateral_a";
import Button_a from "../../components/Admin/Sidebar_Admin/Button_a";

const Retiros_admin = () => {
  return (
    <div className="retiros_a">
      <Sidebar_a />
      <Button_a />

      <main>
        <Retiros_a />
      </main>
    </div>
  );
};

export default Retiros_admin;
