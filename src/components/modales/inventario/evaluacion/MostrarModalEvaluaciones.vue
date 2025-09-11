<script setup>
import { defineProps } from 'vue';

const props = defineProps({
  paramsE: {
    type: Object,
    default: () => ({}),
    required: true,
  },
  relations: {
    type: Array,
    default: () => [[], []],
  }
});
</script>

<template>
  <div class="modal fade" id="staticMostrar" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1" aria-labelledby="staticBackdropLabel" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h1 class="modal-title fs-5 fw-bolder" id="staticBackdropLabel">Evaluación del producto</h1>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close" @click="avisos = null, avisosAlert = null"></button>
          </div>
          <div class="modal-body">
            <div class="row">
              <div class="col-6">
                <p><b>estado fisico: </b>{{ paramsE.estado_fisico }}</p>
              </div>
              <div class="col-6">
                <p><b>escala: </b>{{ paramsE.escala }}</p>
              </div>
              <div class="col-6">
                <p><b>compatibilidad: </b>{{ paramsE.compatibilidad }}</p>
              </div>
              <div class="col-6">
                <p><b>reemplazo: </b>{{ paramsE.reemplazo }}</p>
              </div>
              <div class="col-6">
                <p><b>mantenimineto: </b>{{ paramsE.mantenimineto }}</p>
              </div>
              <div class="col-12">
                <p><b>observación: </b>{{ paramsE.notas }}</p>
              </div>
              <hr class="border-4 border-primary opacity-75">
              <div class="col-6">
                <p><b>producto: </b>{{ paramsE.producto?.nombre }}</p>
              </div>
              <div class="col-6">
                <p><b>descripcion: </b></p>
                <p><b>codigo: </b>{{ paramsE.descripcion?.codigo }}</p>
                <p><b>modelo: </b>{{ paramsE.descripcion?.modelo }}</p>
              </div>
              <div class="col-6">
                <p><b>estatus: </b>{{ paramsE.estatus?.nombre }}</p>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal" @click="avisos = null, avisosAlert = null">Regresar</button>
          </div>
        </div>
      </div>
    </div>
</template>