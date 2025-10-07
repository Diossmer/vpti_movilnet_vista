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
      <div class="modal-dialog modal-lg modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h1 class="modal-title fs-5 fw-bolder" id="staticBackdropLabel">Descripciones</h1>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close" @click="avisos = null, avisosAlert = null"></button>
          </div>
          <div class="modal-body">
            <div class="row">
              <div class="col-6">
                <p><b>codigo: </b>{{ paramsE.codigo }}</p>
              </div>
              <div class="col-6">
                <p><b>modelo: </b>{{ paramsE.modelo }}</p>
              </div>
              <div class="col-6">
                <p><b>dispositivo: </b>{{ paramsE.dispositivo }}</p>
              </div>
              <div class="col-6">
                <p><b>marca: </b>{{ paramsE.marca }}</p>
              </div>
              <div class="col-6">
                <p><b>serial: </b>{{ paramsE.serial }}</p>
              </div>
              <div class="col-6">
                <p><b>codigo_inv: </b>{{ paramsE.codigo_inv }}</p>
              </div>
              <div class="col-12">
                <p><b>observacion: </b>{{ paramsE.observacion }}</p>
              </div>
              <hr class="border-4 border-primary opacity-75">
              <div class="col-6">
                <p><b>producto: </b>{{ paramsE.producto?.nombre }}</p>
              </div>
              <div class="col-6">
                <p><b>Cantidad de asignaciones: </b>{{ paramsE.asignaciones?.length}}</p>
              </div>
              <div class="col-6">
                <p><b>Cantidad de evaluaciones: </b>{{ paramsE.evaluaciones?.length}}</p>
              </div>
              <div class="col-6">
                <p><b>Cantidad de Sin periferico: </b>{{ paramsE.inventarios?.length}}</p>
              </div>
              <div class="col-6">
                <p><b>Cantidad de perifericos: </b>{{ paramsE.perifericos?.length}}</p>
              </div>
              <div class="col-6">
                <p><b>Cantidad de ubicaciones: </b>{{ paramsE.ubicaciones?.length}}</p>
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