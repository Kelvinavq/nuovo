import Retirar from "../../components/User/Retiros/Retirar";
import Sidebar from "../../components/User/sidebar/Sidebar";
import Button from "../../components/User/sidebar/Button";
import Lateral from "../../components/User/Lateral/Lateral";

const Retiros = () => {
  return (
    <div className="retiros">
      <Sidebar />
      <Button />

      <main>
        <Retirar />
        <Lateral />
      </main>
    </div>
  );
};

export default Retiros;
