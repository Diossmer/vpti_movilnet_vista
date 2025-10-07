import router from '@/router';
import { defineStore } from 'pinia'
import { ref, onMounted, computed, watch } from 'vue'
import ApiSettings from '@/components/api/querySettings';

const { get, post, patch } = ApiSettings();
export const useLoginStore = defineStore('login', ()=>{
  //state
  const dataStore = ref(null);
  const ErrorStore = ref(null);
  const isAuthenticated = ref(false);
  const dataPerfil = ref(null);
  const showExtensionDialog = ref(false);
  const tiempoRestante = ref(0);
  const sessionInterval = ref(null);
  //action
  const ingresar = async ( usuario, password ) => {
    await post(process.APP_URL+"/api/ingresar",{ usuario, password },'','include')
    .then( async (responseData) => {
      if(responseData.error){
        if (responseData.error.usuario) {
          ErrorStore.value = responseData.error.usuario;
          throw new Error(responseData.error.usuario);
        }
        if (responseData.error.password) {
          ErrorStore.value = responseData.error.password
          throw new Error(responseData.error.password);
        }
        throw new Error(responseData.error);
      }
      dataStore.value = await responseData;
      if(dataStore.value.access_token){
        isAuthenticated.value = true;
        localStorage.setItem('token_expiration', new Date(Date.now() + (responseData.expires_in*1000)).toISOString());
        localStorage.setItem('ingresar', isAuthenticated.value);
        localStorage.setItem('token', dataStore.value.access_token);
        await iniciarSesion();
        await perfil();
        await router.push('/dashboard');
      }
    })
    .catch((err) => {
      console.error('Error:', err.message);
      ErrorStore.value = err.message;
    });
  };

  const salir = async() =>{
    await post(process.APP_URL+"/api/salir",null, localStorage.getItem('token'))
    .then((data)=>{
      ErrorStore.value = data[0];
      isAuthenticated.value = false;
      showExtensionDialog.value = false;
      localStorage.removeItem('ingresar')
      localStorage.removeItem('token')
      localStorage.removeItem('token_expiration');
      router.push({ name: 'home' });
    })
    .catch((err) => {console.error('Error:', err.message);});
    isAuthenticated.value = false;
    localStorage.removeItem('ingresar')
    localStorage.removeItem('token')
    localStorage.removeItem('token_expiration');
  }

  const perfil = async() => {
    await get(process.APP_URL+'/api/perfil',localStorage.getItem('token'))
    .then( ( data )=>{
      dataPerfil.value = data
      isAuthenticated.value = true;
      if(data.error){
        isAuthenticated.value = false
        localStorage.setItem('ingresar',isAuthenticated.value)
      }
    }).catch((err)=>{console.error(err); dataPerfil.value = err });
  }

  const iniciarSesion = async () => {
    clearInterval(sessionInterval.value);
    sessionInterval.value = setInterval(async() => {
      const expiration = localStorage.getItem('token_expiration');
      if (!expiration) return;

      tiempoRestante.value = Math.ceil((new Date(expiration) - Date.now()));

      // Mostrar diálogo 5 minutos antes
      if (tiempoRestante.value <= 5 * 60 * 1000 && !showExtensionDialog.value) {
        showExtensionDialog.value = true;
      }

      // Cierre automático al expirar
      if (tiempoRestante.value <= 0) {
        await salir();
      }
    }, Math.max(1000, 0)); // Actualización cada segundo
  };

  const extenderSesion = async () => {
    try {
      const data = await patch(process.APP_URL + "/api/refrescar",null,localStorage.getItem('token'));
      // Actualizar tiempo de expiración
      const newExpiration = Date.now() + (data.expires_in * 1000);
      localStorage.setItem('token', data.access_token);
      localStorage.setItem('token_expiration', new Date(newExpiration).toISOString());
      showExtensionDialog.value = false;
      iniciarSesion(); // Reiniciar monitor

    } catch (error) {
      console.error('Error renovando sesión:', error);
      await salir();
    }
  };

  const actualizarDatosPerfil = async (profilePayload) => {
  try {
   // Realiza la solicitud PATCH con los campos modificados
   const data = await patch(
    process.APP_URL + "/api/perfil/refrescar",
    profilePayload,
    localStorage.getItem('token')
   );

   if (data.error) {
    // Si la API devuelve un error estructurado, lo devolvemos
    return { success: false, error: data.error };
   }

   if (data.access_token) {
     const newExpiration = Date.now() + (data.expires_in * 1000);
     localStorage.setItem('token', data.access_token);
     localStorage.setItem('token_expiration', new Date(newExpiration).toISOString());
   }

   dataPerfil.value = { ...dataPerfil.value, ...data };

   // ¡CAMBIO CLAVE AQUÍ!
   // Devolvemos el mensaje de éxito. Asumo que el servidor podría devolver 'mensaje'.
   // Si tu API no devuelve un 'mensaje', usa un valor estático más informativo.
   return {
    success: true,
    mensaje: data.mensaje || 'Datos de perfil actualizados exitosamente.' // 👈 Mensaje del servidor o por defecto
   };

  } catch (error) {
   console.error('Error actualizando perfil:', error);
   // En caso de error de red/servidor, devolvemos un error.
   return { success: false, error: 'Error de red o servidor al actualizar datos.' };
  }
 }

  const cambioContrasena = async (payload) => {
    try {
      const params = {
        password_old: payload.password_antigua,
        password: payload.nueva_password,
      }

      const data = await patch(process.APP_URL + "/api/perfil/contrasena",params,localStorage.getItem('token'));

      if (data.error) {
        const errorMessage = data.error?.password_old?.[0] || data.error?.password?.[0] || data.mensaje || 'Error desconocido del servidor.';
        return { success: false, error: errorMessage };
      }

      // Si el cambio de contraseña fue exitoso, se refresca el token
      if (data.access_token && data.expires_in) {
        const newExpiration = Date.now() + (data.expires_in * 1000);
        localStorage.setItem('token', data.access_token);
        localStorage.setItem('token_expiration', new Date(newExpiration).toISOString());
        
        // Cerrar modal o reiniciar monitor de sesión si es necesario
        if (typeof showExtensionDialog !== 'undefined') {
            showExtensionDialog.value = false;
        }
        if (typeof iniciarSesion === 'function') {
            await iniciarSesion();
        }
      }

      if(data){
        ErrorStore.value = data.mensaje;
        isAuthenticated.value = false;
        showExtensionDialog.value = false;
        localStorage.removeItem('ingresar')
        localStorage.removeItem('token')
        localStorage.removeItem('token_expiration');
        router.push({ name: 'home' });
      }
      return { 
        success: true,
        mensaje: data.mensaje || 'Cambio de contraseña exitosamente.'
      };

      } catch (err) {
        console.error('Error cambiando contraseña:', err);
        await salir();
      }
    }

    onMounted(async () => {
      watch(dataPerfil,async ()=>{
      if(dataPerfil.value===''||dataPerfil.value===undefined||dataPerfil.value===null){
          await perfil();
        }
      });
      if(localStorage.getItem("token") || dataPerfil.value === null){
        await perfil();
        await iniciarSesion();
      }
    });
  return { dataPerfil, isAuthenticated, ErrorStore, showExtensionDialog, tiempoRestante, perfil, ingresar, salir, iniciarSesion, extenderSesion, cambioContrasena, actualizarDatosPerfil };
})
