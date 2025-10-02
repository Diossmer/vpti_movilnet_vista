<script setup>
import { ref, watch } from 'vue';
import { useLoginStore } from '@/stores/autenticacion';
import { storeToRefs } from 'pinia';
import { validacionesUtils } from '@/components/utils/validacionesUtils';
import AlertComponents from '@/components/AlertComponents.vue';

const props = defineProps({
  handleData: {
    type: Function,
    default: null,
    required: true,
  },
  relations: {
    type: Array,
    default: () => [[], []],
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
  paramsA.value = {
    descripcion_id: [],
  };
  avisos.value = null;
  avisosAlert.value = null;
};

watch([() => paramsA.value?.nombre], ([nombre]) => {
  const errors = [];
  const nombreError = validacionesUtils().nombreValid(nombre);
  if (nombreError) errors.push(nombreError);
  avisosAlert.value = errors.length > 0 ? { error: errors.join(' | ') } : null;
  if ((nombre==='' || nombre===undefined))avisosAlert.value = null;
});
watch(() => props.response, (newResponse) => {
  if (newResponse) {
    avisos.value = newResponse;
  }
});
</script>

<template>
  <div class="modal fade" id="staticAgregar" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1" aria-labelledby="staticBackdropLabel" ref="modalAgregar">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h1 class="modal-title fs-5 fw-bolder" id="staticBackdropLabel">Agregar</h1>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close" @click="resetParams()"></button>
          </div>
          <Suspense>
            <template #default>
              <form @submit.prevent="handleData('create', paramsA)">
                <div class="modal-body">
                  <div class="row">
                    <div class="col-6">
                      <label for="" class="badge text-secondary">estatus<span class="text-danger">*</span></label>
                      <select class="form-select" v-model="paramsA.estatus_id" required>
                        <option v-for="(estatus, index) in relations[1]" :key="index" :value="estatus.id">{{ estatus.nombre }}</option>
                      </select>
                    </div>
                    <div class="col-6">
                      <label for="" class="badge text-secondary">producto<span class="text-danger">*</span></label>
                      <input type="text" maxlength="20" pattern="^[A-Za-zÁ-Úá-úñÑ\s\d]+$" class="form-control" :class="{'is-invalid':paramsA.nombre && !/^[A-Za-zÁ-Úá-úñÑ\s\d]+$/.test(paramsA.nombre),'is-valid':paramsA.nombre && /^[A-Za-zÁ-Úá-úñÑ\s\d]+$/.test(paramsA.nombre)}" v-model="paramsA.nombre" placeholder="Nombre" required />
                    </div>
                    <AlertComponents :avisos="avisos" :avisosAlert="avisosAlert"/>
                  </div>
                </div>
                <div class="modal-footer">
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