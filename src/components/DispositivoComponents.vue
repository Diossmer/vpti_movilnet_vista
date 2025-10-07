<script setup>
import { ref, watch, computed } from 'vue';
import { useLoginStore } from '@/stores/autenticacion';
import { storeToRefs } from 'pinia';
import AlertComponents from '@/components/AlertComponents.vue';

const emit = defineEmits(['reset-params-e']); 

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
  paramsE: {
    type: Object,
    // Aseguramos que paramsE tenga las propiedades clave al inicializarse.
    default: () => ({
      id: null,
      seleccion: null, 
      producto_id: [],
      descripcion_id: []
    }),
    required: true,
  },
});

const { dataPerfil } = storeToRefs(useLoginStore());
const avisos = ref(null);
const avisosAlert = ref(null);
const dispositivos = ref(['entrada', 'salida'])
const paramsA = ref({
  seleccion:null,
});

const isEditing = computed(() => {
    return !!props.paramsE.seleccion || (props.paramsE.id !== undefined && props.paramsE.id !== null);
});

const currentSelection = computed({
    get() {
        // Devuelve el valor del estado que corresponda (Edición o Agregar)
        return isEditing.value ? props.paramsE.seleccion : paramsA.value.seleccion;
    },
    set(newValue) {
        // Modifica el estado que corresponda
        if (isEditing.value) {
            props.paramsE.seleccion = newValue;
        } else {
            paramsA.value.seleccion = newValue;
        }
    }
});

const targetModalId = computed(() => {
  const selection = currentSelection.value;
  if (!selection) return '';

  if (isEditing.value) {
    // LÓGICA DE EDICIÓN
    return selection === 'entrada' ? '#staticEditar1' : '#staticEditar2';
  } else {
    // LÓGICA DE AGREGAR
    return selection === 'entrada' ? '#staticAgregar1' : '#staticAgregar2';
  }
});

const resetState = () => {
    // Emite el evento para que el padre limpie paramsE
    emit('reset-params-e'); 
    
    // Limpia el estado local de paramsA
    paramsA.value.seleccion = null;
    
    // Limpia avisos
    avisos.value = null;
    avisosAlert.value = null;
};

watch(() => props.response, (newResponse) => {
  if (newResponse) {
    avisos.value = newResponse;
  }
});
</script>

<template>
  <div class="modal" id="staticDispositivo" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1" aria-labelledby="staticBackdropLabel">
      <div class="modal-dialog modal-lg modal-dialog-scrollable modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h1 class="modal-title fs-5 fw-bolder" id="staticBackdropLabel">{{ isEditing ? 'Editar Dispositivo' : 'Agregar Dispositivo' }} (Entrada/Salida)</h1>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close" @click="resetState"></button>
          </div>
          <Suspense>
            <template #default>
              <form>
                <div class="modal-body">
                  <div class="row d-flex justify-content-center">
                    <div class="col-6">
                      <label for="dispositivoSelect" class="badge text-secondary">Selecciona el tipo de dispositivo<span class="text-danger">*</span></label>
                      
                      <select id="dispositivoSelect" class="form-select" v-model="currentSelection" required>
                        <option :value="null" disabled>-- Seleccione una dispositivo --</option>
                        <option v-for="dispositivo in dispositivos" :key="dispositivo" :value="dispositivo">
                          {{ dispositivo.charAt(0).toUpperCase() + dispositivo.slice(1) }}
                        </option>
                      </select>
                    </div>
                    <AlertComponents :avisos="avisos" :avisosAlert="avisosAlert"/>
                  </div>
                </div>
                <div class="modal-footer">
                  <button type="button" class="btn btn-outline-secondary text-red" data-bs-dismiss="modal" @click="resetState">Cancelar</button>
                  <button 
                    class="btn btn-outline-secondary text-red" 
                    type="button" 
                    :disabled="isLoadingImport || !currentSelection" 
                    data-bs-toggle="modal" 
                    :data-bs-target="targetModalId" 
                    data-bs-dismiss="modal" 
                  >
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