<script setup>
import { ref, watch } from 'vue';
import { useLoginStore } from '@/stores/autenticacion';
import { storeToRefs } from 'pinia';
import { validacionesUtils } from '@/components/utils/validacionesUtils';
import AlertComponents from '@/components/AlertComponents.vue';
import { Modal } from 'bootstrap/dist/js/bootstrap.min';

const props = defineProps({
  handleData: {
    type: Function,
    default: null,
    required: true,
  },
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
const modalAgregar = ref(null);
const avisos = ref(null);
const avisosAlert = ref(null);
const paramsA = ref({});

const resetParams = () => {
  paramsA.value = {};
  avisos.value = null;
  avisosAlert.value = null;
};

watch([() => paramsA.value?.nombre,
() => paramsA.value?.descripcion], ([nombre, descripcion]) => {
  const errors = [];
  const nombreError = validacionesUtils().nombreValid(nombre);
  if (nombreError) errors.push(nombreError);
  const descripcionError = validacionesUtils().textareaValid(descripcion);
  if (descripcionError) errors.push(descripcionError);
  avisosAlert.value = errors.length > 0 ? { error: errors.join(' | ') } : null;
  if ((nombre==='' || nombre===undefined)
  && (descripcion==='' || descripcion===undefined))
  avisosAlert.value = null;
});
watch(() => props.response, (newResponse) => {
  if (newResponse) {
    avisos.value = newResponse;
  }
});

/* const myModal = new bootstrap.Modal(document.getElementById('myModal'), options)
// or
const myModalAlternative = new bootstrap.Modal('#myModal', options) */
</script>

<template>
  <!-- `data-bs-backdrop` y `data-bs-keyboard` ya no son necesarios aquí, el componente padre los maneja si se usan correctamente. -->
  <div class="modal fade" id="staticAgregar" tabindex="-1" aria-labelledby="staticBackdropLabel" ref="modalAgregar">
      <div class="modal-dialog modal-lg modal-dialog-scrollable modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h1 class="modal-title fs-5 fw-bolder" id="staticBackdropLabel">Agregar</h1>
            <!-- Resetea el formulario al cerrar el modal -->
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close" @click="resetParams()"></button>
          </div>
          <!-- <Suspense> es para carga asíncrona, no es necesario para un formulario simple. Lo he eliminado para evitar el error. -->
          <form @submit.prevent="handleData('create', paramsA)">
            <div class="modal-body">
              <div class="row">
                <div class="col-6">
                  <label for="" class="badge text-secondary">nombre<span class="text-danger">*</span></label>
                  <input 
                    type="text" 
                    pattern="^[A-Za-zÁ-Úá-úñÑ\s\(\)\+\*]+$" 
                    class="form-control" 
                    :class="{'is-invalid':paramsA.nombre && !/^[A-Za-zÁ-Úá-úñÑ\s\(\)\+\*]+$/.test(paramsA.nombre),'is-valid':paramsA.nombre && /^[A-Za-zÁ-Úá-úñÑ\s\(\)\+\*]+$/.test(paramsA.nombre)}" 
                    v-model="paramsA.nombre" 
                    placeholder="Nombre" 
                    required 
                  />
                </div>
                <div class="col-6">
                  <label for="" class="badge text-secondary">descripción</label>
                  <textarea 
                    class="form-control" 
                    :class="{ 'is-invalid': paramsA.descripcion && !/^[^<>{}\[\]]+$/.test(paramsA.descripcion), 'is-valid':paramsA.descripcion && /^[^<>{}\[\]]+$/.test(paramsA.descripcion)}" 
                    placeholder="Descripción" 
                    v-model="paramsA.descripcion"
                  ></textarea>
                </div>
                <AlertComponents :avisos="avisos" :avisosAlert="avisosAlert"/>
              </div>
            </div>
            <div class="modal-footer">
              <!-- Resetea el formulario al cancelar -->
              <button type="button" class="btn btn-outline-secondary text-red" data-bs-dismiss="modal" @click="resetParams()">Cancelar</button>
              <button class="btn btn-outline-secondary text-red" type="submit" :disabled="isLoadingImport">
                <span v-if="!isLoadingImport">Agregar</span>
                <span v-else>
                <span class="spinner-border spinner-border-sm" role="status"></span>
                  Procesando...
                </span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
</template>