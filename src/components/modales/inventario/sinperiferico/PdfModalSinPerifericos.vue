<script setup>
import { defineProps } from 'vue';

const props = defineProps({
  paramsE: {
    type: Object,
    default: () => ({}),
    required: true,
  },
  fileData: {
    type: Function,
    required: true,
  },
});
</script>
<template>
  <div class="modal fade" id="staticPDF" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1" aria-labelledby="staticBackdropLabel">
      <div class="modal-dialog modal-dialog-scrollable modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h1 class="modal-title fs-5 fw-bolder" id="staticBackdropLabel">Modelos o Formatos</h1>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close" @click="avisos = null, avisosAlert = null"></button>
          </div>
          <div class="modal-body">
            <div class="row">
              <div class="col-12">
                <div class="row" v-if="paramsE.id">
                  <div class="col-4 text-center">
                      <label for="" class="badge text-secondary wrap">informe</label>
                      <button class="btn btn-outline-secondary text-danger dropdown-item fs-4 p-0" @click="fileData(paramsE,'pdf','informe')"><i class="bi bi-file-pdf"></i></button>
                  </div>
                </div>
                <div class="row" v-else>
                  <div class="col-4 text-center">
                      <label for="" class="badge text-secondary wrap">informes</label>
                      <button class="btn btn-outline-secondary text-danger dropdown-item fs-4 p-0" @click="fileData('','pdf','informes')"><i class="bi bi-file-pdf"></i></button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-outline-secondary text-red" data-bs-dismiss="modal" @click="avisos = null, avisosAlert = null">Regresar</button>
          </div>
        </div>
      </div>
    </div>
</template>