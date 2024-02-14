import React, { useState, useEffect, useRef  } from "react";
import Swal from "sweetalert2";
import "./Style.css";
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import ViewCompactIcon from '@mui/icons-material/ViewCompact';


const ListTransactions = () => {
  const [fileData, setFileData] = useState();
  const [fileList, setFileList] = useState([]);
  const [filename, setFilename] = useState("");

  const fetchFileList = async () => {
    try {
      // TODO: Cambiar la URL a la ruta correcta de tu backend para obtener la lista de archivos
      const apiUrl = "http://localhost/nuovo/backend/Api/admin/getFileList.php";
      const response = await fetch(apiUrl);

      if (response.ok) {
        const data = await response.json();
        setFileList(data.files);
      } else {
        console.error(
          "Error al obtener la lista de archivos:",
          response.statusText
        );
      }
    } catch (error) {
      console.error("Error en la solicitud fetch:", error);
    }
  };

 

  const selectFile = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".csv";

    input.addEventListener("change", (event) => {
      const file = event.target.files[0];
      showConfirmation(file);
    });

    input.click();
  };

  const showConfirmation = (file) => {
    Swal.fire({
      title: `¿Estás seguro de que quieres importar el archivo ${file.name}?`,
      text: "Solo procede si estás seguro de querer importar este archivo.",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Sí, importar",
      cancelButtonText: "Cancelar",
    }).then((result) => {
      if (result.isConfirmed) {
        readAndProcessFile(file);
      }
    });
  };

  

const readAndProcessFile = (file) => {
    const reader = new FileReader();

    reader.onload = (readerEvent) => {
      const csvData = readerEvent.target.result;
      const { columns, rows } = parseCSV(csvData);

      showColumnSelectionModal(file, columns, rows);
    };

    reader.readAsText(file);
  };


  const saveColumnsToDatabase = async (file, selectedColumns) => {
    try {
      const formData = new FormData();
      formData.append("fileName", file.name);
      formData.append("file", file);
      const selectedColumnsJSON = JSON.stringify(selectedColumns);
      formData.append("columns", selectedColumnsJSON);

      const apiUrl = "http://localhost/nuovo/backend/Api/admin/uploadCsv.php";

      const response = await fetch(apiUrl, {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();

        console.log(selectedColumnsJSON)
      } else {
        console.error("Error al guardar en la base de datos:", response.statusText);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Hubo un problema al guardar en la base de datos.",
        });
      }
    } catch (error) {
      console.error("Error en la solicitud fetch:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Error inesperado al realizar la solicitud al servidor.",
      });
    }
  };

  const parseCSV = (csvData) => {
    const rows = csvData.split("\n").map((row) => row.split(","));
    const columns = rows[0];
    return { columns, rows };
  };

  const showColumnSelectionModal = (file, columns, rows) => {
    Swal.fire({
      title: "Select Columns",
      html: getCheckboxInputs(columns),
      showCancelButton: true,
      confirmButtonText: "Guardar",
    }).then((result) => {
      if (result.isConfirmed) {
        const selectedColumns = getSelectedColumns(columns, rows);
  
        if (selectedColumns.length > 0) {
          saveColumnsToDatabase(file, selectedColumns);
        } else {
          Swal.fire({
            icon: "warning",
            title: "Warning",
            text: "Debes seleccionar al menos una columna para proceder con la importación.",
          });
        }
      }
    });
  };

  const getCheckboxInputs = (columns) => {
    return columns
      .map((column, index) => {
        return `
        <div className="checkboxs">
          <input type="checkbox" id="column${index}" value="${index}" />
          <label for="column${index}">${column}</label>
          </div>
        `;
      })
      .join("<br>");
  };

  const getSelectedColumns = (columns, rows) => {
    return columns.reduce((selectedColumns, columnName, index) => {
      const checkbox = document.getElementById(`column${index}`);
      if (checkbox.checked) {
        selectedColumns.push({
          name: columnName,
          data: getColumnData(rows, index),
        });
      }
      return selectedColumns;
    }, []);
  };


  const getColumnData = (rows, columnIndex) => {
    // Get data for the selected column
    return rows.slice(1).map((row) => row[columnIndex]);
  };


  const showImportedData = async (fileId) => {
    try {
      // TODO: Cambiar la URL a la ruta correcta de tu backend para obtener los datos importados
      const apiUrl = `http://localhost/nuovo/backend/Api/admin/getImportedData.php?fileId=${fileId}`;
      const response = await fetch(apiUrl);

      if (response.ok) {
        const data = await response.json();
        console.log("Data received:", data);

        // Obtener la lista de columnas dinámicamente
        const columns = data.columns;

        // Crear la estructura HTML de la tabla
        const tableHtml = `
        <div class="custom-table">
        <div class="header-row">
          ${columns
            .map((column) => `<div class="header-cell">${column}</div>`)
            .join("")}
        </div>
        <div class="body">
          ${data.rows
            .map(
              (row, rowIndex) => `
            <div class="data-row" key=${rowIndex}>
              ${row
                .map(
                  (cell, cellIndex) =>
                    `<div class="data-cell" key=${cellIndex}>${cell}</div>`
                )
                .join("")}
            </div>
          `
            )
            .join("")}
        </div>
      </div>
        `;

        // Mostrar SweetAlert2 con la tabla
        Swal.fire({
          title: "Datos Importados",
          html: tableHtml,
          confirmButtonText: "Cerrar",
        });
      } else {
        console.error(
          "Error al obtener datos importados:",
          response.statusText
        );
      }
    } catch (error) {
      console.error("Error en la solicitud fetch:", error);
    }
  };

  const downloadCSV = (fileName) => {
    // TODO: Cambiar la URL del servidor para apuntar al directorio donde se almacenan los archivos CSV
    const serverUrl = "http://localhost/nuovo/src/assets/csv/";
    const fileUrl = `${serverUrl}${fileName}`;
  
    // Crear un enlace invisible
    const a = document.createElement("a");
    a.style.display = "none";
    document.body.appendChild(a);
  
    // Establecer la URL del enlace al URL del archivo en el servidor
    a.href = fileUrl;
  
    // Establecer el nombre del archivo para la descarga
    a.download = fileName;
  
    // Simular un clic en el enlace para iniciar la descarga
    a.click();
  
    // Eliminar el enlace
    document.body.removeChild(a);
  };
  // Obtener la lista de archivos al cargar el componente
  useEffect(() => {
    fetchFileList();
  }, []);

  return (
    <div className="">
      <div className="title">
        <h2>Lista de archivos CSV</h2>

       <button className="btns" onClick={selectFile }>Subir CSV</button>
      </div>

      <div className="lista_transacciones">
        {fileList.map((file) => (
          <ul key={file.id}>
            <li>
              <h2>Archivo</h2>
              <span>{file.filename}</span>
            </li>

            <li>
              <h2>Fecha</h2>
              <span>{file.uploaded_at}</span>
            </li>

            <li>
              <button onClick={() => downloadCSV(file.filename)}>
                <p>Descargar CSV</p>
                <FileDownloadIcon/>
              </button>
            </li>

            <li>
              <button onClick={() => showImportedData(file.id)}>
                <p>Ver importados</p>
                <ViewCompactIcon/>
              </button>
            </li>
          </ul>
        ))}
      </div>
    </div>
  );
};

export default ListTransactions;
