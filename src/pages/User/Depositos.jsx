import Depositar from "../../components/User/Depositos/Depositar";
import Sidebar from "../../components/User/sidebar/Sidebar";
import Button from "../../components/User/sidebar/Button";
import Lateral from "../../components/User/Lateral/Lateral";

const Depositos = () => {
  return (
    <div className="depositos">
      <Sidebar />
      <Button />

      <main>
        <Depositar  />
        <Lateral />
      </main>
    </div>
  );
};

export default Depositos;
