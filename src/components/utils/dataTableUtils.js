const dataTable = () => {
/*** TABLE ***/
  //columnas
  const columns = (data) => {
    const columnas1 = [];
    const columnas2 = [];
    data.map((col) => {
      Object.keys(col).map((key) => {
        // Verifica si el título ya está en columnas1
        const existsInColumnas1 = columnas1.some(column => column.title === key);
        // Verifica si el título no es uno de los excluidos
        const esExcluido = [
          'productos',
          'usuarios',
          'asignaciones',
          'perifericos',
          'inventarios',
          'evaluaciones',
          'descripcion',
          'descripciones',
          'direccion',
          'ciudad',
          'estado',
          'telefono_casa',
          'telefono_celular',
          'telefono_alternativo',
          'codigo_postal',
          'observacion',
          'notas',
          'comentario',
          'ubicaciones',
        ].includes(key);
        // Si no existe y no está excluido, lo añade a columnas1
        if (!existsInColumnas1 && !esExcluido) {
          columnas1.push({ title: key, sortable: true }); // Inserta el objeto en columnas
        }
      })
    });
    columnas2.push({ title:"accion" })
    /* const columnas = columnas1.slice(0,6).concat(columnas2) */
    const columnas = columnas1.concat(columnas2)
    return columnas;
  }
  //Orden de la tabla
  const sortTable = (data,column,columnIndex) => {
    if (column[columnIndex].sortable) {
      data.sort((a, b) => {
        const aText = Object.values(a)[columnIndex]?.toString();
        const bText = Object.values(b)[columnIndex]?.toString();
        return aText?.localeCompare(bText);
      });
      }
  };
/*** TABLE ***/
return { columns, sortTable }
}
export { dataTable };
