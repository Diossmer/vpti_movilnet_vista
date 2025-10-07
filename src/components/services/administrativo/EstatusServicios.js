import querySettings from "@/components/api/querySettings";
const { get, post, put, blob, destroy, formData } = querySettings();

export default async function EstatusServicios(action, data = null, params = null) {
  try {
    let response,FileReader,url,a;
    if(action != 'fetchAll'){
      switch (action) {
        case 'fetch':
          return await get(`${process.APP_URL}/api/estatus/${data}`, localStorage.getItem('token'));
        case 'create':
          response = await post(`${process.APP_URL}/api/estatus`, params, localStorage.getItem('token'));
          return response;
        case 'update':
          response = await put(`${process.APP_URL}/api/estatus/${data}`, params, localStorage.getItem('token'));
          return response;
        case 'delete':
          response = await destroy(`${process.APP_URL}/api/estatus/${data}`, localStorage.getItem('token'));
          return response;
        case 'export':
            FileReader = await blob(`${process.APP_URL}/api/estatusexportar/${data}`, localStorage.getItem('token'));
            url = URL.createObjectURL(FileReader);
            a = document.createElement('a');
            a.href = url;
            a.download = params+'.xlsx';
            document.body.appendChild(a);
            a.click();
            a.remove();
            URL.revokeObjectURL(url);
          break;
        case 'exportAll':
            FileReader = await blob(`${process.APP_URL}/api/estatusexportar/${params}`, localStorage.getItem('token'));
            url = URL.createObjectURL(FileReader);
            a = document.createElement('a');
            a.href = url;
            a.download = params+'.xlsx';
            document.body.appendChild(a);
            a.click();
            a.remove();
            URL.revokeObjectURL(url);
          break;
        case 'import':
          return await formData(`${process.APP_URL}/api/estatusimportar`, params, localStorage.getItem('token'));
          //break;
        case 'pdf':
            FileReader = await blob(`${process.APP_URL}/api/estatuspdf/${data}/${params}`, localStorage.getItem('token'));
            url = URL.createObjectURL(FileReader);
            a = document.createElement('a');
            a.href = url;
            a.download = params+'.pdf';
            document.body.appendChild(a);
            a.click();
            a.remove();
            URL.revokeObjectURL(url);
          break;
        default:
          throw new Error('Acción no válida');
      }
    }
  } catch (error) {
    throw error;
  } finally {
    if(action!=='fetch'&&action!=='create'&&action!=='update'&&action!=='delete'&&action!=='export'&&action!=='exportAll'&&action!=='import'&&action!=='importAll'&&action!=='pdf'&&action!=='pdfAll'){
      return { mostrarT: await get(`${process.APP_URL}/api/estatus`, localStorage.getItem('token')) };
    }
  }
}
