import Sidebar_a from "../../components/Admin/Sidebar_Admin/Sidebar_a";
import Balance_a from "../../components/Admin/Balance_Admin/Balance_a";
import Grafico from "../../components/Admin/Grafico_Admin/Grafico";
import Lateral_a from "../../components/Admin/Lateral_Admin/Lateral_a";
import Button_a from "../../components/Admin/Sidebar_Admin/Button_a";

const Dashboard_a = () => {
  return (
    <div className="dashboard_a">
      <Sidebar_a />
      <Button_a />

      <main>
      <Balance_a />
      <Grafico />
      <Lateral_a />
      </main>
    </div>
  );
};

export default Dashboard_a;
