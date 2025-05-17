<script setup>
import { ref, watch } from 'vue';
import { validacionesUtils } from '@/components/utils/validacionesUtils';
import AlertComponents from '@/components/AlertComponents.vue';
import { useRouter } from 'vue-router'
import { useLoginStore } from '@/stores/autenticacion';
import { storeToRefs } from 'pinia';
const store = useLoginStore()
const { isAuthenticated, dataPerfil } = storeToRefs(store)
console.log(dataPerfil.value);

const router = useRouter();
const { cambioContraseña } = store;
const passwordVisible = ref(false);
const avisosAlert = ref(null);
const passwordRepetir = ref("");
const password = ref("");
const passwordAntiguo = ref("");
watch([ () => passwordAntiguo.value, () => passwordRepetir.value, () => password.value], ([passwordAntiguo,passwordRepetir,password]) => {
  const errors = [];

  const passwordAntiguoError = validacionesUtils().passwordValid(passwordAntiguo);
  if (passwordAntiguoError) errors.push(passwordAntiguoError);
  const passwordRepetirError = validacionesUtils().passwordValid(passwordRepetir);
  if (passwordRepetirError) errors.push(passwordRepetirError);
  const passwordError = validacionesUtils().passwordValid(password);
  if (passwordError) errors.push(passwordError);
  const passwordVerificError = validacionesUtils().passwordVerificValid(password,passwordRepetir);
  if (passwordVerificError) errors.push(passwordVerificError);

  avisosAlert.value = errors.length > 0 ? { error: errors.join(' | ') } : null;

  if ((password==='' || password===undefined)
  && (passwordRepetir==='' || passwordRepetir===undefined)
  && (passwordAntiguo==='' || passwordAntiguo===undefined))
  avisosAlert.value="";
});
const goBack = () => {router.go(-1)}
</script>

<template>
  <div>
    <button @click="goBack" class="btn btn-outline-red-m btn-lg"><i class="bi bi-arrow-left-circle"></i> Regresar</button>
    <span class="badge fs-1">👤Perfil</span>
    <hr class="border-5 border-red-m opacity-75">
    <div class="card w-100">
      <div class="bg-red card-body p-5">
        <div class="w-100 d-flex justify-content-between">
          <span class="text-dark fs-3 badge span"><i class="bi bi-person-workspace"></i> Perfil de Usuario</span>
        </div>
        <hr class="border-2 border-red-m opacity-75">
        <div class="w-100 p-2">
          <div class="row">
            <div class="col-6">
              <div class="row">
                <div class="col-6">
                  <label for="" class="col-sm-5 col-form-label fw-bolder">nombre: </label>
                  {{ dataPerfil?.nombre }}
                </div>
                <div class="col-6">
                  <label for="" class="col-sm-5 col-form-label fw-bolder">apellido: </label>
                  {{ dataPerfil?.apellido }}
                </div>
                <div class="col-6">
                  <label for="" class="col-sm-5 col-form-label fw-bolder">cedula: </label>
                  {{ dataPerfil?.cedula }}
                </div>
                <div class="col-6">
                  <label for="" class="col-sm-5 col-form-label fw-bolder">usuario: </label>
                  {{ dataPerfil?.usuario }}
                </div>
                <div class="col-6">
                  <label for="" class="col-sm-5 col-form-label fw-bolder">ciudad: </label>
                  {{ dataPerfil?.ciudad }}
                </div>
                <div class="col-6">
                  <label for="" class="col-sm-5 col-form-label fw-bolder">estado: </label>
                  {{ dataPerfil?.estado }}
                </div>
                <div class="col-6">
                  <label for="" class="col-sm-5 col-form-label fw-bolder">teléfono de casa: </label>
                  {{ dataPerfil?.telefono_casa }}
                </div>
                <div class="col-6">
                  <label for="" class="col-sm-5 col-form-label fw-bolder">teléfono celular: </label>
                  {{ dataPerfil?.telefono_celular }}
                </div>
                <div class="col-6">
                  <label for="" class="col-sm-5 col-form-label fw-bolder">teléfono alternativo: </label>
                  {{ dataPerfil?.telefono_alternativo }}
                </div>
                <div class="col-6">
                  <label for="" class="col-sm-5 col-form-label fw-bolder">codigo postal: </label>
                  {{ dataPerfil?.codigo_postal }}
                </div>
                <div class="col-6">
                  <label for="" class="col-sm-5 col-form-label fw-bolder">estatus: </label>
                  {{ dataPerfil?.estatus?.nombre }}
                </div>
                <div class="col-6">
                  <label for="" class="col-sm-5 col-form-label fw-bolder">rol: </label>
                  {{ dataPerfil?.rol?.nombre }}
                </div>
                <div class="col-12">
                  <label for="" class="col-sm-6 col-form-label fw-bolder">correo: </label>
                  {{ dataPerfil?.correo }}
                </div>
                <div class="col-12">
                  <label for="" class="col-sm-6 col-form-label fw-bolder">dirección: </label>
                  {{ dataPerfil?.direccion }}
                </div>
              </div>
            </div>
            <div class="col-6">
              <div class="img">
                <img src="../assets/img/logo2.png" alt="Movilnet">
              </div>
              <form @submit.prevent="(e)=>cambioContraseña(e)">
                <div class="mb-3 row">
                <label for="staticEmail" class="col-sm-4 col-form-label">Email</label>
                  <div class="col-sm-5">
                    <input type="text" readonly class="form-control-plaintext p-1" id="staticEmail" v-model="dataPerfil.correo">
                  </div>
                </div>
                <div class="mb-3 row">
                  <label for="inputPassword" class="col-sm-4 col-form-label">Contraseña Antígua</label>
                  <div class="col-sm-5 d-flex">
                    <input :type="passwordVisible?'text':'password'" v-model="passwordAntiguo" pattern="^(?=.*[A-Za-z])(?=.*[A-Z])(?=.*\d)(?=.*)[a-zA-Z\d@.*-_+]{8,}$" class="form-control" :class="{'is-invalid':passwordAntiguo && !/^(?=.*[A-Za-z])(?=.*[A-Z])(?=.*\d)(?=.*)[a-zA-Z\d@.*-_+]{4,}$/.test(passwordAntiguo),'is-valid':passwordAntiguo && /^(?=.*[A-Za-z])(?=.*[A-Z])(?=.*\d)(?=.*)[a-zA-Z\d@.*-_+]{4,}$/.test(passwordAntiguo)}" maxlength="20" @keypress.enter="handleLogin" placeholder="Contraseña Antígua" required autocomplete="on"/>
                    <button type="button" @click="passwordVisible = !passwordVisible" class=" btn btn-outline-secondary">
                      <span  v-if="passwordVisible">👁️</span>
                      <span v-else>👁️‍🗨️</span>
                    </button>
                  </div>
                </div>
                <div class="mb-3 row">
                  <label for="inputPassword" class="col-sm-4 col-form-label">Contraseña</label>
                  <div class="col-sm-5 d-flex">
                    <input :type="passwordVisible?'text':'password'" v-model="password" pattern="^(?=.*[A-Za-z])(?=.*[A-Z])(?=.*\d)(?=.*)[a-zA-Z\d@.*-_+]{8,}$" class="form-control" :class="{'is-invalid':password && !/^(?=.*[A-Za-z])(?=.*[A-Z])(?=.*\d)(?=.*)[a-zA-Z\d@.*-_+]{8,}$/.test(password),'is-valid':password && /^(?=.*[A-Za-z])(?=.*[A-Z])(?=.*\d)(?=.*)[a-zA-Z\d@.*-_+]{8,}$/.test(password)}" maxlength="20" @keypress.enter="handleLogin" placeholder="Contraseña" required autocomplete="on"/>
                    <button type="button" @click="passwordVisible = !passwordVisible" class=" btn btn-outline-secondary">
                      <span  v-if="passwordVisible">👁️</span>
                      <span v-else>👁️‍🗨️</span>
                    </button>
                  </div>
                </div>
                <div class="mb-3 row">
                  <label for="inputPassword" class="col-sm-4 col-form-label">Repetir Contraseña</label>
                  <div class="col-sm-5 d-flex">
                    <input :type="passwordVisible?'text':'password'" v-model="passwordRepetir" pattern="^(?=.*[A-Za-z])(?=.*[A-Z])(?=.*\d)(?=.*)[a-zA-Z\d@.*-_+]{8,}$" class="form-control" :class="{'is-invalid':passwordRepetir && !/^(?=.*[A-Za-z])(?=.*[A-Z])(?=.*\d)(?=.*)[a-zA-Z\d@.*-_+]{8,}$/.test(passwordRepetir),'is-valid':passwordRepetir && /^(?=.*[A-Za-z])(?=.*[A-Z])(?=.*\d)(?=.*)[a-zA-Z\d@.*-_+]{8,}$/.test(passwordRepetir)}" maxlength="20" @keypress.enter="handleLogin" placeholder="Repetir Contraseña" required autocomplete="on"/>
                    <button type="button" @click="passwordVisible = !passwordVisible" class=" btn btn-outline-secondary">
                      <span  v-if="passwordVisible">👁️</span>
                      <span v-else>👁️‍🗨️</span>
                    </button>
                  </div>
                </div>
                <AlertComponents :avisos="avisos" :avisosAlert="avisosAlert"/>
                <div class="mb-3 row justify-content-end">
                  <div class="col-sm-5">
                    <button type="submit" class="btn btn-red">Actualizar</button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.btn-outline-red-m {
  border-color: var(--institucional-m-gris-claro);
  color: var(--institucional-m-gris-claro);
}
.img{
  text-align: center;
  display:flex;
  align-items: center;
  justify-content: center;
  padding: 10px;
}
img{
  backdrop-filter: hue-rotate(0deg);
  border-radius: 20%;
  width: 300px;
  height: 300px;
  object-fit: cover;
  box-shadow: 0 0 10px var(--institucional-m-cerezo);
  margin: 0 auto;
  transition: all 0.3s ease;
}
.btn-outline-red-m:hover {
  background-color: var(--institucional-m-gris-claro);
  color: var(--institucional-m-cerezo);
}
</style>
