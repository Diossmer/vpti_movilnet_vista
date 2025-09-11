<script setup>
import { ref, watch, defineProps } from 'vue';
import { useLoginStore } from '@/stores/autenticacion';
import { storeToRefs } from 'pinia';
import { validacionesUtils } from '@/components/utils/validacionesUtils';
import AlertComponents from '@/components/AlertComponents.vue';

defineProps({
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
});

const loginStore = useLoginStore();
const { dataPerfil } = storeToRefs(loginStore);
const modalAgregar = ref(null);
const avisos = ref(null);
const avisosAlert = ref(null);
const paramsA = ref({});

watch([() => paramsA.value?.nombre, () => paramsA.value?.descripcion], ([nombre, descripcion]) => {
  const errors = [];
  const nombreError = validacionesUtils().textValid(nombre);
  if (nombreError) errors.push(nombreError);
  const descError = validacionesUtils().textareaValid(descripcion);
  if (descError) errors.push(descError);
  avisosAlert.value = errors.length > 0 ? { error: errors.join(' | ') } : null;
  if ((nombre===''||nombre===undefined) && (descripcion===''|| descripcion===undefined))avisosAlert.value="";
});
</script>

<template>
  <div class="modal fade" id="staticAgregar" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1" aria-labelledby="staticBackdropLabel" ref="modalAgregar" aria-hidden="true">
      <div class="modal-dialog modal-lg modal-dialog-scrollable modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h1 class="modal-title fs-5" id="staticBackdropLabel">Agregar</h1>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close" @click="avisos = null, avisosAlert = null"></button>
          </div>
          <Suspense>
            <template #default>
          <!-- Agregar -->
          <form @submit.prevent="handleData('create')">
            <div class="modal-body">
              <div class="row">
                <div class="col-4">
                  <label for="" class="badge text-secondary">Nombre<span class="text-danger">*</span></label>
                  <input type="text" pattern="^[A-Za-zÁ-Úá-úñÑ\s\(\)\+\*]+$" class="form-control" :class="{'is-invalid':paramsA.nombre && !/^[A-Za-zÁ-Úá-úñÑ\s\(\)\+\*]+$/.test(paramsA.nombre),'is-valid':paramsA.nombre && /^[A-Za-zÁ-Úá-úñÑ\s\(\)\+\*]+$/.test(paramsA.nombre)}" v-model="paramsA.nombre" placeholder="Nombre" required />
                </div>
                <div class="col-4">
                  <label for="" class="badge text-secondary">Descripción</label>
                  <textarea class="form-control" :class="{ 'is-invalid': paramsA.descripcion && !/^[A-Za-zÁ-Úá-úñÑ\s\d\.,-].[^<>]+$/.test(paramsA.descripcion), 'is-valid':paramsA.descripcion && /^[A-Za-zÁ-Úá-úñÑ\s\d\.,-].[^<>]+$/.test(paramsA.descripcion)}" placeholder="Descripción" v-model="paramsA.descripcion"></textarea>
                </div>
                <AlertComponents :avisos="avisos" :avisosAlert="avisosAlert"/>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-outline-secondary text-red" data-bs-dismiss="modal" @click="avisos = null, avisosAlert = null">Cancelar</button>
              <button class="btn btn-outline-secondary text-red" type="submit" :disabled="isLoadingImport">
                <span v-if="!isLoadingImport">Agregar</span>
                <span v-else>
                <span class="spinner-border spinner-border-sm" role="status"></span>
                  Procesando...
                </span>
              </button>
            </div>
          </form>
          <!-- Agregar -->
            </template>
            <template #fallback>
              <div class="modal-body text-center py-5">
                <div class="spinner-border text-red" role="status">
                  <span class="visually-hidden">Cargando...</span>
                </div>
                <p class="mt-2 text-muted">Procesando archivo...</p>
              </div>
            </template>
          </Suspense>
        </div>
      </div>
    </div>
</template>