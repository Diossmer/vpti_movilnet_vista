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
  <div class="modal fade" id="staticMostrar" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1" aria-labelledby="staticBackdropLabel">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h1 class="modal-title fs-5 fw-bolder" id="staticBackdropLabel">Productos</h1>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close" @click="avisos = null, avisosAlert = null"></button>
          </div>
          <div class="modal-body">
            <div class="row">
              <div class="col-6">
                <p><b>nombre: </b>{{ paramsE.nombre }}</p>
              </div>
              <div class="col-6">
                <p><b>nombre & apellido: </b>{{ paramsE.usuario?.nombre}} {{ paramsE.usuario?.apellido}}</p>
              </div>
              <div class="col-6">
                <p><b>estatus: </b>{{ paramsE?.estatus?.nombre }}</p>
              </div>
              <hr class="border-4 border-primary opacity-75">
              
              <div class="col-6">
                <p><b>evaluaciones: </b>{{ paramsE.evaluaciones?.length }}</p>
              </div>
              <div class="col-6">
                <p><b>descripciones: </b>{{ paramsE.descripciones?.length }}</p>
              </div>
              <div class="col-6">
                <p><b>inventarios: </b>{{ paramsE.inventarios?.length }}</p>
              </div>
              <div class="col-6">
                <p><b>perifericos: </b>{{ paramsE.perifericos?.length }}</p>
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