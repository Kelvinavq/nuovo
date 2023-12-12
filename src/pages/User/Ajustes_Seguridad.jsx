import Sidebar from "../../components/User/sidebar/Sidebar"
import Button from "../../components/User/sidebar/Button"
import Lateral from "../../components/User/Lateral/Lateral"
import Seguridad from "../../components/User/Ajustes/Seguridad"

const Ajustes_Seguridad = () => {
  return (
    <div className="perfil">
      <Sidebar />
      <Button />

      <main>
        <Seguridad />
        <Lateral />
      </main>
    </div>
  )
}

export default Ajustes_Seguridad
