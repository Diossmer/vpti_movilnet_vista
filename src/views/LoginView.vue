<script setup>
import { ref, watch } from 'vue';
import { useLoginStore } from '@/stores/autenticacion';
import { storeToRefs } from "pinia";
import { validacionesUtils } from '@/components/utils/validacionesUtils';
import imgLogo from '@/assets/img/logo2.png';

const store = useLoginStore()
const { ErrorStore } = storeToRefs(store);
const { ingresar } = store

// Creamos variables reactivas locales
const localUsuario = ref("");
const localPassword = ref("");
const validError = ref("");
const passwordVisible = ref(false);

// escuchar variables
watch(localUsuario, (newValor) => {validError.value = validacionesUtils().usuariosValid(newValor)});
watch(localPassword, (newValor) => {validError.value =  validacionesUtils().passwordValid(newValor)});

// Función que llama al login con los valores locales
const handleLogin = async () => {
  await ingresar(localUsuario.value, localPassword.value);
};
</script>
<template>
    <div class="loginCard bg-secondary">
        <div class="card boxShadow p-3 mb-5 bg-red rounded h-full" style="width: 40%;">
          <div class="card-header text-center border-bottom border-dark border-5">
           <h3 class="badge fs-3 fw-bold">Inventario VPTI</h3>
            <i class="fas fa-lock"></i>
          </div>
          <div class="card-body text-center inputs bg-red p-3">
            <img :src="imgLogo" alt="das" class="bg-red p-2 w-50 h-50"/>
              <div class="form-group d-flex align-items-center">
                <input type="usuario" class="form-control my-2 border border-dark fs-5" id="usuario" v-model="localUsuario" placeholder="Usuario" required autocapitalize="off" autocomplete="off">
                <div class="icono"><span class="btn disabled border-dark fs-5">👤</span></div>
              </div>
              <div class="form-group d-flex align-items-center">
                <input :type="passwordVisible ? 'text' : 'password'" class="form-control my-2 border border-dark fs-5" id="password" v-model="localPassword" placeholder="Contraseña" required autocapitalize="off"
              autocomplete="off" style="text-transform: none;" @keypress.enter="handleLogin">
              <button type="button" @click="passwordVisible = !passwordVisible" class="fs-5 icono btn btn-outline-secondary">
                <span  v-if="passwordVisible">👁️</span>
                <span v-else>👁️‍🗨️</span>
                </button>
              </div>
            <div :class="ErrorStore||validError?'bg-secondary':false" class="badge form-group d-flex align-items-center p-5 fs-6" >
                  <span class="text-wrap text-sm font-bold custom-shadow" v-if="ErrorStore">{{ ErrorStore }}</span>
                  <span class="text-wrap text-sm font-bold custom-shadow" v-else-if="validError">{{ validError }}</span>
              </div>
              <div class="button-control flex flex-row gap-2">
                  <button @click="handleLogin" class="btn btn-dark" style="width: 30%;">
                    Ingresar
              </button>
              </div>
          </div>
      </div>
    </div>
</template>
<style>
.loginCard{
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  height: 100dvh;
}

.inputs{
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.alert span{
  font-size: 12px;
}
.button-control{
  width: 100%;
  margin-top: -20px;
}

.icono{
  background-color: rgba(25,135,84,0.5);
  color: #cfffcf;
}
</style>
