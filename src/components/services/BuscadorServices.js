import querySettings from "@/components/api/querySettings";
const { get, post } = querySettings();
export  default async function BuscadorServices(action, data = null, params = null){
  try {    
    if(action != 'fetchAll'){
      let response,FileReader,url,a;
      switch (action) {
        case 'create':
          response = await post(`${process.APP_URL}/api/principal`, params, localStorage.getItem('token'));
          return response;
        default:
          throw new Error('Acción no válida');
      }
    }
  } catch (error) {
    throw error;
  } finally {
    if(action!=='create'){
      return {
        mostrarT: await get(`${process.APP_URL}/api/productos`, localStorage.getItem('token')),
      };
    }
  }
}
