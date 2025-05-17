<script setup>
import { computed } from 'vue';
import { useLoginStore } from '@/stores/autenticacion';
import { storeToRefs } from '../../node_modules/pinia/dist/pinia';

const store = useLoginStore();
const { tiempoRestante, showExtensionDialog } = storeToRefs(store);
const { salir, extenderSesion } = store;

const formattedTime = computed(() => {
  const minutes = Math.floor(tiempoRestante.value / 60000);
  const seconds = Math.floor((tiempoRestante.value % 60000) / 1000);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
});

const extender = async () => {
  await extenderSesion();
};

const cerrar = async () => {
  await salir();
};
</script>

<template>
  <div v-if="showExtensionDialog" class="session-alert-overlay">
    <div class="session-alert">
      <h3>¡La sesión está a punto de expirar!</h3>
      <h4>¿desea extender el tiempo?</h4>
      <p>Tiempo restante: {{ formattedTime }}</p>
      <div class="alert-actions">
        <button @click="extender">Continuar</button>
        <button @click="cerrar">Cerrar sesión</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.session-alert-overlay {
  position: fixed;
  border-radius: 10px;
  background: rgba(0,0,0,0.5);
  z-index: 9999;
  display: flex;
  justify-content: center;
  align-items: center;
  left: 40%;
  right: 35%;
  top: 0;
  width: 26%;
  box-shadow: 0px 2px 10px #000;
}

.session-alert {
  background: white;
  padding: 2rem;
  border-radius: 10px;
  text-align: center;
  min-width: 350px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.alert-actions button {
  margin: 1rem;
  padding: 0.8rem 1.5rem;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background 0.3s ease;
}

.alert-actions button:first-child {
  background: #4CAF50;
  color: white;
}

.alert-actions button:last-child {
  background: #f44336;
  color: white;
}
</style>
