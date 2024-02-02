import "./Style.css";
const LegalTerms = () => {
  return (
    <div className="contenedor_legales">
        <div className="title">
            <h1>Términos Legales</h1>
        </div>
      <div className="legales">
        <ul>
          <li>Todas las imágenes son solamente a modo de ilustración.</li>
          <li>
            Nuovo no es un banco. Nuovotech LLC es un proveedor de servicios
            tecnológicos.
          </li>
          <li>
            La apertura de cuenta y otros servicios bancarios provistos por
            Nuovo están sujetos a la aplicación de las leyes de los Estados
            Unidos y los términos y condiciones. Nuovo puede rechazar la
            apertura o mantenimiento de cuentas que violen las leyes de los
            Estados Unidos y los términos y condiciones. Al abrir una cuenta
            utilizando la aplicación móvil de Nuovo, o hacer uso de sus
            servicios o realizar una firma electrónica, aceptas los términos y
            condiciones de Nuovo, todas las leyes aplicables y sus regulaciones,
            y aceptas la responsabilidad de conformidad con cualquier y todas
            las leyes locales aplicables.
          </li>
        </ul>
      </div>
    </div>
  );
};

export default LegalTerms;
