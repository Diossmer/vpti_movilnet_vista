<script setup>
import { ref, watch, computed } from 'vue';
import { useLoginStore } from '@/stores/autenticacion';
import { storeToRefs } from 'pinia';
import { validacionesUtils } from '@/components/utils/validacionesUtils';
import AlertComponents from '@/components/AlertComponents.vue';

const props = defineProps({
  isLoadingImport: {
    type: Boolean,
    default: false,
    required: true,
  },
  response: {
    type: Object,
    default: null,
    required: false,
  },
});

const { dataPerfil } = storeToRefs(useLoginStore());
const avisos = ref(null);
const avisosAlert = ref(null);
const dispositivos = ref(['entrada', 'salida'])
const paramsA = ref({
  seleccion:null,
});

const targetModalId = computed(() => {
  if (paramsA.value.seleccion === 'entrada') {
    return '#staticAgregar1'; // Abre AgregarModalPerifericos
  } else if (paramsA.value.seleccion === 'salida') {
    return '#staticAgregar2'; // Abre el nuevo modal para Salida
  }
  return '';
});
</script>

<template>
  <div class="modal" id="staticDispositivo" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1" aria-labelledby="staticBackdropLabel">
      <div class="modal-dialog modal-lg modal-dialog-scrollable modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h1 class="modal-title fs-5 fw-bolder" id="staticBackdropLabel">Agregar Dispositivo (Entrada/Salida)</h1>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <Suspense>
            <template #default>
              <!-- Nota: La acción de submit actualmente llama a 'create' en el padre, pero el modal
                   parece ser para la selección inicial. Mantendremos el form por consistencia. -->
              <form>
                <div class="modal-body">
                  <div class="row d-flex justify-content-center">
                    <div class="col-6">
                      <label for="dispositivoSelect" class="badge text-secondary">Selecciona el tipo de dispositivo<span class="text-danger">*</span></label>
                      <select id="dispositivoSelect" class="form-select" v-model="paramsA.seleccion" required>
                        <option :value="null" disabled>-- Seleccione una dispositivo --</option>
                        <!-- Iteramos directamente sobre las opciones de tipo de dispositivo -->
                        <option v-for="dispositivo in dispositivos" :key="dispositivo" :value="dispositivo">
                          {{ dispositivo.charAt(0).toUpperCase() + dispositivo.slice(1) }}
                        </option>
                      </select>
                    </div>
                    <AlertComponents :avisos="avisos" :avisosAlert="avisosAlert"/>
                  </div>
                </div>
                <div class="modal-footer">
                  <button type="button" class="btn btn-outline-secondary text-red" data-bs-dismiss="modal">Cancelar</button>
                  <button class="btn btn-outline-secondary text-red" type="button" :disabled="isLoadingImport || !paramsA.seleccion" data-bs-toggle="modal" :data-bs-target="targetModalId" data-bs-dismiss="modal" >
                    <span v-if="!isLoadingImport">Continuar</span>
                    <span v-else>
                    <span class="spinner-border spinner-border-sm" role="status"></span>
                      Procesando...
                    </span>
                  </button>
                </div>
              </form>
            </template>
            <template #fallback>
              <div class="modal-body text-center py-5">
                <div class="spinner-border text-red" role="status">
                  <span class="visually-hidden">Cargando...</span>
                </div>
                <p class="mt-2 text-muted">Cargando datos...</p>
              </div>
            </template>
          </Suspense>
        </div>
      </div>
    </div>
</template>
<style scoped>
/* Agrega tus estilos aquí si son necesarios para el componente DispositivoComponents */
</style>