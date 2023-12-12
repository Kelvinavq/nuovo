import Depositos_a from "../../components/Admin/Depositos_Admin/Depositos_a"
import Sidebar_a from "../../components/Admin/Sidebar_Admin/Sidebar_a";
import Button_a from "../../components/Admin/Sidebar_Admin/Button_a";

const Depositos_admin = () => {
  return (
    <div className="depositos_a">
    <Sidebar_a />
    <Button_a />

    <main>
      <Depositos_a />
    </main>
  </div>
  )
}

export default Depositos_admin
