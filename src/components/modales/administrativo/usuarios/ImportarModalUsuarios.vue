<script setup>
import { ref, defineProps } from 'vue';
import AlertComponents from '@/components/AlertComponents.vue';

defineProps({
  isLoadingImport: {
    type: Boolean,
    default: false,
    required: true,
  },
  fileData: {
    type: Function,
    required: true,
  },
  response: {
    type: Object,
    default: null,
    required: false,
  },
});

const avisos = ref(null);
const avisosAlert = ref(null);

watch(() => props.response, (newResponse) => {
  if (newResponse) {
    avisos.value = newResponse;
  }
});
</script>
<template>
  <div class="modal fade" id="staticImportar" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1" aria-labelledby="staticBackdropLabel" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <h1 class="modal-title fs-5 fw-bolder" id="staticBackdropLabel">Importar</h1>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close" @click="avisos = null, avisosAlert = null"></button>
        </div>
        <Suspense>
          <template #default>
            <form @submit.prevent="(e)=>fileData(e,'import')">
              <div class="modal-body">
                <div class="row">
                  <div class="col-12">
                    <div class="border-3 border">
                      <input class="form-control form-control-sm" type="file" name="file" id="formFileMultiple" multiple>
                    </div>
                  </div>
                  <AlertComponents :avisos="avisos" :avisosAlert="avisosAlert"/>
                </div>
              </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-outline-secondary text-red" data-bs-dismiss="modal" aria-hidden="true" @click="avisos = null, avisosAlert = null">Cancelar</button>
                <button class="btn btn-outline-secondary text-red" type="submit" :disabled="isLoadingImport"><span v-if="!isLoadingImport">Aceptar</span>
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