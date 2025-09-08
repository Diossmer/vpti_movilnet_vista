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
              <b>asignaciones: </b>
              <div class="col-6" v-for="(asignar) in paramsE.asignaciones?.filter(evalua => evalua.id === paramsE.id)" :key="asignar.id">
                <p>
                  <b>fecha_asignar: </b>{{ asignar?.fecha_asignar }} 
                </p>
                <p>
                  <b>fecha_devolucion: </b>{{ asignar?.fecha_devolucion }} 
                </p>
                <p>
                  <b>destino: </b>{{ asignar?.destino }} 
                </p>
                <p>
                  <b>comentario: </b>{{ asignar?.comentario }} 
                </p>
              </div>
              <div class="col-6">
                <p><b>evaluaciones: </b></p>
                <div class="row">
                  <span class="col-12" v-for="(evalua) in paramsE.evaluaciones?.filter(evalua => evalua.id === paramsE.id)" :key="evalua.id">
                    <p><b>estado_fisico: </b>{{ evalua?.estado_fisico }}</p>
                    <p><b>escala: </b>{{ evalua?.escala }}</p>
                    <p><b>compatibilidad: </b>{{ evalua?.compatibilidad }}</p>
                    <p><b>reemplazo: </b>{{ evalua?.reemplazo }}</p>
                    <p><b>mantenimineto: </b>{{ evalua?.mantenimineto }}</p>
                  </span>
                </div>
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