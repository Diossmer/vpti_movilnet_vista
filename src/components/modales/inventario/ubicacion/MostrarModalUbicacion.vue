<script setup>
import { defineProps } from 'vue';

defineProps({
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
      <div class="modal-dialog modal-lg modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h1 class="modal-title fs-5 fw-bolder" id="staticBackdropLabel">Ubicación</h1>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close" @click="avisos = null, avisosAlert = null"></button>
          </div>
          <div class="modal-body">
            <div class="row">
              <div class="col-6">
                <p><b>origen: </b>{{ paramsE?.origen }}</p>
              </div>
              <div class="col-6">
                <p><b>destino: </b>{{ paramsE?.destino }}</p>
              </div>
              <div class="col-6">
                <p><b>piso: </b>{{ paramsE?.piso }}</p>
              </div>
              <div class="col-6">
                <p><b>region: </b>{{ paramsE?.region }}</p>
              </div>
              <div class="col-6">
                <p><b>estado: </b>{{ paramsE?.estado }}</p>
              </div>
              <div class="col-6">
                <p><b>capital: </b>{{ paramsE?.capital }}</p>
              </div>
              <hr class="border-2 border-success opacity-75">
              <div class="col-6">
                <p><b>producto: </b>{{ paramsE.producto?.nombre }}</p>
              </div>
              <div class="col-6">
                <p><b>asignaciones: </b>{{ paramsE.asignaciones?.length }}</p>
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