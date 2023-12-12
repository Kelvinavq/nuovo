import Sidebar from "../../components/User/sidebar/Sidebar"
import Button from "../../components/User/sidebar/Button"
import Lateral from "../../components/User/Lateral/Lateral"
import Perfil from "../../components/User/Ajustes/Perfil"

const Ajustes_Perfil = () => {
  return (
    <div className="perfil">
      <Sidebar />
      <Button />

      <main>
        <Perfil />
        <Lateral />
      </main>
    </div>
  )
}

export default Ajustes_Perfil
