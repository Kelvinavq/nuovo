import Sidebar from "../../components/User/sidebar/Sidebar"
import Button from "../../components/User/sidebar/Button"
import Lateral from "../../components/User/Lateral/Lateral"
import Verificacion from "../../components/User/Ajustes/Verificacion"

const Ajustes_Verificacion = () => {
  return (
<div className="verificacion">
      <Sidebar />
      <Button />

      <main>
        <Verificacion />
        <Lateral />
      </main>
    </div>
  )
}

export default Ajustes_Verificacion
