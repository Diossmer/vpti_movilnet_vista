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
      console.log(data)
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

  /* watch(dataPerfil,async ()=>{
    console.log(dataPerfil.value)
    if(dataPerfil.value===''||dataPerfil.value===undefined||dataPerfil.value===null){
      await perfil();
    }
  }); */

  onMounted(async () => {
    if(localStorage.getItem("token") || dataPerfil.value === null){
      await perfil();
      await iniciarSesion();
    }
  });
  return { dataPerfil, isAuthenticated, ErrorStore, showExtensionDialog, tiempoRestante, perfil, ingresar, salir, iniciarSesion, extenderSesion };
})
